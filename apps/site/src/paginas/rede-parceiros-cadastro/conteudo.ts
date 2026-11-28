// Perguntas do cadastro na Rede de Parceiros: as mesmas da página de HTML (rede-parceiros/cadastro/index.html, hoje em
// apps/site/tests/referencia/rede-parceiros-cadastro.html), na mesma ordem, com os mesmos textos, ids (as colunas da
// tabela "cadastros"), regras e mensagens. O teste tests/rede-parceiros-cadastro.test.ts compara com o original.
// Os trechos em HTML (helpHtml, infoHtml, afterHtml, optionInfo) ficam como no original: o texto do consentimento
// gravado com o cadastro sai deles (cadastro.ts); a página desenha cada um com os componentes do DS.

export type Pergunta = {
  id: string;
  n: number;
  label: string;
  type: "text" | "email" | "tel" | "url" | "paragraph" | "radio" | "checkbox" | "list" | "idiomas" | "uf_cidade";
  required: boolean;
  help?: string;
  helpHtml?: string;
  infoHtml?: string;
  afterHtml?: string;
  afterIf?: (v: string) => boolean;
  placeholder?: string;
  options?: string[];
  groups?: { title: string; options: string[] }[];
  levels?: string[];
  showIf?: { id: string; test: (v: string) => boolean };
  nomeCompleto?: boolean;
  errMsg?: string;
  urlHost?: string;
  store?: "lines";
  mustInclude?: string;
  optionInfo?: Record<string, string>;
  maxlength?: number;
};
export type Secao = { title: string; n: string; questions: Pergunta[] };

export const SUPABASE_TABELA = "cadastros";
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/ChB6TTutuNv8g5BFYdy7FK?mode=gi_t";
const WA_ICON = "";

export const PJ_NO = "Não tenho interesse em atuar como PJ.";
// Autorizações (item único): uso dos dados (obrigatório) e exibição na galeria (opcional), cada um com sua caixa.
export const AUT_DADOS = "Autorizo o armazenamento e o uso dos meus dados profissionais pela rede de parceiros (obrigatório).";
export const AUT_GALERIA = "Autorizo a exibição do meu perfil na Galeria de Profissionais do site (opcional).";


