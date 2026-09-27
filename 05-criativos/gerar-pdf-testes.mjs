import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const source = await fs.readFile(new URL('./manual-canva-30-criativos.md', import.meta.url), 'utf8');
const esc = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const inline = (value) => esc(value)
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

const renderContent = (lines) => {
  let html = '';
  for (let i = 0; i < lines.length;) {
    if (lines[i].trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i].trim().slice(1, -1).split('|').map((cell) => cell.trim());
        if (!row.every((cell) => /^[-: ]+$/.test(cell))) rows.push(row);
        i += 1;
      }
      if (rows.length) {
        html += `<table><thead><tr>${rows[0].map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>`;
        html += rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('');
        html += '</tbody></table>';
      }
    } else if (lines[i].trim()) {
      html += `<p>${inline(lines[i])}</p>`;
      i += 1;
    } else {
      i += 1;
    }
  }
  return html;
};

const blocks = source.split(/^## /m).slice(1).map((block) => {
  const lines = block.trim().split(/\r?\n/);
  const title = lines.shift();
  const content = renderContent(lines);
  return `<section class="creative"><h2>${inline(title)}</h2>${content}</section>`;
}).join('');

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Prot+ — Manual Canva dos 30 Criativos</title>
<style>
@page{size:A4;margin:15mm 14mm 17mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#243029;font-size:9pt;line-height:1.35;margin:0}h1,h2{color:#174e3c}h1{font-size:27pt;line-height:1.08;margin:0 0 12px}h2{font-size:18pt;border-bottom:2px solid #d7a94b;padding-bottom:5px;margin:0 0 12px}.cover{min-height:245mm;display:flex;flex-direction:column;justify-content:center}.eyebrow{text-transform:uppercase;letter-spacing:1.5px;color:#b47b16;font-size:9pt;font-weight:bold}.subtitle{font-size:14pt;color:#506158;max-width:145mm}.box{background:#f3f7f2;border-left:4px solid #d7a94b;padding:10px 12px;margin:12px 0}.small{font-size:9pt;color:#506158}.creative{page-break-before:always}.creative p{margin:7px 0}.creative p strong{color:#174e3c}table{width:100%;border-collapse:collapse;margin:8px 0 12px;table-layout:fixed}th,td{border:1px solid #cfd8d1;padding:5px 6px;vertical-align:top;overflow-wrap:anywhere}th{background:#174e3c;color:#fff;text-align:left;font-size:8pt}td{font-size:7.8pt}th:first-child,td:first-child{width:8%}th:nth-child(2),td:nth-child(2){width:22%}th:nth-child(3),td:nth-child(3){width:27%}th:nth-child(4),td:nth-child(4){width:20%}th:nth-child(5),td:nth-child(5){width:23%}.footer{font-size:8.5pt;color:#758078;margin-top:14px;border-top:1px solid #d5ddd6;padding-top:6px}
</style></head><body>
<section class="cover"><div class="eyebrow">Prot+ · Canva · Meta Ads</div><h1>Manual Canva dos<br>30 Criativos</h1><p class="subtitle">Storyboard operacional com tempo, cena, fala, texto na tela e edição para o designer executar os vídeos sem interpretar o roteiro.</p><div class="box"><strong>Uso:</strong> grave em 9:16, mostre comida ou ação antes da explicação e teste pelo menos duas versões do gancho. Não use depoimentos inventados, antes/depois ou promessas clínicas.</div><p><strong>Oferta:</strong> Prot+ — receitas proteicas, ferramentas de organização, bônus e acesso vitalício, conforme as condições publicadas.</p><p class="small">Documento de produção e testes — autoria: Pedro Henrique — 2026</p></section>
<section class="pagebreak"><h2>Como avaliar os testes</h2><div class="box"><strong>Primeira rodada:</strong> começar pelos criativos 05, 12, 15, 17, 25, 27, 01 e 30. Eles cobrem desejo visual, história, desafio, ferramenta, prova de produto e oferta.</div><p>Medir retenção inicial, cliques qualificados e conversão. Viralidade sem clique ou venda não é vitória para esta oferta. Conferir no produto real todas as telas e informações apresentadas antes da publicação.</p></section>
${blocks}</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({ path: fileURLToPath(new URL('./30-criativos-producao.pdf', import.meta.url)), format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('PDF gerado: 05-criativos/30-criativos-producao.pdf');
