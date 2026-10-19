"use client";
// Tela do desafio: texto original (sempre preservado), revisão da estrutura sugerida pela IA, resumo
// confirmado e a próxima pergunta, uma por vez. Retoma de onde parou após atualizar a página (C2-08).
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { useSession } from "@/components/session";
import { StructureEditor } from "@/components/StructureEditor";
import { NextQuestion } from "@/components/NextQuestion";
import { getChallenge, interpretChallenge, listAnswers, type Interpretation, type InterpretationFailure } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";
import { FRAMING_QUESTIONS, framingProgress, nextFramingQuestion, openItems, type QuestionAnswer } from "@/domain/challenge/framing";
import type { Challenge, ChallengeStructure } from "@/domain/challenge/schemas";

const FALHA_IA: Record<InterpretationFailure, string> = {
  ocupado: "A organização automática está ocupada agora. Preencha com o que você sabe ou tente de novo em alguns minutos.",
  sem_chave: "A organização automática não está configurada. Preencha com o que você sabe.",
  falha: "Não foi possível organizar automaticamente. Preencha com o que você sabe.",
};

function estruturaAtual(c: Challenge): ChallengeStructure {
  return {
    title: c.title ?? "",
    desired_outcome: c.desired_outcome ?? "",
    affected_people: c.affected_people ?? [],
    context: { ...(c.context_json ?? {}), channels: c.context_json?.channels ?? [] },
    known_information: c.known_information ?? [],
    unknown_information: c.unknown_information ?? [],
  };
}

function Desafio() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const router = useRouter();
  const { loading, session } = useSession();
  const [c, setC] = useState<Challenge | null | undefined>(undefined);
  const [respostas, setRespostas] = useState<QuestionAnswer[]>([]);
  const [ia, setIa] = useState<Interpretation | null>(null);
  const [iaEstado, setIaEstado] = useState<"idle" | "carregando" | "pronto" | InterpretationFailure>("idle");
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState("");
  const pediuIa = useRef(false);

  const carregar = useCallback(async () => {
    try {
      const [d, r] = await Promise.all([getChallenge(id), listAnswers(id).catch(() => [])]);
      setC(d); setRespostas(r);
    } catch (e) { setErro(mensagemDeErro(e)); setC(null); }
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (!session) { router.replace("/"); return; }
    if (!id) { setC(null); return; }
    carregar();
  }, [loading, session, id, carregar, router]);

  const pedirIa = useCallback(async () => {
    setIaEstado("carregando");
    const r = await interpretChallenge(id);
    if (r.ok) { setIa(r.value); setIaEstado("pronto"); } else setIaEstado(r.reason);
  }, [id]);

  useEffect(() => {
    if (c && c.structure_status === "pending" && !pediuIa.current) { pediuIa.current = true; pedirIa(); }
  }, [c, pedirIa]);

  if (loading || c === undefined) return <Shell><Loading /></Shell>;
  if (c === null) {
    return (
      <Shell>
        <h1>Desafio não encontrado</h1>
        <p className="lead">{erro || "Este desafio não existe ou pertence a outra organização."}</p>
        <Link href="/" className="btn btn-ghost">Voltar ao início</Link>
      </Shell>
    );
  }

  const confirmado = c.structure_status === "confirmed";
  const proxima = nextFramingQuestion(c, respostas);
  const progresso = framingProgress(c, respostas);
  const pendencias = openItems(respostas);
  const respondidas = respostas.filter((r) => r.status === "answered");
  const recarregar = () => { setEditando(false); carregar(); };

  return (
    <Shell>
      <p style={{ margin: "0 0 12px" }}><Link href="/">← Seus desafios</Link></p>
      <h1>{c.title || "Seu desafio"}</h1>

      <section className="card">
        <h2>O que você escreveu</h2>
        <p className="hint" style={{ margin: 0 }}>Guardado exatamente como você escreveu. Não muda quando você edita o restante.</p>
        <p className="original">{c.original_statement}</p>
      </section>

      {!confirmado && (
        iaEstado === "carregando" || iaEstado === "idle" ? (
          <section className="card"><p className="lead center" role="status" style={{ margin: 0 }}>Organizando o que você contou…</p></section>
        ) : (
          <>
            {iaEstado !== "pronto" && (
              <div className="card stack">
                <p className="msg err" role="alert">{FALHA_IA[iaEstado]}</p>
                <div className="row end"><button type="button" className="btn btn-ghost" onClick={pedirIa}>Tentar de novo</button></div>
              </div>
            )}
            <StructureEditor key={iaEstado} challengeId={c.id} initial={ia?.proposal ?? null} ai={ia} editing={false} onSaved={recarregar} />
          </>
        )
      )}

      {confirmado && editando && (
        <StructureEditor challengeId={c.id} initial={estruturaAtual(c)} ai={null} editing onSaved={recarregar} onCancel={() => setEditando(false)} />
      )}

      {confirmado && !editando && (
        <>
          <section className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 style={{ margin: 0 }}>Como entendemos até agora</h2>
              <button type="button" className="btn-link" onClick={() => setEditando(true)}>Editar</button>
            </div>
            <dl className="kv" style={{ marginTop: 12 }}>
              {c.affected_people.length > 0 && <div><dt>Quem vive essa situação</dt><dd><ul>{c.affected_people.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              {c.context_json?.site && <div><dt>Onde acontece</dt><dd>{c.context_json.site}</dd></div>}
              {c.desired_outcome && <div><dt>O que deveria melhorar</dt><dd>{c.desired_outcome}</dd></div>}
              {c.known_information.length > 0 && <div><dt>O que já se sabe (ainda sem verificação)</dt><dd><ul>{c.known_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              {c.unknown_information.length > 0 && <div><dt>O que ainda não se sabe</dt><dd><ul>{c.unknown_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
            </dl>
          </section>

          {proxima ? (
            <NextQuestion key={proxima.key} challengeId={c.id} question={proxima} progress={progresso} onAnswered={carregar} />
          ) : (
            <section className="card stack">
              <span className="tag green" style={{ justifySelf: "start" }}>Primeiro entendimento concluído</span>
              <h2 style={{ margin: 0 }}>Você terminou as primeiras perguntas</h2>
              <p style={{ margin: 0 }}>O próximo passo será orientar como descobrir, na prática, o que ainda não se sabe. Essa etapa ainda está em construção na plataforma. Tudo o que você registrou está guardado.</p>
            </section>
          )}

          {respondidas.length > 0 && (
            <section className="card">
              <h2>O que você contou</h2>
              <dl className="kv">
                {respondidas.map((r) => (
                  <div key={r.question_key}><dt>{FRAMING_QUESTIONS.find((q) => q.key === r.question_key)?.wording}</dt><dd>{r.answer_summary}</dd></div>
                ))}
              </dl>
            </section>
          )}

          {pendencias.length > 0 && (
            <section className="card">
              <h2>Ainda não sabemos</h2>
              <ul className="list-items">
                {pendencias.map(({ question, answer }) => {
                  const rota = question.unknown.find((o) => o.route === answer.unknown_route);
                  return (
                    <li key={question.key} className="card soft" style={{ margin: 0 }}>
                      <b style={{ display: "block", color: "var(--dark)" }}>{question.wording}</b>
                      {rota && <span><span className="tag gray">{rota.label}</span> {rota.instruction}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </Shell>
  );
}

export default function Pagina() {
  return <Suspense fallback={<Shell><Loading /></Shell>}><Desafio /></Suspense>;
}