export const SECTIONS: Secao[] = [
  { title: "Informações profissionais e contato", n: "Seção 1", questions: [
    { id: "nome", n: 1, label: "Qual é o seu nome completo?", type: "text" as const, required: true, nomeCompleto: true, errMsg: "Informe o seu nome completo, com nome e sobrenome." },
    { id: "empresa", n: 2, label: "Qual é o nome da sua empresa?", type: "text" as const, required: false, help: "Se você atua por meio de uma empresa, consultoria ou estúdio próprio." },
    { id: "email", n: 3, label: "Qual é o seu e-mail profissional?", type: "email" as const, required: true },
    { id: "telefone", n: 4, label: "Qual é o seu telefone/WhatsApp para contato?", type: "tel" as const, required: true, help: "Informe o número com DDD." },
    { id: "cidade_estado", n: 5, label: "Em qual cidade e estado você reside atualmente?", type: "uf_cidade" as const, required: true, help: "Escolha o estado para carregar as cidades." },
    { id: "linkedin", n: 6, label: "Qual é o seu perfil no LinkedIn?", type: "url" as const, urlHost: "linkedin.com", placeholder: "www.linkedin.com/in/seu-perfil", required: false, help: "Insira o link completo." },
    { id: "apresentacao", n: 7, label: "Como você se apresenta profissionalmente?", type: "paragraph" as const, required: true, help: "Descreva brevemente sua atuação, suas principais competências e o tipo de contribuição que costuma oferecer aos projetos." },
  ]},
  { title: "Modelo de atuação e contratação", n: "Seção 2", questions: [
    { id: "atuacao_pj", n: 8, label: "Atualmente, você atua como prestador(a) de serviços PJ?", type: "radio" as const, required: true, options: [
      "Sim, tenho CNPJ ativo (MEI, empresa ou consultoria própria).",
      "Estou em processo de formalização.",
      "Atualmente não tenho CNPJ, mas tenho interesse em atuar como PJ.",
      PJ_NO,
    ]},
    { id: "modelo_atuacao", n: 9, label: "Qual é o seu modelo de atuação profissional?", type: "checkbox" as const, required: true, options: [
      "Consultor(a) independente.",
      "Freelancer especializado(a).",
      "Profissional autônomo com atuação por projetos.",
      "Sócio(a) ou proprietário(a) de consultoria.",
      "Sócio(a) ou proprietário(a) de estúdio/agência.",
      "Especialista técnico(a) que presta serviços para outras empresas.",
      "Profissional contratado(a) que também realiza projetos como PJ.",
      "Outro.",
    ]},
    { id: "formas_colaboracao", n: 10, label: "Quais tipos de serviço você presta?", type: "checkbox" as const, required: true, options: [
      "Consultoria estratégica.",
      "Consultoria técnica especializada.",
      "Pesquisa, diagnóstico e análise.",
      "Planejamento e desenho de soluções.",
      "Desenvolvimento e implementação de soluções.",
      "Facilitação de workshops e processos colaborativos.",
      "Treinamentos e capacitação de equipes.",
      "Acompanhamento e avaliação de resultados.",
      "Apoio pontual em demandas específicas.",
      "Participação em equipes multidisciplinares.",
      "Liderança de frentes específicas de projetos.",
      "Outro.",
    ]},
    { id: "disponibilidade_colaborar", n: 11, label: "Qual seria sua disponibilidade para colaborar em projetos futuros?", type: "radio" as const, required: true, options: [
      "Disponibilidade imediata.",
      "Disponibilidade mediante agendamento.",
      "Disponibilidade parcial, conciliando com outros projetos.",
      "Disponibilidade apenas para projetos pontuais.",
    ]},
  ]},
  { title: "Áreas de especialização", n: "Seção 3", questions: [
    { id: "areas_experiencia", n: 12, label: "Em quais áreas você possui experiência profissional?", type: "checkbox" as const, required: true, groups: [
      { title: "Estratégia e Negócios", options: [
        "Estratégia de negócios.", "Business Design.", "Inovação e transformação de negócios.", "Desenvolvimento de novos produtos e serviços.", "Modelagem de negócios.", "Planejamento estratégico.", "Estratégia comercial e crescimento.", "Branding e posicionamento de marca.",
      ]},
      { title: "Design e Experiência", options: [
        "Service Design.", "Customer Experience (CX).", "Patient Experience (PX).", "User Experience (UX).", "UX Research.", "UX/UI Design.", "Product Design.", "Design de Interfaces.", "Design Systems.", "Design de Interação.", "Design Estratégico.", "Design Organizacional.", "Design de Experiência Física e Ambiental.", "Design de Informação.", "Acessibilidade e Design Inclusivo.",
      ]},
      { title: "Pesquisa e Comportamento", options: [
        "Pesquisa qualitativa.", "Pesquisa quantitativa.", "Pesquisa etnográfica.", "Pesquisa de mercado.", "Pesquisa com usuários e clientes.", "Pesquisa comportamental.", "Antropologia aplicada.", "Psicologia aplicada à experiência.", "Análise e interpretação de dados.",
      ]},
      { title: "Tecnologia e Desenvolvimento", options: [
        "Desenvolvimento Front-end.", "Desenvolvimento Back-end.", "Desenvolvimento Full Stack.", "Desenvolvimento Mobile.", "Desenvolvimento No-code/Low-code.", "Automação de processos e fluxos.", "Inteligência Artificial aplicada a negócios.", "Integração de sistemas e APIs.", "Arquitetura de soluções digitais.", "Análise e Engenharia de Dados.", "Business Intelligence (BI).",
      ]},
      { title: "Operações, Serviços e Implementação", options: [
        "Gestão e desenho de operações de serviços.", "Implantação de produtos e serviços.", "Qualidade e excelência de serviços.", "Gestão de mudanças.", "Capacitação e desenvolvimento de equipes.", "Facilitação e cocriação.", "Operações omnichannel.", "Avaliação e mensuração de experiências.",
      ]},
      { title: "Saúde e Bem-estar", options: [
        "Medicina.", "Enfermagem.", "Psicologia.", "Nutrição.", "Fisioterapia.", "Farmácia.", "Gestão hospitalar e de saúde.", "Qualidade e segurança do paciente.", "Saúde digital.",
      ]},
      { title: "Outras Especialidades", options: [
        "Comunicação e Marketing.", "Comunicação Institucional.", "Educação e aprendizagem.", "Arquitetura e ambientes.", "Consultoria regulatória e compliance.", "Direito.", "Engenharia.", "Finanças e contabilidade.", "Recursos humanos.", "Hospitalidade e turismo.", "Outra especialidade.",
      ]},
    ]},
    { id: "principal_especializacao", n: 13, label: "Qual é a sua principal área de especialização?", type: "text" as const, required: true, help: "Indique a competência pela qual você gostaria de ser reconhecido(a) e eventualmente convidado(a) a participar de projetos." },
    { id: "atividades_entregaveis", n: 14, label: "Quais são as principais atividades ou entregáveis que você consegue desenvolver?", type: "list" as const, placeholder: "Ex.: Mapeamento de jornadas", required: true, help: "Exemplos: condução de pesquisas, mapeamento de jornadas, elaboração de service blueprints, prototipação, construção de interfaces, desenvolvimento de plataformas, automações, diagnóstico de serviços, facilitação de workshops, planejamento estratégico etc." },
    { id: "etapas_projeto", n: 15, label: "Em quais etapas de um projeto você pode contribuir?", type: "checkbox" as const, required: true, options: [
      "Diagnóstico e entendimento do problema.",
      "Pesquisa e levantamento de informações.",
      "Análise de dados e identificação de oportunidades.",
      "Planejamento e definição de estratégias.",
      "Ideação e cocriação de soluções.",
      "Prototipação, testes e validação.",
      "Execução e desenvolvimento das entregas.",
      "Implementação e acompanhamento.",
      "Capacitação de equipes e gestão da mudança.",
      "Consultoria técnica ou parecer especializado.",
      "Mensuração de resultados e melhoria contínua.",
      "Atuação transversal em todas as etapas.",
    ]},

  ]},
  { title: "Segmentos e conhecimento setorial", n: "Seção 4", questions: [
    { id: "segmentos", n: 16, label: "Em quais setores de mercado você já atuou ou atende clientes?", type: "checkbox" as const, required: true, help: "Aqui não é a sua especialidade, e sim o setor dos clientes e projetos com que você trabalha. Ex.: uma pessoa de UX Research pode ter atuado em Saúde e em Varejo.", options: ["Saúde.", "Hospitalidade e turismo.", "Educação.", "Varejo.", "Serviços financeiros.", "Indústria.", "Tecnologia.", "Bens de consumo.", "Mobilidade e logística.", "Energia e sustentabilidade.", "Setor público.", "Terceiro setor.", "Outros segmentos."]},
    { id: "conhecimento_segmento", n: 17, label: "Dentro dos setores que você marcou, em quais assuntos você tem domínio aprofundado?", type: "list" as const, placeholder: "Ex.: Operação hoteleira", required: false, help: "Cite temas específicos que você conhece a fundo em cada segmento. Exemplos: jornada hospitalar, atendimento de urgência e emergência, operação hoteleira, comportamento do consumidor, serviços públicos, jornada de compra no varejo, experiência de pessoas idosas, acessibilidade etc." },
    { id: "colaboracao_multidisciplinar", n: 18, label: "Você já participou de projetos que envolveram colaboração entre diferentes áreas ou especialidades?", type: "radio" as const, required: true, options: [
      "Sim, frequentemente.",
      "Sim, em algumas ocasiões.",
      "Ainda não, mas tenho interesse.",
      "Não tenho experiência ou interesse nesse formato.",
    ]},
    { id: "experiencia_colaboracao", n: 19, showIf: { id: "colaboracao_multidisciplinar", test: (v: string) => /^Sim/.test(v) }, label: "Conte brevemente sobre essa experiência.", type: "paragraph" as const, required: false, help: "Descreva o contexto, sua contribuição e como ocorreu a colaboração entre os profissionais." },
  ]},
  { title: "Formação e experiência", n: "Seção 5", questions: [
    { id: "nivel_formacao", n: 20, label: "Qual é o seu nível de formação acadêmica?", type: "radio" as const, required: true, options: [
      "Ensino técnico.", "Graduação em andamento.", "Graduação completa.", "Especialização / MBA em andamento.", "Especialização / MBA completo.", "Mestrado.", "Doutorado.", "Formação predominantemente autodidata ou por cursos livres.", "Outro.",
    ]},
    { id: "formacao", n: 21, label: "Quais são a sua formação e as certificações, cursos ou especializações relevantes?", type: "list" as const, placeholder: "Ex.: Design Gráfico, Universidade X", required: true, help: "Inclua um item por linha: formação acadêmica ou técnica (área e instituição), certificações, cursos e especializações relacionadas à sua atuação." },
    { id: "idiomas", n: 22, label: "Você fala outros idiomas além do português? Qual o seu nível de fluência?", type: "idiomas" as const, required: false, levels: ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"], help: "Inclua o idioma, escolha o nível e adicione quantos idiomas quiser. Se não fala outro idioma, deixe em branco." },
    { id: "tempo_especialidade", n: 23, label: "Há quanto tempo você atua profissionalmente em sua principal especialidade?", type: "radio" as const, required: true, options: [
      "Menos de 1 ano.", "Entre 1 e 2 anos.", "Entre 3 e 5 anos.", "Entre 6 e 10 anos.", "Entre 11 e 15 anos.", "Entre 16 e 20 anos.", "Mais de 20 anos.",
    ]},
    { id: "tempo_independente", n: 24, label: "Há quanto tempo você presta serviços de forma independente ou atua como consultor(a)?", type: "radio" as const, required: true, options: [
      "Ainda não comecei, mas tenho interesse.", "Menos de 1 ano.", "Entre 1 e 2 anos.", "Entre 3 e 5 anos.", "Entre 6 e 10 anos.", "Mais de 10 anos.",
    ]},
    { id: "lideranca", n: 25, label: "Você possui experiência liderando projetos ou frentes de trabalho?", type: "radio" as const, required: true, options: [
      "Sim, lidero projetos completos.", "Sim, lidero frentes específicas de projetos.", "Já liderei projetos pontualmente.", "Ainda não, mas tenho interesse.", "Prefiro atuar como especialista ou executor(a).",
    ]},
  ]},
  { title: "Portfólio, cases e experiência prática", n: "Seção 6", questions: [
    { id: "possui_portfolio", n: 26, label: "Você possui portfólio, site profissional ou cases publicados?", type: "radio" as const, required: true, options: [
      "Sim, possuo portfólio online.", "Sim, possuo site profissional.", "Sim, possuo cases ou apresentações de projetos.", "Possuo trabalhos, mas não posso divulgá-los publicamente.", "Ainda não possuo portfólio estruturado.",
    ]},
    { id: "link_portfolio", n: 27, showIf: { id: "possui_portfolio", test: (v: string) => /^Sim/.test(v) }, label: "Compartilhe o link do seu portfólio, site ou cases profissionais.", type: "url" as const, placeholder: "https://", required: false, help: "Behance, Dribbble, GitHub, Notion, site próprio ou outro endereço relevante." },
    { id: "projeto_relevante", n: 28, label: "Conte brevemente sobre um projeto relevante do qual participou.", type: "paragraph" as const, required: true,
      helpHtml: "Se possível, descreva:<ul><li>Qual era o desafio ou problema?</li><li>Qual foi sua responsabilidade?</li><li>Que abordagem ou metodologia utilizou?</li><li>Qual solução foi desenvolvida?</li><li>Quais resultados foram alcançados?</li></ul>Não compartilhe informações confidenciais de clientes ou empresas." },
    { id: "servicos_especialista_externo", n: 29, label: "Você já prestou serviços para consultorias, agências ou empresas que o contrataram como especialista externo?", type: "radio" as const, required: true, options: [
      "Sim, frequentemente.", "Sim, ocasionalmente.", "Ainda não, mas tenho interesse.", "Não tenho interesse nesse modelo de colaboração.",
    ]},
    { id: "ferramentas", n: 30, label: "Quais ferramentas, plataformas ou metodologias você domina?", type: "checkbox" as const, store: "lines", required: false, help: "Abra cada categoria e marque o que você domina.", groups: [
      { title: "Design e prototipação", options: ["Figma.", "Adobe (Photoshop, Illustrator, XD).", "Sketch.", "Framer.", "Canva."] },
      { title: "Colaboração e facilitação", options: ["Miro.", "FigJam.", "Mural.", "Notion.", "Trello.", "Jira / Confluence."] },
      { title: "Pesquisa e análise", options: ["Ferramentas de pesquisa e testes (Maze, Optimal Workshop etc.).", "Formulários e questionários (Typeform, Google Forms etc.).", "Análise de comportamento (Hotjar, Clarity etc.).", "Google Analytics.", "Dovetail ou repositórios de pesquisa."] },
      { title: "Dados e inteligência artificial", options: ["Excel / Google Sheets.", "Power BI / Looker Studio.", "Python ou R para análise de dados.", "Ferramentas de IA generativa (ChatGPT, Claude, Gemini etc.).", "IA para imagem e vídeo (Midjourney, Runway etc.)."] },
      { title: "Desenvolvimento e automação", options: ["HTML, CSS e JavaScript.", "Frameworks front-end (React, Vue, Angular etc.).", "Back-end e APIs.", "Plataformas no-code / low-code (Webflow, Bubble, WordPress etc.).", "Automação (Zapier, Make, n8n etc.).", "Versionamento (Git / GitHub).", "Criação de apps com IA / vibe coding (Lovable, Bolt, v0, Replit etc.).", "Assistentes de código com IA (Cursor, Claude Code, GitHub Copilot etc.)."] },
      { title: "Gestão e produtividade", options: ["Pacote Office / Google Workspace.", "Gestão de projetos (Asana, Monday, ClickUp etc.).", "CRM (Salesforce, HubSpot etc.).", "ERP (SAP, TOTVS etc.)."] },
      { title: "Ferramentas setoriais", options: ["Prontuário eletrônico e sistemas hospitalares.", "Softwares jurídicos.", "CAD / BIM (AutoCAD, Revit etc.).", "Softwares contábeis e financeiros.", "Sistemas de RH e gestão de pessoas."] },
      { title: "Metodologias", options: ["Design Thinking.", "Frameworks de Service Design (blueprint, jornadas etc.).", "Métodos de pesquisa com usuários.", "Métodos ágeis (Scrum, Kanban).", "Lean / Lean UX.", "Jobs to be Done.", "OKRs e gestão por indicadores.", "Gestão de projetos (PMI / PMBOK).", "Lean Six Sigma.", "Gestão de processos (BPM)."] },
      { title: "Outras", options: ["Outras ferramentas ou metodologias."] },
    ]},
  ]},
  { title: "Disponibilidade e modelo de colaboração", n: "Seção 7", questions: [
    { id: "formatos_atuacao", n: 31, label: "Em quais formatos você tem disponibilidade para atuar?", type: "checkbox" as const, required: true, options: [
      "100% remoto.", "Híbrido, com encontros presenciais pontuais.", "Presencial na minha cidade/região.", "Presencial em outras cidades, mediante planejamento.", "Presencial em qualquer região do Brasil, mediante negociação.",
    ]},
    { id: "viagens", n: 32, label: "Você possui disponibilidade para deslocamentos ou viagens profissionais?", type: "radio" as const, required: true, options: [
      "Sim, tenho disponibilidade para viagens nacionais.", "Sim, mas apenas para viagens de curta duração.", "Sim, dependendo da localização e das condições.", "Apenas para deslocamentos dentro da minha região.", "Não tenho disponibilidade para viagens.",
    ]},
    { id: "horas_semanais", n: 33, label: "Qual é sua disponibilidade média para dedicação a projetos?", type: "radio" as const, required: true, options: [
      "Até 5 horas semanais.", "De 6 a 10 horas semanais.", "De 11 a 20 horas semanais.", "De 21 a 30 horas semanais.", "Mais de 30 horas semanais.", "Disponibilidade variável conforme o projeto.",
    ]},
    { id: "formatos_contratacao", n: 34, label: "Quais formatos de contratação e cobrança você aceita?", type: "checkbox" as const, required: true, help: "Marque todos que se aplicam.", options: [
      "Projeto com escopo e valor fechado.", "Valor por hora.", "Valor por diária.", "Valor por entregável.", "Contrato recorrente (mensal ou por período determinado).", "Consultoria ou mentoria pontual.", "Negociável conforme escopo e complexidade."
    ]},
    { id: "equipe_propria", n: 35, label: "Você possui uma equipe ou rede própria de profissionais com quem costuma trabalhar?", type: "radio" as const, required: true, options: [
      "Sim, possuo equipe própria.", "Sim, possuo parceiros recorrentes.", "Não, atuo individualmente.", "Não, mas tenho interesse em formar parcerias.",
    ]},
    { id: "interesse_parceria", n: 36, label: "Você teria interesse em participar de projetos em parceria com outros consultores ou especialistas?", type: "radio" as const, required: true, options: [
      "Sim, tenho bastante interesse.", "Sim, dependendo do projeto e das responsabilidades.", "Prefiro atuar individualmente.", "Gostaria de entender melhor o formato de colaboração.",
    ]},
    { id: "condicoes", n: 37, label: "Existe alguma condição ou preferência importante para sua participação em projetos futuros?", type: "paragraph" as const, required: false, help: "Compartilhe restrições de agenda, disponibilidade, preferências de atuação, condições comerciais ou outras informações que considere relevantes." },
  ]},
  { title: "Conexão e autorizações", n: "Seção 8", questions: [
    { id: "como_conheceu", n: 38, label: "Como você conheceu esta iniciativa?", type: "radio" as const, required: false, options: [
      "LinkedIn.", "Instagram.", "Indicação de outro profissional.", "Comunidade ou grupo profissional.", "Indicação da Dani Moscatelli.", "Outro.",
    ]},
    { id: "autorizacoes", n: 39, label: "Autorizações", type: "checkbox" as const, required: true, mustInclude: AUT_DADOS,
      errMsg: "Para fazer parte da rede, marque a autorização de uso dos seus dados.",
      help: "Marque as autorizações que você concede. Toque em “O que estou autorizando” para ver os detalhes.",
      // o que cada autorização permite fica recolhido junto da sua caixa; a pessoa expande se quiser ler
      optionInfo: {
        [AUT_DADOS]: "<ul>" +
          "<li>Armazenar e usar os dados profissionais deste formulário para organizar a rede de parceiros e analisar competências.</li>" +
          "<li>Entrar em contato sobre possíveis oportunidades de colaboração.</li>" +
          "<li>Os dados não serão divulgados publicamente nem compartilhados com terceiros para finalidades incompatíveis com as descritas aqui.</li></ul>",
        [AUT_GALERIA]: "<ul>" +
          "<li>Exibir na galeria do site danimoscatelli.com.br: nome, especialidade, senioridade (pelo tempo de carreira), áreas de atuação, segmentos, link do LinkedIn e foto.</li>" +
          "<li>E-mail, telefone e cidade não são exibidos.</li>" +
          "<li>Você recebe por e-mail um link para enviar sua foto e revisar como o perfil vai aparecer. Sem foto enviada, usamos a do seu LinkedIn.</li></ul>",
      },
      afterHtml: "<p class=\"aut-direitos\">Você pode pedir acesso, correção ou exclusão dos dados e retirar qualquer autorização a qualquer momento pelo e-mail <a href=\"mailto:contato@danimoscatelli.com.br\">contato@danimoscatelli.com.br</a>, observadas as hipóteses legais de conservação. Leia a <a href=\"/privacidade/\" target=\"_blank\" rel=\"noopener\">Política de privacidade</a> completa.</p>",
      options: [AUT_DADOS, AUT_GALERIA] },
  ]},
  { title: "Comunidade de networking", n: "Seção final", questions: [
    { id: "interesse_whatsapp", n: 40, label: "Você gostaria de participar do nosso grupo de networking no WhatsApp?", type: "radio" as const, required: false,
      infoHtml: "<p>Estamos construindo uma comunidade para conectar profissionais de diferentes especialidades, promover a troca de conhecimentos, compartilhar referências e fortalecer conexões profissionais.</p><p>O espaço será voltado a conversas sobre Design, Experiência Humana, Negócios, Tecnologia e Inovação, além da troca de experiências e oportunidades de colaboração.</p><p>A participação é opcional e independente deste cadastro.</p>",
      afterIf: (v: string) => /^Sim/.test(v),
      afterHtml: "<div class=\"info wa-box\"><span class=\"wa-ic\" aria-hidden=\"true\">" + WA_ICON + "</span><div><p><strong>Link de acesso ao grupo:</strong><br><a href=\"" + WHATSAPP_GROUP + "\" target=\"_blank\" rel=\"noopener\">" + WHATSAPP_GROUP + "</a></p><p>Se tiver interesse, basta acessar o link acima. A participação no grupo não é necessária para concluir seu cadastro.</p></div></div>",
      options: ["Sim, tenho interesse em participar.", "Não, obrigado(a). Quero apenas fazer parte da rede de parceiros."] },
  ]},
];
