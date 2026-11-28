// Textos do Programa Projeto Piloto (os mesmos de projeto-piloto/index.html), separados da montagem da página.
import type { ReactNode } from "react";
import { BarChart3, ClipboardCheck, FileText, Heart, Layers, Lightbulb, Search, Settings, TrendingUp, Users } from "lucide-react";

export const PILARES = [
  { icone: <Search />, titulo: "Compartilhe o seu desafio.", texto: "O seu contexto e as necessidades do negócio orientam a investigação." },
  { icone: <Layers />, titulo: "Receba uma análise especializada.", texto: "Investigação, insights e oportunidades de melhoria." },
  { icone: <BarChart3 />, titulo: "Gere valor para ambos.", texto: "Direcionamento estratégico para a empresa e aprendizado aplicado para o Studio." },
];

export const LADOS = [
  {
    rotulo: "Para sua empresa",
    titulo: "Mais clareza para tomar decisões que impulsionam seu negócio.",
    itens: ["Diagnóstico especializado", "Identificação de fricções e oportunidades", "Recomendações priorizadas para decisões e melhorias concretas"],
  },
  {
    rotulo: "Para o Studio",
    titulo: "Experiência que amplia nossa prática.",
    itens: ["Atuação em diferentes setores e contextos", "Evolução contínua de métodos e ferramentas", "Possibilidade de documentar estudos de caso, mediante autorização"],
  },
];

export const FRENTES = [
  {
    numero: "01", icone: <Search />, titulo: "Pesquisa e Estratégia de Experiência", subtitulo: "Compreender pessoas e identificar oportunidades",
    descricao: "Investigamos necessidades, expectativas e comportamentos para compreender problemas, apoiar decisões e revelar oportunidades de evolução.",
    temas: ["Pesquisa", "Comportamento", "Diagnóstico"],
  },
  {
    numero: "02", icone: <Users />, titulo: "Jornadas e Experiência do Cliente", subtitulo: "Melhorar cada interação ao longo da jornada",
    descricao: "Analisamos e redesenhamos jornadas físicas, digitais e híbridas para reduzir atritos e tornar as interações mais simples, integradas e relevantes.",
    temas: ["Jornadas", "Atendimento", "Pontos de contato"],
  },
  {
    numero: "03", icone: <Settings />, titulo: "Design e Transformação de Serviços", subtitulo: "Alinhar operações à experiência desejada",
    descricao: "Investigamos e redesenhamos os elementos que sustentam a entrega dos serviços, conectando processos, pessoas e operações às necessidades dos clientes.",
    temas: ["Serviços", "Processos", "Operações"],
  },
  {
    numero: "04", icone: <Lightbulb />, titulo: "Inovação e Desenvolvimento de Serviços", subtitulo: "Criar e reinventar serviços a partir de necessidades reais",
    descricao: "Identificamos oportunidades para conceber, aprimorar e validar serviços e experiências que gerem valor para as pessoas e para o negócio.",
    temas: ["Novos serviços", "Prototipação", "Validação"],
  },
  {
    numero: "05", icone: <Heart />, titulo: "Experiência do Colaborador", subtitulo: "Melhorar a experiência de quem faz o serviço acontecer",
    descricao: "Investigamos jornadas, ferramentas e interações de trabalho que influenciam a experiência das equipes e a qualidade dos serviços entregues.",
    temas: ["Colaboradores", "Jornadas internas", "Colaboração"],
  },
  {
    numero: "06", icone: <TrendingUp />, titulo: "Estratégia e Gestão da Experiência", subtitulo: "Orientar decisões e a evolução contínua da experiência",
    descricao: "Apoiamos organizações na definição de prioridades, iniciativas e indicadores para estruturar e acompanhar a evolução da experiência.",
    temas: ["Estratégia", "Priorização", "Indicadores"],
  },
];

export const ETAPAS = [
  { numero: "01", icone: <ClipboardCheck />, titulo: "Seleção e Alinhamento", texto: "Avaliamos a aderência da empresa ao programa e definimos o desafio, os objetivos, os acessos e as condições da parceria.", nota: "Escopo formalizado antes do início" },
  { numero: "02", icone: <Search />, titulo: "Investigação e Diagnóstico", texto: "Analisamos a experiência selecionada, identificando necessidades, pontos de atrito e oportunidades de melhoria.", nota: "Investigação orientada por Service Design" },
  { numero: "03", icone: <FileText />, titulo: "Recomendações Estratégicas", texto: "Consolidamos os principais achados e apresentamos recomendações priorizadas para apoiar as próximas decisões da empresa.", nota: "Diagnóstico e direcionamentos" },
];

