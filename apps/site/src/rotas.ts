// Páginas do site público e o corte página a página (D-053). A mesma lista (rotas.json) é lida pelo build
// (vite.config.ts e scripts/montar-saida.mjs).
import dados from "./rotas.json";

export type EstadoReact = "previa" | "publicada";
export type Cabeca = { titulo: string; meta?: [string, string, string][]; canonical?: string };
export type Pagina = { id: string; caminho: string | null; saida: string; origem: string; lote: string; cabeca?: Cabeca };

export const PAGINAS_DO_SITE = dados.paginas as Pagina[];
export const REACT = dados.react as Record<string, EstadoReact>;
