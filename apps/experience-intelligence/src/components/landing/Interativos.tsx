"use client";
// Componentes interativos da landing. Tudo local e estático: sem IA, sem banco, sem API.
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight, ChartNoAxesCombined, ClipboardList, Clock3, FileText, FolderSearch, GitBranch, HeartPulse,
  Layers3, Lightbulb, ListChecks, LogOut, Map as MapIcon, Minus, MonitorSmartphone, Network, Plus, RefreshCcw, Repeat2,
  Route, ScanSearch, Search, Target, TrendingDown, TrendingUp, Users, UsersRound, Waypoints, Workflow,
  ChartColumnIncreasing, Compass, type LucideIcon,
} from "lucide-react";
import {
  CENARIOS, CICLO, DEMOS, DIFERENCIAIS, ENTREGAVEIS, ESTADOS_FILTRO, ETAPAS, FAQ, MELHORIAS, PILARES, PUBLICOS,
  SINTOMAS, type DemoChave,
} from "./conteudo";
import { medir } from "@/infrastructure/analytics";

/** Setas, Home e End entre abas (padrão WAI-ARIA de tabs com ativação automática). */
function teclasAbas(e: React.KeyboardEvent, atual: number, total: number, ir: (i: number) => void) {
  const mapa: Record<string, number> = { ArrowRight: atual + 1, ArrowDown: atual + 1, ArrowLeft: atual - 1, ArrowUp: atual - 1, Home: 0, End: total - 1 };
  if (!(e.key in mapa)) return;
  e.preventDefault();
  const i = (mapa[e.key] + total) % total;
  ir(i);
  const lista = (e.currentTarget as HTMLElement).closest('[role="tablist"]');
  (lista?.querySelectorAll('[role="tab"]')[i] as HTMLElement | undefined)?.focus();
}

function Abas<T extends { chave: string; nome: string }>({ itens, ativo, onAtivo, rotulo, id, icones, classe }: {
  itens: readonly T[]; ativo: number; onAtivo: (i: number) => void; rotulo: string; id: string; icones?: LucideIcon[]; classe?: string;
}) {
  const lista = useRef<HTMLDivElement>(null);
  const [mais, setMais] = useState(false);
  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    const medir = () => setMais(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => { el.removeEventListener("scroll", medir); window.removeEventListener("resize", medir); };
  }, []);
  return (
    <div ref={lista} role="tablist" aria-label={rotulo} className={`lp-abas ${classe ?? ""}${mais ? " tem-mais" : ""}`}>
      {itens.map((it, i) => {
        const I = icones?.[i];
        return (
          <button key={it.chave} type="button" role="tab" id={`${id}-aba-${i}`} aria-selected={i === ativo} aria-controls={`${id}-painel`}
            tabIndex={i === ativo ? 0 : -1} onClick={() => onAtivo(i)} onKeyDown={(e) => teclasAbas(e, i, itens.length, onAtivo)}>
            {I && <I size={18} aria-hidden="true" />} {it.nome}
          </button>
        );
      })}
    </div>
  );
}

// 01 Hero: ciclo de transformação
const ICONES_CICLO = [Target, Search, ClipboardList, Waypoints, ChartNoAxesCombined];
export function CicloTransformacao() {
  const [ativo, setAtivo] = useState(0);
  const id = useId();
  return (
    <div className="lp-ciclo">
      <Abas itens={CICLO} ativo={ativo} onAtivo={setAtivo} rotulo="Ciclo de transformação" id={id} icones={ICONES_CICLO} classe="lp-ciclo-nos" />
      <div role="tabpanel" id={`${id}-painel`} aria-labelledby={`${id}-aba-${ativo}`} className="lp-ciclo-painel">
        <span className="lp-ciclo-passo">{ativo + 1} de {CICLO.length}</span>
        <b>{CICLO[ativo].nome}</b>
        <p>{CICLO[ativo].frase}</p>
      </div>
    </div>
  );
}

