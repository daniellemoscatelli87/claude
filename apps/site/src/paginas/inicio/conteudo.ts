// Conteúdo da página inicial (index.html e public/inicio/ie3-secoes.*), com os mesmos textos, fotos e links.
// Depoimentos: recomendações públicas do LinkedIn; trechos entre ** ficam em negrito, como na página de HTML.
import type { CardDeArtigoProps } from "@/components/ui/card-de-artigo";
import type { LogoDaFaixa } from "@/components/ui/faixa-de-logos";

export type Depoimento = { nome: string; cargo: string; foto: string; texto: string };

export const DEPOIMENTOS: Depoimento[] = [
  {
    "nome": "Patrick Egidio",
    "cargo": "Product Owner | Product Manager",
    "foto": "/inicio/ie3/img/depo-patrick-egidio.webp",
    "texto": "Como Head de Inovação na EVUP, conduziu uma série de pesquisas com os principais clientes dos nossos sistemas. Esses feedbacks nos deram **uma ampla visão das melhorias de usabilidade e dos gaps de funcionalidades** que alimentaram nosso backlog. Tem extremo foco em atingir objetivos e gerar resultados."
  },
  {
    "nome": "Luiz Prestes",
    "cargo": "Consultor Especialista em Deliverys Ifood em Curitiba",
    "foto": "/inicio/ie3/img/depo-luiz-prestes.webp",
    "texto": "Possui competências técnicas e uma excelente visão estratégica focada na usabilidade e no sucesso do cliente. **Conseguiu melhorar nosso antigo sistema de 10 anos de desenvolvimento com apenas 10 meses de muito trabalho.** Mais de 10.000 usuários estão gratos pela nova interface que você projetou."
  },
  {
    "nome": "Paulo Repa",
    "cargo": "Technical Consultant at Denodo",
    "foto": "/inicio/ie3/img/depo-paulo-repa.webp",
    "texto": "Recomendo a Dani com entusiasmo por suas habilidades em **decisões orientadas por dados e design thinking**. Na Gauge, ela identificava padrões e tendências que ajudavam nossos clientes a fazer escolhas estratégicas, usando empatia e foco no usuário para criar soluções inovadoras. (Tradução livre do inglês.)"
  },
  {
    "nome": "Denner Junkes Cardoso",
    "cargo": "Product | UX/UI Designer",
    "foto": "/inicio/ie3/img/depo-denner-junkes-cardoso.webp",
    "texto": "Fiz parte de um time liderado pela Dani na Gauge, em um projeto que **saiu de estado crítico para um A+**. É uma profissional que engaja com o time, procura estar próxima das pessoas e eleva muito o nível técnico da equipe, buscando excelência e organizando muito bem os recursos disponíveis."
  },
  {
    "nome": "Fernanda Reynaud Duque-Estrada",
    "cargo": "Marketing | Estratégia | Transformação e Aceleração de Negócios",
    "foto": "/inicio/ie3/img/imagem-10.webp",
    "texto": "Uma profissional extremamente competente, com conhecimento profundo em experiência de usuários, construção de produtos e soluções inovadoras. Como líder técnica, sempre atuou de forma proativa, **trazendo visões claras e objetivos bem alinhados aos desafios de negócios** dos clientes. Como gestora, uma figura de referência em entrega de qualidade."
  },
  {
    "nome": "Thais Mariah de Lima",
    "cargo": "Product Manager | SaaS & Agile Delivery | B2B/B2C",
    "foto": "/inicio/ie3/img/depo-thais-mariah-de-lima.webp",
    "texto": "Uma profissional extremamente dedicada e detalhista. Constantemente atualizada com as inovações do mercado, traz não apenas qualidade técnica para os projetos, mas também **insights e tendências que por vezes passam despercebidos aos demais**."
  },
  {
    "nome": "Jorge Rocha de Souza",
    "cargo": "Founder - Safe Go Tur",
    "foto": "/inicio/ie3/img/imagem-12.webp",
    "texto": "Estou tendo o prazer de trabalhar com a Dani e posso afirmar que sua dedicação, competência e profissionalismo **fazem toda a diferença em qualquer time**. É comprometida com resultados, tem excelente comunicação e é colaborativa. Uma profissional completa, que entrega com qualidade e agrega valor por onde passa."
  },
  {
    "nome": "Marco Aurélio Silva Neto",
    "cargo": "Gerente de projetos",
    "foto": "/inicio/ie3/img/depo-marco-aurelio-silva-neto.webp",
    "texto": "Excelente profissional, com uma bagagem de conhecimento excepcional. No Simepar, somando as experiências de negócio com **a visão de produto, usabilidade e mercado trazida pela Dani**, estamos desenvolvendo uma nova fase para o projeto ClimatOS. Recomendação garantida."
  },
  {
    "nome": "Danilo Mesquita",
    "cargo": "Escritor | Especialista em Produtos SaaS | Inovação | Operações e Tecnologia | Liderança | Automação | Inteligência Artificial | Fidelização e Benefícios | 25 Anos de TI | 15 anos em Negócios",
    "foto": "/inicio/ie3/img/depo-danilo-mesquita.webp",
    "texto": "Dani Moscatelli é uma profissional altamente competente e disruptiva. Seu trabalho traz **um importante diferencial que agrega valor à experiência do usuário**. É inovadora e comprometida com a qualidade do que faz."
  },
  {
    "nome": "Isabela Valls",
    "cargo": "UX Researcher | Service Designer | User-centered Design | Qualitative Research | Quantitative Research",
    "foto": "/inicio/ie3/img/imagem-22.webp",
    "texto": "Ela tem um talento único para lidar com questões extremamente complexas, **transformando problemas em oportunidades**. Na Gauge, liderou o projeto de Transformação Digital da Fujifilm Brasil com uma comunicação impecável. Na Evup, construindo o departamento de Inovação do zero, trouxe clareza e uma liderança que nos fez avançar com confiança."
  },
  {
    "nome": "Giovanna Buranello",
    "cargo": "Product Designer | UX Strategy | Scaling Fintech Products | E-commerce",
    "foto": "/inicio/ie3/img/depo-giovanna-buranello.webp",
    "texto": "Estudei com a Dani no MBA da FIAP, onde sua experiência em design de serviços dava peso real para cada debate. Em um projeto meu, ela **identificou um loop que prendia o usuário** no fluxo de perfil PF e PJ, um ponto crítico que eu não tinha enxergado e que fez diferença real no resultado."
  },
  {
    "nome": "Paulo Sales",
    "cargo": "Tech lead at Boldr",
    "foto": "/inicio/ie3/img/depo-paulo-sales.webp",
    "texto": "Poucas pessoas ficam calmas em meio ao caos, e a Dani é uma. Em um produto com muitos problemas de funcionalidades e interface, ela foi capaz de **criar soluções simples e criativas**. Recomendo se você busca alguém que leve o seu produto para outro patamar."
  },
  {
    "nome": "Ian Douglas",
    "cargo": "Desenvolvedor de Software Senior | Python | Typescript | Full-Cycle | Arquitetura de soluções",
    "foto": "/inicio/ie3/img/depo-ian-douglas.webp",
    "texto": "O produto criado por ela possui alto valor agregado e faz toda a diferença na qualidade da entrega. Ela **gerou uma radical mudança de perspectiva sobre a sua área**: de algo secundário ou supérfluo para uma questão essencial, que pode definir se o produto realmente vai ser utilizado."
  },
  {
    "nome": "Massao Cassadori",
    "cargo": "Head Design e Produto na Gauge",
    "foto": "/inicio/ie3/img/depo-massao-cassadori.webp",
    "texto": "Duas palavras definem a Dani: **excelência e compromisso**. Trabalhamos juntos como gestores e, desde o início, ficou claro que ela era uma pessoa de presença forte e uma profissional com nível técnico altíssimo, que domina as abordagens e métodos necessários para uma entrega de alta qualidade."
  },
  {
    "nome": "Rafael Rosa Reis",
    "cargo": "IT Manager | Lean-Agile Trainer",
    "foto": "/inicio/ie3/img/depo-rafael-rosa-reis.webp",
    "texto": "A Dani demonstra um incrível grau de senioridade e liderança, com muita experiência técnica e de gestão de pessoas. À frente do time de UX Design, **tem desempenhado um papel importantíssimo no processo de transformação digital** no qual trabalhamos juntos."
  },
  {
    "nome": "Alessandra Santos",
    "cargo": "Gestão de Projetos e PMO | Product Owner | Métodos Ágeis e Delivery",
    "foto": "/inicio/ie3/img/depo-alessandra-santos.webp",
    "texto": "Trabalhamos no projeto de desenho de processos e metodologia de trabalho na Atrativa, e aprendi muito sobre UX, algo que ela domina e fala a respeito com muita propriedade. É detalhista e dedicada a **facilitar o trabalho dentro da empresa sem deixar de atender todas as necessidades dos clientes**."
  },
  {
    "nome": "Priscila Massaro",
    "cargo": "Senior Product Designer at Global Payments Inc.",
    "foto": "/inicio/ie3/img/depo-priscila-massaro.webp",
    "texto": "Extremamente qualificada e muito atenta aos detalhes, **focada em propor a melhor experiência para o usuário independente dos obstáculos**. Suas opiniões decididas e com propriedade foram fundamentais para o sucesso das entregas, e ela despertou no time o desejo por melhores definições de processo e padrões de documentação."
  },
  {
    "nome": "Euclisio Mendes",
    "cargo": "Coordenador de desenvolvimento da empresa Way2 Technology",
    "foto": "/inicio/ie3/img/depo-euclisio-mendes.webp",
    "texto": "Extremamente profissional, com domínio total do assunto. Com certeza uma referência quando se trata de UX. **Realizou um excelente trabalho, com entregas além das expectativas.**"
  },
  {
    "nome": "Gabriel Petz Santana",
    "cargo": "Líder técnico | Analista/Dev Python Sênior",
    "foto": "/inicio/ie3/img/depo-gabriel-petz-santana.webp",
    "texto": "Profissional com experiência na área, foi capaz de **suprir nossas necessidades em UX com consultoria e protótipo de alta fidelidade**, atendendo nossos pedidos. Recomendo para serviços que exijam uma profissional que conheça interfaces mobile e usabilidade para o usuário."
  },
  {
    "nome": "Arthur Pedro",
    "cargo": "Product Designer @ CESAR | Mestrando | Pesquisador @ CISSA/CESAR",
    "foto": "/inicio/ie3/img/imagem-30.webp",
    "texto": "A paixão dela pelo design sempre foi contagiante, com uma habilidade técnica excepcional e um lado empático na gestão. Com ela **aprendi muito sobre como trabalhar estrategicamente de ponta a ponta em um produto**. A régua nas entregas sempre foi alta, e o time conseguia surpreender em cada etapa."
  },
  {
    "nome": "Aline Mariane Gonçalves",
    "cargo": "Product Designer | UX/UI Designer na PremieRpet®",
    "foto": "/inicio/ie3/img/depo-aline-mariane-goncalves.webp",
    "texto": "Uma inspiração como liderança e pelo conhecimento técnico em experiência do usuário e tecnologia, com **uma visão estratégica impressionante**. Dá liberdade, feedbacks construtivos e, se precisar, senta ao lado para ajudar. Veste a camisa da empresa e dos clientes e levanta a régua dos projetos."
  }
];

