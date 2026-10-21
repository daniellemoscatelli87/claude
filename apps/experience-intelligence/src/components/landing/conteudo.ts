// Copy da landing comercial (docs/product/landing-comercial/). Textos da especificação v1 e do complemento dos
// cinco blocos, sem alteração de sentido. Único ajuste: "—" trocado por vírgula (regra do site: sem travessão).
// Exemplos fictícios e estáticos: nenhum dado vem de IA, banco ou API.

export const ANCORAS = [
  { id: "como-funciona", rotulo: "Como funciona" },
  { id: "aplicacoes", rotulo: "Aplicações" },
  { id: "diferenciais", rotulo: "Diferenciais" },
  { id: "planos", rotulo: "Planos" },
  { id: "perguntas", rotulo: "FAQ" },
];

// 01 Hero
export const CICLO = [
  { chave: "desafio", nome: "Desafio", frase: "Comece pelo que sua organização quer melhorar." },
  { chave: "descoberta", nome: "Descoberta", frase: "Saiba o que investigar e como descobrir." },
  { chave: "evidencias", nome: "Evidências", frase: "Transforme informações dispersas em compreensão." },
  { chave: "melhorias", nome: "Melhorias", frase: "Conecte descobertas a mudanças concretas." },
  { chave: "evolucao", nome: "Evolução", frase: "Acompanhe resultados e decida o próximo passo." },
] as const;

// 02 Dados de mercado (fontes da especificação; conferidas em 21/10/2026)
export const DADOS = [
  {
    numero: "70%",
    texto: "dos executivos consultados dizem que as expectativas dos consumidores evoluem mais rápido do que a capacidade de adaptação da empresa.",
    fonte: "PwC, 2025 Customer Experience Survey, pesquisa nos Estados Unidos (2025).",
    url: "https://www.pwc.com.br/pt/estudos/setores-atividade/produtos-consumo-varejo/2025/pesquisa-sobre-experiencia-do-consumidor-pwc-2025.html",
  },
  {
    numero: "29%",
    texto: "dos consumidores pesquisados afirmam que deixaram de comprar ou usar uma marca por uma experiência ruim, no ambiente físico ou digital.",
    fonte: "PwC, mesmo estudo, amostra dos Estados Unidos.",
    url: "https://www.pwc.com.br/pt/estudos/setores-atividade/produtos-consumo-varejo/2025/pesquisa-sobre-experiencia-do-consumidor-pwc-2025.html",
  },
  {
    numero: "34%",
    texto: "dos consumidores em análise global relataram reduzir gastos com uma empresa após uma experiência negativa.",
    fonte: "Qualtrics XM Institute, anúncio de 12/11/2025.",
    url: "https://www.qualtrics.com/news/businesses-risk-3-trillion-sales-poor-customer-experiences-consumers-cut-spending/",
  },
];

export const SINTOMAS = [
  {
    chave: "espera", nome: "Espera",
    sinal: "Pessoas aguardam mais do que esperavam para receber atendimento ou concluir uma etapa.",
    investigar: "Em quais etapas ocorre a espera? Qual é o tempo real e o tempo percebido? Há picos de demanda, interrupções ou falta de informação sobre os próximos passos? Como as equipes distribuem e priorizam o trabalho?",
    descobrir: "Compare registros de horários, observe o fluxo no local ou no sistema e ouça pessoas atendidas e profissionais envolvidos, sem coletar dados pessoais desnecessários.",
    transformar: "Distribuição de equipes, agendamento, priorização, comunicação, sinalização, autosserviço e organização dos fluxos.",
    pergunta: "A espera é o problema inteiro ou parte de uma jornada que perdeu previsibilidade?",
  },
  {
    chave: "abandono", nome: "Abandono",
    sinal: "Pessoas desistem de uma compra, cadastro, solicitação ou contratação antes de concluir.",
    investigar: "Em que momento acontece a desistência? O que a pessoa tentou fazer antes? Quais informações, exigências, interações ou custos aumentam o esforço? O que acontece fora do canal digital?",
    descobrir: "Examine etapas e registros agregados do fluxo, acompanhe tentativas voluntárias de uso e converse com pessoas que interromperam a jornada, quando possível.",
    transformar: "Regras e exigências, clareza de informações, etapas do serviço, acessibilidade, atendimento, integrações e experiência digital.",
    pergunta: "Estamos perdendo pessoas por falta de interesse ou por barreiras que criamos?",
  },
  {
    chave: "retrabalho", nome: "Retrabalho",
    sinal: "Informações precisam ser corrigidas, atividades se repetem e equipes refazem o que já deveria estar concluído.",
    investigar: "Onde o trabalho retorna? Quais dados faltam ou chegam inconsistentes? Há passagens de responsabilidade pouco claras? Quais decisões dependem de conferências manuais e sistemas desconectados?",
    descobrir: "Reconstrua o fluxo de uma ocorrência fictícia ou autorizada, converse com equipes de diferentes etapas e compare registros de correção, devolução e reabertura.",
    transformar: "Padrões de registro, responsabilidades, regras de negócio, comunicação entre áreas, treinamento, integração de sistemas e desenho do processo.",
    pergunta: "Quem está compensando, com esforço extra, uma falha do processo?",
  },
  {
    chave: "baixa-adesao", nome: "Baixa adesão",
    sinal: "Um serviço, processo, ferramenta ou iniciativa é pouco utilizado, mesmo estando disponível.",
    investigar: "As pessoas conhecem e compreendem a proposta? Ela resolve uma necessidade relevante? O acesso é viável? Há barreiras de confiança, acessibilidade, tempo ou integração à rotina? Existe desalinhamento com o trabalho real?",
    descobrir: "Compare utilização agregada com o público esperado, observe o contexto de uso e converse com pessoas que utilizam e que não utilizam a solução.",
    transformar: "Proposta de valor, comunicação, treinamento, acessibilidade, processos, incentivos, atendimento e adequação do produto ou serviço ao contexto.",
    pergunta: "A baixa utilização indica resistência das pessoas ou pouca aderência da solução às necessidades reais?",
  },
] as const;

