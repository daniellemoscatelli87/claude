// Aba Dados: Respostas (filtro por situação em GrupoDeChipsFiltraveis, seleção com Checkbox, LinhaDeLista e a ficha de
// cada pessoa num Dialog com Anterior e Próxima), Relatos (Citacao) e Interessados (CardIndicador e os cards de perfil),
// com o menu "Ações" (DropdownMenu do DS): Exportar respostas, Excluir (o que está marcado) e Apagar tudo. Os mesmos
// textos, contas e confirmações da página de HTML.
import * as React from "react";
import { BellRing, Check, ChevronLeft, ChevronRight, Download, EllipsisVertical, Inbox, LoaderCircle, MessageSquareQuote, Percent, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipDeEstado, type TomDoChip } from "@/components/ui/chip-de-estado";
import { GrupoDeChipsFiltraveis } from "@/components/ui/chip-filtravel";
import { Citacao } from "@/components/ui/citacao";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CardIndicador } from "@/components/ui/painel-dados";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BLOCOS, completas, FILTROS_DAS_RESPOSTAS, fmtDate, interessados, nomeDe, numeroDe, numerosDasPerguntas, ondeParou, pct, perfilDe, plural, relatosDe, resumoDe, ROTULO,
  ROTULO_PF, SIT_CURTA, telefone, todasR, valores, type DadosDoPainel, type PerguntaDaPesquisa, type Resposta,
} from "@/dados/pesquisas";
import { cardsDePerfil } from "@/dados/pesquisas-resultados";
import { GradeDePerguntas } from "./Resultados";

export type AbaDosDados = "respostas" | "relatos" | "interessados";
const TOM_DA_SITUACAO: Record<string, TomDoChip> = { completa: "sucesso", parcial: "aviso", fora_de_curitiba: "neutro", sem_compras: "neutro" };
export const ChipDaSituacao = ({ s }: { s: string }) => <ChipDeEstado tom={TOM_DA_SITUACAO[s] || "neutro"}>{SIT_CURTA[s] || s}</ChipDeEstado>;

type Props = {
  d: DadosDoPainel;
  abaInicial: AbaDosDados;
  /** Exclui respostas (e o interesse ligado a elas); devolve true quando tudo deu certo. */
  excluir: (ids: string[], todas: boolean, depois: AbaDosDados) => Promise<boolean>;
  pedir: (c: { titulo: string; mensagem: string; ok: string; destrutiva?: boolean; palavra?: string }) => Promise<boolean | string>;
  exportarRespostas: () => Promise<void>;
};

