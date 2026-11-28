// Política de Privacidade (public/privacidade/index.html), em React com o DS (D-053, lote S7). Texto idêntico.
// Peças do DS: Logo, Button (link), Selo, Heading, Prosa (texto longo, em compartilhado/TextoDaPolitica), RodapeSite (compacto), AvisoCookies e
// BotaoWhatsApp (PecasDoSite).
import { abrirAvisoCookies } from "@/components/ui/aviso-cookies";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Logo } from "@/components/ui/logo";
import { RodapeSite } from "@/components/ui/rodape-site";
import { Selo } from "@/components/ui/selo";
import { PecasDoSite } from "@/compartilhado/PecasDoSite";
import { ATUALIZACAO_DA_POLITICA, TextoDaPolitica } from "@/compartilhado/TextoDaPolitica";

export function Privacidade() {
  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <header>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
          <a href="/" aria-label="Dani Moscatelli - Experience Design Studio" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Logo className="h-12" />
          </a>
          <Button asChild variant="link" className="px-0 has-[>svg]:px-0">
            <a href="/">Voltar ao site</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-[var(--content-reading)] px-6 pb-16 pt-6 box-content">
          <Selo tone="primary">LGPD</Selo>
          <Heading level={1} className="mt-4">
            Política de Privacidade
          </Heading>
          <p className="mt-3 text-body-sm text-muted-foreground">{ATUALIZACAO_DA_POLITICA}</p>
          <TextoDaPolitica className="mt-8" />
        </article>
      </main>

      <RodapeSite
        variante="compacto"
        copyright="© 2026 Dani Moscatelli • Experience Design Studio. Todos os direitos reservados."
        credito={null}
        onPreferenciasCookies={abrirAvisoCookies}
        espacoFlutuante
      />
      <PecasDoSite />
    </div>
  );
}
