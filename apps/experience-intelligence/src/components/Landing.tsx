"use client";
// Landing comercial pública (UX-17, docs/product/landing-comercial/ e LANDING_COMERCIAL_PLANO.md).
// Sem formulário: entrar fica em /entrar/. Botões de interesse e consultoria ficam fora nesta fase (decisão de 21/10/2026).
import { useState } from "react";
import Link from "next/link";
import { Handshake, Laptop, ScanSearch, ShieldCheck, UserRoundCheck } from "lucide-react";
import { CabecalhoLanding } from "./landing/Cabecalho";
import {
  CamadasValor, CardsDiferenciais, CicloTransformacao, DemoDesafios, ExploradorSintomas, FiltroAplicacoes,
  JornadaStepper, PerguntasFrequentes, TrilhaEntregaveis,
} from "./landing/Interativos";
import { ANCORAS, CICLO, DADOS, PLANOS, type DemoChave } from "./landing/conteudo";
import { GA_ID, abrirPreferenciasCookies, medir } from "@/infrastructure/analytics";

function Secao({ id, tag, titulo, lead, escuro, suave, children }: {
  id?: string; tag: string; titulo: string; lead?: React.ReactNode; escuro?: boolean; suave?: boolean; children?: React.ReactNode;
}) {
  const classe = ["lp-secao", escuro && "lp-escuro", suave && "lp-suave"].filter(Boolean).join(" ");
  return (
    <section id={id} className={classe} aria-labelledby={id ? `${id}-titulo` : undefined}>
      <div className="lp-wrap">
        <p className="eyebrow">{tag}</p>
        <h2 id={id ? `${id}-titulo` : undefined} className="lp-titulo">{titulo}</h2>
        {lead && <div className="lp-lead">{lead}</div>}
        {children}
      </div>
    </section>
  );
}

function LinhaNos() {
  return (
    <ol className="lp-linha-nos" aria-label="Ciclo de transformação">
      {CICLO.map((c) => <li key={c.chave}>{c.nome}</li>)}
    </ol>
  );
}