// 03 Categoria
export const PILARES = [
  { chave: "pessoas", camada: "Pessoas", titulo: "Pessoas no centro", texto: "Compreenda necessidades, comportamentos, expectativas e dificuldades de quem vive a experiência." },
  { chave: "operacao", camada: "Serviços e operação", titulo: "Operação em perspectiva", texto: "Relacione interações visíveis a fluxos, políticas, responsabilidades, sistemas e ambientes." },
  { chave: "resultados", camada: "Resultados", titulo: "Melhoria com continuidade", texto: "Organize aprendizados, oriente mudanças e acompanhe o que realmente evolui." },
] as const;

// 04 Como funciona (texto da etapa: especificação; o que você faz / o que a plataforma organiza: complemento)
export const ETAPAS = [
  {
    titulo: "Conte o que deseja melhorar.",
    texto: "Descreva um problema, uma dúvida ou uma oportunidade. Você não precisa conhecer a causa nem ter a solução.",
    voce: "Descreve, com suas palavras, o que está acontecendo e o que gostaria que fosse diferente.",
    plataforma: "Preserva seu relato original, propõe um entendimento inicial, identifica pessoas e contextos possivelmente envolvidos e aponta informações que ainda precisamos esclarecer.",
    resultado: "Desafio contextualizado",
    planejada: false,
  },
  {
    titulo: "Descubra o que precisa saber.",
    texto: "A plataforma orienta quem ouvir, o que observar, quais registros consultar e como obter informações relevantes.",
    voce: "Segue atividades práticas, uma por vez: consulta registros, conversa com pessoas ou observa o serviço quando necessário.",
    plataforma: "Propõe um plano de investigação adaptado ao desafio, prepara perguntas e instrumentos, orienta como obter e registrar informações e permite indicar o que ainda não foi possível descobrir.",
    resultado: "Plano e atividades orientadas",
    planejada: true,
  },
  {
    titulo: "Organize o que foi descoberto.",
    texto: "Reúna relatos, observações e dados. Identifique padrões, lacunas e hipóteses que merecem investigação.",
    voce: "Registra o que observou, ouviu ou mediu e confere se a interpretação corresponde à realidade.",
    plataforma: "Relaciona informações às etapas investigadas, separa relatos de observações e registros, destaca lacunas e contradições e propõe hipóteses que ainda precisam ser verificadas.",
    resultado: "Evidências e hipóteses rastreáveis",
    planejada: true,
  },
  {
    titulo: "Encontre caminhos de melhoria.",
    texto: "Relacione descobertas a oportunidades em atendimento, processos, serviços, equipes, ambientes e tecnologia.",
    voce: "Avalia alternativas, define prioridades e escolhe o que faz sentido experimentar com sua equipe.",
    plataforma: "Conecta oportunidades às evidências, explicita premissas e riscos, sugere caminhos de teste e ajuda a estruturar responsáveis, ações e critérios de sucesso.",
    resultado: "Plano de melhoria priorizado",
    planejada: true,
  },
  {
    titulo: "Acompanhe o que mudou.",
    texto: "Planeje intervenções, defina indicadores e retome a investigação quando surgirem novas perguntas.",
    voce: "Registra intervenções realizadas, acompanha indicadores e compartilha novos aprendizados.",
    plataforma: "Relaciona mudanças aos resultados observados, documenta aprendizados, aponta dúvidas remanescentes e orienta quando aprofundar ou iniciar um novo ciclo.",
    resultado: "Evolução acompanhada",
    planejada: true,
  },
];

