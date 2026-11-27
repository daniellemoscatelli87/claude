// Contato (lote A6, só em prévia): a lista de mensagens de public/admin/contatos/index.html (abas Recebidos e Enviados,
// busca, situação, origem e estado de cada mensagem), só com componentes do Design System Dani Moscatelli:
// CabecalhoDaPagina com Tabs (número em Badge), Input (busca), Select (situação), CardComCabecalho, LinhaDeLista +
// IconeComBase + ChipDeEstado (estado e origem em texto), Alert e Skeleton.
// Ainda na página de HTML (esperam peças do DS, ADMIN_REACT.md §7.1): a conversa de cada mensagem (?id=), responder,
// marcar reunião e "Novo e-mail" (CaixaDeEntrada, Conversa, CampoDeEmails, CampoDeHorario). Por isso cada linha abre a
// mensagem na página de HTML.
import * as React from "react";
import { CalendarCheck, CircleAlert, Mail, MailCheck, MailOpen, Send, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChipDeEstado, type TomDoChip } from "@/components/ui/chip-de-estado";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, IconeComBase } from "@/components/ui/painel-dados";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { diaCurto } from "@/lib/formatar";
import { sb } from "@/lib/supabase";
import { Vazio } from "./comum";

export type Mensagem = {
  id: string; created_at: string; nome: string | null; email: string | null; empresa: string | null; assunto: string | null; mensagem: string | null;
  origem: "site" | "email" | "enviado" | null; destinatarios: string[] | null; copias: string[] | null; copias_ocultas: string[] | null;
  visualizado_em: string | null; respondido_em: string | null; reuniao_em: string | null;
};
export type AbaDoContato = "recebidos" | "enviados";
export type Situacao = "" | "pendentes" | "respondidas" | "reunioes";

/** Estado da mensagem: o mesmo de Admin.mailState (não lida, lida, respondida, reunião agendada). */
export function estadoDaMensagem(r: Pick<Mensagem, "visualizado_em" | "respondido_em" | "reuniao_em">): "" | "lida" | "respondida" | "reuniao" {
  return !r.visualizado_em ? "" : r.reuniao_em ? "reuniao" : r.respondido_em ? "respondida" : "lida";
}
const ESTADOS: Record<ReturnType<typeof estadoDaMensagem>, { rotulo: string; icone: LucideIcon; tom: TomDoChip & ("marca" | "neutro") }> = {
  "": { rotulo: "Não lida", icone: Mail, tom: "marca" },
  lida: { rotulo: "Lida", icone: MailOpen, tom: "neutro" },
  respondida: { rotulo: "Respondida", icone: MailCheck, tom: "neutro" },
  reuniao: { rotulo: "Reunião agendada", icone: CalendarCheck, tom: "neutro" },
};
export const ORIGENS = { site: ["Site", "Enviado pelo formulário do site"], email: ["E-mail", "Enviado direto para contato@danimoscatelli.com.br"], enviado: ["Enviado", "E-mail novo enviado por você"] } as const;
const origemDe = (r: Pick<Mensagem, "origem">) => (r.origem && r.origem in ORIGENS ? r.origem : "site");
const SITUACOES: { valor: Situacao; rotulo: string }[] = [
  { valor: "", rotulo: "Todas as mensagens" },
  { valor: "pendentes", rotulo: "Não respondidas" },
  { valor: "respondidas", rotulo: "Respondidas" },
  { valor: "reunioes", rotulo: "Reuniões agendadas" },
];
const TODAS = "__todas";

/** Sem acento e em minúsculas (a mesma busca da página de HTML). */
export const norm = (s: unknown) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const paraDe = (r: Mensagem) => (r.destinatarios && r.destinatarios.length ? r.destinatarios : [r.email].filter(Boolean) as string[]);
export const destinatariosTexto = (r: Mensagem) =>
  ["Para: " + paraDe(r).join(", "), r.copias?.length ? "Cc: " + r.copias.join(", ") : "", r.copias_ocultas?.length ? "Cco: " + r.copias_ocultas.join(", ") : ""].filter(Boolean).join(" · ");

/** Linhas da aba com a busca e a situação, o resumo ("2 de 6 mensagens recebidas") e o texto do vazio. */
export function listaDoContato(todas: Mensagem[], aba: AbaDoContato, busca: string, situacao: Situacao) {
  const daqui = todas.filter((r) => (aba === "enviados") === (r.origem === "enviado"));
  const q = norm(busca.trim());
  const casa = (r: Mensagem) => !situacao || (situacao === "reunioes" ? !!r.reuniao_em : (situacao === "respondidas") === !!r.respondido_em);
  const linhas = daqui.filter((r) => casa(r) && (!q
    || (["nome", "email", "empresa", "assunto", "mensagem"] as const).some((k) => norm(r[k]).includes(q))
    || (r.destinatarios || []).concat(r.copias || [], r.copias_ocultas || []).some((e) => norm(e).includes(q))
    || norm(r.origem === "email" ? "e-mail email" : r.origem === "enviado" ? "enviado" : "site").includes(q)));
  const tot = daqui.length;
  const rotulo = aba === "enviados" ? (tot === 1 ? " e-mail enviado" : " e-mails enviados") : (tot === 1 ? " mensagem recebida" : " mensagens recebidas");
  const resumo = (q || situacao ? linhas.length + " de " : "") + tot + rotulo;
  const vazio = tot ? "Nenhuma mensagem encontrada." : aba === "enviados" ? "Nenhum e-mail enviado ainda. Use “Novo e-mail” para escrever o primeiro." : "Nenhuma mensagem recebida ainda.";
  return { linhas, resumo, vazio };
}

