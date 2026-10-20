"use client";
// "O que você quer melhorar?" (C2-01, C2-07). O texto é guardado exatamente como a pessoa escreveu.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { useSession } from "@/components/session";
import { createChallenge } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";

export default function NovoDesafio() {
  const { loading, session, current } = useSession();
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => { if (!loading && (!session || !current)) router.replace("/"); }, [loading, session, current, router]);
  if (loading || !current) return <Shell><Loading /></Shell>;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    try {
      const id = await createChallenge(current!.id, texto);
      router.push(`/desafio/?id=${id}`);
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
    }
  }

  return (
    <Shell>
      <h1>O que você quer melhorar?</h1>
      <p className="lead">Conte com suas palavras o que está acontecendo e o que gostaria que fosse diferente. Não precisa saber a causa nem ter uma solução.</p>
      <form className="card stack" onSubmit={enviar} noValidate>
        <label htmlFor="texto" className="sr-only">Descreva a situação</label>
        <textarea id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} rows={7}
          placeholder="Ex.: Muitas pessoas reclamam da espera na recepção." aria-describedby="aviso-dados" />
        <p className="notice" id="aviso-dados">Não escreva nomes, documentos, contatos nem informações de saúde de pessoas. Descreva a situação de forma geral.</p>
        {erro && <p className="msg err" role="alert">{erro}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Guardando…" : "Continuar"}</button>
      </form>
    </Shell>
  );
}
