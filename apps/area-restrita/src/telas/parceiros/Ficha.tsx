// Candidatura de um parceiro (/admin/parceiros/?id=): resumo do perfil, todas as respostas por seção, Galeria de
// Profissionais (convite, situação, exibir, perfil enviado, histórico de decisões), e-mails enviados (entrega, abertura e
// clique) e consentimento LGPD com a exclusão do cadastro. As mesmas consultas, ações e textos da página de HTML.
// Componentes do DS: Card, CardComCabecalho, Avatar, Accordion, Collapsible, Switch, ChipDeEstado, LinhaDeLista,
// Badge, Button (exclusao-contorno), EstadoVazio, Skeleton e a pergunta de confirmação (AlertDialog).
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, CircleAlert, Clock, FileText, Image, LoaderCircle, Mail, Send, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CardComCabecalho } from "@/components/ui/painel-dados";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { LinkDaArea } from "@/casca/base";
import { useNotificacoes } from "@/casca/notificacoes";
import { registrar, sb } from "@/lib/supabase";
import {
  areasAtuacao, caminhoDaFoto, contribuicaoPadrao, espGaleria, limpaTxt, limpar, NIVEL, PERFIL_DA_GALERIA_LIMPO, respostasParaMostrar, SECOES, tagsGaleria,
  tempoGaleria, valorDaResposta, type Parceiro,
} from "@/dados/parceiros";
import { usePerguntaDeConfirmacao } from "../comum";
import { FotoDoParceiro } from "../Parceiros";

const fmtData = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const LISTA = "/admin/parceiros/?aba=candidaturas";

export function Ficha({ id }: { id: string }) {
  const [dados, setDados] = React.useState<Parceiro | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [entrega, setEntrega] = React.useState<string | null>(null);
  React.useEffect(() => {
    let vivo = true;
    void sb.from("cadastros").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (!vivo) return;
      if (error || !data) return setErro(error ? "Não foi possível carregar a candidatura." : "Candidatura não encontrada.");
      const r = data as Parceiro;
      setDados(r);
      document.title = (r.nome || "Parceiro") + " | Área restrita";
      // Ao abrir pela primeira vez, guarda quando foi vista (Admin.markSeen).
      if (!r.visualizado_em) void sb.from("cadastros").update({ visualizado_em: new Date().toISOString() }).eq("id", r.id).then(({ error: e }) => e && console.error(e));
    });
    // a entrega de valor vem da análise por IA já gerada; quando chega, o resumo é atualizado
    void sb.functions.invoke("insights-parceiros", { body: { somente_cache: true } }).then(({ data }) => { if (vivo && data?.perfis?.[id]) setEntrega(data.perfis[id]); }).catch(() => {});
    return () => { vivo = false; };
  }, [id]);

  return (
    <div className="grid gap-6">
      <Button asChild variant="link" className="w-fit px-0">
        <LinkDaArea href={LISTA}><ArrowLeft aria-hidden />Todos os parceiros</LinkDaArea>
      </Button>
      {erro ? (
        <Card><CardContent className="pt-6"><EstadoVazio variante="lista" tamanho="sm" icone={<CircleAlert />} titulo={erro} /></CardContent></Card>
      ) : !dados ? (
        <Skeleton aria-busy="true" aria-label="Carregando a candidatura" className="h-96 rounded-xl" />
      ) : (
        <>
          <Resumo r={dados} entrega={entrega} />
          <Candidatura r={dados} />
          <GaleriaDoParceiro r={dados} mudar={setDados} />
          <EmailsEnviados r={dados} />
          <Lgpd r={dados} />
        </>
      )}
    </div>
  );
}

