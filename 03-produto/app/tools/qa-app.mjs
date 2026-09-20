/* QA automatizado do Prot+.
 *
 * Abre o app em um Chrome headless de 390 x 844, percorre as 8 telas, executa
 * as interacoes principais (favoritar, registrar consumo, trocar refeicao do
 * cardapio, calcular metas) e salva um print de cada tela em `qa/`.
 *
 * Qualquer erro de JavaScript no console derruba o teste.
 *
 * Como rodar (a partir da raiz do projeto):
 *
 *     node local-preview-server.mjs &
 *     node 03-produto/app/tools/qa-app.mjs
 *
 * O endereco pode ser trocado com a variavel BASE, util depois da publicacao:
 *
 *     BASE=https://seudominio.com.br/app/ node 03-produto/app/tools/qa-app.mjs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SAIDA = path.join(APP, 'qa');
const BASE = process.env.BASE || 'http://127.0.0.1:4174/app/';
const CHROME =
  process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORTA = 9333;

/* ------------------------------------------------------------------ *
 * Ligacao com o Chrome (DevTools Protocol)
 * ------------------------------------------------------------------ */

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrirChrome(perfil) {
  const processo = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORTA}`,
      `--user-data-dir=${perfil}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  for (let tentativa = 0; tentativa < 60; tentativa++) {
    try {
      const resposta = await fetch(`http://127.0.0.1:${PORTA}/json/version`);
      if (resposta.ok) return processo;
    } catch {
      /* ainda subindo */
    }
    await espera(250);
  }
  throw new Error('Chrome não respondeu na porta de depuração.');
}

/** Cliente minimo do DevTools Protocol sobre WebSocket. */
class Sessao {
  constructor(socket) {
    this.socket = socket;
    this.proximoId = 1;
    this.pendentes = new Map();
    this.ouvintes = [];
    socket.addEventListener('message', ({ data }) => {
      const mensagem = JSON.parse(data);
      if (mensagem.id && this.pendentes.has(mensagem.id)) {
        const { resolve, reject } = this.pendentes.get(mensagem.id);
        this.pendentes.delete(mensagem.id);
        mensagem.error ? reject(new Error(mensagem.error.message)) : resolve(mensagem.result);
      } else if (mensagem.method) {
        this.ouvintes.forEach((ouvinte) => ouvinte(mensagem));
      }
    });
  }

  static async conectar() {
    const alvos = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
    const pagina = alvos.find((alvo) => alvo.type === 'page');
    const socket = new WebSocket(pagina.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new Sessao(socket);
  }

  enviar(method, params = {}) {
    const id = this.proximoId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pendentes.set(id, { resolve, reject }));
  }

  ao(ouvinte) {
    this.ouvintes.push(ouvinte);
  }

