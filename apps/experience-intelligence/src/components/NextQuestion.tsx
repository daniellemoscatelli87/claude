"use client";
// Próxima pergunta de enquadramento, uma por vez (C2-05), com "Não sei" e alternativas práticas (C2-06).
import { useState } from "react";
import type { FramingQuestion, UnknownOption } from "@/domain/challenge/framing";
import { answerQuestion } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";

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
    <section className="card stack" aria-labelledby="pergunta">
      <span className="progress">Pergunta {progress.done + 1} de {progress.total}</span>
      <h2 id="pergunta" style={{ margin: 0 }}>{question.wording}</h2>
      <p className="hint" style={{ margin: 0 }}>{question.help}</p>
      {!naoSei ? (
        <>
          <label className="sr-only" htmlFor="resposta">Sua resposta</label>
          <textarea id="resposta" value={resposta} onChange={(e) => setResposta(e.target.value)} rows={3} maxLength={2000} placeholder={question.placeholder} />
          {erro && <p className="msg err" role="alert">{erro}</p>}
          <div className="row end">
            <button type="button" className="btn btn-ghost" onClick={() => { setNaoSei(true); setErro(""); }}>Não sei</button>
            <button type="button" className="btn btn-primary" disabled={enviando || !resposta.trim()} onClick={() => salvar("answered")}>{enviando ? "Salvando…" : "Responder"}</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ margin: 0 }}>Tudo bem não saber. Escolha como seguir:</p>
          <div className="routes" role="group" aria-label="Como seguir sem essa informação">
            {question.unknown.map((o) => (
              <button key={o.route} type="button" className="route" aria-pressed={rota?.route === o.route} onClick={() => setRota(o)}>
                <b>{o.label}</b>
                <span>{o.instruction}</span>
              </button>
            ))}
          </div>
          {erro && <p className="msg err" role="alert">{erro}</p>}
          <div className="row end">
            <button type="button" className="btn btn-ghost" onClick={() => { setNaoSei(false); setRota(null); }}>Voltar</button>
            <button type="button" className="btn btn-primary" disabled={enviando || !rota}
              onClick={() => rota && salvar(rota.route === "pending" ? "pending" : "unknown", rota.route)}>
              {enviando ? "Salvando…" : rota?.route === "pending" ? "Deixar para depois" : "Combinado, seguir"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
