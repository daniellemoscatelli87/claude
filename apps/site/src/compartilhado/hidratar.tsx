// Liga o React no HTML que o build já gravou (scripts/montar-saida.mjs): a página aparece pronta antes do JavaScript
// e, quando ele carrega, os botões e campos passam a responder. Cada página chama hidratar() na sua entrada.
import { StrictMode, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import "../styles/site.css";

export function hidratar(pagina: ReactNode) {
  const raiz = document.getElementById("raiz");
  if (!raiz) throw new Error("Página sem o elemento #raiz");
  hydrateRoot(raiz, <StrictMode>{pagina}</StrictMode>);
}
