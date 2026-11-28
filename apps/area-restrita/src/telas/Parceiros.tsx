// Parceiros (A7): a mesma informação, as mesmas consultas, funções e textos de public/admin/parceiros/index.html, só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A) com as abas Dashboard e Parceiros (Tabs; ?aba=candidaturas no endereço);
// - Dashboard: GradeDeCards + CardIndicador (cinco números), CardComCabecalho "Análise da rede" (Tabs com Pontos
//   fortes, Lacunas e Recomendações; AlertaComAcao quando desatualizada), perfis em Card (Avatar, ChipDeEstado da
//   aderência ao desafio, Badge das tags), Select (área de atuação), Dialog + Textarea (desafio do projeto com IA);
// - Parceiros: CampoDeBusca, Select (8 filtros), ChipFiltravel (filtros ativos, um toque tira), Autorização da galeria
//   (parceiros/Galeria.tsx) e TabelaAdaptavel (vira lista no celular);
// - ?id=: a candidatura (parceiros/Ficha.tsx).
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CircleAlert, CircleCheck, Clock, Eye, Info, LayoutGrid, LoaderCircle, RefreshCw, SlidersHorizontal, Sparkles, Star, TriangleAlert, Users, X, type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertaComAcao, BotaoDoAlerta } from "@/components/ui/alerta-com-acao";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
import { CampoDeBusca } from "@/components/ui/campo-de-busca";
import { Card, CardContent } from "@/components/ui/card";
import { ChipDeEstado, type TomDoChip } from "@/components/ui/chip-de-estado";
import { ChipFiltravel } from "@/components/ui/chip-filtravel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Label } from "@/components/ui/label";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, CardIndicador } from "@/components/ui/painel-dados";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TabelaAdaptavel, type ColunaDaTabela } from "@/components/ui/tabela-adaptavel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Linkedin } from "@/components/ui/icones-preservados";
import { LinkDaArea } from "@/casca/base";
import { diaCurto, iniciais, plural } from "@/lib/formatar";
import { registrar, sb } from "@/lib/supabase";
import {
  aderenciaDe, areasAtuacao, disponibilidade, ERRO_DA_ANALISE, ERRO_DESAFIO, espGaleria, filtrar, FILTROS, FILTROS_VAZIOS, filtrosAtivos, fotoDe, GRUPOS_DE_AREA,
  horas, kpis, limpar, linkLinkedin, montarDesafio, NIVEL, nivelAderencia, normalizarParaLista, opcoesDoFiltro, partesComNumeros, perfis, publicado,
  ROTULO_DA_GALERIA, situacaoDaGaleria, tagsGaleria, tempoGaleria, type Analise, type Desafio, type Filtros, type Parceiro, type SituacaoDaGaleria,
} from "@/dados/parceiros";
import { JANELA_GRANDE } from "./email";
import { AutorizacaoDaGaleria } from "./parceiros/Galeria";
import { Ficha } from "./parceiros/Ficha";

type Aba = "dashboard" | "candidaturas";
const TODOS = "__todos";
const reduzir = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Foto da galeria, quando o parceiro já enviou; senão as iniciais (Avatar do DS). */
export function FotoDoParceiro({ r, tamanho = "md" }: { r: Parceiro; tamanho?: "sm" | "md" | "lg" }) {
  const t = { sm: "size-10", md: "size-12", lg: "size-14" }[tamanho];
  const foto = fotoDe(r);
  return (
    <Avatar className={t}>
      {foto && <AvatarImage src={foto} alt="" loading="lazy" />}
      <AvatarFallback className="bg-[var(--primary-muted)] font-bold text-[var(--primary-text)]">{iniciais(r.nome)}</AvatarFallback>
    </Avatar>
  );
}

const TOM_DA_GALERIA: Record<SituacaoDaGaleria, TomDoChip> = { autorizado: "sucesso", recusado: "erro", aguardando: "aviso", "nao-convidado": "neutro" };
const ICONES_DOS_KPIS: Record<string, LucideIcon> = { total: Users, segmentos: LayoutGrid, area: Star, tempo: Clock, galeria: Eye };

export function Parceiros() {
  const local = useLocation();
  const id = new URLSearchParams(local.search).get("id");
  React.useEffect(() => { if (!id) document.title = "Parceiros | Área restrita"; }, [id]);
  return id ? <Ficha key={id} id={id} /> : <ListaDeParceiros />;
}