export function Dados({ d, abaInicial, excluir, pedir, exportarRespostas }: Props) {
  const [aba, setAba] = React.useState<AbaDosDados>(abaInicial);
  const [filtro, setFiltro] = React.useState("todas");
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [ficha, setFicha] = React.useState<{ lista: Resposta[]; k: number } | null>(null);
  const [exportando, setExportando] = React.useState<"" | "gerando" | "ok">("");
  const T = todasR(d);
  const visiveis = T.filter((x) => filtro === "todas" || x.situacao === filtro);
  const marcadas = visiveis.filter((x) => sel.has(x.id));
  const total = d.R.length + d.RP.length;

  const excluirUma = async (x: Resposta) => {
    const ok = await pedir({ titulo: `Excluir a resposta de ${nomeDe(x)}?`, mensagem: `A participação #${numeroDe(x, T)}, de ${fmtDate(x.created_at)}, será apagada de vez e sai dos gráficos. Essa ação não pode ser desfeita.`, ok: "Excluir", destrutiva: true });
    if (ok) { setSel(new Set()); await excluir([x.id], false, "respostas"); }
  };
  const excluirSelecionadas = async () => {
    if (!marcadas.length) return;
    if (marcadas.length === 1) return excluirUma(marcadas[0]);
    const ok = await pedir({ titulo: `Excluir ${plural(marcadas.length, "resposta", "respostas")}?`, mensagem: `${marcadas.length === total ? "Todas as participações" : `As ${plural(marcadas.length, "participação selecionada", "participações selecionadas")}`} serão apagadas de vez e saem dos gráficos. Essa ação não pode ser desfeita.`, ok: "Excluir", destrutiva: true });
    if (ok) { setSel(new Set()); await excluir(marcadas.map((x) => x.id), false, "respostas"); }
  };
  // "Apagar tudo": todas as respostas, relatos e interessados; a pesquisa continua
  const apagarTudo = async () => {
    const msg = [total ? `As ${plural(total, "participação", "participações")} desta pesquisa serão apagadas de vez, junto com os relatos e os contatos de interessados.` : "Os dados desta pesquisa serão apagados de vez.", "A pesquisa e o link continuam existindo, e os gráficos voltam a zero. Essa ação não pode ser desfeita."].join(" ");
    if (await pedir({ titulo: "Apagar todas as respostas?", mensagem: msg, ok: "Apagar tudo", destrutiva: true, palavra: "APAGAR" })) { setSel(new Set()); await excluir([], true, "respostas"); }
  };
  const exportar = async () => {
    setExportando("gerando");
    try { await exportarRespostas(); setExportando("ok"); setTimeout(() => setExportando(""), 2200); } catch { setExportando(""); }
  };

  const acoes = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Ações" title="Ações" disabled={exportando === "gerando"}>
          {exportando === "gerando" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : exportando === "ok" ? <Check aria-hidden /> : <EllipsisVertical aria-hidden />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onSelect={() => void exportar()}><Download aria-hidden />Exportar respostas</DropdownMenuItem>
        <DropdownMenuSeparator />
        {aba === "respostas" && <DropdownMenuItem variant="destructive" disabled={!marcadas.length} onSelect={() => void excluirSelecionadas()}><Trash2 aria-hidden />Excluir{marcadas.length ? ` (${marcadas.length})` : ""}</DropdownMenuItem>}
        <DropdownMenuItem variant="destructive" disabled={!total && !d.I.length} onSelect={() => void apagarTudo()}><Trash2 aria-hidden />Apagar tudo</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Tabs value={aba} onValueChange={(v) => { setAba(v as AbaDosDados); setSel(new Set()); }} className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <TabsList aria-label="Respostas, relatos e interessados">
          <TabsTrigger value="respostas">Respostas</TabsTrigger>
          <TabsTrigger value="relatos">Relatos</TabsTrigger>
          <TabsTrigger value="interessados">Interessados</TabsTrigger>
        </TabsList>
        {acoes}
      </div>
      {exportando === "ok" && <p className="sr-only" aria-live="polite">Planilha baixada</p>}
      <TabsContent value="respostas">
        <Card className="gap-0 py-0">
          {!total ? (
            <CardContent className="py-6"><EstadoVazio variante="lista" tamanho="sm" icone={<Inbox />} titulo="Nenhuma resposta" descricao="As participações aparecem aqui assim que alguém começa a responder a pesquisa." /></CardContent>
          ) : (
            <>
              <div className="grid gap-4 px-6 pt-6 pb-4">
                <GrupoDeChipsFiltraveis
                  rotulo="Filtrar por situação" multiplo={false} valor={[filtro]} onValorChange={(v) => { setFiltro(v[0] || "todas"); setSel(new Set()); }}
                  opcoes={FILTROS_DAS_RESPOSTAS.map(([id, t]) => ({ valor: id, rotulo: t, contagem: id === "todas" ? total : T.filter((x) => x.situacao === id).length }))}
                />
                <p className="text-body-sm text-muted-foreground" aria-live="polite">{plural(visiveis.length, "participação", "participações")}, da mais recente para a mais antiga.</p>
                {visiveis.length > 0 && (
                  <div className={"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border px-3 py-2 transition-colors " + (marcadas.length ? "border-[var(--primary-text)] bg-[var(--primary-suave)]" : "border-border")}>
                    <div className="flex items-center gap-3">
                      <Checkbox id="pa-sel-todas" checked={marcadas.length > 0 && marcadas.length === visiveis.length ? true : marcadas.length ? "indeterminate" : false} onCheckedChange={(v) => setSel(new Set(v === true ? visiveis.map((x) => x.id) : []))} />
                      <Label htmlFor="pa-sel-todas" className="font-normal">Selecionar todas</Label>
                    </div>
                    <span className="text-body-sm font-semibold text-foreground" aria-live="polite">{marcadas.length ? plural(marcadas.length, "selecionada", "selecionadas") : ""}</span>
                    <span className="text-body-sm text-muted-foreground">Para excluir, use o menu Ações</span>
                  </div>
                )}
              </div>
              <ul aria-label="Participações" className="border-t border-border">
                {visiveis.length ? visiveis.map((x, k) => (
                  <LinhaDeLista
                    key={x.id} as="li" className="border-b border-border px-6 last:border-b-0" selecionada={sel.has(x.id)} data-resposta={x.id}
                    inicio={<Checkbox checked={sel.has(x.id)} aria-label={`Selecionar a resposta de ${nomeDe(x)}, #${numeroDe(x, T)}`} onCheckedChange={(v) => setSel((s) => { const n = new Set(s); if (v === true) n.add(x.id); else n.delete(x.id); return n; })} />}
                    titulo={
                      <Button type="button" variant="link" className="h-auto min-h-11 justify-start whitespace-normal px-0 py-1 text-left font-semibold text-foreground" aria-haspopup="dialog"
                        aria-label={`Abrir a resposta de ${nomeDe(x)}, #${numeroDe(x, T)}, ${fmtDate(x.created_at)}, ${SIT_CURTA[x.situacao] || x.situacao}`} onClick={() => setFicha({ lista: visiveis, k })}>
                        {nomeDe(x)}
                      </Button>
                    }
                    descricao={<span className="grid gap-0.5"><span>#{numeroDe(x, T)} · {fmtDate(x.created_at)}</span>{resumoDe(d.Q, x) && <span>{resumoDe(d.Q, x)}</span>}</span>}
                    fim={
                      <span className="flex items-center gap-2">
                        {filtro === "todas" && <ChipDaSituacao s={x.situacao} />}
                        <Button type="button" variant="ghost" size="icon" aria-label={`Excluir a resposta de ${nomeDe(x)}`} title="Excluir resposta" onClick={() => void excluirUma(x)}><Trash2 aria-hidden /></Button>
                      </span>
                    }
                  />
                )) : <li className="px-6 py-6"><EstadoVazio variante="lista" tamanho="sm" icone={<Inbox />} titulo="Nenhuma participação com essa situação." /></li>}
              </ul>
            </>
          )}
        </Card>
      </TabsContent>
      <TabsContent value="relatos"><Relatos d={d} /></TabsContent>
      <TabsContent value="interessados"><Interessados d={d} /></TabsContent>
      {ficha && <FichaDaResposta d={d} lista={ficha.lista} inicial={ficha.k} filtroTodas={filtro === "todas"} fechar={() => setFicha(null)} excluir={excluirUma} />}
    </Tabs>
  );
}

function Relatos({ d }: { d: DadosDoPainel }) {
  const lista = relatosDe(d.R);
  return (
    <Card>
      <CardContent className="grid gap-5 pt-6">
        {!lista.length ? <EstadoVazio variante="lista" tamanho="sm" icone={<MessageSquareQuote />} titulo="Nenhum relato ainda" descricao="A pergunta aberta é opcional; os relatos aparecem aqui quando alguém escrever." /> : (
          <>
            <p className="text-body-sm text-muted-foreground">{plural(lista.length, "relato", "relatos")}, do mais recente para o mais antigo.</p>
            {lista.map((x) => <Citacao key={x.id} papel={fmtDate(x.created_at)}>{x.relato}</Citacao>)}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Quantas pessoas querem os avisos do lançamento e o perfil delas, sem nomes (os contatos saem em "Exportar respostas"). */
function Interessados({ d }: { d: DadosDoPainel }) {
  const comp = completas(d.R);
  const quer = interessados(d.R, d.I);
  if (!d.I.length && !quer.length) return <Card><CardContent className="pt-6"><EstadoVazio variante="lista" tamanho="sm" icone={<BellRing />} titulo="Ninguém pediu os avisos ainda" descricao="Quem marcar “Sim, quero receber os avisos” no fim da pesquisa aparece aqui." /></CardContent></Card>;
  const perfil = cardsDePerfil(d.Q, quer);
  const soltos = d.I.filter((y) => !d.R.some((x) => x.envio_id === y.envio_id)).length;
  return (
    <div className="grid gap-6">
      <GradeDeCards colunas={{ base: 1, sm: 2 }}>
        <CardIndicador compacto tom="marca" icone={<BellRing />} valor={quer.length} rotulo={quer.length === 1 ? "pessoa quer os avisos" : "pessoas querem os avisos"} apoio="do lançamento e das vantagens" />
        <CardIndicador compacto icone={<Percent />} valor={quer.length} total={comp.length} rotulo="das respostas completas" apoio={pct(quer.length, comp.length) + "% das respostas completas"} />
      </GradeDeCards>
      {perfil.length ? <GradeDePerguntas cards={perfil} /> : <p className="text-body-sm text-muted-foreground">Ainda não há perfil para mostrar.</p>}
      {soltos > 0 && <p className="text-body-sm text-muted-foreground">{plural(soltos, "contato guardado não tem", "contatos guardados não têm")} resposta na pesquisa e não {soltos === 1 ? "entra" : "entram"} nos gráficos. {soltos === 1 ? "Ele sai" : "Eles saem"} em "Exportar respostas".</p>}
    </div>
  );
}

/* ---------- Ficha de uma resposta ---------- */
function ValorDaFicha({ p, v }: { p: PerguntaDaPesquisa; v: unknown }) {
  const op = (id: string) => (p.opcoes || []).find((o) => o.id === id);
  const nome = (id: string) => (op(id)?.texto || id).replace(/ \(especifique\)$/, "");
  const vv = v as { outro?: string } & Record<string, unknown>;
  if (p.tipo === "unica") return <p className="text-body-sm text-foreground">{nome(String(v))}</p>;
  if (p.tipo === "ranking") return <ol className="grid gap-1 text-body-sm text-foreground">{valores(v).map((id, k) => <li key={id} className="flex gap-2"><span className="font-semibold tabular-nums text-muted-foreground">{k + 1}º</span>{nome(id)}</li>)}</ol>;
  if (p.tipo === "escalas" || p.tipo === "escala") {
    const linhas: [string, unknown][] = typeof v === "number" ? [["Nota", v]] : (p.linhas || []).map((l) => [l.texto, vv[l.id]]);
    return <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-body-sm">{linhas.map(([t, n]) => <React.Fragment key={t}><dt className="text-foreground">{t}</dt><dd className="font-semibold tabular-nums text-foreground">{typeof n === "number" ? `${n} de ${p.max || 10}` : "—"}</dd></React.Fragment>)}</dl>;
  }
  if (p.tipo === "matriz") {
    return <ul className="grid gap-2 text-body-sm">{(p.linhas || []).map((l) => { const c = (p.colunas || []).find((x) => x.id === vv[l.id]); return <li key={l.id} className="flex flex-wrap items-center justify-between gap-2"><span className="text-foreground">{l.texto}</span><ChipDeEstado tom={c && ["4", "5"].includes(c.id) ? "aviso" : "neutro"}>{c ? c.texto : "—"}</ChipDeEstado></li>; })}</ul>;
  }
  return <ul className="grid gap-1 text-body-sm text-foreground">{valores(v).map((id) => <li key={id} className="flex gap-2"><Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--success-text)]" />{nome(id) + (op(id)?.outro && vv.outro ? `: ${vv.outro}` : "")}</li>)}</ul>;
}

function FichaDaResposta({ d, lista, inicial, filtroTodas, fechar, excluir }: { d: DadosDoPainel; lista: Resposta[]; inicial: number; filtroTodas: boolean; fechar: () => void; excluir: (x: Resposta) => Promise<void> }) {
  const [k, setK] = React.useState(inicial);
  const x = lista[k];
  const T = todasR(d);
  const nums = numerosDasPerguntas(d.Q);
  const ir = (n: number) => { if (n >= 0 && n < lista.length) { setK(n); document.getElementById("pa-ficha-rola")?.scrollTo({ top: 0 }); } };
  if (!x) return null;
  const pf = perfilDe(d.Q, x);
  const blocos = BLOCOS.map(([t, ids]) => [t, ids.map((id) => d.Q.perguntas.find((p) => p.id === id)).filter((p): p is PerguntaDaPesquisa => !!p && x.respostas[p.id] != null)] as const).filter(([, l]) => l.length);
  const Bloco = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="grid gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"><h3 className="text-label font-semibold text-muted-foreground">{t}</h3>{children}</section>;
  return (
    <Dialog open onOpenChange={(v) => !v && fechar()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-2xl" onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("input, textarea")) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); ir(k - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); ir(k + 1); }
      }}>
        <DialogHeader className="border-b border-border p-6 pr-14">
          <DialogTitle>{nomeDe(x)}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">#{numeroDe(x, T)} · {fmtDate(x.created_at)}{filtroTodas && <ChipDaSituacao s={x.situacao} />}</DialogDescription>
        </DialogHeader>
        <div id="pa-ficha-rola" key={x.id} className="grid flex-1 content-start gap-5 overflow-y-auto p-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
          {x.situacao === "parcial" && <p className="rounded-md bg-[var(--warning-muted)] p-3 text-body-sm text-[var(--warning-text)]">Não terminou a pesquisa: parou {ondeParou(d.Q, x)}. Última atividade em {fmtDate(x.atualizado_em || x.created_at)}. Abaixo, o que respondeu até ali.</p>}
          <Bloco t="Contato">
            <dl className="grid gap-2 text-body-sm sm:grid-cols-2">
              <div className="grid gap-0.5"><dt className="text-muted-foreground">WhatsApp</dt><dd>{x.whatsapp ? <a className="text-[var(--primary-text)] underline underline-offset-4" href={"https://wa.me/55" + String(x.whatsapp).replace(/\D/g, "")} target="_blank" rel="noopener" aria-label={"Conversar no WhatsApp: " + telefone(x.whatsapp)}>{telefone(x.whatsapp)}</a> : <span className="text-muted-foreground">Não informado</span>}</dd></div>
              <div className="grid gap-0.5"><dt className="text-muted-foreground">E-mail</dt><dd className="[overflow-wrap:anywhere]">{x.email ? <a className="text-[var(--primary-text)] underline underline-offset-4" href={"mailto:" + x.email}>{x.email}</a> : <span className="text-muted-foreground">Não informado</span>}</dd></div>
            </dl>
          </Bloco>
          {pf.length > 0 && <Bloco t="Perfil"><dl className="grid gap-2 text-body-sm sm:grid-cols-2">{pf.map(([c, v]) => <div key={c.id} className="grid gap-0.5"><dt className="text-muted-foreground">{ROTULO_PF[c.id] || c.texto}</dt><dd className="text-foreground">{v}</dd></div>)}</dl></Bloco>}
          {blocos.map(([t, ps]) => (
            <Bloco key={t} t={t}>
              {ps.map((p) => (
                <div key={p.id} className="grid gap-1.5">
                  <p className="flex gap-2 text-body-sm font-semibold text-foreground" title={p.texto}><Badge variant="outline" className="shrink-0 tabular-nums">{nums[p.id]}</Badge>{ROTULO[p.id] || p.texto}</p>
                  <ValorDaFicha p={p} v={x.respostas[p.id]} />
                </div>
              ))}
            </Bloco>
          ))}
          {x.relato && x.relato.trim() && <Bloco t="Relato"><Citacao>{x.relato}</Citacao></Bloco>}
          {x.situacao === "completa" && <Bloco t="Avisos do lançamento"><p className="text-body-sm text-foreground">{x.quer_novidades ? "Sim, quer receber os avisos do lançamento." : "Não quer receber."}</p></Bloco>}
          {x.situacao !== "completa" && x.situacao !== "parcial" && <p className="text-body-sm text-muted-foreground">{x.situacao === "fora_de_curitiba" ? "A pesquisa terminou na pergunta 1: a pessoa não mora em Curitiba nem na Região Metropolitana." : "A pesquisa terminou na pergunta 2: a pessoa não comprou roupas, calçados ou acessórios este ano."}</p>}
        </div>
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border p-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => ir(k - 1)} disabled={k === 0}><ChevronLeft aria-hidden />Anterior</Button>
          <span className="text-body-sm tabular-nums text-muted-foreground" aria-live="polite">{k + 1} de {lista.length}</span>
          <span className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" aria-label={`Excluir a resposta de ${nomeDe(x)}`} title="Excluir resposta" onClick={() => { fechar(); void excluir(x); }}><Trash2 aria-hidden /></Button>
            <Button type="button" variant="outline" onClick={() => ir(k + 1)} disabled={k === lista.length - 1}>Próxima<ChevronRight aria-hidden /></Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
