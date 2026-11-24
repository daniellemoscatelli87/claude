"use client";
// Revisar, editar e confirmar a estrutura do desafio (C2-03). A sugestão da IA aparece como proposta;
// o texto original não é editável aqui.
import { cloneElement, useId, useState } from "react";
import { ChallengeStructureSchema, structureSource, type ChallengeStructure } from "@/domain/challenge/schemas";
import { confirmStructure, type Interpretation } from "@/application/challenges";
import { mensagemDeErro } from "@/application/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ajuda } from "@/design-system/campos";
import { Cartao, Etiqueta, Mensagem, TituloCard } from "./Shell";

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
    <Cartao>
    <form className="flex flex-col gap-4" onSubmit={salvar} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <TituloCard>{editing ? "Editar como entendemos" : "Confira como entendemos"}</TituloCard>
        {!editing && ai && <Etiqueta>Sugestão para você revisar</Etiqueta>}
      </div>
      {!editing && <Ajuda>{ai ? "Organizamos o que você contou. Corrija o que não estiver certo e complete o que souber. Nada aqui é conclusão." : "Preencha com o que você já sabe. Pode deixar campos em branco."}</Ajuda>}
      <Livre rotulo="Nome do desafio"><Input value={f.title} onChange={set("title")} maxLength={120} required /></Livre>
      <Livre rotulo="Quem vive essa situação" dica="Um grupo por linha."><Textarea value={f.affected_people} onChange={set("affected_people")} rows={3} className="min-h-20 resize-y" /></Livre>
      <Livre rotulo="Onde acontece" dica="Unidade, local ou etapa."><Input value={f.site} onChange={set("site")} maxLength={200} /></Livre>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Livre rotulo="Área"><Input value={f.department} onChange={set("department")} maxLength={120} /></Livre>
        <Livre rotulo="Segmento"><Input value={f.industry} onChange={set("industry")} maxLength={80} /></Livre>
      </div>
      <Livre rotulo="Canais" dica="Separe por vírgula. Ex.: presencial, telefone, site."><Input value={f.channels} onChange={set("channels")} /></Livre>
      <Livre rotulo="O que deveria melhorar para as pessoas"><Textarea value={f.desired_outcome} onChange={set("desired_outcome")} rows={3} maxLength={600} className="min-h-20 resize-y" /></Livre>
      <Livre rotulo="O que já se sabe" dica="Um item por linha. É o que foi contado, ainda sem verificação."><Textarea value={f.known_information} onChange={set("known_information")} rows={3} className="min-h-20 resize-y" /></Livre>
      <Livre rotulo="O que ainda não se sabe" dica="Um item por linha."><Textarea value={f.unknown_information} onChange={set("unknown_information")} rows={3} className="min-h-20 resize-y" /></Livre>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editing ? "Salvar alterações" : "Está certo, continuar"}</Button>
      </div>
    </form>
    </Cartao>
  );
}

/** Rótulo do DS com a dica dentro do rótulo (o nome acessível do campo continua com a dica, como antes). */
function Livre({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactElement<{ id?: string }> }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="flex-wrap gap-x-1.5 gap-y-0.5 leading-snug">{rotulo}{dica && <span className="text-[0.8125rem] font-normal text-muted-foreground">{dica}</span>}</Label>
      {cloneElement(children, { id })}
    </div>
  );
}
