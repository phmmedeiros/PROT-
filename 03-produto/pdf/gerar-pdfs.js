const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const outputDir = __dirname;
const recipes = JSON.parse(fs.readFileSync(path.join(root, 'dados', 'receitas.json'), 'utf8'));

const categoryInfo = {
  'cafe-lanches': { label: 'Café e lanches', short: 'cafe-lanches', color: '#ef8354', intro: 'Receitas práticas para começar o dia ou fazer um lanche com mais proteína.' },
  'almoco-jantar': { label: 'Almoço e jantar', short: 'almoco-jantar', color: '#2a9d8f', intro: 'Preparos completos para refeições saborosas, equilibradas e proteicas.' },
  sobremesas: { label: 'Sobremesas', short: 'sobremesas', color: '#8d6e9e', intro: 'Opções doces para encaixar na rotina sem abrir mão da praticidade.' },
};

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function number(value) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function nutrition(recipe) {
  const macro = recipe['por_porção'];
  return `<div class="nutrition">
    <div><strong>${number(macro.proteína_g)} g</strong><span>proteína</span></div>
    <div><strong>${number(macro.calorias)}</strong><span>calorias</span></div>
    <div><strong>${number(macro.carboidrato_g)} g</strong><span>carboidrato</span></div>
    <div><strong>${number(macro.gordura_g)} g</strong><span>gordura</span></div>
  </div>`;
}

function recipePage(recipe, index, total) {
  const category = categoryInfo[recipe.categoria];
  const ingredients = recipe.ingredientes.map((ingredient) =>
    `<li><span>${esc(ingredient.item)}</span><strong>${number(ingredient.quantidade)} ${esc(ingredient.unidade)}</strong></li>`
  ).join('');
  const steps = recipe.modo_preparo.map((step) => `<li>${esc(step.replace(/^\d+\.\s*/, ''))}</li>`).join('');
  return `<article class="recipe" style="--accent:${category.color}">
    <div class="recipe-top"><span class="eyebrow">${esc(category.label)}</span><span class="recipe-id">${esc(recipe.id)} · ${index}/${total}</span></div>
    <div class="recipe-grid">
      <div class="photo">FOTO RESERVADA<span>${esc(recipe.nome)}</span></div>
      <div>
        <h2>${esc(recipe.nome)}</h2>
        <div class="meta"><span>⏱ ${number(recipe.tempo)} min</span><span>🍽 ${number(recipe.porcoes)} porção(ões)</span></div>
        ${nutrition(recipe)}
      </div>
    </div>
    <div class="columns">
      <section><h3>Ingredientes</h3><ul class="ingredients">${ingredients}</ul></section>
      <section><h3>Modo de preparo</h3><ol class="steps">${steps}</ol></section>
    </div>
    <footer>Macros estimados por porção com base na TACO. Os valores podem variar conforme marca, peso e preparo.</footer>
  </article>`;
}

function cover(title, subtitle, count, color) {
  return `<section class="cover" style="--accent:${color}">
    <div class="brand">PROT<span>+</span></div>
    <div class="cover-rule"></div>
    <p class="cover-kicker">ARQUITETURA GASTRONÔMICA PROTEICA</p>
    <h1>${esc(title)}</h1>
    <p class="cover-subtitle">${esc(subtitle)}</p>
    <div class="cover-stat"><strong>${count}</strong><span>receitas autorais<br>com macros por porção</span></div>
    <p class="cover-note">Um material prático para consultar, planejar e cozinhar melhor.</p>
  </section>`;
}

