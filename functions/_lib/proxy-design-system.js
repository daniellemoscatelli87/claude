// Encaminha os caminhos do design system para o GitHub Pages (equivalente
// às regras 200 de public/_redirects, que o Cloudflare Pages não aceita
// para URLs externas).
const ORIGEM = 'https://daniellemoscatelli87.github.io/DaniMoscatelli-DesignSystem/';

export function proxyDesignSystem(context) {
  const { request, params } = context;
  const partes = Array.isArray(params.path) ? params.path : [];
  const destino = new URL(partes.map(encodeURIComponent).join('/'), ORIGEM);
  destino.search = new URL(request.url).search;
  return fetch(destino.toString(), { method: request.method, redirect: 'follow' });
}
