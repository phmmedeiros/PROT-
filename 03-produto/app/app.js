/* Prot+ — aplicativo de receitas proteicas.
 *
 * JavaScript puro, sem dependências. A organização do arquivo é:
 *
 *   1. Constantes e utilitários
 *   2. Estado salvo no aparelho (localStorage)
 *   3. Carregamento dos dados
 *   4. Componentes reutilizáveis de HTML
 *   5. As 8 telas
 *   6. Roteador por hash e eventos delegados
 *   7. Instalação na tela inicial e service worker
 *
 * Toda a navegação passa pelo hash da URL (#/receitas, #/receita/CL-001, ...),
 * para que o botão "voltar" do celular funcione dentro do app instalado.
 */

'use strict';

/* ------------------------------------------------------------------ *
 * 1. Constantes e utilitários
 * ------------------------------------------------------------------ */

const CATEGORIAS = {
  'cafe-lanches': { nome: 'Café & lanches', curto: 'Café', emoji: '🥣' },
  'almoco-jantar': { nome: 'Almoço & jantar', curto: 'Almoço', emoji: '🍲' },
  sobremesas: { nome: 'Sobremesas', curto: 'Doces', emoji: '🍓' },
};

/* As faixas do Seletor Turbo seguem o blueprint. A faixa leve começa em 0 para
   que nenhuma das receitas do acervo fique fora de alguma faixa. */
const FAIXAS = [
  { id: 'leve', nome: 'Leve & Prático', descricao: 'Até 25 g de proteína', min: 0, max: 25, cor: '#4c9f6a' },
  { id: 'medio', nome: 'Médio & Equilibrado', descricao: '26 g a 40 g de proteína', min: 26, max: 40, cor: '#e8b23f' },
  { id: 'super', nome: 'Super Anabólico', descricao: '41 g de proteína ou mais', min: 41, max: Infinity, cor: '#d95f3b' },
];

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const REFEICOES = [
  { id: 'cafe', nome: 'Café da manhã', categorias: ['cafe-lanches'] },
  { id: 'almoco', nome: 'Almoço', categorias: ['almoco-jantar'] },
  { id: 'lanche', nome: 'Lanche da tarde', categorias: ['cafe-lanches', 'sobremesas'] },
  { id: 'jantar', nome: 'Jantar', categorias: ['almoco-jantar'] },
];

const OBJETIVOS = [
  { id: 'secar', nome: 'Queima de gordura', resumo: 'Prioriza pratos com mais proteína por caloria.' },
  { id: 'hipertrofia', nome: 'Hipertrofia', resumo: 'Prioriza os pratos de maior proteína absoluta.' },
  { id: 'recomposicao', nome: 'Recomposição corporal', resumo: 'Equilibra proteína alta e calorias moderadas.' },
];

/* Agrupamento dos 39 ingredientes do acervo para o Radar de Despensa. */
const GRUPOS_DESPENSA = [
  { nome: 'Proteínas', itens: ['ovo', 'peito de frango cozido e desfiado', 'carne bovina moída magra cozida', 'filé de tilápia grelhado', 'lombo suíno assado', 'atum em água drenado', 'sardinha em conserva drenada'] },
  { nome: 'Laticínios', itens: ['queijo cottage', 'ricota', 'queijo muçarela', 'leite em pó desnatado', 'leite desnatado'] },
  { nome: 'Grãos e massas', itens: ['aveia em flocos', 'arroz integral cozido', 'macarrão integral cozido', 'feijão carioca cozido', 'grão-de-bico cozido', 'milho para cuscuz cozido', 'goma de tapioca', 'pão integral', 'batata-doce cozida'] },
  { nome: 'Legumes e verduras', itens: ['tomate', 'brócolis cozido', 'cenoura crua ralada', 'abóbora cabotiá cozida', 'espinafre cru', 'alface', 'cebolinha', 'salsinha', 'coentro'] },
  { nome: 'Frutas', itens: ['banana-prata', 'morango', 'maçã com casca', 'suco de limão'] },
  { nome: 'Complementos', itens: ['cacau em pó', 'amendoim torrado sem sal', 'chia', 'canela em pó', 'orégano'] },
];

const $ = (seletor) => document.querySelector(seletor);

const esc = (valor) =>
  String(valor).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const macros = (receita) => receita['por_porção'];
const proteina = (receita) => macros(receita)['proteína_g'];
const calorias = (receita) => macros(receita).calorias;

const arredondar = (numero, casas = 1) => Number(numero.toFixed(casas));

const hoje = () => new Date().toISOString().slice(0, 10);

const foto = (id, tamanho) => `images/${tamanho}/${id}.webp`;

/** Se a versão WebP faltar, o app cai para o PNG original em vez de quebrar. */
const FALLBACK_FOTO = `onerror="this.onerror=null;this.src='images/'+this.dataset.id+'.png'"`;

/* ------------------------------------------------------------------ *
 * 2. Estado salvo no aparelho
 * ------------------------------------------------------------------ */

const CHAVE = 'prot-plus-v3';

const PADRAO = {
  nome: '',
  meta: 140,
  favoritos: [],
  consumo: { data: '', itens: [] },
  despensa: [],
  extras: [],
  semana: null,
  faixa: 'medio',
  objetivo: 'recomposicao',
};

function carregarEstado() {
  let salvo = {};
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}');
  } catch (erro) {
    salvo = {};
  }
  const estado = { ...PADRAO, ...salvo };

  // O contador de proteína é do dia: virou a data, a lista zera sozinha.
  if (!estado.consumo || estado.consumo.data !== hoje()) {
    estado.consumo = { data: hoje(), itens: [] };
  }
  return estado;
}

const estado = carregarEstado();

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (erro) {
    /* Navegação privada pode bloquear a escrita; o app continua funcionando. */
  }
}

/* ------------------------------------------------------------------ *
 * 3. Dados
 * ------------------------------------------------------------------ */

const dados = { receitas: [], dicas: {}, bonus: null };

const porId = (id) => dados.receitas.find((receita) => receita.id === id);

async function carregarDados() {
  const [receitas, dicas, bonus] = await Promise.all([
    fetch('../dados/receitas.json').then((r) => r.json()),
    fetch('../dados/dicas-chef.json').then((r) => r.json()).catch(() => ({})),
    fetch('../dados/bonus.json').then((r) => r.json()),
  ]);
  dados.receitas = receitas;
  dados.dicas = dicas;
  dados.bonus = bonus;
}

/* ------------------------------------------------------------------ *
 * 4. Componentes reutilizáveis
 * ------------------------------------------------------------------ */

