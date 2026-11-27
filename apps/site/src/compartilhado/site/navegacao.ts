// Itens do cabeçalho do site (os mesmos de src/compartilhado/partes.ts) e o evento de medição de cada um.
import type { ItemDoCabecalho } from "@/components/ui/cabecalho-do-site";

export type PaginaDoMenu = "inicio" | "projeto" | "parceiros";

export const ITENS_DO_MENU: (ItemDoCabecalho & { id: PaginaDoMenu; evento: string })[] = [
  { id: "inicio", href: "/", rotulo: "Home", evento: "clique_home" },
  { id: "projeto", href: "/projeto-piloto/", rotulo: "Projeto Piloto", evento: "clique_projeto_piloto" },
  { id: "parceiros", href: "/rede-parceiros/", rotulo: "Seja Parceiro", evento: "clique_quero_ser_parceiro" },
];

/** Evento de medição (window.dmEvento, que só registra com a medição ligada). */
export function registrarEvento(nome: string, params?: object) {
  (window as Window & { dmEvento?: (n: string, p?: object) => void }).dmEvento?.(nome, params);
}
