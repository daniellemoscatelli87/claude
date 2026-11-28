// Autorização da galeria (aba Parceiros): o pedido por e-mail em massa, os números de cada situação, a prévia do e-mail
// e os envios agendados, com as mesmas consultas, funções e textos da página de HTML. Componentes do DS:
// CardComCabecalho, Explicacao, Button, PreviaDoEmail (moldura do DS), LinhaDeLista + ChipDeEstado (envios agendados),
// Dialog + CampoDeBusca + Checkbox + Calendar + CampoDeHorario (agendar ou alterar).
import * as React from "react";
import { CalendarClock, CalendarDays, Eye, EyeOff, LoaderCircle, Pencil, RefreshCw, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MensagemDeErro } from "@/components/ui/campo";
import { CampoDeBusca } from "@/components/ui/campo-de-busca";
import { CampoDeHorario } from "@/components/ui/campo-de-horario";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CardComCabecalho, Explicacao } from "@/components/ui/painel-dados";
import { Separator } from "@/components/ui/separator";
import { plural } from "@/lib/formatar";
import { registrar, sb } from "@/lib/supabase";
import {
  detalheDoAgendamento, elegivel, erroDoAgendamento, fmtQuando, paraQuem, quantosRecebem, resumoDaGaleria, SITUACAO_DO_AGENDAMENTO, type Agendamento, type Parceiro,
} from "@/dados/parceiros";
import { chamarFuncao, Mensagem, PreviaDoEmail, usePerguntaDeConfirmacao, type Aviso } from "../comum";
import { JANELA_GRANDE } from "../email";

const doisDig = (n: number) => String(n).padStart(2, "0");
const diaLocal = (d: Date) => `${d.getFullYear()}-${doisDig(d.getMonth() + 1)}-${doisDig(d.getDate())}`;
const horaLocal = (d: Date) => `${doisDig(d.getHours())}:${doisDig(d.getMinutes())}`;

type Props = { todos: Parceiro[]; aoMudar: (f: (l: Parceiro[] | null) => Parceiro[] | null) => void };

