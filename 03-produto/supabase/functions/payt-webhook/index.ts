/* Prot+ — webhook da Payt (formato "PayT V1").
 *
 * Recebe a notificação de compra, registra o pedido, cria o acesso da pessoa
 * e manda o link de entrada por e-mail na hora. É este arquivo que transforma
 * "comprou" em "está dentro do app" sem nenhum passo manual.
 *
 * Formato confirmado numa chamada real em 20/09/2026 — o corpo inteiro está em
 * `exemplo-postback-payt-v1.json`. Campos usados:
 *   test                        true nos disparos de teste do painel: nada é criado
 *   integration_key             chave única do postback: segunda trava (401 se não bater)
 *   transaction_id              identificador do pedido (reenvio não duplica)
 *   status, transaction.payment_status   "paid", "refunded", "chargeback", ...
 *   transaction.total_price     valor em centavos
 *   customer.email/.name        comprador
 *   customer.fake_email         a Payt sinaliza e-mail falso: aí não enviamos
 *   order_bumps[].product       bumps comprados, gravados em compras.bumps
 * Nomes alternativos continuam aceitos como reserva, caso o formato mude.
 *
 * Segredos (ambiente ou Vault, via public.segredo()): PAYT_WEBHOOK_SECRET,
 * PAYT_CHAVE_UNICA. SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY vêm do ambiente.
 * `verify_jwt` desligado: quem chama é a Payt, sem sessão de usuário.
 */

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const ENDERECO_DO_APP = 'https://app.comersemprebem.site/';

/* Reservas, caso o formato mude: do mais provável para o menos. */
const CAMPOS_EMAIL = ['email', 'customer_email', 'buyer_email', 'client_email'];
const CAMPOS_PEDIDO = ['transaction_id', 'order_id', 'id', 'code', 'reference'];
const CAMPOS_STATUS = ['status', 'order_status', 'payment_status', 'event'];
const CAMPOS_VALOR = ['total_price', 'amount', 'total', 'value', 'price'];
const CAMPOS_NOME = ['name', 'customer_name', 'buyer_name', 'client_name'];

const APROVADOS = ['paid', 'approved', 'completed', 'aprovado', 'pago', 'authorized'];
const REEMBOLSADOS = ['refunded', 'reembolsado', 'chargeback', 'estornado', 'disputed'];
const CANCELADOS = ['canceled', 'cancelled', 'cancelado', 'expired', 'refused', 'recusado'];

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

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

/** Reserva: procura um valor pelos nomes alternativos, inclusive aninhado. */
function achar(corpo: Obj, chaves: string[]): string | null {
  for (const chave of chaves) {
    const valor = corpo[chave];
    if (typeof valor === 'string' && valor.trim()) return valor.trim();
    if (typeof valor === 'number') return String(valor);
  }
  for (const ninho of ['customer', 'buyer', 'client', 'order', 'data', 'transaction']) {
    const dentro = corpo[ninho];
    if (dentro && typeof dentro === 'object') {
      const achado = achar(dentro as Obj, chaves);
      if (achado) return achado;
    }
  }
  return null;
}

function classificar(status: string | null): 'ativo' | 'reembolsado' | 'cancelado' | null {
  if (!status) return null;
  const limpo = status.toLowerCase().trim();
  if (REEMBOLSADOS.some((s) => limpo.includes(s))) return 'reembolsado';
  if (CANCELADOS.some((s) => limpo.includes(s))) return 'cancelado';
  if (APROVADOS.some((s) => limpo.includes(s))) return 'ativo';
  return null;
}

/** Entre os status presentes no corpo, o mais severo manda: um reembolso em
 *  qualquer campo corta o acesso mesmo que outro campo ainda diga "paid". */
function situacaoDe(corpo: Obj): 'ativo' | 'reembolsado' | 'cancelado' | null {
  const candidatos = [texto(corpo.status), texto(obj(corpo.transaction).payment_status), achar(corpo, CAMPOS_STATUS)]
    .map(classificar)
    .filter(Boolean);
  if (candidatos.includes('reembolsado')) return 'reembolsado';
  if (candidatos.includes('cancelado')) return 'cancelado';
  if (candidatos.includes('ativo')) return 'ativo';
  return null;
}

/** Reserva para o valor quando não vier em transaction.total_price. */
function centavosDe(bruto: string | null): number | null {
  if (!bruto) return null;
  const numero = Number(bruto.replace(',', '.'));
  if (!Number.isFinite(numero)) return null;
  return Number.isInteger(numero) && numero > 1000 ? numero : Math.round(numero * 100);
}

