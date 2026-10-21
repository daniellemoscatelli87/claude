"use client";
// Início. Sem conta: landing page do produto (entrar em /entrar/, cadastro em /cadastro/). Sem dados pessoais: etapa 1. Sem empresa ou
// negócio: etapa 2. Sem desafios: chamada para o primeiro desafio. Com desafios: a área de trabalho.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, Loading } from "@/components/Shell";
import { Landing } from "@/components/Landing";
import { OrganizationForm } from "@/components/OrganizationForm";
import { useSession } from "@/components/session";
import { listChallenges } from "@/application/challenges";
import { hasPlatformAccess } from "@/application/organizations";
import { isMaster } from "@/application/master";
import { PersonalForm } from "@/components/PersonalForm";
import { BarraProgresso } from "@/design-system/campos";
import { contextoIncompleto } from "@/domain/organization/context";
import { Building2, Target } from "lucide-react";
import { mensagemDeErro } from "@/application/errors";
import type { Challenge } from "@/domain/challenge/schemas";

const ETAPA: Record<string, string> = {
  intake: "Conferir como entendemos",
  framing: "Entendendo a situação",
};

export default function Inicio() {
  const { loading, session, current, profile } = useSession();
  const [desafios, setDesafios] = useState<Challenge[] | null>(null);
  const [erro, setErro] = useState("");
  const [acesso, setAcesso] = useState<boolean | null>(null);

  // A master não é tratada como cliente: não precisa do perfil pessoal para entrar.
  const semPerfil = Boolean(session) && !profile && !isMaster(session);

  useEffect(() => {
    if (!current || semPerfil) return;
    setDesafios(null);
    listChallenges(current.id).then(setDesafios).catch((e) => setErro(mensagemDeErro(e)));
  }, [current, semPerfil]);

  // Fase de testes: sem organização, só quem foi convidada pode criar uma.
  useEffect(() => {
    if (loading || !session || current) return;
    hasPlatformAccess().then(setAcesso).catch(() => setAcesso(false));
  }, [loading, session, current]);

  if (loading) return <Shell><Loading /></Shell>;

  if (!session) {
    return (
      <Shell largo publico>
        <Landing />
      </Shell>
    );
  }

  if (semPerfil) {
    return (
      <Shell>
        <h1>Complete seu cadastro</h1>
        <BarraProgresso atual={1} total={2} />
        <PersonalForm modo="completar" email={session?.user.email} />
      </Shell>
    );
  }
  if (!current && acesso === null) return <Shell><Loading /></Shell>;
  if (!current && !acesso) {
    return (
      <Shell>
        <h1>Acesso por convite</h1>
        <p className="lead">A plataforma está em fase de testes e, por enquanto, só pessoas convidadas conseguem usar. Se você recebeu um convite, entre com o mesmo e-mail do convite e confirme esse e-mail pelo link que enviamos.</p>
      </Shell>
    );
  }
  if (!current) {
    return (
      <Shell>
        <h1>{profile ? "Crie sua conta" : "Complete seu cadastro"}</h1>
        <BarraProgresso atual={2} total={2} />
        <OrganizationForm etapa />
      </Shell>
    );
  }

  // Primeiro acesso: chamada para o primeiro desafio (o primeiro discovery).
  if (desafios && desafios.length === 0) {
    return (
      <Shell>
        <section className="card primeiro">
          <span className="icone"><Target size={26} aria-hidden="true" /></span>
          <p className="eyebrow" style={{ display: "flex" }}>Sua empresa está pronta</p>
          <h1>Seu primeiro desafio começa aqui.</h1>
          <p className="lead">Conte o que precisa melhorar. Vamos organizar as informações e orientar os próximos passos para entender o que acontece.</p>
          <Link href="/desafio/novo/" className="btn btn-primary btn-block">Descrever meu primeiro desafio</Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Seus desafios</h1>
        <Link href="/desafio/novo/" className="btn btn-primary">Novo desafio</Link>
      </div>
      {current.role === "org_admin" && contextoIncompleto(current) && (
        <div className="card aviso-card">
          <Building2 size={22} aria-hidden="true" />
          <div className="stack" style={{ gap: 8 }}>
            <p style={{ margin: 0 }}><b>Conte um pouco mais sobre sua empresa ou negócio.</b> Essas informações ajudam a adaptar as orientações ao seu contexto.</p>
            <Link href="/organizacao/">Completar informações</Link>
          </div>
        </div>
      )}
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
