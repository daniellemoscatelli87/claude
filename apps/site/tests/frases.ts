// Frases visíveis de uma página de HTML, para conferir que a versão em React tem os mesmos textos.
export function textoVisivel(html: string) {
  let h = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, "");
  for (let i = 0; i < 5; i++) h = h.replace(/<(span|svg|p|div)\b[^>]*aria-hidden="true"[^>]*>(?:(?!<\1\b)[\s\S])*?<\/\1>/g, "");
  return h;
}
const decodificar = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const normalizar = (s: string) => decodificar(s).replace(/\s+/g, " ").trim();

/** Cada trecho de texto entre marcas (normalizado), sem os vazios e sem pontuação solta. */
export function frasesDe(html: string): string[] {
  return textoVisivel(html)
    .split(/<[^>]+>/)
    .map(normalizar)
    .filter((t) => t.length > 1 && /[\p{L}\d]/u.test(t));
}

/** Todo o texto de um HTML num só, normalizado (para procurar as frases dentro). */
export function textoCorrido(html: string) {
  return normalizar(textoVisivel(html).replace(/<[^>]+>/g, " "));
}
