export interface DataSourceInfo {
  title: string
  description: string
  tools: string[]
}

export const DATA_SOURCES: DataSourceInfo[] = [
  {
    title: 'Dados Comportamentais / Quantitativos (o que o usuário faz)',
    description:
      'Registrados automaticamente por ferramentas de produto quando o usuário clica, navega ou converte.',
    tools: ['Mixpanel', 'Amplitude', 'Google Analytics 4 (GA4)', 'PostHog', 'Hotjar', 'Clarity', 'FullStory'],
  },
  {
    title: 'Dados Perceptuais / Qualitativos (o que o usuário diz)',
    description:
      'Coletados diretamente pelo time de design via pesquisas, questionários, testes e entrevistas.',
    tools: ['Maze', 'Lookback', 'UsabilityHub', 'Typeform', 'Qualtrics'],
  },
  {
    title: 'Dados Financeiros e de Negócio (o resultado da operação)',
    description: 'Consolidados nos sistemas internos da empresa e mantidos por times de produto ou dados.',
    tools: ['Dashboards executivos', 'Looker', 'Power BI'],
  },
]

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Preciso acessar alguma plataforma sozinho(a)?',
    answer:
      'Sim! Todo Product Designer deve buscar autonomia básica nas ferramentas de produtividade e analytics da empresa: Product Analytics (Mixpanel, Amplitude, GA4, PostHog), gravação de sessão e mapas de calor (Hotjar, Clarity, FullStory), e testes de usabilidade/pesquisas (Maze, Lookback, UsabilityHub, Typeform, Qualtrics).',
  },
  {
    question: 'Quem pode me ajudar a conseguir os dados?',
    answer:
      'Você nunca estará sozinho(a). Product Manager (números de negócio e dashboards globais), Data Analyst/BI (consultas SQL, dados históricos), Tech Lead/Desenvolvedores (eventos já implementados e novo tagamento), UX Researcher (metodologias de pesquisa e testes padronizados) e Time de Atendimento/CS (feedbacks, reclamações, CSAT/NPS).',
  },
  {
    question: 'Preciso fazer pesquisa ou os dados já existem?',
    answer:
      'Depende da métrica. Comportamento real em produção (Taxa de Conversão, DAU/MAU, Retention) já é coletado pelas plataformas de analytics — não precisa de pesquisa direta. Usabilidade de protótipo pré-lançamento (TSR, TMT) ou percepção subjetiva (SUS, SEQ, CES) exige que o designer aplique testes ou questionários.',
  },
  {
    question: 'Preciso analisar dados históricos?',
    answer:
      'Sim, quase sempre! Para provar que uma solução de design funcionou, você precisa de um Baseline (ponto de comparação). Antes de alterar qualquer tela, analise os dados dos últimos 30, 60 ou 90 dias. Sem dados históricos é impossível provar a evolução.',
  },
]

export interface HandoffRole {
  role: string
  when: string
}

export const HANDOFF_ROLES: HandoffRole[] = [
  {
    role: 'Time de Dados (BI/Data)',
    when:
      'Quando a informação exige cruzar diferentes bancos de dados, gerar relatórios customizados, ou quando o designer não possui acesso direto à ferramenta.',
  },
  {
    role: 'Time de Tecnologia (Engenharia)',
    when: 'Quando uma nova funcionalidade/tela for criada e for necessário implementar novo tagamento (código de rastreamento).',
  },
]

export const AUTONOMY_CHECKLIST: string[] = [
  'Tenho acesso e login nas plataformas de analytics da empresa (GA4, Mixpanel, Hotjar, etc.)?',
  'Já identifiquei qual é o baseline (dado histórico) da tela/fluxo que vou alterar?',
  'Conversei com o PM para entender o objetivo de negócio dessa demanda?',
  'Mapeei quais botões e interações precisam de tagamento e passei essa especificação para os desenvolvedores no handoff?',
  'Sei se precisarei rodar um teste de usabilidade (qualitativo/quantitativo) antes do lançamento final?',
]

export const DAILY_CHECKLIST: string[] = [
  'O objetivo da funcionalidade está claro e alinhado entre Design, PM e Engenharia?',
  'Definimos pelo menos 1 métrica de UX (ex: TSR, TMT) e 1 métrica de Negócio (ex: CR, Churn)?',
  'Temos visibilidade sobre o estado atual (baseline) dessas métricas hoje?',
  'As ferramentas de analytics e rastreamento (eventos de clique, navegação, mensuração) estão especificadas para o time de desenvolvimento antes do handoff?',
  'Agendamos uma data de revisão pós-lançamento (15-30 dias) para analisar os dados?',
]
