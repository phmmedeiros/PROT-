import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let relative;
  if (urlPath === '/' || urlPath === '/index.html') {
    relative = '04-pagina/index.html';
  } else if (urlPath === '/obrigado' || urlPath === '/obrigado/' || urlPath === '/obrigado.html') {
    relative = '04-pagina/obrigado.html';
  } else if (urlPath === '/termos' || urlPath === '/termos/' || urlPath === '/termos.html') {
    relative = '04-pagina/termos.html';
  } else if (urlPath === '/privacidade' || urlPath === '/privacidade/' || urlPath === '/privacidade.html') {
    relative = '04-pagina/privacidade.html';
  } else if (urlPath === '/app/' || urlPath === '/app') {
    relative = '03-produto/app/index.html';
  } else if (urlPath.startsWith('/app/')) {
    relative = `03-produto/app/${urlPath.slice(5)}`;
  } else if (urlPath.startsWith('/dados/')) {
    relative = `03-produto/dados/${urlPath.slice(7)}`;
  } else if (urlPath.startsWith('/pdf/')) {
    relative = `03-produto/pdf/${urlPath.slice(5)}`;
  } else if (urlPath.startsWith('/images/')) {
    relative = `04-pagina/images/${urlPath.slice(8)}`;
  } else {
    relative = urlPath.slice(1);
  }

  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(4174, '127.0.0.1', () => console.log('Prot+ preview: http://127.0.0.1:4174/'));
