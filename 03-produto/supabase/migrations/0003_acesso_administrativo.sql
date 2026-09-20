-- Prot+ — acesso administrativo.
--
-- Paulo e Pedro entram no app sem ter comprado. Isso NÃO vira uma linha em
-- `compras`: se virasse, todo relatório de vendas contaria os dois como
-- clientes e o número de vendas nasceria errado. Admin é uma lista à parte.

create table public.administradores (
  email     text primary key,
  nome      text,
  criado_em timestamptz not null default now(),
  -- o e-mail é sempre guardado em minúsculas, para a comparação nunca falhar
  constraint email_minusculo check (email = lower(email))
);

comment on table public.administradores is
  'Quem entra no app sem compra. Editável apenas pelo painel (service_role).';

insert into public.administradores (email, nome) values
  ('phenrimedeiros@gmail.com', 'Paulo Henrique'),
  ('pedro.arqtt@gmail.com',    'Pedro Henrique');

alter table public.administradores enable row level security;

-- Ninguém escreve por aqui pelo app. A própria pessoa pode ler a sua linha.
create policy "admin vê a própria linha"
  on public.administradores for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- A portaria passa a aceitar dois caminhos: ser administrador OU ter compra ativa.
create or replace function public.tenho_acesso()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (
      select 1 from public.administradores
      where email = lower(auth.jwt() ->> 'email')
    )
    or exists (
      select 1 from public.compras
      where lower(email) = lower(auth.jwt() ->> 'email')
        and status = 'ativo'
    );
$$;

-- O app usa isto para avisar na tela que a sessão é administrativa, para vocês
-- não confundirem "eu vejo" com "a cliente vê".
create or replace function public.sou_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.administradores
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.tenho_acesso() from public, anon;
revoke execute on function public.sou_admin()   from public, anon;
grant  execute on function public.tenho_acesso() to authenticated;
grant  execute on function public.sou_admin()    to authenticated;

-- As contas de Paulo e Pedro em si são criadas fora desta migration, porque
-- mexem no schema `auth`. Ver a seção "Acesso administrativo" no README.
