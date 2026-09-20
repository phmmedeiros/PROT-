-- Prot+ — esquema inicial (acesso por compra + dados sincronizados do usuário)
--
-- Regra central: quem entra no app é quem comprou. A tabela `compras` é a fonte
-- da verdade disso e só é escrita pelo webhook da Payt (service_role). O cliente
-- nunca escreve nela.
--
-- Todas as tabelas de dados do usuário usam RLS: cada pessoa enxerga e altera
-- apenas as próprias linhas, mesmo que alguém pegue a chave pública do app.

-- ---------------------------------------------------------------------------
-- 1. Compras (controle de acesso)
-- ---------------------------------------------------------------------------

create table public.compras (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  pedido_payt   text unique,
  status        text not null default 'ativo'
                check (status in ('ativo', 'reembolsado', 'cancelado')),
  valor_centavos integer,
  bumps         jsonb not null default '[]'::jsonb,
  payload_bruto jsonb,
  comprado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.compras is
  'Uma linha por pedido aprovado na Payt. Escrita apenas pelo webhook.';
comment on column public.compras.pedido_payt is
  'Identificador do pedido na Payt. Único: garante que reenvio de webhook não duplique.';
comment on column public.compras.payload_bruto is
  'Corpo original do webhook, guardado para auditoria e para ajustar o mapeamento de campos.';

-- O mesmo e-mail pode comprar mais de uma vez, então não há unicidade por e-mail.
create index compras_email_idx on public.compras (lower(email));
create index compras_status_idx on public.compras (status);

-- ---------------------------------------------------------------------------
-- 2. Dados do usuário
-- ---------------------------------------------------------------------------

create table public.perfis (
  id             uuid primary key references auth.users (id) on delete cascade,
  nome           text check (char_length(nome) <= 40),
  meta_proteina  integer not null default 140 check (meta_proteina between 1 and 600),
  objetivo       text not null default 'recomposicao'
                 check (objetivo in ('secar', 'hipertrofia', 'recomposicao')),
  faixa          text not null default 'medio'
                 check (faixa in ('leve', 'medio', 'super')),
  atualizado_em  timestamptz not null default now()
);

create table public.favoritos (
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  receita_id  text not null,
  criado_em   timestamptz not null default now(),
  primary key (usuario_id, receita_id)
);

create table public.despensa (
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  ingrediente text not null,
  primary key (usuario_id, ingrediente)
);

-- O "dia" do Monitor Diário é o dia no fuso de São Paulo, não em UTC:
-- em UTC a lista viraria às 21h do horário de Brasília.
create table public.consumo (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references auth.users (id) on delete cascade,
  receita_id    text not null,
  dia           date not null default (now() at time zone 'America/Sao_Paulo')::date,
  registrado_em timestamptz not null default now()
);

create index consumo_usuario_dia_idx on public.consumo (usuario_id, dia);

create table public.semanas (
  usuario_id    uuid primary key references auth.users (id) on delete cascade,
  objetivo      text not null
                check (objetivo in ('secar', 'hipertrofia', 'recomposicao')),
  dias          jsonb not null,
  aberto        smallint not null default 0 check (aberto between 0 and 6),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Perfil criado junto com o usuário
-- ---------------------------------------------------------------------------

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------------------
-- 4. Carimbo de atualização
-- ---------------------------------------------------------------------------

create or replace function public.marcar_atualizacao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizacao
  before update on public.perfis
  for each row execute function public.marcar_atualizacao();

create trigger semanas_atualizacao
  before update on public.semanas
  for each row execute function public.marcar_atualizacao();

create trigger compras_atualizacao
  before update on public.compras
  for each row execute function public.marcar_atualizacao();

-- ---------------------------------------------------------------------------
-- 5. Verificação de acesso
-- ---------------------------------------------------------------------------

-- O app chama esta função ao abrir. Ela responde se o e-mail da sessão tem
-- alguma compra ativa. Reembolso vira `status = 'reembolsado'` e o acesso cai.
create or replace function public.tenho_acesso()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.compras
    where lower(email) = lower(auth.jwt() ->> 'email')
      and status = 'ativo'
  );
$$;

grant execute on function public.tenho_acesso() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.compras   enable row level security;
alter table public.perfis    enable row level security;
alter table public.favoritos enable row level security;
alter table public.despensa  enable row level security;
alter table public.consumo   enable row level security;
alter table public.semanas   enable row level security;

-- Compras: a pessoa enxerga as próprias, ninguém escreve pelo cliente.
-- O webhook usa service_role, que ignora RLS por definição.
create policy "compras visíveis para o dono"
  on public.compras for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Perfis
create policy "perfil próprio: leitura"
  on public.perfis for select to authenticated
  using (id = auth.uid());

create policy "perfil próprio: escrita"
  on public.perfis for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Favoritos, despensa, consumo: leitura e escrita apenas das próprias linhas.
create policy "favoritos próprios"
  on public.favoritos for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "despensa própria"
  on public.despensa for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "consumo próprio"
  on public.consumo for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "semana própria"
  on public.semanas for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
