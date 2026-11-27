// Reuniões: a mesma informação, as mesmas ações e os mesmos textos de public/admin/reunioes/index.html, só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A) com o número de reuniões agendadas;
// - AlertaComAcao: Google Agenda conectado (sucesso, "Reconectar") ou não (aviso, "Conectar Google Agenda");
// - AgendaDoMes: o mês com as reuniões (pontos; passadas em cinza) e a lista do dia escolhido, só os dias com reunião
//   podem ser escolhidos;
// - CardComCabecalho "Próximas reuniões" com LinhaDeLista + IconeComBase; a ação principal (Entrar no Meet ou Ver no
//   mapa) em Button e as outras (Editar reunião, Ver histórico, Enviar e-mail, Adicionar ao Google Agenda) num
//   DropdownMenu; "Mostrar reuniões anteriores (N)" abre as que já passaram; EstadoVazio sem reuniões.
import * as React from "react";
import { CalendarCheck, CalendarPlus, CircleAlert, History, Mail, MapPin, MoreHorizontal, Pencil, Video } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AgendaDoMes, type EventoDaAgenda } from "@/components/ui/agenda-do-mes";
import { AlertaComAcao, BotaoDoAlerta } from "@/components/ui/alerta-com-acao";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, IconeComBase } from "@/components/ui/painel-dados";
import { Skeleton } from "@/components/ui/skeleton";
import { registrar, sb } from "@/lib/supabase";
import { plural } from "@/lib/formatar";
import { LinkDaArea } from "@/casca/base";
import { agenda, hora, linkDoGoogleAgenda, mapaDe, reuniaoDe, separarReunioes, type ContatoComReuniao, type StatusDoGoogle } from "@/dados/reunioes";
import { Vazio } from "./comum";

