export interface TimelineEntry {
  id: string;
  period: { pt: string; en: string };
  duration: { pt: string; en: string };
  location: { pt: string; en: string };
  tag: { pt: string; en: string };
  role: { pt: string; en: string };
  org: string;
  parallel?: boolean;
  impactTitle: { pt: string; en: string };
  summary: { pt: string; en: string };
  keywords: string[];
}

export const timeline: TimelineEntry[] = [
  {
    id: 'studio',
    period: { pt: 'Jan 2026 — Atual', en: 'Jan 2026 — Present' },
    duration: { pt: '1 ano e 3 meses', en: '1 yr 3 mo' },
    location: { pt: 'Curitiba, PR (Remoto)', en: 'Curitiba, Brazil (Remote)' },
    tag: { pt: 'Fundação Própria', en: 'Own Venture' },
    role: {
      pt: 'Consultora em Inovação e Experiência do Cliente · Empreendedora',
      en: 'Innovation & Customer Experience Consultant · Founder',
    },
    org: 'Dani Moscatelli — Experience Design Studio',
    impactTitle: {
      pt: 'Fundei meu próprio estúdio para levar Product Discovery, pesquisa estratégica e IA generativa a organizações que precisam decidir com evidências.',
      en: 'Founded my own studio bringing Product Discovery, strategic research and generative AI to organisations that need to decide on evidence.',
    },
    summary: {
      pt: 'Conduzo iniciativas de Product Discovery, pesquisa estratégica, validação de hipóteses e diagnóstico de Customer Experience, integrando Design Estratégico, Service Design e IA generativa para acelerar a investigação, transformar dados em insights acionáveis e apoiar decisões de negócio — incluindo a construção de uma startup healthtech própria, hoje em incubação.',
      en: 'I lead Product Discovery, strategic research, hypothesis validation and Customer Experience diagnostics, integrating Strategic Design, Service Design and generative AI to speed up investigation and turn data into decisions — including building my own healthtech startup, currently in incubation.',
    },
    keywords: ['Product Discovery', 'Pesquisa Estratégica', 'IA Generativa', 'Business Design', 'Empreendedorismo'],
  },
  {
    id: 'phoenix',
    period: { pt: 'Jan 2015 — Dez 2025', en: 'Jan 2015 — Dec 2025' },
    duration: { pt: '10 anos e 4 meses · consultoria paralela', en: '10 yrs 4 mo · parallel consultancy' },
    location: { pt: 'Curitiba, PR (Híbrido)', en: 'Curitiba, Brazil (Hybrid)' },
    tag: { pt: 'Consultoria Estratégica Paralela', en: 'Parallel Strategic Consulting' },
    role: { pt: 'Head of Product Design', en: 'Head of Product Design' },
    org: 'Phoenix Innovation Lab | Consultoria em Inovação',
    parallel: true,
    impactTitle: {
      pt: 'Por dez anos, mantive uma prática consultiva paralela às posições executivas, diagnosticando negócios e liderando inovação em mais de 9 setores.',
      en: 'For a decade I ran a consulting practice in parallel to my executive roles, diagnosing businesses and leading innovation across 9+ sectors.',
    },
    summary: {
      pt: 'Combinei visão estratégica com execução consultiva em projetos de e-commerce, fintech, agro, economia circular, automação industrial e HR tech, aplicando Product Discovery, Design Sprint e Service Design para validar hipóteses com pesquisa, dados e IA — de novos caminhos de monetização (MadeiraMadeira, Selecty, 4VANTS) a transformação de cultura organizacional, com impacto comprovado em NPS, engajamento e eficiência.',
      en: 'I combined strategic vision with hands-on consulting across e-commerce, fintech, agritech, circular economy, industrial automation and HR tech, applying Product Discovery, Design Sprint and Service Design to validate hypotheses with research, data and AI — from new monetisation paths (MadeiraMadeira, Selecty, 4VANTS) to organisational culture change, with proven impact on NPS, engagement and efficiency.',
    },
    keywords: ['Product Discovery', 'Design Sprint', 'Service Design', 'Design System', 'Consultoria Estratégica'],
  },
  {
    id: 'evup',
    period: { pt: 'Dez 2023 — Dez 2024', en: 'Dec 2023 — Dec 2024' },
    duration: { pt: '1 ano e 1 mês', en: '1 yr 1 mo' },
    location: { pt: 'Curitiba, PR (Remoto)', en: 'Curitiba, Brazil (Remote)' },
    tag: { pt: 'Construção Organizacional', en: 'Organisational Building' },
    role: { pt: 'Diretora de Inovação', en: 'Director of Innovation' },
    org: 'Evup',
    impactTitle: {
      pt: 'Construí do zero o departamento de inovação de uma healthtech/beautytech de R$150 bi, elevando a maturidade de design em 3 níveis em 6 meses.',
      en: 'Built the innovation department of a R$150bn healthtech/beautytech from scratch, raising design maturity by 3 levels in 6 months.',
    },
    summary: {
      pt: 'Criei o Innovation Lab com Research Ops e Design Ops e o framework proprietário Quad Diamond (negócios, design, dados, desenvolvimento, qualidade e IA). Redefini missão, visão e valores por co-criação, aumentando 20% o engajamento interno. Liderei o Product Discovery do Connect 2.0 (CRM carro-chefe) como projeto-piloto, aplicando testes SUS, heurísticas ISO 9241-11, JTBD e Kano Model — entregando um MVP validado e escalável.',
      en: 'Created the Innovation Lab with Research Ops and Design Ops and the proprietary Quad Diamond framework (business, design, data, engineering, quality and AI). Redefined mission, vision and values through co-creation, lifting internal engagement by 20%. Led Product Discovery for Connect 2.0 (the flagship CRM) as pilot project, applying SUS testing, ISO 9241-11 heuristics, JTBD and the Kano Model — shipping a validated, scalable MVP.',
    },
    keywords: ['Research Ops', 'Design Ops', 'Product Discovery', 'Liderança', 'Cultura Organizacional', 'CRM'],
  },
  {
    id: 'stefanini',
    period: { pt: 'Set 2021 — Ago 2023', en: 'Sep 2021 — Aug 2023' },
    duration: { pt: '2 anos', en: '2 yrs' },
    location: { pt: 'São Paulo, SP (Remoto)', en: 'São Paulo, Brazil (Remote)' },
    tag: { pt: 'Gestão Multi-Conta & Liderança', en: 'Multi-Account Leadership' },
    role: { pt: 'UX Design Manager', en: 'UX Design Manager' },
    org: 'Stefanini Brasil (Gauge)',
    impactTitle: {
      pt: 'Liderei simultaneamente contratos enterprise (Atacadão, FujiFilm, CGU, Energisa), unindo gestão de conta, craft de Product Design e Business Design.',
      en: 'Simultaneously led enterprise accounts (Atacadão, FujiFilm, CGU, Energisa), combining account management, Product Design craft and Business Design.',
    },
    summary: {
      pt: 'Resgatei um contrato em risco (Atacadão/Grupo Carrefour), elevando o NPS de 2 para 10 e dobrando o valor do contrato. Liderei a transformação digital organizacional da FujiFilm Brasil (Prêmio Líder do Ano 2021), o Product Discovery do Portal da Transparência (CGU) e o Business Design do Hub de Contas (Energisa). Propostas estratégicas para AkzoNobel e Wizard by Pearson converteram-se em novos contratos.',
      en: "Rescued an at-risk account (Atacadão/Grupo Carrefour), lifting NPS from 2 to 10 and doubling contract value. Led FujiFilm Brasil's organisational digital transformation (Leader of the Year 2021), the CGU Transparency Portal Product Discovery, and Energisa's Hub de Contas Business Design. Strategic proposals for AkzoNobel and Wizard by Pearson converted into new contracts.",
    },
    keywords: ['Business Design', 'Design System', 'Gestão de Contas', 'Service Design', 'Product Delivery'],
  },
  {
    id: 'farmacias-app',
    period: { pt: 'Jan 2016 — Mar 2020', en: 'Jan 2016 — Mar 2020' },
    duration: { pt: '4 anos e 3 meses', en: '4 yrs 3 mo' },
    location: { pt: 'São Paulo, SP (Remoto)', en: 'São Paulo, Brazil (Remote)' },
    tag: { pt: 'Craft & Ownership de Produto', en: 'Product Craft & Ownership' },
    role: { pt: 'UX Design Lead', en: 'UX Design Lead' },
    org: 'Farmácias APP | Delivery | By GrupoSC',
    impactTitle: {
      pt: 'Fui a única designer responsável, por mais de 4 anos, pelo primeiro marketplace farmacêutico do mundo com checkout simultâneo.',
      en: "Sole designer responsible, for over 4 years, for the world's first pharmacy marketplace with simultaneous checkout.",
    },
    summary: {
      pt: 'Criei o checkout simultâneo — pioneiro no mercado, antes do Mercado Livre — e estruturei as fundações de UX que sustentaram um crescimento de 938% nas transações. Conduzi o design end-to-end (web, app híbrido e backoffice) e o primeiro Design System da empresa, em um momento em que o conceito ainda era pouco difundido no Brasil.',
      en: "Created simultaneous checkout — pioneering in the market, ahead of Mercado Livre — and built the UX foundations behind a 938% growth in transactions. Owned end-to-end design (web, hybrid app and back-office) and the company's first Design System, at a time the concept was barely known in Brazil.",
    },
    keywords: ['UX/UI End-to-End', 'Design System', 'E-commerce', 'Growth', 'Product Ownership'],
  },
  {
    id: 'ibpt',
    period: { pt: 'Abr 2014 — Abr 2015', en: 'Apr 2014 — Apr 2015' },
    duration: { pt: '1 ano', en: '1 yr' },
    location: { pt: 'Curitiba e Região, Brasil', en: 'Curitiba, Brazil' },
    tag: { pt: 'Maturidade Estratégica', en: 'Strategic Maturity' },
    role: { pt: 'Senior UX Designer', en: 'Senior UX Designer' },
    org: 'IBPT — Instituto Brasileiro de Planejamento e Tributação',
    impactTitle: {
      pt: 'Elevei a maturidade de design do IBPT do nível 1 ao 3 em um ano, introduzindo práticas estratégicas de UX numa organização que ainda não as tinha.',
      en: "Raised IBPT's design maturity from level 1 to 3 in one year, introducing strategic UX practices to an organisation that had none.",
    },
    summary: {
      pt: 'Liderei o Product Discovery do Impostômetro, definindo jornada e arquitetura de informação para a plataforma de monitoramento tributário que alcançou repercussão nacional. Conduzi a definição do MVP do Empresômetro (BI fiscal) e projetei o portal De Olho no Imposto, apoiando a conformidade com a Lei de Transparência Fiscal.',
      en: 'Led Product Discovery for Impostômetro, defining the journey and information architecture for a tax-monitoring platform that gained national visibility. Defined the MVP for Empresômetro (fiscal BI) and designed the De Olho no Imposto portal, supporting compliance with the Fiscal Transparency Law.',
    },
    keywords: ['Product Discovery', 'Arquitetura de Informação', 'Business Intelligence', 'Design Maturity'],
  },
  {
    id: 'sigma',
    period: { pt: 'Jan 2008 — Nov 2013', en: 'Jan 2008 — Nov 2013' },
    duration: { pt: '5 anos', en: '5 yrs' },
    location: { pt: 'Curitiba, Brasil', en: 'Curitiba, Brazil' },
    tag: { pt: 'Consolidação Técnica', en: 'Technical Consolidation' },
    role: { pt: 'UX Lead / Senior UX Designer / Mid-Level UX Designer', en: 'UX Lead / Senior / Mid-Level UX Designer' },
    org: 'Sigma S/A',
    impactTitle: {
      pt: 'Liderei UX em sistemas governamentais e educacionais de alta complexidade para FIEP, MEC, MDIC, Unicamp e SENAI.',
      en: 'Led UX on high-complexity government and education systems for FIEP, MEC, MDIC, Unicamp and SENAI.',
    },
    summary: {
      pt: 'Desenvolvi o Indústria Acessível, app pioneiro que reduziu análises ergonômicas de 30 para 10–15 dias e viabilizou a contratação de pessoas com deficiência (destaque na Globo/RPC). Liderei os sistemas educacionais SCAE e Nota 10! (+35% de sucesso em tarefas, +40% de eficiência de implementação) e os sistemas governamentais ONIX (MDIC) e Educacenso (MEC).',
      en: 'Developed Indústria Acessível, a pioneering app that cut ergonomic assessments from 30 to 10–15 days and enabled hiring people with disabilities (featured on Globo/RPC). Led the SCAE and Nota 10! education systems (+35% task success, +40% implementation efficiency) and the ONIX (MDIC) and Educacenso (MEC) government systems.',
    },
    keywords: ['UX Research', 'Arquitetura de Informação', 'Prototipação', 'Sistemas Governamentais', 'Acessibilidade'],
  },
  {
    id: 'opus',
    period: { pt: 'Jun 2006 — Set 2008', en: 'Jun 2006 — Sep 2008' },
    duration: { pt: '2 anos e 3 meses', en: '2 yrs 3 mo' },
    location: { pt: 'Curitiba, Brasil', en: 'Curitiba, Brazil' },
    tag: { pt: 'Gênese', en: 'Genesis' },
    role: { pt: 'Web Designer Multimídia', en: 'Multimedia Web Designer' },
    org: 'OpusMúltipla e World Family Organization (ONU)',
    impactTitle: {
      pt: 'Comecei minha jornada criando interfaces digitais e multimídia para agências e uma ONG internacional — a origem da minha visão centrada no usuário.',
      en: 'Started my journey building digital and multimedia interfaces for agencies and an international NGO — the origin of my user-centred lens.',
    },
    summary: {
      pt: 'Desenvolvi websites, identidades visuais e experiências interativas com Flash, ActionScript, HTML, CSS e Photoshop, redesenhando portais institucionais e apresentações para eventos internacionais. Já nesse início, apliquei princípios de arquitetura da informação e usabilidade que antecipavam práticas modernas de UX.',
      en: 'Built websites, visual identities and interactive experiences with Flash, ActionScript, HTML, CSS and Photoshop, redesigning institutional portals and presentations for international events. Even then, I applied information architecture and usability principles that anticipated modern UX practice.',
    },
    keywords: ['Web Design', 'Identidade Visual', 'Arquitetura de Informação', 'Multimídia'],
  },
];