function Linha({ r }: { r: Mensagem }) {
  const e = ESTADOS[estadoDaMensagem(r)];
  const Icone = r.origem === "enviado" ? Send : e.icone;
  const origem = ORIGENS[origemDe(r)];
  return (
    <li data-mensagem={r.id}>
      {/* A conversa ainda é a da página de HTML: link com recarga, não navegação interna. */}
      <LinhaDeLista
        as="a" href={"/admin/contatos/?id=" + r.id} className="px-5 sm:px-6"
        inicio={<IconeComBase tom={e.tom} redonda><Icone /></IconeComBase>}
        titulo={<span className={e.tom === "marca" ? "font-semibold" : undefined}>{r.nome || "Sem nome"}</span>}
        descricao={<span className="[overflow-wrap:anywhere]">{r.origem === "enviado" ? destinatariosTexto(r) : [r.email, r.empresa].filter(Boolean).join(" · ")}</span>}
        fim={
          <span className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
            <span className="flex items-center gap-1.5">
              <ChipDeEstado tom="neutro" title={origem[1]}>{origem[0]}</ChipDeEstado>
              {r.origem !== "enviado" && <ChipDeEstado tom={e.tom}>{e.rotulo}</ChipDeEstado>}
            </span>
            <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{diaCurto(r.created_at)}</span>
          </span>
        }
      >
        <span className="mt-0.5 line-clamp-2 block text-sm text-foreground">{r.assunto || "Sem assunto"}</span>
      </LinhaDeLista>
    </li>
  );
}

export function Contatos() {
  const params = new URLSearchParams(location.search);
  const [todas, setTodas] = React.useState<Mensagem[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aba, setAba] = React.useState<AbaDoContato>(params.get("aba") === "enviados" ? "enviados" : "recebidos");
  const [busca, setBusca] = React.useState("");
  const inicial = params.get("situacao") as Situacao;
  const [situacao, setSituacao] = React.useState<Situacao>(["pendentes", "respondidas", "reunioes"].includes(inicial) ? inicial : "");

  React.useEffect(() => {
    document.title = "Contato | Área restrita";
    sb.from("contatos").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) setErro("Não foi possível carregar as mensagens: " + error.message);
      else setTodas((data || []) as Mensagem[]);
    });
  }, []);
  // A aba fica no endereço (?aba=enviados), como na página de HTML.
  const mudarAba = (a: AbaDoContato) => {
    setAba(a);
    const u = new URL(location.href);
    if (a === "enviados") u.searchParams.set("aba", "enviados");
    else u.searchParams.delete("aba");
    history.replaceState(history.state, "", u);
  };

  const lista = todas || [];
  const { linhas, resumo, vazio } = listaDoContato(lista, aba, busca, situacao);
  const nRecebidos = lista.filter((r) => r.origem !== "enviado").length;

  return (
    <Tabs value={aba} onValueChange={(v) => mudarAba(v as AbaDoContato)} className="grid gap-6">
      <CabecalhoDaPagina
        titulo="Contato"
        descricao={todas ? <span data-resumo="">{resumo}</span> : undefined}
        abas={
          <TabsList aria-label="Mensagens">
            <TabsTrigger value="recebidos">Recebidos <Badge variant="outline">{nRecebidos}</Badge></TabsTrigger>
            <TabsTrigger value="enviados">Enviados <Badge variant="outline">{lista.length - nRecebidos}</Badge></TabsTrigger>
          </TabsList>
        }
      />

      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{erro} Recarregue a página para tentar de novo.</AlertDescription>
        </Alert>
      )}

      <section aria-label="Filtros" className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="ct-busca">Buscar</Label>
          <Input id="ct-busca" type="search" placeholder="Nome, e-mail ou assunto" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="ct-situacao">Situação</Label>
          <Select value={situacao || TODAS} onValueChange={(v) => setSituacao(v === TODAS ? "" : (v as Situacao))}>
            <SelectTrigger id="ct-situacao" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{SITUACOES.map((s) => <SelectItem key={s.rotulo} value={s.valor || TODAS}>{s.rotulo}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </section>

      {(["recebidos", "enviados"] as AbaDoContato[]).map((valor) => (
        <TabsContent key={valor} value={valor} forceMount>
          {valor === aba && (!todas && !erro ? (
            <Skeleton aria-busy="true" aria-label="Carregando as mensagens" className="h-96 rounded-xl" />
          ) : todas && (
            <CardComCabecalho
              idDoTitulo="h-mensagens" sangria icone={valor === "enviados" ? <Send /> : <Mail />} tom={valor === "enviados" ? "neutro" : "marca"}
              titulo={valor === "enviados" ? "E-mails enviados" : "Mensagens recebidas"}
              descricao={SITUACOES.find((x) => x.valor === situacao)?.rotulo + (busca.trim() ? " · busca: " + busca.trim() : "")}
              className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
            >
              {linhas.length ? <ul>{linhas.map((r) => <Linha key={r.id} r={r} />)}</ul> : <Vazio className="px-5 sm:px-6">{vazio}</Vazio>}
            </CardComCabecalho>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