/** Cabeçalho da ficha: senioridade, especialidade, área de atuação e entrega de valor. */
function Resumo({ r, entrega }: { r: Parceiro; entrega: string | null }) {
  const senior = [NIVEL[r.tempo_especialidade || ""], r.tempo_especialidade && limpar(r.tempo_especialidade).toLowerCase() + " de carreira"].filter(Boolean).join(" · ");
  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <FotoDoParceiro r={r} tamanho="lg" />
        <div className="min-w-0">
          <h1 className="text-h3 font-bold text-foreground">{r.nome || "Sem nome"}</h1>
          {senior && <p className="text-body-sm text-muted-foreground">{senior}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          {[["Especialidade", limpaTxt(r.principal_especializacao) || "Não informada"], ["Área de atuação", areasAtuacao(r).join(" · ") || "Não informada"], ["Entrega de valor", entrega || contribuicaoPadrao(r)]].map(([k, v]) => (
            <div key={k} className="grid content-start gap-1">
              <dt className="text-label font-semibold text-muted-foreground">{k}</dt>
              <dd className="text-body-sm text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Todas as respostas, por seção, em acordeão (a primeira aberta), com "Abrir todas / Fechar todas". */
function Candidatura({ r }: { r: Parceiro }) {
  const mostrar = React.useMemo(() => respostasParaMostrar(r), [r]);
  const [abertas, setAbertas] = React.useState<string[]>([SECOES[0].titulo]);
  const todas = abertas.length === SECOES.length;
  return (
    <CardComCabecalho
      icone={<FileText />} titulo="Candidatura" descricao={"Candidatura enviada em " + fmtData(r.created_at)}
      acao={<Button type="button" variant="ghost" size="sm" onClick={() => setAbertas(todas ? [] : SECOES.map((s) => s.titulo))}>{todas ? "Fechar todas" : "Abrir todas"}</Button>}
    >
      <Accordion type="multiple" value={abertas} onValueChange={setAbertas} className="-mt-2">
        {SECOES.map((s) => (
          <AccordionItem key={s.titulo} value={s.titulo}>
            <AccordionTrigger>
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span>{s.titulo}</span><span className="text-body-sm font-normal text-muted-foreground">{s.campos.length + (s.campos.length === 1 ? " pergunta" : " perguntas")}</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <dl className="grid gap-4">
                {s.campos.map(([k, rotulo]) => {
                  const v = valorDaResposta(mostrar[k]);
                  return (
                    <div key={k} className="grid gap-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6">
                      <dt className="text-body-sm font-semibold text-foreground">{rotulo}</dt>
                      <dd className={v.tipo === "vazio" ? "text-body-sm text-muted-foreground" : "whitespace-pre-line text-body-sm text-foreground [overflow-wrap:anywhere]"}>
                        {v.tipo === "link" ? <a href={v.href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-text)] underline underline-offset-4">{v.texto}</a> : v.texto}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardComCabecalho>
  );
}

type Decisao = { created_at: string; decisao: string; texto_versao: string; texto: string; dados_exibidos?: { nome?: string; cargo?: string; areas?: string[]; segmentos?: string[]; linkedin?: string; foto_url?: string } | null; user_agent?: string | null };

/** Galeria de Profissionais: situação da autorização, exibir sim/não, o perfil enviado e o histórico (prova do consentimento). */
function GaleriaDoParceiro({ r, mudar }: { r: Parceiro; mudar: (r: Parceiro) => void }) {
  const { pedir, elemento } = usePerguntaDeConfirmacao();
  const [ocupado, setOcupado] = React.useState<"" | "convite" | "exibir" | "excluir">("");
  const st = r.galeria_status;
  const exibindo = st === "autorizado" && !r.galeria_oculto;
  const enviarConvite = async () => {
    if (!(await pedir({ titulo: "Enviar convite da galeria?", mensagem: "O e-mail com o pedido de autorização será enviado para " + (r.nome || "este parceiro") + " (" + r.email + ").", ok: "Enviar" }))) return;
    setOcupado("convite");
    const { data: res, error } = await sb.functions.invoke("galeria-convite", { body: { acao: "um", id: r.id } });
    let erro = error ? "Não foi possível enviar agora." : res && res.falhas ? "O e-mail não foi enviado. Tente novamente." : "";
    if (error) { try { erro = (await (error as { context?: Response }).context?.json())?.error || erro; } catch { /* sem JSON */ } }
    setOcupado("");
    if (erro) return toast.error(erro);
    mudar({ ...r, galeria_convite_em: new Date().toISOString() });
    void registrar("Enviou o convite da galeria para " + (r.nome || "parceiro"));
    toast.success("Convite enviado para " + r.email + ".");
  };
  const alternarExibir = async () => {
    const novo = !r.galeria_oculto;
    setOcupado("exibir");
    const { error } = await sb.from("cadastros").update({ galeria_oculto: novo }).eq("id", r.id);
    setOcupado("");
    if (error) return toast.error("Não foi possível alterar agora: " + error.message);
    mudar({ ...r, galeria_oculto: novo });
    void registrar((novo ? "Ocultou da galeria" : "Exibiu na galeria") + " o perfil de " + (r.nome || "parceiro"));
    toast.success(novo ? "Perfil ocultado da galeria." : "Perfil exibido na galeria.");
  };
  // Apaga o que a pessoa enviou (foto, especialidade, LinkedIn) e a autorização; libera o reenvio do convite. O histórico fica.
  const excluirPerfil = async () => {
    if (!(await pedir({ titulo: "Excluir o perfil da galeria?", mensagem: "A foto, a especialidade e o LinkedIn enviados por " + (r.nome || "este parceiro") + " serão apagados e o perfil sai da galeria. Depois você pode reenviar o convite para a pessoa preencher de novo. O histórico de decisões continua guardado.", ok: "Excluir", destrutiva: true }))) return;
    setOcupado("excluir");
    const caminho = caminhoDaFoto(r.galeria_foto_url);
    if (caminho) await sb.storage.from("galeria").remove([caminho]);
    const { error } = await sb.from("cadastros").update(PERFIL_DA_GALERIA_LIMPO).eq("id", r.id);
    setOcupado("");
    if (error) return toast.error("Não foi possível excluir agora: " + error.message);
    mudar({ ...r, ...PERFIL_DA_GALERIA_LIMPO });
    void registrar("Excluiu o perfil da galeria de " + (r.nome || "parceiro"));
    toast.success("Perfil excluído da galeria. Você já pode reenviar o convite.");
  };
  const info = [
    r.galeria_foto_url ? "Foto enviada pela pessoa." : "Sem foto enviada: o card mostra as iniciais.",
    r.galeria_cargo ? "Especialidade escrita pela pessoa." : "Especialidade resumida do campo 13 do cadastro.",
    r.galeria_linkedin ? "LinkedIn informado." : "Sem LinkedIn.",
  ].join(" ");
  const temAcoes = !!st || (!st && !!r.email);
  return (
    <CardComCabecalho icone={<Image />} titulo="Galeria de Profissionais" data-galeria-card="">
      <div className="grid gap-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="grid content-start gap-1"><dt className="text-label font-semibold text-muted-foreground">Convite enviado</dt><dd className="text-body-sm text-foreground" data-convite="">{r.galeria_convite_em ? fmtData(r.galeria_convite_em) : "Não enviado"}</dd></div>
          <div className="grid content-start gap-1"><dt className="text-label font-semibold text-muted-foreground">Status</dt>
            <dd className="text-body-sm text-foreground" data-status-galeria="">{st === "autorizado" ? "Exibição autorizada" : st === "recusado" ? "Exibição não autorizada" : r.galeria_convite_em ? <ChipDeEstado tom="aviso" icone={<Clock />}>Aguardando resposta</ChipDeEstado> : "Ainda não convidado"}</dd>
          </div>
          <div className="grid content-start gap-1"><dt id="gal-exibir" className="text-label font-semibold text-muted-foreground">Exibir</dt>
            <dd className="flex items-center gap-3 text-body-sm text-foreground">
              <Switch aria-labelledby="gal-exibir" checked={exibindo} disabled={st !== "autorizado" || ocupado === "exibir"} title={st !== "autorizado" ? "Disponível só para quem autorizou a exibição" : undefined} onCheckedChange={() => void alternarExibir()} />
              <span aria-hidden>{exibindo ? "Sim" : "Não"}</span>
            </dd>
          </div>
        </dl>
        {st !== "autorizado" && <p className="-mt-2 text-caption text-muted-foreground">Exibir fica disponível só para quem autorizou a exibição.</p>}
        {st === "autorizado" && (
          <section aria-labelledby="gal-perfil" className="grid gap-3 border-t border-border pt-4">
            <h3 id="gal-perfil" className="text-label font-semibold text-muted-foreground">Perfil enviado (somente leitura)</h3>
            <div className="grid max-w-sm gap-2 rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <FotoDoParceiro r={r} tamanho="lg" />
                {r.galeria_linkedin && <Button asChild variant="link" size="sm" className="px-0"><a href={r.galeria_linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></Button>}
              </div>
              <p className="text-body-lg font-bold text-foreground">{r.nome || "Sem nome"}</p>
              <p className="text-body-sm text-foreground">{espGaleria(r) || "Sem especialidade"}</p>
              {tempoGaleria(r) && <p className="text-body-sm text-muted-foreground">{tempoGaleria(r)}</p>}
              <ul className="flex flex-wrap gap-1.5">{tagsGaleria(r).map((t) => <li key={t}><ChipDeEstado tom="neutro">{t}</ChipDeEstado></li>)}</ul>
            </div>
            <p className="text-body-sm text-muted-foreground">{info}</p>
          </section>
        )}
        <Historico id={r.id} />
        {temAcoes && (
          <>
            <Separator />
            <div className="flex flex-wrap justify-end gap-2">
              {st && <Button type="button" variant="exclusao-contorno" disabled={!!ocupado} onClick={() => void excluirPerfil()}><Trash2 aria-hidden />Excluir perfil da galeria</Button>}
              {!st && r.email && (
                <Button type="button" disabled={!!ocupado} onClick={() => void enviarConvite()}>
                  {ocupado === "convite" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Send aria-hidden />}
                  {ocupado === "convite" ? "Enviando…" : r.galeria_convite_em ? "Reenviar convite" : "Enviar convite"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {elemento}
    </CardComCabecalho>
  );
}

function Historico({ id }: { id: string }) {
  const [aberto, setAberto] = React.useState(false);
  const [regs, setRegs] = React.useState<Decisao[] | null | "erro">(null);
  React.useEffect(() => {
    if (!aberto || regs) return;
    void sb.from("galeria_autorizacoes").select("created_at, decisao, texto_versao, texto, dados_exibidos, user_agent").eq("cadastro_id", id).order("created_at", { ascending: false })
      .then(({ data, error }) => setRegs(error ? "erro" : ((data || []) as Decisao[])));
  }, [aberto, regs, id]);
  return (
    <Collapsible open={aberto} onOpenChange={setAberto} className="grid gap-3">
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" className="w-fit px-2"><ChevronDown aria-hidden className={aberto ? "rotate-180 transition-transform" : "transition-transform"} />Histórico de decisões</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="grid gap-3">
        {regs === null ? <p className="text-body-sm text-muted-foreground">Carregando…</p>
          : regs === "erro" ? <p className="text-body-sm text-muted-foreground">Não foi possível carregar o histórico.</p>
          : !regs.length ? <p className="text-body-sm text-muted-foreground">Nenhuma decisão registrada ainda.</p>
          : regs.map((x, i) => {
            const ex = x.dados_exibidos || {};
            return (
              <div key={i} className="grid gap-1 rounded-md border border-border p-4">
                <strong className="text-body-sm text-foreground">{(x.decisao === "autorizado" ? "Autorizou" : "Não autorizou") + " em " + fmtData(x.created_at)}</strong>
                <span className="text-body-sm text-muted-foreground">Versão do termo: {x.texto_versao}</span>
                <Collapsible>
                  <CollapsibleTrigger asChild><Button type="button" variant="link" size="sm" className="w-fit px-0">Ver texto aceito e dados</Button></CollapsibleTrigger>
                  <CollapsibleContent className="grid gap-2 text-body-sm text-foreground">
                    <p className="whitespace-pre-line">{x.texto}</p>
                    {ex.nome && <p>Exibido: {[ex.nome, ex.cargo, (ex.areas || []).join(", "), (ex.segmentos || []).join(", "), ex.linkedin, ex.foto_url ? "foto enviada" : "sem foto"].filter(Boolean).join(" · ")}</p>}
                    {x.user_agent && <p className="text-muted-foreground [overflow-wrap:anywhere]">Navegador: {x.user_agent}</p>}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
      </CollapsibleContent>
    </Collapsible>
  );
}

type Envio = { id: string; created_at: string; origem: string; assunto: string; entregue_em: string | null; aberto_em: string | null; ultimo_aberto_em: string | null; aberturas: number; clicado_em: string | null; ultimo_clique_em: string | null; cliques: number; visualizado_em: string | null };

/** E-mails enviados ao parceiro, vindos do Resend. Ao abrir o perfil, os avisos de abertura e clique saem das notificações. */
function EmailsEnviados({ r }: { r: Parceiro }) {
  const { recarregar } = useNotificacoes();
  const [envios, setEnvios] = React.useState<Envio[] | null | "erro">(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let vivo = true;
    void sb.from("email_envios").select("id, created_at, origem, assunto, entregue_em, aberto_em, ultimo_aberto_em, aberturas, clicado_em, ultimo_clique_em, cliques, visualizado_em")
      .eq("cadastro_id", r.id).order("created_at", { ascending: false }).limit(50)
      .then(async ({ data, error }) => {
        if (!vivo) return;
        if (error) return setEnvios("erro");
        const l = (data || []) as Envio[];
        setEnvios(l);
        const pendentes = l.filter((e) => !e.visualizado_em && (e.aberto_em || e.clicado_em)).map((e) => e.id);
        if (pendentes.length) {
          const { error: errV } = await sb.from("email_envios").update({ visualizado_em: new Date().toISOString() }).in("id", pendentes);
          if (!errV) recarregar();
        }
        if (location.hash === "#emails") requestAnimationFrame(() => ref.current?.scrollIntoView({ block: "start" }));
      });
    return () => { vivo = false; };
  }, [r.id, recarregar]);
  return (
    <div id="emails" ref={ref} className="scroll-mt-24">
      <CardComCabecalho icone={<Mail />} titulo="E-mails enviados" descricao="A abertura é uma estimativa: alguns programas de e-mail abrem a mensagem sozinhos e outros bloqueiam a contagem. O clique no link é o sinal mais confiável.">
        {envios === null ? <Skeleton aria-busy="true" aria-label="Carregando os e-mails" className="h-20 rounded-lg" />
          : envios === "erro" ? <p className="text-body-sm text-muted-foreground">Não foi possível carregar os e-mails.</p>
          : !envios.length ? <EstadoVazio variante="lista" tamanho="sm" icone={<Mail />} titulo="Nenhum e-mail rastreado ainda." descricao="O acompanhamento vale para os e-mails enviados a partir de agora." />
          : (
            <ul className="-mx-6 -mb-2">
              {envios.map((e) => {
                const linhas: [string, string | null][] = [
                  ["Entregue", e.entregue_em && fmtData(e.entregue_em)], ["Primeira abertura", e.aberto_em && fmtData(e.aberto_em)],
                  ["Última abertura", e.aberturas > 1 && e.ultimo_aberto_em ? fmtData(e.ultimo_aberto_em) : null], ["Primeiro clique", e.clicado_em && fmtData(e.clicado_em)],
                  ["Último clique", e.cliques > 1 && e.ultimo_clique_em ? fmtData(e.ultimo_clique_em) : null],
                ];
                return (
                  <LinhaDeLista
                    key={e.id} as="li" className="border-t border-border px-6 first:border-t-0" data-envio={e.id}
                    titulo={e.assunto}
                    descricao={
                      <span className="grid gap-2">
                        <span>{(e.origem === "comunicado" ? "Comunicado" : "Convite da galeria") + " · enviado em " + fmtData(e.created_at)}</span>
                        <span className="flex flex-wrap gap-1.5">
                          <ChipDeEstado tom="neutro">{e.entregue_em ? "Entregue" : "Enviado"}</ChipDeEstado>
                          {e.aberto_em ? <ChipDeEstado tom="aviso">{"Aberto" + (e.aberturas > 1 ? " " + e.aberturas + " vezes" : "")}</ChipDeEstado> : <ChipDeEstado tom="neutro">Ainda não aberto</ChipDeEstado>}
                          {e.clicado_em && <ChipDeEstado tom="sucesso">{"Clicou no link" + (e.cliques > 1 ? " " + e.cliques + " vezes" : "")}</ChipDeEstado>}
                        </span>
                        {linhas.some(([, v]) => v) && (
                          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
                            {linhas.filter(([, v]) => v).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd className="text-foreground">{v}</dd></React.Fragment>)}
                          </dl>
                        )}
                      </span>
                    }
                  />
                );
              })}
            </ul>
          )}
      </CardComCabecalho>
    </div>
  );
}

/** LGPD: comprovante do consentimento e exclusão do cadastro a pedido da pessoa. */
function Lgpd({ r }: { r: Parceiro }) {
  const navegar = useNavigate();
  const { recarregar } = useNotificacoes();
  const { pedir, elemento } = usePerguntaDeConfirmacao();
  const [excluindo, setExcluindo] = React.useState(false);
  const [erro, setErro] = React.useState("");
  const excluir = async () => {
    if (!(await pedir({ titulo: "Excluir cadastro?", mensagem: "O cadastro de " + (r.nome || "esta pessoa") + " e todas as respostas serão apagados definitivamente. Essa ação não pode ser desfeita.", ok: "Excluir cadastro", destrutiva: true }))) return;
    setExcluindo(true); setErro("");
    // Apaga também as fotos enviadas para a galeria (pasta com o id do cadastro).
    const { data: fotos } = await sb.storage.from("galeria").list(r.id);
    if (fotos && fotos.length) await sb.storage.from("galeria").remove(fotos.map((f) => r.id + "/" + f.name));
    const { data: del, error } = await sb.from("cadastros").delete().eq("id", r.id).select("id");
    if (error || !del || !del.length) { setExcluindo(false); return setErro("Não foi possível excluir o cadastro" + (error ? ": " + error.message : ".")); }
    await registrar("Excluiu o cadastro de parceiro de " + (r.nome || r.email || "parceiro"));
    recarregar();
    toast.success("Cadastro excluído com sucesso.");
    navegar({ search: "?aba=candidaturas" });
  };
  return (
    <CardComCabecalho icone={<ShieldCheck />} titulo="Consentimento LGPD" tom="neutro">
      <div className="grid gap-4">
        <p className="text-body-sm text-foreground">{r.consentimento_em ? "Autorizado em " + fmtData(r.consentimento_em) + "." : "Sem registro de consentimento."}</p>
        {r.consentimento_texto && (
          <Collapsible className="grid gap-2">
            <CollapsibleTrigger asChild><Button type="button" variant="link" size="sm" className="w-fit px-0">Ver texto aceito</Button></CollapsibleTrigger>
            <CollapsibleContent><p className="whitespace-pre-line text-body-sm text-foreground">{r.consentimento_texto}</p></CollapsibleContent>
          </Collapsible>
        )}
        {erro && (
          <Alert variant="error"><CircleAlert aria-hidden /><AlertTitle>Não foi possível excluir</AlertTitle><AlertDescription>{erro}</AlertDescription></Alert>
        )}
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-body-sm text-muted-foreground"><UserRound aria-hidden className="size-4 shrink-0" />Use quando a pessoa pedir a exclusão dos dados. Todas as respostas são apagadas.</p>
          <Button type="button" variant="exclusao-contorno" disabled={excluindo} onClick={() => void excluir()}>
            {excluindo ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Trash2 aria-hidden />}{excluindo ? "Excluindo…" : "Excluir cadastro"}
          </Button>
        </div>
      </div>
      {elemento}
    </CardComCabecalho>
  );
}