// 02 Sintomas
const ICONES_SINTOMAS = [Clock3, LogOut, Repeat2, TrendingDown];
export function ExploradorSintomas() {
  const [ativo, setAtivo] = useState(0);
  const id = useId();
  const s = SINTOMAS[ativo];
  return (
    <div className="lp-sintomas">
      <h3 className="lp-h3">O que parece ser o problema pode ser apenas o sinal.</h3>
      <p className="lp-instrucao">Selecione uma situação e descubra quais perguntas podem orientar uma investigação, antes de decidir o que mudar.</p>
      <Abas itens={SINTOMAS} ativo={ativo} onAtivo={setAtivo} rotulo="Situações" id={id} icones={ICONES_SINTOMAS} />
      <div role="tabpanel" id={`${id}-painel`} aria-labelledby={`${id}-aba-${ativo}`} className="lp-painel">
        <div className="lp-fluxo-blocos">
          <div><span className="lp-rotulo">Sinal percebido</span><p>{s.sinal}</p></div>
          <div><span className="lp-rotulo">O que investigar</span><p>{s.investigar}</p></div>
          <div><span className="lp-rotulo">Como descobrir</span><p>{s.descobrir}</p></div>
          <div><span className="lp-rotulo">Onde transformar</span><p>{s.transformar}</p></div>
        </div>
        <p className="lp-pergunta">{s.pergunta}</p>
      </div>
      <p className="lp-nota">Estas são possibilidades de investigação, não causas identificadas. Cada desafio exige evidências e análise contextual.</p>
    </div>
  );
}