// 05 Demonstração
export const DEMOS = [
  {
    chave: "saude", nome: "Saúde",
    desafio: "Pacientes reclamam da demora e da falta de informação na recepção.",
    orientar: "Compare horários reais de chegada e atendimento. Observe a jornada de acolhimento. Converse com pacientes e com a equipe, respeitando privacidade e segurança.",
    compreender: "Onde a espera acontece, como é comunicada e quais processos podem contribuir para a dificuldade.",
    frentes: "Acolhimento, sinalização, fluxo, comunicação e organização do atendimento.",
  },
  {
    chave: "produto-digital", nome: "Produto digital",
    desafio: "Usuários desistem antes de concluir o cadastro.",
    orientar: "Identifique em qual etapa ocorre a desistência. Observe tentativas de uso. Verifique mensagens, requisitos e dificuldades relatadas.",
    compreender: "Quais barreiras afetam compreensão, esforço, acessibilidade e confiança.",
    frentes: "Fluxo, conteúdo, validações, acessibilidade e suporte.",
  },
  {
    chave: "colaboradores", nome: "Colaboradores e operação",
    desafio: "A troca de turno gera retrabalho e informações desencontradas.",
    orientar: "Reconstrua a sequência de passagem de informações. Ouça as equipes envolvidas. Identifique registros, ferramentas e pontos de interrupção.",
    compreender: "Onde as informações se perdem e quais dependências dificultam a continuidade do trabalho.",
    frentes: "Processos, responsabilidades, comunicação e ferramentas de apoio.",
  },
] as const;
export type DemoChave = (typeof DEMOS)[number]["chave"];

// 06 Entregáveis: título e descrição da especificação; prévia, detalhe e etiqueta do caso fictício do complemento
export const ENTREGAVEIS = [
  {
    titulo: "Desafio estruturado",
    descricao: "Um entendimento inicial claro do que precisa melhorar, de quem é impactado e do resultado desejado.",
    previa: "Como tornar a chegada à clínica mais previsível e acolhedora, compreendendo o que gera espera e insegurança?",
    detalhe: "Pessoas envolvidas: pacientes, acompanhantes e equipe de recepção. Experiência: chegada e acolhimento. Resultado desejado: clareza das etapas e redução de dificuldades evitáveis.",
    etiqueta: "Ponto de partida",
  },
  {
    titulo: "Plano de investigação orientado",
    descricao: "Atividades e instrumentos contextualizados para descobrir o que ainda não sabemos.",
    previa: "Três frentes: consultar horários, observar o acolhimento e ouvir perspectivas distintas.",
    detalhe: "Atividade A: analisar registros de chegada e chamada em formato agregado. B: observar a sequência de atendimento com autorização. C: conversar voluntariamente com pessoas atendidas e equipe, usando roteiros contextualizados.",
    etiqueta: "Atividades sugeridas",
  },
  {
    titulo: "Evidências organizadas",
    descricao: "Relatos, observações, registros e indicadores conectados à investigação.",
    previa: "Exemplos simulados: 12 relatos, 4 períodos de observação e registros agregados de horários.",
    detalhe: "Relato ilustrativo: “Não sabia quanto tempo faltava”. Observação ilustrativa: orientações diferentes na chegada. Registro ilustrativo: horários de entrada e chamada por faixa, sem identificação pessoal. Esses exemplos não formam uma amostra validada.",
    etiqueta: "Dados fictícios",
  },
  {
    titulo: "Hipóteses e oportunidades",
    descricao: "Pontos críticos e possibilidades de intervenção com indicação do que sustenta cada análise.",
    previa: "Hipótese a verificar: parte da insegurança pode estar ligada à ausência de orientação clara durante a espera.",
    detalhe: "Possíveis oportunidades: orientar a chegada, melhorar informação sobre próximas etapas e revisar o fluxo de comunicação entre recepção e atendimento. Não há causa comprovada.",
    etiqueta: "Hipótese, não diagnóstico",
  },
  {
    titulo: "Caminhos de transformação",
    descricao: "Alternativas de melhoria e próximos passos para testar mudanças.",
    previa: "Teste proposto: padronizar as orientações iniciais em uma única unidade.",
    detalhe: "Antes de mudar toda a operação, testar uma explicação simples das etapas de chegada, com participação da equipe. Definir responsáveis, duração do piloto e cuidados para acessibilidade. Trata-se de uma proposta, não de melhoria comprovada.",
    etiqueta: "Intervenção proposta",
  },
  {
    titulo: "Acompanhamento e aprendizado",
    descricao: "Indicadores e histórico para avaliar resultados e orientar a evolução.",
    previa: "Indicadores planejados: clareza percebida, dúvidas recorrentes e tempo de espera.",
    detalhe: "Comparar períodos equivalentes antes e depois do piloto, registrar percepções de pacientes e equipe e verificar se houve alterações. Resultado ainda não medido.",
    etiqueta: "Mensuração futura",
  },
];

