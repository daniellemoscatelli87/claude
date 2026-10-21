"use client";
// Aviso de cookies das páginas públicas (LGPD): a medição só começa depois de "Aceitar".
// Recusar é tão fácil quanto aceitar; a escolha pode ser revista pelo link "Preferências de cookies".
import { useEffect, useState } from "react";
import Link from "next/link";
import { ABRIR_COOKIES, GA_ID, escolhaSalva, iniciarMedicao, salvarEscolha } from "@/infrastructure/analytics";

export function AvisoCookies() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const escolha = escolhaSalva();
    if (escolha === "aceito") iniciarMedicao();
    else if (!escolha) setAberto(true);
    const abrir = () => setAberto(true);
    window.addEventListener(ABRIR_COOKIES, abrir);
    return () => window.removeEventListener(ABRIR_COOKIES, abrir);
  }, []);

  if (!GA_ID || !aberto) return null;

  function escolher(aceita: boolean) {
    salvarEscolha(aceita ? "aceito" : "recusado");
    if (aceita) iniciarMedicao();
    else window.gtag?.("consent", "update", { analytics_storage: "denied" });
    setAberto(false);
  }

  return (
    <div className="cookies" role="region" aria-label="Aviso de cookies">
      <p>Usamos cookies do Google Analytics para entender, de forma agregada, como esta página é usada. Você pode aceitar ou recusar. <Link href="/aviso-de-privacidade/">Aviso de privacidade</Link></p>
      <div className="cookies-acoes">
        <button type="button" className="btn btn-ghost" onClick={() => escolher(false)}>Recusar</button>
        <button type="button" className="btn btn-primary" onClick={() => escolher(true)}>Aceitar</button>
      </div>
    </div>
  );
}
