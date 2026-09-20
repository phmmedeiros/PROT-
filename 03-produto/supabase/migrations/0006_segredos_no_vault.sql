-- Prot+ — segredos das Edge Functions no Vault.
--
-- O painel de "Edge Functions > Secrets" não é alcançável por MCP nem por CLI
-- sem token pessoal. O Vault (cofre criptografado da própria Supabase) é: os
-- segredos são gravados por SQL e as funções os leem em tempo de execução
-- quando não existe variável de ambiente com o mesmo nome. Se um dia forem
-- cadastrados no painel, o ambiente tem prioridade.
--
-- Os VALORES não ficam nesta migration. Ver README, seção 6.

create extension if not exists supabase_vault;

create or replace function public.segredo(nome text)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = nome
  limit 1;
$$;

-- Só o service_role (as Edge Functions) pode chamar. Nem a chave pública do
-- app nem uma sessão de cliente chegam perto.
revoke execute on function public.segredo(text) from public, anon, authenticated;
grant  execute on function public.segredo(text) to service_role;
