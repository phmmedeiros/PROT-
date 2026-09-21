/* QA automatizado do Prot+.
 *
 * Abre o app em um Chrome headless de 390 x 844, valida a portaria de acesso,
 * entra com uma conta de teste, percorre as 8 telas, executa as interacoes
 * principais e confirma que os dados chegaram ao banco. Salva um print de cada
 * tela em `qa/`.
 *
 * Qualquer erro de JavaScript no console derruba o teste.
 *
 * Como rodar (a partir da raiz do projeto):
 *
 *     node local-preview-server.mjs &
 *     node 03-produto/app/tools/qa-app.mjs
 *
 * A conta de teste entra por senha apenas porque um teste automatizado nao
 * consegue abrir e-mail. As compradoras reais entram por link magico.
 *
 * A senha da conta de teste nao fica no repositorio. Ela esta em
 * `03-produto/supabase/.qa-credenciais`, que o .gitignore mantem de fora:
 *
 *     source 03-produto/supabase/.qa-credenciais
 *     node 03-produto/app/tools/qa-app.mjs
 *
 * Variaveis de ambiente:
 *     BASE        endereco do app (padrao: servidor de preview local)
 *     QA_EMAIL    e-mail da conta de teste
 *     QA_SENHA    senha da conta de teste (obrigatoria)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SAIDA = path.join(APP, 'qa');
const BASE = process.env.BASE || 'http://127.0.0.1:4174/app/';
const EMAIL = process.env.QA_EMAIL || 'qa@prot.teste';
const SENHA = process.env.QA_SENHA;

if (!SENHA) {
  console.error(
    'Falta a senha da conta de teste.\n' +
      'Rode:  source 03-produto/supabase/.qa-credenciais && node 03-produto/app/tools/qa-app.mjs\n' +
      '(o arquivo .qa-credenciais fica fora do Git; peca a copia ao Paulo)'
  );
  process.exit(2);
}
const CHROME =
  process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORTA = 9333;

/* Enquanto um DNS novo nao propaga no resolvedor local, FORCAR_IP manda o
   Chrome falar direto com o servidor certo:
     FORCAR_IP=1.2.3.4 BASE=https://app.exemplo.com/ node tools/qa-app.mjs */
const FORCAR_IP = process.env.FORCAR_IP;
const HOST_BASE = new URL(BASE).hostname;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ *
 * Ligacao com o Chrome (DevTools Protocol)
 * ------------------------------------------------------------------ */