function cardReceita(receita) {
  const favorito = estado.favoritos.includes(receita.id);
  return `
    <article class="card-receita">
      <a class="capa" href="#/receita/${receita.id}" aria-label="${esc(receita.nome)}">
        <img src="${foto(receita.id, 'w400')}" data-id="${receita.id}" alt="${esc(receita.nome)}"
             loading="lazy" decoding="async" width="400" height="300" ${FALLBACK_FOTO}>
        <span class="selo-tempo">⏱ ${receita.tempo} min</span>
      </a>
      <button type="button" class="botao-favorito ${favorito ? 'ativo' : ''}"
              data-acao="favoritar" data-id="${receita.id}"
              aria-pressed="${favorito}" aria-label="Favoritar ${esc(receita.nome)}">${favorito ? '★' : '☆'}</button>
      <div class="card-corpo">
        <h3><a href="#/receita/${receita.id}">${esc(receita.nome)}</a></h3>
        <div class="card-macros">
          <span class="proteina">🍗 ${proteina(receita)} g</span>
          <span>${calorias(receita)} kcal</span>
        </div>
      </div>
    </article>`;
}

function linhaReceita(receita, complemento = '') {
  return `
    <a class="linha" href="#/receita/${receita.id}">
      <img src="${foto(receita.id, 'w400')}" data-id="${receita.id}" alt="" loading="lazy"
           width="52" height="52" ${FALLBACK_FOTO}>
      <span class="linha-corpo">
        <strong>${esc(receita.nome)}</strong>
        <small>${complemento || `${receita.tempo} min · ${calorias(receita)} kcal`}</small>
      </span>
      <span class="proteina">${proteina(receita)} g</span>
    </a>`;
}

function anelProgresso(percentual, texto, legenda) {
  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = circunferencia * (1 - Math.min(100, percentual) / 100);
  return `
    <div class="anel">
      <svg width="104" height="104" viewBox="0 0 104 104" role="img"
           aria-label="${esc(legenda)}">
        <circle class="anel-trilho" cx="52" cy="52" r="${raio}"></circle>
        <circle class="anel-valor" cx="52" cy="52" r="${raio}"
                stroke-dasharray="${circunferencia.toFixed(1)}"
                stroke-dashoffset="${preenchido.toFixed(1)}"></circle>
      </svg>
      <div>
        <strong class="anel-texto">${texto}</strong>
        <small class="apagado">${esc(legenda)}</small>
      </div>
    </div>`;
}

/** Soma o que já foi registrado no Monitor Diário de hoje. */
function totalDoDia() {
  return estado.consumo.itens.reduce(
    (soma, id) => {
      const receita = porId(id);
      if (!receita) return soma;
      soma.proteina += proteina(receita);
      soma.calorias += calorias(receita);
      return soma;
    },
    { proteina: 0, calorias: 0 }
  );
}

/* ------------------------------------------------------------------ *
 * 5. Telas
 * ------------------------------------------------------------------ */

/* --- Tela 1: Início / Dashboard --- */

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function telaInicio() {
  const total = totalDoDia();
  const percentual = estado.meta > 0 ? (total.proteina / estado.meta) * 100 : 0;
  // Receita em destaque: muda a cada dia, igual para o dia inteiro.
  const indice = Math.floor(Date.now() / 86400000) % dados.receitas.length;
  const chef = dados.receitas[indice];
  return `
    <section class="hero">
      <span class="eyebrow apagado">${saudacao()}</span>
      <h2>${estado.nome ? `${esc(estado.nome)}, comer bem pode ser simples.` : 'Comer bem pode ser simples.'}</h2>
      <p>Escolha uma receita, monte sua semana e acompanhe sua proteína sem complicação.</p>
      <p style="margin:8px 0 0">
        <button type="button" class="hero-nome" data-acao="editar-nome">
          ${estado.nome ? `Você é ${esc(estado.nome)} — trocar o nome` : 'Personalizar com o seu nome'}
        </button>
      </p>
    </section>

    <section class="painel">
      <div class="titulo-secao">
        <h2>Monitor Diário</h2>
        <a class="chip" href="#/monitor">Abrir</a>
      </div>
      ${anelProgresso(
        percentual,
        `${arredondar(total.proteina)} g`,
        `de ${estado.meta} g · ${Math.round(percentual)}% da meta`
      )}
    </section>

    <div class="titulo-secao"><h2>Acesso rápido</h2></div>
    <div class="grade-atalhos">
      <a class="atalho" href="#/turbo"><span aria-hidden="true">⚡</span>Seletor Turbo<small>Filtrar por proteína</small></a>
      <a class="atalho" href="#/despensa"><span aria-hidden="true">🧊</span>Radar de Despensa<small>Usar o que tem em casa</small></a>
      <a class="atalho" href="#/semana"><span aria-hidden="true">🗓</span>Semana Blindada<small>Cardápio de 7 dias</small></a>
      <a class="atalho" href="#/monitor"><span aria-hidden="true">📈</span>Monitor Diário<small>Meta de proteína</small></a>
    </div>

    <div class="titulo-secao"><h2>Categorias</h2></div>
    <div class="chips rolagem">
      ${Object.entries(CATEGORIAS)
        .map(([id, c]) => `<a class="chip" href="#/receitas?cat=${id}">${c.emoji} ${c.nome}</a>`)
        .join('')}
      <a class="chip" href="#/receitas?fav=1">★ Favoritas</a>
    </div>

    <div class="titulo-secao">
      <h2>Chef do dia</h2>
      <span class="apagado pequeno">${chef.tempo} min · ${CATEGORIAS[chef.categoria].nome}</span>
    </div>
    <div class="grade-receitas">${cardReceita(chef)}</div>`;
}

/* --- Tela 2: Catálogo de receitas --- */

const filtros = { busca: '', categoria: 'todas', faixa: 'todas', favoritos: false, ordem: 'padrao' };

