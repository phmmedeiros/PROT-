import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let relative = urlPath === '/' ? '04-pagina/index.html' : urlPath === '/app/' ? '03-produto/app/index.html' : urlPath.startsWith('/app/') ? `03-produto/app/${urlPath.slice(5)}` : urlPath.startsWith('/dados/') ? `03-produto/dados/${urlPath.slice(7)}` : urlPath.slice(1);
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(4174, '127.0.0.1', () => console.log('Prot+ preview: http://127.0.0.1:4174/'));