async function encerrarOrfaos() {
  // Uma execucao que quebrou no meio deixa o Chrome vivo na porta de depuracao.
  // Sem isto, a proxima execucao se conecta aquela instancia e herda a sessao,
  // fazendo o teste de portaria mentir.
  try {
    const alvos = await (await fetch(`http://127.0.0.1:${PORTA}/json/version`)).json();
    if (alvos) {
      spawn('pkill', ['-f', `remote-debugging-port=${PORTA}`], { stdio: 'ignore' });
      await espera(1200);
    }
  } catch {
    /* nada rodando, que e o esperado */
  }
}

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
      ...(FORCAR_IP ? [`--host-resolver-rules=MAP ${HOST_BASE} ${FORCAR_IP}`] : []),
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

  async avaliar(expressao) {
    const { result, exceptionDetails } = await this.enviar('Runtime.evaluate', {
      expression: `(async () => { ${expressao} })()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description || 'erro na página');
    }
    return result.value;
  }
}

/* ------------------------------------------------------------------ *
 * Roteiro
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
let processoChrome = null;

function checar(nome, condicao, detalhe = '') {
  const marca = condicao ? '  ok   ' : '  FALHA';
  resultados.push(`${marca} ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
  if (!condicao) falhas++;
}

async function principal() {
  await fs.mkdir(SAIDA, { recursive: true });
  await encerrarOrfaos();
  const perfil = await fs.mkdtemp(path.join(process.env.TMPDIR || '/tmp', 'prot-qa-'));
  const chrome = await abrirChrome(perfil);
  processoChrome = chrome;
  const sessao = await Sessao.conectar();

  const errosJs = [];
  const falhasDeRede = [];

  sessao.ao((mensagem) => {
    if (mensagem.method === 'Runtime.exceptionThrown') {
      errosJs.push(mensagem.params.exceptionDetails.exception?.description || 'exceção');
    }
    if (mensagem.method === 'Runtime.consoleAPICalled' && mensagem.params.type === 'error') {
      errosJs.push(mensagem.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (mensagem.method === 'Network.responseReceived' && mensagem.params.response.status >= 400) {
      falhasDeRede.push(`${mensagem.params.response.status} ${mensagem.params.response.url}`);
    }
  });

  await sessao.enviar('Runtime.enable');
  await sessao.enviar('Page.enable');
  await sessao.enviar('Network.enable');
  await sessao.enviar('Browser.grantPermissions', {
    origin: new URL(BASE).origin,
    permissions: ['notifications'],
  }).catch(() => { /* alguns Chromes headless nao expoem; o teste tolera */ });
  await sessao.enviar('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  /** Aguarda a condicao virar verdadeira na pagina, em vez de cronometrar. */
  async function esperarPor(expressao, limite = 15000) {
    const fim = Date.now() + limite;
    while (Date.now() < fim) {
      try {
        if (await sessao.avaliar(`return !!(${expressao});`)) return true;
      } catch {
        /* pagina ainda trocando de contexto */
      }
      await espera(150);
    }
    return false;
  }

  /** Navega e so devolve quando o app terminou de pintar a tela.
   *
   * Cuidado importante: navegar de `/app/` para `/app/#/receitas` muda apenas o
   * fragmento, e o navegador NAO recarrega a pagina. Sem forcar a recarga, o
   * teste ficaria olhando a tela da carga anterior e mentindo sobre o resultado.
   */
  async function ir(hash = '') {
    const alvo = BASE + hash;
    const atual = await sessao.avaliar('return location.href;').catch(() => '');

    if (atual && atual.split('#')[0] === alvo.split('#')[0]) {
      await sessao.avaliar(`location.hash = ${JSON.stringify(hash || '#/inicio')}; return true;`);
      await sessao.enviar('Page.reload');
    } else {
      await sessao.enviar('Page.navigate', { url: alvo });
    }

    await esperarPor(
      "document.querySelector('#view') && !document.querySelector('#view .carregando') && document.querySelector('#view').innerHTML.length > 200"
    );
    await espera(300);
  }

  /** Clica so depois que o elemento existir de fato. */
  async function clicar(seletor) {
    const achou = await esperarPor(`document.querySelector(${JSON.stringify(seletor)})`);
    if (!achou) throw new Error(`elemento não apareceu: ${seletor}`);
    return sessao.avaliar(`document.querySelector(${JSON.stringify(seletor)}).click(); return true;`);
  }

  async function print(arquivo) {
    const { data } = await sessao.enviar('Page.captureScreenshot', { format: 'png' });
    await fs.writeFile(path.join(SAIDA, `${arquivo}.png`), Buffer.from(data, 'base64'));
  }

  // --- 1. Portaria ---
  resultados.push('Portaria de acesso');
  await ir();
  const semSessao = await sessao.avaliar('return document.body.innerText;');
  checar('visitante sem sessão vê o login', semSessao.includes('Entre com o seu e-mail'));
  checar(
    'visitante sem sessão NÃO vê o catálogo',
    !semSessao.includes('Catálogo de receitas') && !semSessao.includes('Chef do dia')
  );
  await print('00-login');

  // --- 2. Entrar ---
  const entrou = await sessao.avaliar(`
    const { error } = await window.ProtConta.cliente.auth.signInWithPassword({
      email: ${JSON.stringify(EMAIL)}, password: ${JSON.stringify(SENHA)}
    });
    return error ? error.message : 'ok';
  `);
  checar('conta de teste entra', entrou === 'ok', entrou);
  if (entrou !== 'ok') {
    console.log(resultados.join('\n'));
    console.log('\nQA interrompido: sem sessão não há o que testar.');
    chrome.kill();
    process.exit(1);
  }

  // --- 2b. Estado limpo ---
  // Sem isto a suite nao e repetivel: favoritar duas vezes desfavorita, e o
  // consumo do dia acumula entre execucoes.
  const limpou = await sessao.avaliar(`
    const sb = window.ProtConta.cliente;
    const uid = (await sb.auth.getUser()).data.user.id;
    await sb.from('favoritos').delete().eq('usuario_id', uid);
    await sb.from('despensa').delete().eq('usuario_id', uid);
    await sb.from('consumo').delete().eq('usuario_id', uid);
    await sb.from('semanas').delete().eq('usuario_id', uid);
    await sb.from('perfis').update({
      nome: null, meta_proteina: 140, objetivo: 'recomposicao', faixa: 'medio',
      peso_kg: null, boas_vindas_em: null, lembrete_hora: null
    }).eq('id', uid);
    await sb.from('push_assinaturas').delete().eq('usuario_id', uid);
    localStorage.removeItem('prot-convite-instalar-dispensado');
    localStorage.removeItem('prot-compras-marcadas');
    Object.keys(localStorage)
      .filter(k => k.startsWith('prot-plus-cache:'))
      .forEach(k => localStorage.removeItem(k));
    const { data } = await sb.from('favoritos').select('receita_id');
    return data.length;
  `);
  checar('dados da conta de teste zerados', limpou === 0, `${limpou} favoritos restantes`);

  // --- 2c. Primeiro acesso guiado ---
  resultados.push('Primeiro acesso');
  await ir('#/inicio');
  const boasVindas = await sessao.avaliar('return document.body.innerText;');
  checar('primeiro acesso mostra as boas-vindas', boasVindas.includes('Bem-vinda ao Prot+'));
  checar('boas-vindas escondem o app', !boasVindas.includes('Chef do dia'));

  const previa = await sessao.avaliar(`
    const campo = document.querySelector('#peso-inicial');
    campo.value = '70';
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelector('#previa-meta').textContent;
  `);
  checar('prévia da meta enquanto digita', previa.includes('126'), previa);

  const aposBoasVindas = await sessao.avaliar(`
    document.querySelector('#form-boas-vindas').requestSubmit();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('perfis').select('meta_proteina, peso_kg, boas_vindas_em').maybeSingle();
    return JSON.stringify({ meta: data?.meta_proteina, peso: Number(data?.peso_kg), vistas: !!data?.boas_vindas_em,
      home: document.body.innerText.includes('Chef do dia') });
  `);
  const bv = JSON.parse(aposBoasVindas);
  checar('peso 70 kg vira meta 126 g no banco', bv.meta === 126 && bv.peso === 70, `meta ${bv.meta}, peso ${bv.peso}`);
  checar('boas-vindas marcadas como vistas', bv.vistas === true);
  checar('depois das boas-vindas abre o Início', bv.home === true);

  await ir('#/inicio');
  const semRepetir = await sessao.avaliar('return document.body.innerText.includes("Bem-vinda ao Prot+");');
  checar('boas-vindas não aparecem de novo', semRepetir === false);

  // --- 2d. Tela inicial: convite, nome, ajuda ---
  resultados.push('Início');
  const convite = await sessao.avaliar('return document.querySelectorAll(".convite-instalar").length;');
  checar('convite para instalar aparece uma vez', convite === 1);
  const conviteDispensado = await sessao.avaliar(`
    document.querySelector('[data-acao="dispensar-convite"]').click();
    return document.querySelectorAll('.convite-instalar').length;
  `);
  checar('"Agora não" some com o convite', conviteDispensado === 0);
  await ir('#/inicio');
  const conviteVoltou = await sessao.avaliar('return document.querySelectorAll(".convite-instalar").length;');
  checar('convite não volta depois de dispensado', conviteVoltou === 0);

  const nomeSalvo = await sessao.avaliar(`
    document.querySelector('[data-acao="editar-nome"]').click();
    const campo = document.querySelector('#campo-nome');
    if (!campo) return 'sem campo inline';
    campo.value = 'Ana';
    document.querySelector('#form-nome').requestSubmit();
    await new Promise(r => setTimeout(r, 1800));
    const { data } = await window.ProtConta.cliente.from('perfis').select('nome').maybeSingle();
    return (data?.nome || '') + '|' + (document.querySelector('.hero h2')?.textContent.includes('Ana') ? 'na tela' : 'fora da tela');
  `);
  checar('nome pelo campo na tela grava no banco', nomeSalvo === 'Ana|na tela', nomeSalvo);

  const ajuda = await sessao.avaliar('return !!document.querySelector(\'.rodape-conta a[href^="mailto:"]\');');
  checar('link "Precisa de ajuda?" na tela inicial', ajuda === true);

  // --- 3. Telas ---
  resultados.push('Telas (390 x 844)');
  for (const tela of TELAS) {
    await ir(tela.hash);
    const texto = await sessao.avaliar('return document.body.innerText;');
    const achou = texto.includes(tela.contem);
    // Quando falha, o que apareceu na tela importa mais do que o que faltou.
    checar(
      tela.arquivo,
      achou,
      achou ? `"${tela.contem}"` : `tela mostrou: ${texto.replace(/\s+/g, ' ').slice(0, 110)}`
    );
    await print(tela.arquivo);
  }

  // --- 3b. Separacao entre cliente e administrador ---
  resultados.push('Administradores');
  const ehAdmin = await sessao.avaliar(`
    const { data } = await window.ProtConta.cliente.rpc('sou_admin');
    return data;
  `);
  checar('conta de compradora NÃO é administradora', ehAdmin === false, `sou_admin = ${ehAdmin}`);

  const tarja = await sessao.avaliar(`
    return document.querySelectorAll('.tarja-admin').length;
  `);
  checar('compradora não vê a tarja de administrador', tarja === 0, `${tarja} tarjas`);

  // --- 3c. Receita: cozinhando com o celular ---
  resultados.push('Receita');
  await ir('#/receita/AJ-001');
  const barra = await sessao.avaliar('return !!document.querySelector(".barra-fixa [data-acao=\'adicionar-consumo\']");');
  checar('botão de registrar preso na base da tela', barra === true);

  const porcoes = await sessao.avaliar(`
    const antes = document.querySelector('.ingrediente span').textContent;
    document.querySelector('[data-acao="escolher-porcoes"][data-valor="2"]').click();
    await new Promise(r => setTimeout(r, 200));
    const depois = document.querySelector('.ingrediente span').textContent;
    const macros = document.querySelector('.grade-macros .macro strong').textContent;
    return antes + ' -> ' + depois + ' | kcal por porção: ' + macros;
  `);
  checar('2 porções dobra os ingredientes e mantém macros por porção',
    porcoes.startsWith('120 g') && porcoes.includes('-> 240 g') && porcoes.includes('341'), porcoes);

  const passo = await sessao.avaliar(`
    window.scrollTo(0, 400);
    const li = document.querySelectorAll('.passos li')[1];
    li.click();
    const marcou = li.classList.contains('atual');
    const rolou = window.scrollY;
    li.click();
    const desmarcou = !li.classList.contains('atual');
    return JSON.stringify({ marcou, desmarcou, manteveRolagem: rolou >= 300 });
  `);
  const ps = JSON.parse(passo);
  checar('toque marca o passo atual', ps.marcou === true);
  checar('segundo toque desmarca', ps.desmarcou === true);
  checar('marcar passo não rola a tela para o topo', ps.manteveRolagem === true);

  // --- 4. Catálogo ---
  resultados.push('Catálogo');
  await ir('#/receitas');
  const totalCards = await sessao.avaliar(
    'return document.querySelectorAll(".card-receita").length;'
  );
  checar('120 receitas no catálogo', totalCards === 120, `${totalCards} cards`);

  const busca = await sessao.avaliar(`
    const campo = document.querySelector('#busca');
    campo.value = 'frango';
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelectorAll('.card-receita').length;
  `);
  checar('busca por "frango"', busca > 0 && busca < 120, `${busca} resultados`);

  const sobremesas = await sessao.avaliar(`
    const campo = document.querySelector('#busca');
    campo.value = '';
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-acao="filtrar-categoria"][data-valor="sobremesas"]').click();
    return document.querySelectorAll('.card-receita').length;
  `);
  checar('filtro de sobremesas', sobremesas === 30, `${sobremesas} receitas`);

  // --- 5. Favoritos chegam ao banco ---
  resultados.push('Sincronização');
  const favoritoNoBanco = await sessao.avaliar(`
    document.querySelector('[data-acao="filtrar-categoria"][data-valor="todas"]').click();
    document.querySelector('.botao-favorito').click();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('favoritos').select('receita_id');
    return data ? data.length : -1;
  `);
  checar('favoritar grava no banco', favoritoNoBanco === 1, `${favoritoNoBanco} linha`);

  const metaNoBanco = await sessao.avaliar(`
    location.hash = '#/monitor';
    await new Promise(r => setTimeout(r, 600));
    document.querySelector('#peso').value = '70';
    document.querySelector('[data-acao="meta-por-peso"]').click();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('perfis').select('meta_proteina').maybeSingle();
    return data ? data.meta_proteina : -1;
  `);
  checar('meta pelo peso grava no banco', metaNoBanco === 126, `${metaNoBanco} g`);

  // --- 5b. Lembrete diário (Web Push) ---
  resultados.push('Lembrete diário');
  const painel = await sessao.avaliar(`
    return JSON.stringify({
      painel: !!document.querySelector('#painel-lembrete'),
      horas: document.querySelectorAll('#lembrete-hora option').length,
      suporte: window.ProtConta.suportaPush(),
    });
  `);
  const pl = JSON.parse(painel);
  checar('painel do lembrete no Monitor', pl.painel === true);
  checar('24 horas para escolher', pl.horas === 24 || !pl.suporte, `${pl.horas} opções, suporte=${pl.suporte}`);

  const ligou = await sessao.avaliar(`
    const sel = document.querySelector('#lembrete-hora');
    if (!sel) return JSON.stringify({ caminho: 'sem-suporte' });
    sel.value = '15';
    document.querySelector('[data-acao="ligar-lembrete"]').click();
    await new Promise(r => setTimeout(r, 4500));
    const sb = window.ProtConta.cliente;
    const { data: p } = await sb.from('perfis').select('lembrete_hora').maybeSingle();
    const { data: a } = await sb.from('push_assinaturas').select('endpoint');
    const aviso = document.querySelector('#aviso')?.textContent || '';
    return JSON.stringify({ caminho: p?.lembrete_hora === 15 ? 'assinou' : 'recusou',
      hora: p?.lembrete_hora, assinaturas: (a || []).length, aviso });
  `);
  const lg = JSON.parse(ligou);
  if (lg.caminho === 'assinou') {
    checar('ligar lembrete grava a hora no banco', lg.hora === 15, `${lg.hora}h`);
    checar('assinatura push guardada na conta', lg.assinaturas >= 1, `${lg.assinaturas} aparelho(s)`);
  } else {
    // Sem servico de push (Chrome headless), o app precisa recusar com aviso
    // claro e NAO gravar a hora — nunca prometer um lembrete que nao vai chegar.
    checar('sem push disponível, o app avisa e não liga o lembrete',
      lg.hora == null && /não foi possível|permissão|não permite/i.test(lg.aviso),
      `${lg.caminho}: ${lg.aviso || '(sem aviso)'}`);
  }

  const desligou = await sessao.avaliar(`
    const b = document.querySelector('[data-acao="desligar-lembrete"]');
    if (!b) return 'nao-estava-ligado';
    b.click();
    await new Promise(r => setTimeout(r, 2500));
    const { data: p } = await window.ProtConta.cliente.from('perfis').select('lembrete_hora').maybeSingle();
    const { data: a } = await window.ProtConta.cliente.from('push_assinaturas').select('endpoint');
    return p?.lembrete_hora == null && (a || []).length === 0 ? 'desligado' : 'ainda ' + p?.lembrete_hora + '/' + (a || []).length;
  `);
  checar('desligar lembrete limpa hora e assinatura', desligou === 'desligado' || desligou === 'nao-estava-ligado', desligou);

  const consumoNoBanco = await sessao.avaliar(`
    location.hash = '#/receita/AJ-001';
    await new Promise(r => setTimeout(r, 700));
    document.querySelector('[data-acao="adicionar-consumo"]').click();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('consumo').select('receita_id');
    return data ? data.map(l => l.receita_id).join(',') : 'erro';
  `);
  checar('consumo do dia grava no banco', consumoNoBanco === 'AJ-001', consumoNoBanco);

  const semanaNoBanco = await sessao.avaliar(`
    location.hash = '#/semana';
    await new Promise(r => setTimeout(r, 900));
    document.querySelector('[data-acao="escolher-objetivo"][data-valor="secar"]').click();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('semanas').select('objetivo, dias').maybeSingle();
    if (!data) return 'sem linha';
    const ids = data.dias.flatMap(d => Object.values(d));
    return data.objetivo + '/' + ids.length + '/' + new Set(ids).size;
  `);
  checar(
    'cardápio da semana grava no banco',
    semanaNoBanco === 'secar/28/28',
    `${semanaNoBanco} (objetivo/refeições/distintas)`
  );

  const comi = await sessao.avaliar(`
    const sb = window.ProtConta.cliente;
    const { data: antes } = await sb.from('consumo').select('receita_id');
    document.querySelector('[data-acao="comi-refeicao"]').click();
    await new Promise(r => setTimeout(r, 1800));
    const { data: depois } = await sb.from('consumo').select('receita_id');
    return JSON.stringify({ antes: antes.length, depois: depois.length,
      registrada: document.querySelectorAll('.botao-trocar.registrada').length });
  `);
  const cm = JSON.parse(comi);
  checar('"Comi" no cardápio grava no consumo do dia', cm.depois === cm.antes + 1, `${cm.antes} -> ${cm.depois}`);
  checar('refeição registrada muda de estado na tela', cm.registrada >= 1);

  const marcada = await sessao.avaliar(`
    document.querySelector('[data-acao="gerar-lista"]').click();
    const caixa = document.querySelector('#folha input[data-compra]');
    if (!caixa) return JSON.stringify({ erro: 'sem caixas na lista' });
    caixa.checked = true;
    caixa.dispatchEvent(new Event('change', { bubbles: true }));
    const riscou = caixa.closest('li').classList.contains('marcada');
    document.querySelector('[data-acao="fechar-folha"]').click();
    document.querySelector('[data-acao="gerar-lista"]').click();
    const voltou = document.querySelector('#folha li.marcada') !== null;
    document.querySelector('[data-acao="limpar-compras"]').click();
    const limpou = document.querySelectorAll('#folha li.marcada').length === 0;
    document.querySelector('[data-acao="fechar-folha"]').click();
    return JSON.stringify({ riscou, voltou, limpou });
  `);
  const mk = JSON.parse(marcada);
  checar('marcar item da lista de compras risca o item', mk.riscou === true, mk.erro || '');
  checar('marcação sobrevive a fechar e reabrir a lista', mk.voltou === true);
  checar('"Desmarcar tudo" limpa as marcações', mk.limpou === true);

  const despensaNoBanco = await sessao.avaliar(`
    location.hash = '#/despensa';
    await new Promise(r => setTimeout(r, 900));
    document.querySelector('[data-acao="alternar-ingrediente"][data-valor="ovo"]').click();
    await new Promise(r => setTimeout(r, 1800));
    const sb = window.ProtConta.cliente;
    const { data } = await sb.from('despensa').select('ingrediente');
    return data ? data.map(l => l.ingrediente).join(',') : 'erro';
  `);
  checar('despensa grava no banco', despensaNoBanco === 'ovo', despensaNoBanco);

  // Ingrediente digitado pela pessoa: nao esta nos 39 do acervo, entao so
  // existe em `despensa`. Precisa voltar como chip em outro aparelho.
  await sessao.avaliar(`
    document.querySelector('#novo-ingrediente').value = 'iogurte natural';
    document.querySelector('[data-acao="adicionar-ingrediente"]').click();
    await new Promise(r => setTimeout(r, 1800));
    return true;
  `);
  await sessao.avaliar(`
    const id = (await window.ProtConta.cliente.auth.getUser()).data.user.id;
    localStorage.removeItem('prot-plus-cache:' + id);
    return true;
  `);
  await ir('#/despensa');
  const chipVoltou = await sessao.avaliar(`
    return [...document.querySelectorAll('.chip.ativo')].some(c => c.textContent.includes('iogurte natural'));
  `);
  checar('ingrediente digitado volta do servidor sem cache', chipVoltou === true);

  // --- 6. Os dados voltam depois de recarregar ---
  resultados.push('Persistência');
  const aposRecarregar = await sessao.avaliar(`
    localStorage.removeItem('prot-plus-cache:' + (await window.ProtConta.cliente.auth.getUser()).data.user.id);
    return 'cache limpo';
  `);
  checar('cache local limpo para o teste', aposRecarregar === 'cache limpo');

  await ir('#/monitor');
  const veioDoServidor = await sessao.avaliar(`
    const texto = document.body.innerText;
    return JSON.stringify({
      meta: texto.includes('126'),
      consumo: texto.includes('Bowl') || texto.includes('Frango'),
    });
  `);
  const voltou = JSON.parse(veioDoServidor);
  checar('meta volta do servidor sem cache', voltou.meta === true);
  checar('consumo volta do servidor sem cache', voltou.consumo === true);
  await print('08-monitor');

  // --- 7. Isolamento entre contas no mesmo aparelho ---
  resultados.push('Isolamento');
  const aposSair = await sessao.avaliar(`
    const id = (await window.ProtConta.cliente.auth.getUser()).data.user.id;
    await window.ProtConta.cliente.auth.signOut();
    window.ProtConta.limparCache();
    return localStorage.getItem('prot-plus-cache:' + id) === null ? 'limpo' : 'sobrou';
  `);
  checar('sair apaga o cache do aparelho', aposSair === 'limpo', aposSair);

  await ir();
  const deVoltaAoLogin = await sessao.avaliar('return document.body.innerText;');
  checar(
    'depois de sair, volta para o login',
    deVoltaAoLogin.includes('Entre com o seu e-mail') &&
      !deVoltaAoLogin.includes('Catálogo de receitas')
  );

  // --- 8. Bônus (exigem sessão, então entramos de novo) ---
  resultados.push('Bônus');
  await sessao.avaliar(`
    await window.ProtConta.cliente.auth.signInWithPassword({
      email: ${JSON.stringify(EMAIL)}, password: ${JSON.stringify(SENHA)}
    });
    return 'ok';
  `);
  await ir('#/bonus');
  await clicar('[data-acao="escolher-local"][data-valor="casa"]');
  const treino = await sessao.avaliar(
    'return document.querySelectorAll(".lista-exercicios li").length;'
  );
  checar('ficha de treino em casa', treino > 0, `${treino} exercícios`);

  await clicar('[data-acao="calcular"]');
  const calculo = await sessao.avaliar(`
    document.querySelector('#resultado-calculo').scrollIntoView({ block: 'center' });
    return [...document.querySelectorAll('#resultado-calculo .resultado-destaque strong')]
      .map(e => e.textContent).join(' | ');
  `);
  checar('calculadora metabólica', calculo.includes('|'), calculo);
  await print('11-calculadora');

  // --- 8.1 Estante (a conta de QA nao tem nenhum bump: tudo deve vir trancado) ---
  resultados.push('Estante');
  const chamada = await sessao.avaliar(
    "return document.querySelector('.chamada-estante')?.getAttribute('href') || '';"
  );
  checar('Bônus leva para a Estante', chamada === '#/estante', chamada || 'sem chamada');

  await ir('#/estante');
  const livros = await sessao.avaliar('return document.querySelectorAll(".livro:not(.extra)").length;');
  checar('Estante lista os livros em PDF', livros === 4, `${livros} livros`);

  // Os PDFs sao buscados pela propria pagina: assim o teste confere o caminho
  // relativo `../pdf/` exatamente como o navegador da cliente vai resolve-lo.
  const pdfs = await sessao.avaliar(`
    const links = [...document.querySelectorAll('.livro:not(.extra) .livro-acao')];
    const status = await Promise.all(links.map(async (a) => {
      try { const r = await fetch(a.href, { method: 'HEAD' }); return r.status; }
      catch { return 0; }
    }));
    return status.join(',');
  `);
  checar('todo livro abre de verdade', pdfs === '200,200,200,200', pdfs);

  const extras = await sessao.avaliar(`
    return [
      document.querySelectorAll('.livro.extra').length,
      document.querySelectorAll('.livro.extra.trancado').length,
      document.querySelectorAll('.livro.extra.meu').length,
    ].join('/');
  `);
  checar('extras aparecem trancados para quem não comprou', extras === '3/3/0', `${extras} (total/trancados/meus)`);
  await print('13-estante');

  // O print de cima mostra os livros; a logica nova mora nos extras, entao
  // vale um segundo print ja rolado ate eles.
  await sessao.avaliar(
    "document.querySelector('.livro.extra')?.scrollIntoView({ block: 'start' }); return 'ok';"
  );
  await print('14-extras');

  // --- 9. PWA ---
  resultados.push('PWA');
  // Buscado pela propria pagina, e nao pelo Node: assim o teste usa a mesma
  // origem e a mesma rede que o app, sem depender do resolvedor da maquina.
  const icones = await sessao.avaliar(`
    const r = await fetch('manifest.json');
    if (!r.ok) return -1;
    const m = await r.json();
    return (m.icons || []).length;
  `);
  checar('manifest com ícones', icones >= 3, `${icones} ícones`);
  const sw = await sessao.avaliar(
    'return (await navigator.serviceWorker.getRegistrations()).length;'
  );
  checar('service worker registrado', sw > 0, `${sw} registro`);

  // --- 10. Sem internet ---
  resultados.push('Sem internet');
  // Decisão do projeto: o acesso exige conexão. O esperado aqui é uma tela de
  // recado clara, nunca o catálogo aberto nem uma tela em branco.
  await sessao.enviar('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  // Precisa passar por ir(), que forca recarga de verdade: navegar so para
  // outro fragmento manteria a tela anterior e o teste leria o passado.
  await ir('#/receitas');
  await esperarPor("document.body.classList.contains('sem-sessao')", 20000);
  const offline = await sessao.avaliar('return document.body.innerText;');
  checar(
    'sem internet explica o que houve',
    offline.includes('Sem conexão'),
    offline.split('\n').filter(Boolean).slice(0, 2).join(' / ') || '(tela vazia)'
  );
  await print('12-sem-internet');
  await sessao.enviar('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });

  // --- 11. Console ---
  resultados.push('Console');
  checar('nenhum erro de JavaScript', errosJs.length === 0, errosJs.slice(0, 3).join(' | '));
  const relevantes = falhasDeRede.filter(
    (f) => !f.includes('favicon') && !/\/auth\/v1\/(token|otp)/.test(f)
  );
  checar('nenhuma requisição com erro', relevantes.length === 0, relevantes.slice(0, 3).join(' | '));

  console.log(resultados.join('\n'));
  console.log(`\nprints salvos em qa/ | falhas: ${falhas}`);

  sessao.socket.close();
  chrome.kill();
  await fs.rm(perfil, { recursive: true, force: true, maxRetries: 5 }).catch(() => {});
  process.exit(falhas === 0 ? 0 : 1);
}

principal().catch(async (erro) => {
  processoChrome?.kill();
  // Mesmo interrompido, o que ja foi verificado precisa aparecer: e isso que
  // mostra em que ponto o roteiro parou.
  if (resultados.length) console.log(resultados.join('\n'));
  console.error(`\nQA interrompido em "${resultados.at(-1) ?? 'inicio'}": ${erro.message}`);
  process.exit(2);
});