function receitasFiltradas() {
  const busca = filtros.busca.trim().toLowerCase();
  const faixa = FAIXAS.find((f) => f.id === filtros.faixa);

  const lista = dados.receitas.filter((receita) => {
    if (filtros.categoria !== 'todas' && receita.categoria !== filtros.categoria) return false;
    if (filtros.favoritos && !estado.favoritos.includes(receita.id)) return false;
    if (faixa && (proteina(receita) < faixa.min || proteina(receita) > faixa.max)) return false;
    if (busca) {
      const alvo = `${receita.nome} ${receita.ingredientes.map((i) => i.item).join(' ')}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    return true;
  });

  if (filtros.ordem === 'proteina') lista.sort((a, b) => proteina(b) - proteina(a));
  if (filtros.ordem === 'tempo') lista.sort((a, b) => a.tempo - b.tempo);
  if (filtros.ordem === 'calorias') lista.sort((a, b) => calorias(a) - calorias(b));
  return lista;
}

function telaReceitas() {
  const lista = receitasFiltradas();
  const categorias = [['todas', 'Todas'], ...Object.entries(CATEGORIAS).map(([id, c]) => [id, c.nome])];

  return `
    <div class="titulo-secao">
      <h2>Catálogo de receitas</h2>
      <span class="apagado pequeno" id="contador">${lista.length} de ${dados.receitas.length}</span>
    </div>

    <input class="campo" id="busca" type="search" value="${esc(filtros.busca)}"
           placeholder="Buscar prato ou ingrediente..." aria-label="Buscar receita">

    <div class="chips rolagem" style="margin:12px 0">
      ${categorias
        .map(
          ([id, nome]) =>
            `<button type="button" class="chip ${filtros.categoria === id ? 'ativo' : ''}"
                     data-acao="filtrar-categoria" data-valor="${id}">${nome}</button>`
        )
        .join('')}
    </div>

    <div class="chips" style="margin-bottom:14px">
      <button type="button" class="chip ${filtros.favoritos ? 'ativo' : ''}" data-acao="alternar-favoritos">
        ★ Favoritas (${estado.favoritos.length})
      </button>
      <select class="chip" id="filtro-faixa" aria-label="Faixa de proteína">
        <option value="todas">Toda proteína</option>
        ${FAIXAS.map(
          (f) => `<option value="${f.id}" ${filtros.faixa === f.id ? 'selected' : ''}>${f.descricao}</option>`
        ).join('')}
      </select>
      <select class="chip" id="filtro-ordem" aria-label="Ordenar por">
        <option value="padrao">Ordem do acervo</option>
        <option value="proteina" ${filtros.ordem === 'proteina' ? 'selected' : ''}>Mais proteína</option>
        <option value="tempo" ${filtros.ordem === 'tempo' ? 'selected' : ''}>Mais rápidas</option>
        <option value="calorias" ${filtros.ordem === 'calorias' ? 'selected' : ''}>Menos calorias</option>
      </select>
    </div>

    <div class="grade-receitas" id="grade">
      ${lista.map(cardReceita).join('')}
    </div>
    ${lista.length ? '' : '<div class="vazio">Nenhuma receita encontrada com esses filtros.</div>'}`;
}

/* --- Tela 3: Detalhe da receita --- */

function telaReceita(id) {
  const receita = porId(id);
  if (!receita) return '<div class="vazio">Receita não encontrada.</div>';

  const m = macros(receita);
  const favorito = estado.favoritos.includes(receita.id);
  const jaAdicionada = estado.consumo.itens.includes(receita.id);
  const dica = dados.dicas[receita.id];

  return `
    <div class="detalhe-capa">
      <img src="${foto(receita.id, 'w900')}" data-id="${receita.id}" alt="${esc(receita.nome)}"
           width="900" height="563" ${FALLBACK_FOTO}>
      <div class="capa-controles">
        <button type="button" class="botao-capa" data-acao="voltar" aria-label="Voltar">←</button>
        <button type="button" class="botao-capa ${favorito ? 'ativo' : ''}"
                data-acao="favoritar" data-id="${receita.id}" aria-pressed="${favorito}"
                aria-label="Favoritar receita">${favorito ? '★' : '☆'}</button>
      </div>
    </div>

    <h2 style="margin:0 0 6px">${esc(receita.nome)}</h2>
    <p class="apagado pequeno" style="margin:0">
      ${receita.porcoes} porção · ${receita.tempo} minutos · ${CATEGORIAS[receita.categoria].nome}
    </p>

    <div class="grade-macros">
      <div class="macro"><strong>${m.calorias}</strong><small>kcal</small></div>
      <div class="macro"><strong>${m['proteína_g']} g</strong><small>proteínas</small></div>
      <div class="macro"><strong>${m.carboidrato_g} g</strong><small>carboidratos</small></div>
      <div class="macro"><strong>${m.gordura_g} g</strong><small>gorduras</small></div>
    </div>

    <h3>Ingredientes</h3>
    <div>
      ${receita.ingredientes
        .map(
          (i) => `<label class="ingrediente">
                    <input type="checkbox">
                    <span>${i.quantidade} ${i.unidade === 'unidade' ? (i.quantidade > 1 ? 'unidades' : 'unidade') : i.unidade} de ${esc(i.item)}</span>
                  </label>`
        )
        .join('')}
    </div>

    <h3 style="margin-top:22px">Modo de preparo</h3>
    <ol class="passos">
      ${receita.modo_preparo.map((passo) => `<li>${esc(passo.replace(/^\d+\.\s*/, ''))}</li>`).join('')}
    </ol>

    ${dica ? `<div class="caixa-dica"><strong>🥄 Dica de ouro do chef</strong>${esc(dica)}</div>` : ''}

    <button type="button" class="acao" data-acao="adicionar-consumo" data-id="${receita.id}">
      ＋ Adicionar ao meu consumo de hoje
    </button>
    ${jaAdicionada ? '<p class="apagado pequeno" style="text-align:center;margin:8px 0 0">Já registrada no Monitor de hoje.</p>' : ''}

    <a class="acao discreta" href="#/receitas" style="margin-top:8px">Voltar ao catálogo</a>`;
}

/* --- Tela de índice das ferramentas --- */

function telaFerramentas() {
  return `
    <div class="titulo-secao"><h2>Ferramentas Prot+</h2></div>
    <div class="lista">
      <a class="linha" href="#/turbo">
        <span class="linha-corpo"><strong>⚡ Seletor Turbo Protein</strong>
          <small>Filtra o acervo pela faixa de proteína da refeição.</small></span><span>›</span>
      </a>
      <a class="linha" href="#/despensa">
        <span class="linha-corpo"><strong>🧊 Radar de Despensa</strong>
          <small>Marque o que já tem em casa e veja o que dá para fazer.</small></span><span>›</span>
      </a>
      <a class="linha" href="#/semana">
        <span class="linha-corpo"><strong>🗓 Semana Blindada</strong>
          <small>Cardápio de 7 dias por objetivo e lista de compras.</small></span><span>›</span>
      </a>
      <a class="linha" href="#/monitor">
        <span class="linha-corpo"><strong>📈 Monitor Diário de Macros</strong>
          <small>Meta de proteína e acompanhamento do dia.</small></span><span>›</span>
      </a>
    </div>`;
}

/* --- Tela 4: Seletor Turbo Protein --- */

function telaTurbo() {
  const faixa = FAIXAS.find((f) => f.id === estado.faixa) || FAIXAS[1];
  const lista = dados.receitas
    .filter((r) => proteina(r) >= faixa.min && proteina(r) <= faixa.max)
    .sort((a, b) => proteina(b) - proteina(a));

  return `
    <div class="titulo-secao"><h2>⚡ Seletor Turbo Protein</h2></div>
    <p class="apagado pequeno" style="margin:0 0 14px">
      Escolha a faixa de proteína da refeição e o acervo inteiro se reorganiza.
    </p>

    <div class="faixas">
      ${FAIXAS.map((f) => {
        const total = dados.receitas.filter((r) => proteina(r) >= f.min && proteina(r) <= f.max).length;
        return `<button type="button" class="faixa ${f.id === faixa.id ? 'ativo' : ''}"
                        data-acao="escolher-faixa" data-valor="${f.id}">
                  <span class="faixa-bolinha" style="background:${f.cor}"></span>
                  <span class="faixa-corpo"><strong>${f.nome}</strong><small>${f.descricao}</small></span>
                  <span class="faixa-total">${total}</span>
                </button>`;
      }).join('')}
    </div>

    <div class="titulo-secao">
      <h2>${lista.length} receitas nesta faixa</h2>
      <span class="apagado pequeno">da maior para a menor</span>
    </div>
    <div class="lista">${lista.map((r) => linhaReceita(r)).join('')}</div>`;
}

/* --- Tela 5: Radar de Despensa --- */

function combinacoesDespensa() {
  if (!estado.despensa.length) return [];
  return dados.receitas
    .map((receita) => {
      const itens = receita.ingredientes.map((i) => i.item);
      const tem = itens.filter((item) => estado.despensa.includes(item));
      return { receita, tem: tem.length, total: itens.length };
    })
    .filter((linha) => linha.tem > 0)
    .sort((a, b) => b.tem / b.total - a.tem / a.total || b.tem - a.tem)
    .slice(0, 20);
}

function telaDespensa() {
  const combinacoes = combinacoesDespensa();
  const completas = combinacoes.filter((c) => c.tem === c.total).length;

  return `
    <div class="titulo-secao"><h2>🧊 Radar de Despensa</h2></div>
    <p class="apagado pequeno" style="margin:0 0 14px">
      Marque o que já existe na sua geladeira e no seu armário. O app ranqueia as receitas
      pela proporção de ingredientes que você já tem.
    </p>

    ${GRUPOS_DESPENSA.map(
      (grupo) => `
      <div class="grupo-despensa">
        <h4>${grupo.nome}</h4>
        <div class="chips">
          ${grupo.itens
            .map(
              (item) => `<button type="button" class="chip ${estado.despensa.includes(item) ? 'ativo' : ''}"
                                 data-acao="alternar-ingrediente" data-valor="${esc(item)}">${esc(item)}</button>`
            )
            .join('')}
        </div>
      </div>`
    ).join('')}

    ${
      estado.extras.length
        ? `<div class="grupo-despensa">
             <h4>Seus ingredientes</h4>
             <div class="chips">
               ${estado.extras
                 .map(
                   (item) => `<button type="button" class="chip ${estado.despensa.includes(item) ? 'ativo' : ''}"
                                      data-acao="alternar-ingrediente" data-valor="${esc(item)}">${esc(item)} ✕</button>`
                 )
                 .join('')}
             </div>
           </div>`
        : ''
    }

    <div class="painel">
      <label class="rotulo" for="novo-ingrediente">Adicionar um ingrediente que não está na lista</label>
      <div class="linha-formulario">
        <input class="campo" id="novo-ingrediente" placeholder="ex.: iogurte natural">
        <button type="button" class="acao" data-acao="adicionar-ingrediente">Adicionar</button>
      </div>
      <p class="apagado pequeno" style="margin:10px 0 0">
        O acervo usa 39 ingredientes. Itens fora dessa lista ficam salvos aqui, mas só aparecem
        nos resultados quando alguma receita realmente os utiliza.
      </p>
    </div>

    ${
      estado.despensa.length
        ? `<div class="titulo-secao">
             <h2>${combinacoes.length} combinações</h2>
             <button type="button" class="chip" data-acao="limpar-despensa">Limpar seleção</button>
           </div>
           ${completas ? `<p class="apagado pequeno" style="margin:-4px 0 12px">${completas} receita(s) dá(ão) para fazer sem comprar nada.</p>` : ''}
           <div class="lista">
             ${combinacoes
               .map((c) =>
                 linhaReceita(
                   c.receita,
                   `${c.tem} de ${c.total} ingredientes${c.tem === c.total ? ' · dá para fazer agora' : ''}`
                 )
               )
               .join('')}
           </div>`
        : '<div class="vazio">Selecione ao menos um ingrediente para ver as combinações.</div>'
    }`;
}

/* --- Tela 6: Semana Blindada --- */

/** Nota de adequação da receita ao objetivo escolhido. */
function nota(receita, objetivo) {
  const p = proteina(receita);
  const k = calorias(receita);
  if (objetivo === 'secar') return (p / k) * 1000 - k / 200;
  if (objetivo === 'hipertrofia') return p + k / 60;
  return p - Math.abs(k - 360) / 60;
}

/** Monta 7 dias × 4 refeições sem repetir receita na semana. */
function gerarSemana(objetivo) {
  const usadas = new Set();
  const dias = DIAS.map(() => {
    const dia = {};
    for (const refeicao of REFEICOES) {
      const candidatas = dados.receitas
        .filter((r) => refeicao.categorias.includes(r.categoria) && !usadas.has(r.id))
        .sort((a, b) => nota(b, objetivo) - nota(a, objetivo));
      // Se o acervo da refeição acabar, recomeça permitindo repetição.
      const escolhida =
        candidatas[0] ||
        dados.receitas
          .filter((r) => refeicao.categorias.includes(r.categoria))
          .sort((a, b) => nota(b, objetivo) - nota(a, objetivo))[0];
      dia[refeicao.id] = escolhida.id;
      usadas.add(escolhida.id);
    }
    return dia;
  });
  return { objetivo, dias, aberto: 0 };
}

function trocarRefeicao(indiceDia, idRefeicao) {
  const semana = estado.semana;
  const refeicao = REFEICOES.find((r) => r.id === idRefeicao);
  const atual = semana.dias[indiceDia][idRefeicao];
  const emUso = new Set(semana.dias.flatMap((dia) => Object.values(dia)));

  const candidatas = dados.receitas
    .filter((r) => refeicao.categorias.includes(r.categoria))
    .sort((a, b) => nota(b, semana.objetivo) - nota(a, semana.objetivo));

  const livres = candidatas.filter((r) => !emUso.has(r.id));
  // Sem receita livre na categoria, gira para a próxima da lista ranqueada.
  const proxima = livres[0] || candidatas[(candidatas.findIndex((r) => r.id === atual) + 1) % candidatas.length];
  semana.dias[indiceDia][idRefeicao] = proxima.id;
  salvar();
}

function listaDeCompras() {
  const soma = new Map();
  for (const dia of estado.semana.dias) {
    for (const id of Object.values(dia)) {
      const receita = porId(id);
      if (!receita) continue;
      for (const ingrediente of receita.ingredientes) {
        const chave = `${ingrediente.item}|${ingrediente.unidade}`;
        const anterior = soma.get(chave) || { item: ingrediente.item, unidade: ingrediente.unidade, total: 0 };
        anterior.total += ingrediente.quantidade;
        soma.set(chave, anterior);
      }
    }
  }
  return [...soma.values()].sort((a, b) => a.item.localeCompare(b.item, 'pt-BR'));
}

function telaSemana() {
  if (!estado.semana || estado.semana.objetivo !== estado.objetivo) {
    estado.semana = gerarSemana(estado.objetivo);
    salvar();
  }
  const semana = estado.semana;
  const indice = semana.aberto ?? 0;
  const dia = semana.dias[indice];

  const receitasDoDia = Object.values(dia).map(porId).filter(Boolean);
  const totalProteina = receitasDoDia.reduce((s, r) => s + proteina(r), 0);
  const totalCalorias = receitasDoDia.reduce((s, r) => s + calorias(r), 0);

  return `
    <div class="titulo-secao"><h2>🗓 Semana Blindada</h2></div>

    <div class="painel">
      <label class="rotulo">Objetivo do cardápio</label>
      <div class="chips">
        ${OBJETIVOS.map(
          (o) => `<button type="button" class="chip ${estado.objetivo === o.id ? 'ativo' : ''}"
                          data-acao="escolher-objetivo" data-valor="${o.id}">${o.nome}</button>`
        ).join('')}
      </div>
      <p class="apagado pequeno" style="margin:10px 0 0">
        ${esc(OBJETIVOS.find((o) => o.id === estado.objetivo).resumo)}
      </p>
    </div>

    <div class="abas-dias">
      ${DIAS.map(
        (nome, i) => `<button type="button" class="aba-dia ${i === indice ? 'ativo' : ''}"
                              data-acao="abrir-dia" data-valor="${i}">${nome.slice(0, 3)}</button>`
      ).join('')}
    </div>

    <h3 style="margin:0 0 10px">${DIAS[indice]}</h3>

    ${REFEICOES.map((refeicao) => {
      const receita = porId(dia[refeicao.id]);
      if (!receita) return '';
      return `
        <div class="refeicao">
          <div class="refeicao-topo">
            <h4>${refeicao.nome}</h4>
            <button type="button" class="botao-trocar" data-acao="trocar-refeicao"
                    data-dia="${indice}" data-valor="${refeicao.id}">↻ Trocar</button>
          </div>
          ${linhaReceita(receita)}
        </div>`;
    }).join('')}

    <div class="resumo-dia">
      <span>Total do dia</span>
      <span>${arredondar(totalProteina)} g de proteína · ${totalCalorias} kcal</span>
    </div>

    <button type="button" class="acao" data-acao="gerar-lista" style="margin-top:16px">
      🛒 Gerar lista de compras da semana
    </button>
    <button type="button" class="acao discreta" data-acao="regerar-semana">
      Montar outro cardápio
    </button>`;
}

function folhaListaDeCompras() {
  const itens = listaDeCompras();
  return `
    <div class="folha-caixa">
      <div class="titulo-secao">
        <h3>🛒 Lista de compras da semana</h3>
        <button type="button" class="chip" data-acao="fechar-folha">Fechar</button>
      </div>
      <p class="apagado pequeno">
        Soma dos ingredientes das 28 refeições do cardápio de ${esc(
          OBJETIVOS.find((o) => o.id === estado.semana.objetivo).nome.toLowerCase()
        )}.
      </p>
      <ul class="lista-compras">
        ${itens
          .map(
            (i) =>
              `<li><strong>${esc(i.item)}</strong>
                   <span>${arredondar(i.total)} ${i.unidade === 'unidade' ? (i.total > 1 ? 'unidades' : 'unidade') : i.unidade}</span></li>`
          )
          .join('')}
      </ul>
      <button type="button" class="acao" data-acao="copiar-lista" style="margin-top:16px">Copiar lista</button>
    </div>`;
}

/* --- Tela 7: Monitor Diário de Macros --- */

function telaMonitor() {
  const total = totalDoDia();
  const percentual = estado.meta > 0 ? (total.proteina / estado.meta) * 100 : 0;
  const restante = Math.max(0, estado.meta - total.proteina);
  const batida = total.proteina >= estado.meta;

  return `
    <div class="titulo-secao"><h2>📈 Monitor Diário de Macros</h2></div>

    <div class="painel">
      ${anelProgresso(
        percentual,
        `${arredondar(total.proteina)} g`,
        batida ? 'Meta do dia batida' : `Faltam ${arredondar(restante)} g para a meta`
      )}
      <div class="barra ${batida ? 'batida' : ''}"><i style="width:${Math.min(100, percentual)}%"></i></div>
      <div style="display:flex;justify-content:space-between" class="apagado pequeno">
        <span>${Math.round(percentual)}% de ${estado.meta} g</span>
        <span>${total.calorias} kcal registradas hoje</span>
      </div>
    </div>

    <div class="painel">
      <label class="rotulo" for="meta">Meta diária de proteína (g)</label>
      <div class="linha-formulario">
        <input class="campo" id="meta" type="number" min="1" max="600" inputmode="numeric" value="${estado.meta}">
        <button type="button" class="acao" data-acao="salvar-meta">Salvar</button>
      </div>

      <label class="rotulo" for="peso" style="margin-top:14px">Calcular a meta pelo peso corporal</label>
      <div class="linha-formulario">
        <input class="campo" id="peso" type="number" min="1" max="300" inputmode="decimal" placeholder="Seu peso em kg">
        <button type="button" class="acao secundaria" data-acao="meta-por-peso">Calcular</button>
      </div>
      <p class="apagado pequeno" style="margin:10px 0 0">
        Usamos 1,8 g de proteína por quilo, referência comum para quem treina força.
        Ajuste o valor com seu nutricionista.
      </p>
    </div>

    <div class="titulo-secao">
      <h2>Consumo de hoje</h2>
      ${estado.consumo.itens.length ? '<button type="button" class="chip" data-acao="zerar-dia">Zerar dia</button>' : ''}
    </div>

    ${
      estado.consumo.itens.length
        ? `<div class="lista">
             ${estado.consumo.itens
               .map((id, posicao) => {
                 const receita = porId(id);
                 if (!receita) return '';
                 return `<div class="item-consumo">
                           <span class="linha-corpo">
                             <strong>${esc(receita.nome)}</strong>
                             <small>${proteina(receita)} g de proteína · ${calorias(receita)} kcal</small>
                           </span>
                           <button type="button" class="botao-remover" data-acao="remover-consumo"
                                   data-valor="${posicao}" aria-label="Remover ${esc(receita.nome)}">×</button>
                         </div>`;
               })
               .join('')}
           </div>`
        : `<div class="vazio">Nenhuma receita registrada hoje.<br>
             Abra uma receita e toque em "Adicionar ao meu consumo de hoje".</div>`
    }

    <a class="acao discreta" href="#/receitas" style="margin-top:14px">Escolher uma receita</a>`;
}

/* --- Tela 8: Central de Bônus --- */

const bonusAberto = { treino: 'ppl', local: 'academia', sessao: 0 };

function blocoTreino() {
  const treinos = dados.bonus.treinos;
  const divisao = treinos.divisoes.find((d) => d.id === bonusAberto.treino);
  const sessao = divisao.sessoes[Math.min(bonusAberto.sessao, divisao.sessoes.length - 1)];
  const exercicios = sessao[bonusAberto.local];

  return `
    <article class="painel">
      <h3 style="margin:0 0 4px">🎁 ${esc(treinos.titulo)}</h3>
      <p class="apagado pequeno" style="margin:0 0 14px">${esc(treinos.subtitulo)}</p>

      <label class="rotulo">Divisão</label>
      <div class="chips">
        ${treinos.divisoes
          .map(
            (d) => `<button type="button" class="chip ${d.id === bonusAberto.treino ? 'ativo' : ''}"
                            data-acao="escolher-treino" data-valor="${d.id}">${esc(d.sigla)}</button>`
          )
          .join('')}
      </div>

      <p class="apagado pequeno" style="margin:12px 0">
        <strong>${esc(divisao.nome)}</strong> · ${esc(divisao.frequencia)}<br>${esc(divisao.resumo)}
      </p>

      <label class="rotulo">Onde você treina</label>
      <div class="chips">
        <button type="button" class="chip ${bonusAberto.local === 'academia' ? 'ativo' : ''}"
                data-acao="escolher-local" data-valor="academia">Academia</button>
        <button type="button" class="chip ${bonusAberto.local === 'casa' ? 'ativo' : ''}"
                data-acao="escolher-local" data-valor="casa">Em casa</button>
      </div>

      <label class="rotulo" style="margin-top:14px">Sessão</label>
      <div class="chips rolagem">
        ${divisao.sessoes
          .map(
            (s, i) => `<button type="button" class="chip ${i === bonusAberto.sessao ? 'ativo' : ''}"
                               data-acao="escolher-sessao" data-valor="${i}">${esc(s.nome.split(' — ')[0])}</button>`
          )
          .join('')}
      </div>

      <h4 style="margin:16px 0 10px">${esc(sessao.nome)}</h4>
      <ol class="lista-exercicios">
        ${exercicios
          .map(
            (e) => `<li>
                      <strong>${esc(e.exercicio)}</strong>
                      <span>
                        <b>${esc(e.series)}</b> séries ·
                        <b>${esc(e.reps)}</b> reps ·
                        descanso de <b>${esc(e.descanso)}</b>
                      </span>
                    </li>`
          )
          .join('')}
      </ol>

      <div style="margin-top:14px">
        ${treinos.progressao
          .map(
            (p) => `<details><summary>${esc(p.titulo)}</summary>
                      <p class="apagado pequeno">${esc(p.texto)}</p></details>`
          )
          .join('')}
      </div>

      <div class="caixa-aviso">${esc(treinos.aviso)}</div>
    </article>`;
}

function blocoCalculadora() {
  const calc = dados.bonus.calculadora;
  return `
    <article class="painel">
      <h3 style="margin:0 0 4px">🧮 ${esc(calc.titulo)}</h3>
      <p class="apagado pequeno" style="margin:0 0 14px">Fórmula ${esc(calc.formula)}.</p>

      <div class="grade-formulario">
        <label class="rotulo">Peso (kg)<input class="campo" id="calc-peso" type="number" inputmode="decimal" value="70"></label>
        <label class="rotulo">Altura (cm)<input class="campo" id="calc-altura" type="number" inputmode="numeric" value="170"></label>
        <label class="rotulo">Idade<input class="campo" id="calc-idade" type="number" inputmode="numeric" value="30"></label>
        <label class="rotulo">Sexo
          <select class="campo" id="calc-sexo">
            <option value="f">Feminino</option>
            <option value="m">Masculino</option>
          </select>
        </label>
        <label class="rotulo largo">Nível de atividade
          <select class="campo" id="calc-atividade">
            ${calc.atividades
              .map(
                (a) => `<option value="${a.id}" ${a.id === 'moderado' ? 'selected' : ''}>${esc(a.nome)} — ${esc(a.detalhe)}</option>`
              )
              .join('')}
          </select>
        </label>
        <label class="rotulo largo">Objetivo
          <select class="campo" id="calc-objetivo">
            ${calc.objetivos
              .map((o) => `<option value="${o.id}" ${o.id === 'manter' ? 'selected' : ''}>${esc(o.nome)}</option>`)
              .join('')}
          </select>
        </label>
      </div>

      <button type="button" class="acao" data-acao="calcular" style="margin-top:14px">Calcular minhas metas</button>
      <div id="resultado-calculo"></div>
      <div class="caixa-aviso">${esc(calc.aviso)}</div>
    </article>`;
}

function calcular() {
  const calc = dados.bonus.calculadora;
  const peso = Number($('#calc-peso').value);
  const altura = Number($('#calc-altura').value);
  const idade = Number($('#calc-idade').value);
  const sexo = $('#calc-sexo').value;
  const atividade = calc.atividades.find((a) => a.id === $('#calc-atividade').value);
  const objetivo = calc.objetivos.find((o) => o.id === $('#calc-objetivo').value);

  if (!(peso > 0 && altura > 0 && idade > 0)) {
    avisar('Preencha peso, altura e idade com valores válidos.');
    return;
  }

  // Mifflin-St Jeor
  const tmb = 10 * peso + 6.25 * altura - 5 * idade + (sexo === 'm' ? 5 : -161);
  const get = tmb * atividade.fator;
  const alvo = get * (1 + objetivo.ajuste);

  const proteinaG = peso * objetivo.proteina_por_kg;
  const gorduraG = peso * objetivo.gordura_por_kg;
  const carboidratoG = Math.max(0, (alvo - proteinaG * 4 - gorduraG * 9) / 4);

  $('#resultado-calculo').innerHTML = `
    <div class="resultado">
      <div class="resultado-destaque">
        <div><strong>${Math.round(tmb)}</strong><small>TMB (kcal)</small></div>
        <div><strong>${Math.round(get)}</strong><small>Gasto total</small></div>
        <div><strong>${Math.round(alvo)}</strong><small>Meta diária</small></div>
      </div>
      <div class="grade-macros" style="margin:0">
        <div class="macro" style="grid-column:span 2"><strong>${Math.round(proteinaG)} g</strong><small>proteínas</small></div>
        <div class="macro"><strong>${Math.round(carboidratoG)} g</strong><small>carbo.</small></div>
        <div class="macro"><strong>${Math.round(gorduraG)} g</strong><small>gorduras</small></div>
      </div>
      <p class="apagado pequeno" style="margin:12px 0 0">${esc(objetivo.explicacao)}</p>
      <button type="button" class="acao secundaria" data-acao="usar-meta" data-valor="${Math.round(proteinaG)}"
              style="margin-top:12px">Usar ${Math.round(proteinaG)} g como minha meta no Monitor</button>
    </div>`;
}

function blocoWhey() {
  const whey = dados.bonus.whey;
  return `
    <article class="painel">
      <h3 style="margin:0 0 4px">🥛 ${esc(whey.titulo)}</h3>
      <p class="apagado pequeno" style="margin:0 0 14px">${esc(whey.subtitulo)}</p>

      ${whey.formulas
        .map(
          (f) => `<details>
                    <summary>${esc(f.nome)} · ${f.proteina_g} g de proteína</summary>
                    <ul style="margin:8px 0;padding-left:20px">
                      ${f.ingredientes.map((i) => `<li>${esc(i)}</li>`).join('')}
                    </ul>
                    <p class="pequeno" style="margin:0 0 6px"><strong>Preparo:</strong> ${esc(f.modo)}</p>
                    <p class="apagado pequeno" style="margin:0"><strong>Quando usar:</strong> ${esc(f.quando)} ·
                       ${f.calorias} kcal por porção</p>
                  </details>`
        )
        .join('')}

      <h4 style="margin:18px 0 8px">Trocas que economizam</h4>
      <ul class="lista-compras">
        ${whey.substituicoes
          .map(
            (s) => `<li><span style="white-space:normal">
                      <strong>${esc(s.no_lugar_de)}</strong> → ${esc(s.use)}<br>
                      <small class="apagado">${esc(s.porque)}</small></span></li>`
          )
          .join('')}
      </ul>

      <h4 style="margin:18px 0 8px">Técnicas de sabor</h4>
      ${whey.saborizacao
        .map(
          (t) => `<details><summary>${esc(t.tecnica)}</summary>
                    <p class="apagado pequeno">${esc(t.texto)}</p></details>`
        )
        .join('')}

      <div class="caixa-aviso">${esc(whey.aviso)}</div>
    </article>`;
}

function telaBonus() {
  return `
    <div class="titulo-secao"><h2>✦ Central de Bônus</h2></div>
    ${blocoTreino()}
    ${blocoCalculadora()}
    ${blocoWhey()}`;
}

/* ------------------------------------------------------------------ *
 * 6. Roteador e eventos
 * ------------------------------------------------------------------ */

const ROTAS = {
  inicio: { aba: 'inicio', tela: telaInicio },
  receitas: { aba: 'receitas', tela: telaReceitas },
  ferramentas: { aba: 'ferramentas', tela: telaFerramentas },
  turbo: { aba: 'ferramentas', tela: telaTurbo },
  despensa: { aba: 'ferramentas', tela: telaDespensa },
  semana: { aba: 'ferramentas', tela: telaSemana },
  monitor: { aba: 'ferramentas', tela: telaMonitor },
  bonus: { aba: 'bonus', tela: telaBonus },
};

function rotaAtual() {
  const bruto = (location.hash || '#/inicio').replace(/^#\/?/, '');
  const [caminho, consulta] = bruto.split('?');
  const partes = caminho.split('/').filter(Boolean);
  return { nome: partes[0] || 'inicio', parametro: partes[1] || '', consulta: new URLSearchParams(consulta || '') };
}

function render() {
  const rota = rotaAtual();
  const view = $('#view');

  if (rota.nome === 'receita') {
    view.innerHTML = telaReceita(rota.parametro);
  } else {
    const destino = ROTAS[rota.nome] || ROTAS.inicio;
    view.innerHTML = destino.tela();
  }

  const abaAtiva = rota.nome === 'receita' ? 'receitas' : (ROTAS[rota.nome] || ROTAS.inicio).aba;
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('ativo', item.dataset.aba === abaAtiva);
    item.setAttribute('aria-current', item.dataset.aba === abaAtiva ? 'page' : 'false');
  });

  $('#saudacao').textContent = estado.nome ? `${saudacao()}, ${estado.nome}` : 'SUA ROTINA MAIS FORTE';
  window.scrollTo(0, 0);
}

function irPara(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

let temporizadorAviso;

function avisar(texto) {
  const caixa = $('#aviso');
  caixa.textContent = texto;
  caixa.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => {
    caixa.hidden = true;
  }, 2600);
}

function abrirFolha(html) {
  const folha = $('#folha');
  folha.innerHTML = html;
  folha.hidden = false;
}

function fecharFolha() {
  $('#folha').hidden = true;
}

/** Ações de clique, resolvidas por delegação a partir de `data-acao`. */
const ACOES = {
  favoritar(alvo) {
    const id = alvo.dataset.id;
    estado.favoritos = estado.favoritos.includes(id)
      ? estado.favoritos.filter((favorito) => favorito !== id)
      : [...estado.favoritos, id];
    salvar();
    render();
    avisar(estado.favoritos.includes(id) ? 'Salva nos favoritos.' : 'Removida dos favoritos.');
  },

  voltar() {
    if (history.length > 1) history.back();
    else irPara('#/receitas');
  },

  'editar-nome'() {
    const nome = prompt('Como podemos te chamar?', estado.nome || '');
    if (nome === null) return;
    estado.nome = nome.trim().slice(0, 24);
    salvar();
    render();
  },

  'filtrar-categoria'(alvo) {
    filtros.categoria = alvo.dataset.valor;
    render();
  },

  'alternar-favoritos'() {
    filtros.favoritos = !filtros.favoritos;
    render();
  },

  'adicionar-consumo'(alvo) {
    estado.consumo.itens.push(alvo.dataset.id);
    salvar();
    const total = totalDoDia();
    avisar(`Registrado. Você está com ${arredondar(total.proteina)} g de ${estado.meta} g hoje.`);
    render();
  },

  'remover-consumo'(alvo) {
    estado.consumo.itens.splice(Number(alvo.dataset.valor), 1);
    salvar();
    render();
  },

  'zerar-dia'() {
    if (!confirm('Apagar todas as receitas registradas hoje?')) return;
    estado.consumo = { data: hoje(), itens: [] };
    salvar();
    render();
  },

  'salvar-meta'() {
    const valor = Number($('#meta').value);
    if (!(valor > 0)) return avisar('Informe uma meta maior que zero.');
    estado.meta = Math.round(valor);
    salvar();
    render();
    avisar(`Meta ajustada para ${estado.meta} g por dia.`);
  },

  'meta-por-peso'() {
    const peso = Number($('#peso').value);
    if (!(peso > 0)) return avisar('Informe seu peso em quilos.');
    estado.meta = Math.round(peso * 1.8);
    salvar();
    render();
    avisar(`Meta calculada: ${estado.meta} g por dia.`);
  },

  'usar-meta'(alvo) {
    estado.meta = Number(alvo.dataset.valor);
    salvar();
    avisar(`Meta do Monitor ajustada para ${estado.meta} g.`);
  },

  'escolher-faixa'(alvo) {
    estado.faixa = alvo.dataset.valor;
    salvar();
    render();
  },

  'alternar-ingrediente'(alvo) {
    const item = alvo.dataset.valor;
    estado.despensa = estado.despensa.includes(item)
      ? estado.despensa.filter((i) => i !== item)
      : [...estado.despensa, item];
    salvar();
    render();
  },

  'adicionar-ingrediente'() {
    const campo = $('#novo-ingrediente');
    const item = campo.value.trim().toLowerCase();
    if (!item) return;
    if (!estado.extras.includes(item)) estado.extras.push(item);
    if (!estado.despensa.includes(item)) estado.despensa.push(item);
    campo.value = '';
    salvar();
    render();
  },

  'limpar-despensa'() {
    estado.despensa = [];
    salvar();
    render();
  },

  'escolher-objetivo'(alvo) {
    estado.objetivo = alvo.dataset.valor;
    estado.semana = gerarSemana(estado.objetivo);
    salvar();
    render();
  },

  'abrir-dia'(alvo) {
    estado.semana.aberto = Number(alvo.dataset.valor);
    salvar();
    render();
  },

  'trocar-refeicao'(alvo) {
    trocarRefeicao(Number(alvo.dataset.dia), alvo.dataset.valor);
    render();
  },

  'regerar-semana'() {
    const anterior = estado.semana;
    estado.semana = gerarSemana(estado.objetivo);
    // Gira o primeiro dia para que o novo cardápio não saia idêntico ao anterior.
    estado.semana.dias.push(estado.semana.dias.shift());
    estado.semana.aberto = anterior.aberto ?? 0;
    salvar();
    render();
    avisar('Novo cardápio montado.');
  },

  'gerar-lista'() {
    abrirFolha(folhaListaDeCompras());
  },

  async 'copiar-lista'() {
    const texto = listaDeCompras()
      .map((i) => `- ${i.item}: ${arredondar(i.total)} ${i.unidade}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(`Lista de compras Prot+\n\n${texto}`);
      avisar('Lista copiada.');
    } catch (erro) {
      avisar('Seu navegador bloqueou a cópia automática.');
    }
  },

  'fechar-folha': fecharFolha,

  'escolher-treino'(alvo) {
    bonusAberto.treino = alvo.dataset.valor;
    bonusAberto.sessao = 0;
    render();
  },

  'escolher-local'(alvo) {
    bonusAberto.local = alvo.dataset.valor;
    render();
  },

  'escolher-sessao'(alvo) {
    bonusAberto.sessao = Number(alvo.dataset.valor);
    render();
  },

  calcular,

  'abrir-instalacao'() {
    instalar();
  },
};

function ligarEventos() {
  document.addEventListener('click', (evento) => {
    const alvo = evento.target.closest('[data-acao]');
    if (alvo) {
      evento.preventDefault();
      ACOES[alvo.dataset.acao]?.(alvo);
      return;
    }
    // Clique fora da caixa fecha a folha inferior.
    if (evento.target === $('#folha')) fecharFolha();
  });

  document.addEventListener('input', (evento) => {
    if (evento.target.id === 'busca') {
      filtros.busca = evento.target.value;
      const grade = $('#grade');
      const lista = receitasFiltradas();
      grade.innerHTML = lista.map(cardReceita).join('');
      $('#contador').textContent = `${lista.length} de ${dados.receitas.length}`;
    }
  });

  document.addEventListener('change', (evento) => {
    if (evento.target.id === 'filtro-faixa') {
      filtros.faixa = evento.target.value;
      render();
    }
    if (evento.target.id === 'filtro-ordem') {
      filtros.ordem = evento.target.value;
      render();
    }
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' && evento.target.id === 'novo-ingrediente') {
      evento.preventDefault();
      ACOES['adicionar-ingrediente']();
    }
    if (evento.key === 'Escape') fecharFolha();
  });

  window.addEventListener('hashchange', () => {
    fecharFolha();
    // Filtros vindos da tela inicial (#/receitas?cat=...&fav=1).
    const rota = rotaAtual();
    if (rota.nome === 'receitas') {
      if (rota.consulta.has('cat')) filtros.categoria = rota.consulta.get('cat');
      if (rota.consulta.has('fav')) filtros.favoritos = true;
    }
    render();
  });
}

