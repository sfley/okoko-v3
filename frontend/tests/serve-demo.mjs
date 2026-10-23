// Test the static files at the exact subdirectory used by GitHub Pages.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('../demo-dist');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.svg':'image/svg+xml'};
createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (!pathname.startsWith('/okoko-v3/')) {res.writeHead(404).end();return;}
    const file = resolve(root, '.' + pathname.slice('/okoko-v3'.length) + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root+'/')) {res.writeHead(403).end();return;}
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'}).end(body);
  } catch {res.writeHead(404).end();}
}).listen(4173,'127.0.0.1',()=>console.log('Static demo at http://127.0.0.1:4173/okoko-v3/'));
