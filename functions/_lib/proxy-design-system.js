// Endereços antigos do design system no domínio do site (/designsystem e /DaniMoscatelli-DesignSystem):
// desde 13/11/2026 o design system fica em https://designsystem.danimoscatelli.com.br, e estes caminhos
// levam para lá (redirecionamento permanente), mantendo o resto do caminho e a busca.
const DESTINO = 'https://designsystem.danimoscatelli.com.br/';

export function proxyDesignSystem(context) {
  const { request, params } = context;
  const partes = Array.isArray(params.path) ? params.path : [];
  const destino = new URL(partes.map(encodeURIComponent).join('/'), DESTINO);
  destino.search = new URL(request.url).search;
  return Response.redirect(destino.toString(), 301);
}
