"use client";
// Área da usuária master: clientes, desafios de cada cliente e desafio completo (somente leitura).
// Cada abertura fica registrada na auditoria do cliente e no registro da plataforma.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Loading, Titulo, Lead, Cartao, TituloCard, Mensagem, Voltar, TextoOriginal, Definicoes, Etiqueta, ListaDeLinks } from "@/components/Shell";
import { useSession } from "@/components/session";
import { isMaster, masterChallenge, masterChallenges, masterOrganizations, type MasterChallengeRow, type MasterOrganization } from "@/application/master";
import { mensagemDeErro } from "@/application/errors";
import { FRAMING_QUESTIONS } from "@/domain/challenge/framing";

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
const AVISO = <Mensagem tipo="aviso">Cada vez que você abre um cliente ou um desafio, o acesso fica registrado na auditoria daquele cliente.</Mensagem>;

function Master() {
  const { loading, session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const org = params.get("org"), desafio = params.get("desafio");
  const [orgs, setOrgs] = useState<MasterOrganization[] | null>(null);
  const [lista, setLista] = useState<MasterChallengeRow[] | null>(null);
  const [det, setDet] = useState<Awaited<ReturnType<typeof masterChallenge>> | undefined>(undefined);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isMaster(session)) { router.replace("/"); return; }
    setErro("");
    if (desafio) masterChallenge(desafio).then(setDet).catch((e) => setErro(mensagemDeErro(e)));
    else if (org) masterChallenges(org).then(setLista).catch((e) => setErro(mensagemDeErro(e)));
    else masterOrganizations().then(setOrgs).catch((e) => setErro(mensagemDeErro(e)));
  }, [loading, session, org, desafio, router]);

  if (loading || !isMaster(session)) return <Shell><Loading /></Shell>;

  if (desafio) {
    if (det === undefined && !erro) return <Shell><Loading /></Shell>;
    const c = det?.challenge;
    return (
      <Shell>
        <Voltar href={c ? `/master/?org=${c.organization_id}` : "/master/"}>← Desafios do cliente</Voltar>
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {!c ? <Titulo>Desafio não encontrado</Titulo> : (
          <>
            <Etiqueta tom="neutro">{det!.organization_name}</Etiqueta>
            <Titulo>{c.title || "Desafio sem nome"}</Titulo>
            {AVISO}
            <Cartao className="gap-2"><TituloCard>O que o cliente escreveu</TituloCard><TextoOriginal>{c.original_statement}</TextoOriginal></Cartao>
            <Cartao>
              <TituloCard>Como foi entendido</TituloCard>
              <Definicoes>
                <div><dt>Situação</dt><dd>{c.structure_status === "confirmed" ? "Confirmado pelo cliente" : "Aguardando confirmação do cliente"}</dd></div>
                {c.affected_people?.length > 0 && <div><dt>Quem vive essa situação</dt><dd><ul>{c.affected_people.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
                {c.context_json?.site && <div><dt>Onde acontece</dt><dd>{c.context_json.site}</dd></div>}
                {c.desired_outcome && <div><dt>O que deveria melhorar</dt><dd>{c.desired_outcome}</dd></div>}
                {c.known_information?.length > 0 && <div><dt>O que já se sabe</dt><dd><ul>{c.known_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
                {c.unknown_information?.length > 0 && <div><dt>O que ainda não se sabe</dt><dd><ul>{c.unknown_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              </Definicoes>
            </Cartao>
            {det!.answers.length > 0 && (
              <Cartao>
                <TituloCard>Respostas</TituloCard>
                <Definicoes>
                  {det!.answers.map((a) => (
                    <div key={a.question_key}>
                      <dt>{FRAMING_QUESTIONS.find((q) => q.key === a.question_key)?.wording ?? a.question_key}</dt>
                      <dd>{a.status === "answered" ? a.answer_summary : a.status === "pending" ? "Deixado para depois" : "Não sabe ainda"}</dd>
                    </div>
                  ))}
                </Definicoes>
              </Cartao>
            )}
          </>
        )}
      </Shell>
    );
  }

  if (org) {
    const nome = orgs?.find((o) => o.id === org)?.name;
    return (
      <Shell>
        <Voltar href="/master/">← Clientes</Voltar>
        <Titulo>{nome || "Desafios do cliente"}</Titulo>
        {AVISO}
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {!lista && !erro && <Loading />}
        {lista && lista.length === 0 && <Lead>Este cliente ainda não criou desafios.</Lead>}
        {lista && lista.length > 0 && (
          <ListaDeLinks itens={lista.map((d) => ({ id: d.id, href: `/master/?desafio=${d.id}`, titulo: d.title || d.original_statement.slice(0, 90), detalhe: `Criado em ${data(d.created_at)}` }))} />
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <Titulo>Clientes</Titulo>
      <Lead>Organizações cadastradas na plataforma.</Lead>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {!orgs && !erro && <Loading />}
      {orgs && orgs.length === 0 && <Lead>Nenhuma organização cadastrada ainda.</Lead>}
      {orgs && orgs.length > 0 && (
        <ListaDeLinks itens={orgs.map((o) => ({ id: o.id, href: `/master/?org=${o.id}`, titulo: o.name, detalhe: [o.industry, `${o.members} ${o.members === 1 ? "pessoa" : "pessoas"}`, `${o.challenges} ${o.challenges === 1 ? "desafio" : "desafios"}`, `desde ${data(o.created_at)}`].filter(Boolean).join(" · ") }))} />
      )}
    </Shell>
  );
}

export default function Pagina() {
  return <Suspense fallback={<Shell><Loading /></Shell>}><Master /></Suspense>;
}
