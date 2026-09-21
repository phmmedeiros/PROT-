/* Prot+ — service worker.
 *
 * Duas estratégias, porque os arquivos têm naturezas diferentes:
 *
 *   ESTRUTURA (html, css, js, json, ícones)
 *     Guardada na instalação. O app abre offline já na segunda visita.
 *     Em rede, busca a versão nova em segundo plano e atualiza o cache.
 *
 *   FOTOS (images/w400 e images/w900)
 *     São 15 MB no total: baixar tudo na instalação travaria o primeiro acesso.
 *     Cada foto entra no cache quando é exibida pela primeira vez.
 *
 * Ao publicar uma versão nova do app, troque o número em VERSAO para que os
 * aparelhos que já visitaram o site descartem o cache antigo.
 */

const VERSAO = 'v7';
const CACHE_ESTRUTURA = `prot-plus-estrutura-${VERSAO}`;
const CACHE_FOTOS = `prot-plus-fotos-${VERSAO}`;

const ESTRUTURA = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './conta.js',
  './config.js',
  './vendor/supabase.js',
  './manifest.json',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/icons/icon-maskable-512.png',
  './images/icons/apple-touch-icon.png',
  './images/icons/favicon.png',
  '../dados/receitas.json',
  '../dados/dicas-chef.json',
  '../dados/bonus.json',
  '../dados/extras.json',
];

/* Os PDFs da Estante ficam de fora de propósito: somam ~4 MB e fariam toda
   primeira abertura do app esperar por eles. São baixados quando a pessoa
   abre o livro, e o navegador guarda a partir daí. */

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_ESTRUTURA)
      .then((cache) => cache.addAll(ESTRUTURA))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  const atuais = [CACHE_ESTRUTURA, CACHE_FOTOS];
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((nome) => !atuais.includes(nome)).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim())
  );
});

/** Fotos: entrega do cache se já existir, senão busca e guarda. */
async function estrategiaFoto(requisicao) {
  const cache = await caches.open(CACHE_FOTOS);
  const guardada = await cache.match(requisicao);
  if (guardada) return guardada;

  try {
    const resposta = await fetch(requisicao);
    if (resposta.ok) cache.put(requisicao, resposta.clone());
    return resposta;
  } catch (erro) {
    return new Response('', { status: 504, statusText: 'Foto indisponível offline' });
  }
}

/** Estrutura: entrega o cache na hora e revalida em segundo plano. */
async function estrategiaEstrutura(requisicao) {
  const cache = await caches.open(CACHE_ESTRUTURA);
  const guardada = await cache.match(requisicao);

  const rede = fetch(requisicao)
    .then((resposta) => {
      if (resposta.ok) cache.put(requisicao, resposta.clone());
      return resposta;
    })
    .catch(() => null);

  const resposta = guardada || (await rede);
  if (resposta) return resposta;

  // Navegação sem cache e sem rede volta para a casca do app.
  if (requisicao.mode === 'navigate') {
    return (await cache.match('./index.html')) || Response.error();
  }
  return Response.error();
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Chamadas ao Supabase (login e dados da pessoa) são de outra origem e
  // seguem direto para a rede: dado de usuário nunca entra em cache.
  if (url.origin !== self.location.origin) return;

  if (/\/images\/w\d+\//.test(url.pathname) || url.pathname.endsWith('.png')) {
    evento.respondWith(estrategiaFoto(request));
    return;
  }

  evento.respondWith(estrategiaEstrutura(request));
});

/* ---- Lembrete diário (Web Push) ---- */

self.addEventListener('push', (evento) => {
  let dados = { titulo: 'Prot+', corpo: 'Registrou sua refeição de hoje?', url: './#/monitor' };
  try {
    if (evento.data) dados = { ...dados, ...evento.data.json() };
  } catch {
    /* payload fora do formato: usa o texto padrão */
  }
  evento.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: './images/icons/icon-192.png',
      badge: './images/icons/icon-192.png',
      tag: 'lembrete-prot-plus', // uma notificação por vez; a nova substitui a antiga
      data: { url: dados.url },
    })
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const alvo = new URL(evento.notification.data?.url || './#/monitor', self.location.href).href;
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if (janela.url.startsWith(self.registration.scope)) {
          if ('navigate' in janela) janela.navigate(alvo);
          return janela.focus();
        }
      }
      return self.clients.openWindow(alvo);
    })
  );
});