/* ------------------------------------------------------------------ *
 * 7. Instalação na tela inicial e service worker
 * ------------------------------------------------------------------ */

let eventoInstalacao = null;

const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const jaInstalado = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function instalar() {
  if (eventoInstalacao) {
    eventoInstalacao.prompt();
    eventoInstalacao.userChoice.finally(() => {
      eventoInstalacao = null;
      $('.topbar-install').hidden = true;
    });
    return;
  }
  abrirFolha(`
    <div class="folha-caixa">
      <div class="titulo-secao">
        <h3>Deixe o Prot+ na tela inicial</h3>
        <button type="button" class="chip" data-acao="fechar-folha">Fechar</button>
      </div>
      ${
        ehIOS()
          ? `<ol>
               <li>Toque no botão <strong>Compartilhar</strong> (o quadrado com a seta para cima), na barra do Safari.</li>
               <li>Role a lista e escolha <strong>Adicionar à Tela de Início</strong>.</li>
               <li>Confirme em <strong>Adicionar</strong>. O ícone do Prot+ aparece junto dos seus outros apps.</li>
             </ol>`
          : `<ol>
               <li>Abra o menu do navegador (os três pontinhos, no canto superior).</li>
               <li>Escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
               <li>Confirme. O Prot+ passa a abrir como aplicativo, sem a barra do navegador.</li>
             </ol>`
      }
      <p class="apagado pequeno">
        Depois da primeira visita completa, suas receitas continuam disponíveis mesmo sem internet.
      </p>
    </div>`);
}

