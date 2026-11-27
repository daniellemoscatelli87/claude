// Casca das páginas do site (lote S1): cabeçalho, gaveta de contato, rodapé, aviso de cookies com a medição e botão do
// WhatsApp, todos do DS. Substitui o HTML de src/compartilhado/partes.ts, menu.ts e menu.css nas páginas em React.
// Peças do DS: CabecalhoDoSite, RodapeSite, AvisoCookies, BotaoWhatsApp (PecasDoSite), SidePanel (GavetaDeContato).
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { abrirAvisoCookies } from "@/components/ui/aviso-cookies";
import { CabecalhoDoSite } from "@/components/ui/cabecalho-do-site";
import { Logo } from "@/components/ui/logo";
import { RodapeSite } from "@/components/ui/rodape-site";
import { PecasDoSite } from "@/compartilhado/PecasDoSite";
import { LOGO_CORRIGIDO } from "@/compartilhado/marca";
import { GavetaDeContato } from "./GavetaDeContato";
import { ITENS_DO_MENU, registrarEvento, type PaginaDoMenu } from "./navegacao";

const ContextoDoContato = createContext<() => void>(() => {});
/** Abre a gaveta de contato (botão "Contato" do cabeçalho e outros chamados da página). */
export const useAbrirContato = () => useContext(ContextoDoContato);

const LINKS_DO_RODAPE = [
  { href: "/", rotulo: "Home" },
  { href: "/projeto-piloto/", rotulo: "Projeto Piloto" },
  { href: "/rede-parceiros/", rotulo: "Seja Parceiro" },
  { href: "/privacidade/", rotulo: "Política de privacidade" },
];

export type CascaDoSiteProps = {
  atual: PaginaDoMenu;
  /** Fundo atrás do cabeçalho no topo da página (foto ou fundo escuro: "escura"). */
  superficie?: "clara" | "escura";
  /** "fixed": o cabeçalho fica por cima do hero (foto de ponta a ponta); "sticky": no fluxo da página. */
  posicaoDoCabecalho?: "sticky" | "fixed";
  rodape: "claro" | "escuro" | "compacto";
  children: ReactNode;
  /** Peças fixas da página (pílula de ação, botão subir), dentro da casca. */
  flutuantes?: ReactNode;
};

export function CascaDoSite({ atual, superficie = "clara", posicaoDoCabecalho = "sticky", rodape, children, flutuantes }: CascaDoSiteProps) {
  const [contato, setContato] = useState(false);

  // Eventos de medição dos links do cabeçalho (os mesmos da página de HTML).
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-slot="cabecalho-do-site"] a[href]');
      const item = a && ITENS_DO_MENU.find((i) => i.href === a.getAttribute("href"));
      if (item) registrarEvento(item.evento);
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  return (
    <ContextoDoContato.Provider value={() => setContato(true)}>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-card px-4 py-2 font-semibold text-primary-text focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Pular para o conteúdo
      </a>
      <CabecalhoDoSite
        itens={ITENS_DO_MENU}
        atual={atual}
        superficie={superficie}
        posicao={posicaoDoCabecalho}
        logo={{
          completo: <Logo variante="horizontal" superficie={superficie === "escura" ? "escura" : "clara"} className="h-11" {...LOGO_CORRIGIDO} />,
          simbolo: <Logo variante="simbolo" className="h-10" {...LOGO_CORRIGIDO} />,
        }}
        acao={{ rotulo: "Contato", onClick: () => setContato(true) }}
      />
      {children}
      <RodapeSite
        variante={rodape}
        logo={rodape === "escuro" ? "/logo-dm-fundo-escuro.svg" : rodape === "claro" ? "/logo-dm.png" : undefined}
        links={LINKS_DO_RODAPE}
        copyright="© 2026 Dani Moscatelli Experience Design Studio. Todos os direitos reservados."
        onPreferenciasCookies={abrirAvisoCookies}
        espacoFlutuante
      />
      {flutuantes}
      <PecasDoSite />
      <GavetaDeContato aberta={contato} aoMudar={setContato} />
    </ContextoDoContato.Provider>
  );
}