/** Artigos. Os quatro com "#" continuam como na página de HTML: os textos ainda não têm endereço publicado. */
export const ARTIGOS: (Omit<CardDeArtigoProps, "selo" | "nivel"> & { selo?: string })[] = [
  {
    "formato": "destaque",
    "selo": "Mais recente",
    "categoria": "BUSINESS DESIGN",
    "data": "01/09/2026",
    "titulo": "O problema não é o discurso comercial. É a arquitetura do serviço.",
    "href": "https://pt.linkedin.com/pulse/design-de-servi%C3%A7os-na-pr%C3%A1tica-o-prefeito-que-decidiu-pela-moscatelli-a2tqf?trk=public_post_feed-article-content",
    "novaAba": true,
    "imagem": "/inicio/ie3/img/imagem-15.webp",
    "alt": "Design de Serviços na prática",
    "resumo": "Quando o cliente compra transformação, não existe um produto pronto para provar seu valor antes da contratação. O desafio, então, não é vender melhor, é desenhar uma experiência que torne o valor e a confiança visíveis ao longo da jornada.",
    "tempoDeLeitura": "10–12 min de leitura"
  },
  {
    "categoria": "AI & PRODUCT",
    "data": "12/05/26",
    "titulo": "Em 20 horas construí um produto digital do zero com IA. Aqui está o que deu errado.",
    "href": "#",
    "imagem": "/inicio/ie3/img/imagem-36.webp",
    "alt": "Mulher programando e analisando código em estação de trabalho",
    "resumo": "A velocidade impressiona mas a complexidade vem depois e a conta também.",
    "tempoDeLeitura": "6 -7 min de leitura"
  },
  {
    "categoria": "Design de serviços",
    "data": "03/07/26",
    "titulo": "Design de Serviços na prática: o prefeito que decidiu enxergar a cidade pela perspectiva de um morador de rua",
    "href": "#",
    "imagem": "/inicio/ie3/img/imagem-32.webp",
    "alt": "Jornada & Métricas",
    "resumo": "Um experimento controverso revelou por que serviços devem partir da realidade de quem os utiliza.",
    "tempoDeLeitura": "8 min de leitura"
  },
  {
    "categoria": "Arquitetura de Serviços",
    "data": "16/12/25",
    "titulo": "Quando o Usuário Desiste Antes de Começar: O Custo Real de uma Experiência Mal Projetada",
    "href": "#",
    "imagem": "/inicio/ie3/img/imagem-35.webp",
    "alt": "Mulher frustrada segurando o celular no sofá ilustrando experiência mal projetada",
    "resumo": "Um fluxo ruim afasta usuários antes mesmo da primeira entrega.",
    "tempoDeLeitura": "7 min de leitura"
  },
  {
    "categoria": "INOVAÇÃO & STARTUPS",
    "data": "18/09/26",
    "titulo": "Startup Weekend AI Curitiba: Sentindo na Pele os Desafios que Meus Clientes Enfrentam",
    "href": "#",
    "imagem": "/inicio/ie3/img/imagem-34.webp",
    "alt": "Startup Weekend AI Curitiba",
    "resumo": "Validar uma ideia é só o começo. Transformá-la em negócio exige outras competências. Foi isso que vivi na prática.",
    "tempoDeLeitura": "6–7 min de leitura"
  }
];

