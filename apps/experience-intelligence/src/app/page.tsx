"use client";
// Início. Sem conta: criar conta ou entrar. Sem organização: criar a organização. Sem desafios: vai direto
// para "O que você quer melhorar?" (a experiência começa pelo problema, não por um painel vazio).
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";
import { OrganizationForm } from "@/components/OrganizationForm";
import { useSession } from "@/components/session";
import { listChallenges } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";
import type { Challenge } from "@/domain/challenge/schemas";

const ETAPA: Record<string, string> = {
  intake: "Conferir como entendemos",
  framing: "Entendendo a situação",
};

export default function Inicio() {
  const { loading, session, current } = useSession();
  const router = useRouter();
  const [desafios, setDesafios] = useState<Challenge[] | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!current) return;
    setDesafios(null);
    listChallenges(current.id)
      .then((lista) => { if (lista.length === 0) router.replace("/desafio/novo/"); else setDesafios(lista); })
      .catch((e) => setErro(mensagemDeErro(e)));
  }, [current, router]);

  if (loading) return <Shell><Loading /></Shell>;

  if (!session) {
    return (
      <Shell>
        <h1>O que você quer melhorar na experiência das pessoas que atende?</h1>
        <p className="lead">Comece contando a situação com suas palavras. Depois, você é guiado passo a passo para entender o que acontece, sem precisar conhecer nenhum método.</p>
        <AuthForm />
      </Shell>
    );
  }

  if (!current) return <Shell><OrganizationForm first /></Shell>;

  return (
    <Shell>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Seus desafios</h1>
        <Link href="/desafio/novo/" className="btn btn-primary">Novo desafio</Link>
      </div>
      {erro && <p className="msg err" role="alert">{erro}</p>}
      {!desafios && !erro && <Loading />}
      {desafios && (
        <ul className="list-items">
          {desafios.map((d) => (
            <li key={d.id}>
              <Link href={`/desafio/?id=${d.id}`}>
                <b>{d.title || d.original_statement.slice(0, 90)}</b>
                <small>{ETAPA[d.current_phase] ?? "Em andamento"} · criado em {new Date(d.created_at).toLocaleDateString("pt-BR")}</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
