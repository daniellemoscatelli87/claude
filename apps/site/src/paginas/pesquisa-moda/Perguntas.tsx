// Cada tipo de pergunta da pesquisa, só com peças do DS: GrupoDeCartoesDeEscolha/CartaoDeEscolha (escolha única,
// matriz, sobre você), EscolhaOrdenada (classificação), Checkbox + Label (várias escolhas), GrupoDeEscalas/EscalaDeNotas
// (notas), Input ("Qual?"), Select (sobre você no celular) e a busca de cidade e bairro (Dialog + Command).
import { useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensagemDeErro } from "@/components/ui/campo";
import { CartaoDeEscolha, GrupoDeCartoesDeEscolha } from "@/components/ui/cartao-de-escolha";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EscalaDeNotas, GrupoDeEscalas } from "@/components/ui/escala-de-notas";
import { EscolhaOrdenada } from "@/components/ui/escolha-ordenada";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { realcar, semAcento, type CampoPerfil, type Multi, type Opcao, type Pergunta } from "./logica";

/** Título com os trechos em destaque (a cor de texto primária), como os <em> da página de HTML. */
export function Realce({ texto, trechos }: { texto: string; trechos?: string | string[] }) {
  return <>{realcar(texto, trechos).map((p, i) => (p.destaque ? <span key={i} className="text-primary-text">{p.t}</span> : p.t))}</>;
}

const Obrig = () => <span aria-hidden className="text-primary-text"> *</span>;

/** "Qual?" depois do "Outro": recebe o foco quando aparece. */
function CampoDoOutro({ id, valor, onValor, placeholder, maxLength }: { id: string; valor: string; onValor: (v: string) => void; placeholder: string; maxLength: number }) {
  return (
    <div className="space-y-2 pl-8">
      <Label htmlFor={id} className="text-body-sm font-semibold">Qual?</Label>
      <Input id={id} autoFocus value={valor} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onValor(e.target.value)} className="bg-card" />
    </div>
  );
}

export type PropsDaPergunta = {
  p: Pergunta; valor: unknown; mudar: (v: unknown) => void; legenda: string; faltando: string[];
  depoisDaOpcao?: (id: string) => ReactNode;
};

export function CorpoDaPergunta({ p, valor, mudar, legenda, faltando, depoisDaOpcao }: PropsDaPergunta) {
  if (p.tipo === "unica") {
    return (
      <GrupoDeCartoesDeEscolha aria-labelledby={legenda} name={p.id} value={typeof valor === "string" ? valor : ""} onValueChange={(v) => mudar(v)}>
        {p.opcoes!.map((o) => (
          <div key={o.id} className="contents">
            <CartaoDeEscolha valor={o.id} titulo={o.texto} />
            {depoisDaOpcao?.(o.id)}
          </div>
        ))}
      </GrupoDeCartoesDeEscolha>
    );
  }
  if (p.tipo === "ranking") {
    return (
      <EscolhaOrdenada
        aria-labelledby={legenda}
        name={p.id}
        maximo={p.max}
        opcoes={p.opcoes!.map((o) => ({ valor: o.id, titulo: o.texto, exclusiva: o.exclusiva }))}
        valor={Array.isArray(valor) ? (valor as string[]) : []}
        onValorChange={(v) => mudar(v)}
      />
    );
  }
  if (p.tipo === "multipla") return <VariasEscolhas p={p} valor={(valor as Multi) ?? { opcoes: [] }} mudar={mudar} />;
  if (p.tipo === "escalas") {
    const r = (valor as Record<string, number>) ?? {};
    return (
      <GrupoDeEscalas>
        {p.linhas!.map((l) => (
          <div key={l.id} data-linha={l.id}>
            <EscalaDeNotas
              name={`${p.id}-${l.id}`}
              rotulo={l.texto}
              descricao={l.apoio}
              minimo={p.min ?? 1}
              maximo={p.max ?? 10}
              rotuloMinimo={p.rotulo_min}
              rotuloMaximo={p.rotulo_max}
              valor={typeof r[l.id] === "number" ? r[l.id] : null}
              onValorChange={(n) => mudar({ ...r, [l.id]: n })}
              erro={faltando.includes(l.id) ? `Falta dar nota para: ${l.texto}.` : undefined}
            />
          </div>
        ))}
      </GrupoDeEscalas>
    );
  }
  // matriz: uma característica por grupo de cartões, com as respostas por extenso
  const r = (valor as Record<string, string>) ?? {};
  return (
    <div className="flex flex-col gap-6">
      {p.linhas!.map((l) => {
        const id = `${p.id}-${l.id}`;
        const falta = faltando.includes(l.id);
        return (
          <div key={l.id} data-linha={l.id} className={cn("space-y-3 rounded-lg border bg-card p-4", falta ? "border-error" : "border-border")}>
            <p id={`${id}-t`} className="text-body-sm font-semibold text-foreground">{l.texto}</p>
            <GrupoDeCartoesDeEscolha aria-labelledby={`${id}-t`} aria-invalid={falta || undefined} name={id} colunas={2} value={r[l.id] ?? ""} onValueChange={(v) => mudar({ ...r, [l.id]: v })}>
              {p.colunas!.map((c) => <CartaoDeEscolha key={c.id} valor={c.id} titulo={c.texto} />)}
            </GrupoDeCartoesDeEscolha>
            {falta && <MensagemDeErro>{`Falta responder: ${l.texto}.`}</MensagemDeErro>}
          </div>
        );
      })}
    </div>
  );
}

