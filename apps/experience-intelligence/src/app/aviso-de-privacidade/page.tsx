// Aviso de privacidade da fase de testes, em página própria (link direto).
import { Shell } from "@/components/Shell";
import { AvisoPrivacidade } from "@/components/AvisoPrivacidade";
import { AVISO_TITULO } from "@/domain/privacy/aviso";

export default function Aviso() {
  return (
    <Shell>
      <h1>{AVISO_TITULO}</h1>
      <div className="card aviso-pagina"><AvisoPrivacidade /></div>
    </Shell>
  );
}
