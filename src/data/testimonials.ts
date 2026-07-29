export interface Testimonial {
  name: string;
  role: string;
  relationship: { pt: string; en: string };
  date: string;
  quote: { pt: string; en: string };
}

// A curated subset of the 30+ recommendations received on LinkedIn — selected to
// represent different vantage points (client, direct reports, peers, academic).
// Full list available on LinkedIn (link in the Depoimentos section).
export const testimonials: Testimonial[] = [
  {
    name: 'Jorge Rocha de Souza',
    role: 'Founder, Safe Go Tur',
    relationship: { pt: 'Foi cliente de Dani', en: 'Was Dani\'s client' },
    date: 'Dez 2025',
    quote: {
      pt: 'Estou tendo o prazer de trabalhar com a Dani Moscatelli e posso afirmar com segurança que sua dedicação, competência e profissionalismo fazem toda a diferença em qualquer time. Uma profissional completa, que entrega com qualidade e agrega valor por onde passa.',
      en: 'I have had the pleasure of working with Dani Moscatelli and can say with confidence that her dedication, competence and professionalism make all the difference on any team. A complete professional who delivers quality and adds value wherever she goes.',
    },
  },
  {
    name: 'Isabela Valls',
    role: 'UX Researcher · Service Designer',
    relationship: { pt: 'Respondia diretamente a Dani (Stefanini/Gauge e Evup)', en: 'Reported directly to Dani (Stefanini/Gauge and Evup)' },
    date: 'Jan 2025',
    quote: {
      pt: 'Na Evup, o desafio era construir o departamento de Inovação do zero. A Dani trouxe clareza, inovação e uma liderança que nos fez avançar com confiança. Sua capacidade de equilibrar visão estratégica com execução impecável é algo raro de se encontrar. Mais do que uma gestora, é uma mentora que realmente transforma as pessoas ao seu redor.',
      en: 'At Evup, the challenge was building the Innovation department from scratch. Dani brought clarity, innovation and a kind of leadership that let us move forward with confidence. Her ability to balance strategic vision with flawless execution is rare. More than a manager, she is a mentor who genuinely transforms the people around her.',
    },
  },
  {
    name: 'Massao Cassadori',
    role: 'Head de Design e Produto, Gauge',
    relationship: { pt: 'Trabalhou na mesma equipe que Dani', en: 'Worked on the same team as Dani' },
    date: 'Mai 2023',
    quote: {
      pt: 'Acho que duas palavras definem a Dani: excelência e compromisso. Ficou claro desde o início que ela era uma pessoa de presença forte e uma profissional com nível técnico altíssimo — uma líder que consegue guiar e extrair o melhor do time.',
      en: 'I think two words define Dani: excellence and commitment. It was clear from the start she had a strong presence and an extremely high technical level — a leader who can guide a team and get the best out of it.',
    },
  },
  {
    name: 'Mariana Araujo de Almeida',
    role: 'Gestora de Criação e Desenvolvimento de Produto',
    relationship: { pt: 'Comunidade PUC Angels', en: 'PUC Angels community' },
    date: 'Ago 2025',
    quote: {
      pt: 'Com mais de 19 anos de experiência em Design, Inovação e Tecnologia, Dani une sensibilidade, visão estratégica e uma energia inspiradora. Sua atuação revela uma capacidade única de estruturar times multidisciplinares, criar processos de inovação consistentes e manter o foco nas pessoas.',
      en: 'With over 19 years in Design, Innovation and Technology, Dani combines sensitivity, strategic vision and inspiring energy. Her track record shows a unique ability to structure multidisciplinary teams, build consistent innovation processes, and keep people at the centre.',
    },
  },
  {
    name: 'Patrick Egidio',
    role: 'Product Owner · Product Manager',
    relationship: { pt: 'Colega direto na Evup', en: 'Direct colleague at Evup' },
    date: 'Jan 2025',
    quote: {
      pt: 'É especialista em seu campo de atuação e conhece diversas ferramentas e metodologias capazes de conduzir uma companhia na criação de produtos inovadores. Isso ficou evidente quando conduziu pesquisas com nossos principais clientes, ampliando nossa visão de melhorias de usabilidade e gaps de funcionalidades.',
      en: 'A true specialist in her field, fluent in the tools and methodologies needed to guide a company toward innovative products. This was clear when she ran research with our key clients, broadening our view of usability improvements and functionality gaps.',
    },
  },
  {
    name: 'Paulo Repa',
    role: 'Data Scientist · Data Engineer · AI Specialist',
    relationship: { pt: 'Trabalhou na mesma equipe que Dani (Gauge)', en: 'Worked on the same team as Dani (Gauge)' },
    date: 'Mai 2023',
    quote: {
      pt: 'Dani possesses a deep understanding of data-driven methodologies and consistently demonstrates a meticulous approach in analyzing complex data sets. She is a creative problem-solver who wholeheartedly embraces design thinking, with strong communication skills and an excellent collaborative nature.',
      en: 'Dani possesses a deep understanding of data-driven methodologies and consistently demonstrates a meticulous approach in analyzing complex data sets. She is a creative problem-solver who wholeheartedly embraces design thinking, with strong communication skills and an excellent collaborative nature.',
    },
  },
  {
    name: 'Vivian Alberti Romano',
    role: 'Product Designer · UX Research',
    relationship: { pt: 'Respondia diretamente a Dani', en: 'Reported directly to Dani' },
    date: 'Mai 2023',
    quote: {
      pt: 'Fazer parte da equipe da Dani foi a experiência profissional mais enriquecedora que já tive. O nível de profissionalismo, atenção aos detalhes e qualidade das entregas sempre foi excepcional — uma liderança onde o bem-estar e o crescimento de todos é zelado o tempo todo.',
      en: 'Being part of Dani\'s team was the most enriching professional experience I\'ve had. The level of professionalism, attention to detail and quality of delivery was consistently exceptional — a leadership style where everyone\'s wellbeing and growth is genuinely looked after.',
    },
  },
  {
    name: 'Denner Junkes Cardoso',
    role: 'Product · UX/UI Designer',
    relationship: { pt: 'Respondia diretamente a Dani (Gauge)', en: 'Reported directly to Dani (Gauge)' },
    date: 'Mai 2023',
    quote: {
      pt: 'Fiz parte de um time liderado pela Dani e aprendi muito durante o tempo que dividimos no projeto — este que saiu de estado crítico para um A+. É uma profissional que engaja com o time, procura estar próxima das pessoas e eleva muito o nível técnico da equipe.',
      en: 'I was part of a team Dani led and learned a great deal during our time on the project — which went from a critical state to an A+. She is a professional who genuinely engages with the team, stays close to people, and significantly raises the technical bar.',
    },
  },
  {
    name: 'Giovanna Buranello',
    role: 'Product Designer · UX Strategy',
    relationship: { pt: 'Colega de MBA (FIAP)', en: 'MBA classmate (FIAP)' },
    date: 'Jul 2026',
    quote: {
      pt: 'Tem esse perfil de quem nunca está satisfeita com o superficial. Sempre inquieta, sempre curiosa, com uma experiência em design de serviços que dava peso real para cada debate. A Dani é o tipo de profissional que deixa qualquer projeto mais sólido.',
      en: 'She has the profile of someone who is never satisfied with the superficial. Always restless, always curious, with service-design experience that gave real weight to every discussion. Dani is the kind of professional who makes any project more solid.',
    },
  },
];

export const testimonialsMeta = {
  pt: { totalNote: '+30 recomendações recebidas no LinkedIn', cta: 'Ver todas no LinkedIn' },
  en: { totalNote: '30+ recommendations received on LinkedIn', cta: 'See all on LinkedIn' },
};