/** Várias escolhas, com limite, opção exclusiva e "Outro" (as regras de antes). */
function VariasEscolhas({ p, valor, mudar }: { p: Pergunta; valor: Multi; mudar: (v: unknown) => void }) {
  const sel = valor.opcoes;
  const alternar = (o: Opcao, marcar: boolean) => {
    let s = [...sel];
    if (marcar) s = o.exclusiva ? [o.id] : [...s.filter((x) => !p.opcoes!.find((y) => y.id === x)?.exclusiva), o.id];
    else s = s.filter((x) => x !== o.id);
    const m: Multi = { opcoes: s };
    if (valor.outro && s.some((x) => p.opcoes!.find((y) => y.id === x)?.outro)) m.outro = valor.outro;
    mudar(m);
  };
  const contagem = p.max ? `${sel.length} de ${p.max} escolhidas` + (sel.length >= p.max ? ". Para trocar, desmarque uma opção." : "") : sel.length ? `${sel.length} ${sel.length === 1 ? "escolhida" : "escolhidas"}` : "";
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-4">
        {p.opcoes!.map((o) => {
          const marcada = sel.includes(o.id);
          const cheio = !!p.max && sel.length >= p.max && !marcada && !o.exclusiva;
          const id = `${p.id}-${o.id}`;
          return (
            <li key={o.id} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Checkbox id={id} name={p.id} value={o.id} checked={marcada} disabled={cheio} onCheckedChange={(v) => alternar(o, v === true)} className="mt-0.5" />
                <Label htmlFor={id} className="text-body font-normal leading-snug text-foreground">{o.texto}</Label>
              </div>
              {o.outro && marcada && (
                <CampoDoOutro id={`pq-${p.id}-outro`} valor={valor.outro ?? ""} maxLength={200} placeholder="Conte para a gente" onValor={(v) => mudar({ ...valor, outro: v })} />
              )}
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="text-body-sm text-muted-foreground">{contagem}</p>
    </div>
  );
}

/** Sobre você (gênero, faixa etária, estado civil): cartões em duas colunas no computador, lista no celular. */
export function CampoDoPerfil({ c, valor, outro, mudar, mudarOutro, erro }: { c: CampoPerfil; valor: string; outro: string; mudar: (v: string) => void; mudarOutro: (v: string) => void; erro?: string }) {
  const tituloId = `pq-perfil-${c.id}-titulo`;
  const opOutro = c.opcoes.find((o) => o.outro);
  return (
    <div id={`pq-perfil-${c.id}`} className="flex flex-col gap-3">
      <p id={tituloId} className="text-body-sm font-semibold text-foreground">{c.texto}<Obrig /></p>
      <GrupoDeCartoesDeEscolha aria-labelledby={tituloId} aria-invalid={erro ? true : undefined} name={`perfil-${c.id}`} colunas={2} value={valor} onValueChange={mudar} className="max-sm:hidden">
        {c.opcoes.map((o) => <CartaoDeEscolha key={o.id} valor={o.id} titulo={o.texto} />)}
      </GrupoDeCartoesDeEscolha>
      <div className="sm:hidden">
        <Select value={valor || undefined} onValueChange={mudar}>
          <SelectTrigger aria-labelledby={tituloId} aria-invalid={erro ? true : undefined} className="w-full bg-card"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {c.opcoes.map((o) => <SelectItem key={o.id} value={o.id}>{o.texto.replace(/ \(especifique\)$/, "")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {opOutro && valor === opOutro.id && (
        <CampoDoOutro id={`pq-perfil-${c.id}-outro`} valor={outro} maxLength={100} placeholder="Como você se identifica" onValor={mudarOutro} />
      )}
      {erro && <MensagemDeErro id={`pq-perfil-${c.id}-erro`}>{erro}</MensagemDeErro>}
    </div>
  );
}

/** Cidade (28 da Região Metropolitana) e bairro (75, por regional): botão com o valor e janela com busca. */
export function CampoDeLista({ c, opcoes, valor, mudar, erro }: { c: CampoPerfil; opcoes: Opcao[]; valor: string; mudar: (v: string) => void; erro?: string }) {
  const [aberta, setAberta] = useState(false);
  const [busca, setBusca] = useState("");
  const ehBairro = c.id === "bairro";
  const id = `pq-perfil-${c.id}`;
  const escolhida = opcoes.find((o) => o.id === valor);
  // grupos na ordem das opções; "Prefiro não informar" no fim
  const grupos: { nome: string; itens: Opcao[] }[] = [];
  const soltas: Opcao[] = [];
  for (const o of opcoes) {
    if (o.id === "nao_informar") continue;
    if (!o.regional) { soltas.push(o); continue; }
    const nome = "Regional " + o.regional;
    const g = grupos.find((x) => x.nome === nome);
    if (g) g.itens.push(o); else grupos.push({ nome, itens: [o] });
  }
  const ni = opcoes.find((o) => o.id === "nao_informar");
  if (ni) soltas.push(ni);
  const item = (o: Opcao, grupo: string) => (
    <CommandItem key={o.id} value={o.id} keywords={[o.texto, grupo]} onSelect={() => { mudar(o.id); setAberta(false); }} className="min-h-11 justify-between">
      <span>{o.texto}</span>
      {o.id === valor && <Check aria-hidden className="text-primary-text" />}
    </CommandItem>
  );
  return (
    <div id={id} className="flex flex-col gap-2">
      <Label htmlFor={`${id}-bt`} className="inline text-body-sm font-semibold leading-snug"><Realce texto={c.texto_inicio ?? c.texto} trechos={c.destaque_inicio ?? c.destaque} /><Obrig /></Label>
      <Button id={`${id}-bt`} type="button" variant="outline" aria-haspopup="dialog" aria-invalid={erro ? true : undefined} aria-describedby={erro ? `${id}-erro` : undefined} onClick={() => { setBusca(""); setAberta(true); }} className={cn("w-full justify-between bg-card font-normal", !escolhida && "text-muted-foreground")}>
        <span className="truncate">{escolhida?.texto ?? "Selecione"}</span>
        <ChevronDown aria-hidden className="text-muted-foreground" />
      </Button>
      {erro && <MensagemDeErro id={`${id}-erro`}>{erro}</MensagemDeErro>}
      <Dialog open={aberta} onOpenChange={setAberta}>
        <DialogContent className="flex max-h-9/10 flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="px-6 pb-2 pt-6 pr-14 text-left">
            <DialogTitle>{ehBairro ? "Em qual bairro você mora?" : "Em qual cidade você mora?"}</DialogTitle>
            <DialogDescription className="sr-only">Digite para filtrar a lista e escolha uma opção.</DialogDescription>
          </DialogHeader>
          <Command
            filter={(_v, termo, chaves) => (semAcento((chaves ?? []).join(" ")).includes(semAcento(termo.trim())) ? 1 : 0)}
            className="min-h-0 flex-1 [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <CommandInput value={busca} onValueChange={setBusca} placeholder={ehBairro ? "Digite o nome do bairro" : "Digite o nome da cidade"} aria-label={ehBairro ? "Digite o nome do bairro" : "Digite o nome da cidade"} />
            <CommandList className="max-h-none flex-1 overflow-y-auto">
              <CommandEmpty>{`Não encontramos “${busca.trim()}”. Confira a escrita ou procure pelo nome da ${ehBairro ? "regional" : "cidade"}.`}</CommandEmpty>
              {grupos.map((g) => <CommandGroup key={g.nome} heading={g.nome}>{g.itens.map((o) => item(o, g.nome))}</CommandGroup>)}
              {soltas.length > 0 && <CommandGroup>{soltas.map((o) => item(o, ""))}</CommandGroup>}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
