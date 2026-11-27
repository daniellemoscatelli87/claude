// Mensagem aberta no Contato (painel de leitura da CaixaDeEntrada): a mesma informação e as mesmas ações de
// public/admin/contatos/index.html (?id=), só com componentes do Design System Dani Moscatelli:
// - Accordion: o cabeçalho da mensagem (nome, origem, data, e-mail, assunto) e, aberto, todos os dados do formulário;
// - Stepper: as etapas (Recebida, Lida, Respondida, Reunião) com as datas; a próxima ação em AlertaComAcao;
// - Conversa (balões; as suas à direita) com BalaoDaConversa e SeparadorDaConversa (cada mudança de situação);
//   anexos em links e imagens; "Ver e-mail completo" em Collapsible;
// - responder: Campo + Textarea, Anexador (UploadDropzone + UploadList) e BotaoDeEnvio (enviando, enviado, de novo);
// - JanelaDeReuniao (Dialog) para agendar, alterar e excluir; excluir a mensagem com o botão de exclusão em contorno e a
//   PerguntaDeConfirmacao (com o motivo, quando há reunião).
import * as React from "react";
import { toast } from "sonner";
import { CalendarCheck, ChevronDown, MapPin, Paperclip, Send, Trash2, Video } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertaComAcao, BotaoDoAlerta } from "@/components/ui/alerta-com-acao";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { Campo, MensagemDeErro } from "@/components/ui/campo";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BalaoDaConversa, Conversa, SeparadorDaConversa } from "@/components/ui/conversa";
import { DivisorSuave } from "@/components/ui/painel-dados";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { registrar, sb } from "@/lib/supabase";
import { iniciais } from "@/lib/formatar";
import { mapaDe, quandoDaReuniao, type Reuniao } from "@/dados/reunioes";
import { useNotificacoes } from "@/casca/notificacoes";
import { usePerguntaDeConfirmacao } from "../comum";
import { Anexador } from "./Anexador";
import { detalheDoErro, qtdAnexos, subirAnexos, type Anexo } from "./anexos";
import { avisarCancelamento, JanelaDeReuniao } from "./JanelaDeReuniao";
import type { Mensagem } from "../Contatos";

export const dataCurta = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const ddmm = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Os campos do formulário de contato do site (Admin.CONTATO_SECOES), do e-mail recebido e do e-mail enviado. */
const CAMPOS_DO_SITE: [string, string][] = [
  ["nome", "Nome completo"], ["email", "E-mail corporativo"], ["telefone", "Telefone / WhatsApp"], ["empresa", "Empresa"], ["cargo", "Cargo / Função"],
  ["tipo_negocio", "Meu negócio é..."], ["tipo_negocio_outro", "Outro (descrição)"], ["assunto", "Assunto"], ["mensagem", "Mensagem"],
  ["dias_preferidos", "Melhor dia da semana"], ["periodo", "Período de preferência"],
];
const CAMPOS_DO_EMAIL: [string, string][] = [["nome", "Nome"], ["email", "E-mail"], ["assunto", "Assunto"], ["mensagem", "Mensagem"]];
export const paraDe = (r: Mensagem) => (r.destinatarios && r.destinatarios.length ? r.destinatarios : ([r.email].filter(Boolean) as string[]));

const EVENTOS: Record<string, (d: string) => string> = {
  lida: () => "Mensagem aberta",
  respondida: () => "Marcada como respondida",
  resposta_desfeita: () => "Resposta desfeita",
  reuniao_agendada: (d) => "Reunião agendada para " + quandoDaReuniao(d),
  reuniao_alterada: (d) => "Reunião remarcada para " + quandoDaReuniao(d),
  reuniao_cancelada: () => "Reunião cancelada",
};

type Resposta = { id: string; created_at: string; mensagem: string | null; anexos: Anexo[] | null; para: string | null; copias: string[] | null; copias_ocultas: string[] | null };
type Recebida = { id: string; created_at: string; texto: string | null; texto_completo: string | null; anexos: Anexo[] | null };
type Evento = { id: string; created_at: string; tipo: string; detalhe: string };
type Item = { em: string; tipo: "entrada" | "saida" | "evento"; x?: Resposta | Recebida | Evento };

