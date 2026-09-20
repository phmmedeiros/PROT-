/* Prot+ — configuração do acesso.
 *
 * A chave abaixo é a chave PUBLICÁVEL do projeto. Ela é feita para ficar
 * visível no navegador: sozinha não dá acesso a nada, porque toda tabela tem
 * Row Level Security e cada pessoa só enxerga as próprias linhas.
 *
 * A chave `service_role` NUNCA pode aparecer aqui nem em qualquer arquivo do
 * app — ela ignora o RLS e dá acesso ao banco inteiro. O lugar dela é apenas
 * nos segredos da Edge Function.
 */

window.PROT_CONFIG = {
  supabaseUrl: 'https://zhbvlqlkdpbtqvctrerw.supabase.co',
  supabaseKey: 'sb_publishable_VLvBI97N5WRxoxeVgck4OQ_7ZSg-2tv',

  /* Chave PÚBLICA do Web Push (lembrete diário). A privada fica só nos
     segredos da Edge Function `enviar-lembretes`. */
  vapidPublicKey: 'BHVUQBgLL3MGUsdy-VgTIUh4_9f_6Q_eQGH5o9t_5n67pNt5nAfwKpQbTPoWLJhC-YLAstXr6TS8w38_ndOMnHU',

  /* Para onde o link mágico devolve a pessoa. Precisa estar na lista de
     Redirect URLs em Authentication > URL Configuration, no painel. */
  enderecoDeRetorno: location.origin + location.pathname,

  /* Suporte mostrado quando o acesso não é encontrado. */
  emailSuporte: 'phenrimedeiros@gmail.com',
};
