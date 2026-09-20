/* Prot+ — webhook da Payt.
 *
 * Recebe a notificação de compra, registra o pedido, cria o acesso da pessoa
 * e manda o link de entrada por e-mail na hora. É este arquivo que transforma
 * "comprou" em "está dentro do app" sem nenhum passo manual.
 *
 * IMPORTANTE — o formato exato do payload da Payt ainda não foi verificado
 * contra uma compra real. Por isso a leitura dos campos é tolerante: testamos
 * vários nomes comuns e guardamos o corpo original em `compras.payload_bruto`.
 * Depois da primeira compra de teste, abra a linha criada, veja o formato real
 * e ajuste CAMPOS_* abaixo para ler direto o nome certo.
 *
 * Segredo: PAYT_WEBHOOK_SECRET, lido do ambiente (Edge Functions > Secrets)
 * ou, na falta dele, do Vault do banco via public.segredo(). O ambiente tem
 * prioridade. SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY vêm sempre do ambiente.
 *
 * `verify_jwt` fica desligado: quem chama é a Payt, que não tem sessão de
 * usuário. A autenticação aqui é o segredo compartilhado.
 */

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/* Para onde o link de acesso leva. Precisa estar na lista de Redirect URLs. */
const ENDERECO_DO_APP = 'https://app.comersemprebem.site/';

/* Nomes de campo aceitos, do mais provável para o menos. */
const CAMPOS_EMAIL = ['email', 'customer_email', 'buyer_email', 'client_email'];
const CAMPOS_PEDIDO = ['order_id', 'transaction_id', 'id', 'code', 'reference'];
const CAMPOS_STATUS = ['status', 'order_status', 'payment_status', 'event'];
const CAMPOS_VALOR = ['amount', 'total', 'value', 'price'];
const CAMPOS_NOME = ['name', 'customer_name', 'buyer_name', 'client_name'];

/* Status da Payt que liberam ou cortam o acesso. */
const APROVADOS = ['paid', 'approved', 'completed', 'aprovado', 'pago', 'authorized'];
const REEMBOLSADOS = ['refunded', 'reembolsado', 'chargeback', 'estornado'];
const CANCELADOS = ['canceled', 'cancelled', 'cancelado', 'expired', 'refused', 'recusado'];

/** Lê um segredo do ambiente ou, na falta dele, do Vault do banco. */
async function lerSegredo(sb: SupabaseClient, nome: string): Promise<string | null> {
  const doAmbiente = Deno.env.get(nome);
  if (doAmbiente) return doAmbiente;
  const { data, error } = await sb.rpc('segredo', { nome });
  if (error) {
    console.error(`Vault (${nome}): ${error.message}`);
    return null;
  }
  return (data as string | null) ?? null;
}

/** Chave única do postback (gerada pela Payt). Ainda não sabemos em que
 *  cabeçalho ou campo ela chega, então só é RECONHECIDA e registrada; a
 *  autenticação obrigatória segue sendo o `secret` da URL. Assim que uma
 *  chamada real mostrar onde ela vem, vira segunda trava. Nunca lança erro. */
function ondeEstaAChave(requisicao: Request, corpo: unknown, chave: string): string | null {
  try {
    for (const [nome, valor] of requisicao.headers) {
      if (valor.includes(chave)) return `cabeçalho ${nome}`;
    }
    const procurar = (valor: unknown, caminho: string): string | null => {
      if (typeof valor === 'string') return valor.includes(chave) ? caminho || 'corpo' : null;
      if (valor && typeof valor === 'object') {
        for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
          const achado = procurar(v, caminho ? `${caminho}.${k}` : k);
          if (achado) return achado;
        }
      }
      return null;
    };
    const campo = procurar(corpo, '');
    return campo ? `campo ${campo}` : null;
  } catch {
    return null;
  }
}

/** Procura um valor no payload, inclusive dentro de objetos aninhados. */
function achar(corpo: Record<string, unknown>, chaves: string[]): string | null {
  for (const chave of chaves) {
    const valor = corpo[chave];
    if (typeof valor === 'string' && valor.trim()) return valor.trim();
    if (typeof valor === 'number') return String(valor);
  }
  for (const ninho of ['customer', 'buyer', 'client', 'order', 'data', 'transaction']) {
    const dentro = corpo[ninho];
    if (dentro && typeof dentro === 'object') {
      const achado = achar(dentro as Record<string, unknown>, chaves);
      if (achado) return achado;
    }
  }
  return null;
}

function classificar(status: string | null): 'ativo' | 'reembolsado' | 'cancelado' | null {
  if (!status) return null;
  const limpo = status.toLowerCase().trim();
  if (APROVADOS.some((s) => limpo.includes(s))) return 'ativo';
  if (REEMBOLSADOS.some((s) => limpo.includes(s))) return 'reembolsado';
  if (CANCELADOS.some((s) => limpo.includes(s))) return 'cancelado';
  return null;
}