/** Linha do tempo da conversa em ordem: a mensagem, as respostas, os e-mails recebidos e cada mudança de situação. */
export function itensDaConversa(r: Pick<Mensagem, "created_at" | "origem">, respostas: Resposta[], recebidas: Recebida[], eventos: Evento[]): Item[] {
  return [
    ...(r.origem === "enviado" ? [] : [{ em: r.created_at, tipo: "entrada" as const }]),
    ...respostas.map((x) => ({ em: x.created_at, tipo: "saida" as const, x })),
    ...recebidas.map((x) => ({ em: x.created_at, tipo: "entrada" as const, x })),
    ...eventos.map((x) => ({ em: x.created_at, tipo: "evento" as const, x })),
  ].sort((a, b) => new Date(a.em).getTime() - new Date(b.em).getTime());
}

function Valor({ v }: { v: unknown }) {
  if (v == null || v === "" || (Array.isArray(v) && !v.length)) return <span className="text-muted-foreground">-</span>;
  if (typeof v === "boolean") return <>{v ? "Sim" : "Não"}</>;
  const t = Array.isArray(v) ? v.join("\n") : String(v);
  if (/^(https?:\/\/|www\.|linkedin\.com)/i.test(t) && !t.includes(" ")) {
    return <a className="text-primary-text underline underline-offset-4" href={/^https?:\/\//i.test(t) ? t : "https://" + t} target="_blank" rel="noopener noreferrer">{t}</a>;
  }
  return <span className="whitespace-pre-line">{t}</span>;
}

function Cabecalho({ r }: { r: Mensagem }) {
  const campos = r.origem === "email" ? CAMPOS_DO_EMAIL : r.origem === "enviado"
    ? ([["nome", "Conversa"], ["_para", "Para"], ...(r.copias?.length ? [["_cc", "Cc"]] : []), ...(r.copias_ocultas?.length ? [["_cco", "Cco"]] : []), ["assunto", "Assunto"]] as [string, string][])
    : CAMPOS_DO_SITE;
  const dados: Record<string, unknown> = { ...r, _para: paraDe(r).join(", "), _cc: (r.copias || []).join(", "), _cco: (r.copias_ocultas || []).join(", ") };
  const origem = r.origem === "email" ? "E-mail" : r.origem === "enviado" ? "Enviado" : "Site";
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="dados" className="border-b-0">
        <AccordionTrigger className="items-start gap-3 py-0 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-start gap-3 text-left">
            <Avatar className="size-10"><AvatarFallback>{iniciais(r.nome)}</AvatarFallback></Avatar>
            <span className="grid min-w-0 gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-foreground">{r.nome || "Sem nome"}</span>
                <ChipDeEstado tom="neutro">{origem}</ChipDeEstado>
              </span>
              <span className="text-body-sm font-normal text-muted-foreground [overflow-wrap:anywhere]">{r.email || "Sem e-mail"} · {dataCurta(r.created_at)}</span>
              <span className="text-body-sm font-normal text-foreground">{r.assunto || "Sem assunto"}</span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <dl className="mt-4 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-6">
            {campos.map(([k, rotulo]) => (
              <React.Fragment key={k}>
                <dt className="text-body-sm font-semibold text-foreground">{rotulo}</dt>
                <dd className="-mt-2 text-body-sm text-foreground [overflow-wrap:anywhere] sm:mt-0"><Valor v={dados[k]} /></dd>
              </React.Fragment>
            ))}
          </dl>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Situacao({ r, reu, aoAgendar }: { r: Mensagem; reu: Reuniao | null; aoAgendar: () => void }) {
  const etapas = [
    { chave: "created_at", titulo: r.origem === "enviado" ? "Enviado" : "Recebida" },
    { chave: "visualizado_em", titulo: "Lida" },
    { chave: "respondido_em", titulo: "Respondida" },
    { chave: "reuniao_em", titulo: "Reunião" },
  ] as const;
  const feitas = etapas.map((e, i) => (r[e.chave] ? i : -1)).filter((i) => i >= 0);
  const atual = etapas.findIndex((e) => !r[e.chave]);
  return (
    <div className="grid gap-4" data-situacao="">
      <Stepper
        rotulo="Situação da mensagem" atual={atual === -1 ? etapas.length - 1 : atual} concluidas={feitas}
        etapas={etapas.map((e) => ({ titulo: e.titulo + (r[e.chave] ? " " + ddmm(r[e.chave] as string) : "") }))}
      />
      {r.reuniao_em ? (
        <AlertaComAcao
          tom="sucesso" titulo="Reunião agendada"
          acoes={
            <>
              <BotaoDoAlerta onClick={aoAgendar}>Editar reunião</BotaoDoAlerta>
              {reu?.formato === "presencial" && reu.endereco ? (
                <BotaoDoAlerta asChild><a href={mapaDe(reu.endereco)} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden />Ver no mapa</a></BotaoDoAlerta>
              ) : reu?.meet_link ? (
                <BotaoDoAlerta asChild><a href={reu.meet_link} target="_blank" rel="noopener noreferrer"><Video aria-hidden />Entrar no Google Meet</a></BotaoDoAlerta>
              ) : null}
            </>
          }
        >
          {quandoDaReuniao(r.reuniao_em)}{reu?.formato === "presencial" && reu.endereco ? ". Presencial: " + reu.endereco : ""}
        </AlertaComAcao>
      ) : (
        <AlertaComAcao
          tom="info" titulo={r.respondido_em ? "Próximo passo: agendar a reunião" : "Responda pelo histórico abaixo"}
          acoes={<BotaoDoAlerta onClick={aoAgendar}><CalendarCheck aria-hidden />{reu ? "Continuar agendamento" : "Agendar reunião"}</BotaoDoAlerta>}
        >
          {r.respondido_em ? "Respondida em " + dataCurta(r.respondido_em) + "." : "A mensagem é marcada como respondida automaticamente."}
        </AlertaComAcao>
      )}
    </div>
  );
}

function Anexos({ anexos, urls }: { anexos: Anexo[]; urls: Record<string, string> }) {
  const imagens = anexos.filter((a) => (a.type || "").startsWith("image/"));
  const outros = anexos.filter((a) => !(a.type || "").startsWith("image/"));
  return (
    <div className="grid gap-2">
      {outros.map((a) => (
        <Button key={a.path} asChild variant="link" className="h-auto justify-start px-0 py-0.5 text-left whitespace-normal has-[>svg]:px-0">
          <a href={urls[a.path] || "#"} target="_blank" rel="noopener"><Paperclip aria-hidden />{a.name}</a>
        </Button>
      ))}
      {imagens.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagens.map((a) => (
            <a key={a.path} href={urls[a.path] || "#"} target="_blank" rel="noopener" title={a.name} className="block overflow-hidden rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <img src={urls[a.path] || ""} alt={a.name} loading="lazy" className="size-24 object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Respostas pela função responder-contato (resposta, aviso de cancelamento e e-mail novo). */
export async function responderContato(body: object): Promise<{ data?: { resposta?: unknown; respondido_em?: string; contato_id?: string }; erro?: string }> {
  const { data, error } = await sb.functions.invoke("responder-contato", { body });
  if (error || !data?.resposta) return { erro: await detalheDoErro(error) || "" };
  return { data };
}

export function Leitura({ inicial, aoMudar, aoExcluir, abrirReuniao }: { inicial: Mensagem; aoMudar: (r: Mensagem) => void; aoExcluir: (id: string) => void; abrirReuniao?: boolean }) {
  const [r, setR] = React.useState(inicial);
  const [reu, setReu] = React.useState<Reuniao | null>(null);
  const [historico, setHistorico] = React.useState<{ itens: Item[]; urls: Record<string, string>; falhou: boolean } | null>(null);
  const [texto, setTexto] = React.useState("");
  const [arquivos, setArquivos] = React.useState<File[]>([]);
  const [envio, setEnvio] = React.useState<EstadoDoEnvio>("parado");
  const [rotuloDoEnvio, setRotuloDoEnvio] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviadaPara, setEnviadaPara] = React.useState<string | null>(null);
  const [reuniaoAberta, setReuniaoAberta] = React.useState(!!abrirReuniao);
  const [excluindo, setExcluindo] = React.useState(false);
  const [erroExcluir, setErroExcluir] = React.useState<string | null>(null);
  const { pedir, elemento } = usePerguntaDeConfirmacao();
  const { recarregar } = useNotificacoes();

  const mudar = (novo: Mensagem) => { setR(novo); aoMudar(novo); };

  const carregarHistorico = React.useCallback(async (c: Mensagem) => {
    const [resp, evs, rec] = await Promise.all([
      sb.from("respostas").select("id, created_at, mensagem, anexos, para, copias, copias_ocultas").eq("contato_id", c.id).order("created_at", { ascending: true }),
      sb.from("contato_eventos").select("id, created_at, tipo, detalhe").eq("contato_id", c.id).order("created_at", { ascending: true }),
      sb.from("mensagens_recebidas").select("id, created_at, texto, texto_completo, anexos").eq("contato_id", c.id).order("created_at", { ascending: true }),
    ]);
    const respostas = (resp.data || []) as Resposta[], eventos = (evs.data || []) as Evento[], recebidas = (rec.data || []) as Recebida[];
    // Links temporários para ver os anexos (a pasta é privada).
    const caminhos = [...respostas, ...recebidas].flatMap((x) => (x.anexos || []).map((a) => a.path));
    const urls: Record<string, string> = {};
    if (caminhos.length) {
      const { data } = await sb.storage.from("anexos").createSignedUrls(caminhos, 3600);
      (data || []).forEach((u) => { if (u.signedUrl && u.path) urls[u.path] = u.signedUrl; });
    }
    setHistorico({ itens: itensDaConversa(c, respostas, recebidas, eventos), urls, falhou: !!(resp.error || evs.error || rec.error) });
  }, []);

  React.useEffect(() => {
    // Ao abrir pela primeira vez, guarda quando foi vista (a lista e o contador do menu passam a mostrá-la como lida).
    if (!inicial.visualizado_em) {
      const agora = new Date().toISOString();
      void sb.from("contatos").update({ visualizado_em: agora }).eq("id", inicial.id).then(() => recarregar());
      mudar({ ...inicial, visualizado_em: agora });
    }
    void sb.from("reunioes").select("*").eq("contato_id", inicial.id).maybeSingle().then(({ data }) => setReu((data as Reuniao) || null));
    void carregarHistorico(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicial.id]);

  const enviarResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    setErro(null);
    setEnviadaPara(null);
    if (!t && !arquivos.length) return setErro("Escreva a resposta ou anexe um arquivo.");
    setEnvio("enviando");
    const anexos = await subirAnexos(arquivos, r.id, setRotuloDoEnvio);
    if (typeof anexos === "string") { setEnvio("erro"); setRotuloDoEnvio(null); return setErro(anexos); }
    setRotuloDoEnvio(null);
    const res = await responderContato({ contato_id: r.id, mensagem: t, anexos });
    if (!res.data) { setEnvio("erro"); return setErro("Não foi possível enviar a resposta." + (res.erro ? " " + res.erro : " Tente novamente.")); }
    await registrar("Respondeu a mensagem de " + (r.nome || r.email || "contato"), qtdAnexos(anexos));
    if (!r.respondido_em) mudar({ ...r, respondido_em: res.data.respondido_em || new Date().toISOString() });
    setTexto("");
    setArquivos([]);
    setEnvio("feito");
    setEnviadaPara(r.origem === "enviado" ? paraDe(r).concat(r.copias || []).join(", ") : r.email);
    await carregarHistorico(r);
  };

  const excluir = async () => {
    const agendada = reu?.status === "agendada" || (!!r.reuniao_em && !reu);
    const base = "A mensagem de " + (r.nome || "este contato") + " e todo o histórico serão apagados definitivamente. Essa ação não pode ser desfeita.";
    const motivo = await pedir(agendada && r.email
      ? { titulo: "Excluir mensagem?", mensagem: base + " A reunião agendada será cancelada e " + r.email + " receberá um e-mail com o motivo.", ok: "Excluir mensagem", destrutiva: true, campo: { rotulo: "Motivo do cancelamento da reunião", placeholder: "Ex.: precisei remarcar por um imprevisto na agenda." } }
      : { titulo: "Excluir mensagem?", mensagem: base, ok: "Excluir mensagem", destrutiva: true });
    if (motivo === false) return;
    setExcluindo(true);
    setErroExcluir(null);
    const falhar = (t: string) => { setExcluindo(false); setErroExcluir(t); };
    let semEmail = false;
    if (reu || r.reuniao_em) {
      const { data, error } = await sb.functions.invoke("google-agenda", { body: { acao: "excluir", contato_id: r.id } });
      const codigo = error ? (await detalheDoErro(error)) || "falha" : (data as { error?: string })?.error;
      if (codigo && codigo !== "google_desconectado") return falhar("Não foi possível cancelar a reunião no Google Agenda: " + (codigo === "falha" ? "Não foi possível falar com o Google Agenda. Tente novamente." : codigo));
      // O e-mail com o motivo sai antes de apagar a mensagem, enquanto o contato ainda existe.
      if (typeof motivo === "string" && motivo) semEmail = !(await avisarCancelamento(r, motivo, reu?.titulo || "", reu?.inicio || r.reuniao_em, async (b) => !!(await responderContato(b)).data));
    }
    for (const pasta of ["respostas", "recebidas"]) {
      const { data: arqs } = await sb.storage.from("anexos").list(pasta + "/" + r.id, { limit: 1000 });
      if (arqs?.length) await sb.storage.from("anexos").remove(arqs.map((f) => pasta + "/" + r.id + "/" + f.name));
    }
    const { data: apagadas, error } = await sb.from("contatos").delete().eq("id", r.id).select("id");
    if (error || !apagadas?.length) return falhar("Não foi possível excluir a mensagem" + (error ? ": " + error.message : "."));
    await registrar("Excluiu a mensagem de contato de " + (r.nome || r.email || "contato"), r.assunto || "");
    toast.success(semEmail ? "Mensagem excluída, mas não foi possível enviar o e-mail com o motivo do cancelamento." : "Mensagem excluída com sucesso.");
    aoExcluir(r.id);
  };

  const para = r.email ? (r.origem === "enviado" ? ["Para: " + paraDe(r).join(", "), r.copias?.length ? "Cc: " + r.copias.join(", ") : ""].filter(Boolean).join(" · ") : "Para: " + r.email) + " · Sua assinatura é incluída automaticamente no final do e-mail." : "Este contato não informou e-mail.";

  return (
    <div className="grid gap-6" data-leitura={r.id}>
      <Cabecalho r={r} />
      <DivisorSuave />
      <Situacao r={r} reu={reu} aoAgendar={() => setReuniaoAberta(true)} />

      <section aria-labelledby="h-historico" className="grid gap-4">
        <h2 id="h-historico" className="text-subtitle font-semibold text-foreground">Histórico</h2>
        {!historico ? <Skeleton aria-busy="true" aria-label="Carregando o histórico" className="h-40 rounded-lg" /> : (
          <Conversa alinhamento="lados" rotulo={"Conversa com " + (r.nome || "contato")}>
            {historico.itens.map((it, i) => {
              if (it.tipo === "evento") {
                const ev = it.x as Evento;
                const f = EVENTOS[ev.tipo];
                return <SeparadorDaConversa key={"e" + ev.id}>{(f ? f(ev.detalhe) : ev.tipo) + " · " + dataCurta(it.em)}</SeparadorDaConversa>;
              }
              const saida = it.tipo === "saida";
              const resposta = saida ? (it.x as Resposta) : null;
              const recebida = !saida && it.x ? (it.x as Recebida) : null;
              const texto = !it.x ? r.mensagem : recebida ? recebida.texto : resposta!.mensagem;
              const muitos = resposta && (resposta.copias?.length || resposta.copias_ocultas?.length || (resposta.para || "").includes(","));
              const anexos = (it.x as Resposta | Recebida | undefined)?.anexos || [];
              const completo = recebida?.texto_completo && recebida.texto_completo.trim() !== (recebida.texto || "").trim() ? recebida.texto_completo : null;
              return (
                <BalaoDaConversa
                  key={i} autor={saida ? "eu" : "outro"} nome={saida ? "Você" : r.nome || "Contato"} quando={dataCurta(it.em)}
                  depois={(anexos.length > 0 || completo || muitos) && (
                    <div className="grid gap-2">
                      {muitos && <p className="text-label text-muted-foreground">{["Para: " + resposta!.para, resposta!.copias?.length ? "Cc: " + resposta!.copias.join(", ") : "", resposta!.copias_ocultas?.length ? "Cco: " + resposta!.copias_ocultas.join(", ") : ""].filter(Boolean).join(" · ")}</p>}
                      {completo && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="link" size="sm" className="group px-0 has-[>svg]:px-0">Ver e-mail completo <ChevronDown aria-hidden className="transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" /></Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="whitespace-pre-line text-body-sm">{completo}</CollapsibleContent>
                        </Collapsible>
                      )}
                      {anexos.length > 0 && <Anexos anexos={anexos} urls={historico.urls} />}
                    </div>
                  )}
                >
                  {texto || ""}
                </BalaoDaConversa>
              );
            })}
          </Conversa>
        )}
        {historico?.falhou && <MensagemDeErro>Parte do histórico não pôde ser carregada.</MensagemDeErro>}

        <form onSubmit={enviarResposta} noValidate className="grid gap-4">
          <Campo id="resposta" rotulo="Responder" ajuda={para}>
            {(p) => <Textarea {...p} rows={5} placeholder="Escreva sua resposta…" value={texto} onChange={(e) => { setTexto(e.target.value); setErro(null); }} disabled={!r.email} />}
          </Campo>
          <Anexador arquivos={arquivos} mudar={setArquivos} desabilitado={!r.email || envio === "enviando"} />
          <div aria-live="polite">
            {erro && <MensagemDeErro>{erro}</MensagemDeErro>}
            {enviadaPara && !erro && <p className="text-body-sm text-success-text">Resposta enviada para {enviadaPara}.</p>}
          </div>
          <div className="flex justify-end">
            <BotaoDeEnvio type="submit" estado={envio} onVoltar={() => setEnvio("parado")} disabled={!r.email} icone={<Send aria-hidden />} textos={{ enviando: rotuloDoEnvio || "Enviando…", feito: "Resposta enviada" }}>
              Enviar resposta
            </BotaoDeEnvio>
          </div>
        </form>
      </section>

      <DivisorSuave />
      <section aria-labelledby="h-excluir" className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-[1_1_20rem]">
          <h2 id="h-excluir" className="text-body font-semibold text-foreground">Excluir mensagem</h2>
          <p className="text-body-sm text-muted-foreground">Apaga a mensagem, o histórico de respostas, os anexos e a reunião agendada (o convidado é avisado do cancelamento).</p>
          {erroExcluir && <MensagemDeErro className="mt-2">{erroExcluir}</MensagemDeErro>}
        </div>
        <Button type="button" variant="exclusao-contorno" disabled={excluindo} onClick={() => void excluir()}>
          <Trash2 aria-hidden />{excluindo ? "Excluindo…" : "Excluir mensagem"}
        </Button>
      </section>

      <JanelaDeReuniao
        aberta={reuniaoAberta} mudar={setReuniaoAberta} contato={r} reuniao={reu}
        enviarResposta={async (b) => !!(await responderContato(b)).data}
        aoMudar={(nova, aviso) => {
          setReu(nova);
          // salvo (com aviso): a reunião passa a valer; rascunho (sem aviso): nada muda na mensagem; excluída: sem reunião.
          const novo = !nova ? { ...r, reuniao_em: null }
            : aviso ? { ...r, reuniao_em: nova.inicio ?? r.reuniao_em, respondido_em: r.respondido_em || nova.updated_at || new Date().toISOString() }
            : r;
          mudar(novo);
          if (aviso) toast.success(aviso);
          void carregarHistorico(novo);
        }}
      />
      {elemento}
    </div>
  );
}
