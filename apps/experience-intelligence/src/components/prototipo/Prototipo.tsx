"use client";
// Protótipo da landing comercial no visual de referência do site do estúdio (páginas enviadas pela dona do produto
// em 21/10/2026): fundo cinza-azulado, grande superfície branca, selos em pílula, títulos centrados com trecho em
// vermelho, cards suaves, linha do tempo alternada, órbitas, abas em pílula e grade "bento".
// Copy da especificação aprovada (../landing/conteudo.ts). Sem IA, sem banco, sem métricas inventadas.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown, ChartColumnIncreasing, CircleCheck, ClipboardList, Clock3, Compass, FileText, FolderSearch, GitBranch,
  Handshake, HeartPulse, Laptop, Layers3, Lightbulb, ListChecks, LogOut, Map as MapIcon, Menu, Minus, MonitorSmartphone,
  Network, Plus, RefreshCcw, Repeat2, Route, ScanSearch, Search, ShieldCheck, Target, TrendingDown, TrendingUp,
  UserRoundCheck, Users, UsersRound, Workflow, X, type LucideIcon,
} from "lucide-react";
import {
  ANCORAS, CENARIOS, CICLO, DADOS, DEMOS, DIFERENCIAIS, ENTREGAVEIS, ESTADOS_FILTRO, ETAPAS, FAQ, MELHORIAS, PILARES,
  PLANOS, PUBLICOS, SINTOMAS, type DemoChave,
} from "../landing/conteudo";
import "./prototipo.css";

function Tag({ children, ponto }: { children: React.ReactNode; ponto?: boolean }) {
  return <span className="p-tag">{ponto && <span className="p-tag-ponto" aria-hidden="true" />}{children}</span>;
}

function Cabeca({ tag, titulo, destaque, lead, id }: { tag: string; titulo: string; destaque?: string; lead?: React.ReactNode; id?: string }) {
  return (
    <div className="p-cabeca">
      <Tag>{tag}</Tag>
      <h2 id={id}>{titulo}{destaque && <> <span className="p-vermelho">{destaque}</span></>}</h2>
      {lead && <div className="p-lead">{lead}</div>}
    </div>
  );
}

function teclas(e: React.KeyboardEvent, i: number, total: number, ir: (i: number) => void) {
  const m: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: total - 1 };
  if (!(e.key in m)) return;
  e.preventDefault();
  const n = (m[e.key] + total) % total;
  ir(n);
  ((e.currentTarget.parentElement?.children[n]) as HTMLElement | undefined)?.focus();
}

function Pilulas({ itens, ativo, onAtivo, rotulo, icones, painel }: { itens: { chave: string; nome: string }[]; ativo: number; onAtivo: (i: number) => void; rotulo: string; icones?: LucideIcon[]; painel: string }) {
  return (
    <div className="p-pilulas" role="tablist" aria-label={rotulo}>
      {itens.map((it, i) => {
        const I = icones?.[i];
        return (
          <button key={it.chave} type="button" role="tab" aria-selected={i === ativo} aria-controls={painel} tabIndex={i === ativo ? 0 : -1}
            onClick={() => onAtivo(i)} onKeyDown={(e) => teclas(e, i, itens.length, onAtivo)}>
            {I && <I size={16} aria-hidden="true" />}{it.nome}
          </button>
        );
      })}
    </div>
  );
}

/* Cabeçalho */
function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const t = (e: KeyboardEvent) => { if (e.key === "Escape") { setAberto(false); botao.current?.focus(); } };
    document.addEventListener("keydown", t);
    return () => document.removeEventListener("keydown", t);
  }, [aberto]);
  return (
    <header className="p-topo">
      <div className="p-wrap p-topo-linha">
        <a href="#inicio" className="p-logo" aria-label="DM | Experience Intelligence, início">
          <img src="/logo-dm-icone.png" alt="" width={30} height={35} />
          <span><b>Experience Intelligence</b><small>Dani Moscatelli | Experience Design Studio</small></span>
        </a>
        <nav className="p-nav" aria-label="Seções">{ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`}>{a.rotulo}</a>)}</nav>
        <div className="p-topo-acoes">
          <Link href="/entrar/" className="p-botao p-botao-pequeno">Entrar</Link>
          <button ref={botao} type="button" className="p-menu-botao" aria-expanded={aberto} aria-controls="p-menu" onClick={() => setAberto(!aberto)}>
            {aberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}<span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
          </button>
        </div>
      </div>
      {aberto && (
        <nav id="p-menu" className="p-menu" aria-label="Seções">
          {ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`} onClick={() => setAberto(false)}>{a.rotulo}</a>)}
        </nav>
      )}
    </header>
  );
}