function prepararInstalacao() {
  const botao = $('.topbar-install');
  if (jaInstalado()) return;

  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalacao = evento;
    botao.hidden = false;
  });

  // No iOS não existe `beforeinstallprompt`: mostramos o passo a passo manual.
  if (ehIOS()) botao.hidden = false;

  window.addEventListener('appinstalled', () => {
    botao.hidden = true;
    avisar('Prot+ instalado. Abra pelo ícone na tela inicial.');
  });
}

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const registrar = () =>
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      /* Sem service worker o app continua funcionando, só perde o modo offline. */
    });

  // Esta função roda depois do carregamento dos dados, então o evento `load`
  // normalmente já passou: nesse caso registramos na hora.
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
}

/* ------------------------------------------------------------------ *
 * Inicialização
 * ------------------------------------------------------------------ */

async function iniciar() {
  try {
    await carregarDados();
  } catch (erro) {
    $('#view').innerHTML = `
      <div class="vazio">
        Não foi possível carregar as receitas.<br>
        Abra o Prot+ pelo endereço completo do site, com conexão ativa na primeira visita.
      </div>`;
    return;
  }

  ligarEventos();
  const rota = rotaAtual();
  if (rota.nome === 'receitas') {
    if (rota.consulta.has('cat')) filtros.categoria = rota.consulta.get('cat');
    if (rota.consulta.has('fav')) filtros.favoritos = true;
  }
  render();
  prepararInstalacao();
  registrarServiceWorker();
}

iniciar();