  /** Avalia JS na pagina e devolve o valor. Excecoes viram erro do teste. */
  async avaliar(expressao) {
    const { result, exceptionDetails } = await this.enviar('Runtime.evaluate', {
      expression: `(() => { ${expressao} })()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || 'erro na página');
    return result.value;
  }
}

/* ------------------------------------------------------------------ *
 * Roteiro do teste
 * ------------------------------------------------------------------ */

const TELAS = [
  { arquivo: '01-inicio', hash: '#/inicio', contem: 'Chef do dia' },
  { arquivo: '02-receitas', hash: '#/receitas', contem: 'Catálogo de receitas' },
  { arquivo: '03-detalhe', hash: '#/receita/AJ-001', contem: 'Dica de ouro do chef' },
  { arquivo: '04-ferramentas', hash: '#/ferramentas', contem: 'Seletor Turbo Protein' },
  { arquivo: '05-turbo', hash: '#/turbo', contem: 'Super Anabólico' },
  { arquivo: '06-despensa', hash: '#/despensa', contem: 'Radar de Despensa' },
  { arquivo: '07-semana', hash: '#/semana', contem: 'Semana Blindada' },
  { arquivo: '08-monitor', hash: '#/monitor', contem: 'Monitor Diário de Macros' },
  { arquivo: '09-bonus', hash: '#/bonus', contem: 'Manual do Whey Caseiro' },
];

const resultados = [];
let falhas = 0;

function checar(nome, condicao, detalhe = '') {
  if (condicao) {
    resultados.push(`  ok    ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
  } else {
    resultados.push(`  FALHA ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
    falhas++;
  }
}

async function principal() {
  await fs.mkdir(SAIDA, { recursive: true });
  const perfil = await fs.mkdtemp(path.join(process.env.TMPDIR || '/tmp', 'prot-qa-'));
  const chrome = await abrirChrome(perfil);
  const sessao = await Sessao.conectar();

  const errosJs = [];
  sessao.ao((mensagem) => {
    if (mensagem.method === 'Runtime.exceptionThrown') {
      errosJs.push(mensagem.params.exceptionDetails.exception?.description || 'exceção');
    }
    if (mensagem.method === 'Runtime.consoleAPICalled' && mensagem.params.type === 'error') {
      errosJs.push(mensagem.params.args.map((a) => a.value ?? a.description).join(' '));
    }
  });

  await sessao.enviar('Runtime.enable');
  await sessao.enviar('Page.enable');
  await sessao.enviar('Network.enable');

  const falhasDeRede = [];
  sessao.ao((mensagem) => {
    if (mensagem.method === 'Network.responseReceived' && mensagem.params.response.status >= 400) {
      falhasDeRede.push(`${mensagem.params.response.status} ${mensagem.params.response.url}`);
    }
  });

  await sessao.enviar('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  async function ir(hash) {
    await sessao.enviar('Page.navigate', { url: BASE + hash });
    await espera(1400);
  }

  async function print(arquivo, telaInteira = false) {
    const { data } = await sessao.enviar('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: telaInteira,
    });
    await fs.writeFile(path.join(SAIDA, `${arquivo}.png`), Buffer.from(data, 'base64'));
  }

  // --- 1. Percorre as telas e salva os prints ---
  resultados.push('Telas (390 x 844)');
  for (const tela of TELAS) {
    await ir(tela.hash);
    const texto = await sessao.avaliar('return document.body.innerText;');
    checar(tela.arquivo, texto.includes(tela.contem), `"${tela.contem}"`);
    await print(tela.arquivo);
  }

  // --- 2. Dados carregados ---
  resultados.push('Dados');
  await ir('#/receitas');
  const totalCards = await sessao.avaliar('return document.querySelectorAll(".card-receita").length;');
  checar('catálogo lista as 120 receitas', totalCards === 120, `${totalCards} cards`);

  const fotos = await sessao.avaliar(`
    const imgs = [...document.querySelectorAll('.card-receita img')];
    return imgs.filter(i => i.naturalWidth > 0).length + '/' + imgs.length;
  `);
  // `loading="lazy"` faz o navegador buscar so as fotos proximas da viewport.
  checar('fotos dos cards carregam (lazy)', Number(fotos.split('/')[0]) > 0, `${fotos} no primeiro scroll`);

  // --- 3. Busca e filtros ---
  resultados.push('Catálogo');
  const busca = await sessao.avaliar(`
    const campo = document.querySelector('#busca');
    campo.value = 'frango';
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelectorAll('.card-receita').length;
  `);
  checar('busca por "frango" filtra', busca > 0 && busca < 120, `${busca} resultados`);

  const porCategoria = await sessao.avaliar(`
    document.querySelector('#busca').value = '';
    document.querySelector('#busca').dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-acao="filtrar-categoria"][data-valor="sobremesas"]').click();
    return document.querySelectorAll('.card-receita').length;
  `);
  checar('filtro de categoria sobremesas', porCategoria === 30, `${porCategoria} sobremesas`);

  const ordenado = await sessao.avaliar(`
    document.querySelector('[data-acao="filtrar-categoria"][data-valor="todas"]').click();
    const seletor = document.querySelector('#filtro-ordem');
    seletor.value = 'proteina';
    seletor.dispatchEvent(new Event('change', { bubbles: true }));
    const valores = [...document.querySelectorAll('.card-macros .proteina')]
      .map(e => parseFloat(e.textContent.replace(/[^0-9.]/g, '')));
    return valores[0] >= valores[valores.length - 1];
  `);
  checar('ordenação por proteína', ordenado === true);

  // --- 4. Favoritos ---
  resultados.push('Favoritos');
  const favoritou = await sessao.avaliar(`
    document.querySelector('.botao-favorito').click();
    const salvo = JSON.parse(localStorage.getItem('prot-plus-v3') || '{}');
    return (salvo.favoritos || []).length;
  `);
  checar('favoritar salva no aparelho', favoritou === 1, `${favoritou} favorito`);

  // --- 5. Monitor diário ---
  resultados.push('Monitor Diário');
  await ir('#/receita/AJ-001');
  const registrado = await sessao.avaliar(`
    document.querySelector('[data-acao="adicionar-consumo"]').click();
    const salvo = JSON.parse(localStorage.getItem('prot-plus-v3') || '{}');
    return salvo.consumo.itens.length;
  `);
  checar('adicionar ao consumo do dia', registrado === 1, `${registrado} item`);

  await ir('#/monitor');
  const progresso = await sessao.avaliar(`
    const barra = document.querySelector('.barra i');
    return barra ? barra.style.width : '';
  `);
  checar('barra de progresso reflete o consumo', progresso !== '' && progresso !== '0%', progresso);

  const metaPorPeso = await sessao.avaliar(`
    document.querySelector('#peso').value = '70';
    document.querySelector('[data-acao="meta-por-peso"]').click();
    return JSON.parse(localStorage.getItem('prot-plus-v3')).meta;
  `);
  checar('meta calculada pelo peso (70 kg)', metaPorPeso === 126, `${metaPorPeso} g`);

  const removeu = await sessao.avaliar(`
    document.querySelector('[data-acao="remover-consumo"]').click();
    return JSON.parse(localStorage.getItem('prot-plus-v3')).consumo.itens.length;
  `);
  checar('remover item do consumo', removeu === 0);

  // --- 6. Radar de Despensa ---
  resultados.push('Radar de Despensa');
  await ir('#/despensa');
  const combinacoes = await sessao.avaliar(`
    document.querySelector('[data-acao="alternar-ingrediente"][data-valor="ovo"]').click();
    return document.querySelectorAll('.lista .linha').length;
  `);
  checar('ingrediente selecionado gera combinações', combinacoes > 0, `${combinacoes} receitas`);
  await print('06-despensa');

  // --- 7. Semana Blindada ---
  resultados.push('Semana Blindada');
  await ir('#/semana');
  const semana = await sessao.avaliar(`
    const salvo = JSON.parse(localStorage.getItem('prot-plus-v3'));
    const dias = salvo.semana.dias;
    const ids = dias.flatMap(d => Object.values(d));
    return JSON.stringify({ dias: dias.length, refeicoes: ids.length, unicas: new Set(ids).size });
  `);
  const s = JSON.parse(semana);
  checar('7 dias x 4 refeições', s.dias === 7 && s.refeicoes === 28, `${s.refeicoes} refeições`);
  checar('sem receita repetida na semana', s.unicas === 28, `${s.unicas} receitas distintas`);

  const trocou = await sessao.avaliar(`
    const antes = JSON.parse(localStorage.getItem('prot-plus-v3')).semana.dias[0].cafe;
    document.querySelector('[data-acao="trocar-refeicao"]').click();
    const depois = JSON.parse(localStorage.getItem('prot-plus-v3')).semana.dias[0].cafe;
    return antes !== depois;
  `);
  checar('trocar refeição avulsa', trocou === true);

  const lista = await sessao.avaliar(`
    document.querySelector('[data-acao="gerar-lista"]').click();
    return document.querySelectorAll('#folha .lista-compras li').length;
  `);
  checar('lista de compras consolidada', lista > 0, `${lista} itens`);
  await print('10-lista-compras');

  const objetivo = await sessao.avaliar(`
    document.querySelector('[data-acao="fechar-folha"]').click();
    document.querySelector('[data-acao="escolher-objetivo"][data-valor="secar"]').click();
    const salvo = JSON.parse(localStorage.getItem('prot-plus-v3'));
    return salvo.semana.objetivo;
  `);
  checar('trocar objetivo remonta o cardápio', objetivo === 'secar');

  // --- 8. Bônus ---
  resultados.push('Bônus');
  await ir('#/bonus');
  const treino = await sessao.avaliar(`
    document.querySelector('[data-acao="escolher-local"][data-valor="casa"]').click();
    return document.querySelectorAll('.lista-exercicios li').length;
  `);
  checar('ficha de treino em casa', treino > 0, `${treino} exercícios`);

  const calculo = await sessao.avaliar(`
    document.querySelector('[data-acao="calcular"]').click();
    document.querySelector('#resultado-calculo').scrollIntoView({ block: 'center' });
    const destaque = document.querySelectorAll('#resultado-calculo .resultado-destaque strong');
    return [...destaque].map(e => e.textContent).join(' | ');
  `);
  checar('calculadora metabólica responde', calculo.includes('|'), calculo);
  await print('11-calculadora');

  // --- 9. PWA ---
  resultados.push('PWA');
  const manifest = await fetch(BASE + 'manifest.json').then((r) => r.json());
  checar('manifest com ícones', manifest.icons.length >= 3, `${manifest.icons.length} ícones`);
  const sw = await sessao.avaliar(`
    return navigator.serviceWorker.getRegistrations().then(r => r.length);
  `);
  checar('service worker registrado', sw > 0, `${sw} registro`);

  // --- 10. Console limpo ---
  resultados.push('Console');
  checar('nenhum erro de JavaScript', errosJs.length === 0, errosJs.slice(0, 3).join(' | '));
  const relevantes = falhasDeRede.filter((f) => !f.includes('favicon'));
  checar('nenhuma requisição com erro', relevantes.length === 0, relevantes.slice(0, 3).join(' | '));

  // --- 11. Modo offline ---
  resultados.push('Offline');
  // Segunda visita com a rede desligada: e a promessa central da oferta.
  await sessao.enviar('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await ir('#/receitas');
  const offline = await sessao.avaliar('return document.querySelectorAll(".card-receita").length;');
  checar('catálogo abre sem internet', offline === 120, `${offline} cards offline`);
  const detalheOffline = await sessao.avaliar(`
    location.hash = '#/receita/CL-001';
    return new Promise(r => setTimeout(() => r(document.body.innerText.includes('Modo de preparo')), 400));
  `);
  checar('receita abre sem internet', detalheOffline === true);
  await print('12-offline');
  await sessao.enviar('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });

  // --- Encerramento ---
  console.log(resultados.join('\n'));
  console.log(`\nprints salvos em qa/ | falhas: ${falhas}`);

  sessao.socket.close();
  chrome.kill();
  // O Chrome ainda escreve no perfil enquanto encerra; a limpeza e melhor-esforco.
  await fs.rm(perfil, { recursive: true, force: true, maxRetries: 5 }).catch(() => {});
  process.exit(falhas === 0 ? 0 : 1);
}

principal().catch((erro) => {
  console.error('QA interrompido:', erro.message);
  process.exit(2);
});
