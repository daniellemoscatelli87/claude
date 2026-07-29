export interface Award {
  title: { pt: string; en: string };
  issuer: string;
  date: string;
  description: { pt: string; en: string };
}

export const awards: Award[] = [
  {
    title: {
      pt: 'Reconhecimento na mídia: Circular Brain no ESG Inside',
      en: 'Media recognition: Circular Brain on ESG Inside',
    },
    issuer: 'ESG Inside',
    date: 'Set 2025',
    description: {
      pt: 'Pelo lançamento da plataforma "Multiplicadores Circulares" — oportunidade de monetização B2C identificada no Strategic Product Discovery que conduzi.',
      en: 'For the launch of the "Multiplicadores Circulares" platform — a B2C monetisation opportunity identified in the Strategic Product Discovery I led.',
    },
  },
  {
    title: {
      pt: 'Bonificação e menção honrosa pelas iniciativas de Inovação',
      en: 'Bonus & honourable mention for Innovation initiatives',
    },
    issuer: 'Evup',
    date: 'Nov 2024',
    description: {
      pt: 'Por estruturar o Innovation Lab e elevar a maturidade de design da empresa em 3 níveis em 6 meses com o framework Quad Diamond.',
      en: 'For building the Innovation Lab and raising the company\'s design maturity by 3 levels in 6 months with the Quad Diamond framework.',
    },
  },
  {
    title: {
      pt: 'Bonificação e menção honrosa — Líder de Contrato, APP Atacadão',
      en: 'Bonus & honourable mention — Account Lead, Atacadão App',
    },
    issuer: 'Gauge — Stefanini Brasil',
    date: 'Mar 2023',
    description: {
      pt: 'Por impedir a quebra de contrato, dobrar seu valor e elevar o NPS do cliente de 2 para 10 em 2022.',
      en: 'For preventing contract termination, doubling contract value, and lifting client NPS from 2 to 10 in 2022.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Selecty no Paraná em Pauta',
      en: 'Media recognition: Selecty on Paraná em Pauta',
    },
    issuer: 'TV Paraná Turismo',
    date: 'Nov 2022',
    description: {
      pt: 'Tecnologia de matching com IA que ajuda recrutadores a selecionar candidatos de forma mais humanizada.',
      en: 'AI matching technology helping recruiters run a more humanised candidate selection process.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Selecty na Band Cidade',
      en: 'Media recognition: Selecty on Band Cidade',
    },
    issuer: 'Band Cidade',
    date: 'Jun 2022',
    description: {
      pt: 'Como a plataforma contribui para reduzir estresse e ansiedade entre recrutadores — mais de 60% enfrentam esses distúrbios (pesquisa Mercer Brasil).',
      en: 'How the platform helps reduce recruiter stress and anxiety — over 60% face these issues, per Mercer Brasil research.',
    },
  },
  {
    title: {
      pt: 'Prêmio Líder do Ano 2021',
      en: 'Leader of the Year 2021 Award',
    },
    issuer: 'Gauge — Stefanini Brasil',
    date: 'Dez 2021',
    description: {
      pt: 'Pelo projeto de Transformação Digital da FujiFilm Brasil, com metodologia proprietária de design thinking de serviços e mentalidade analítica.',
      en: "For the FujiFilm Brasil Digital Transformation project, applying a proprietary service-design-thinking and analytical-mindset methodology.",
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Farmácias APP — alta de quase 1000% em transações mobile',
      en: 'Media recognition: Farmácias APP — nearly 1000% rise in mobile transactions',
    },
    issuer: 'Canaltech',
    date: 'Jun 2020',
    description: {
      pt: 'Crescimento de 938% nas transações mobile, impulsionado pela pandemia, com expansão de 2,5x na base de farmácias cadastradas.',
      en: '938% growth in mobile transactions during the pandemic, with a 2.5x expansion in registered pharmacies.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Farmácias APP no Bora SP',
      en: 'Media recognition: Farmácias APP on Bora SP',
    },
    issuer: 'Band',
    date: 'Mar 2020',
    description: {
      pt: 'App de delivery de medicamentos com crescimento exponencial e papel essencial durante a pandemia.',
      en: 'Medicine-delivery app with exponential growth and an essential role during the pandemic.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: ClimatOS na Gazeta do Povo',
      en: 'Media recognition: ClimatOS on Gazeta do Povo',
    },
    issuer: 'Gazeta do Povo',
    date: 'Jan 2020',
    description: {
      pt: 'Solução de Big Data para análise de dados hidrometeorológicos e ambientais do SIMEPAR.',
      en: "Big Data solution for SIMEPAR's hydrometeorological and environmental data analysis.",
    },
  },
  {
    title: {
      pt: 'Farmácias APP — um dos melhores apps do ano',
      en: 'Farmácias APP — among the year\'s best apps',
    },
    issuer: 'TecMundo, Revista Exame & Gizmodo',
    date: '2017',
    description: {
      pt: 'Citado nas listas dos melhores apps de saúde e melhores apps da semana para Android/iPhone.',
      en: 'Featured in lists of the best health apps and best Android/iPhone apps of the week.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Indústria Acessível',
      en: 'Media recognition: Indústria Acessível',
    },
    issuer: 'RPC — Rede Globo de Televisão',
    date: 'Jun 2013',
    description: {
      pt: 'Sistema que reduziu o tempo de análise ergonômica de 30 para 10–15 dias, apoiando a contratação de pessoas com deficiência.',
      en: 'System that cut ergonomic assessment time from 30 to 10–15 days, supporting the hiring of people with disabilities.',
    },
  },
  {
    title: {
      pt: 'Reconhecimento na mídia: Sistema Nota 10!',
      en: 'Media recognition: Nota 10! System',
    },
    issuer: 'TV Vanguarda',
    date: 'Set 2009',
    description: {
      pt: 'Destaque como inovação na gestão educacional pública, implementado na Prefeitura de São José dos Campos.',
      en: 'Featured as an innovation in public education management, implemented by the São José dos Campos municipal government.',
    },
  },
];