/* 01 Topo: composição do produto com o ciclo interativo */
const ICONES_CICLO = [Target, Search, ClipboardList, Lightbulb, TrendingUp];
function Topo() {
  const [ativo, setAtivo] = useState(0);
  const I = ICONES_CICLO[ativo];
  return (
    <section className="p-hero" id="inicio">
      <div className="p-wrap p-hero-grade">
        <div>
          <Tag ponto>Inteligência para transformar experiências</Tag>
          <h1>Experiências melhores começam quando entendemos <span className="p-vermelho">o que precisa mudar.</span></h1>
          <p className="p-hero-sub">Transforme desafios em caminhos concretos de melhoria para clientes, pacientes, usuários, colaboradores e todas as pessoas que se relacionam com sua organização.</p>
          <p className="p-hero-micro">Você apresenta o desafio. A plataforma orienta os próximos passos, sem exigir conhecimentos de Service Design ou pesquisa.</p>
          <div className="p-hero-acoes">
            <a href="#como-funciona" className="p-botao">Ver como funciona</a>
            <details className="p-saiba">
              <summary>Saiba mais <ArrowDown size={16} aria-hidden="true" /></summary>
              <p>A DM | Experience Intelligence combina inteligência artificial, conhecimento especializado e condução prática para ajudar sua equipe a investigar o que acontece, conectar a experiência à operação e orientar transformações em serviços, processos, atendimento e produtos físicos ou digitais.</p>
            </details>
          </div>
          <p className="p-pequeno">Acesso por convite durante a fase de testes.</p>
        </div>

        <div className="p-composicao">
          <div className="p-app">
            <div className="p-app-topo">
              <img src="/logo-dm-icone.png" alt="" width={20} height={23} />
              <span>Experience Intelligence</span>
              <span className="p-app-selo">Exemplo ilustrativo</span>
            </div>
            <p className="p-app-rotulo">Desafio</p>
            <p className="p-app-desafio">“{DEMOS[0].desafio}”</p>
            <Pilulas itens={[...CICLO]} ativo={ativo} onAtivo={setAtivo} rotulo="Ciclo de transformação" icones={ICONES_CICLO} painel="p-ciclo-painel" />
            <div id="p-ciclo-painel" role="tabpanel" className="p-ciclo-painel" aria-live="polite">
              <span className="p-icone"><I size={20} aria-hidden="true" /></span>
              <div><b>{CICLO[ativo].nome}</b><p>{CICLO[ativo].frase}</p></div>
            </div>
          </div>
          <div className="p-flutua p-flutua-1"><CircleCheck size={16} aria-hidden="true" />{ETAPAS[0].resultado}</div>
          <div className="p-flutua p-flutua-2"><MapIcon size={16} aria-hidden="true" />{ETAPAS[1].resultado}</div>
          <div className="p-flutua p-flutua-3"><ScanSearch size={16} aria-hidden="true" />{ETAPAS[2].resultado}</div>
        </div>
      </div>
    </section>
  );
}

