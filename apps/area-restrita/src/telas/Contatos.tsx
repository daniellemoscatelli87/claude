// Contato: a mesma informação, as mesmas ações e os mesmos textos de public/admin/contatos/index.html, só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A) com as abas Recebidos e Enviados (Tabs, número em Badge) e "Novo e-mail";
// - filtros: CampoDeBusca (sem acento: nome, e-mail, empresa, assunto, mensagem, destinatários e origem) e Select
//   (situação, também por ?situacao=);
// - CaixaDeEntrada: a lista (IconeComBase com o estado, ChipDeEstado com a origem e o estado em texto) e a mensagem
//   aberta ao lado (?id=, também abrindo direto pelo endereço; ?reuniao=1 abre o agendamento), no celular uma coisa
//   por vez com "Voltar";
// - Leitura (contato/Leitura.tsx): dados, situação, conversa, responder, reunião e excluir; NovoEmail
//   (contato/NovoEmail.tsx).
import * as React from "react";
import { CalendarCheck, CircleAlert, Mail, MailCheck, MailOpen, PenLine, Send, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ChipDeEstado, type TomDoChip } from "@/components/ui/chip-de-estado";
import { CampoDeBusca } from "@/components/ui/campo-de-busca";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CaixaDeEntrada, type ItemDaCaixa } from "@/components/ui/caixa-de-entrada";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { IconeComBase } from "@/components/ui/painel-dados";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { diaCurto } from "@/lib/formatar";
import { sb } from "@/lib/supabase";
import { Leitura } from "./contato/Leitura";
import { NovoEmail } from "./contato/NovoEmail";

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

/** Item da CaixaDeEntrada: nome, assunto, data, lida e as etiquetas de origem e de estado (sempre em texto). */
function itemDaCaixa(r: Mensagem): ItemDaCaixa {
  const e = ESTADOS[estadoDaMensagem(r)];
  const Icone = r.origem === "enviado" ? Send : e.icone;
  const origem = ORIGENS[origemDe(r)];
  return {
    id: r.id,
    titulo: r.nome || "Sem nome",
    resumo: r.assunto || "Sem assunto",
    quando: diaCurto(r.created_at),
    lida: r.origem === "enviado" || !!r.visualizado_em,
    inicio: <IconeComBase tom={e.tom} redonda tamanho="sm"><Icone /></IconeComBase>,
    etiqueta: (
      <span className="flex flex-wrap items-center gap-1.5" data-mensagem={r.id}>
        <ChipDeEstado tom="neutro" title={origem[1]}>{origem[0]}</ChipDeEstado>
        {r.origem !== "enviado" && <ChipDeEstado tom={e.tom}>{e.rotulo}</ChipDeEstado>}
      </span>
    ),
  };
}

export function Contatos() {
  const params = React.useMemo(() => new URLSearchParams(location.search), []);
  const [todas, setTodas] = React.useState<Mensagem[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aba, setAba] = React.useState<AbaDoContato>(params.get("aba") === "enviados" ? "enviados" : "recebidos");
  const [busca, setBusca] = React.useState("");
  const inicial = params.get("situacao") as Situacao;
  const [situacao, setSituacao] = React.useState<Situacao>(["pendentes", "respondidas", "reunioes"].includes(inicial) ? inicial : "");
  const [aberta, setAberta] = React.useState<string | null>(params.get("id"));
  const [abrirReuniao] = React.useState(!!params.get("reuniao"));
  const [novo, setNovo] = React.useState(false);

  const carregar = React.useCallback(async () => {
    const { data, error } = await sb.from("contatos").select("*").order("created_at", { ascending: false });
    if (error) return setErro("Não foi possível carregar as mensagens: " + error.message);
    const lista = (data || []) as Mensagem[];
    setTodas(lista);
    return lista;
  }, []);
  React.useEffect(() => {
    document.title = "Contato | Área restrita";
    void carregar().then((lista) => {
      // Mensagem aberta pelo endereço: a aba segue a mensagem (um e-mail enviado abre em Enviados).
      const m = lista?.find((x) => x.id === params.get("id"));
      if (m) setAba(m.origem === "enviado" ? "enviados" : "recebidos");
    });
  }, [carregar, params]);
  // A aba e a mensagem aberta ficam no endereço (?aba=enviados, ?id=), como na página de HTML.
  const endereco = (a: AbaDoContato, id: string | null) => {
    const u = new URL(location.href);
    if (a === "enviados") u.searchParams.set("aba", "enviados"); else u.searchParams.delete("aba");
    if (id) u.searchParams.set("id", id); else u.searchParams.delete("id");
    u.searchParams.delete("reuniao");
    history.replaceState(history.state, "", u);
  };
  const mudarAba = (a: AbaDoContato) => { setAba(a); setAberta(null); endereco(a, null); };
  const abrir = (id: string | null) => { setAberta(id); endereco(aba, id); };

  const lista = todas || [];
  const { linhas, resumo, vazio } = listaDoContato(lista, aba, busca, situacao);
  // A mensagem aberta continua na lista mesmo que o filtro a esconda (para não fechar a leitura de repente).
  const itens = [...linhas, ...lista.filter((r) => r.id === aberta && !linhas.includes(r) && (aba === "enviados") === (r.origem === "enviado"))].map(itemDaCaixa);
  const nRecebidos = lista.filter((r) => r.origem !== "enviado").length;
  const atualizar = (novoR: Mensagem) => setTodas((l) => (l || []).map((x) => (x.id === novoR.id ? novoR : x)));

  return (
    <Tabs value={aba} onValueChange={(v) => mudarAba(v as AbaDoContato)} className="grid gap-6">
      <CabecalhoDaPagina
        titulo="Contato"
        descricao={todas ? <span data-resumo="">{resumo}</span> : undefined}
        acoes={<Button type="button" onClick={() => setNovo(true)}><PenLine aria-hidden />Novo e-mail</Button>}
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
          <CampoDeBusca id="ct-busca" rotulo="Buscar" placeholder="Nome, e-mail ou assunto" valor={busca} onValorChange={setBusca} resultados={busca ? linhas.length : undefined} />
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
            <CaixaDeEntrada
              rotulo={valor === "enviados" ? "E-mails enviados" : "Mensagens recebidas"}
              itens={itens} aberta={aberta} onAbrir={abrir}
              className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300 sm:h-[calc(100dvh-8rem)] sm:min-h-128"
              topo={<p className="text-body-sm font-semibold text-foreground">{valor === "enviados" ? "E-mails enviados" : "Mensagens recebidas"} <span className="font-normal text-muted-foreground">· {SITUACOES.find((x) => x.valor === situacao)?.rotulo}</span></p>}
              vazio={<EstadoVazio tamanho="sm" icone={valor === "enviados" ? <Send /> : <Mail />} titulo={vazio} />}
              renderLeitura={(item) => {
                const m = lista.find((x) => x.id === item.id)!;
                return <Leitura key={m.id} inicial={m} abrirReuniao={abrirReuniao && m.id === params.get("id")} aoMudar={atualizar} aoExcluir={(id) => { setTodas((l) => (l || []).filter((x) => x.id !== id)); abrir(null); }} />;
              }}
            />
          ))}
        </TabsContent>
      ))}

      <NovoEmail
        aberto={novo} mudar={setNovo}
        aoEnviar={async (id) => { const l = await carregar(); if (l?.some((x) => x.id === id)) { setAba("enviados"); endereco("enviados", null); } }}
        verConversa={(id) => { setNovo(false); setAba("enviados"); setAberta(id); endereco("enviados", id); }}
      />
    </Tabs>
  );
}
