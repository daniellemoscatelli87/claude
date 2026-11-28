// Agendar ou alterar a reunião de uma mensagem de contato no Google Agenda: os mesmos campos, regras, textos e ações do
// painel de public/admin/contatos/index.html, numa janela (Dialog do DS):
// data (Popover com Calendar), horário (CampoDeHorario, de 15 em 15 min), duração (Select), formato (SegmentedControl:
// online com Google Meet ou presencial com endereço e sugestões: CampoDeEndereco + buscaNoPhoton), título, assunto e descrição (Campo, Textarea), link do Meet
// (CampoCopiavel) e as ações (Excluir/Descartar em contorno de exclusão, Enviar convite/Salvar em botão cheio).
import * as React from "react";
import { CalendarDays, ExternalLink, LoaderCircle, MapPin, Video } from "lucide-react";
import { AlertaComAcao, BotaoDoAlerta } from "@/components/ui/alerta-com-acao";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Campo, MensagemDeErro } from "@/components/ui/campo";
import { CampoCopiavel } from "@/components/ui/campo-copiavel";
import { CampoDeHorario } from "@/components/ui/campo-de-horario";
import { buscaNoPhoton, CampoDeEndereco } from "@/components/ui/campo-de-endereco";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { registrar } from "@/lib/supabase";
import { agenda, erroAgenda, type Reuniao, type StatusDoGoogle } from "@/dados/reunioes";
import { usePerguntaDeConfirmacao } from "../comum";
import { JANELA_GRANDE } from "../email";

export type ContatoDaReuniao = { id: string; nome: string | null; email: string | null; empresa: string | null; assunto: string | null; reuniao_em: string | null; respondido_em: string | null };

const DURACOES: [number, string][] = [[30, "30 min"], [45, "45 min"], [60, "1 hora"], [90, "1h30"], [120, "2 horas"]];
const doisDig = (n: number) => String(n).padStart(2, "0");
const diaLocal = (d: Date) => `${d.getFullYear()}-${doisDig(d.getMonth() + 1)}-${doisDig(d.getDate())}`;
const horaLocal = (d: Date) => `${doisDig(d.getHours())}:${doisDig(d.getMinutes())}`;

