// Servidor estático que imita o Cloudflare Pages: /pasta/ -> pasta/index.html; sem arquivo -> 404.html (404).
const http = require("http"), fs = require("fs"), path = require("path");
const RAIZ = process.argv[2], PORTA = +process.argv[3] || 4310;
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(RAIZ, p);
  if (p.endsWith("/")) f = path.join(f, "index.html");
  else if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { res.writeHead(308, { Location: p + "/" }); return res.end(); }
  if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": TIPOS[".html"] }); return res.end(fs.readFileSync(path.join(RAIZ, "404.html"))); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
}).listen(PORTA, () => console.log("ok " + PORTA));
