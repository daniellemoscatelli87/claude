// Landing page pública do produto (UX-16, docs/product/LANDING_PROPOSAL.md). Sem formulário: entrar fica em
// /entrar/ e o cadastro em /cadastro/. Copy aprovada pela dona do produto; dados de mercado com fonte.
import Link from "next/link";
import {
  Activity, Briefcase, CircleCheck, ClipboardList, Compass, HeartHandshake, Layers, MessageSquare,
  Route, Search, Sparkles, Target, TrendingUp, Users, type LucideIcon,
} from "lucide-react";

const FLUXO: [LucideIcon, string][] = [
  [Target, "Desafio"], [Search, "Investigação"], [ClipboardList, "Evidências"], [Sparkles, "Oportunidades"], [TrendingUp, "Transformação"],
];

const PROBLEMAS: [LucideIcon, string][] = [
  [MessageSquare, "Reclamações recorrentes sem causa clara"],
  [Route, "Processos que geram atrito"],
  [Layers, "Serviços que não evoluem"],
  [Activity, "Produtos digitais com baixa adesão"],
  [Briefcase, "Operações desalinhadas da experiência"],
  [Compass, "Falta de método para decidir melhorias"],
];

// Dados conferidos nas fontes originais em 21/10/2026 (ver LANDING_PROPOSAL.md, seção 5).
const ZENDESK = { nome: "Zendesk, CX Trends 2025", url: "https://www.zendesk.com/newsroom/articles/2025-cx-trends-report/" };
const PWC = { nome: "PwC, Future of Customer Experience Survey 2017/18", url: "https://www.pwc.com/ng/en/assets/pdf/experience-is-everything.pdf" };
const GALLUP = { nome: "Gallup, meta-análise 2020 (2,7 milhões de profissionais)", url: "https://www.gallup.com/workplace/236927/employee-engagement-meta-analysis.aspx" };
const SENACON = { nome: "Senacon, Boletim Consumidor.gov.br 2024", url: "https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor/defesadoconsumidor/Biblioteca/boletins-1/boletim-consumidor-gov-br-2024.pdf" };
const DADOS: { numero: string; texto: string; fonte: { nome: string; url: string } }[] = [
  { numero: "63%", texto: "dos consumidores trocariam de empresa por um concorrente depois de uma única experiência ruim.", fonte: ZENDESK },
  { numero: "49%", texto: "dos consumidores na América Latina deixariam uma marca depois de uma única experiência ruim.", fonte: PWC },
  { numero: "até 16%", texto: "a mais no preço é o que clientes aceitam pagar por produtos e serviços com uma ótima experiência.", fonte: PWC },
  { numero: "23%", texto: "mais lucratividade e 10% mais fidelização de clientes nas equipes mais engajadas, comparadas às menos engajadas.", fonte: GALLUP },
  { numero: "41%", texto: "menos defeitos de qualidade nas equipes mais engajadas, comparadas às menos engajadas.", fonte: GALLUP },
  { numero: "+10 milhões", texto: "de reclamações registradas no Consumidor.gov.br em 10 anos.", fonte: SENACON },
];

const VALOR: [LucideIcon, string, string][] = [
  [Target, "Comece pelo desafio", "Descreva o que precisa melhorar."],
  [Compass, "Investigue com direção", "A plataforma orienta o que descobrir, com quem falar, o que observar e como registrar."],
  [Sparkles, "Transforme com mais segurança", "As evidências ajudam a identificar oportunidades e orientar melhorias."],
  [TrendingUp, "Acompanhe resultados", "Entenda o que mudou e o que ainda precisa evoluir."],
];

const SEGMENTOS = ["Saúde", "Hospitalidade", "Educação", "Varejo", "Serviços", "Tecnologia", "Operações internas"];
const PUBLICOS = ["clientes", "consumidores", "pacientes", "colaboradores", "usuários", "parceiros"];
const TIPOS = ["atendimento", "processos", "serviços", "operação", "jornadas físicas", "jornadas digitais", "produtos digitais", "comunicação", "experiência interna"];

const ETAPAS: [string, string][] = [
  ["Desafio", "Você conta o que precisa melhorar."],
  ["Investigação", "A plataforma define o que precisa ser descoberto e orienta as próximas atividades."],
  ["Evidências", "As informações são organizadas para revelar padrões, lacunas e oportunidades."],
  ["Transformação", "As descobertas ajudam a orientar melhorias em serviços, processos, atendimento e operação."],
  ["Resultados", "Sua organização acompanha o impacto das mudanças e identifica novos ciclos de evolução."],
];

const ENTREGAS = [
  "Desafio estruturado", "Plano inicial de investigação", "Atividades guiadas", "Evidências organizadas",
  "Hipóteses e oportunidades", "Direcionamento para melhorias", "Histórico do projeto", "Base para tomada de decisão",
];

const COMPARACAO: [string, string][] = [
  ["Conduz a investigação passo a passo", "Atua em desafios mais complexos"],
  ["Organiza informações e evidências", "Aprofunda diagnóstico e estratégia"],
  ["Ajuda a orientar melhorias", "Facilita desenho de serviços e transformação"],
  ["Pode ser usada continuamente pela equipe", "Potencializa projetos críticos"],
  ["Escalável e recorrente", "Apoio especializado sob demanda"],
];

