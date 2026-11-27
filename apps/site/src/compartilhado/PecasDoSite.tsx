// Peças de todas as páginas do site em React, todas do DS: aviso de cookies (com a medição de acessos) e botão do
// WhatsApp. Substituem public/analytics.js e public/whatsapp.js nas páginas já migradas.
import { useEffect } from "react";
import { AvisoCookies, lerEscolhaCookies } from "@/components/ui/aviso-cookies";
import { BotaoWhatsApp } from "@/components/ui/botao-whatsapp";
import { apagarCookiesDeMedicao, instalarEventos, ligarMedicao, medicaoLigada } from "./medicao";

export function AvisoDeCookiesComMedicao() {
  useEffect(() => {
    instalarEventos();
    if (lerEscolhaCookies() === "aceito") ligarMedicao();
  }, []);
  return (
    <AvisoCookies
      onAceitar={() => ligarMedicao()}
      onRecusar={() => {
        if (medicaoLigada()) {
          apagarCookiesDeMedicao();
          location.reload();
        }
      }}
    />
  );
}

export function PecasDoSite({ whatsapp = true }: { whatsapp?: boolean }) {
  return (
    <>
      <AvisoDeCookiesComMedicao />
      {whatsapp && <BotaoWhatsApp />}
    </>
  );
}
