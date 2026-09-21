-- Prot+ — quais order bumps esta pessoa comprou.
--
-- A esteira já registrava o dado desde a primeira venda: o webhook grava cada
-- bump em `compras.bumps`, com o código e o nome que a Payt manda. O que
-- faltava era alguém perguntar. Esta função é essa pergunta.
--
-- Mesmo padrão de `tenho_acesso()`: `security definer` porque a pessoa não
-- enxerga a tabela `compras` (nem deve), `stable` porque só lê, e execução
-- liberada apenas para quem tem sessão.
--
-- Reembolso e chargeback saem de graça: a consulta exige `status = 'ativo'`,
-- então no instante em que o webhook muda o status o bump some do app, pelo
-- mesmo caminho que já corta o acesso ao produto principal.

create or replace function public.meus_bumps()
returns table (codigo text, nome text)
language sql
security definer
set search_path = public
stable
as $$
  select distinct
    nullif(trim(item ->> 'codigo'), '') as codigo,
    nullif(trim(item ->> 'nome'), '')   as nome
  from public.compras c
  cross join lateral jsonb_array_elements(c.bumps) as item
  where lower(c.email) = lower(auth.jwt() ->> 'email')
    and c.status = 'ativo';
$$;

comment on function public.meus_bumps() is
  'Order bumps com compra ativa da pessoa da sessão. O app casa pelo código e usa o nome como reserva.';

-- Visitante anônimo não pergunta; quem tem sessão, sim.
revoke execute on function public.meus_bumps() from public, anon;
grant execute on function public.meus_bumps() to authenticated;