// 07 Aplicações: labels exatas do complemento (usadas como chave)
export const PUBLICOS = ["Clientes e consumidores", "Pacientes e acompanhantes", "Colaboradores", "Usuários de sistemas", "Parceiros e fornecedores"] as const;
export const MELHORIAS = ["Atendimento", "Serviços", "Processos e operações", "Produtos digitais", "Ambientes e interações físicas", "Comunicação e relacionamento"] as const;
export const CENARIOS: { publico: string; melhoria: string; titulo: string; descricao: string; cta: string; alvo: "#demonstracao" | "#como-funciona"; aba?: DemoChave }[] = [
  { publico: "Pacientes e acompanhantes", melhoria: "Atendimento", titulo: "Reduzir dúvidas e interrupções na chegada à clínica.", descricao: "Investigar acolhimento, informações recebidas e a sequência de atendimento, respeitando as particularidades do ambiente de saúde.", cta: "Ver um exemplo de investigação", alvo: "#demonstracao", aba: "saude" },
  { publico: "Clientes e consumidores", melhoria: "Serviços", titulo: "Entender por que clientes abandonam uma contratação.", descricao: "Investigar etapas, exigências, comunicação e esforço percebido antes de presumir que falta interesse.", cta: "Entender a abordagem", alvo: "#como-funciona" },
  { publico: "Colaboradores", melhoria: "Processos e operações", titulo: "Melhorar a passagem de informações entre equipes.", descricao: "Compreender responsabilidades, registros e rupturas de comunicação que podem gerar retrabalho.", cta: "Ver um exemplo de investigação", alvo: "#demonstracao", aba: "colaboradores" },
  { publico: "Usuários de sistemas", melhoria: "Produtos digitais", titulo: "Compreender barreiras de uso em um portal interno.", descricao: "Investigar tarefas, navegação, linguagem, acessibilidade e relação do sistema com o trabalho cotidiano.", cta: "Ver um exemplo de investigação", alvo: "#demonstracao", aba: "produto-digital" },
];
export const ESTADOS_FILTRO = {
  nenhum: "Escolha quem vive a experiência e o que sua organização deseja melhorar para visualizar um exemplo.",
  soPublico: "Agora selecione o que precisa melhorar para conhecer um desafio relacionado.",
  soMelhoria: "Selecione também quem vive essa experiência.",
  semExemplo: "Ainda não há um exemplo pronto para essa combinação. A plataforma parte do desafio real da sua organização, não de uma lista fechada de cenários.",
  rodape: "Exemplos ilustrativos; a investigação real é adaptada ao contexto e às informações disponíveis.",
};

