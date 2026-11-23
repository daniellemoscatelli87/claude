// Aviso de privacidade da fase de testes, em página própria (link direto).
import { Cartao, Shell, Titulo } from "@/components/Shell";
import { AvisoPrivacidade } from "@/components/AvisoPrivacidade";
import { AVISO_TITULO } from "@/domain/privacy/aviso";

export default function Aviso() {
  return (
    <Shell>
      <Titulo>{AVISO_TITULO}</Titulo>
      <Cartao className="gap-0"><AvisoPrivacidade /></Cartao>
    </Shell>
  );
}
