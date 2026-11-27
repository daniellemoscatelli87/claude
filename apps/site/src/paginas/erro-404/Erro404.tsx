// Página 404 (public/404.html), em React com o DS (D-053, lote S7). Mesmos textos e o mesmo link.
// Peças do DS: Selo, Heading, Button. FALTA no DS: PaginaDeErro (ou EstadoVazio) e Logo; até lá, a composição abaixo.
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Selo } from "@/components/ui/selo";
import { LOGO, NOME_DO_ESTUDIO } from "@/compartilhado/marca";

export function Erro404() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-6 text-center">
      <div className="flex w-full max-w-120 flex-col items-center">
        <img src={LOGO} alt={NOME_DO_ESTUDIO} className="mb-8 block h-14 w-auto" />
        <Selo tone="primary">Erro 404</Selo>
        <Heading level={1} className="mt-4">
          Página não encontrada
        </Heading>
        <p className="mt-3 text-base leading-relaxed text-foreground">O endereço pode ter mudado ou não existe mais.</p>
        <Button asChild size="lg" className="mt-8">
          <a href="/">Ir para a página inicial</a>
        </Button>
      </div>
    </main>
  );
}
