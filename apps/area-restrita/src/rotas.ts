// Páginas da área restrita e o corte página a página (D-051).
// A mesma lista (rotas.json) é lida pelo build (scripts/montar-saida.mjs), que publica cada página em React no lugar certo.
import dados from "./rotas.json";

export type EstadoReact = "previa" | "publicada";
export type Pagina = { id: string; caminho: string; rotulo: string; icone?: string; contador?: string; sub?: Pagina[] };

export const PAGINAS = dados.paginas as Pagina[];
export const OUTRAS = dados.outras as Pagina[];
export const REACT = dados.react as Record<string, EstadoReact>;

/** Raiz das páginas de HTML (produção) e da prévia em React. */
export const RAIZ_ADMIN = "/admin";
export const RAIZ_PREVIA = "/admin/app";

/** Base do roteador: na prévia, /admin/app; depois do corte, /admin. */
export function baseDoRoteador(pathname: string): string {
  return pathname === RAIZ_PREVIA || pathname.startsWith(RAIZ_PREVIA + "/") ? RAIZ_PREVIA : RAIZ_ADMIN;
}

/** Todas as páginas (menu, subitens e as que ficam fora do menu), sem repetir o mesmo id. */
export function todasAsPaginas(): Pagina[] {
  const vistas = new Map<string, Pagina>();
  for (const p of [...PAGINAS, ...PAGINAS.flatMap((x) => x.sub ?? []), ...OUTRAS]) if (!vistas.has(p.id)) vistas.set(p.id, p);
  return [...vistas.values()];
}

/**
 * Para onde um link da casca leva.
 * - Página já em React e servida na base atual: navegação do roteador (sem recarregar).
 *   Na prévia, toda página em React (prévia ou publicada); em /admin, só as publicadas.
 * - Senão: a página de HTML em /admin/<caminho>, com recarga.
 */
export function destino(id: string, base: string, react: Record<string, EstadoReact> = REACT): { interno: boolean; href: string } {
  const p = todasAsPaginas().find((x) => x.id === id);
  if (!p) throw new Error(`Página desconhecida: ${id}`);
  const estado = react[id];
  const emReact = base === RAIZ_PREVIA ? !!estado : estado === "publicada";
  return emReact ? { interno: true, href: "/" + p.caminho } : { interno: false, href: `${RAIZ_ADMIN}/${p.caminho}` };
}

/**
 * Link de dados (por exemplo "/admin/contatos/?id=1" de uma notificação) na base atual: navegação interna se a
 * página já estiver em React nessa base; senão, o endereço de HTML como veio.
 */
export function resolverHref(href: string, base: string, react: Record<string, EstadoReact> = REACT): { interno: boolean; href: string } {
  const m = /^\/admin\/([^?#]*)([?#].*)?$/.exec(href);
  if (!m) return { interno: false, href };
  const caminho = m[1] === "" ? "" : m[1].endsWith("/") ? m[1] : m[1] + "/";
  const p = todasAsPaginas().find((x) => x.caminho === caminho);
  if (!p) return { interno: false, href };
  const d = destino(p.id, base, react);
  return d.interno ? { interno: true, href: d.href + (m[2] || "") } : { interno: false, href };
}
