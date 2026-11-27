// Versão para o servidor, usada só no build (scripts/montar-saida.mjs): grava o HTML pronto de cada página.
import { StrictMode, createElement } from "react";
import { renderToString } from "react-dom/server";
import { PAGINAS } from "./paginas/registro";

export function renderizar(id: string): string {
  const Pagina = PAGINAS[id];
  if (!Pagina) throw new Error(`Página sem componente em src/paginas/registro.ts: ${id}`);
  return renderToString(<StrictMode>{createElement(Pagina)}</StrictMode>);
}
