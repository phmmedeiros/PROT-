-- Prot+ — primeiro acesso guiado.
--
-- O app passa a perguntar o peso no primeiro login e calcular a meta na hora,
-- em vez de largar a pessoa num 140 g arbitrário. Guardamos o peso (útil para
-- recalcular depois) e a data em que as boas-vindas foram vistas, para nunca
-- mostrá-las duas vezes — mesmo em outro aparelho.

alter table public.perfis
  add column peso_kg        numeric(5,1) check (peso_kg is null or peso_kg between 20 and 300),
  add column boas_vindas_em timestamptz;

comment on column public.perfis.peso_kg is
  'Peso informado no primeiro acesso ou no Monitor. Nulo se a pessoa pulou.';
comment on column public.perfis.boas_vindas_em is
  'Quando a tela de boas-vindas foi concluída ou pulada. Nulo = ainda não viu.';

-- Quem já entrou antes desta mudança (os administradores e a conta de QA) não
-- precisa ver as boas-vindas: marca como vistas para não interromper.
update public.perfis set boas_vindas_em = now() where boas_vindas_em is null;