export function AutorizacaoDaGaleria({ todos, aoMudar }: Props) {
  const r = resumoDaGaleria(todos);
  const [visualizaram, setVisualizaram] = React.useState<string>("…");
  const [previa, setPrevia] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [ocupado, setOcupado] = React.useState<"" | "previa" | "enviar" | "reenviar">("");
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  const [janela, setJanela] = React.useState<{ aberta: boolean; editando: Agendamento | null }>({ aberta: false, editando: null });
  const { pedir, elemento } = usePerguntaDeConfirmacao();

  // Quantos parceiros abriram o e-mail da galeria (rastreamento do Resend; cada parceiro conta uma vez).
  const contarVisualizacoes = React.useCallback(() => {
    void sb.from("email_envios").select("cadastro_id").eq("origem", "galeria-convite").not("aberto_em", "is", null).limit(5000)
      .then(({ data, error }) => setVisualizaram(error ? "–" : String(new Set((data || []).map((x: { cadastro_id: string }) => x.cadastro_id)).size)));
  }, []);
  const carregarAgendamentos = React.useCallback(async () => {
    const { data, error } = await sb.from("galeria_agendamentos").select("*").order("agendado_para", { ascending: false }).limit(30);
    setAgendamentos(error ? [] : ((data || []) as Agendamento[]));
  }, []);
  React.useEffect(() => { contarVisualizacoes(); void carregarAgendamentos(); }, [contarVisualizacoes, carregarAgendamentos]);

  const recarregar = async () => {
    const { data } = await sb.from("cadastros").select("id, galeria_status, galeria_convite_em");
    aoMudar((l) => (l || []).map((x) => ({ ...x, ...((data || []) as Partial<Parceiro>[]).find((y) => y.id === x.id) })));
    contarVisualizacoes();
  };
  const verEmail = async () => {
    if (previa) return setPrevia(null);
    setOcupado("previa");
    const res = await chamarFuncao<{ html?: string }>("galeria-convite", { acao: "preview" });
    setOcupado("");
    if (res.error || !res.html) return setAviso({ tom: "erro", texto: res.error || "Não foi possível gerar a pré-visualização." });
    setAviso(null); setPrevia(res.html);
  };
  const disparar = async (reenviar: boolean) => {
    const qtd = quantosRecebem(todos, reenviar);
    const txt = reenviar ? "Reenviar o pedido de autorização para quem ainda não respondeu (" + qtd + ")?" : "Enviar o pedido de autorização para quem ainda não foi convidado (" + qtd + ")?";
    if (!(await pedir({ titulo: "Pedido de autorização da galeria", mensagem: txt + " Quem se descadastrou dos comunicados não recebe.", ok: "Enviar" }))) return;
    setOcupado(reenviar ? "reenviar" : "enviar");
    const res = await chamarFuncao<{ enviados?: number; falhas?: number }>("galeria-convite", { acao: "pendentes", reenviar });
    setOcupado("");
    if (res.error) return setAviso({ tom: "erro", texto: res.error });
    setAviso(null);
    void registrar("Enviou pedido de autorização da galeria", (res.enviados || 0) + " enviados" + (res.falhas ? ", " + res.falhas + " não enviados" : ""));
    await recarregar();
    toast.success(res.falhas ? res.enviados + " enviados e " + res.falhas + " não enviados." : "Pedido enviado para " + plural(res.enviados || 0, "parceiro.", "parceiros."));
  };
  const excluir = async (a: Agendamento) => {
    if (!(await pedir({ titulo: "Excluir o envio agendado?", mensagem: "O envio de " + fmtQuando(a.agendado_para) + " será cancelado. Nenhum e-mail é enviado.", ok: "Excluir", destrutiva: true }))) return;
    const { error } = await sb.from("galeria_agendamentos").delete().eq("id", a.id).eq("situacao", "agendado");
    if (error) return toast.error("Não foi possível excluir: " + error.message);
    void registrar("Excluiu o envio agendado da autorização da galeria", fmtQuando(a.agendado_para));
    await carregarAgendamentos();
    toast.success("Envio agendado excluído.");
  };

  const numeros: [string, number | string, React.ReactNode?][] = [
    ["autorizaram", r.autorizaram], ["não autorizaram", r.recusaram], ["aguardando resposta", r.aguardando], ["não convidados", r.naoConvidados],
    ["visualizaram o e-mail", visualizaram, "Parceiros que abriram o e-mail da galeria. A abertura é uma estimativa: alguns programas de e-mail abrem a mensagem sozinhos e outros bloqueiam a contagem."],
  ];
  return (
    <CardComCabecalho icone={<Users />} titulo="Autorização da galeria" descricao="Pedido para o parceiro autorizar a exibição do perfil na Galeria de profissionais. Novos parceiros recebem o pedido automaticamente após o cadastro. A galeria aparece no site quando houver pelo menos 3 autorizações.">
      <div className="grid gap-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5" data-galeria-numeros="">
          {numeros.map(([t, v, explica]) => (
            <div key={t} className="grid content-start gap-0.5">
              <dd className="order-1 text-h3 font-bold tabular-nums text-foreground">{v}</dd>
              <dt className="order-2 flex items-center gap-1 text-body-sm text-muted-foreground">{t}{explica && <Explicacao termo={t}>{explica}</Explicacao>}</dt>
            </div>
          ))}
        </dl>
        {previa && <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"><PreviaDoEmail html={previa} titulo="E-mail de autorização da galeria" /></div>}
        <Mensagem aviso={aviso} className="empty:hidden" />
        {agendamentos.length > 0 && (
          <section aria-labelledby="ag-titulo" className="grid gap-2">
            <h3 id="ag-titulo" className="text-body font-semibold text-foreground">Envios agendados</h3>
            <ul className="border-y border-border">
              {agendamentos.map((a) => {
                const sit = SITUACAO_DO_AGENDAMENTO[a.situacao] || { rotulo: a.situacao, tom: "neutro" as const };
                return (
                  <LinhaDeLista
                    key={a.id} as="li" className="border-b border-border last:border-b-0" data-agendamento={a.id}
                    inicio={<CalendarClock aria-hidden className="mt-0.5 size-5 text-muted-foreground" />}
                    titulo={<span className="flex flex-wrap items-center gap-2"><span className="font-semibold">{fmtQuando(a.agendado_para)}</span><ChipDeEstado tom={sit.tom}>{sit.rotulo}</ChipDeEstado></span>}
                    descricao={<span className="grid gap-0.5"><span title={paraQuem(a, todos, 1000)}>Para: {paraQuem(a, todos, 6)}</span>{detalheDoAgendamento(a).map((t) => <span key={t}>{t}</span>)}</span>}
                    fim={a.situacao === "agendado" ? (
                      <span className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setJanela({ aberta: true, editando: a })}><Pencil aria-hidden />Alterar</Button>
                        <Button type="button" variant="exclusao-contorno" size="sm" onClick={() => void excluir(a)}><Trash2 aria-hidden />Excluir</Button>
                      </span>
                    ) : undefined}
                  />
                );
              })}
            </ul>
          </section>
        )}
        <Separator />
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end [&>button]:w-full sm:[&>button]:w-auto" data-galeria-acoes="">
          <Button type="button" variant="ghost" onClick={() => void verEmail()} disabled={ocupado === "previa"}>
            {ocupado === "previa" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : previa ? <EyeOff aria-hidden /> : <Eye aria-hidden />}{previa ? "Fechar o e-mail" : "Ver o e-mail"}
          </Button>
          <Button type="button" variant="outline" onClick={() => void disparar(true)} disabled={!r.aguardando || !!ocupado}>
            {ocupado === "reenviar" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <RefreshCw aria-hidden />}Reenviar a quem não respondeu
          </Button>
          <Button type="button" variant="outline" onClick={() => setJanela({ aberta: true, editando: null })}><CalendarClock aria-hidden />Agendar envio</Button>
          <Button type="button" onClick={() => void disparar(false)} disabled={!r.naoConvidados || !!ocupado}>
            {ocupado === "enviar" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Send aria-hidden />}Enviar aos não convidados
          </Button>
        </div>
      </div>
      <JanelaDeAgendamento {...janela} todos={todos} mudar={(v) => setJanela((j) => ({ ...j, aberta: v }))} aoSalvar={carregarAgendamentos} />
      {elemento}
    </CardComCabecalho>
  );
}

