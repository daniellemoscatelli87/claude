"use client";
// Revisar, editar e confirmar a estrutura do desafio (C2-03). A sugestão da IA aparece como proposta;
// o texto original não é editável aqui.
import { useState } from "react";
import { ChallengeStructureSchema, structureSource, type ChallengeStructure } from "@/domain/challenge/schemas";
import { confirmStructure, type Interpretation } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";

const linhas = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
const juntar = (l: string[] | undefined) => (l ?? []).join("\n");

export function StructureEditor({ challengeId, initial, ai, editing, onSaved, onCancel }: {
  challengeId: string;
  initial: ChallengeStructure | null;
  ai: Interpretation | null;
  editing: boolean;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const base = initial ?? { title: "", desired_outcome: "", affected_people: [], context: { channels: [] }, known_information: [], unknown_information: [] };
  const [f, setF] = useState({
    title: base.title,
    affected_people: juntar(base.affected_people),
    site: base.context.site ?? "",
    department: base.context.department ?? "",
    channels: (base.context.channels ?? []).join(", "),
    industry: base.context.industry ?? "",
    desired_outcome: base.desired_outcome ?? "",
    known_information: juntar(base.known_information),
    unknown_information: juntar(base.unknown_information),
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const estrutura = {
      title: f.title,
      desired_outcome: f.desired_outcome,
      affected_people: linhas(f.affected_people),
      context: {
        site: f.site.trim() || undefined,
        department: f.department.trim() || undefined,
        industry: f.industry.trim() || undefined,
        channels: f.channels.split(",").map((c) => c.trim()).filter(Boolean),
      },
      known_information: linhas(f.known_information),
      unknown_information: linhas(f.unknown_information),
    };
    const ok = ChallengeStructureSchema.safeParse(estrutura);
    if (!ok.success) return setErro("Dê um nome ao desafio (de 3 a 120 caracteres) e confira os campos.");
    setEnviando(true);
    try {
      const fonte = editing ? "manual" : structureSource(ai?.proposal ?? null, ok.data);
      await confirmStructure(challengeId, ok.data, fonte, ai?.meta, editing ? "Estrutura editada" : undefined);
      onSaved();
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEnviando(false);
    }
  }

  return (
    <form className="card stack" onSubmit={salvar} noValidate>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{editing ? "Editar como entendemos" : "Confira como entendemos"}</h2>
        {!editing && ai && <span className="tag">Sugestão para você revisar</span>}
      </div>
      {!editing && <p className="hint" style={{ margin: 0 }}>{ai ? "Organizamos o que você contou. Corrija o que não estiver certo e complete o que souber. Nada aqui é conclusão." : "Preencha com o que você já sabe. Pode deixar campos em branco."}</p>}
      <label>Nome do desafio
        <input value={f.title} onChange={set("title")} maxLength={120} required />
      </label>
      <label>Quem vive essa situação <span className="hint">Um grupo por linha.</span>
        <textarea value={f.affected_people} onChange={set("affected_people")} rows={3} />
      </label>
      <label>Onde acontece <span className="hint">Unidade, local ou etapa.</span>
        <input value={f.site} onChange={set("site")} maxLength={200} />
      </label>
      <div className="row" style={{ alignItems: "stretch" }}>
        <label style={{ flex: "1 1 200px" }}>Área
          <input value={f.department} onChange={set("department")} maxLength={120} />
        </label>
        <label style={{ flex: "1 1 200px" }}>Segmento
          <input value={f.industry} onChange={set("industry")} maxLength={80} />
        </label>
      </div>
      <label>Canais <span className="hint">Separe por vírgula. Ex.: presencial, telefone, site.</span>
        <input value={f.channels} onChange={set("channels")} />
      </label>
      <label>O que deveria melhorar para as pessoas
        <textarea value={f.desired_outcome} onChange={set("desired_outcome")} rows={3} maxLength={600} />
      </label>
      <label>O que já se sabe <span className="hint">Um item por linha. É o que foi contado, ainda sem verificação.</span>
        <textarea value={f.known_information} onChange={set("known_information")} rows={3} />
      </label>
      <label>O que ainda não se sabe <span className="hint">Um item por linha.</span>
        <textarea value={f.unknown_information} onChange={set("unknown_information")} rows={3} />
      </label>
      {erro && <p className="msg err" role="alert">{erro}</p>}
      <div className="row end">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
        <button className="btn btn-primary" disabled={enviando}>{enviando ? "Salvando…" : editing ? "Salvar alterações" : "Está certo, continuar"}</button>
      </div>
    </form>
  );
}