// 03 Camadas: o pilar em foco realça a camada correspondente
const ICONES_PILARES = [UsersRound, Workflow, RefreshCcw];
export function CamadasValor() {
  const [foco, setFoco] = useState<number | null>(null);
  return (
    <div className="lp-camadas">
      <div className="lp-camadas-diagrama" aria-hidden="true">
        {PILARES.map((p, i) => <span key={p.chave} className={foco === i ? "ativo" : undefined}>{p.camada}</span>)}
      </div>
      <ul className="lp-grade lp-grade-3">
        {PILARES.map((p, i) => {
          const I = ICONES_PILARES[i];
          return (
            <li key={p.chave} className={`lp-card lp-pilar${foco === i ? " ativo" : ""}`}
              onMouseEnter={() => setFoco(i)} onMouseLeave={() => setFoco(null)}>
              <span className="etapa-icone" aria-hidden="true"><I size={22} /></span>
              <b>{p.titulo}</b>
              <span>{p.texto}</span>
              <span className="lp-camada-nome">Camada: {p.camada}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 04 Stepper
const ICONES_ETAPAS = [Target, Compass, ListChecks, Lightbulb, TrendingUp];
export function JornadaStepper() {
  const [ativo, setAtivo] = useState(0);
  const id = useId();
  const e = ETAPAS[ativo];
  const itens = ETAPAS.map((x, i) => ({ chave: String(i), nome: `${i + 1}. ${x.titulo.replace(/\.$/, "")}` }));
  const I = ICONES_ETAPAS[ativo];
  return (
    <div className="lp-stepper">
      <Abas itens={itens} ativo={ativo} onAtivo={setAtivo} rotulo="Etapas da jornada" id={id} classe="lp-stepper-abas" />
      <div role="tabpanel" id={`${id}-painel`} aria-labelledby={`${id}-aba-${ativo}`} className="lp-painel lp-stepper-painel">
        <div className="lp-stepper-topo">
          <span className="etapa-icone" aria-hidden="true"><I size={22} /></span>
          <div>
            <span className="lp-rotulo">Etapa {ativo + 1} de {ETAPAS.length}</span>
            <h3 className="lp-h3">{e.titulo}</h3>
          </div>
        </div>
        {e.planejada && <p className="lp-selo">Visão do funcionamento planejado • Em desenvolvimento</p>}
        <p>{e.texto}</p>
        <div className="lp-lado-a-lado">
          <div><span className="lp-rotulo">O que você faz</span><p>{e.voce}</p></div>
          <div><span className="lp-rotulo">O que a plataforma organiza</span><p>{e.plataforma}</p></div>
        </div>
        <p className="lp-resultado"><b>Resultado:</b> {e.resultado}</p>
        <div className="lp-stepper-nav">
          <button type="button" className="btn btn-ghost" disabled={ativo === 0} onClick={() => setAtivo(ativo - 1)}>Anterior</button>
          <button type="button" className="btn btn-ghost" disabled={ativo === ETAPAS.length - 1} onClick={() => setAtivo(ativo + 1)}>Próxima</button>
        </div>
      </div>
    </div>
  );
}

// 05 Demonstração (a aba pode ser escolhida pelos filtros da seção 07)
const ICONES_DEMO = [HeartPulse, MonitorSmartphone, Users];
export function DemoDesafios({ aba, onAba }: { aba: DemoChave; onAba: (c: DemoChave) => void }) {
  const id = useId();
  const ativo = Math.max(0, DEMOS.findIndex((d) => d.chave === aba));
  const d = DEMOS[ativo];
  return (
    <div className="lp-demo">
      <Abas itens={DEMOS} ativo={ativo} onAtivo={(i) => { onAba(DEMOS[i].chave); medir("demo_tab_change", { aba: DEMOS[i].chave }); }}
        rotulo="Exemplos de desafios" id={id} icones={ICONES_DEMO} />
      <div role="tabpanel" id={`${id}-painel`} aria-labelledby={`${id}-aba-${ativo}`} className="lp-painel lp-demo-painel">
        <div className="lp-demo-desafio"><span className="lp-rotulo">Desafio</span><p className="lp-citacao">“{d.desafio}”</p></div>
        <ol className="lp-mini-fluxo" aria-label="Percurso do exemplo">
          <li>Desafio</li><li>Atividade orientada</li><li>Evidência</li><li>Oportunidade</li>
        </ol>
        <div className="lp-fluxo-blocos lp-fluxo-3">
          <div><span className="lp-rotulo">A plataforma pode orientar</span><p>{d.orientar}</p></div>
          <div><span className="lp-rotulo">O que se busca compreender</span><p>{d.compreender}</p></div>
          <div><span className="lp-rotulo">Possíveis frentes de melhoria</span><p>{d.frentes}</p></div>
        </div>
      </div>
      <p className="lp-nota">Exemplos ilustrativos. As atividades reais dependem do desafio, do contexto e das evidências disponíveis.</p>
    </div>
  );
}

// 06 Entregáveis: trilha do caso fictício
const ICONES_ENTREGAVEIS = [FileText, MapIcon, FolderSearch, Lightbulb, GitBranch, ChartColumnIncreasing];
export function TrilhaEntregaveis() {
  const [ativo, setAtivo] = useState(0);
  const painel = useRef<HTMLDivElement>(null);
  const e = ENTREGAVEIS[ativo];
  const proximo = (ativo + 1) % ENTREGAVEIS.length;
  return (
    <div className="lp-trilha">
      <div className="lp-caso">
        <p className="lp-selo">Exemplo ilustrativo • Clínica Aurora (organização fictícia)</p>
        <h3 className="lp-h3">Da reclamação sobre a recepção a um caminho de melhoria.</h3>
        <p>Uma clínica fictícia percebe reclamações sobre demora e falta de informação na chegada. A equipe quer compreender o que acontece antes de decidir se precisa ampliar o número de atendentes.</p>
      </div>
      <ol className="lp-trilha-lista">
        {ENTREGAVEIS.map((x, i) => {
          const I = ICONES_ENTREGAVEIS[i];
          return (
            <li key={x.titulo}>
              <button type="button" aria-pressed={i === ativo} aria-controls="lp-entregavel" onClick={() => {
                setAtivo(i);
                // No celular o painel fica abaixo da lista: leva a pessoa até ele.
                if (window.innerWidth < 720) requestAnimationFrame(() => painel.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
              }}>
                <span className="lp-trilha-num" aria-hidden="true">{i + 1}</span>
                <I size={20} aria-hidden="true" />
                <span className="lp-trilha-texto"><b>{x.titulo}</b><span>{x.previa}</span></span>
                <span className="lp-etiqueta">{x.etiqueta}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div ref={painel} id="lp-entregavel" className="lp-painel lp-entregavel" aria-live="polite">
        <span className="lp-etiqueta">{e.etiqueta}</span>
        <h4 className="lp-h4">{ativo + 1}. {e.titulo}</h4>
        <p className="lp-texto-forte">{e.descricao}</p>
        <p><span className="lp-rotulo">No exemplo</span>{e.previa}</p>
        <p>{e.detalhe}</p>
        <button type="button" className="btn btn-ghost" onClick={() => setAtivo(proximo)}>
          Explorar outro entregável: {ENTREGAVEIS[proximo].titulo} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="lp-nota">Exemplo demonstrativo com dados fictícios. O tipo de entrega e a profundidade dependem das evidências disponíveis.</p>
      <p className="lp-nota">A plataforma não garante resultados específicos nem substitui avaliações e profissionais habilitados em decisões de risco.</p>
    </div>
  );
}

// 07 Aplicações: dois grupos de seleção única, independentes; só os quatro pares do complemento têm exemplo
function GrupoEscolha({ titulo, opcoes, valor, onValor }: { titulo: string; opcoes: readonly string[]; valor: string | null; onValor: (v: string) => void }) {
  const id = useId();
  return (
    <div className="lp-grupo">
      <p className="lp-grupo-titulo" id={id}>{titulo}</p>
      <div role="radiogroup" aria-labelledby={id} className="lp-chips-escolha">
        {opcoes.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={valor === o} onClick={() => onValor(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

export function FiltroAplicacoes({ onVerExemplo }: { onVerExemplo: (aba: DemoChave) => void }) {
  const [publico, setPublico] = useState<string | null>(null);
  const [melhoria, setMelhoria] = useState<string | null>(null);
  const cenario = publico && melhoria ? CENARIOS.find((c) => c.publico === publico && c.melhoria === melhoria) : undefined;
  const estado = !publico && !melhoria ? ESTADOS_FILTRO.nenhum : publico && !melhoria ? ESTADOS_FILTRO.soPublico
    : !publico && melhoria ? ESTADOS_FILTRO.soMelhoria : cenario ? null : ESTADOS_FILTRO.semExemplo;
  return (
    <div className="lp-filtros">
      <div className="lp-filtros-grupos">
        <GrupoEscolha titulo="Quem vive a experiência?" opcoes={PUBLICOS} valor={publico} onValor={setPublico} />
        <GrupoEscolha titulo="O que precisa melhorar?" opcoes={MELHORIAS} valor={melhoria} onValor={setMelhoria} />
      </div>
      <div className="lp-painel lp-filtro-resultado" aria-live="polite">
        {cenario ? (
          <>
            <span className="lp-rotulo">{cenario.publico} • {cenario.melhoria}</span>
            <h3 className="lp-h3">{cenario.titulo}</h3>
            <p>{cenario.descricao}</p>
            <a href={cenario.alvo} className="btn btn-ghost" onClick={() => { if (cenario.aba) onVerExemplo(cenario.aba); }}>{cenario.cta}</a>
          </>
        ) : <p className="lp-estado">{estado}</p>}
      </div>
      <p className="lp-nota">{ESTADOS_FILTRO.rodape}</p>
    </div>
  );
}

// 08 Diferenciais: exemplo aparece por botão explícito (toque, teclado e mouse)
const ICONES_DIF = [Target, Route, Layers3, ScanSearch, Network, RefreshCcw];
export function CardsDiferenciais() {
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <ul className="lp-grade lp-grade-3">
      {DIFERENCIAIS.map((d, i) => {
        const I = ICONES_DIF[i];
        const ver = aberto === d.chave;
        return (
          <li key={d.chave} className={`lp-card lp-diferencial${ver ? " ativo" : ""}`}>
            <span className="etapa-icone" aria-hidden="true"><I size={22} /></span>
            <b>{d.titulo}</b>
            <span>{d.texto}</span>
            <button type="button" className="btn-link lp-ver-exemplo" aria-expanded={ver} aria-controls={`dif-${d.chave}`} onClick={() => setAberto(ver ? null : d.chave)}>
              {ver ? "Ocultar exemplo" : "Ver exemplo"}
            </button>
            <p id={`dif-${d.chave}`} className="lp-exemplo" hidden={!ver}>{d.exemplo}</p>
          </li>
        );
      })}
    </ul>
  );
}

// 12 FAQ: uma resposta aberta por vez; link direto por âncora (#faq-1 a #faq-10)
export function PerguntasFrequentes() {
  const [aberta, setAberta] = useState<number | null>(null);
  useEffect(() => {
    const abrirPeloEndereco = () => {
      const m = /^#faq-(\d+)$/.exec(location.hash);
      if (m) setAberta(Number(m[1]) - 1);
    };
    abrirPeloEndereco();
    window.addEventListener("hashchange", abrirPeloEndereco);
    return () => window.removeEventListener("hashchange", abrirPeloEndereco);
  }, []);
  return (
    <div className="lp-faq">
      {FAQ.map(([p, r], i) => {
        const aberto = aberta === i;
        return (
          <div key={p} id={`faq-${i + 1}`} className={`lp-faq-item${aberto ? " aberto" : ""}`}>
            <h3>
              <button type="button" aria-expanded={aberto} aria-controls={`faq-${i + 1}-resposta`}
                onClick={() => { setAberta(aberto ? null : i); if (!aberto) medir("faq_expand", { pergunta: String(i + 1) }); }}>
                <span>{p}</span>{aberto ? <Minus size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
              </button>
            </h3>
            <p id={`faq-${i + 1}-resposta`} hidden={!aberto}>{r}</p>
          </div>
        );
      })}
    </div>
  );
}