export const LOGOS: LogoDaFaixa[] = [
  {
    "nome": "Wizard by Pearson",
    "src": "/inicio/ie3/img/logo-imagem-16.webp"
  },
  {
    "nome": "Stefanini Group",
    "src": "/inicio/ie3/img/logo-imagem-08.webp"
  },
  {
    "nome": "CiRculaRe powered by Circular Brain",
    "src": "/inicio/ie3/img/logo-imagem-21.webp"
  },
  {
    "nome": "Unicamp",
    "src": "/inicio/ie3/img/logo-imagem-29.webp"
  },
  {
    "nome": "Safe Go",
    "src": "/inicio/ie3/img/logo-imagem-04.webp"
  },
  {
    "nome": "Sisand",
    "src": "/inicio/ie3/img/logo-imagem-25.webp"
  },
  {
    "nome": "Simepar",
    "src": "/inicio/ie3/img/logo-imagem-18.webp"
  },
  {
    "nome": "Selecty",
    "src": "/inicio/ie3/img/logo-imagem-31.webp"
  },
  {
    "nome": "MadeiraMadeira",
    "src": "/inicio/ie3/img/logo-imagem-27.webp"
  },
  {
    "nome": "Ministério da Educação",
    "src": "/inicio/ie3/img/logo-imagem-33.webp"
  },
  {
    "nome": "Ministério do Desenvolvimento, Indústria e Comércio Exterior",
    "src": "/inicio/ie3/img/logo-imagem-13.webp"
  },
  {
    "nome": "IBPT",
    "src": "/inicio/ie3/img/logo-imagem-03.webp"
  },
  {
    "nome": "Gazeta do Povo",
    "src": "/inicio/ie3/img/logo-imagem-01.webp"
  },
  {
    "nome": "Fujifilm",
    "src": "/inicio/ie3/img/logo-imagem-05.webp"
  },
  {
    "nome": "Sistema Fiep",
    "src": "/inicio/ie3/img/logo-imagem-23.webp"
  },
  {
    "nome": "Farmácias APP",
    "src": "/inicio/ie3/img/logo-imagem-19.webp"
  },
  {
    "nome": "CGU - Controladoria Geral da União",
    "src": "/inicio/ie3/img/logo-imagem-02.webp"
  },
  {
    "nome": "Prefeitura de Blumenau",
    "src": "/inicio/ie3/img/logo-imagem-07.webp"
  },
  {
    "nome": "Atacadão",
    "src": "/inicio/ie3/img/logo-imagem-11.webp"
  },
  {
    "nome": "AkzoNobel",
    "src": "/inicio/ie3/img/logo-imagem-24.webp"
  },
  {
    "nome": "4VANTS",
    "src": "/inicio/ie3/img/logo-imagem-06.webp"
  }
];