const DIFERENCIAIS: [LucideIcon, string, string][] = [
  [HeartHandshake, "Pessoas no centro", "Experiências humanas como ponto de partida da transformação."],
  [Layers, "Além do digital", "A solução considera serviços, processos, atendimento, operação e ambientes físicos."],
  [Compass, "Condução inteligente", "A plataforma orienta o usuário sobre o que fazer, como fazer e o que observar."],
  [Route, "Investigação adaptativa", "As etapas se desenham conforme o desafio e as evidências."],
  [Users, "Visão multidisciplinar", "Service Design, experiência, operações, negócios e tecnologia conectados."],
  [Briefcase, "Consultoria potencializadora", "Quando necessário, o estúdio entra para acelerar projetos mais complexos."],
];

const PLANOS: [string, string][] = [
  ["Essential", "Para organizações começando a estruturar investigações e melhorias."],
  ["Professional", "Para equipes que precisam de maior capacidade, profundidade e acompanhamento."],
  ["Transformation", "Para organizações que desejam plataforma + apoio consultivo especializado."],
];

const FAQ: [string, string][] = [
  ["A plataforma serve apenas para atendimento?", "Não. Ela pode apoiar investigações relacionadas a serviços, processos, operações, produtos digitais e experiências humanas em diferentes contextos."],
  ["Preciso conhecer Service Design ou pesquisa?", "Não. A plataforma foi pensada para orientar o usuário passo a passo."],
  ["A plataforma substitui uma consultoria?", "Ela pode operar de forma autônoma, mas a consultoria especializada continua disponível para desafios mais complexos."],
  ["Ela serve apenas para saúde?", "Não. A arquitetura é multissetorial, embora também possa ser aplicada a contextos como Patient Experience."],
  ["O que minha empresa recebe no final?", "Estruturação do desafio, atividades guiadas, evidências organizadas, direcionamento para melhorias e apoio à tomada de decisão."],
  ["Posso usar para produtos digitais?", "Sim. A plataforma também pode apoiar desafios de UX, fluxos digitais e jornadas em sistemas e plataformas."],
  ["Como funciona a entrada da IA?", "A inteligência atua para interpretar o desafio e orientar o percurso de investigação, dentro dos limites e configurações definidas pela plataforma."],
  ["Como a consultoria entra?", "Quando necessário, a plataforma pode ser complementada por apoio especializado da Dani Moscatelli Studio."],
];

function Icone({ icone: I }: { icone: LucideIcon }) {
  return <span className="etapa-icone" aria-hidden="true"><I size={22} /></span>;
}

function Secao({ id, tag, titulo, texto, children, suave }: { id?: string; tag?: string; titulo: string; texto?: React.ReactNode; children?: React.ReactNode; suave?: boolean }) {
  return (
    <section id={id} className={suave ? "lp-secao lp-suave" : "lp-secao"} aria-labelledby={id ? `${id}-titulo` : undefined}>
      <div className="lp-wrap">
        {tag && <p className="eyebrow">{tag}</p>}
        <h2 id={id ? `${id}-titulo` : undefined} className="lp-titulo">{titulo}</h2>
        {texto && <div className="lp-texto">{texto}</div>}
        {children}
      </div>
    </section>
  );
}

