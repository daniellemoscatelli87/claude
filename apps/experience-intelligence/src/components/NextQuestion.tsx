"use client";
// Próxima pergunta de enquadramento, uma por vez (C2-05), com "Não sei" e alternativas práticas (C2-06).
import { useState } from "react";
import type { FramingQuestion, UnknownOption } from "@/domain/challenge/framing";
import { answerQuestion } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { Ajuda } from "@/design-system/campos";
import { Cartao, Mensagem, TituloCard } from "./Shell";

export function NextQuestion({ challengeId, question, progress, onAnswered }: {
  challengeId: string;
  question: FramingQuestion;
  progress: { done: number; total: number };
  onAnswered: () => void;
}) {
  const [resposta, setResposta] = useState("");
  const [naoSei, setNaoSei] = useState(false);
  const [rota, setRota] = useState<UnknownOption | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(status: "answered" | "unknown" | "pending", route?: UnknownOption["route"]) {
    setErro(""); setEnviando(true);
    try {
      await answerQuestion(challengeId, question, status, resposta, route);
      setResposta(""); setNaoSei(false); setRota(null);
      onAnswered();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Cartao role="region" aria-labelledby="pergunta">
      <span className="text-[0.8125rem] font-semibold text-muted-foreground">Pergunta {progress.done + 1} de {progress.total}</span>
      <TituloCard id="pergunta">{question.wording}</TituloCard>
      <Ajuda>{question.help}</Ajuda>
      {!naoSei ? (
        <>
          <label className="sr-only" htmlFor="resposta">Sua resposta</label>
          <Textarea id="resposta" value={resposta} onChange={(e) => setResposta(e.target.value)} rows={3} maxLength={2000} placeholder={question.placeholder} className="min-h-24 resize-y" />
          {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => { setNaoSei(true); setErro(""); }}>Não sei</Button>
            <Button type="button" disabled={enviando || !resposta.trim()} onClick={() => salvar("answered")}>{enviando ? "Salvando…" : "Responder"}</Button>
          </div>
        </>
      ) : (
        <>
          <p className="m-0">Tudo bem não saber. Escolha como seguir:</p>
          {/* Cards selecionáveis no padrão do DS: hover com borda mais forte e sombra média; selecionado com borda primária de 2 px, check e aria-pressed */}
          <div className="grid gap-2.5" role="group" aria-label="Como seguir sem essa informação">
            {question.unknown.map((o) => {
              const sel = rota?.route === o.route;
              return (
                <button key={o.route} type="button" aria-pressed={sel} onClick={() => setRota(o)}
                  className={cn("relative grid gap-1 rounded-xl bg-card px-4 py-3 pr-11 text-left text-[0.9375rem] font-normal text-foreground transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none",
                    sel ? "border-2 border-primary px-[15px] py-[11px]" : "border border-border hover:border-[var(--border-strong)] hover:shadow-md")}>
                  <b className="font-bold">{o.label}</b>
                  <span className="text-muted-foreground">{o.instruction}</span>
                  {sel && <span className="absolute top-3 right-3 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span>}
                </button>
              );
            })}
          </div>
          {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => { setNaoSei(false); setRota(null); }}>Voltar</Button>
            <Button type="button" disabled={enviando || !rota}
              onClick={() => rota && salvar(rota.route === "pending" ? "pending" : "unknown", rota.route)}>
              {enviando ? "Salvando…" : rota?.route === "pending" ? "Deixar para depois" : "Combinado, seguir"}
            </Button>
          </div>
        </>
      )}
    </Cartao>
  );
}