/* 02 Dados e sintomas */
const ICONES_SINT = [Clock3, LogOut, Repeat2, TrendingDown];
function Dados() {
  const [s, setS] = useState(0);
  const x = SINTOMAS[s];
  return (
    <section className="p-secao" aria-labelledby="t-dados">
      <div className="p-wrap">
        <Cabeca id="t-dados" tag="O desafio das organizações" titulo="O problema aparece na experiência." destaque="A causa pode estar em qualquer parte do serviço."
          lead={<p>Uma reclamação pode começar no atendimento, mas nascer de um processo confuso, uma informação desencontrada, uma decisão operacional ou uma tecnologia mal integrada. Tratar apenas o sintoma é correr o risco de investir na solução errada.</p>} />
        <ul className="p-dados">
          {DADOS.map((d) => {
            const v = parseInt(d.numero, 10);
            return (
              <li key={d.numero} className="p-card">
                <div className="p-medidor" aria-hidden="true"><span style={{ width: `${v}%` }} /></div>
                <span className="p-numero">{d.numero}</span>
                <p>{d.texto}</p>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-fonte">{d.fonte}</a>
              </li>
            );
          })}
        </ul>
        <p className="p-citacao">“Esses números mostram o peso da experiência nas decisões de consumo. Para transformar essa realidade, é preciso descobrir o que produz cada experiência, <span className="p-vermelho">e agir sobre isso.</span>”</p>

        <div className="p-bloco">
          <h3 className="p-h3-centro">O que parece ser o problema pode ser apenas o sinal.</h3>
          <p className="p-lead p-centro">Selecione uma situação e descubra quais perguntas podem orientar uma investigação, antes de decidir o que mudar.</p>
          <Pilulas itens={[...SINTOMAS]} ativo={s} onAtivo={setS} rotulo="Situações" icones={ICONES_SINT} painel="p-sint-painel" />
          <div id="p-sint-painel" role="tabpanel" className="p-comparar">
            <div className="p-coluna p-coluna-cinza">
              <div className="p-coluna-cabeca"><span>Sinal percebido</span><h4>{x.nome}</h4></div>
              <p className="p-sinal">{x.sinal}</p>
              <p className="p-pergunta">{x.pergunta}</p>
            </div>
            <div className="p-coluna p-coluna-rosa">
              <div className="p-coluna-cabeca"><span>Antes de decidir o que mudar</span><h4>Investigação</h4></div>
              <ol className="p-fluxo">
                <li><b>O que investigar</b><p>{x.investigar}</p></li>
                <li aria-hidden="true" className="p-seta">↓</li>
                <li><b>Como descobrir</b><p>{x.descobrir}</p></li>
                <li aria-hidden="true" className="p-seta">↓</li>
                <li className="p-fluxo-fim"><b>Onde transformar</b><p>{x.transformar}</p></li>
              </ol>
            </div>
          </div>
          <p className="p-nota p-centro">Estas são possibilidades de investigação, não causas identificadas. Cada desafio exige evidências e análise contextual.</p>
        </div>
      </div>
    </section>
  );
}