function responder(codigo: number, corpo: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corpo), {
    status: codigo,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (requisicao) => {
  if (requisicao.method !== 'POST') return responder(405, { erro: 'Use POST.' });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  // 1. Autenticação: segredo combinado com a Payt.
  const segredo = await lerSegredo(supabase, 'PAYT_WEBHOOK_SECRET');
  if (!segredo) {
    console.error('PAYT_WEBHOOK_SECRET ausente no ambiente e no Vault.');
    return responder(500, { erro: 'Webhook sem segredo configurado.' });
  }

  const url = new URL(requisicao.url);
  const enviado =
    requisicao.headers.get('x-payt-secret') ||
    requisicao.headers.get('x-webhook-secret') ||
    requisicao.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('secret');

  if (enviado !== segredo) {
    console.warn('Webhook recusado: segredo inválido.');
    return responder(401, { erro: 'Não autorizado.' });
  }

  // 2. Corpo.
  let corpo: Record<string, unknown>;
  try {
    corpo = await requisicao.json();
  } catch {
    return responder(400, { erro: 'Corpo não é JSON válido.' });
  }

  // Onde a chave única da Payt aparece nesta chamada (só registro, sem exigir).
  const chavePayt = await lerSegredo(supabase, 'PAYT_CHAVE_UNICA');
  const chaveOnde = chavePayt ? ondeEstaAChave(requisicao, corpo, chavePayt) : null;
  console.log(chaveOnde ? `Chave única da Payt reconhecida (${chaveOnde}).` : 'Chave única da Payt não encontrada nesta chamada.');

  const email = achar(corpo, CAMPOS_EMAIL);
  const pedido = achar(corpo, CAMPOS_PEDIDO);
  const situacao = classificar(achar(corpo, CAMPOS_STATUS));
  const nome = achar(corpo, CAMPOS_NOME);
  const valorBruto = achar(corpo, CAMPOS_VALOR);

  if (!email || !email.includes('@')) {
    console.error('Webhook sem e-mail reconhecível. Payload:', JSON.stringify(corpo));
    return responder(422, {
      erro: 'E-mail não encontrado no payload.',
      dica: 'Ajuste CAMPOS_EMAIL em payt-webhook/index.ts com o nome real do campo.',
    });
  }

  if (!situacao) {
    console.log('Evento ignorado, status não reconhecido:', JSON.stringify(corpo));
    return responder(200, { ok: true, ignorado: true, chave_payt: chaveOnde ?? 'não encontrada' });
  }

  let centavos: number | null = null;
  if (valorBruto) {
    const numero = Number(String(valorBruto).replace(',', '.'));
    if (Number.isFinite(numero)) {
      centavos = Number.isInteger(numero) && numero > 1000 ? numero : Math.round(numero * 100);
    }
  }

  // 3. Registra o pedido. `pedido_payt` é único, então reenvio não duplica.
  const { error: erroCompra } = await supabase.from('compras').upsert(
    { email: email.toLowerCase(), pedido_payt: pedido, status: situacao, valor_centavos: centavos, payload_bruto: corpo },
    { onConflict: 'pedido_payt' }
  );
  if (erroCompra) {
    console.error('Falha ao gravar a compra:', erroCompra.message);
    return responder(500, { erro: 'Falha ao registrar a compra.' });
  }

  // 4. Só compra aprovada cria acesso. Reembolso apenas muda o status acima,
  //    e `tenho_acesso()` passa a responder falso na próxima abertura do app.
  if (situacao !== 'ativo') {
    console.log(`Acesso encerrado para ${email}: ${situacao}`);
    return responder(200, { ok: true, status: situacao, chave_payt: chaveOnde ?? 'não encontrada' });
  }

  // 5. Cria o usuário. Cadastro público fica desligado no painel, então este é
  //    o único caminho de entrada: ninguém se cadastra sem ter comprado.
  const { error: erroUsuario } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    email_confirm: true,
    user_metadata: nome ? { nome } : {},
  });
  const jaExistia = erroUsuario && /already|registered|exists|duplicate/i.test(erroUsuario.message ?? '');
  if (erroUsuario && !jaExistia) {
    console.error('Falha ao criar o usuário:', erroUsuario.message);
    return responder(500, { erro: 'Compra registrada, mas o acesso falhou.' });
  }
  console.log(`Acesso liberado para ${email}${jaExistia ? ' (já existia)' : ''}.`);

  // 6. Envia o link de acesso agora. Uma falha aqui NÃO derruba a resposta:
  //    a compra e a conta já estão gravadas, e devolver erro faria a Payt
  //    reenviar o webhook e duplicar.
  const { error: erroEmail } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase(),
    options: { shouldCreateUser: false, emailRedirectTo: ENDERECO_DO_APP },
  });
  if (erroEmail) console.error(`Compra registrada, mas o e-mail de acesso falhou para ${email}:`, erroEmail.message);
  else console.log(`Link de acesso enviado para ${email}.`);

  return responder(200, { ok: true, status: 'ativo', novo: !jaExistia, email_enviado: !erroEmail, chave_payt: chaveOnde ?? 'não encontrada' });
});
