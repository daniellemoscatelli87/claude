export interface Bi {
  pt: string;
  en: string;
}

export interface Artifact {
  kind: 'canvas' | 'journey' | 'persona' | 'research' | 'system' | 'prototype' | 'pitch' | 'blueprint';
  label: Bi;
}

export interface FlagshipCase {
  slug: string;
  tier: 'flagship';
  client: string;
  period: Bi;
  sectors: string[];
  disciplines: string[];
  title: Bi;
  summary: Bi;
  context: Bi;
  approach: { pt: string[]; en: string[] };
  results: Bi[];
  recognition?: Bi;
  artifacts: Artifact[];
}

export interface ArchiveCase {
  slug: string;
  tier: 'archive';
  client: string;
  period: Bi;
  oneLiner: Bi;
  keywords: string[];
}

export interface VaultCase {
  slug: string;
  tier: 'vault';
  client: string;
  period: Bi;
  title: Bi;
  teaser: Bi;
  full: Bi;
  disciplines: string[];
}

export const flagshipCases: FlagshipCase[] = [
  {
    slug: 'circular-brain',
    tier: 'flagship',
    client: 'Circular Brain',
    period: { pt: 'Mar — Mai 2025', en: 'Mar — May 2025' },
    sectors: ['ESG', 'Economia Circular', 'Indústria'],
    disciplines: ['Product Discovery', 'Business Design', 'Pesquisa de Mercado'],
    title: {
      pt: 'De operadora de logística reversa a "laboratório de economia circular" — uma tese validada publicamente pelo próprio CEO.',
      en: 'From reverse-logistics operator to "circular economy lab" — a thesis later validated in public by the client\'s own CEO.',
    },
    summary: {
      pt: 'Strategic Product Discovery para identificar oportunidades de monetização no pós-venda de fabricantes de eletroeletrônicos.',
      en: 'Strategic Product Discovery to uncover post-sale monetisation opportunities for electronics manufacturers.',
    },
    context: {
      pt: 'Conduzi um Strategic Product Discovery com entrevistas em profundidade em 7 empresas (Login Informática, Mallory, Elsys, Philips Walita, Epson, Fame e Lity Brasil) para entender o baixo nível de maturidade digital e analítica que travava a circularidade em escala no setor.',
      en: 'I ran a Strategic Product Discovery with in-depth interviews across 7 companies (Login Informática, Mallory, Elsys, Philips Walita, Epson, Fame and Lity Brasil) to understand the low digital and analytics maturity holding back circularity at scale.',
    },
    approach: {
      pt: [
        'Assessment: desk research, Business Model Canvas e SWOT',
        'Discovery: roteiros e entrevistas em profundidade com 7 fabricantes',
        'Análise e clusterização de 221 dores de mercado com apoio de IA',
        'Diagnóstico de maturidade Digital, Analítica e ESG',
        'Recomendações estratégicas de monetização',
      ],
      en: [
        'Assessment: desk research, Business Model Canvas and SWOT',
        'Discovery: in-depth interview scripts with 7 manufacturers',
        'AI-assisted clustering of 221 market pain points',
        'Digital, Analytics and ESG maturity diagnosis',
        'Strategic monetisation recommendations',
      ],
    },
    results: [
      {
        pt: 'Recomendei o reposicionamento de operadora de logística reversa para parceira estratégica de transformação circular → em ago/25 a empresa lançou "Circularidade como Serviço" e passou a se comunicar como "laboratório de economia circular".',
        en: 'Recommended repositioning from reverse-logistics operator to strategic partner in circular transformation → in Aug/25 the client launched "Circularity as a Service" and began presenting itself as a "circular economy lab".',
      },
      {
        pt: 'Identifiquei a ausência de engajamento do consumidor final como oportunidade B2C → em set/25 a empresa lançou a plataforma "Multiplicadores Circulares", com meta de 1 milhão de pessoas impactadas até 2026.',
        en: 'Identified the lack of end-consumer engagement as a B2C opportunity → in Sep/25 the client launched the "Multiplicadores Circulares" platform, targeting 1M people reached by 2026.',
      },
      {
        pt: 'Apontei a maturidade digital/analítica como pré-requisito para ESG real → em jan/26 o CEO publicou artigo defendendo essa mesma tese publicamente.',
        en: 'Flagged digital/analytics maturity as a precondition for real ESG → in Jan/26 the CEO publicly published an article defending that exact thesis.',
      },
    ],
    recognition: {
      pt: 'Reconhecido pelo ESG Inside (set/2025) pelo lançamento da plataforma "Multiplicadores Circulares", fruto direto das recomendações deste discovery.',
      en: 'Featured by ESG Inside (Sep/2025) for launching the "Multiplicadores Circulares" platform, a direct result of this discovery.',
    },
    artifacts: [
      { kind: 'canvas', label: { pt: 'Business Model Canvas', en: 'Business Model Canvas' } },
      { kind: 'research', label: { pt: 'Clusterização de 221 dores', en: 'Clustering of 221 pain points' } },
      { kind: 'pitch', label: { pt: 'Diagnóstico de maturidade ESG', en: 'ESG maturity diagnosis' } },
    ],
  },
  {
    slug: 'safe-go-tur',
    tier: 'flagship',
    client: 'Safe Go Tur',
    period: { pt: 'Nov — Dez 2025', en: 'Nov — Dec 2025' },
    sectors: ['Turismo'],
    disciplines: ['Pesquisa de Mercado', 'Business Design', 'Estratégia de Investimento'],
    title: {
      pt: 'Quando o orçamento não cabia no discovery, redesenhei o problema: transformei uma restrição em alavanca para captação de investimento.',
      en: 'When the budget couldn\'t cover full discovery, I redesigned the problem: turned a constraint into an investment-raising lever.',
    },
    summary: {
      pt: 'Pesquisa de mercado, diagnóstico da solução atual e pitch estratégico para viabilizar investimento e expansão.',
      en: 'Market research, current-solution diagnosis and strategic pitch to unlock investment and expansion.',
    },
    context: {
      pt: 'A demanda original era um Product Discovery completo. Diante de restrições orçamentárias, redesenhei a abordagem para uma pesquisa de mercado aprofundada e diagnóstico da solução atual, com foco em viabilizar captação de investimento para evolução do MVP e expansão para novos mercados, usando a metodologia proprietária Phoenix Lab.',
      en: 'The original ask was a full Product Discovery. Facing budget constraints, I redesigned the approach into deep market research and a diagnosis of the existing solution, focused on unlocking investment for MVP evolution and expansion — using the proprietary Phoenix Lab methodology.',
    },
    approach: {
      pt: [
        'Assessment estratégico: mercado, benchmarking, forças, fraquezas e tendências emergentes',
        'Mapeamento de jornada da solução atual (gargalos e pontos de valor)',
        'Visão de futuro: narrativa estratégica de expansão para novos mercados e modelos de negócio',
        'Estruturação de pitch orientado à captação de investimento',
      ],
      en: [
        'Strategic assessment: market, benchmarking, strengths, weaknesses and emerging trends',
        'Journey mapping of the existing solution (bottlenecks and value points)',
        'Future vision: strategic narrative for expansion into new markets and business models',
        'Investor-facing pitch structuring',
      ],
    },
    results: [
      {
        pt: 'Viabilizou o reposicionamento estratégico da Safe Go, transformando uma limitação orçamentária em alavanca para captação de investimento.',
        en: 'Enabled Safe Go\'s strategic repositioning, turning a budget limitation into an investment-raising lever.',
      },
      {
        pt: 'Ampliou a visão de produto e criou bases sólidas para expansão orientada ao mercado.',
        en: 'Broadened the product vision and built solid foundations for market-driven expansion.',
      },
    ],
    artifacts: [
      { kind: 'research', label: { pt: 'Pesquisa de mercado competitivo', en: 'Competitive market research' } },
      { kind: 'journey', label: { pt: 'Jornada da solução atual (AS IS)', en: 'Current-state journey (AS IS)' } },
      { kind: 'pitch', label: { pt: 'Pitch deck para investidores', en: 'Investor pitch deck' } },
    ],
  },
  {
    slug: 'evup-innovation-lab',
    tier: 'flagship',
    client: 'Evup',
    period: { pt: 'Jan — Dez 2024', en: 'Jan — Dec 2024' },
    sectors: ['Healthtech', 'Beautytech'],
    disciplines: ['Research Ops', 'Design Ops', 'Product Discovery', 'Liderança Organizacional'],
    title: {
      pt: 'Construí um departamento de inovação do zero e usei o CRM carro-chefe da empresa como prova viva de que o novo processo funcionava.',
      en: 'Built an innovation department from scratch and used the company\'s flagship CRM as living proof the new process worked.',
    },
    summary: {
      pt: 'Innovation Lab, Research Ops/Design Ops e Product Discovery do CRM Connect 2.0, elevando a maturidade de design em 3 níveis em 6 meses.',
      en: 'Innovation Lab, Research Ops/Design Ops, and Product Discovery for the Connect 2.0 CRM, raising design maturity by 3 levels in 6 months.',
    },
    context: {
      pt: 'Fui contratada para estruturar do zero o departamento de inovação de uma healthtech/beautytech de R$150 bi, com a missão de criar governança, processos e cultura de design orientados à experiência do cliente — usando o Connect, principal produto da empresa, como piloto dessa nova visão.',
      en: 'Hired to build the innovation department from scratch at a R$150bn healthtech/beautytech, with a mandate to create governance, process and a customer-experience-driven design culture — using Connect, the company\'s core product, as the pilot for this new vision.',
    },
    approach: {
      pt: [
        'Innovation Lab com governança de design e base de conhecimento proprietária',
        'Framework Quad Diamond: negócios, design, dados, desenvolvimento, qualidade e IA',
        'Redefinição de missão, visão e valores por co-criação',
        'Discovery do Connect 2.0: SUS, heurísticas ISO 9241-11, entrevistas, NPS, personas, Lean Inception, JTBD',
        'Priorização com Matriz Impacto vs. Esforço e Kano Model',
        'KPIs definidos: TSR, TOT, CES, CSAT',
      ],
      en: [
        'Innovation Lab with design governance and a proprietary knowledge base',
        'Quad Diamond framework: business, design, data, engineering, quality and AI',
        'Mission, vision and values redefined through co-creation',
        'Connect 2.0 discovery: SUS testing, ISO 9241-11 heuristics, interviews, NPS, personas, Lean Inception, JTBD',
        'Prioritisation via Impact vs. Effort matrix and Kano Model',
        'KPIs defined: TSR, TOT, CES, CSAT',
      ],
    },
    results: [
      { pt: 'Maturidade de design elevada em 3 níveis em 6 meses.', en: 'Design maturity raised 3 levels in 6 months.' },
      { pt: '+20% de engajamento interno em 3 meses após a redefinição cultural.', en: '+20% internal engagement within 3 months of the culture reset.' },
      { pt: 'MVP do Connect 2.0 validado e escalável, com KPIs contínuos definidos.', en: 'Connect 2.0 MVP validated and scalable, with continuous KPIs defined.' },
      { pt: 'Bonificada e reconhecida com menção honrosa pelas iniciativas de inovação (EVUP, 2024).', en: 'Awarded a bonus and honourable mention for innovation initiatives (EVUP, 2024).' },
    ],
    artifacts: [
      { kind: 'system', label: { pt: 'Framework Quad Diamond', en: 'Quad Diamond framework' } },
      { kind: 'persona', label: { pt: 'Personas e jornadas (Connect 2.0)', en: 'Personas & journeys (Connect 2.0)' } },
      { kind: 'research', label: { pt: 'Base de conhecimento de Research Ops', en: 'Research Ops knowledge base' } },
    ],
  },
  {
    slug: 'atacadao-carrefour',
    tier: 'flagship',
    client: 'Atacadão · Grupo Carrefour',
    period: { pt: 'Jan 2022 — Mar 2023', en: 'Jan 2022 — Mar 2023' },
    sectors: ['E-commerce', 'Marketplace'],
    disciplines: ['Product Delivery', 'Design System', 'Gestão de Contas'],
    title: {
      pt: 'Assumi uma conta prestes a quebrar e a transformei em case de sucesso: NPS de 2 para 10 e contrato dobrado.',
      en: 'Took over an account on the brink of collapse and turned it into a success story: NPS from 2 to 10, contract value doubled.',
    },
    summary: {
      pt: 'Recuperação estratégica de relacionamento, Design System e Product Delivery para o marketplace do Atacadão.',
      en: 'Strategic relationship recovery, Design System and Product Delivery for the Atacadão marketplace.',
    },
    context: {
      pt: 'Assumi um contrato em risco de quebra, com o Product Discovery já definido, focado em melhorar a experiência da persona PJ (público principal) no marketplace e em desenvolver um app para a persona PF, visando expandir o mercado.',
      en: 'Took over a contract at risk of termination, with Product Discovery already defined, focused on improving the marketplace experience for the primary B2B persona and building an app for the secondary B2C persona to expand reach.',
    },
    approach: {
      pt: [
        'Restauração estratégica: processos claros, prazos cumpridos, acesso executivo reconstruído',
        'Design System liderado e documentado para o time de desenvolvimento do cliente',
        'Estruturação do 1º plano de tagueamento da Gauge, viabilizando métricas de continuous delivery',
        'Parceria direta com a Cotabest (tecnologia) para antecipar entregas',
        'Gestão de backlog priorizada com Impacto vs. Esforço',
      ],
      en: [
        'Strategic recovery: clear processes, deadlines met, executive-level access rebuilt',
        'Led and documented a Design System for the client\'s development team',
        "Structured Gauge's first tagging/analytics plan, enabling continuous-delivery metrics",
        'Direct partnership with Cotabest (engineering) to pull delivery forward',
        'Backlog managed with Impact vs. Effort prioritisation',
      ],
    },
    results: [
      { pt: 'NPS do cliente elevado de 2 para 10 em 12 meses.', en: "Client NPS lifted from 2 to 10 in 12 months." },
      { pt: 'Satisfação do cliente +50% e contrato dobrado.', en: 'Client satisfaction +50% and contract value doubled.' },
      { pt: 'Entrega do projeto de Product Delivery antecipada em 1 mês e meio.', en: 'Product Delivery project shipped 6 weeks ahead of schedule.' },
      { pt: 'Bonificada pelo desempenho como líder do contrato em 2022.', en: 'Awarded a performance bonus as account lead in 2022.' },
    ],
    artifacts: [
      { kind: 'system', label: { pt: 'Design System documentado', en: 'Documented Design System' } },
      { kind: 'prototype', label: { pt: 'Protótipos navegáveis', en: 'Clickable prototypes' } },
    ],
  },
  {
    slug: 'fujifilm-transformacao-digital',
    tier: 'flagship',
    client: 'FujiFilm Brasil',
    period: { pt: 'Set 2021 — Fev 2022', en: 'Sep 2021 — Feb 2022' },
    sectors: ['Indústria'],
    disciplines: ['Service Design', 'Design Organizacional', 'Mudança Cultural'],
    title: {
      pt: 'Transformação organizacional em 4 pilares — humano, organizacional, estratégico e sistêmico — reconhecida com o prêmio Líder do Ano.',
      en: 'Organisational transformation across 4 pillars — human, organisational, strategic, systemic — recognised with the Leader of the Year award.',
    },
    summary: {
      pt: 'Service Design e Design Organizacional aplicados a processos, cultura e liderança, com ganhos mensuráveis de eficiência.',
      en: 'Service Design and Organisational Design applied to process, culture and leadership, with measurable efficiency gains.',
    },
    context: {
      pt: 'Liderei uma transformação organizacional abrangente, guiando um time inicialmente júnior na aplicação de design thinking de serviços para tornar a FujiFilm Brasil mais ágil, orientada por dados e colaborativa — mentorando a equipe com o conceito de Healthy Design para criar um ambiente seguro para trocar informações sensíveis.',
      en: 'Led a comprehensive organisational transformation, guiding an initially junior team through service design thinking to make FujiFilm Brasil more agile, data-informed and collaborative — mentoring the team using the Healthy Design concept to create a safe environment for sensitive information.',
    },
    approach: {
      pt: [
        'Automação e otimização de processos-chave',
        'Integração departamental cross-funcional',
        'Cultura data-informed e OKRs alinhados a objetivos corporativos',
        'Estruturação de RH 4.0 focada em retenção e experiência do colaborador',
        'Mentoria técnica de time júnior para atuar em iniciativas de alto impacto',
      ],
      en: [
        'Automation and optimisation of key processes',
        'Cross-functional departmental integration',
        'Data-informed culture and OKRs aligned to corporate goals',
        'RH 4.0 structure focused on retention and employee experience',
        'Technical mentoring of a junior team for high-impact initiatives',
      ],
    },
    results: [
      { pt: '40% de redução no tempo médio de aprovação de processos.', en: '40% reduction in average process approval time.' },
      { pt: '35% de redução em retrabalho e custos.', en: '35% reduction in rework and costs.' },
      { pt: '30% de melhoria no cumprimento de prazos; 25% de aumento na eficiência geral.', en: '30% improvement in on-time delivery; 25% overall efficiency gain.' },
      { pt: '60% de redução na resistência cultural à mudança.', en: '60% reduction in cultural resistance to change.' },
      { pt: 'Prêmio Líder do Ano 2021 (Gauge — Stefanini Brasil).', en: 'Leader of the Year 2021 award (Gauge — Stefanini Brasil).' },
    ],
    recognition: {
      pt: 'Case do Ano — Gauge, com feedback formal do cliente.',
      en: 'Case of the Year — Gauge, with formal client feedback.',
    },
    artifacts: [
      { kind: 'blueprint', label: { pt: 'Blueprint de serviço (4 pilares)', en: 'Service blueprint (4 pillars)' } },
      { kind: 'system', label: { pt: 'Framework de OKRs organizacionais', en: 'Organisational OKR framework' } },
    ],
  },
  {
    slug: 'farmacias-app',
    tier: 'flagship',
    client: 'Farmácias APP | Delivery | By GrupoSC',
    period: { pt: 'Jan 2016 — Mar 2020', en: 'Jan 2016 — Mar 2020' },
    sectors: ['E-commerce', 'Healthtech'],
    disciplines: ['UX/UI End-to-End', 'Design System', 'Growth'],
    title: {
      pt: 'Sozinha, desenhei o primeiro marketplace farmacêutico do mundo com checkout simultâneo — reconhecido por Band, Exame e TecMundo.',
      en: "Designed, solo, the world's first pharmacy marketplace with simultaneous checkout — featured by Band, Exame and TecMundo.",
    },
    summary: {
      pt: 'Design end-to-end (web, app, backoffice) e checkout simultâneo pioneiro, com crescimento de 938% nas transações.',
      en: 'End-to-end design (web, app, back-office) and pioneering simultaneous checkout, driving 938% transaction growth.',
    },
    context: {
      pt: 'Fui a única designer responsável por todas as etapas do processo — guidelines de experiência, protótipos navegáveis e handoff — durante 2 anos e meio de atuação intensiva, dentro de um projeto de mais de 4 anos.',
      en: 'I was the sole designer responsible for every stage — experience guidelines, clickable prototypes and handoff — across 2.5 years of intensive ownership within a 4+ year engagement.',
    },
    approach: {
      pt: [
        'Checkout simultâneo: compras de múltiplos fornecedores numa única transação, com múltiplos métodos de pagamento',
        'Design System inicial num momento em que o conceito ainda era pouco difundido no Brasil',
        'Fluxos personalizados por histórico de compras, reduzindo abandono de carrinho',
        'Análises heurísticas, testes de usabilidade e benchmarks de concorrentes',
      ],
      en: [
        'Simultaneous checkout: purchases from multiple suppliers in a single transaction, multiple payment methods',
        'Early Design System at a time the concept was barely known in Brazil',
        'Purchase-history-based personalised flows, reducing cart abandonment',
        'Heuristic analysis, usability testing and competitor benchmarking',
      ],
    },
    results: [
      { pt: '938% de crescimento nas transações mobile durante a pandemia.', en: '938% growth in mobile transactions during the pandemic.' },
      { pt: 'Base de farmácias cadastradas expandida em 2,5x.', en: '2.5x expansion in registered pharmacies.' },
      { pt: 'Destaque em Band, TecMundo, Exame, Canaltech e Gizmodo.', en: 'Featured by Band, TecMundo, Exame, Canaltech and Gizmodo.' },
    ],
    recognition: {
      pt: 'Primeiro marketplace de farmácias do mundo com compra multi-fornecedor em uma única transação — pioneiro, antes do Mercado Livre.',
      en: "World's first pharmacy marketplace with multi-supplier single-transaction checkout — pioneering, ahead of Mercado Livre.",
    },
    artifacts: [
      { kind: 'system', label: { pt: 'Design System (web + mobile)', en: 'Design System (web + mobile)' } },
      { kind: 'journey', label: { pt: 'Jornada de checkout simultâneo', en: 'Simultaneous checkout journey' } },
    ],
  },
  {
    slug: 'selecty',
    tier: 'flagship',
    client: 'Selecty Tecnologia para RH',
    period: { pt: 'Set 2018 — Jun 2019', en: 'Sep 2018 — Jun 2019' },
    sectors: ['RH Tech'],
    disciplines: ['Interaction Design', 'Service Design', 'IA Aplicada'],
    title: {
      pt: 'Desenhei um processo seletivo mais humano usando IA — destaque na Band Cidade pela redução de estresse entre recrutadores.',
      en: 'Designed a more human hiring process powered by AI — featured on Band Cidade for reducing recruiter stress.',
    },
    summary: {
      pt: 'Automação humanizada do recrutamento: triagem, matching e análise comportamental com IA.',
      en: 'Humanised recruitment automation: screening, matching and behavioural analysis with AI.',
    },
    context: {
      pt: 'Como consultora de Design de Interação e Serviços, analisei a tática corporativa e mapeei dores do processo seletivo para definir uma visão de produto clara e ambiciosa para a Selecty.',
      en: 'As Interaction and Service Design consultant, I analysed corporate strategy and mapped recruitment pain points to define a clear, ambitious product vision for Selecty.',
    },
    approach: {
      pt: [
        'Fluxos de jornada e wireframes aproximando negócio e tecnologia',
        'Prototipação de alta fidelidade com componentes padronizados',
        'Triagem automática de vagas e matching automático',
        'Admissão online unificada com feedback para todos os candidatos',
      ],
      en: [
        'Journey flows and wireframes bridging business and engineering',
        'High-fidelity prototyping with standardised components',
        'Automatic job screening and matching',
        'Unified online admission with feedback to every candidate',
      ],
    },
    results: [
      { pt: 'Divulgação de vagas acelerada e candidatos mais qualificados atraídos.', en: 'Faster job publishing and more qualified candidates attracted.' },
      { pt: 'Processos de recrutamento mais rápidos e humanizados.', en: 'Faster, more humanised recruitment processes.' },
    ],
    recognition: {
      pt: 'Destaque no Paraná em Pauta e na Band Cidade como plataforma de seleção humanizada via inteligência artificial.',
      en: 'Featured on Paraná em Pauta and Band Cidade as an AI-powered, humanised selection platform.',
    },
    artifacts: [
      { kind: 'journey', label: { pt: 'Jornada de recrutador e candidato', en: 'Recruiter & candidate journey' } },
      { kind: 'prototype', label: { pt: 'Protótipos de alta fidelidade', en: 'High-fidelity prototypes' } },
    ],
  },
  {
    slug: '4vants-4cap',
    tier: 'flagship',
    client: '4VANTS',
    period: { pt: 'Dez 2020 — Set 2021', en: 'Dec 2020 — Sep 2021' },
    sectors: ['Indústria', 'Energia'],
    disciplines: ['Interaction Design', 'Service Design', 'IA Aplicada'],
    title: {
      pt: 'Projetei um app de inspeção com IA para condições extremas de campo, aumentando segurança e reduzindo custos operacionais.',
      en: 'Designed an AI inspection app for extreme field conditions, raising safety and cutting operational costs.',
    },
    summary: {
      pt: '4CAP: app de inspeção de ativos via drone com inteligência artificial, para locais remotos e sem conexão.',
      en: '4CAP: a drone-based, AI-powered asset inspection app for remote, offline locations.',
    },
    context: {
      pt: 'Liderei a experiência de produto do 4CAP, solucionando problemas de inspeção lenta, alto risco e baixa assertividade em locais remotos, sem conexão, com iluminação inadequada e tempo limitado.',
      en: 'Led product experience for 4CAP, solving slow, high-risk, low-accuracy inspection in remote, offline locations with poor lighting and tight time windows.',
    },
    approach: {
      pt: [
        'Cultura de design com processos definidos priorizando as necessidades dos clientes',
        'Design System para escalabilidade e handoff multiplataforma',
        'Protótipos com testes de usabilidade e entrevistas com engenheiros e técnicos',
        'Adaptação da interface a contextos extremos de campo',
      ],
      en: [
        'Design culture with defined processes prioritising client needs',
        'Design System for scalability and multi-platform handoff',
        'Prototypes with usability testing and interviews with field engineers',
        'Interface adapted for extreme field contexts',
      ],
    },
    results: [
      { pt: 'Maior confiabilidade de laudos técnicos e segurança operacional.', en: 'Greater reliability of technical reports and operational safety.' },
      { pt: 'Redução de custos operacionais e fidelização de contas estratégicas.', en: 'Lower operational costs and stronger strategic-account retention.' },
    ],
    artifacts: [
      { kind: 'system', label: { pt: 'Design System multiplataforma', en: 'Multi-platform Design System' } },
      { kind: 'prototype', label: { pt: 'Protótipos de campo (offline-first)', en: 'Field prototypes (offline-first)' } },
    ],
  },
];

