-- Prot+ — lembrete diário por notificação ("registrou sua refeição?").
--
-- A pessoa escolhe uma hora no Monitor. Uma função agendada roda a cada hora,
-- encontra quem tem lembrete naquela hora e ainda não registrou nada no dia,
-- e envia a notificação. Quem já registrou não é incomodado.

alter table public.perfis
  add column lembrete_hora smallint
    check (lembrete_hora is null or lembrete_hora between 0 and 23);

comment on column public.perfis.lembrete_hora is
  'Hora (Brasília) do lembrete diário. Nulo = lembrete desligado.';

-- Cada aparelho em que a pessoa aceitou notificações gera uma assinatura.
create table public.push_assinaturas (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  chaves     jsonb not null,
  falhas     smallint not null default 0,
  criado_em  timestamptz not null default now()
);

comment on table public.push_assinaturas is
  'Assinaturas Web Push, uma por aparelho. `falhas` conta envios recusados; a partir de 3 a assinatura é apagada.';

create index push_assinaturas_usuario_idx on public.push_assinaturas (usuario_id);

alter table public.push_assinaturas enable row level security;

create policy "assinatura própria"
  on public.push_assinaturas for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Agendamento (pg_cron) e chamadas HTTP a partir do banco (pg_net), usados
-- para acionar a função de envio a cada hora. O agendamento em si é criado
-- depois que a função estiver publicada (ver README, seção do lembrete).
create extension if not exists pg_cron;
-- No schema `extensions`, não em `public`: o verificador da Supabase aponta
-- extensão em public como exposição desnecessária pela API REST.
create extension if not exists pg_net with schema extensions;
