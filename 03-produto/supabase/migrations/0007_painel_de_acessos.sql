-- Prot+ — painel de acessos: quem comprou está conseguindo entrar?
--
-- Motivo: em 20/09/2026 as duas primeiras clientes reais compraram, tiveram a
-- conta criada e o link enviado — e nenhuma das duas chegou a entrar. Só se
-- descobriu isso cruzando `compras` com `auth.users` na mão. Estas duas visões
-- deixam a pergunta a um SELECT de distância, para que a próxima falha de
-- entrega apareça no mesmo dia, e não depois do reembolso.
--
-- Segurança: as visões leem `auth.users`, que guarda o e-mail de todo mundo.
-- Por isso nascem com `security_invoker` (rodam com a permissão de quem
-- chama, não com a do dono) e sem nenhuma permissão para `anon` e
-- `authenticated`. Na prática: servem no SQL Editor do painel e pela
-- service_role; pela API pública do app, não respondem.

-- ---------------------------------------------------------------------------
-- 1. Uma linha por compra
-- ---------------------------------------------------------------------------

create or replace view public.painel_acessos
with (security_invoker = true) as
select
  (c.comprado_em at time zone 'America/Sao_Paulo')::timestamp as comprado_em,
  c.email,
  u.raw_user_meta_data ->> 'nome'                             as nome,
  c.status                                                    as status_compra,

  -- O diagnóstico em uma palavra. É esta coluna que se olha primeiro.
  case
    when u.id is null                then 'conta não criada'
    when c.status <> 'ativo'         then 'acesso encerrado'
    when u.last_sign_in_at is null   then 'NUNCA ENTROU'
    else                                  'entrou'
  end                                                         as situacao,

  (u.last_sign_in_at is not null)                             as entrou,
  (u.recovery_sent_at at time zone 'America/Sao_Paulo')::timestamp  as link_enviado_em,
  (u.last_sign_in_at  at time zone 'America/Sao_Paulo')::timestamp  as ultimo_login,

  -- Quanto tempo a pessoa levou da compra até a primeira entrada. Se começar a
  -- crescer, é sinal de e-mail caindo em spam ou demorando a chegar.
  case
    when u.last_sign_in_at is null then null
    else round(extract(epoch from (u.last_sign_in_at - c.comprado_em)) / 60)::integer
  end                                                         as minutos_ate_entrar,

  -- Entrar é uma coisa; usar é outra. Zero registro depois de dias lá dentro
  -- também é um problema, só que de produto, não de acesso.
  (select count(*) from public.consumo k where k.usuario_id = u.id)::integer as registros_no_app,

  -- Compras de teste da equipe não podem poluir a conta de quem é cliente.
  -- Pega tanto o domínio de teste quanto os endereços com +etiqueta dos admins.
  (
    c.email like '%.teste'
    or exists (
      select 1 from public.administradores a
      where a.email = lower(regexp_replace(c.email, '\+[^@]*', ''))
    )
  )                                                           as e_teste,

  c.pedido_payt,
  c.valor_centavos
from public.compras c
left join auth.users u on lower(u.email) = lower(c.email)
order by c.comprado_em desc;

comment on view public.painel_acessos is
  'Uma linha por compra, cruzando pagamento com login. Coluna `situacao`: "NUNCA ENTROU" é cliente pagante trancado do lado de fora.';

-- ---------------------------------------------------------------------------
-- 2. O número que interessa, em uma linha só
-- ---------------------------------------------------------------------------

create or replace view public.resumo_acessos
with (security_invoker = true) as
select
  count(*)                                        as compras_ativas,
  count(*) filter (where entrou)                  as entraram,
  count(*) filter (where not entrou)              as nunca_entraram,
  case
    when count(*) = 0 then null
    else round(100.0 * count(*) filter (where entrou) / count(*))
  end                                             as percentual_que_entrou,
  max(comprado_em)                                as ultima_compra
from public.painel_acessos
where status_compra = 'ativo'
  and not e_teste;

comment on view public.resumo_acessos is
  'Clientes reais com compra ativa: quantas compraram e quantas realmente entraram. Testes da equipe ficam de fora.';

-- ---------------------------------------------------------------------------
-- 3. Fechadura
-- ---------------------------------------------------------------------------

revoke all on public.painel_acessos  from public, anon, authenticated;
revoke all on public.resumo_acessos  from public, anon, authenticated;