export const archiveCases: ArchiveCase[] = [
  {
    slug: 'cgu-portal-transparencia',
    tier: 'archive',
    client: 'CGU — Portal da Transparência',
    period: { pt: 'Mar — Mai 2023', en: 'Mar — May 2023' },
    oneLiner: {
      pt: 'Product Discovery data-informed com personas arquetípicas e clusterização, estruturando roadmap e base de conhecimento para o portal.',
      en: 'Data-informed Product Discovery with archetypal personas and clustering, structuring the roadmap and knowledge base for the portal.',
    },
    keywords: ['Product Discovery', 'Design Thinking', 'Governo', 'Personas'],
  },
  {
    slug: 'hub-de-contas-energisa',
    tier: 'archive',
    client: 'Energisa — Hub de Contas (Conta Voltz)',
    period: { pt: 'Mar — Mai 2023', en: 'Mar — May 2023' },
    oneLiner: {
      pt: 'Transformei um app utilitário em plataforma de inteligência de consumo com produtos financeiros personalizados.',
      en: 'Transformed a utility app into a consumption-intelligence platform with personalised financial products.',
    },
    keywords: ['Business Design', 'Energia', 'Monetização'],
  },
  {
    slug: 'wizard-pearson',
    tier: 'archive',
    client: 'Wizard by Pearson',
    period: { pt: 'Out — Nov 2021', en: 'Oct — Nov 2021' },
    oneLiner: {
      pt: 'Criei o conceito "Learning Revolution" com gamificação e microlearning para a Wiz.me — proposta elogiada pela Pearson.',
      en: 'Created the "Learning Revolution" concept with gamification and microlearning for Wiz.me — praised by Pearson.',
    },
    keywords: ['Business Design', 'EdTech', 'Gamificação', 'Pré-vendas'],
  },
  {
    slug: 'tintas-coral-akzonobel',
    tier: 'archive',
    client: 'Tintas Coral · AkzoNobel',
    period: { pt: 'Set — Out 2021', en: 'Sep — Oct 2021' },
    oneLiner: {
      pt: 'Posicionei o pintor como centro do negócio numa proposta que fechou contrato e incorporou a AkzoNobel à carteira Gauge.',
      en: 'Positioned the painter as the centre of the business model in a proposal that closed the contract and won the AkzoNobel account.',
    },
    keywords: ['Business Design', 'Lean UX', 'Pré-vendas', 'Indústria'],
  },
  {
    slug: 'madeiramadeira',
    tier: 'archive',
    client: 'MadeiraMadeira',
    period: { pt: 'Abr — Ago 2020', en: 'Apr — Aug 2020' },
    oneLiner: {
      pt: 'Ajudei a conceber e implementar o Cavilha, primeiro Design System interno da empresa, com storybook e continuous delivery.',
      en: 'Helped conceive and implement Cavilha, the company\'s first internal Design System, with Storybook and continuous delivery.',
    },
    keywords: ['Design System', 'Marketplace', 'Design Ops'],
  },
  {
    slug: 'climatos-simepar',
    tier: 'archive',
    client: 'ClimatOS · SIMEPAR',
    period: { pt: 'Jan — Fev 2020', en: 'Jan — Feb 2020' },
    oneLiner: {
      pt: 'Defini a UI de um software de Big Data hidrometeorológico, com guia de estilo e componentes reutilizáveis — destaque na Gazeta do Povo.',
      en: 'Defined the UI for a hydrometeorological Big Data platform, with style guide and reusable components — featured in Gazeta do Povo.',
    },
    keywords: ['UI Design', 'Big Data', 'Design System'],
  },
  {
    slug: 'onli-seguros',
    tier: 'archive',
    client: 'Onli Seguros',
    period: { pt: 'Jan — Fev 2020', en: 'Jan — Feb 2020' },
    oneLiner: {
      pt: 'Redesenhei o simulador de capital global por segmentação de fluxo, agilizando orçamento e contratação de seguros.',
      en: 'Redesigned the global capital simulator via flow segmentation, speeding up quoting and policy purchase.',
    },
    keywords: ['UX/UI', 'Fintech', 'Jornada de Compra'],
  },
  {
    slug: 'hubcash',
    tier: 'archive',
    client: 'Hubcash',
    period: { pt: 'Fev 2018 — Dez 2019', en: 'Feb 2018 — Dec 2019' },
    oneLiner: {
      pt: 'Desenhei a experiência mobile de uma plataforma de transações financeiras com pagamentos recorrentes e conciliação.',
      en: 'Designed the mobile experience for a financial-transactions platform with recurring payments and reconciliation.',
    },
    keywords: ['Fintech', 'Mobile UX', 'Usabilidade'],
  },
  {
    slug: 'scale-systems',
    tier: 'archive',
    client: 'Scale Systems · Flix Media',
    period: { pt: 'Abr — Jul 2019', en: 'Apr — Jul 2019' },
    oneLiner: {
      pt: 'Implementei sistema integrado de estoque e faturamento, automatizando gestão comercial e operacional.',
      en: 'Implemented an integrated stock and billing system, automating commercial and operational management.',
    },
    keywords: ['Interaction Design', 'Automação', 'B2B'],
  },
  {
    slug: 'sas-educacao',
    tier: 'archive',
    client: 'SAS — Plataforma de Educação',
    period: { pt: 'Mai — Ago 2018', en: 'May — Aug 2018' },
    oneLiner: {
      pt: 'Consultoria de UX em campo (Fortaleza) com diagnóstico de usabilidade e proposta de redesign para a plataforma educacional.',
      en: 'On-site UX consulting (Fortaleza) with usability diagnosis and redesign proposal for the education platform.',
    },
    keywords: ['UX Research', 'EdTech', 'Diagnóstico'],
  },
  {
    slug: 'rural-production',
    tier: 'archive',
    client: 'Rural Production',
    period: { pt: 'Ago — Nov 2017', en: 'Aug — Nov 2017' },
    oneLiner: {
      pt: 'Diagnóstico de usabilidade e recomendações de UX/UI para um app voltado ao produtor rural.',
      en: 'Usability diagnosis and UX/UI recommendations for an app aimed at rural producers.',
    },
    keywords: ['Agro', 'UX Audit', 'Mobile'],
  },
  {
    slug: 'sisand-vision',
    tier: 'archive',
    client: 'SISAND — Vision (ERP automotivo)',
    period: { pt: 'Dez 2016 — Jul 2017', en: 'Dec 2016 — Jul 2017' },
    oneLiner: {
      pt: 'Introduzi cultura de design via pesquisa de campo (shadowing) em concessionárias, elevando 30% a adesão a iniciativas de design em 6 meses.',
      en: 'Introduced a design culture through field research (shadowing) at dealerships, lifting design-initiative adoption 30% in 6 months.',
    },
    keywords: ['UX Research', 'Design Maturity', 'ERP'],
  },
  {
    slug: 'gazeta-do-povo-pos-graduacao',
    tier: 'archive',
    client: 'Gazeta do Povo — Guia de Pós-Graduação',
    period: { pt: 'Set — Out 2015', en: 'Sep — Oct 2015' },
    oneLiner: {
      pt: 'Redesign mobile-first do guia de cursos, com +55% de acessos e conversões após o lançamento.',
      en: 'Mobile-first redesign of the course guide, with +55% traffic and conversions post-launch.',
    },
    keywords: ['UX/UI', 'Mídia', 'Growth'],
  },
  {
    slug: 'ibpt-plataformas-fiscais',
    tier: 'archive',
    client: 'IBPT — Impostômetro, Empresômetro & De Olho no Imposto',
    period: { pt: 'Abr 2014 — Mar 2015', en: 'Apr 2014 — Mar 2015' },
    oneLiner: {
      pt: 'Elevei a maturidade de design do IBPT do nível 1 ao 3, liderando o discovery de 3 plataformas fiscais com repercussão nacional.',
      en: "Raised IBPT's design maturity from level 1 to 3, leading discovery for 3 nationally recognised fiscal platforms.",
    },
    keywords: ['Product Discovery', 'Business Intelligence', 'Governo'],
  },
  {
    slug: 'scae-fiep',
    tier: 'archive',
    client: 'SCAE — Sistema de Consolidação de Atividades Educacionais (FIEP)',
    period: { pt: 'Jan — Nov 2013', en: 'Jan — Nov 2013' },
    oneLiner: {
      pt: 'Arquitetura de informação e identidade visual que elevaram em 35% a taxa de sucesso nas tarefas.',
      en: 'Information architecture and visual identity that raised task success rate by 35%.',
    },
    keywords: ['Arquitetura de Informação', 'Educação', 'Identidade Visual'],
  },
  {
    slug: 'industria-acessivel-sesi',
    tier: 'archive',
    client: 'Indústria Acessível · SESI-FIEP',
    period: { pt: 'Out 2012 — Jun 2013', en: 'Oct 2012 — Jun 2013' },
    oneLiner: {
      pt: 'App que reduziu análises ergonômicas de 30 para 10–15 dias, ampliando a inclusão de PCDs na indústria — destaque na Rede Globo.',
      en: 'App that cut ergonomic assessments from 30 to 10–15 days, expanding disability inclusion in industry — featured on Rede Globo.',
    },
    keywords: ['Acessibilidade', 'Pesquisa de Campo', 'Impacto Social'],
  },
  {
    slug: 'nota10',
    tier: 'archive',
    client: 'Nota 10! — Gestão de Escolas Públicas',
    period: { pt: 'Dez 2008 — Jun 2013', en: 'Dec 2008 — Jun 2013' },
    oneLiner: {
      pt: 'Sistema de gestão educacional com pesquisa de campo em prefeituras por todo o Brasil — destaque na TV Vanguarda.',
      en: 'Education management system with field research across Brazilian municipalities — featured on TV Vanguarda.',
    },
    keywords: ['Governo', 'UX Research', 'Educação'],
  },
  {
    slug: 'onix-mdic',
    tier: 'archive',
    client: 'ONIX — Gestão Eletrônica de Documentos (MDIC)',
    period: { pt: 'Abr 2011 — Nov 2012', en: 'Apr 2011 — Nov 2012' },
    oneLiner: {
      pt: 'Shadowing em Brasília e engenharia de usabilidade para padronizar o fluxo documental do Ministério.',
      en: 'Shadowing in Brasília and usability engineering to standardise the Ministry\'s document workflow.',
    },
    keywords: ['Governo', 'Arquitetura de Informação', 'Usabilidade'],
  },
  {
    slug: 'educacenso-mec',
    tier: 'archive',
    client: 'Educacenso — MEC / INEP',
    period: { pt: 'Jun 2011 — Out 2012', en: 'Jun 2011 — Oct 2012' },
    oneLiner: {
      pt: 'Arquitetura de informação e prototipação de alta fidelidade para o módulo de Censo Escolar do INEP.',
      en: 'Information architecture and high-fidelity prototyping for INEP\'s School Census module.',
    },
    keywords: ['Governo', 'Educação', 'Prototipação'],
  },
  {
    slug: 'batel-lifestyle',
    tier: 'archive',
    client: 'Revista Eletrônica Batel Lifestyle',
    period: { pt: 'Fev — Dez 2011', en: 'Feb — Dec 2011' },
    oneLiner: {
      pt: 'Arquitetura de informação e protótipos de alta fidelidade para a versão digital de uma revista de lifestyle.',
      en: 'Information architecture and high-fidelity prototypes for the digital edition of a lifestyle magazine.',
    },
    keywords: ['Mídia', 'UX/UI', 'Mobile'],
  },
  {
    slug: 'sigad-unicamp',
    tier: 'archive',
    client: 'SIGAD & Controle de Inventário — Unicamp',
    period: { pt: 'Out 2010 — Mai 2011', en: 'Oct 2010 — May 2011' },
    oneLiner: {
      pt: 'Arquitetura de informação e testes de usabilidade em campo (Campinas) para dois sistemas internos da Unicamp.',
      en: 'Information architecture and on-site usability testing (Campinas) for two internal Unicamp systems.',
    },
    keywords: ['Governo', 'Gestão Documental', 'UX Research'],
  },
  {
    slug: 'portal-do-aluno-senai',
    tier: 'archive',
    client: 'Portal do Aluno — SENAI',
    period: { pt: 'Mar — Nov 2009', en: 'Mar — Nov 2009' },
    oneLiner: {
      pt: 'Portal do aluno integrado ao Moodle com dinâmicas de gamificação e painel de comunicação em massa para professores.',
      en: 'Student portal integrated with Moodle, gamification dynamics and a mass-communication panel for teachers.',
    },
    keywords: ['Educação', 'Gamificação', 'UX/UI'],
  },
];