export function Landing() {
  const [abaDemo, setAbaDemo] = useState<DemoChave>("saude");
  return (
    <div className="lp" id="inicio">
      {/* Sem JavaScript, os conteúdos de abas e perguntas ficam todos visíveis. */}
      <noscript><style>{".lp [hidden]{display:block !important}"}</style></noscript>
      <a href="#conteudo" className="pular">Pular para o conteúdo</a>
      <CabecalhoLanding />

      {/* 01 Hero */}
      <section className="lp-hero" id="conteudo" tabIndex={-1}>
        <div className="lp-wrap lp-hero-grade">
          <div>
            <p className="eyebrow">Inteligência para transformar experiências</p>
            <h1 className="lp-h1">Experiências melhores começam quando entendemos o que precisa mudar.</h1>
            <p className="lp-sub">Transforme desafios em caminhos concretos de melhoria para clientes, pacientes, usuários, colaboradores e todas as pessoas que se relacionam com sua organização.</p>
            <p className="lp-apoio">A DM | Experience Intelligence combina inteligência artificial, conhecimento especializado e condução prática para ajudar sua equipe a investigar o que acontece, conectar a experiência à operação e orientar transformações em serviços, processos, atendimento e produtos físicos ou digitais.</p>
            <p className="lp-micro">Você apresenta o desafio. A plataforma orienta os próximos passos, sem exigir conhecimentos de Service Design ou pesquisa.</p>
            <div className="lp-acoes">
              <a href="#como-funciona" className="btn btn-primary" onClick={() => medir("hero_cta_click", { botao: "ver_como_funciona" })}>Ver como funciona</a>
            </div>
            <p className="lp-nota">Acesso por convite durante a fase de testes.</p>
          </div>
          <CicloTransformacao />
        </div>
      </section>

      {/* 02 Dados */}
      <Secao tag="O desafio das organizações" titulo="O problema aparece na experiência. A causa pode estar em qualquer parte do serviço."
        lead={<p>Uma reclamação pode começar no atendimento, mas nascer de um processo confuso, uma informação desencontrada, uma decisão operacional ou uma tecnologia mal integrada. Tratar apenas o sintoma é correr o risco de investir na solução errada.</p>}>
        <ul className="lp-grade lp-grade-3">
          {DADOS.map((d) => (
            <li key={d.numero} className="lp-card lp-dado">
              <span className="lp-numero">{d.numero}</span>
              <span>{d.texto}</span>
              <details className="lp-sobre">
                <summary>Sobre a pesquisa</summary>
                <p>{d.fonte} <a href={d.url} target="_blank" rel="noopener noreferrer">Ver fonte</a></p>
              </details>
            </li>
          ))}
        </ul>
        <p className="lp-interpretacao">Esses números mostram o peso da experiência nas decisões de consumo. Para transformar essa realidade, é preciso descobrir o que produz cada experiência, e agir sobre isso.</p>
        <ExploradorSintomas />
      </Secao>

      {/* 03 Categoria */}
      <Secao suave tag="Mais do que medir. Mais do que digitalizar." titulo="Da percepção do problema à transformação do serviço."
        lead={<p>A DM | Experience Intelligence é uma plataforma de inteligência e melhoria contínua que orienta organizações na investigação de desafios reais. Ela conecta o que as pessoas vivenciam aos processos, equipes, decisões, ambientes e tecnologias que tornam essa experiência possível.</p>}>
        <p className="lp-destaque">O objetivo não é produzir mais dashboards. É ajudar sua organização a saber <b>o que investigar, por que investigar, como agir e o que acompanhar depois</b>.</p>
        <CamadasValor />
      </Secao>

      {/* 04 Como funciona */}
      <Secao id="como-funciona" tag="Sua jornada de transformação" titulo="Você traz o desafio. Nós ajudamos a construir o caminho."
        lead={<p>O ponto de partida não é um formulário padrão, uma técnica de pesquisa ou um mapa pronto. É a necessidade real da sua organização. A partir dela, a inteligência propõe e adapta uma investigação orientada por evidências.</p>}>
        <JornadaStepper />
        <p className="lp-destaque">Cada desafio pede perguntas e atividades diferentes. O percurso não é uma lista fixa: ele se adapta ao contexto e às evidências reunidas.</p>
      </Secao>

      {/* 05 Demonstração */}
      <Secao id="demonstracao" escuro tag="Veja a inteligência em contexto" titulo="O mesmo método de condução. Caminhos diferentes para cada desafio."
        lead={<p>Uma clínica, um produto digital e uma operação interna não precisam das mesmas perguntas. A plataforma parte da situação apresentada para definir o que investigar e como orientar sua equipe.</p>}>
        <DemoDesafios aba={abaDemo} onAba={setAbaDemo} />
      </Secao>

      {/* 06 Entregáveis */}
      <Secao tag="Do desafio à decisão" titulo="Conhecimento organizado para transformar, não apenas apresentar."
        lead={<p>Ao longo de uma investigação, sua organização constrói uma base de trabalho que conecta o problema inicial às descobertas e às decisões de melhoria. O nível de aprofundamento depende do desafio e da qualidade das informações reunidas.</p>}>
        <TrilhaEntregaveis />
      </Secao>

      {/* 07 Aplicações */}
      <Secao id="aplicacoes" suave tag="Uma abordagem. Diferentes realidades." titulo="Experiências não acontecem apenas em telas, nem em um único setor."
        lead={<><p>Sempre que pessoas interagem com um produto, serviço, processo ou organização, existe uma experiência a compreender e a possibilidade de transformá-la.</p><p>Escolha uma combinação para visualizar exemplos de desafios que a plataforma pode ajudar a investigar.</p></>}>
        <FiltroAplicacoes onVerExemplo={setAbaDemo} />
      </Secao>

      {/* 08 Diferenciais */}
      <Secao id="diferenciais" tag="O que nos move" titulo="Metodologia especializada nos bastidores. Direção clara para quem está na operação.">
        <CardsDiferenciais />
      </Secao>

      {/* 09 Plataforma + consultoria */}
      <Secao suave tag="Autonomia quando possível. Especialistas quando necessário." titulo="Sua equipe pode avançar sozinha. E contar com especialistas quando o desafio pedir mais."
        lead={<p>A DM | Experience Intelligence foi concebida para apoiar investigações e melhorias com autonomia. Em situações de maior complexidade, a Dani Moscatelli | Experience Design Studio pode aprofundar pesquisas, facilitar alinhamentos e apoiar o redesenho e a implementação de serviços.</p>}>
        <div className="lp-split">
          <div className="lp-split-card">
            <span className="etapa-icone" aria-hidden="true"><Laptop size={22} /></span>
            <span className="lp-rotulo">Plataforma</span>
            <h3 className="lp-h3">Inteligência para o dia a dia da organização.</h3>
            <ul>
              <li>Jornada guiada a partir do desafio.</li>
              <li>Orientações práticas e instrumentos contextualizados.</li>
              <li>Organização de evidências e oportunidades.</li>
              <li>Acompanhamento contínuo das melhorias.</li>
            </ul>
            <a href="#como-funciona" className="btn btn-ghost">Conhecer a plataforma</a>
          </div>
          <div className="lp-split-card lp-split-escuro">
            <span className="etapa-icone" aria-hidden="true"><Handshake size={22} /></span>
            <span className="lp-rotulo">Consultoria especializada</span>
            <h3 className="lp-h3">Profundidade para transformações complexas.</h3>
            <ul>
              <li>Pesquisa e diagnóstico conduzidos por especialistas.</li>
              <li>Análise de contextos, operações e relações entre áreas.</li>
              <li>Cocriação e redesenho de serviços e experiências.</li>
              <li>Facilitação e apoio à implementação e avaliação.</li>
            </ul>
          </div>
        </div>
        <p className="lp-faixa">Não é uma escolha definitiva: a consultoria pode potencializar o trabalho realizado na plataforma, sem substituir a autonomia da sua equipe.</p>
      </Secao>

      {/* 10 Responsabilidade */}
      <Secao escuro tag="Inteligência com responsabilidade" titulo="Boas decisões precisam de perguntas melhores, e evidências confiáveis."
        lead={<p>A inteligência artificial apoia a organização do desafio e a condução das atividades, mas não transforma suposições em fatos. O processo foi concebido para indicar lacunas de informação, respeitar contextos sensíveis e manter pessoas responsáveis pelas decisões.</p>}>
        <ul className="lp-grade lp-grade-3 lp-confianca-lista">
          <li><ShieldCheck size={24} aria-hidden="true" /><b>Privacidade primeiro.</b><span>Oriente o registro apenas das informações necessárias; evite dados pessoais e sensíveis não autorizados.</span></li>
          <li><ScanSearch size={24} aria-hidden="true" /><b>Evidências com contexto.</b><span>Relatos, registros e observações possuem limites diferentes; a análise precisa reconhecer isso.</span></li>
          <li><UserRoundCheck size={24} aria-hidden="true" /><b>Decisão humana.</b><span>Recomendações orientam a investigação e a transformação; não substituem responsabilidade profissional.</span></li>
        </ul>
        <p><Link href="/aviso-de-privacidade/" className="lp-link-claro">Aviso de privacidade</Link></p>
      </Secao>

      {/* 11 Planos */}
      <Secao id="planos" tag="Planos e acesso" titulo="Uma forma de evoluir experiências de acordo com a realidade da sua organização."
        lead={<p>Estamos estruturando as modalidades comerciais da DM | Experience Intelligence. A proposta é oferecer autonomia para o trabalho contínuo e opções de apoio especializado conforme a complexidade dos desafios.</p>}>
        <p className="lp-selo">Planos em definição • Acesso antecipado por convite</p>
        <ul className="lp-grade lp-grade-3">
          {PLANOS.map((p) => (
            <li key={p.nome} className="lp-card lp-plano">
              <span className="lp-etiqueta">Proposta em estudo</span>
              <h3 className="lp-h3">{p.nome}</h3>
              <span><b>Para quem:</b> {p.para}</span>
              <span><b>Proposta:</b> {p.proposta}</span>
              <span className="lp-preco">{p.preco}</span>
            </li>
          ))}
        </ul>
        <p className="lp-nota">Nomes, recursos e condições dos planos estão sujeitos a validação. A contratação ainda não está disponível nesta fase.</p>
      </Secao>

      {/* 12 FAQ */}
      <Secao id="perguntas" suave tag="FAQ" titulo="O que você precisa saber antes de começar.">
        <PerguntasFrequentes />
      </Secao>

      {/* 13 CTA final */}
      <section className="lp-final">
        <div className="lp-wrap">
          <p className="eyebrow">O próximo passo é seu</p>
          <h2 className="lp-titulo">Sua organização já tem um desafio. Vamos começar por ele?</h2>
          <p>Quando a experiência não funciona como deveria, cada informação pode ajudar a descobrir um caminho melhor. Conheça uma abordagem que conecta pessoas, operação e tecnologia para transformar desafios em oportunidades de evolução.</p>
          <LinhaNos />
          <Link href="/entrar/" className="btn btn-primary" onClick={() => medir("login_click", { local: "cta_final" })}>Entrar</Link>
          <p className="lp-micro">Acesso à plataforma limitado a pessoas convidadas nesta fase. Sem contratação automática.</p>
        </div>
      </section>

      {/* 14 Rodapé (a linha de copyright vem do rodapé padrão do app) */}
      <div className="lp-rodape">
        <div className="lp-wrap lp-rodape-grade">
          <div>
            <p className="brand">DM | <span>Experience Intelligence</span></p>
            <p>Um produto da Dani Moscatelli | Experience Design Studio.</p>
            <p className="lp-nota">Tecnologia e conhecimento para transformar experiências humanas.</p>
          </div>
          <nav aria-label="Rodapé" className="lp-rodape-nav">
            {ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`}>{a.rotulo}</a>)}
            <Link href="/entrar/" onClick={() => medir("login_click", { local: "rodape" })}>Entrar</Link>
          </nav>
          <div className="lp-rodape-nav">
            <Link href="/aviso-de-privacidade/">Aviso de privacidade</Link>
            <a href="https://danimoscatelli.com.br/" target="_blank" rel="noopener">Site do estúdio</a>
            {GA_ID && <button type="button" className="btn-link" onClick={abrirPreferenciasCookies}>Preferências de cookies</button>}
            <a href="#inicio">Voltar ao topo</a>
          </div>
        </div>
      </div>
    </div>
  );
}
