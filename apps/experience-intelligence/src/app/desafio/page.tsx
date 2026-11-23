"use client";
// Tela do desafio: texto original (sempre preservado), revisão da estrutura sugerida pela IA, resumo
// confirmado e a próxima pergunta, uma por vez. Retoma de onde parou após atualizar a página (C2-08).
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Loading, Titulo, Lead, Cartao, TituloCard, Mensagem, Voltar, TextoOriginal, Definicoes, Etiqueta } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Ajuda, BotaoLink } from "@/design-system/campos";
import { useSession } from "@/components/session";
import { StructureEditor } from "@/components/StructureEditor";
import { NextQuestion } from "@/components/NextQuestion";
import { canRetryInterpretation, getChallenge, interpretChallenge, listAnswers, type Interpretation, type InterpretationFailure } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";
import { FRAMING_QUESTIONS, framingProgress, nextFramingQuestion, openItems, type QuestionAnswer } from "@/domain/challenge/framing";
import type { Challenge, ChallengeStructure } from "@/domain/challenge/schemas";

const FALHA_IA: Record<InterpretationFailure, string> = {
  ocupado: "A organização automática está ocupada agora. Preencha com o que você sabe ou tente de novo em alguns minutos.",
  sem_chave: "A organização automática não está configurada. Preencha com o que você sabe.",
  limite: "O limite de organizações automáticas foi atingido por enquanto. Preencha com o que você sabe.",
  desativado: "A organização automática está pausada. Preencha com o que você sabe.",
  sem_acesso: "A plataforma está em fase de testes, com acesso por convite.",
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
        <Titulo>Desafio não encontrado</Titulo>
        <Lead>{erro || "Este desafio não existe ou pertence a outra empresa ou negócio."}</Lead>
        <div><Button asChild variant="outline"><Link href="/">Voltar ao início</Link></Button></div>
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
      <Voltar href="/">← Seus desafios</Voltar>
      <Titulo>{c.title || "Seu desafio"}</Titulo>

      <Cartao className="gap-2">
        <TituloCard>O que você escreveu</TituloCard>
        <Ajuda>Guardado exatamente como você escreveu. Não muda quando você edita o restante.</Ajuda>
        <TextoOriginal>{c.original_statement}</TextoOriginal>
      </Cartao>

      {!confirmado && (
        iaEstado === "carregando" || iaEstado === "idle" ? (
          <Cartao><p className="m-0 text-center text-base text-muted-foreground" role="status">Organizando o que você contou…</p></Cartao>
        ) : (
          <>
            {iaEstado !== "pronto" && (
              <Cartao>
                <Mensagem tipo="erro">{FALHA_IA[iaEstado]}</Mensagem>
                {canRetryInterpretation(iaEstado) && (
                  <div className="flex justify-end"><Button type="button" variant="outline" onClick={pedirIa}>Tentar de novo</Button></div>
                )}
              </Cartao>
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
          <Cartao>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <TituloCard>Como entendemos até agora</TituloCard>
              <BotaoLink onClick={() => setEditando(true)}>Editar</BotaoLink>
            </div>
            <Definicoes>
              {c.affected_people.length > 0 && <div><dt>Quem vive essa situação</dt><dd><ul>{c.affected_people.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              {c.context_json?.site && <div><dt>Onde acontece</dt><dd>{c.context_json.site}</dd></div>}
              {c.desired_outcome && <div><dt>O que deveria melhorar</dt><dd>{c.desired_outcome}</dd></div>}
              {c.known_information.length > 0 && <div><dt>O que já se sabe (ainda sem verificação)</dt><dd><ul>{c.known_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
              {c.unknown_information.length > 0 && <div><dt>O que ainda não se sabe</dt><dd><ul>{c.unknown_information.map((p) => <li key={p}>{p}</li>)}</ul></dd></div>}
            </Definicoes>
          </Cartao>

          {proxima ? (
            <NextQuestion key={proxima.key} challengeId={c.id} question={proxima} progress={progresso} onAnswered={carregar} />
          ) : (
            <Cartao>
              <Etiqueta tom="sucesso">Primeiro entendimento concluído</Etiqueta>
              <TituloCard>Você terminou as primeiras perguntas</TituloCard>
              <p className="m-0">O próximo passo será orientar como descobrir, na prática, o que ainda não se sabe. Essa etapa ainda está em construção na plataforma. Tudo o que você registrou está guardado.</p>
            </Cartao>
          )}

          {respondidas.length > 0 && (
            <Cartao>
              <TituloCard>O que você contou</TituloCard>
              <Definicoes>
                {respondidas.map((r) => (
                  <div key={r.question_key}><dt>{FRAMING_QUESTIONS.find((q) => q.key === r.question_key)?.wording}</dt><dd>{r.answer_summary}</dd></div>
                ))}
              </Definicoes>
            </Cartao>
          )}

          {pendencias.length > 0 && (
            <Cartao>
              <TituloCard>Ainda não sabemos</TituloCard>
              <ul className="m-0 grid list-none gap-2.5 p-0">
                {pendencias.map(({ question, answer }) => {
                  const rota = question.unknown.find((o) => o.route === answer.unknown_route);
                  return (
                    <li key={question.key} className="grid gap-1.5 rounded-md border border-border bg-muted/40 px-4 py-3">
                      <b className="block font-bold text-foreground">{question.wording}</b>
                      {rota && <span className="text-[0.9375rem]"><Etiqueta tom="neutro">{rota.label}</Etiqueta> {rota.instruction}</span>}
                    </li>
                  );
                })}
              </ul>
            </Cartao>
          )}
        </>
      )}
    </Shell>
  );
}

export default function Pagina() {
  return <Suspense fallback={<Shell><Loading /></Shell>}><Desafio /></Suspense>;
}