/** E-mail ao contato com o motivo do cancelamento (vai pelo envio de respostas, com a assinatura). */
export async function avisarCancelamento(r: ContatoDaReuniao, motivo: string, titulo: string, quando: string | null | undefined, enviar: (body: object) => Promise<boolean>) {
  const nome = (r.nome || "").trim().split(/\s+/)[0];
  const texto = (nome ? "Olá, " + nome + ".\n\n" : "") + "A reunião" + (titulo ? " “" + titulo + "”" : "") + (quando ? ", marcada para " + new Date(quando).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" }) + "," : "") + " foi cancelada.\n\nMotivo: " + motivo;
  return enviar({ contato_id: r.id, mensagem: texto, anexos: [] });
}

/** Valida os campos como a página de HTML; devolve o erro de cada campo (ou nada). */
export function validarReuniao(v: { dia: string; hora: string; formato: string; endereco: string }, hoje = diaLocal(new Date())) {
  if (!v.dia) return { campo: "dia", erro: "Escolha a data da reunião." };
  if (v.dia < hoje) return { campo: "dia", erro: "Escolha uma data a partir de hoje." };
  if (!v.hora) return { campo: "hora", erro: "Escolha o horário." };
  if (v.formato === "presencial" && !v.endereco.trim()) return { campo: "endereco", erro: "Informe o endereço da reunião presencial." };
  return null;
}

type Props = {
  aberta: boolean;
  mudar: (v: boolean) => void;
  contato: ContatoDaReuniao;
  reuniao: Reuniao | null;
  /** Depois de salvar ou excluir: a reunião nova (ou null) e o aviso para a pessoa. */
  aoMudar: (reuniao: Reuniao | null, aviso?: string) => void;
  enviarResposta: (body: object) => Promise<boolean>;
};

/** Sugestões de endereço: a mesma busca da página de HTML (Photon/komoot, até 5, perto de Curitiba, só Brasil). */
const BUSCAR_ENDERECO = buscaNoPhoton();

export function JanelaDeReuniao({ aberta, mudar, contato: r, reuniao: reu, aoMudar, enviarResposta }: Props) {
  const [google, setGoogle] = React.useState<StatusDoGoogle | null>(null);
  const agendada = reu?.status === "agendada" || (!!r.reuniao_em && !reu);
  const inicio = reu?.inicio || r.reuniao_em;
  const [dia, setDia] = React.useState("");
  const [hora, setHora] = React.useState("10:00");
  const [duracao, setDuracao] = React.useState("60");
  const [formato, setFormato] = React.useState<"online" | "presencial">("online");
  const [endereco, setEndereco] = React.useState("");
  const [titulo, setTitulo] = React.useState("");
  const [assunto, setAssunto] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [erros, setErros] = React.useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);
  const [ocupado, setOcupado] = React.useState<"" | "gerar" | "salvar" | "excluir">("");
  const [calendario, setCalendario] = React.useState(false);
  const { pedir, elemento } = usePerguntaDeConfirmacao();

  React.useEffect(() => {
    if (!aberta) return;
    if (inicio) { const d = new Date(inicio); setDia(diaLocal(d)); setHora(horaLocal(d)); } else { setDia(""); setHora("10:00"); }
    setDuracao(String(reu?.duracao_min || 60));
    setFormato(reu?.formato === "presencial" ? "presencial" : "online");
    setEndereco(reu?.endereco || "");
    setTitulo(reu?.titulo || "Reunião com " + (r.nome || "contato") + (r.empresa ? " (" + r.empresa + ")" : "") + " | Dani Moscatelli");
    setAssunto(reu ? reu.assunto ?? "" : r.assunto || "");
    setDescricao(reu?.descricao ?? "");
    setErros({});
    setErroGeral(null);
    if (!google) agenda<StatusDoGoogle>({ acao: "status" }).then(setGoogle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  const valores = () => {
    const e = validarReuniao({ dia, hora, formato, endereco });
    if (e) {
      setErros({ [e.campo]: e.erro });
      setErroGeral(null);
      document.getElementById("reuniao-" + e.campo)?.focus();
      return null;
    }
    setErros({});
    return { contato_id: r.id, inicio: new Date(dia + "T" + hora).toISOString(), duracao_min: Number(duracao), titulo: titulo.trim(), assunto: assunto.trim(), descricao: descricao.trim(), formato, endereco: formato === "presencial" ? endereco.trim() : "" };
  };
  const executar = async <T extends object>(qual: "gerar" | "salvar" | "excluir", body: object): Promise<(T & { error?: string }) | null> => {
    setErroGeral(null);
    setOcupado(qual);
    const res = await agenda<T>(body);
    setOcupado("");
    if (res.error) {
      setErroGeral(erroAgenda(res.error));
      if (res.error === "google_desconectado") setGoogle({ configurado: true, conectado: false });
      return null;
    }
    return res;
  };
  const gerarLink = async () => {
    const v = valores();
    if (!v) return;
    const res = await executar<{ reuniao: Reuniao }>("gerar", { acao: "salvar", ...v, enviar: false });
    if (!res) return;
    await registrar("Gerou link do Meet para reunião com " + (r.nome || r.email || "contato"));
    aoMudar(res.reuniao);
  };
  const salvar = async () => {
    const v = valores();
    if (!v) return;
    const res = await executar<{ reuniao: Reuniao }>("salvar", { acao: "salvar", ...v, enviar: true });
    if (!res) return;
    await registrar((agendada ? "Alterou a reunião com " : "Agendou reunião com ") + (r.nome || r.email || "contato"), new Date(res.reuniao.inicio!).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }));
    mudar(false);
    aoMudar(res.reuniao, agendada ? "Reunião salva." : "Convite enviado.");
  };
  const excluir = async () => {
    const motivo = await pedir(agendada
      ? { titulo: "Excluir reunião?", mensagem: "O evento será cancelado no Google Agenda e " + (r.email || "o convidado") + " receberá um e-mail com o motivo do cancelamento.", ok: "Excluir reunião", destrutiva: true, campo: { rotulo: "Motivo do cancelamento", placeholder: "Ex.: precisei remarcar por um imprevisto na agenda." } }
      : { titulo: "Descartar rascunho?", mensagem: "O rascunho e o link do Meet gerado serão apagados.", ok: "Descartar", destrutiva: true });
    if (motivo === false) return;
    const quando = reu?.inicio || r.reuniao_em, tituloReu = reu?.titulo || "";
    const res = await executar("excluir", { acao: "excluir", contato_id: r.id });
    if (!res) return;
    await registrar((agendada ? "Cancelou a reunião com " : "Descartou o rascunho de reunião com ") + (r.nome || r.email || "contato"), typeof motivo === "string" ? "Motivo: " + motivo : "");
    mudar(false);
    let aviso = agendada ? "Reunião excluída com sucesso." : "Rascunho descartado com sucesso.";
    if (agendada && r.email && typeof motivo === "string") {
      const ok = await avisarCancelamento(r, motivo, tituloReu, quando, enviarResposta);
      aviso = ok ? "Reunião excluída com sucesso. O motivo foi enviado para " + r.email + "." : "Reunião excluída, mas não foi possível enviar o e-mail com o motivo.";
    }
    aoMudar(null, aviso);
  };
  const conectar = async () => {
    setOcupado("salvar");
    const res = await agenda<{ url?: string }>({ acao: "conectar" });
    if (res.url) { await registrar("Iniciou a conexão com o Google Agenda"); location.href = res.url; return; }
    setOcupado("");
    setErroGeral(erroAgenda(res.error || "falha"));
  };

  const desconectado = google && (google.error || !google.conectado);
  const dataEscolhida = dia ? new Date(dia + "T12:00") : undefined;
  return (
    <Dialog open={aberta} onOpenChange={(v) => !ocupado && mudar(v)}>
      <DialogContent className={JANELA_GRANDE}>
        <DialogHeader>
          <DialogTitle>{agendada ? "Reunião agendada" : "Agendar reunião"}</DialogTitle>
          <DialogDescription>{[r.nome, r.email].filter(Boolean).join(" · ")}</DialogDescription>
        </DialogHeader>

        {!google && <Skeleton aria-busy="true" aria-label="Carregando" className="h-64 rounded-lg" />}
        {desconectado && (
          <AlertaComAcao
            tom="aviso" titulo="Google Agenda não conectado"
            acoes={google.configurado !== false && <BotaoDoAlerta onClick={() => void conectar()} disabled={!!ocupado}>Conectar Google Agenda</BotaoDoAlerta>}
          >
            {google.configurado === false ? erroAgenda("sem_credenciais") : "Conecte sua conta Google para gerar o link do Meet e enviar o convite pelo Google Agenda."}
          </AlertaComAcao>
        )}
        {google && !desconectado && (
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label id="reuniao-dia-rotulo" htmlFor="reuniao-dia" className="text-body-sm font-semibold">Data</Label>
                <Popover open={calendario} onOpenChange={setCalendario}>
                  <PopoverTrigger asChild>
                    <Button id="reuniao-dia" aria-labelledby="reuniao-dia-rotulo reuniao-dia-valor" type="button" variant="outline" className="w-full justify-start bg-card font-normal" aria-invalid={erros.dia ? true : undefined} aria-describedby={erros.dia ? "reuniao-dia-erro" : undefined}>
                      <CalendarDays aria-hidden className="text-muted-foreground" />
                      <span id="reuniao-dia-valor">{dataEscolhida ? dataEscolhida.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" }) : "Escolha a data"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single" selected={dataEscolhida} defaultMonth={dataEscolhida}
                      disabled={{ before: new Date() }}
                      onSelect={(d) => { if (d) { setDia(diaLocal(d)); setErros((x) => ({ ...x, dia: "" })); } setCalendario(false); }}
                    />
                  </PopoverContent>
                </Popover>
                {erros.dia && <MensagemDeErro id="reuniao-dia-erro">{erros.dia}</MensagemDeErro>}
              </div>
              <CampoDeHorario id="reuniao-hora" valor={hora} onValorChange={(v) => { setHora(v); setErros((x) => ({ ...x, hora: "" })); }} erro={erros.hora || null} />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="reuniao-duracao" className="text-body-sm font-semibold">Duração</Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger id="reuniao-duracao" className="w-full bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>{DURACOES.map(([m, t]) => <SelectItem key={m} value={String(m)}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2">
              <p id="reuniao-formato" className="text-body-sm font-semibold text-foreground">Formato</p>
              <SegmentedControl
                aria-labelledby="reuniao-formato" fullWidth value={formato} onValueChange={(v) => { setFormato(v); setErroGeral(null); }}
                options={[{ value: "online", label: "Online (Google Meet)", icon: <Video aria-hidden /> }, { value: "presencial", label: "Presencial", icon: <MapPin aria-hidden /> }]}
              />
            </div>
            {formato === "presencial" && (
              <CampoDeEndereco
                id="reuniao-endereco" rotulo="Endereço" placeholder="Endereço ou nome do local" maxLength={500} autoComplete="street-address"
                ajuda="Confira o número e acrescente o complemento, se precisar." erro={erros.endereco || null}
                valor={endereco} onValorChange={(v) => { setEndereco(v); setErros((x) => ({ ...x, endereco: "" })); }} buscar={BUSCAR_ENDERECO}
              />
            )}
            <Campo id="reuniao-titulo" rotulo="Título" maxLength={200} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <Campo id="reuniao-assunto" rotulo="Assunto" maxLength={300} value={assunto} onChange={(e) => setAssunto(e.target.value)} />
            <Campo id="reuniao-descricao" rotulo="Descrição">
              {(p) => <Textarea {...p} rows={5} maxLength={5000} value={descricao} onChange={(e) => setDescricao(e.target.value)} />}
            </Campo>
            {formato === "online" && (
              <div className="min-w-0 space-y-2" data-link-do-meet="">
                <p className="text-body-sm font-semibold text-foreground">Link da reunião (Google Meet)</p>
                {reu?.meet_link ? (
                  <>
                    <CampoCopiavel valor={reu.meet_link} rotulo="Link da reunião (Google Meet)" />
                    {reu.evento_link && (
                      <Button asChild variant="link" className="px-0">
                        <a href={reu.evento_link} target="_blank" rel="noopener noreferrer">Abrir no Google Agenda <ExternalLink aria-hidden /></a>
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-body-sm text-muted-foreground">O link é criado pelo Google ao gerar a reunião.</p>
                    <Button type="button" variant="outline" disabled={!!ocupado} onClick={() => void gerarLink()}>
                      {ocupado === "gerar" && <LoaderCircle aria-hidden className="motion-safe:animate-spin" />}
                      {ocupado === "gerar" ? "Gerando…" : "Gerar link do Meet"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div aria-live="polite">{erroGeral && <MensagemDeErro>{erroGeral}</MensagemDeErro>}</div>
            {r.email && (
              <p className="text-body-sm text-muted-foreground">
                {agendada ? "Ao salvar, " + r.email + " recebe a atualização pelo Google Agenda." : "Ao enviar, " + r.email + " recebe o convite do Google Agenda " + (formato === "presencial" ? "com o endereço." : "com o link do Meet.")}
              </p>
            )}
          </div>
        )}

        {google && !desconectado && (
          <DialogFooter className="sm:justify-between">
            {reu || r.reuniao_em ? (
              <Button type="button" variant="exclusao-contorno" disabled={!!ocupado} onClick={() => void excluir()}>
                {ocupado === "excluir" && <LoaderCircle aria-hidden className="motion-safe:animate-spin" />}
                {ocupado === "excluir" ? "Excluindo…" : agendada ? "Excluir reunião" : "Descartar"}
              </Button>
            ) : <span />}
            <Button type="button" disabled={!!ocupado} onClick={() => void salvar()}>
              {ocupado === "salvar" && <LoaderCircle aria-hidden className="motion-safe:animate-spin" />}
              {ocupado === "salvar" ? (agendada ? "Salvando…" : "Enviando…") : agendada ? "Salvar" : "Enviar convite"}
            </Button>
          </DialogFooter>
        )}
        {elemento}
      </DialogContent>
    </Dialog>
  );
}