// 08 Diferenciais (exemplo de uma linha: complemento)
export const DIFERENCIAIS = [
  { chave: "desafio", titulo: "Começa pelo seu desafio", texto: "O percurso se estrutura a partir da necessidade da organização, não de um conjunto de ferramentas a escolher.", exemplo: "Uma clínica relata espera na recepção; a investigação começa por essa situação, não por um formulário universal." },
  { chave: "conducao", titulo: "Conduz sem exigir conhecimento técnico", texto: "Em vez de ensinar metodologias, orienta o que fazer, como fazer e como registrar o que foi descoberto.", exemplo: "Em vez de pedir “faça shadowing”, a plataforma mostra como observar o acolhimento e registrar o que acontece." },
  { chave: "fisico-digital", titulo: "Conecta o físico e o digital", texto: "Considera pessoas, espaços, equipes, processos, atendimento, sistemas e políticas.", exemplo: "Um abandono no aplicativo pode levar à revisão de regras, atendimento e comunicação fora da tela." },
  { chave: "evidencias", titulo: "Valoriza evidências, não palpites", texto: "Ajuda a distinguir o que foi observado, relatado e inferido, antes de orientar decisões.", exemplo: "Um relato isolado vira uma hipótese a verificar, nunca uma conclusão sobre todos os clientes." },
  { chave: "multidisciplinar", titulo: "Une diferentes competências", texto: "Foi concebida para reunir Service Design, pesquisa, experiência, negócios, operações e tecnologia.", exemplo: "Uma dificuldade no serviço pode exigir pesquisa com pessoas, análise operacional e revisão de processos digitais." },
  { chave: "continuidade", titulo: "Evolui com sua organização", texto: "Cada desafio pode alimentar o aprendizado e novas oportunidades de melhoria.", exemplo: "Após um teste de melhoria, os resultados registrados orientam o próximo ajuste, em vez de encerrar o aprendizado." },
] as const;

// 11 Planos (sem preço e sem lista de recursos)
export const PLANOS = [
  { nome: "Essential", para: "Equipes que precisam começar a organizar desafios e investigações.", proposta: "Uma entrada guiada para estruturar necessidades e dar direção às primeiras melhorias.", preco: "A definir" },
  { nome: "Professional", para: "Organizações que querem incorporar a melhoria de experiências à rotina.", proposta: "Maior profundidade de investigação, colaboração e acompanhamento, conforme escopo final do plano.", preco: "A definir" },
  { nome: "Transformation", para: "Organizações com desafios complexos que desejam apoio especializado adicional.", proposta: "Plataforma combinada com serviços sob demanda do estúdio, sujeitos a proposta própria.", preco: "Sob consulta" },
];

// 12 FAQ
export const FAQ: [string, string][] = [
  ["O que é a DM | Experience Intelligence?", "É uma plataforma concebida para ajudar organizações a investigar desafios e orientar melhorias contínuas em experiências, serviços, produtos, atendimento, processos e operações, com pessoas no centro das decisões."],
  ["Preciso conhecer Service Design ou métodos de pesquisa?", "Não. A proposta é orientar sua equipe em ações práticas: o que investigar, quem ouvir, quais informações buscar e como registrar descobertas, sem exigir domínio das metodologias que sustentam o processo."],
  ["A plataforma trabalha apenas com experiências digitais?", "Não. Ela considera tanto o digital quanto as experiências presenciais, incluindo ambientes, relações humanas, processos internos e a operação que sustenta cada serviço."],
  ["Posso investigar a experiência de pacientes ou colaboradores?", "Sim, esses são contextos de aplicação previstos. Em temas sensíveis, a investigação deve seguir regras de privacidade, consentimento e cuidados proporcionais ao risco; a plataforma não substitui avaliação clínica, jurídica ou profissional."],
  ["A investigação é igual para todas as empresas?", "Não. A arquitetura do produto prevê interpretação do desafio e construção de atividades conforme o contexto e as evidências disponíveis, sem depender de perguntas universais fixas."],
  ["Que resultados minha organização poderá obter?", "Um desafio mais claro, uma investigação organizada, evidências e hipóteses registradas, oportunidades de melhoria e um caminho para acompanhar intervenções. A profundidade e os resultados dependem das informações disponíveis e das decisões da organização."],
  ["A inteligência artificial decide o que minha empresa deve fazer?", "Não de forma autônoma. Ela apoia o entendimento e propõe caminhos; a metodologia, a verificação de evidências e a avaliação humana são partes essenciais do processo."],
  ["A plataforma substitui uma consultoria especializada?", "Ela foi concebida para que equipes avancem com autonomia em diversos desafios. Em transformações complexas, a consultoria do estúdio pode aprofundar o diagnóstico, conduzir pesquisas e apoiar a implementação."],
  ["Como funcionam planos e pagamentos?", "As modalidades de assinatura estão em definição. Nesta fase, o acesso é por convite e não há contratação aberta na plataforma. As condições serão comunicadas quando estiverem disponíveis."],
  ["Como posso conhecer ou testar o produto?", "Você pode solicitar interesse em acesso antecipado. Durante os testes, as liberações são controladas para garantir a evolução da experiência e dos mecanismos de segurança."],
];