function ListaDeParceiros() {
  const local = useLocation();
  const navegar = useNavigate();
  const [aba, setAba] = React.useState<Aba>(new URLSearchParams(local.search).get("aba") === "candidaturas" ? "candidaturas" : "dashboard");
  const [todos, setTodos] = React.useState<Parceiro[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [busca, setBusca] = React.useState("");
  const [filtros, setFiltros] = React.useState<Filtros>(FILTROS_VAZIOS);
  const [ia, setIa] = React.useState<Analise | null>(null);
  const [gerando, setGerando] = React.useState(false);

  const carregar = React.useCallback(async () => {
    const { data, error } = await sb.from("cadastros").select("*").order("created_at", { ascending: false });
    if (error) return setErro("Não foi possível carregar as candidaturas: " + error.message);
    setTodos(((data || []) as Parceiro[]).map(normalizarParaLista));
  }, []);
  const analisar = React.useCallback(async (gerar = false) => {
    if (gerar) setGerando(true);
    const { data, error } = await sb.functions.invoke("insights-parceiros", { body: gerar ? {} : { somente_cache: true } });
    setGerando(false);
    if (error) {
      let code = "falha";
      try { code = (await (error as { context?: Response }).context?.json())?.error || code; } catch { /* sem JSON */ }
      return setIa({ error: code });
    }
    if (gerar) void registrar("Gerou a análise da Rede de Parceiros com IA");
    setIa((data || {}) as Analise);
  }, []);
  React.useEffect(() => { void carregar(); void analisar(); }, [carregar, analisar]);

  const mudarAba = (a: Aba) => {
    setAba(a);
    navegar({ search: a === "candidaturas" ? "?aba=candidaturas" : "" }, { replace: true });
  };
  const lista = todos || [];
  const linhas = React.useMemo(() => filtrar(lista, busca, filtros), [lista, busca, filtros]);

  return (
    <Tabs value={aba} onValueChange={(v) => mudarAba(v as Aba)} className="grid gap-6">
      <CabecalhoDaPagina
        titulo="Parceiros"
        descricao="Métricas, habilidades disponíveis e candidaturas à Rede de Parceiros."
        abas={
          <TabsList aria-label="Seções de parceiros">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="candidaturas">Parceiros <Badge variant="outline" data-contagem="">{linhas.length}</Badge></TabsTrigger>
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
      <TabsContent value="dashboard" className="grid gap-6">
        {!todos && !erro ? <Skeleton aria-busy="true" aria-label="Carregando os parceiros" className="h-96 rounded-xl" /> : todos && (
          <Dashboard todos={lista} ia={ia} gerando={gerando} aoGerar={() => void analisar(true)} />
        )}
      </TabsContent>
      <TabsContent value="candidaturas" className="grid gap-6">
        {!todos && !erro ? <Skeleton aria-busy="true" aria-label="Carregando os parceiros" className="h-96 rounded-xl" /> : todos && (
          <>
            <PainelDeFiltros todos={lista} busca={busca} setBusca={setBusca} filtros={filtros} setFiltros={setFiltros} mostrando={linhas.length} />
            <AutorizacaoDaGaleria todos={lista} aoMudar={setTodos} />
            <TabelaDeParceiros linhas={linhas} total={lista.length} />
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ todos, ia, gerando, aoGerar }: { todos: Parceiro[]; ia: Analise | null; gerando: boolean; aoGerar: () => void }) {
  const [area, setArea] = React.useState("");
  const [desafio, setDesafio] = React.useState<Desafio | null>(null);
  const [janela, setJanela] = React.useState(false);
  const grade = React.useRef<HTMLDivElement>(null);
  const lista = perfis(todos, area, desafio);
  const numeros = kpis(todos, todos.length);
  const textoIA = ia?.perfis || {};
  return (
    <>
      <GradeDeCards larguraMinima="11rem" aria-label="Números da rede">
        {numeros.map((k, i) => {
          const Icone = ICONES_DOS_KPIS[k.chave];
          return <CardIndicador key={k.chave} compacto icone={<Icone />} tom={i === 0 ? "marca" : "neutro"} valor={k.valor} total={k.total} rotulo={k.rotulo} apoio={k.apoio} />;
        })}
      </GradeDeCards>

      <AnaliseDaRede ia={ia} gerando={gerando} aoGerar={aoGerar} semParceiros={!todos.length} />

      <section aria-labelledby="pc-titulo" className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="pc-titulo" className="text-h4 font-bold text-foreground">Perfis dos parceiros</h2>
          <Button type="button" variant="outline" onClick={() => setJanela(true)}><Sparkles aria-hidden />Desafio</Button>
        </div>
        {desafio && (
          <AlertaComAcao tom="info" icone={<Sparkles />} titulo="Desafio do projeto" acoes={<BotaoDoAlerta onClick={() => setDesafio(null)}>Limpar desafio</BotaoDoAlerta>}>
            “{desafio.texto.length > 140 ? desafio.texto.slice(0, 140) + "…" : desafio.texto}”
          </AlertaComAcao>
        )}
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="area-sel">Área de atuação</Label>
          <Select value={area || TODOS} onValueChange={(v) => setArea(v === TODOS ? "" : v)}>
            <SelectTrigger id="area-sel" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas as áreas</SelectItem>
              {GRUPOS_DE_AREA.map((g) => <SelectItem key={g.title} value={g.title}>{g.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="text-body-sm text-muted-foreground" aria-live="polite" data-pc-contagem="">{plural(lista.length, "parceiro", "parceiros") + (desafio ? " · ordenados por aderência ao desafio" : "")}</p>
        <div ref={grade} className="scroll-mt-24">
          {lista.length ? (
            <GradeDeCards larguraMinima="16rem" aria-label="Perfis dos parceiros">
              {lista.map((r) => <CardDoPerfil key={r.id} r={r} desafio={desafio} entrega={textoIA[r.id]} />)}
            </GradeDeCards>
          ) : (
            <Card><CardContent className="pt-6"><EstadoVazio variante="lista" tamanho="sm" icone={<Users />} titulo="Nenhum parceiro para os filtros atuais." /></CardContent></Card>
          )}
        </div>
      </section>
      <JanelaDoDesafio
        aberta={janela} mudar={setJanela} inicial={desafio?.texto || ""}
        aoAnalisar={(d) => { setDesafio(d); setJanela(false); requestAnimationFrame(() => grade.current?.scrollIntoView({ behavior: reduzir() ? "auto" : "smooth", block: "start" })); }}
      />
    </>
  );
}

const TOM_DA_ADERENCIA = { alta: "sucesso", media: "aviso", baixa: "neutro" } as const;

/** Card igual ao da Galeria de Profissionais do site; o card inteiro abre a candidatura e o LinkedIn é um link próprio. */
function CardDoPerfil({ r, desafio }: { r: Parceiro; desafio: Desafio | null; entrega?: string }) {
  const m = aderenciaDe(desafio, r);
  const li = linkLinkedin(r.galeria_linkedin || r.linkedin);
  const tags = tagsGaleria(r);
  return (
    <Card className="relative gap-3 p-5 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--row-hover)] has-[a[data-perfil]:focus-visible]:ring-2 has-[a[data-perfil]:focus-visible]:ring-ring" data-perfil-card={r.id}>
      <div className="flex items-start justify-between gap-3">
        <FotoDoParceiro r={r} tamanho="lg" />
        {li && (
          <Button asChild variant="ghost" size="icon" className="relative z-10">
            <a href={li} target="_blank" rel="noopener noreferrer" title="Abrir o LinkedIn" aria-label={`LinkedIn de ${r.nome || "parceiro"} (abre em nova aba)`}>
              <Linkedin aria-hidden />
            </a>
          </Button>
        )}
      </div>
      <div className="grid gap-1">
        <h3 className="text-body-lg font-bold text-foreground">
          <LinkDaArea href={"/admin/parceiros/?id=" + r.id} data-perfil="" aria-label={"Abrir o perfil de " + (r.nome || "parceiro")} className="outline-none after:absolute after:inset-0 after:content-['']">{r.nome || "Sem nome"}</LinkDaArea>
        </h3>
        <p className="text-body-sm text-foreground">{espGaleria(r) || "Especialidade não informada"}</p>
        {tempoGaleria(r) && <p className="text-body-sm text-muted-foreground">{tempoGaleria(r)}</p>}
      </div>
      {m && <ChipDeEstado tom={TOM_DA_ADERENCIA[nivelAderencia(m.aderencia)]} className="w-fit">Aderência ao desafio: {m.aderencia}%</ChipDeEstado>}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Áreas e segmentos">
          {tags.map((t) => <li key={t}><Badge variant="outline">{t}</Badge></li>)}
        </ul>
      )}
      {m?.motivo && <p className="text-body-sm text-foreground"><strong>Por que atende: </strong>{m.motivo}</p>}
    </Card>
  );
}

function JanelaDoDesafio({ aberta, mudar, inicial, aoAnalisar }: { aberta: boolean; mudar: (v: boolean) => void; inicial: string; aoAnalisar: (d: Desafio) => void }) {
  const [texto, setTexto] = React.useState(inicial);
  const [msg, setMsg] = React.useState("");
  const [analisando, setAnalisando] = React.useState(false);
  React.useEffect(() => { if (aberta) { setTexto((t) => inicial || t); setMsg(""); } }, [aberta, inicial]);
  const buscar = async () => {
    const t = texto.trim();
    if (t.length < 20) { setMsg("Descreva o desafio com um pouco mais de detalhe."); document.getElementById("desafio-txt")?.focus(); return; }
    setAnalisando(true); setMsg("");
    const { data, error } = await sb.functions.invoke("insights-parceiros", { body: { desafio: t } });
    setAnalisando(false);
    if (error || !data || !Array.isArray(data.ranking)) {
      let code = "falha";
      try { code = (await (error as { context?: Response } | null)?.context?.json())?.error || code; } catch { /* sem JSON */ }
      return setMsg(ERRO_DESAFIO(code));
    }
    void registrar("Buscou parceiros para um desafio com IA", t.slice(0, 300));
    aoAnalisar(montarDesafio(t, data.ranking));
  };
  return (
    <Dialog open={aberta} onOpenChange={(v) => !analisando && mudar(v)}>
      <DialogContent className={JANELA_GRANDE}>
        <DialogHeader>
          <DialogTitle>Qual é o desafio do projeto?</DialogTitle>
          <DialogDescription>Descreva o projeto, o cliente ou segmento, o que precisa ser entregue e as condições (prazo, presencial ou remoto). A IA analisa todos os perfis e mostra os mais aderentes primeiro.</DialogDescription>
        </DialogHeader>
        <Campo id="desafio-txt" rotulo="Desafio do projeto" erro={msg || null}>
          {(p) => <Textarea {...p} rows={7} maxLength={3000} value={texto} onChange={(e) => { setTexto(e.target.value); setMsg(""); }} placeholder="Ex.: Redesenhar a jornada de pacientes de um hospital em Curitiba, com pesquisa com usuários, service blueprint e protótipos. Projeto de 3 meses, com encontros presenciais." />}
        </Campo>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => mudar(false)} disabled={analisando}>Cancelar</Button>
          <Button type="button" onClick={() => void buscar()} disabled={analisando}>
            {analisando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Sparkles aria-hidden />}
            {analisando ? "Analisando os perfis…" : "Buscar parceiros"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const GRUPOS_DA_ANALISE = [
  { chave: "forcas", titulo: "Pontos fortes", icone: CircleCheck },
  { chave: "lacunas", titulo: "Lacunas", icone: TriangleAlert },
  { chave: "recomendacoes", titulo: "Recomendações", icone: Info },
] as const;
const lerAba = () => { try { return localStorage.getItem("ai-aba"); } catch { return null; } };

/** Análise da base inteira (não muda com os filtros). Só chama a IA ao tocar em Gerar ou Atualizar. */
function AnaliseDaRede({ ia, gerando, aoGerar, semParceiros }: { ia: Analise | null; gerando: boolean; aoGerar: () => void; semParceiros: boolean }) {
  const a = ia?.analise || {};
  const grupos = GRUPOS_DA_ANALISE.filter((g) => (a[g.chave] || []).length);
  const guardada = lerAba();
  const [ativa, setAtiva] = React.useState<string>(grupos.some((g) => g.chave === guardada) ? guardada! : grupos[0]?.chave || "forcas");
  React.useEffect(() => { if (grupos.length && !grupos.some((g) => g.chave === ativa)) setAtiva(grupos[0].chave); }, [grupos, ativa]);
  const botao = (texto: string) => (
    <Button type="button" variant="outline" onClick={aoGerar} disabled={gerando}>
      {gerando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <RefreshCw aria-hidden />}{gerando ? "Gerando…" : texto}
    </Button>
  );
  let corpo: React.ReactNode;
  if (gerando) corpo = <p className="text-body-sm text-muted-foreground" aria-live="polite">Gerando a análise da rede…</p>;
  else if (!ia) corpo = <Skeleton aria-busy="true" aria-label="Carregando a análise" className="h-24 rounded-lg" />;
  else if (ia.error) corpo = <div className="grid justify-items-start gap-3"><p className="text-body-sm text-muted-foreground">{ERRO_DA_ANALISE(ia.error)}</p>{ia.error !== "sem_chave" && botao("Tentar de novo")}</div>;
  else if (semParceiros) corpo = <p className="text-body-sm text-muted-foreground">Nenhum parceiro cadastrado ainda.</p>;
  else if (ia.vazio) corpo = <div className="grid justify-items-start gap-3"><p className="text-body-sm text-muted-foreground">Ainda não há análise da rede. A IA analisa os cadastros e também escreve a Entrega de valor de cada parceiro.</p>{botao("Gerar análise")}</div>;
  else corpo = (
    <div className="grid gap-4">
      {ia.desatualizada && (
        <AlertaComAcao tom="aviso" titulo="Há cadastros novos ou alterados desde a última análise." acoes={<BotaoDoAlerta onClick={aoGerar}>Atualizar análise</BotaoDoAlerta>} />
      )}
      {a.resumo && <p className="text-body text-foreground">{a.resumo}</p>}
      {grupos.length > 0 && (
        <Tabs value={ativa} onValueChange={(k) => { setAtiva(k); try { localStorage.setItem("ai-aba", k); } catch { /* sem armazenamento */ } }} className="grid gap-3">
          <TabsList aria-label="Análise da rede">
            {grupos.map((g) => <TabsTrigger key={g.chave} value={g.chave}>{g.titulo} <Badge variant="outline">{a[g.chave]!.length}</Badge></TabsTrigger>)}
          </TabsList>
          {grupos.map((g) => (
            <TabsContent key={g.chave} value={g.chave}>
              <ul aria-label={g.titulo} className="grid gap-3">
                {a[g.chave]!.map((x, i) => (
                  <li key={i} className="flex gap-3 text-body-sm text-foreground">
                    <g.icone aria-hidden className={g.chave === "lacunas" ? "mt-0.5 size-4 shrink-0 text-[var(--warning-text)]" : g.chave === "forcas" ? "mt-0.5 size-4 shrink-0 text-[var(--success-text)]" : "mt-0.5 size-4 shrink-0 text-[var(--info-text)]"} />
                    <span>{partesComNumeros(x).map((p, k) => (k % 2 ? <strong key={k}>{p}</strong> : p))}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      )}
      {ia.gerado_em && <p className="text-caption text-muted-foreground">Gerada por IA com base em {plural(ia.base || 0, "parceiro", "parceiros")} · {new Date(ia.gerado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>}
    </div>
  );
  return <CardComCabecalho icone={<Sparkles />} titulo="Análise da rede">{corpo}</CardComCabecalho>;
}

/* ---------- Aba Parceiros ---------- */
function PainelDeFiltros({ todos, busca, setBusca, filtros, setFiltros, mostrando }: { todos: Parceiro[]; busca: string; setBusca: (v: string) => void; filtros: Filtros; setFiltros: (f: Filtros) => void; mostrando: number }) {
  const [aberto, setAberto] = React.useState(() => matchMedia("(min-width: 800px)").matches);
  const n = filtrosAtivos(busca, filtros);
  const ativos = FILTROS.filter((f) => filtros[f.id]);
  return (
    <Card className="gap-0 py-0">
      <Collapsible open={aberto} onOpenChange={setAberto}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="h-14 w-full justify-between rounded-xl px-6 text-body font-semibold" aria-label={"Filtros" + (n ? ", " + plural(n, "ativo", "ativos") : "")}>
            <span className="flex items-center gap-2"><SlidersHorizontal aria-hidden />Filtros{n > 0 && <span className="font-normal text-muted-foreground">· {plural(n, "ativo", "ativos")}</span>}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="grid gap-5 border-t border-border px-6 pt-5 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="f-busca">Buscar</Label>
            <CampoDeBusca id="f-busca" rotulo="Buscar" placeholder="Nome, empresa, e-mail, especialização, atividades, ferramentas, cidade…" valor={busca} onValorChange={setBusca} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FILTROS.map((f) => (
              <div key={f.id} className="grid min-w-0 gap-2">
                <Label htmlFor={"f-" + f.id}>{f.rotulo}</Label>
                <Select value={filtros[f.id] || TODOS} onValueChange={(v) => setFiltros({ ...filtros, [f.id]: v === TODOS ? "" : v })}>
                  <SelectTrigger id={"f-" + f.id} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todos</SelectItem>
                    {opcoesDoFiltro(f.id, todos).map((o) => <SelectItem key={o} value={o}>{limpar(o)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border px-6 py-4">
        <p className="text-body-sm text-muted-foreground" aria-live="polite" data-mostrando="">Mostrando {mostrando} de {plural(todos.length, "candidatura", "candidaturas")}</p>
        {ativos.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos (toque para tirar)">
            {ativos.map((f) => (
              <li key={f.id}>
                <ChipFiltravel ativo onAtivoChange={() => setFiltros({ ...filtros, [f.id]: "" })} aria-label={`Tirar o filtro ${f.rotulo}: ${limpar(filtros[f.id])}`}>
                  {f.rotulo}: {limpar(filtros[f.id])}<X aria-hidden className="size-3.5" />
                </ChipFiltravel>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="link" className="px-0 sm:ml-auto" disabled={!n} onClick={() => { setBusca(""); setFiltros(FILTROS_VAZIOS); }}>Limpar filtros</Button>
      </div>
    </Card>
  );
}

function TabelaDeParceiros({ linhas, total }: { linhas: Parceiro[]; total: number }) {
  const colunas: ColunaDaTabela<Parceiro>[] = [
    {
      id: "parceiro", titulo: "Parceiro", principal: true, ordenavel: true, valorParaOrdenar: (r) => (r.nome || "").toLocaleLowerCase("pt-BR"),
      celula: (r) => (
        <span className="flex min-w-0 items-center gap-3">
          <FotoDoParceiro r={r} tamanho="sm" />
          <span className="grid min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <LinkDaArea href={"/admin/parceiros/?id=" + r.id} aria-label={"Abrir candidatura de " + (r.nome || "parceiro")} className="font-semibold text-foreground underline-offset-4 hover:underline">{r.nome || "Sem nome"}</LinkDaArea>
              {!r.visualizado_em && <ChipDeEstado tom="marca">Nova</ChipDeEstado>}
            </span>
            <span className="text-body-sm font-normal text-muted-foreground">{espGaleria(r)}</span>
          </span>
        </span>
      ),
    },
    { id: "senioridade", titulo: "Senioridade", prioridade: 2, celula: (r) => <span className="grid"><span className="font-medium text-foreground">{NIVEL[r.tempo_especialidade || ""] || "–"}</span><span className="text-body-sm">{r.tempo_especialidade ? limpar(r.tempo_especialidade) : ""}</span></span> },
    { id: "area", titulo: "Área de atuação", prioridade: 3, celula: (r) => areasAtuacao(r).join(" · ") || "–" },
    { id: "disponibilidade", titulo: "Disponibilidade", prioridade: 3, celula: (r) => <span className="grid"><span>{disponibilidade(r)}</span><span className="text-body-sm">{horas(r.horas_semanais)}</span></span> },
    { id: "galeria", titulo: "Galeria", celula: (r) => { const s = situacaoDaGaleria(r); return <ChipDeEstado tom={TOM_DA_GALERIA[s]}>{ROTULO_DA_GALERIA[s]}</ChipDeEstado>; } },
    { id: "publicado", titulo: "Publicado", prioridade: 2, celula: (r) => <ChipDeEstado tom={publicado(r) ? "sucesso" : "neutro"}>{publicado(r) ? "Sim" : "Não"}</ChipDeEstado> },
    { id: "cadastro", titulo: "Cadastro", alinhar: "fim", ordenavel: true, valorParaOrdenar: (r) => r.created_at, celula: (r) => diaCurto(r.created_at) },
  ];
  return (
    <Card className="py-2">
      <TabelaAdaptavel
        colunas={colunas} linhas={linhas} chave={(r) => r.id} legenda="Parceiros e candidaturas"
        vazio={<EstadoVazio variante="lista" tamanho="sm" icone={<Users />} titulo={total ? "Nenhuma candidatura para os filtros atuais." : "Nenhuma candidatura ainda."} />}
      />
    </Card>
  );
}

