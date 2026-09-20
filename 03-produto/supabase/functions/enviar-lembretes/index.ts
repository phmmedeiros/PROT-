/* Prot+ — lembrete diário por notificação.
 *
 * Chamada a cada hora pelo pg_cron. Encontra quem escolheu esta hora para o
 * lembrete e ainda não registrou nenhuma refeição hoje, e manda uma notificação
 * para cada aparelho dessa pessoa. Quem já registrou não é incomodado.
 *
 * Segredos (Painel > Edge Functions > Secrets):
 *   CRON_SECRET        confere a chamada do agendador
 *   VAPID_PUBLIC_KEY   par de chaves Web Push (a pública também está no app)
 *   VAPID_PRIVATE_KEY
 *
 * Teste manual (envia agora para uma pessoa, ignorando hora e consumo):
 *   POST ... -H "x-cron-secret: ..." -d '{"forcar_usuario":"<uuid>"}'
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const FUSO = 'America/Sao_Paulo';
const horaAgora = () =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: FUSO, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
const diaHoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());

function responder(codigo: number, corpo: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corpo), { status: codigo, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (requisicao) => {
  if (requisicao.method !== 'POST') return responder(405, { erro: 'Use POST.' });

  const segredo = Deno.env.get('CRON_SECRET');
  const publica = Deno.env.get('VAPID_PUBLIC_KEY');
  const privada = Deno.env.get('VAPID_PRIVATE_KEY');
  if (!segredo || !publica || !privada) {
    return responder(500, { erro: 'Faltam segredos: CRON_SECRET, VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY.' });
  }
  if (requisicao.headers.get('x-cron-secret') !== segredo) return responder(401, { erro: 'Não autorizado.' });

  let corpo: { forcar_usuario?: string } = {};
  try {
    corpo = await requisicao.json();
  } catch {
    /* corpo vazio é normal na chamada agendada */
  }

  webpush.setVapidDetails('mailto:phenrimedeiros@gmail.com', publica, privada);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const hora = horaAgora();
  const dia = diaHoje();

  // 1. Quem pediu lembrete nesta hora (ou a pessoa forçada no teste).
  const consultaPerfis = corpo.forcar_usuario
    ? sb.from('perfis').select('id, nome').eq('id', corpo.forcar_usuario)
    : sb.from('perfis').select('id, nome').eq('lembrete_hora', hora);
  const { data: perfis, error: erroPerfis } = await consultaPerfis;
  if (erroPerfis) return responder(500, { erro: erroPerfis.message });
  if (!perfis?.length) return responder(200, { hora, avaliados: 0, enviados: 0, removidos: 0 });

  // 2. Tira quem já registrou algo hoje — o lembrete é só para quem esqueceu.
  let pendentes = perfis;
  if (!corpo.forcar_usuario) {
    const { data: registraram } = await sb
      .from('consumo')
      .select('usuario_id')
      .eq('dia', dia)
      .in('usuario_id', perfis.map((p) => p.id));
    const ja = new Set((registraram ?? []).map((r) => r.usuario_id));
    pendentes = perfis.filter((p) => !ja.has(p.id));
  }
  if (!pendentes.length) return responder(200, { hora, avaliados: perfis.length, enviados: 0, removidos: 0 });

  // 3. Todos os aparelhos dessas pessoas.
  const nomes = new Map(pendentes.map((p) => [p.id, p.nome]));
  const { data: assinaturas } = await sb
    .from('push_assinaturas')
    .select('id, usuario_id, endpoint, chaves, falhas')
    .in('usuario_id', pendentes.map((p) => p.id));

  let enviados = 0;
  let removidos = 0;
  for (const a of assinaturas ?? []) {
    const nome = nomes.get(a.usuario_id);
    const payload = JSON.stringify({
      titulo: 'Prot+',
      corpo: `${nome ? nome + ', ' : ''}registrou sua refeição de hoje? Sua meta de proteína está esperando.`,
      url: './#/monitor',
    });
    try {
      await webpush.sendNotification({ endpoint: a.endpoint, keys: a.chaves }, payload, { TTL: 3600 });
      enviados++;
      if (a.falhas > 0) await sb.from('push_assinaturas').update({ falhas: 0 }).eq('id', a.id);
    } catch (erro) {
      const status = (erro as { statusCode?: number }).statusCode;
      // 404/410: o navegador cancelou a assinatura. Três falhas seguidas: idem.
      if (status === 404 || status === 410 || a.falhas + 1 >= 3) {
        await sb.from('push_assinaturas').delete().eq('id', a.id);
        removidos++;
      } else {
        await sb.from('push_assinaturas').update({ falhas: a.falhas + 1 }).eq('id', a.id);
      }
      console.warn(`Envio falhou (${status ?? 'sem status'}) para assinatura ${a.id}`);
    }
  }

  console.log(`Lembretes ${hora}h: avaliados ${perfis.length}, enviados ${enviados}, removidos ${removidos}.`);
  return responder(200, { hora, avaliados: perfis.length, enviados, removidos });
});
