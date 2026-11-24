"use client";
// "O que você quer melhorar?" (C2-01, C2-07). O texto é guardado exatamente como a pessoa escreveu.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading, Titulo, Lead, Cartao, Mensagem } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      <Titulo>O que você quer melhorar?</Titulo>
      <Lead>Conte com suas palavras o que está acontecendo e o que gostaria que fosse diferente. Não precisa saber a causa nem ter uma solução.</Lead>
      <Cartao>
      <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <label htmlFor="texto" className="sr-only">Descreva a situação</label>
        <Textarea id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} rows={7} className="min-h-44 resize-y"
          placeholder="Ex.: Muitas pessoas reclamam da espera na recepção." aria-describedby="aviso-dados" />
        <Mensagem tipo="aviso" id="aviso-dados">Não escreva nomes, documentos, contatos nem informações de saúde de pessoas. Descreva a situação de forma geral.</Mensagem>
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        <Button type="submit" className="w-full" disabled={enviando}>{enviando ? "Guardando…" : "Continuar"}</Button>
      </form>
      </Cartao>
    </Shell>
  );
}