const diaIso = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/** Ações de uma reunião: a principal fica à vista; as outras num menu (a mesma lista da página de HTML). */
function AcoesDaReuniao({ r, passada }: { r: ContatoComReuniao; passada: boolean }) {
  const reu = reuniaoDe(r);
  const d = new Date(r.reuniao_em);
  const presencial = reu?.formato === "presencial" && !!reu.endereco;
  const principal = passada ? null : presencial ? { href: mapaDe(reu!.endereco!), rotulo: "Ver no mapa", Icone: MapPin } : reu?.meet_link ? { href: reu.meet_link, rotulo: "Entrar no Meet", Icone: Video } : null;
  return (
    <span className="flex items-center gap-2">
      {principal && (
        <Button asChild variant="outline" size="sm">
          <a href={principal.href} target="_blank" rel="noopener noreferrer"><principal.Icone aria-hidden />{principal.rotulo}</a>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={"Mais ações da reunião com " + (r.nome || "contato")}><MoreHorizontal aria-hidden /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><LinkDaArea href={`/admin/contatos/?id=${r.id}&reuniao=1`}><Pencil aria-hidden />Editar reunião</LinkDaArea></DropdownMenuItem>
          <DropdownMenuItem asChild><LinkDaArea href={`/admin/contatos/?id=${r.id}`}><History aria-hidden />Ver histórico</LinkDaArea></DropdownMenuItem>
          {r.email && (
            <DropdownMenuItem asChild>
              <a href={"mailto:" + r.email + "?subject=" + encodeURIComponent("Nossa reunião em " + d.toLocaleDateString("pt-BR") + " às " + hora(d))}><Mail aria-hidden />Enviar e-mail</a>
            </DropdownMenuItem>
          )}
          {!passada && !reu?.google_event_id && (
            <DropdownMenuItem asChild>
              <a href={linkDoGoogleAgenda(r)} target="_blank" rel="noopener noreferrer"><CalendarPlus aria-hidden />Adicionar ao Google Agenda</a>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

function LinhaDaReuniao({ r, passada, naAgenda = false }: { r: ContatoComReuniao; passada: boolean; naAgenda?: boolean }) {
  const reu = reuniaoDe(r);
  const d = new Date(r.reuniao_em);
  const quando = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, "") + " · " + hora(d);
  const Item = naAgenda ? "div" : "li";
  return (
    <Item data-reuniao={r.id} data-passada={passada ? "" : undefined}>
      <LinhaDeLista
        // na lista do dia da AgendaDoMes, o recuo já vem da agenda
        className={naAgenda ? "px-0 py-0" : "px-5 sm:px-6"} alinhar="centro"
        inicio={<IconeComBase tom={passada ? "neutro" : "marca"} redonda>{reu?.formato === "presencial" ? <MapPin /> : <CalendarCheck />}</IconeComBase>}
        titulo={r.nome || "Sem nome"}
        descricao={<span className="tabular-nums">{quando}</span>}
        fim={<AcoesDaReuniao r={r} passada={passada} />}
      >
        {(r.empresa || r.assunto) && <span className="mt-0.5 block text-body-sm text-foreground [overflow-wrap:anywhere]">{[r.empresa, r.assunto].filter(Boolean).join(" · ")}</span>}
        {reu?.formato === "presencial" && reu.endereco && <span className="mt-0.5 block text-body-sm text-muted-foreground [overflow-wrap:anywhere]">Presencial: {reu.endereco}</span>}
      </LinhaDeLista>
    </Item>
  );
}

function CartaoDoGoogle() {
  const [status, setStatus] = React.useState<StatusDoGoogle | null>(null);
  const [aviso, setAviso] = React.useState<string | null>(null);
  const [conectando, setConectando] = React.useState(false);
  const retorno = React.useMemo(() => new URLSearchParams(location.search).get("google"), []);
  React.useEffect(() => {
    agenda<StatusDoGoogle>({ acao: "status" }).then(setStatus);
    if (retorno) history.replaceState(history.state, "", location.pathname);
  }, [retorno]);
  if (!status) return null;
  const conectar = async () => {
    setConectando(true);
    const r = await agenda<{ url?: string }>({ acao: "conectar" });
    if (r.url) { await registrar("Iniciou a conexão com o Google Agenda"); location.href = r.url; return; }
    setConectando(false);
    setAviso("Não foi possível iniciar a conexão. Tente novamente.");
  };
  const botao = status.configurado !== false && (
    <BotaoDoAlerta onClick={() => void conectar()} disabled={conectando}>{status.conectado ? "Reconectar" : "Conectar Google Agenda"}</BotaoDoAlerta>
  );
  if (status.conectado) {
    return (
      <AlertaComAcao tom="sucesso" titulo="Google Agenda conectado" acoes={botao} data-google="conectado">
        {aviso || (retorno === "ok" ? "Pronto! Agora as reuniões são criadas no seu Google Agenda com link do Meet." : "As reuniões são criadas no seu Google Agenda com link do Meet.")}
      </AlertaComAcao>
    );
  }
  return (
    <AlertaComAcao tom="aviso" titulo="Google Agenda não conectado" acoes={botao} data-google="desconectado">
      {aviso || (retorno === "erro" ? "Não foi possível concluir a conexão. Tente novamente." : status.configurado === false ? "Falta salvar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nos secrets do Supabase." : "Conecte para gerar o link do Meet e enviar convites pelo Google Agenda.")}
    </AlertaComAcao>
  );
}

export function Reunioes() {
  const [lista, setLista] = React.useState<ContatoComReuniao[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [anteriores, setAnteriores] = React.useState(false);
  const agora = React.useMemo(() => new Date(), []);
  const [dia, setDia] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    document.title = "Reuniões | Área restrita";
    sb.from("contatos").select("id, nome, email, telefone, empresa, cargo, assunto, mensagem, reuniao_em, reunioes(meet_link, google_event_id, formato, endereco)")
      .not("reuniao_em", "is", null).order("reuniao_em", { ascending: true })
      .then(({ data, error }) => {
        if (error) return setErro("Não foi possível carregar as reuniões: " + error.message);
        const l = (data || []) as ContatoComReuniao[];
        setLista(l);
        // Começa no dia da próxima reunião (ou da última, se todas já passaram); sem reuniões, hoje.
        const { proximas: p, anteriores: a } = separarReunioes(l, agora);
        const alvo = p[0] || a[0];
        if (alvo) setDia(diaIso(alvo.reuniao_em));
      });
  }, [agora]);

  const { proximas, anteriores: passadas } = separarReunioes(lista || [], agora);
  const eventos: EventoDaAgenda[] = (lista || []).map((r) => {
    const d = new Date(r.reuniao_em);
    const reu = reuniaoDe(r);
    return {
      id: r.id, data: diaIso(r.reuniao_em), hora: hora(d), titulo: r.nome || "Sem nome", passado: d < agora,
      descricao: [r.empresa, reu?.formato === "presencial" && reu.endereco ? "Presencial: " + reu.endereco : r.assunto].filter(Boolean).join(" · "),
    };
  });
  const porId = new Map((lista || []).map((r) => [r.id, r]));

  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina titulo="Reuniões" descricao={lista ? plural(proximas.length, "reunião agendada", "reuniões agendadas") : undefined} />
      <CartaoDoGoogle />
      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{erro} Recarregue a página para tentar de novo.</AlertDescription>
        </Alert>
      )}
      {!lista && !erro && <Skeleton aria-busy="true" aria-label="Carregando as reuniões" className="h-96 rounded-xl" />}
      {lista && (
        <div className="grid gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
          <section aria-label="Agenda do mês">
            <AgendaDoMes
              eventos={eventos} dia={dia} onDiaChange={setDia} diasSemEventos="inativos"
              textos={{ compromisso: "reunião", compromissos: "reuniões", semEventos: "Nenhuma reunião neste dia", semEventosTexto: "Toque em um dia marcado para ver as reuniões." }}
              renderEvento={(e) => { const r = porId.get(e.id!); return r ? <LinhaDaReuniao r={r} passada={!!e.passado} naAgenda /> : null; }}
            />
          </section>

          <CardComCabecalho
            idDoTitulo="h-proximas" icone={<CalendarCheck />} titulo="Próximas reuniões" sangria
            descricao={proximas.length ? plural(proximas.length, "reunião", "reuniões") : undefined}
          >
            {proximas.length ? (
              <ul>{proximas.map((r) => <LinhaDaReuniao key={r.id} r={r} passada={false} />)}</ul>
            ) : (
              <Vazio className="px-5 sm:px-6" icone={<CalendarCheck />} descricao="Para agendar, abra uma mensagem de contato e toque em Agendar reunião.">Nenhuma reunião agendada.</Vazio>
            )}
            {passadas.length > 0 && (
              <div className="px-5 pt-4 sm:px-6">
                <Button type="button" variant="outline" aria-expanded={anteriores} onClick={() => setAnteriores((v) => !v)}>
                  {anteriores ? "Ocultar reuniões anteriores" : `Mostrar reuniões anteriores (${passadas.length})`}
                </Button>
              </div>
            )}
            {anteriores && (
              <ul aria-label="Reuniões anteriores" className="mt-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
                {passadas.map((r) => <LinhaDaReuniao key={r.id} r={r} passada />)}
              </ul>
            )}
          </CardComCabecalho>
        </div>
      )}
    </div>
  );
}