/**
 * Agendar (ou alterar) o envio: para quem (todos que ainda não decidiram, ou pessoas escolhidas), data e hora, ver o
 * e-mail e agendar. O banco confere a cada minuto e a função envia.
 */
function JanelaDeAgendamento({ aberta, editando, todos, mudar, aoSalvar }: { aberta: boolean; editando: Agendamento | null; todos: Parceiro[]; mudar: (v: boolean) => void; aoSalvar: () => Promise<void> }) {
  const podem = React.useMemo(() => todos.filter(elegivel), [todos]);
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [busca, setBusca] = React.useState("");
  const [dia, setDia] = React.useState("");
  const [hora, setHora] = React.useState("09:00");
  const [calendario, setCalendario] = React.useState(false);
  const [previa, setPrevia] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState("");
  const [ocupado, setOcupado] = React.useState<"" | "previa" | "salvar">("");
  const fimDaPrevia = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!aberta) return;
    // novo agendamento ou antigo no modo "todos": começa com todos que ainda não decidiram marcados
    setSel(new Set(!editando || editando.modo === "todos" ? podem.map((r) => r.id) : editando.destinatarios || []));
    // sugestão para um novo agendamento: amanhã às 9h
    const sug = new Date(); sug.setDate(sug.getDate() + 1); sug.setHours(9, 0, 0, 0);
    const d = editando ? new Date(editando.agendado_para) : sug;
    setDia(diaLocal(d)); setHora(horaLocal(d));
    setBusca(""); setPrevia(null); setErro(""); setCalendario(false);
  }, [aberta, editando, podem]);

  const q = busca.trim().toLowerCase();
  const visiveis = podem.filter((r) => !q || [r.nome, r.email].join(" ").toLowerCase().includes(q)).sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));
  const marcadas = podem.filter((r) => sel.has(r.id)).length;
  const todasMarcadas: boolean | "indeterminate" = podem.length > 0 && marcadas === podem.length ? true : marcadas > 0 ? "indeterminate" : false;
  const alternar = (id: string, on: boolean) => setSel((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const dataEscolhida = dia ? new Date(dia + "T12:00:00") : undefined;

  const verEmail = async () => {
    if (previa) return setPrevia(null);
    setOcupado("previa");
    const res = await chamarFuncao<{ html?: string }>("galeria-convite", { acao: "preview" });
    setOcupado("");
    if (res.error || !res.html) return setErro(res.error || "Não foi possível gerar a pré-visualização.");
    setPrevia(res.html);
    requestAnimationFrame(() => fimDaPrevia.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }));
  };
  const salvar = async () => {
    // só quem está marcado e ainda pode receber
    const ids = podem.map((r) => r.id).filter((id) => sel.has(id));
    const quando = dia && hora ? new Date(`${dia}T${hora}`) : null;
    const e = erroDoAgendamento(ids, quando);
    if (e) return setErro(e);
    const dados = { modo: "selecionados", destinatarios: ids, agendado_para: quando!.toISOString() };
    setOcupado("salvar");
    const { error } = editando
      ? await sb.from("galeria_agendamentos").update({ ...dados, atualizado_em: new Date().toISOString() }).eq("id", editando.id).eq("situacao", "agendado")
      : await sb.from("galeria_agendamentos").insert(dados);
    setOcupado("");
    if (error) return setErro("Não foi possível salvar: " + error.message);
    void registrar((editando ? "Alterou" : "Agendou") + " o envio da autorização da galeria", fmtQuando(dados.agendado_para) + " · " + plural(ids.length, "pessoa", "pessoas"));
    mudar(false);
    await aoSalvar();
    toast.success((editando ? "Agendamento alterado para " : "Envio agendado para ") + fmtQuando(dados.agendado_para) + ".");
  };

  return (
    <Dialog open={aberta} onOpenChange={(v) => !ocupado && mudar(v)}>
      <DialogContent className={JANELA_GRANDE}>
        <DialogHeader>
          <DialogTitle>{editando ? "Alterar envio agendado" : "Agendar envio"}</DialogTitle>
          <DialogDescription>Pedido de autorização da galeria. Quem já decidiu ou se descadastrou dos comunicados não recebe, mesmo que esteja na lista.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-body-sm font-semibold text-foreground">Para quem</legend>
            <div className="flex items-center gap-3">
              <Checkbox id="ag-todos" checked={todasMarcadas} onCheckedChange={(v) => { setSel(new Set(v === true ? podem.map((r) => r.id) : [])); setErro(""); }} />
              <Label htmlFor="ag-todos" className="font-normal">Marcar todos que ainda não decidiram ({podem.length})</Label>
            </div>
            <CampoDeBusca rotulo="Buscar parceiro" placeholder="Buscar por nome ou e-mail" valor={busca} onValorChange={setBusca} />
            <ul className="max-h-64 overflow-y-auto rounded-md border border-border" aria-label="Parceiros que ainda não decidiram">
              {visiveis.length ? visiveis.map((r) => (
                <LinhaDeLista
                  key={r.id} as="li" interativa className="px-3"
                  inicio={<Checkbox id={"ag-p-" + r.id} checked={sel.has(r.id)} onCheckedChange={(v) => { alternar(r.id, v === true); setErro(""); }} />}
                  titulo={<Label htmlFor={"ag-p-" + r.id} className="font-medium">{r.nome || r.email}</Label>}
                  descricao={r.galeria_convite_em ? "Convidado em " + fmtQuando(r.galeria_convite_em) + ", sem resposta" : "Ainda não convidado"}
                />
              )) : <li><EstadoVazio variante="lista" tamanho="sm" icone={<Users />} titulo="Ninguém para mostrar." /></li>}
            </ul>
            <p className="text-body-sm text-muted-foreground" aria-live="polite">{marcadas ? "Vai para " + plural(marcadas, "pessoa marcada", "pessoas marcadas") + "." : "Nenhuma pessoa marcada"}</p>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label id="ag-dia-rotulo" htmlFor="ag-dia" className="text-body-sm font-semibold">Data do envio</Label>
              {/* O calendário abre logo abaixo do campo, dentro da janela (um Popover dentro do Dialog não se posiciona). */}
              <Button id="ag-dia" type="button" variant="outline" aria-labelledby="ag-dia-rotulo ag-dia-valor" aria-expanded={calendario} aria-controls="ag-calendario" className="w-full justify-start bg-card font-normal" onClick={() => setCalendario((v) => !v)}>
                <CalendarDays aria-hidden className="text-muted-foreground" />
                <span id="ag-dia-valor">{dataEscolhida ? dataEscolhida.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" }) : "Escolha a data"}</span>
              </Button>
              {calendario && (
                <div id="ag-calendario" className="w-fit rounded-md border border-border bg-card motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
                  <Calendar mode="single" selected={dataEscolhida} defaultMonth={dataEscolhida} disabled={{ before: new Date(new Date().toDateString()) }}
                    onSelect={(d) => { if (d) { setDia(diaLocal(d)); setErro(""); } setCalendario(false); document.getElementById("ag-dia")?.focus(); }} />
                </div>
              )}
            </div>
            <CampoDeHorario id="ag-hora" rotulo="Hora do envio" valor={hora} onValorChange={(v) => { setHora(v); setErro(""); }} />
          </div>
          {previa && <div ref={fimDaPrevia} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"><PreviaDoEmail html={previa} titulo="E-mail de autorização da galeria" /></div>}
          {erro && <MensagemDeErro id="ag-erro">{erro}</MensagemDeErro>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => void verEmail()} disabled={!!ocupado}>
            {ocupado === "previa" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : previa ? <EyeOff aria-hidden /> : <Eye aria-hidden />}{previa ? "Fechar o e-mail" : "Ver o e-mail"}
          </Button>
          <Button type="button" onClick={() => void salvar()} disabled={!!ocupado}>
            {ocupado === "salvar" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <CalendarClock aria-hidden />}{editando ? "Salvar alterações" : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
