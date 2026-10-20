"use client";
// Nome da pessoa (D-022): obrigatório. Aparece ao lado do avatar e pode ser editado no perfil.
import { useState } from "react";
import { UserRound } from "lucide-react";
import { saveDisplayName } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { useSession } from "./session";

export function NameForm({ inicial = "", compacto = false, onSaved }: { inicial?: string; compacto?: boolean; onSaved?: () => void }) {
  const { reload } = useSession();
  const [nome, setNome] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    try {
      await saveDisplayName(nome);
      await reload();
      onSaved?.();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const campo = (
    <label>{compacto ? "Seu nome" : "Como podemos chamar você?"}
      <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} autoComplete="name" required />
    </label>
  );
  if (compacto) {
    return (
      <form className="stack" onSubmit={enviar} noValidate>
        {campo}
        {erro && <p className="msg err" role="alert">{erro}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Salvando…" : "Salvar nome"}</button>
      </form>
    );
  }
  return (
    <>
      <p className="eyebrow"><UserRound size={18} aria-hidden="true" /> Sua conta</p>
      <h1>Antes de começar, como podemos chamar você?</h1>
      <p className="lead">Seu nome aparece no seu perfil e no histórico do que você registrar na organização.</p>
      <form className="card stack" onSubmit={enviar} noValidate>
        {campo}
        {erro && <p className="msg err" role="alert">{erro}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Salvando…" : "Continuar"}</button>
      </form>
    </>
  );
}
