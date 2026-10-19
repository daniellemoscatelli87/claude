"use client";
// Criar organização (C1-02). Quem cria passa a administrar a organização.
import { useState } from "react";
import { createOrganization, setCurrentOrganizationId } from "@/application/organizations";
import { mensagemDeErro } from "@/application/errors";
import { useSession } from "./session";

export function OrganizationForm({ first }: { first: boolean }) {
  const { reload } = useSession();
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    try {
      const id = await createOrganization({ name: nome, industry: segmento });
      setCurrentOrganizationId(id);
      await reload();
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
    }
  }

  return (
    <>
      <h1>{first ? "Para começar, qual é a sua organização?" : "Nova organização"}</h1>
      <p className="lead">Tudo o que você registrar fica dentro dela e só as pessoas da organização conseguem ver.</p>
      <form className="card stack" onSubmit={enviar} noValidate>
        <label>Nome da organização
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoComplete="organization" required />
        </label>
        <label>Segmento <span className="hint">Opcional. Ex.: saúde, hotelaria, varejo, educação.</span>
          <input value={segmento} onChange={(e) => setSegmento(e.target.value)} maxLength={80} />
        </label>
        {erro && <p className="msg err" role="alert">{erro}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Criando…" : "Continuar"}</button>
      </form>
    </>
  );
}
