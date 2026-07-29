export interface ExpertiseItem {
  icon:
    | 'compass'
    | 'workflow'
    | 'layout-grid'
    | 'sparkles'
    | 'users-round'
    | 'bar-chart-3'
    | 'messages-square'
    | 'rocket';
  size: 'lg' | 'md' | 'sm';
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  keywords: string[];
}

export const expertise: ExpertiseItem[] = [
  {
    icon: 'compass',
    size: 'lg',
    title: { pt: 'Product Discovery & UX Research', en: 'Product Discovery & UX Research' },
    description: {
      pt: 'Pesquisa multi-método, clusterização assistida por IA, personas arquetípicas e validação de hipóteses para decidir com evidência, não com opinião.',
      en: 'Multi-method research, AI-assisted clustering, archetypal personas and hypothesis validation — deciding on evidence, not opinion.',
    },
    keywords: ['Discovery', 'JTBD', 'Testes de Usabilidade', 'Personas', 'Clusterização com IA'],
  },
  {
    icon: 'workflow',
    size: 'md',
    title: { pt: 'Service Design & Business Design', en: 'Service Design & Business Design' },
    description: {
      pt: 'Blueprints, jornadas ponta a ponta e modelos de negócio que conectam a experiência do cliente à sustentabilidade financeira do produto.',
      en: 'Blueprints, end-to-end journeys and business models connecting customer experience to product sustainability.',
    },
    keywords: ['Service Blueprint', 'Business Model Canvas', 'Jornada TO BE'],
  },
  {
    icon: 'layout-grid',
    size: 'md',
    title: { pt: 'Design Systems & Product Delivery', en: 'Design Systems & Product Delivery' },
    description: {
      pt: 'Da concepção à documentação técnica: sistemas de design que escalam consistência entre times de design e desenvolvimento.',
      en: 'From concept to technical documentation: design systems that scale consistency between design and engineering teams.',
    },
    keywords: ['Design System', 'Storybook', 'Handoff', 'Continuous Delivery'],
  },
  {
    icon: 'sparkles',
    size: 'md',
    title: { pt: 'IA aplicada ao ciclo de Design', en: 'AI applied to the Design cycle' },
    description: {
      pt: 'Da pesquisa e análise à ideação e prototipação — uso IA generativa para acelerar decisões sem abrir mão do rigor metodológico.',
      en: 'From research and analysis to ideation and prototyping — I use generative AI to speed up decisions without giving up methodological rigour.',
    },
    keywords: ['IA Generativa', 'Lovable', 'Claude Code', 'Prototipação com IA'],
  },
  {
    icon: 'users-round',
    size: 'lg',
    title: { pt: 'Liderança & Design/Research Ops', en: 'Leadership & Design/Research Ops' },
    description: {
      pt: 'Estruturo departamentos de inovação do zero: governança, processos escaláveis, mentoria técnica e cultura data-informed.',
      en: 'I build innovation departments from the ground up: governance, scalable process, technical mentorship and a data-informed culture.',
    },
    keywords: ['Design Ops', 'Research Ops', 'Mentoria', 'Gestão de Times', 'Cultura Organizacional'],
  },
  {
    icon: 'bar-chart-3',
    size: 'sm',
    title: { pt: 'Métricas & Decisão Data-Informed', en: 'Metrics & Data-Informed Decisions' },
    description: {
      pt: 'TSR, TOT, CES, CSAT, NPS e KPIs de negócio definidos para medir impacto real, não vaidade.',
      en: 'TSR, TOT, CES, CSAT, NPS and business KPIs defined to measure real impact, not vanity metrics.',
    },
    keywords: ['Analytics', 'KPIs', 'SUS', 'ISO 9241-11'],
  },
  {
    icon: 'messages-square',
    size: 'sm',
    title: { pt: 'Facilitação & Comunicação', en: 'Facilitation & Communication' },
    description: {
      pt: 'Workshops, Design Sprint e Comunicação Não Violenta para reconstruir relações e alinhar stakeholders.',
      en: 'Workshops, Design Sprint and Non-Violent Communication to rebuild relationships and align stakeholders.',
    },
    keywords: ['Design Facilitation', 'CNV', 'Workshops', 'Stakeholder Management'],
  },
  {
    icon: 'rocket',
    size: 'md',
    title: { pt: 'Estratégia & Inovação', en: 'Strategy & Innovation' },
    description: {
      pt: 'Diagnóstico de negócio, benchmarking, SWOT e pitch estratégico para transformar restrição em oportunidade de investimento.',
      en: 'Business diagnosis, benchmarking, SWOT and strategic pitching — turning constraint into investment opportunity.',
    },
    keywords: ['Estratégia de Produto', 'Pitch Deck', 'Inovação', 'Growth'],
  },
];
