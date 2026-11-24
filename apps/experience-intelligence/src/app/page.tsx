"use client";
// Início. Sem conta: entrar (o cadastro fica em /cadastro/). Sem dados pessoais: etapa 1. Sem empresa ou
// negócio: etapa 2. Sem desafios: chamada para o primeiro desafio. Com desafios: a área de trabalho.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, Loading, Titulo, Lead, Mensagem, Cartao, ListaDeLinks } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";
import { OrganizationForm } from "@/components/OrganizationForm";
import { useSession } from "@/components/session";
import { listChallenges } from "@/application/challenges";
import { hasPlatformAccess } from "@/application/organizations";
import { isMaster } from "@/application/master";
import { PersonalForm } from "@/components/PersonalForm";
import { BarraProgresso } from "@/design-system/campos";
import { contextoIncompleto } from "@/domain/organization/context";
import { Building2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Selo } from "@/components/ui/selo";
import { classeLink } from "@/design-system/classes";
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
      <Shell>
        <Titulo>O que você quer melhorar na experiência das pessoas que atende?</Titulo>
        <Lead className="mb-1">Comece contando a situação com suas palavras. Depois, você é guiado passo a passo para entender o que acontece, sem precisar conhecer nenhum método.</Lead>
        <AuthForm />
      </Shell>
    );
  }

  if (semPerfil) {
    return (
      <Shell>
        <Titulo>Complete seu cadastro</Titulo>
        <BarraProgresso atual={1} total={2} />
        <PersonalForm modo="completar" email={session?.user.email} />
      </Shell>
    );
  }
  if (!current && acesso === null) return <Shell><Loading /></Shell>;
  if (!current && !acesso) {
    return (
      <Shell>
        <Titulo>Acesso por convite</Titulo>
        <Lead>A plataforma está em fase de testes e, por enquanto, só pessoas convidadas conseguem usar. Se você recebeu um convite, entre com o mesmo e-mail do convite e confirme esse e-mail pelo link que enviamos.</Lead>
      </Shell>
    );
  }
  if (!current) {
    return (
      <Shell>
        <Titulo>{profile ? "Crie sua conta" : "Complete seu cadastro"}</Titulo>
        <BarraProgresso atual={2} total={2} />
        <OrganizationForm etapa />
      </Shell>
    );
  }

  // Primeiro acesso: chamada para o primeiro desafio (o primeiro discovery).
  if (desafios && desafios.length === 0) {
    return (
      <Shell>
        <Cartao className="items-start">
          <span className="inline-grid size-12 place-items-center rounded-lg bg-primary-muted text-primary-text"><Target size={26} aria-hidden="true" /></span>
          <Selo>Sua empresa está pronta</Selo>
          <Titulo>Seu primeiro desafio começa aqui.</Titulo>
          <Lead>Conte o que precisa melhorar. Vamos organizar as informações e orientar os próximos passos para entender o que acontece.</Lead>
          <Button asChild className="w-full"><Link href="/desafio/novo/">Descrever meu primeiro desafio</Link></Button>
        </Cartao>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Titulo>Seus desafios</Titulo>
        <Button asChild><Link href="/desafio/novo/">Novo desafio</Link></Button>
      </div>
      {current.role === "org_admin" && contextoIncompleto(current) && (
        <Cartao className="flex-row items-start gap-3">
          <Building2 size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-text" />
          <div className="flex flex-col gap-2">
            <p className="m-0"><b className="font-bold">Conte um pouco mais sobre sua empresa ou negócio.</b> Essas informações ajudam a adaptar as orientações ao seu contexto.</p>
            <p className="m-0"><Link href="/organizacao/" className={classeLink}>Completar informações</Link></p>
          </div>
        </Cartao>
      )}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {!desafios && !erro && <Loading />}
      {desafios && (
        <ListaDeLinks itens={desafios.map((d) => ({
          id: d.id, href: `/desafio/?id=${d.id}`, titulo: d.title || d.original_statement.slice(0, 90),
          detalhe: `${ETAPA[d.current_phase] ?? "Em andamento"} · criado em ${new Date(d.created_at).toLocaleDateString("pt-BR")}`,
        }))} />
      )}
    </Shell>
  );
}