/* 03 Categoria: órbitas */
const ORBITA_INTERNA = ["Processos", "Equipes", "Decisões"];
const ORBITA_EXTERNA = ["Ambientes", "Tecnologias", "Resultados"];
const ICONES_PILARES = [UsersRound, Workflow, RefreshCcw];
function Categoria() {
  return (
    <section className="p-secao" aria-labelledby="t-cat">
      <div className="p-wrap">
        <Cabeca id="t-cat" tag="Mais do que medir. Mais do que digitalizar." titulo="Da percepção do problema" destaque="à transformação do serviço." />
        <div className="p-duas">
          <div>
            <p className="p-texto">A DM | Experience Intelligence é uma plataforma de inteligência e melhoria contínua que orienta organizações na investigação de desafios reais. Ela conecta o que as pessoas vivenciam aos processos, equipes, decisões, ambientes e tecnologias que tornam essa experiência possível.</p>
            <p className="p-texto-forte">O objetivo não é produzir mais dashboards. É ajudar sua organização a saber <span className="p-vermelho">o que investigar, por que investigar, como agir e o que acompanhar depois.</span></p>
            <ul className="p-pilares">
              {PILARES.map((p, i) => {
                const I = ICONES_PILARES[i];
                return <li key={p.chave}><span className="p-icone"><I size={20} aria-hidden="true" /></span><div><b>{p.titulo}</b><p>{p.texto}</p></div></li>;
              })}
            </ul>
          </div>
          <div className="p-orbitas" aria-hidden="true">
            <div className="p-anel p-anel-1" />
            <div className="p-anel p-anel-2" />
            <div className="p-centro-orbita"><UsersRound size={26} /><b>Pessoas</b></div>
            <div className="p-giro p-giro-1">{ORBITA_INTERNA.map((n, i) => <span key={n} className="p-no" style={{ ["--a" as string]: `${i * 120}deg`, ["--r" as string]: 29 }}><span>{n}</span></span>)}</div>
            <div className="p-giro p-giro-2">{ORBITA_EXTERNA.map((n, i) => <span key={n} className="p-no" style={{ ["--a" as string]: `${i * 120 + 60}deg`, ["--r" as string]: 46 }}><span>{n}</span></span>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 04 Como funciona: linha do tempo alternada */
const ICONES_ETAPAS = [Target, Compass, ListChecks, Lightbulb, TrendingUp];
function ComoFunciona() {
  const [aberta, setAberta] = useState<number | null>(null);
  return (
    <section className="p-secao" id="como-funciona" aria-labelledby="t-como">
      <div className="p-wrap">
        <Cabeca id="t-como" tag="Sua jornada de transformação" titulo="Você traz o desafio." destaque="Nós ajudamos a construir o caminho."
          lead={<p>O ponto de partida não é um formulário padrão, uma técnica de pesquisa ou um mapa pronto. É a necessidade real da sua organização. A partir dela, a inteligência propõe e adapta uma investigação orientada por evidências.</p>} />
        <ol className="p-tempo">
          {ETAPAS.map((e, i) => {
            const I = ICONES_ETAPAS[i];
            const ver = aberta === i;
            return (
              <li key={e.titulo} className={i % 2 ? "p-direita" : "p-esquerda"}>
                <span className="p-tempo-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="p-card p-tempo-card">
                  <span className="p-rotulo"><I size={14} aria-hidden="true" /> {e.resultado}</span>
                  <h3>{e.titulo}</h3>
                  <p>{e.texto}</p>
                  {e.planejada && <span className="p-selo-cinza">Visão do funcionamento planejado • Em desenvolvimento</span>}
                  <button type="button" className="p-link" aria-expanded={ver} aria-controls={`p-etapa-${i}`} onClick={() => setAberta(ver ? null : i)}>
                    {ver ? "Ocultar detalhes" : "O que acontece nesta etapa"}
                  </button>
                  <div id={`p-etapa-${i}`} className="p-etapa-detalhe" hidden={!ver}>
                    <div><b>O que você faz</b><p>{e.voce}</p></div>
                    <div><b>O que a plataforma organiza</b><p>{e.plataforma}</p></div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="p-citacao">“Cada desafio pede perguntas e atividades diferentes. O percurso não é uma lista fixa: <span className="p-vermelho">ele se adapta ao contexto e às evidências reunidas.</span>”</p>
      </div>
    </section>
  );
}

/* 05 Demonstração */
const ICONES_DEMO = [HeartPulse, MonitorSmartphone, Users];
function Demonstracao({ aba, onAba }: { aba: DemoChave; onAba: (c: DemoChave) => void }) {
  const i = Math.max(0, DEMOS.findIndex((d) => d.chave === aba));
  const d = DEMOS[i];
  return (
    <section className="p-secao p-secao-cinza" id="demonstracao" aria-labelledby="t-demo">
      <div className="p-wrap">
        <Cabeca id="t-demo" tag="Veja a inteligência em contexto" titulo="O mesmo método de condução." destaque="Caminhos diferentes para cada desafio."
          lead={<p>Uma clínica, um produto digital e uma operação interna não precisam das mesmas perguntas. A plataforma parte da situação apresentada para definir o que investigar e como orientar sua equipe.</p>} />
        <Pilulas itens={[...DEMOS]} ativo={i} onAtivo={(n) => onAba(DEMOS[n].chave)} rotulo="Exemplos de desafios" icones={ICONES_DEMO} painel="p-demo-painel" />
        <div id="p-demo-painel" role="tabpanel" className="p-card p-demo">
          <span className="p-rotulo">Desafio</span>
          <p className="p-demo-desafio">“{d.desafio}”</p>
          <ol className="p-mini-fluxo" aria-label="Percurso do exemplo"><li>Desafio</li><li>Atividade orientada</li><li>Evidência</li><li>Oportunidade</li></ol>
          <div className="p-tres">
            <div><b>A plataforma pode orientar</b><p>{d.orientar}</p></div>
            <div><b>O que se busca compreender</b><p>{d.compreender}</p></div>
            <div><b>Possíveis frentes de melhoria</b><p>{d.frentes}</p></div>
          </div>
        </div>
        <p className="p-nota p-centro">Exemplos ilustrativos. As atividades reais dependem do desafio, do contexto e das evidências disponíveis.</p>
      </div>
    </section>
  );
}

/* 06 Entregáveis: grade bento */
const ICONES_ENT = [FileText, MapIcon, FolderSearch, Lightbulb, GitBranch, ChartColumnIncreasing];
function Entregaveis() {
  const [ativo, setAtivo] = useState(0);
  const destaque = useRef<HTMLDivElement>(null);
  const e = ENTREGAVEIS[ativo];
  const I = ICONES_ENT[ativo];
  const prox = (ativo + 1) % ENTREGAVEIS.length;
  const escolher = (n: number) => {
    setAtivo(n);
    if (window.innerWidth < 900) requestAnimationFrame(() => destaque.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  };
  return (
    <section className="p-secao" aria-labelledby="t-ent">
      <div className="p-wrap">
        <Cabeca id="t-ent" tag="Do desafio à decisão" titulo="Conhecimento organizado para transformar," destaque="não apenas apresentar."
          lead={<p>Ao longo de uma investigação, sua organização constrói uma base de trabalho que conecta o problema inicial às descobertas e às decisões de melhoria. O nível de aprofundamento depende do desafio e da qualidade das informações reunidas.</p>} />
        <div className="p-caso">
          <span className="p-selo-rosa">Exemplo ilustrativo • Clínica Aurora (organização fictícia)</span>
          <h3>Da reclamação sobre a recepção a um caminho de melhoria.</h3>
          <p>Uma clínica fictícia percebe reclamações sobre demora e falta de informação na chegada. A equipe quer compreender o que acontece antes de decidir se precisa ampliar o número de atendentes.</p>
        </div>
        <div className="p-bento">
          <div ref={destaque} className="p-card p-bento-destaque" aria-live="polite">
            <div className="p-bento-topo"><span className="p-icone"><I size={22} aria-hidden="true" /></span><span className="p-selo-rosa">{e.etiqueta}</span></div>
            <span className="p-rotulo">Entregável {ativo + 1} de {ENTREGAVEIS.length}</span>
            <h3>{e.titulo}</h3>
            <p className="p-texto-forte">{e.descricao}</p>
            <p className="p-previa">{e.previa}</p>
            <p>{e.detalhe}</p>
            <button type="button" className="p-link" onClick={() => setAtivo(prox)}>Explorar outro entregável: {ENTREGAVEIS[prox].titulo}</button>
          </div>
          <ol className="p-bento-lista">
            {ENTREGAVEIS.map((x, n) => {
              const J = ICONES_ENT[n];
              return (
                <li key={x.titulo}>
                  <button type="button" aria-pressed={n === ativo} onClick={() => escolher(n)}>
                    <span className="p-icone p-icone-pequeno"><J size={18} aria-hidden="true" /></span>
                    <span><b>{n + 1}. {x.titulo}</b><small>{x.etiqueta}</small></span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="p-nota p-centro">Exemplo demonstrativo com dados fictícios. O tipo de entrega e a profundidade dependem das evidências disponíveis.</p>
        <p className="p-nota p-centro">A plataforma não garante resultados específicos nem substitui avaliações e profissionais habilitados em decisões de risco.</p>
      </div>
    </section>
  );
}

/* 07 Aplicações */
function Grupo({ titulo, opcoes, valor, onValor }: { titulo: string; opcoes: readonly string[]; valor: string | null; onValor: (v: string) => void }) {
  return (
    <div className="p-grupo">
      <p className="p-grupo-titulo">{titulo}</p>
      <div role="radiogroup" aria-label={titulo} className="p-chips">
        {opcoes.map((o) => <button key={o} type="button" role="radio" aria-checked={valor === o} onClick={() => onValor(o)}>{o}</button>)}
      </div>
    </div>
  );
}
function Aplicacoes({ onVer }: { onVer: (a: DemoChave) => void }) {
  const [pub, setPub] = useState<string | null>(null);
  const [mel, setMel] = useState<string | null>(null);
  const c = pub && mel ? CENARIOS.find((x) => x.publico === pub && x.melhoria === mel) : undefined;
  const estado = !pub && !mel ? ESTADOS_FILTRO.nenhum : pub && !mel ? ESTADOS_FILTRO.soPublico : !pub && mel ? ESTADOS_FILTRO.soMelhoria : c ? null : ESTADOS_FILTRO.semExemplo;
  return (
    <section className="p-secao" id="aplicacoes" aria-labelledby="t-apl">
      <div className="p-wrap">
        <Cabeca id="t-apl" tag="Uma abordagem. Diferentes realidades." titulo="Experiências não acontecem apenas em telas," destaque="nem em um único setor."
          lead={<p>Sempre que pessoas interagem com um produto, serviço, processo ou organização, existe uma experiência a compreender e a possibilidade de transformá-la.</p>} />
        <div className="p-card p-filtros">
          <p className="p-centro p-instrucao">Escolha uma combinação para visualizar exemplos de desafios que a plataforma pode ajudar a investigar.</p>
          <div className="p-filtros-grupos">
            <Grupo titulo="Quem vive a experiência?" opcoes={PUBLICOS} valor={pub} onValor={setPub} />
            <Grupo titulo="O que precisa melhorar?" opcoes={MELHORIAS} valor={mel} onValor={setMel} />
          </div>
          <div className={`p-resultado${c ? " p-resultado-ok" : ""}`} aria-live="polite">
            {c ? (
              <>
                <span className="p-rotulo">{c.publico} • {c.melhoria}</span>
                <h3>{c.titulo}</h3>
                <p>{c.descricao}</p>
                <a href={c.alvo} className="p-botao p-botao-contorno" onClick={() => { if (c.aba) onVer(c.aba); }}>{c.cta}</a>
              </>
            ) : <p>{estado}</p>}
          </div>
          <p className="p-nota p-centro">{ESTADOS_FILTRO.rodape}</p>
        </div>
      </div>
    </section>
  );
}

/* 08 Diferenciais */
const ICONES_DIF = [Target, Route, Layers3, ScanSearch, Network, RefreshCcw];
function Diferenciais() {
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <section className="p-secao p-secao-cinza" id="diferenciais" aria-labelledby="t-dif">
      <div className="p-wrap">
        <Cabeca id="t-dif" tag="O que nos move" titulo="Metodologia especializada nos bastidores." destaque="Direção clara para quem está na operação." />
        <ul className="p-grade-3">
          {DIFERENCIAIS.map((d, i) => {
            const I = ICONES_DIF[i];
            const ver = aberto === d.chave;
            return (
              <li key={d.chave} className="p-card p-dif">
                <span className="p-icone"><I size={20} aria-hidden="true" /></span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
                <button type="button" className="p-link" aria-expanded={ver} aria-controls={`p-dif-${d.chave}`} onClick={() => setAberto(ver ? null : d.chave)}>{ver ? "Ocultar exemplo" : "Ver exemplo"}</button>
                <p id={`p-dif-${d.chave}`} className="p-exemplo" hidden={!ver}>{d.exemplo}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* 09 Plataforma + consultoria */
function PlataformaConsultoria() {
  return (
    <section className="p-secao" aria-labelledby="t-pc">
      <div className="p-wrap">
        <Cabeca id="t-pc" tag="Autonomia quando possível. Especialistas quando necessário." titulo="Sua equipe pode avançar sozinha." destaque="E contar com especialistas quando o desafio pedir mais."
          lead={<p>A DM | Experience Intelligence foi concebida para apoiar investigações e melhorias com autonomia. Em situações de maior complexidade, a Dani Moscatelli | Experience Design Studio pode aprofundar pesquisas, facilitar alinhamentos e apoiar o redesenho e a implementação de serviços.</p>} />
        <div className="p-comparar">
          <div className="p-coluna p-coluna-cinza">
            <div className="p-coluna-cabeca"><Laptop size={22} aria-hidden="true" /><span>Plataforma</span><h4>Inteligência para o dia a dia da organização.</h4></div>
            <ul className="p-blocos">
              <li>Jornada guiada a partir do desafio.</li><li>Orientações práticas e instrumentos contextualizados.</li>
              <li>Organização de evidências e oportunidades.</li><li className="p-bloco-escuro">Acompanhamento contínuo das melhorias.</li>
            </ul>
            <a href="#como-funciona" className="p-botao p-botao-contorno">Conhecer a plataforma</a>
          </div>
          <div className="p-coluna p-coluna-rosa">
            <div className="p-coluna-cabeca"><Handshake size={22} aria-hidden="true" /><span>Consultoria especializada</span><h4>Profundidade para transformações complexas.</h4></div>
            <ul className="p-blocos p-blocos-rosa">
              <li>Pesquisa e diagnóstico conduzidos por especialistas.</li><li>Análise de contextos, operações e relações entre áreas.</li>
              <li>Cocriação e redesenho de serviços e experiências.</li><li className="p-bloco-vermelho">Facilitação e apoio à implementação e avaliação.</li>
            </ul>
          </div>
        </div>
        <p className="p-citacao">“Não é uma escolha definitiva: a consultoria pode potencializar o trabalho realizado na plataforma, <span className="p-vermelho">sem substituir a autonomia da sua equipe.</span>”</p>
      </div>
    </section>
  );
}

/* 10 Responsabilidade */
function Responsabilidade() {
  const itens: [LucideIcon, string, string][] = [
    [ShieldCheck, "Privacidade primeiro.", "Oriente o registro apenas das informações necessárias; evite dados pessoais e sensíveis não autorizados."],
    [ScanSearch, "Evidências com contexto.", "Relatos, registros e observações possuem limites diferentes; a análise precisa reconhecer isso."],
    [UserRoundCheck, "Decisão humana.", "Recomendações orientam a investigação e a transformação; não substituem responsabilidade profissional."],
  ];
  return (
    <section className="p-secao" aria-labelledby="t-resp">
      <div className="p-wrap">
        <div className="p-escuro">
          <Cabeca id="t-resp" tag="Inteligência com responsabilidade" titulo="Boas decisões precisam de perguntas melhores," destaque="e evidências confiáveis."
            lead={<p>A inteligência artificial apoia a organização do desafio e a condução das atividades, mas não transforma suposições em fatos. O processo foi concebido para indicar lacunas de informação, respeitar contextos sensíveis e manter pessoas responsáveis pelas decisões.</p>} />
          <ul className="p-grade-3">
            {itens.map(([I, t, d]) => <li key={t}><span className="p-icone p-icone-escuro"><I size={20} aria-hidden="true" /></span><h3>{t}</h3><p>{d}</p></li>)}
          </ul>
          <p className="p-centro"><Link href="/aviso-de-privacidade/" className="p-link-claro">Aviso de privacidade</Link></p>
        </div>
      </div>
    </section>
  );
}

/* 11 Planos */
function Planos() {
  return (
    <section className="p-secao p-secao-cinza" id="planos" aria-labelledby="t-planos">
      <div className="p-wrap">
        <Cabeca id="t-planos" tag="Planos e acesso" titulo="Uma forma de evoluir experiências" destaque="de acordo com a realidade da sua organização."
          lead={<p>Estamos estruturando as modalidades comerciais da DM | Experience Intelligence. A proposta é oferecer autonomia para o trabalho contínuo e opções de apoio especializado conforme a complexidade dos desafios.</p>} />
        <p className="p-centro"><span className="p-selo-cinza">Planos em definição • Acesso antecipado por convite</span></p>
        <ul className="p-grade-3 p-planos">
          {PLANOS.map((p) => (
            <li key={p.nome} className="p-card">
              <span className="p-selo-rosa">Proposta em estudo</span>
              <h3>{p.nome}</h3>
              <p><b>Para quem:</b> {p.para}</p>
              <p><b>Proposta:</b> {p.proposta}</p>
              <p className="p-preco">{p.preco}</p>
            </li>
          ))}
        </ul>
        <p className="p-nota p-centro">Nomes, recursos e condições dos planos estão sujeitos a validação. A contratação ainda não está disponível nesta fase.</p>
      </div>
    </section>
  );
}

/* 12 FAQ */
function Perguntas() {
  const [aberta, setAberta] = useState<number | null>(null);
  return (
    <section className="p-secao" id="perguntas" aria-labelledby="t-faq">
      <div className="p-wrap">
        <Cabeca id="t-faq" tag="FAQ" titulo="O que você precisa saber" destaque="antes de começar." />
        <div className="p-faq">
          {FAQ.map(([q, r], i) => {
            const ver = aberta === i;
            return (
              <div key={q} id={`faq-${i + 1}`} className={`p-faq-item${ver ? " aberto" : ""}`}>
                <h3><button type="button" aria-expanded={ver} aria-controls={`faq-${i + 1}-r`} onClick={() => setAberta(ver ? null : i)}><span>{q}</span>{ver ? <Minus size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</button></h3>
                <p id={`faq-${i + 1}-r`} hidden={!ver}>{r}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 13 CTA final e rodapé */
function Final() {
  return (
    <section className="p-secao" aria-labelledby="t-final">
      <div className="p-wrap">
        <div className="p-card p-final">
          <Tag>O próximo passo é seu</Tag>
          <h2 id="t-final">Sua organização já tem um desafio. <span className="p-vermelho">Vamos começar por ele?</span></h2>
          <p className="p-lead">Quando a experiência não funciona como deveria, cada informação pode ajudar a descobrir um caminho melhor. Conheça uma abordagem que conecta pessoas, operação e tecnologia para transformar desafios em oportunidades de evolução.</p>
          <ol className="p-mini-fluxo p-mini-centro" aria-label="Ciclo de transformação">{CICLO.map((c) => <li key={c.chave}>{c.nome}</li>)}</ol>
          <Link href="/entrar/" className="p-botao">Entrar</Link>
          <p className="p-pequeno">Acesso à plataforma limitado a pessoas convidadas nesta fase. Sem contratação automática.</p>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="p-rodape">
      <div className="p-wrap p-rodape-linha">
        <div className="p-logo"><img src="/logo-dm-icone.png" alt="" width={24} height={28} /><span><b>Experience Intelligence</b><small>Um produto da Dani Moscatelli | Experience Design Studio.</small></span></div>
        <p className="p-pequeno">Tecnologia e conhecimento para transformar experiências humanas.</p>
        <nav aria-label="Rodapé">
          {ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`}>{a.rotulo}</a>)}
          <Link href="/entrar/">Entrar</Link>
          <Link href="/aviso-de-privacidade/">Aviso de privacidade</Link>
          <a href="https://danimoscatelli.com.br/" target="_blank" rel="noopener">Site do estúdio</a>
          <a href="#inicio">Voltar ao topo</a>
        </nav>
        <p className="p-pequeno">© {new Date().getFullYear()} Dani Moscatelli • Experience Design Studio. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export function Prototipo() {
  const [aba, setAba] = useState<DemoChave>("saude");
  return (
    <div className="p">
      <noscript><style>{".p [hidden]{display:block !important}"}</style></noscript>
      <a href="#conteudo" className="p-pular">Pular para o conteúdo</a>
      <div className="p-aviso">Protótipo de redesenho, não publicado</div>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1}>
        <Topo />
        <div className="p-superficie">
          <Dados />
          <Categoria />
          <ComoFunciona />
          <Demonstracao aba={aba} onAba={setAba} />
          <Entregaveis />
          <Aplicacoes onVer={setAba} />
          <Diferenciais />
          <PlataformaConsultoria />
          <Responsabilidade />
          <Planos />
          <Perguntas />
          <Final />
        </div>
      </main>
      <Rodape />
    </div>
  );
}