export const GUIA: { numero: string; pergunta: string; resposta: ReactNode }[] = [
  {
    numero: "01",
    pergunta: "O que é o Programa Projeto Piloto?",
    resposta: (
      <>
        <p>É uma iniciativa contínua do Dani Moscatelli Experience Design Studio para desenvolver projetos de diagnóstico de experiência com empresas, a partir de desafios reais.</p>
        <p>Cada empresa selecionada participa de um projeto com escopo definido entre as partes, que inclui investigação, diagnóstico e recomendações, sem cobrança de honorários profissionais.</p>
        <p>Não se trata de uma promoção nem de uma amostra simplificada do serviço: é uma aplicação real da metodologia do Studio, dentro do escopo acordado.</p>
      </>
    ),
  },
  {
    numero: "02",
    pergunta: "Quem pode participar?",
    resposta: (
      <>
        <p>Empresas que tenham uma experiência, serviço, ambiente ou jornada que possa ser observada e analisada.</p>
        <p><strong>O programa contempla especialmente estes segmentos:</strong></p>
        <ul>
          <li><strong>Hospitalidade e alimentação:</strong> hotéis, restaurantes, bares, cafés, casas noturnas e outros estabelecimentos de atendimento ao público.</li>
          <li><strong>Saúde e bem-estar:</strong> clínicas, consultórios, centros de saúde, odontologia, estética e outros serviços relacionados.</li>
          <li><strong>Pet:</strong> clínicas e hospitais veterinários, pet shops, hotéis, creches e demais serviços destinados a animais e seus tutores.</li>
          <li><strong>Beleza e cuidados pessoais:</strong> salões de beleza, barbearias, spas, clínicas de estética e negócios relacionados.</li>
          <li><strong>Comércio e varejo:</strong> lojas, redes comerciais, shopping centers e outros espaços de consumo e atendimento.</li>
          <li><strong>Eventos e entretenimento:</strong> eventos corporativos, feiras, congressos, festivais, experiências culturais e operações de entretenimento.</li>
          <li><strong>Outros serviços:</strong> empresas de outros segmentos também podem se cadastrar, desde que exista uma experiência ou jornada passível de análise.</li>
        </ul>
        <p>Pertencer a um desses segmentos não garante a participação. Veja como funciona a seleção no tópico 06.</p>
      </>
    ),
  },
  {
    numero: "03",
    pergunta: "O que a empresa parceira recebe?",
    resposta: (
      <>
        <p>Um projeto de investigação, diagnóstico e recomendações sobre a experiência definida no escopo, sem cobrança de honorários profissionais.</p>
        <p><strong>Conforme o escopo de cada projeto, a entrega pode incluir:</strong></p>
        <ul>
          <li>diagnóstico da experiência atual;</li>
          <li>análise da jornada do cliente;</li>
          <li>identificação de pontos de fricção, falhas e necessidades;</li>
          <li>identificação de oportunidades de melhoria e inovação;</li>
          <li>análise de pontos de contato físicos e digitais;</li>
          <li>consolidação dos principais achados;</li>
          <li>recomendações priorizadas;</li>
          <li>relatório final com diagnóstico e direcionamentos.</li>
        </ul>
        <p><strong>Importante:</strong> o piloto inclui investigação, diagnóstico e recomendações. A implementação das recomendações não está incluída, e o programa não garante resultados específicos. Se a empresa quiser apoio na implementação, ele pode ser contratado separadamente.</p>
      </>
    ),
  },
  {
    numero: "04",
    pergunta: "O que é exigido da empresa parceira?",
    resposta: (
      <>
        <p>Colaboração ativa e acesso suficiente à realidade do serviço analisado. Conforme o escopo, isso pode envolver:</p>
        <ul>
          <li>acesso ao estabelecimento e aos ambientes relevantes para a experiência analisada;</li>
          <li>autorização para observar as jornadas e os pontos de contato definidos no projeto;</li>
          <li>acesso a processos, fluxos e informações necessárias ao diagnóstico;</li>
          <li>acesso a produtos e jornadas digitais, quando fizerem parte da experiência;</li>
          <li>dados e métricas relevantes, quando existirem e forem necessários;</li>
          <li>disponibilidade de responsáveis ou colaboradores para esclarecimentos e entrevistas previamente acordadas;</li>
          <li>transparência sobre limitações, problemas conhecidos e contexto da operação.</li>
        </ul>
        <p>Os acessos são definidos no escopo e formalizados antes do início. A profundidade do diagnóstico depende da qualidade das informações e do acesso disponibilizados.</p>
      </>
    ),
  },
  {
    numero: "05",
    pergunta: "Existe algum custo para participar?",
    resposta: (
      <>
        <p><strong>Não há cobrança de honorários profissionais</strong> pelo trabalho previsto no escopo do piloto.</p>
        <p>Se a execução exigir presença física, podem existir custos operacionais externos, como deslocamento, estacionamento, alimentação e, quando aplicável, hospedagem ou transporte para outra cidade. Esses custos ficam a cargo da empresa parceira apenas quando forem informados e acordados previamente. Nenhuma despesa é assumida sem a ciência da empresa.</p>
        <p>Atividades fora do escopo do piloto podem ser objeto de uma proposta comercial separada.</p>
      </>
    ),
  },
  {
    numero: "06",
    pergunta: "Como funciona a seleção?",
    resposta: (
      <>
        <p>O programa é contínuo, sem turmas ou períodos de inscrição. O cadastro registra o interesse da sua empresa, e os cadastros são avaliados considerando:</p>
        <ul>
          <li>aderência do desafio à metodologia;</li>
          <li>oportunidade de investigação e melhoria;</li>
          <li>viabilidade de acesso ao contexto necessário;</li>
          <li>possibilidade de acompanhar ou avaliar os resultados das recomendações;</li>
          <li>disponibilidade e capacidade do Studio;</li>
          <li>potencial de aprendizado para as duas partes.</li>
        </ul>
        <p>Quando houver aderência entre uma empresa cadastrada e uma oportunidade de projeto, o Studio entra em contato para uma conversa inicial.</p>
      </>
    ),
  },
  {
    numero: "07",
    pergunta: "Existe prazo para ser chamado?",
    resposta: (
      <>
        <p><strong>Não.</strong></p>
        <p>Não há prazo determinado para contato ou convocação, e o cadastro não tem validade predefinida.</p>
        <p>As empresas são consideradas à medida que surgem oportunidades compatíveis com seu perfil, segmento, localização e tipo de experiência. Não existe ordem cronológica de chamada.</p>
      </>
    ),
  },
  {
    numero: "08",
    pergunta: "Qual é a contrapartida da empresa?",
    resposta: (
      <>
        <p>Além da colaboração ativa no projeto, a empresa autoriza o Studio a utilizar os aprendizados do trabalho para aplicar e aperfeiçoar sua metodologia, nas condições definidas em contrato.</p>
        <p><strong>São duas autorizações diferentes:</strong></p>
        <ul>
          <li><strong>Uso dos aprendizados:</strong> o conhecimento metodológico gerado no projeto, sem expor informações confidenciais da empresa.</li>
          <li><strong>Divulgação de estudo de caso:</strong> a publicação de nome, marca, imagens, dados, indicadores ou resultados da empresa só acontece com autorização expressa e nos limites dessa autorização.</li>
        </ul>
        <p>Participar do programa não significa autorizar automaticamente a divulgação pública do projeto.</p>
      </>
    ),
  },
  {
    numero: "09",
    pergunta: "Como funciona a confidencialidade e a LGPD?",
    resposta: (
      <>
        <p>Antes do início, cada projeto é formalizado por contrato, com escopo, responsabilidades, acessos, contrapartidas, confidencialidade e condições de uso das informações.</p>
        <p>Quando houver tratamento de dados pessoais, o Studio observa a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018), utilizando apenas os dados necessários ao projeto e adotando medidas de segurança compatíveis com sua natureza.</p>
        <p>Informações confidenciais ou estratégicas da empresa, de seus clientes, usuários e colaboradores não são divulgadas sem autorização. Quando houver divulgação autorizada, as informações podem ser anonimizadas, agregadas ou descaracterizadas.</p>
      </>
    ),
  },
  {
    numero: "10",
    pergunta: "O cadastro garante participação?",
    resposta: (
      <>
        <p><strong>Não. O cadastro é uma manifestação de interesse.</strong></p>
        <p>A participação só é confirmada depois do alinhamento do escopo e das condições da parceria e da assinatura do contrato.</p>
      </>
    ),
  },
];

export const SEGMENTOS = [
  { valor: "Hospitalidade e alimentação", rotulo: "Hospitalidade e alimentação" },
  { valor: "Saúde e bem-estar", rotulo: "Saúde e bem-estar" },
  { valor: "Pet", rotulo: "Pet (clínicas, hospitais, lojas)" },
  { valor: "Beleza e cuidados pessoais", rotulo: "Beleza e cuidados pessoais" },
  { valor: "Comércio e varejo", rotulo: "Comércio e varejo" },
  { valor: "Eventos e entretenimento", rotulo: "Eventos e entretenimento" },
  { valor: "Outros serviços", rotulo: "Outro segmento de serviço" },
];

export const FRENTES_DO_CADASTRO = [...FRENTES.map((f) => f.titulo), "Ainda não sei identificar"];
