"use client";
// Protótipo do redesenho da landing (docs/product/LANDING_REDESENHO_PROPOSTA.md). Não publicado nem ligado à
// navegação. Conceito: a linha de visibilidade separa o que as pessoas vivenciam da operação que produz a experiência.
// Copy da especificação aprovada (src/components/landing/conteudo.ts); nenhum texto novo de produto.
import { useState } from "react";
import { Clock3, LogOut, Repeat2, TrendingDown } from "lucide-react";
import { CICLO, ENTREGAVEIS, ETAPAS, SINTOMAS } from "../landing/conteudo";
import "./prototipo.css";

// Rótulos do diagrama retirados da seção 03 da especificação.
const ACIMA = "O que as pessoas vivenciam";
const ABAIXO = ["Processos", "Equipes", "Decisões", "Ambientes", "Tecnologias"];

function Linha({ rotulo = true }: { rotulo?: boolean }) {
  return <div className="v2-linha" aria-hidden="true">{rotulo && <span>linha de visibilidade</span>}</div>;
}

function Topo() {
  const [ativo, setAtivo] = useState(0);
  return (
    <section className="v2-topo">
      <div className="v2-wrap v2-topo-grade">
        <div className="v2-topo-texto">
          <p className="v2-marca-secao">Inteligência para transformar experiências</p>
          <h1>Experiências melhores começam quando entendemos o que precisa mudar.</h1>
          <p className="v2-sub">Transforme desafios em caminhos concretos de melhoria para clientes, pacientes, usuários, colaboradores e todas as pessoas que se relacionam com sua organização.</p>
          <details className="v2-mais">
            <summary>Como a plataforma faz isso</summary>
            <p>A DM | Experience Intelligence combina inteligência artificial, conhecimento especializado e condução prática para ajudar sua equipe a investigar o que acontece, conectar a experiência à operação e orientar transformações em serviços, processos, atendimento e produtos físicos ou digitais.</p>
          </details>
          <div className="v2-acoes">
            <a href="#v2-como-funciona" className="v2-botao">Ver como funciona</a>
            <span className="v2-nota">Acesso por convite durante a fase de testes.</span>
          </div>
        </div>

        <div className="v2-diagrama">
          <p className="v2-zona">{ACIMA}</p>
          <p className="v2-frase" aria-live="polite">{CICLO[ativo].frase}</p>
          <div className="v2-diagrama-linha">
            <Linha rotulo={false} />
            <ol className="v2-nos" aria-label="Ciclo de transformação">
              {CICLO.map((c, i) => (
                <li key={c.chave}>
                  <button type="button" aria-pressed={i === ativo} onClick={() => setAtivo(i)}>
                    <span className="v2-ponto" aria-hidden="true" />
                    <span className="v2-no-nome">{c.nome}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <p className="v2-linha-legenda" aria-hidden="true">linha de visibilidade</p>
          <ul className="v2-camadas-abaixo" aria-label="Abaixo da linha">
            {ABAIXO.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

const ICONES = [Clock3, LogOut, Repeat2, TrendingDown];
const CAMADAS = [
  { chave: "investigar", nome: "O que investigar" },
  { chave: "descobrir", nome: "Como descobrir" },
  { chave: "transformar", nome: "Onde transformar" },
] as const;

function Simulador() {
  const [sinal, setSinal] = useState(0);
  const [fundo, setFundo] = useState(1);
  const s = SINTOMAS[sinal];
  const escolher = (i: number) => { setSinal(i); setFundo(1); };
  return (
    <section className="v2-secao v2-simulador">
      <div className="v2-wrap">
        <p className="v2-marca-secao">O desafio das organizações</p>
        <h2>O que parece ser o problema pode ser apenas o sinal.</h2>
        <p className="v2-lead">Selecione uma situação e descubra quais perguntas podem orientar uma investigação, antes de decidir o que mudar.</p>
        <div className="v2-sinais" role="radiogroup" aria-label="Situações">
          {SINTOMAS.map((x, i) => {
            const I = ICONES[i];
            return (
              <button key={x.chave} type="button" role="radio" aria-checked={i === sinal} onClick={() => escolher(i)}>
                <I size={20} aria-hidden="true" /> {x.nome}
              </button>
            );
          })}
        </div>

        <div className="v2-palco">
          <div className="v2-acima">
            <span className="v2-rotulo">Sinal percebido</span>
            <p className="v2-sinal-texto">{s.sinal}</p>
          </div>
          <Linha />
          <ol className="v2-profundidade" aria-live="polite">
            {CAMADAS.slice(0, fundo).map((c, i) => (
              <li key={c.chave} className={`v2-camada v2-camada-${i + 1}`}>
                <span className="v2-rotulo">{c.nome}</span>
                <p>{s[c.chave]}</p>
              </li>
            ))}
          </ol>
          {fundo < CAMADAS.length ? (
            <button type="button" className="v2-descer" onClick={() => setFundo(fundo + 1)}>
              Descer uma camada: {CAMADAS[fundo].nome}
            </button>
          ) : (
            <p className="v2-pergunta">{s.pergunta}</p>
          )}
        </div>
        <p className="v2-nota">Estas são possibilidades de investigação, não causas identificadas. Cada desafio exige evidências e análise contextual.</p>
      </div>
    </section>
  );
}

function Etapa({ i }: { i: number }) {
  const e = ETAPAS[i];
  return (
    <div className="v2-etapa-conteudo">
      {e.planejada && <p className="v2-selo">Visão do funcionamento planejado • Em desenvolvimento</p>}
      <p className="v2-etapa-texto">{e.texto}</p>
      <div className="v2-dupla">
        <div><span className="v2-rotulo">O que você faz</span><p>{e.voce}</p></div>
        <div><span className="v2-rotulo">O que a plataforma organiza</span><p>{e.plataforma}</p></div>
      </div>
      <p className="v2-resultado"><span className="v2-rotulo">Resultado</span>{e.resultado}</p>
    </div>
  );
}

function LinhaDoTempo() {
  const [ativo, setAtivo] = useState(0);
  return (
    <section className="v2-secao v2-tempo" id="v2-como-funciona">
      <div className="v2-wrap">
        <p className="v2-marca-secao">Sua jornada de transformação</p>
        <h2>Você traz o desafio. Nós ajudamos a construir o caminho.</h2>
        <div className="v2-tempo-grade">
          <ol className="v2-tempo-lista">
            {ETAPAS.map((e, i) => (
              <li key={e.titulo} className={i === ativo ? "ativo" : undefined}>
                <button type="button" aria-expanded={i === ativo} aria-controls={`v2-etapa-${i}`} onClick={() => setAtivo(i)}>
                  <span className="v2-num" aria-hidden="true">{i + 1}</span>
                  <span className="v2-etapa-titulo">{e.titulo}</span>
                </button>
                {i === ativo && <div id={`v2-etapa-${i}`} className="v2-etapa-inline"><Etapa i={i} /></div>}
              </li>
            ))}
          </ol>
          <div className="v2-etapa-lado" aria-live="polite">
            <span className="v2-num-grande">{ativo + 1}</span>
            <h3>{ETAPAS[ativo].titulo}</h3>
            <Etapa i={ativo} />
          </div>
        </div>
        <p className="v2-destaque">Cada desafio pede perguntas e atividades diferentes. O percurso não é uma lista fixa: ele se adapta ao contexto e às evidências reunidas.</p>
      </div>
    </section>
  );
}

function Detalhe({ i, onProximo }: { i: number; onProximo: () => void }) {
  const e = ENTREGAVEIS[i];
  const prox = ENTREGAVEIS[(i + 1) % ENTREGAVEIS.length];
  return (
    <div className="v2-doc-detalhe">
      <span className="v2-etiqueta">{e.etiqueta}</span>
      <p className="v2-doc-descricao">{e.descricao}</p>
      <p className="v2-doc-previa">{e.previa}</p>
      <p>{e.detalhe}</p>
      <button type="button" className="v2-link" onClick={onProximo}>Explorar outro entregável: {prox.titulo}</button>
    </div>
  );
}

function Pasta() {
  const [ativo, setAtivo] = useState(0);
  const proximo = () => setAtivo((ativo + 1) % ENTREGAVEIS.length);
  return (
    <section className="v2-secao v2-pasta-secao">
      <div className="v2-wrap">
        <p className="v2-marca-secao">Do desafio à decisão</p>
        <h2>Conhecimento organizado para transformar, não apenas apresentar.</h2>
        <div className="v2-caso">
          <p className="v2-selo">Exemplo ilustrativo • Clínica Aurora (organização fictícia)</p>
          <h3>Da reclamação sobre a recepção a um caminho de melhoria.</h3>
          <p>Uma clínica fictícia percebe reclamações sobre demora e falta de informação na chegada. A equipe quer compreender o que acontece antes de decidir se precisa ampliar o número de atendentes.</p>
        </div>
        <ol className="v2-pasta" aria-label="Entregáveis do exemplo">
          {ENTREGAVEIS.map((e, i) => (
            <li key={e.titulo} className={i === ativo ? "ativo" : undefined} style={{ ["--i" as string]: i }}>
              <button type="button" aria-expanded={i === ativo} aria-controls="v2-doc" onClick={() => setAtivo(i)}>
                <span className="v2-doc-num" aria-hidden="true">{i + 1}</span>
                <span className="v2-doc-titulo">{e.titulo}</span>
              </button>
              {i === ativo && <div className="v2-doc-inline"><Detalhe i={i} onProximo={proximo} /></div>}
            </li>
          ))}
        </ol>
        <div id="v2-doc" className="v2-doc-lado" aria-live="polite">
          <h3>{ativo + 1}. {ENTREGAVEIS[ativo].titulo}</h3>
          <Detalhe i={ativo} onProximo={proximo} />
        </div>
        <p className="v2-nota">Exemplo demonstrativo com dados fictícios. O tipo de entrega e a profundidade dependem das evidências disponíveis.</p>
      </div>
    </section>
  );
}

export function Prototipo() {
  return (
    <div className="v2">
      <div className="v2-aviso">Protótipo de redesenho, não publicado</div>
      <header className="v2-cabecalho"><div className="v2-wrap"><span className="brand">DM | <span>Experience Intelligence</span></span></div></header>
      <Topo />
      <Simulador />
      <LinhaDoTempo />
      <Pasta />
    </div>
  );
}
