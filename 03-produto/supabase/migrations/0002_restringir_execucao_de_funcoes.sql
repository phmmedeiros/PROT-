-- Prot+ — restringe quem pode chamar as funções pela API REST.
--
-- O verificador de segurança da Supabase apontou que `criar_perfil()` e
-- `marcar_atualizacao()` ficavam expostas como endpoints em /rest/v1/rpc/.
-- São funções de trigger: só fazem sentido disparadas pelo próprio banco.
-- O Postgres concede EXECUTE a PUBLIC por padrão, daí a revogação explícita.
--
-- Revogar não quebra os triggers: a permissão de execução é verificada na
-- criação do trigger, não a cada disparo (conferido com um usuário de teste).

revoke execute on function public.criar_perfil() from public, anon, authenticated;
revoke execute on function public.marcar_atualizacao() from public, anon, authenticated;

-- `tenho_acesso()` continua chamável por quem tem sessão — é a checagem de
-- acesso do app — mas não por visitante anônimo.
revoke execute on function public.tenho_acesso() from public, anon;
grant execute on function public.tenho_acesso() to authenticated;
