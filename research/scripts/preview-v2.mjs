// Local-only review server for the production output. Never forwards lead POSTs.
import http from 'node:http';
import path from 'node:path';
import { stat, access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
const root = path.resolve('dist');
const port = Number(process.env.V2_PREVIEW_PORT || 5188);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid local preview port');
await access(path.join(root, 'index.html'));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml', '.pdf':'application/pdf', '.woff':'font/woff', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain', '.webm':'video/webm', '.mp4':'video/mp4' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type':'application/json' });
    res.end(JSON.stringify({ ok:false, message:'This local preview does not submit requests. Your entries remain here for review.' }));
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Content-Length':info.size, 'Cache-Control':'no-store' });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/plain' });
    res.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`WPB V2 local preview: http://127.0.0.1:${port}/`));