function responder(codigo: number, corpo: Obj): Response {
  return new Response(JSON.stringify(corpo), { status: codigo, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (requisicao) => {
  if (requisicao.method !== 'POST') return responder(405, { erro: 'Use POST.' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // 1. Primeira trava: o segredo da URL.
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
  let corpo: Obj;
  try {
    corpo = obj(await requisicao.json());
  } catch {
    return responder(400, { erro: 'Corpo não é JSON válido.' });
  }

  // 3. Segunda trava: a chave única que a Payt manda em `integration_key`.
  const chaveUnica = await lerSegredo(supabase, 'PAYT_CHAVE_UNICA');
  if (chaveUnica && corpo.integration_key !== chaveUnica) {
    console.warn('Webhook recusado: integration_key não confere. Corpo:', JSON.stringify(corpo).slice(0, 1500));
    return responder(401, { erro: 'Chave única do postback não confere.' });
  }

  // 4. Disparo de teste do painel da Payt: só registramos no log. Sem isto,
  //    cada teste viraria uma conta real e um e-mail para um endereço falso.
  if (corpo.test === true) {
    console.log('Postback de TESTE da Payt recebido; nada foi criado. Corpo:', JSON.stringify(corpo).slice(0, 3000));
    return responder(200, { ok: true, teste: true });
  }

  // 5. Campos do PayT V1, com as reservas por trás.
  const cliente = obj(corpo.customer);
  const transacao = obj(corpo.transaction);
  const email = texto(cliente.email) ?? achar(corpo, CAMPOS_EMAIL);
  const nome = texto(cliente.name) ?? achar(corpo, CAMPOS_NOME);
  const pedido = texto(corpo.transaction_id) ?? achar(corpo, CAMPOS_PEDIDO);
  const situacao = situacaoDe(corpo);
  const centavos =
    typeof transacao.total_price === 'number' ? Math.round(transacao.total_price) : centavosDe(achar(corpo, CAMPOS_VALOR));
  const emailFalso = cliente.fake_email === true;
  const bumps = Array.isArray(corpo.order_bumps)
    ? corpo.order_bumps.map((b) => {
        const bump = obj(b);
        const produto = obj(bump.product);
        return { codigo: bump.code ?? null, nome: produto.name ?? bump.name ?? null, preco_centavos: produto.price ?? null };
      })
    : [];

  if (!email || !email.includes('@')) {
    console.error('Webhook sem e-mail reconhecível. Corpo:', JSON.stringify(corpo).slice(0, 1500));
    return responder(422, { erro: 'E-mail não encontrado no payload.' });
  }
  if (!situacao) {
    console.log('Evento sem mudança de acesso (pix gerado, boleto emitido...):', JSON.stringify(corpo).slice(0, 1500));
    return responder(200, { ok: true, ignorado: true });
  }

  // 6. Registra o pedido. `pedido_payt` é único: reenvio da Payt não duplica.
  const { error: erroCompra } = await supabase.from('compras').upsert(
    { email: email.toLowerCase(), pedido_payt: pedido, status: situacao, valor_centavos: centavos, bumps, payload_bruto: corpo },
    { onConflict: 'pedido_payt' }
  );
  if (erroCompra) {
    console.error('Falha ao gravar a compra:', erroCompra.message);
    return responder(500, { erro: 'Falha ao registrar a compra.' });
  }

  // 7. Reembolso, chargeback e cancelamento só mudam o status; o acesso cai
  //    na próxima abertura do app, quando `tenho_acesso()` responde falso.
  if (situacao !== 'ativo') {
    console.log(`Acesso encerrado para ${email}: ${situacao} (pedido ${pedido}).`);
    return responder(200, { ok: true, status: situacao });
  }

  // 8. Cria a conta. Cadastro público está fechado: este é o único caminho.
  const { error: erroUsuario } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    email_confirm: true,
    user_metadata: nome ? { nome } : {},
  });
  const jaExistia = !!erroUsuario && /already|registered|exists|duplicate/i.test(erroUsuario.message ?? '');
  if (erroUsuario && !jaExistia) {
    console.error('Falha ao criar o usuário:', erroUsuario.message);
    return responder(500, { erro: 'Compra registrada, mas o acesso falhou.' });
  }
  console.log(`Acesso liberado para ${email}${jaExistia ? ' (já existia)' : ''}, pedido ${pedido}, ${centavos ?? '?'} centavos, ${bumps.length} bump(s).`);

  // 9. Envia o link de acesso. E-mail marcado como falso pela Payt não recebe
  //    nada (iria bater e sujar a reputação do domínio). Falha aqui NÃO derruba
  //    a resposta: compra e conta já estão gravadas, e erro faria a Payt repetir.
  if (emailFalso) {
    console.warn(`E-mail marcado como falso pela Payt (${email}); acesso criado, e-mail não enviado.`);
    return responder(200, { ok: true, status: 'ativo', novo: !jaExistia, email_enviado: false, motivo: 'email_falso' });
  }
  const { error: erroEmail } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase(),
    options: { shouldCreateUser: false, emailRedirectTo: ENDERECO_DO_APP },
  });
  if (erroEmail) console.error(`Compra registrada, mas o e-mail de acesso falhou para ${email}:`, erroEmail.message);
  else console.log(`Link de acesso enviado para ${email}.`);

  return responder(200, { ok: true, status: 'ativo', novo: !jaExistia, email_enviado: !erroEmail });
});