export function Landing() {
  return (
    <div className="lp">
      <section className="lp-hero">
        <div className="lp-wrap">
          <p className="eyebrow">Inteligência para transformar experiências</p>
          <h1 className="lp-h1">Transforme desafios em melhorias reais para clientes, pacientes, usuários e colaboradores.</h1>
          <p className="lp-sub">A DM | Experience Intelligence ajuda sua organização a compreender experiências, investigar causas, identificar oportunidades e orientar melhorias em serviços, processos, operações e produtos digitais.</p>
          <div className="lp-acoes">
            <Link href="/cadastro/" className="btn btn-primary">Começar agora</Link>
            <a href="#planos" className="btn btn-ghost">Ver planos</a>
          </div>
          <p className="lp-confianca">Sem precisar dominar Service Design, pesquisa ou metodologias de inovação.</p>
          <ol className="lp-fluxo" aria-label="Como a jornada avança">
            {FLUXO.map(([I, nome]) => <li key={nome}><I size={18} aria-hidden="true" /> {nome}</li>)}
          </ol>
        </div>
      </section>

      <Secao id="problema" titulo="Experiências ruins custam caro. E quase sempre o problema não está só no atendimento." texto={<>
        <p>Empresas costumam perceber sintomas (reclamações, retrabalho, perda de clientes, baixa adesão, quedas na satisfação, falhas operacionais) sem conseguir identificar com clareza o que está provocando esses problemas.</p>
        <p>Melhorar experiências exige conectar o que as pessoas vivenciam com aquilo que a organização precisa transformar.</p>
      </>}>
        <ul className="lp-grade lp-grade-3">
          {PROBLEMAS.map(([I, t]) => <li key={t} className="lp-card lp-card-linha"><Icone icone={I} /><b>{t}</b></li>)}
        </ul>
        <h3 className="lp-subtitulo">O que os dados mostram</h3>
        <ul className="lp-grade lp-grade-3">
          {DADOS.map((d) => (
            <li key={d.numero + d.texto} className="lp-card lp-dado">
              <span className="lp-numero">{d.numero}</span>
              <span>{d.texto}</span>
              <a href={d.fonte.url} target="_blank" rel="noopener noreferrer" className="lp-fonte">Fonte: {d.fonte.nome}</a>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao id="produto" suave titulo="Uma plataforma para investigar, compreender e transformar experiências." texto={<>
        <p>A DM | Experience Intelligence é uma plataforma que conduz sua organização por uma jornada estruturada de investigação e melhoria contínua.</p>
        <p>Ela combina inteligência artificial, metodologia, estrutura analítica e orientação prática para ajudar equipes a transformar desafios em decisões, ações e resultados.</p>
      </>}>
        <ul className="lp-grade lp-grade-4">
          {VALOR.map(([I, t, d]) => <li key={t} className="lp-card"><Icone icone={I} /><b>{t}</b><span>{d}</span></li>)}
        </ul>
      </Secao>

      <Secao id="para-quem" titulo="Feita para organizações que precisam melhorar experiências de ponta a ponta.">
        <div className="lp-grupos">
          <div><h3 className="lp-subtitulo">Segmentos</h3><ul className="lp-chips">{SEGMENTOS.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h3 className="lp-subtitulo">A plataforma pode ser usada para melhorar experiências de</h3><ul className="lp-chips">{PUBLICOS.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h3 className="lp-subtitulo">Tipos de desafio</h3><ul className="lp-chips">{TIPOS.map((s) => <li key={s}>{s}</li>)}</ul></div>
        </div>
      </Secao>

      <Secao id="como-funciona" suave titulo="Como a plataforma funciona na prática">
        <ol className="lp-etapas">
          {ETAPAS.map(([t, d], i) => <li key={t}><span className="lp-passo" aria-hidden="true">{i + 1}</span><div><b>{t}</b><span>{d}</span></div></li>)}
        </ol>
        <p className="lp-destaque">A plataforma conduz a jornada sem exigir que o cliente saiba aplicar métodos de Service Design.</p>
      </Secao>

      <Secao id="entregas" titulo="Ao final, sua organização não recebe apenas respostas. Recebe direção."
        texto={<p>Dependendo da maturidade do processo e da profundidade da investigação, a plataforma ajuda a sair de percepções soltas para uma compreensão mais clara do que precisa ser transformado.</p>}>
        <ul className="lp-grade lp-grade-4">
          {ENTREGAS.map((t) => <li key={t} className="lp-card lp-card-linha lp-entrega"><CircleCheck size={20} aria-hidden="true" /><b>{t}</b></li>)}
        </ul>
      </Secao>

      <Secao id="consultoria" suave titulo="Plataforma quando sua equipe precisa de autonomia. Consultoria quando o desafio exige profundidade adicional."
        texto={<p>A plataforma foi desenhada para funcionar de forma independente, mas também pode ser potencializada com o apoio especializado da Dani Moscatelli Studio em desafios que exigem aprofundamento estratégico, facilitação e transformação organizacional.</p>}>
        <table className="lp-tabela">
          <thead><tr><th scope="col">Plataforma</th><th scope="col">Consultoria especializada</th></tr></thead>
          <tbody>{COMPARACAO.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
        <div className="lp-comparacao-celular">
          <div className="lp-card"><b>Plataforma</b><ul>{COMPARACAO.map(([a]) => <li key={a}>{a}</li>)}</ul></div>
          <div className="lp-card"><b>Consultoria especializada</b><ul>{COMPARACAO.map(([, b]) => <li key={b}>{b}</li>)}</ul></div>
        </div>
      </Secao>

      <Secao id="diferenciais" titulo="O que torna a DM | Experience Intelligence diferente">
        <ul className="lp-grade lp-grade-3">
          {DIFERENCIAIS.map(([I, t, d]) => <li key={t} className="lp-card"><Icone icone={I} /><b>{t}</b><span>{d}</span></li>)}
        </ul>
      </Secao>

      <Secao id="planos" suave titulo="Planos para diferentes momentos de maturidade">
        <ul className="lp-grade lp-grade-3">
          {PLANOS.map(([t, d]) => <li key={t} className="lp-card lp-plano"><b>{t}</b><span>{d}</span><span className="lp-preco">Em definição</span></li>)}
        </ul>
      </Secao>

      <Secao id="perguntas" titulo="Perguntas frequentes">
        <div className="lp-faq">
          {FAQ.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}
        </div>
      </Secao>

      <section className="lp-final">
        <div className="lp-wrap">
          <h2 className="lp-titulo">Pronto para transformar desafios em experiências melhores?</h2>
          <p>Comece com o que sua organização deseja melhorar. A plataforma ajudará a organizar o caminho.</p>
          <Link href="/cadastro/" className="btn btn-primary">Criar minha conta</Link>
        </div>
      </section>
    </div>
  );
}
