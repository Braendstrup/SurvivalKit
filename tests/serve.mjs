// Minimal statisk server til udvikling og test (kun Node-standardbibliotek).
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json', '.pbf': 'application/x-protobuf', '.pmtiles': 'application/octet-stream', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm' };

export function serve(root, port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = join(root, normalize(p));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    let st; try { st = statSync(file); } catch { res.writeHead(404).end('Ikke fundet'); return; }
    if (!st.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(fileURLToPath(new URL('..', import.meta.url)), process.argv[2] || 'app');
  const { port } = await serve(root, Number(process.argv[3] || 8080));
  console.log(`Server ${root} på http://127.0.0.1:${port}/`);
}