function buildHtml(list, title, subtitle, color) {
  const groups = [...new Set(list.map((recipe) => recipe.categoria))];
  const toc = groups.map((category) => {
    const info = categoryInfo[category];
    return `<li><span>${esc(info.label)}</span><strong>${list.filter((r) => r.categoria === category).length} receitas</strong></li>`;
  }).join('');
  const pages = groups.map((category) => {
    const group = list.filter((recipe) => recipe.categoria === category);
    const info = categoryInfo[category];
    return `<section class="section-intro" style="--accent:${info.color}"><span class="eyebrow">COLEÇÃO PROT+</span><h2>${esc(info.label)}</h2><p>${esc(info.intro)}</p></section>${group.map((recipe, index) => recipePage(recipe, index + 1, group.length)).join('')}`;
  }).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page { size: A4; margin: 0; }
    :root { --ink:#253238; --muted:#657277; --cream:#fbf8f1; --line:#d9e0dc; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:white; font-family:Arial, Helvetica, sans-serif; }
    .cover { min-height:297mm; padding:38mm 25mm 25mm; background:linear-gradient(145deg,#203a43,#315d63 58%,var(--accent)); color:white; page-break-after:always; position:relative; overflow:hidden; }
    .cover:after { content:''; position:absolute; width:170mm; height:170mm; border:1px solid rgba(255,255,255,.18); border-radius:50%; right:-95mm; bottom:-55mm; }
    .brand { font-size:30px; font-weight:900; letter-spacing:4px; }.brand span { color:#f2c14e; }
    .cover-rule { width:38mm; height:4px; background:#f2c14e; margin:34mm 0 12mm; }
    .cover-kicker,.eyebrow { font-size:9px; letter-spacing:2px; font-weight:700; text-transform:uppercase; }
    .cover h1 { max-width:155mm; font-size:40px; line-height:1.04; margin:9mm 0 5mm; }
    .cover-subtitle { max-width:135mm; font-size:17px; line-height:1.5; color:#e7f0eb; }
    .cover-stat { display:flex; align-items:center; gap:7mm; margin-top:35mm; }.cover-stat strong { font-size:48px; color:#f2c14e; }.cover-stat span { font-size:13px; line-height:1.35; }.cover-note { position:absolute; bottom:20mm; font-size:11px; color:#d8e6df; }
    .contents { padding:25mm; page-break-after:always; }.contents h2 { font-size:28px; margin:0 0 8mm; }.contents p { color:var(--muted); line-height:1.5; }.contents ul { list-style:none; padding:0; margin-top:18mm; }.contents li { display:flex; justify-content:space-between; border-bottom:1px solid var(--line); padding:6mm 0; font-size:15px; }.contents li strong { color:#2a9d8f; }
    .section-intro { min-height:70mm; padding:25mm; background:var(--cream); border-bottom:5px solid var(--accent); page-break-after:always; }.section-intro h2 { font-size:32px; margin:10mm 0 4mm; }.section-intro p { max-width:125mm; color:var(--muted); font-size:15px; line-height:1.5; }
    .recipe { min-height:297mm; padding:15mm 17mm 12mm; page-break-after:always; position:relative; }.recipe-top { display:flex; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:4mm; color:var(--accent); }.recipe-id { color:var(--muted); font-size:10px; }.recipe-grid { display:grid; grid-template-columns:70mm 1fr; gap:9mm; margin:9mm 0; align-items:center; }.photo { height:58mm; border-radius:5mm; background:linear-gradient(145deg,#e6eee9,#f7f3e8); color:var(--accent); display:flex; align-items:center; justify-content:center; text-align:center; flex-direction:column; font-size:10px; letter-spacing:1px; font-weight:700; }.photo span { display:block; margin:4mm 7mm 0; color:var(--ink); letter-spacing:0; font-size:13px; line-height:1.2; }.recipe h2 { font-size:25px; line-height:1.1; margin:0 0 5mm; }.meta { color:var(--muted); font-size:11px; display:flex; gap:5mm; }.nutrition { display:grid; grid-template-columns:repeat(4,1fr); gap:2mm; margin-top:7mm; }.nutrition div { background:#f2f6f2; border-top:3px solid var(--accent); padding:3mm 2mm; text-align:center; }.nutrition strong { display:block; font-size:14px; }.nutrition span { display:block; color:var(--muted); font-size:8px; margin-top:1mm; }.columns { display:grid; grid-template-columns: .9fr 1.1fr; gap:10mm; border-top:1px solid var(--line); padding-top:8mm; }.columns h3 { font-size:15px; margin:0 0 4mm; color:var(--accent); }.ingredients,.steps { margin:0; padding:0; }.ingredients { list-style:none; }.ingredients li { display:flex; justify-content:space-between; gap:5mm; border-bottom:1px dotted #ccd6d0; padding:2.5mm 0; font-size:10px; }.ingredients li strong { white-space:nowrap; }.steps { padding-left:5mm; }.steps li { padding:0 0 3.5mm 1mm; font-size:10px; line-height:1.35; }.recipe footer { position:absolute; left:17mm; right:17mm; bottom:10mm; color:var(--muted); font-size:8px; border-top:1px solid var(--line); padding-top:3mm; }
  </style></head><body>${cover(title, subtitle, list.length, color)}<section class="contents"><p class="eyebrow">GUIA DE RECEITAS PROTEICAS</p><h2>Índice</h2><p>Receitas originais do Prot+ para uma rotina mais prática, saborosa e rica em proteína.</p><ul>${toc}</ul><p style="margin-top:28mm;font-size:10px">Fonte dos valores nutricionais: Tabela Brasileira de Composição de Alimentos (TACO). Consulte sempre um profissional para necessidades individuais.</p></section>${pages}</body></html>`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const jobs = [
    { filename: 'receitas-prot-plus.pdf', list: recipes, title: 'Receitas Prot+', subtitle: '120 receitas proteicas para transformar sua rotina', color: '#2a9d8f' },
    ...Object.entries(categoryInfo).map(([category, info]) => ({
      filename: `receitas-prot-plus-${info.short}.pdf`,
      list: recipes.filter((recipe) => recipe.categoria === category),
      title: `Prot+ · ${info.label}`,
      subtitle: info.intro,
      color: info.color,
    })),
  ];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  for (const job of jobs) {
    const page = await browser.newPage();
    await page.setContent(buildHtml(job.list, job.title, job.subtitle, job.color), { waitUntil: 'load' });
    await page.pdf({ path: path.join(outputDir, job.filename), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`${job.filename}: ${job.list.length} receitas`);
  }
  await browser.close();
  fs.writeFileSync(path.join(outputDir, 'README.md'), `# PDFs de receitas Prot+\n\n- [Receitas completas](receitas-prot-plus.pdf) — ${recipes.length} receitas\n- [Café e lanches](receitas-prot-plus-cafe-lanches.pdf) — ${recipes.filter((r) => r.categoria === 'cafe-lanches').length} receitas\n- [Almoço e jantar](receitas-prot-plus-almoco-jantar.pdf) — ${recipes.filter((r) => r.categoria === 'almoco-jantar').length} receitas\n- [Sobremesas](receitas-prot-plus-sobremesas.pdf) — ${recipes.filter((r) => r.categoria === 'sobremesas').length} receitas\n\nOs PDFs usam espaços reservados nomeados para fotos até que sejam inseridas imagens próprias ou licenciadas.\n`, 'utf8');
}

main().catch((error) => { console.error(error); process.exit(1); });
