// Página 404 (decisão da dona do produto, 28/11/2026): o card branco da PaginaDeErro do DS (moldura="card"), a uma
// distância padrão abaixo do cabeçalho do site (--espaco-abaixo-do-cabecalho), com o cabeçalho, o rodapé e as peças
// de todas as páginas (CascaDoSite). O mesmo conteúdo aparece quando um link de e-mail chega sem código válido
// (descadastro e autorizar galeria): sem formulário e sem botão desligado.
// Peças do DS: CabecalhoDoSite e RodapeSite (CascaDoSite), PaginaDeErro (selo "Erro 404", título, texto e ação), Button.
import { Button } from "@/components/ui/button";
import { PaginaDeErro } from "@/components/ui/estado-vazio";
import { CascaDoSite } from "@/compartilhado/site/CascaDoSite";

/** Só o card da 404 (para usar dentro de uma página que já tem a casca). */
export function ConteudoDoErro404() {
  return (
    <PaginaDeErro
      moldura="card"
      codigo="404"
      titulo="Página não encontrada"
      descricao="O endereço pode ter mudado ou não existe mais."
      acoes={
        <Button asChild size="lg">
          <a href="/">Ir para a página inicial</a>
        </Button>
      }
    />
  );
}

export function Erro404() {
  return (
    <CascaDoSite rodape="compacto">
      <ConteudoDoErro404 />
    </CascaDoSite>
  );
}
