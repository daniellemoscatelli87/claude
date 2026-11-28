// Página 404 (public/404.html), em React com o DS (D-053, lote S7). Mesmos textos e o mesmo link.
// Peças do DS: Logo (link para o início), PaginaDeErro (código, título, texto e ação), Button.
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { PaginaDeErro } from "@/components/ui/estado-vazio";
import { NOME_DO_ESTUDIO } from "@/compartilhado/marca";

export function Erro404() {
  return (
    <PaginaDeErro
      className="bg-background"
      ilustracao={<Logo rotulo={NOME_DO_ESTUDIO} className="mx-auto h-14" />}
      titulo="Página não encontrada"
      descricao={
        <>
          <span className="sr-only">Erro 404. </span>O endereço pode ter mudado ou não existe mais.
        </>
      }
      acoes={
        <Button asChild size="lg">
          <a href="/">Ir para a página inicial</a>
        </Button>
      }
    />
  );
}