export const vaultCases: VaultCase[] = [
  {
    slug: 'startup-healthtech',
    tier: 'vault',
    client: 'Projeto confidencial — Studio',
    period: { pt: 'Em incubação · 2025 — Atual', en: 'Incubating · 2025 — Present' },
    title: {
      pt: 'Startup Healthtech (fundadora)',
      en: 'Healthtech Startup (Founder)',
    },
    teaser: {
      pt: 'Uma oportunidade de alto impacto em saúde pública, ainda sem solução consolidada no mercado.',
      en: 'A high-impact public-health opportunity, without a consolidated market solution yet.',
    },
    full: {
      pt: 'A partir de uma pesquisa aprofundada no setor de saúde, identifiquei uma oportunidade de alto impacto em saúde pública ainda sem solução consolidada no mercado. Lidero atualmente a construção da startup, conduzindo pesquisa, validação do problema, estratégia de produto, modelagem do negócio e definição da solução, com foco em gerar impacto sistêmico no setor.',
      en: 'Following in-depth research into the healthcare sector, I identified a high-impact public-health opportunity without a consolidated market solution. I currently lead the startup\'s build — research, problem validation, product strategy, business modelling and solution definition — focused on driving systemic impact in the sector.',
    },
    disciplines: ['Product Discovery', 'Business Design', 'Healthtech', 'Empreendedorismo'],
  },
];
