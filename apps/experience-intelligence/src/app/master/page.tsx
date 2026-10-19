"use client";
// Área da usuária master: clientes, desafios de cada cliente e desafio completo (somente leitura).
// Cada abertura fica registrada na auditoria do cliente e no registro da plataforma.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { useSession } from "@/components/session";
import { isMaster, masterChallenge, masterChallenges, masterOrganizations, type MasterChallengeRow, type MasterOrganization } from "@/application/master";
import { mensagemDeErro } from "@/application/errors";
import { FRAMING_QUESTIONS } from "@/domain/challenge/framing";

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
const AVISO = <p className="notice">Cada vez que você abre um cliente ou um desafio, o acesso fica registrado na auditoria daquele cliente.</p>;

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
        <p style={{ margin: "0 0 12px" }}><Link href={c ? `/master/?org=${c.organization_id}` : "/master/"}>← Desafios do cliente</Link></p>
        {erro && <p className="msg err" role="alert">{erro}</p>}
        {!c ? <h1>Desafio não encontrado</h1> : (
          <>
            <span className="tag gray">{det!.organization_name}</span>
            <h1 style={{ marginTop: 8 }}>{c.title || "Desafio sem nome"}</h1>
            {AVISO}
            <section className="card"><h2>O que o cliente escreveu</h2><p className="original">{c.original_statement}</p></section>
            <section className="card">
              <h2>Como foi entendido</h2>
              <dl className="kv">
                <div><dt>Situação</dt><dd>{c.structure_status === "confirmed" ? "Confirmado pelo cliente" : "Aguardando confirmação do cliente"}</dd></div>
                {c.affected_people?.length > 0 && <div><dt>Quem vive essa situação</dt><dd><ul>{c.affected_people.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
                {c.context_json?.site && <div><dt>Onde acontece</dt><dd>{c.context_json.site}</dd></div>}
                {c.desired_outcome && <div><dt>O que deveria melhorar</dt><dd>{c.desired_outcome}</dd></div>}
                {c.known_information?.length > 0 && <div><dt>O que já se sabe</dt><dd><ul>{c.known_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
                {c.unknown_information?.length > 0 && <div><dt>O que ainda não se sabe</dt><dd><ul>{c.unknown_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              </dl>
            </section>
            {det!.answers.length > 0 && (
              <section className="card">
                <h2>Respostas</h2>
                <dl className="kv">
                  {det!.answers.map((a) => (
                    <div key={a.question_key}>
                      <dt>{FRAMING_QUESTIONS.find((q) => q.key === a.question_key)?.wording ?? a.question_key}</dt>
                      <dd>{a.status === "answered" ? a.answer_summary : a.status === "pending" ? "Deixado para depois" : "Não sabe ainda"}</dd>
                    </div>
                  ))}
                </dl>
              </section>
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
        <p style={{ margin: "0 0 12px" }}><Link href="/master/">← Clientes</Link></p>
        <h1>{nome || "Desafios do cliente"}</h1>
        {AVISO}
        {erro && <p className="msg err" role="alert">{erro}</p>}
        {!lista && !erro && <Loading />}
        {lista && lista.length === 0 && <p className="lead">Este cliente ainda não criou desafios.</p>}
        {lista && lista.length > 0 && (
          <ul className="list-items">
            {lista.map((d) => (
              <li key={d.id}><Link href={`/master/?desafio=${d.id}`}><b>{d.title || d.original_statement.slice(0, 90)}</b><small>Criado em {data(d.created_at)}</small></Link></li>
            ))}
          </ul>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <h1>Clientes</h1>
      <p className="lead">Organizações cadastradas na plataforma.</p>
      {erro && <p className="msg err" role="alert">{erro}</p>}
      {!orgs && !erro && <Loading />}
      {orgs && orgs.length === 0 && <p className="lead">Nenhuma organização cadastrada ainda.</p>}
      {orgs && orgs.length > 0 && (
        <ul className="list-items">
          {orgs.map((o) => (
            <li key={o.id}><Link href={`/master/?org=${o.id}`}><b>{o.name}</b><small>{[o.industry, `${o.members} ${o.members === 1 ? "pessoa" : "pessoas"}`, `${o.challenges} ${o.challenges === 1 ? "desafio" : "desafios"}`, `desde ${data(o.created_at)}`].filter(Boolean).join(" · ")}</small></Link></li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

export default function Pagina() {
  return <Suspense fallback={<Shell><Loading /></Shell>}><Master /></Suspense>;
}
