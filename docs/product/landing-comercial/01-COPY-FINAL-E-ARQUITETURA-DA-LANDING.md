# DM | Experience Intelligence — Landing page comercial v1.0
**Status:** especificação de copy e experiência para revisão. **Idioma:** pt-BR. **Contexto:** página pública ANTES de login, convite e assinatura. **Data:** 20/10/2026.

## Objetivo de produto
Apresentar uma plataforma SaaS B2B de inteligência e transformação contínua de experiências centradas nas pessoas. Não confundir o produto com um sistema de pesquisa de satisfação, chatbot genérico, ferramenta exclusivamente digital, sistema clínico ou consultoria obrigatória. O produto deve conectar experiência das pessoas a atendimento, produtos, processos, ambientes físicos, equipes, tecnologias, operações e resultados organizacionais. A plataforma foi projetada para conduzir pessoas leigas por tarefas simples: a inteligência e os métodos ficam nos bastidores. A consultoria do estúdio é complementar, sob demanda.

### Regras essenciais de transparência
- Esta landing descreve a **visão comercial**. Antes da disponibilidade real de novos recursos, exibir selo contextual “Em desenvolvimento”/“Em preparação” nas demonstrações e planos; não anunciar uma funcionalidade futura como já operacional.
- No estágio atual, com acesso por convite: CTA de aquisição principal **Solicitar acesso antecipado**; CTA de quem tem conta **Entrar**. Não usar “Começar agora” se gerar um cadastro que não terá acesso.
- Não inventar clientes, depoimentos, resultados financeiros, métricas do produto, garantias de ROI, certificações, características de planos, prazos ou preços.
- Para canais de contato/lead: só habilitar CTA quando houver destino real implementado; caso não haja, usar link existente do estúdio ou botão desabilitado com estado claro, sem comportamento enganoso.
- Dados de mercado são provenientes de pesquisas com populações indicadas. Não tratar como performance garantida da plataforma.
- Modelos de IA não têm autonomia para validar fatos, adequação clínica ou resultados: sempre registrar limites e critérios de avaliação humana.

## Arquitetura global
Header sticky discreto: logo `DM | Experience Intelligence` → `Como funciona` / `Aplicações` / `Diferenciais` / `Planos` / `Perguntas frequentes`; ações `Entrar` (secondary) + `Solicitar acesso` (primary). Âncoras com scroll suave **respeitando** prefers-reduced-motion; hamburger mobile com fechamento ao navegar. Formulário de login **fora** da landing, em rota própria. Maior CTA primário na primeira dobra e ao final; CTA contextual para consultoria na seção apropriada.

---

## 01 — HERO | Uma promessa diferenciadora
**Eyebrow:** INTELIGÊNCIA PARA TRANSFORMAR EXPERIÊNCIAS

**H1:** Experiências melhores começam quando entendemos o que precisa mudar.

**Subtítulo:** Transforme desafios em caminhos concretos de melhoria para clientes, pacientes, usuários, colaboradores e todas as pessoas que se relacionam com sua organização.

**Apoio:** A DM | Experience Intelligence combina inteligência artificial, conhecimento especializado e condução prática para ajudar sua equipe a investigar o que acontece, conectar a experiência à operação e orientar transformações em serviços, processos, atendimento e produtos físicos ou digitais.

**Microcopy:** Você apresenta o desafio. A plataforma orienta os próximos passos — sem exigir conhecimentos de Service Design ou pesquisa.

**CTA principal (fase de convite):** Solicitar acesso antecipado
**CTA secundário:** Ver como funciona
**CTA discreto no header:** Entrar
**Nota abaixo do CTA:** Acesso por convite durante a fase de testes.

**Componente recomendado:** Hero editorial em duas colunas. Coluna esquerda com H1, copy e CTAs. Coluna direita com **visualizador interativo do ciclo de transformação**, representado por 5 nós conectados: `Desafio → Descoberta → Evidências → Melhorias → Evolução`. Ao clicar em cada nó, troca uma frase curta do painel lateral. No celular, os nós viram faixa horizontal navegável por toque com foco acessível e texto abaixo, sem animações automáticas.

**Microcopy dos nós:**
- Desafio: “Comece pelo que sua organização quer melhorar.”
- Descoberta: “Saiba o que investigar e como descobrir.”
- Evidências: “Transforme informações dispersas em compreensão.”
- Melhorias: “Conecte descobertas a mudanças concretas.”
- Evolução: “Acompanhe resultados e decida o próximo passo.”

Ícones Lucide: `Target`, `Search`, `ClipboardList`, `Waypoints`, `ChartNoAxesCombined`. Não simular IA real.

## 02 — O CUSTO DE NÃO COMPREENDER A EXPERIÊNCIA | Dados com contexto
**Eyebrow:** O DESAFIO DAS ORGANIZAÇÕES

**H2:** O problema aparece na experiência. A causa pode estar em qualquer parte do serviço.

**Copy:** Uma reclamação pode começar no atendimento, mas nascer de um processo confuso, uma informação desencontrada, uma decisão operacional ou uma tecnologia mal integrada. Tratar apenas o sintoma é correr o risco de investir na solução errada.

**Cards de evidência externa** (dados não são medição de ROI nem desempenho do produto):
- **70%** — “dos executivos consultados dizem que as expectativas dos consumidores evoluem mais rápido do que a capacidade de adaptação da empresa.” Fonte: PwC, *2025 Customer Experience Survey*, pesquisa nos Estados Unidos (2025).
- **29%** — “dos consumidores pesquisados afirmam que deixaram de comprar ou usar uma marca por uma experiência ruim, no ambiente físico ou digital.” Fonte: PwC, mesmo estudo, amostra dos Estados Unidos.
- **34%** — “dos consumidores em análise global relataram reduzir gastos com uma empresa após uma experiência negativa.” Fonte: Qualtrics XM Institute, anúncio de 12/11/2025.

**Linha de interpretação:** Esses números mostram o peso da experiência nas decisões de consumo. Para transformar essa realidade, é preciso descobrir o que produz cada experiência — e agir sobre isso.

**Componente:** grid de três *stat cards* (número grande, contexto curto, fonte clicável, tooltip “Sobre a pesquisa”). Embaixo, faixa horizontal `Sinal percebido → O que investigar → Onde transformar`, com cards alternáveis: `Espera`, `Abandono`, `Retrabalho`, `Baixa adesão`. O usuário seleciona um sintoma e vê as possíveis dimensões investigadas, não “causas descobertas”.

**Fonte 1:** https://www.pwc.com.br/pt/estudos/setores-atividade/produtos-consumo-varejo/2025/pesquisa-sobre-experiencia-do-consumidor-pwc-2025.html
**Fonte 2:** https://www.qualtrics.com/news/businesses-risk-3-trillion-sales-poor-customer-experiences-consumers-cut-spending/
**Regra editorial:** manter escopo geográfico visível. Revisar fontes e números antes da publicação.

## 03 — NOVA CATEGORIA DE VALOR | O que é e o que não é
**Eyebrow:** MAIS DO QUE MEDIR. MAIS DO QUE DIGITALIZAR.

**H2:** Da percepção do problema à transformação do serviço.

**Copy principal:** A DM | Experience Intelligence é uma plataforma de inteligência e melhoria contínua que orienta organizações na investigação de desafios reais. Ela conecta o que as pessoas vivenciam aos processos, equipes, decisões, ambientes e tecnologias que tornam essa experiência possível.

**Texto de destaque:** O objetivo não é produzir mais dashboards. É ajudar sua organização a saber **o que investigar, por que investigar, como agir e o que acompanhar depois**.

**Três pilares em cards:**
1. **Pessoas no centro** — “Compreenda necessidades, comportamentos, expectativas e dificuldades de quem vive a experiência.” Ícone `UsersRound`.
2. **Operação em perspectiva** — “Relacione interações visíveis a fluxos, políticas, responsabilidades, sistemas e ambientes.” Ícone `Workflow`.
3. **Melhoria com continuidade** — “Organize aprendizados, oriente mudanças e acompanhe o que realmente evolui.” Ícone `RefreshCcw`.

**Componente:** visualização de três camadas sobrepostas/círculos conectados `Pessoas` / `Serviços e operação` / `Resultados`, com hover/foco que realça cada relação. Evitar Venn ilegível em mobile; usar cards em pilha.

## 04 — COMO FUNCIONA | Processo inteligente, não questionário fixo
**Eyebrow:** SUA JORNADA DE TRANSFORMAÇÃO

**H2:** Você traz o desafio. Nós ajudamos a construir o caminho.

**Lead:** O ponto de partida não é um formulário padrão, uma técnica de pesquisa ou um mapa pronto. É a necessidade real da sua organização. A partir dela, a inteligência propõe e adapta uma investigação orientada por evidências.

**5 fases visíveis ao cliente:**
1. **Conte o que deseja melhorar.** — “Descreva um problema, uma dúvida ou uma oportunidade. Você não precisa conhecer a causa nem ter a solução.” Ícone `Target`.
2. **Descubra o que precisa saber.** — “A plataforma orienta quem ouvir, o que observar, quais registros consultar e como obter informações relevantes.” Ícone `Compass`.
3. **Organize o que foi descoberto.** — “Reúna relatos, observações e dados. Identifique padrões, lacunas e hipóteses que merecem investigação.” Ícone `ListChecks`.
4. **Encontre caminhos de melhoria.** — “Relacione descobertas a oportunidades em atendimento, processos, serviços, equipes, ambientes e tecnologia.” Ícone `Lightbulb`.
5. **Acompanhe o que mudou.** — “Planeje intervenções, defina indicadores e retome a investigação quando surgirem novas perguntas.” Ícone `TrendingUp`.

**Frase-chave:** Cada desafio pede perguntas e atividades diferentes. O percurso não é uma lista fixa: ele se adapta ao contexto e às evidências reunidas.

**Componente:** **stepper interativo não linear**, com navegação por clique/toque/teclado. Exibir etapa selecionada no painel lateral com: `o que você faz` e `o que a plataforma organiza`. No celular, apresentar `Etapa 1 de 5`, controles `Anterior`/`Próxima`, sem carrossel auto-play. Etiqueta “Visão do funcionamento planejado” em funcionalidades ainda não publicadas.

## 05 — DEMONSTRAÇÃO EXPLICATIVA | Três desafios, três investigações
**Eyebrow:** VEJA A INTELIGÊNCIA EM CONTEXTO

**H2:** O mesmo método de condução. Caminhos diferentes para cada desafio.

**Copy:** Uma clínica, um produto digital e uma operação interna não precisam das mesmas perguntas. A plataforma parte da situação apresentada para definir o que investigar e como orientar sua equipe.

**Tabs interativas (exemplos ilustrativos, não resultados reais do produto):**

**Tab Saúde — ícone `HeartPulse`**
- **Desafio:** “Pacientes reclamam da demora e da falta de informação na recepção.”
- **A plataforma pode orientar:** “Compare horários reais de chegada e atendimento. Observe a jornada de acolhimento. Converse com pacientes e com a equipe, respeitando privacidade e segurança.”
- **O que se busca compreender:** “Onde a espera acontece, como é comunicada e quais processos podem contribuir para a dificuldade.”
- **Possíveis frentes de melhoria:** “Acolhimento, sinalização, fluxo, comunicação e organização do atendimento.”

**Tab Produto digital — ícone `MonitorSmartphone`**
- **Desafio:** “Usuários desistem antes de concluir o cadastro.”
- **A plataforma pode orientar:** “Identifique em qual etapa ocorre a desistência. Observe tentativas de uso. Verifique mensagens, requisitos e dificuldades relatadas.”
- **O que se busca compreender:** “Quais barreiras afetam compreensão, esforço, acessibilidade e confiança.”
- **Possíveis frentes de melhoria:** “Fluxo, conteúdo, validações, acessibilidade e suporte.”

**Tab Colaboradores e operação — ícone `Users`**
- **Desafio:** “A troca de turno gera retrabalho e informações desencontradas.”
- **A plataforma pode orientar:** “Reconstrua a sequência de passagem de informações. Ouça as equipes envolvidas. Identifique registros, ferramentas e pontos de interrupção.”
- **O que se busca compreender:** “Onde as informações se perdem e quais dependências dificultam a continuidade do trabalho.”
- **Possíveis frentes de melhoria:** “Processos, responsabilidades, comunicação e ferramentas de apoio.”

**Rodapé do módulo:** “Exemplos ilustrativos. As atividades reais dependem do desafio, do contexto e das evidências disponíveis.”

**Componente:** 3 tabs com `role=tablist`, painéis e teclado; desktop lado esquerdo desafio; lado direito mini fluxo gráfico `Desafio → Atividade orientada → Evidência → Oportunidade`. Mobile tabs horizontais roláveis com indicador ativo evidente. Nenhuma chamada real de IA e nenhum formulário de dados aqui.

## 06 — ENTREGÁVEIS | Valor tangível, sem promessas irreais
**Eyebrow:** DO DESAFIO À DECISÃO

**H2:** Conhecimento organizado para transformar, não apenas apresentar.

**Lead:** Ao longo de uma investigação, sua organização constrói uma base de trabalho que conecta o problema inicial às descobertas e às decisões de melhoria. O nível de aprofundamento depende do desafio e da qualidade das informações reunidas.

**Cards de entregáveis:**
- **Desafio estruturado** — “Um entendimento inicial claro do que precisa melhorar, de quem é impactado e do resultado desejado.” `FileText`
- **Plano de investigação orientado** — “Atividades e instrumentos contextualizados para descobrir o que ainda não sabemos.” `Map`
- **Evidências organizadas** — “Relatos, observações, registros e indicadores conectados à investigação.” `FolderSearch`
- **Hipóteses e oportunidades** — “Pontos críticos e possibilidades de intervenção com indicação do que sustenta cada análise.” `Lightbulb`
- **Caminhos de transformação** — “Alternativas de melhoria e próximos passos para testar mudanças.” `GitBranch`
- **Acompanhamento e aprendizado** — “Indicadores e histórico para avaliar resultados e orientar a evolução.” `ChartColumnIncreasing`

**Nota:** “A plataforma não garante resultados específicos nem substitui avaliações e profissionais habilitados em decisões de risco.”

**Componente:** **document stack / trilha de artefatos conectados**: 6 cartões com visualização resumida de um mesmo caso fictício (consistentes entre si), clicáveis para detalhes; nunca apresentar documentos completos inexistentes como gerados pelo produto atual.

## 07 — PARA QUEM E PARA QUÊ | Abrangência sem perder foco
**Eyebrow:** UMA ABORDAGEM. DIFERENTES REALIDADES.

**H2:** Experiências não acontecem apenas em telas — nem em um único setor.

**Lead:** Sempre que pessoas interagem com um produto, serviço, processo ou organização, existe uma experiência a compreender e a possibilidade de transformá-la.

**Filtros (dois grupos com seleção independente):**
- **Quem vive a experiência?** `Clientes e consumidores` / `Pacientes e acompanhantes` / `Colaboradores` / `Usuários de sistemas` / `Parceiros e fornecedores`.
- **O que precisa melhorar?** `Atendimento` / `Serviços` / `Processos e operações` / `Produtos digitais` / `Ambientes e interações físicas` / `Comunicação e relacionamento`.

**Microcopy de filtro:** “Escolha uma combinação para visualizar exemplos de desafios que a plataforma pode ajudar a investigar.”

**Exemplos dinâmicos curtos (quando filtros ativos):**
- “Reduzir dúvidas e interrupções na chegada à clínica.”
- “Entender por que clientes abandonam uma contratação.”
- “Melhorar a passagem de informações entre equipes.”
- “Compreender barreiras de uso em um portal interno.”

**Componente:** **combinação de chip filters com example cards**; sem prometer solução automática. Em mobile: listas de chips com quebra de linha, sem carrossel infinito. Use estados vazios: “Ainda não há um exemplo pronto para essa combinação — a plataforma parte do seu desafio real.”

## 08 — DIFERENCIAIS | Composição proprietária
**Eyebrow:** O QUE NOS MOVE

**H2:** Metodologia especializada nos bastidores. Direção clara para quem está na operação.

**6 cards de diferenciais** (3×2 desktop; 1 coluna mobile):
1. **Começa pelo seu desafio** — “O percurso se estrutura a partir da necessidade da organização — não de um conjunto de ferramentas a escolher.” `Target`.
2. **Conduz sem exigir conhecimento técnico** — “Em vez de ensinar metodologias, orienta o que fazer, como fazer e como registrar o que foi descoberto.” `Route`.
3. **Conecta o físico e o digital** — “Considera pessoas, espaços, equipes, processos, atendimento, sistemas e políticas.” `Layers3`.
4. **Valoriza evidências, não palpites** — “Ajuda a distinguir o que foi observado, relatado e inferido, antes de orientar decisões.” `ScanSearch`.
5. **Une diferentes competências** — “Foi concebida para reunir Service Design, pesquisa, experiência, negócios, operações e tecnologia.” `Network`.
6. **Evolui com sua organização** — “Cada desafio pode alimentar o aprendizado e novas oportunidades de melhoria.” `RefreshCcw`.

**Componente:** cards com estado de foco e pequenos microdiagramas por item (evitar seis parágrafos longos), sem animações chamativas. Ao passar o mouse ou focar, mostrar exemplo em uma linha.

## 09 — PLATAFORMA + CONSULTORIA | Dois caminhos complementares
**Eyebrow:** AUTONOMIA QUANDO POSSÍVEL. ESPECIALISTAS QUANDO NECESSÁRIO.

**H2:** Sua equipe pode avançar sozinha. E contar com especialistas quando o desafio pedir mais.

**Lead:** A DM | Experience Intelligence foi concebida para apoiar investigações e melhorias com autonomia. Em situações de maior complexidade, a Dani Moscatelli | Experience Design Studio pode aprofundar pesquisas, facilitar alinhamentos e apoiar o redesenho e a implementação de serviços.

**Coluna A — Plataforma**
- **Título:** “Inteligência para o dia a dia da organização.”
- “Jornada guiada a partir do desafio.”
- “Orientações práticas e instrumentos contextualizados.”
- “Organização de evidências e oportunidades.”
- “Acompanhamento contínuo das melhorias.”
- **CTA:** “Conhecer a plataforma” → seção Como funciona.

**Coluna B — Consultoria especializada**
- **Título:** “Profundidade para transformações complexas.”
- “Pesquisa e diagnóstico conduzidos por especialistas.”
- “Análise de contextos, operações e relações entre áreas.”
- “Cocriação e redesenho de serviços e experiências.”
- “Facilitação e apoio à implementação e avaliação.”
- **CTA:** “Conversar sobre consultoria” → contato real do estúdio.

**Faixa abaixo:** “Não é uma escolha definitiva: a consultoria pode potencializar o trabalho realizado na plataforma, sem substituir a autonomia da sua equipe.”

**Componente:** **comparison split cards**, cada coluna com identidade visual própria, sem transmitir que consultoria é necessária para resultados básicos. Ícone `Laptop` / `Handshake`. Em mobile, cards empilhados. Evitar tabela horizontal de difícil leitura.

## 10 — RESPONSABILIDADE E CONFIANÇA | Diferenciar de respostas automáticas
**Eyebrow:** INTELIGÊNCIA COM RESPONSABILIDADE

**H2:** Boas decisões precisam de perguntas melhores — e evidências confiáveis.

**Copy:** A inteligência artificial apoia a organização do desafio e a condução das atividades, mas não transforma suposições em fatos. O processo foi concebido para indicar lacunas de informação, respeitar contextos sensíveis e manter pessoas responsáveis pelas decisões.

**Três pontos curtos:**
- **Privacidade primeiro.** “Oriente o registro apenas das informações necessárias; evite dados pessoais e sensíveis não autorizados.” `ShieldCheck`.
- **Evidências com contexto.** “Relatos, registros e observações possuem limites diferentes; a análise precisa reconhecer isso.” `ScanSearch`.
- **Decisão humana.** “Recomendações orientam a investigação e a transformação; não substituem responsabilidade profissional.” `UserRoundCheck`.

**Nota técnica de publicação:** Só publicar afirmações de proteção efetivamente implementadas e auditadas; nunca declarar “LGPD 100%”, “criptografia ponta a ponta” ou “RAG validado” sem verificação.

**Componente:** faixa de confiança com 3 itens ilustrados + link visível para política de privacidade real (quando publicada).

## 11 — PLANOS E INVESTIMENTO | Reservar sem inventar preço
**Eyebrow:** PLANOS E ACESSO

**H2:** Uma forma de evoluir experiências de acordo com a realidade da sua organização.

**Lead:** Estamos estruturando as modalidades comerciais da DM | Experience Intelligence. A proposta é oferecer autonomia para o trabalho contínuo e opções de apoio especializado conforme a complexidade dos desafios.

**Selo geral:** “Planos em definição • Acesso antecipado por convite”

**Card 1 — Essential (proposta em estudo)**
- **Para quem:** “Equipes que precisam começar a organizar desafios e investigações.”
- **Proposta:** “Uma entrada guiada para estruturar necessidades e dar direção às primeiras melhorias.”
- **Preço:** “A definir”
- **CTA:** “Tenho interesse”

**Card 2 — Professional (proposta em estudo)**
- **Para quem:** “Organizações que querem incorporar a melhoria de experiências à rotina.”
- **Proposta:** “Maior profundidade de investigação, colaboração e acompanhamento, conforme escopo final do plano.”
- **Preço:** “A definir”
- **CTA:** “Tenho interesse”

**Card 3 — Transformation (proposta em estudo)**
- **Para quem:** “Organizações com desafios complexos que desejam apoio especializado adicional.”
- **Proposta:** “Plataforma combinada com serviços sob demanda do estúdio, sujeitos a proposta própria.”
- **Preço:** “Sob consulta”
- **CTA:** “Conversar sobre minha necessidade”

**Nota abaixo dos cards:** “Nomes, recursos e condições dos planos estão sujeitos a validação. A contratação ainda não está disponível nesta fase.”

**Componente:** **pricing cards 3 colunas** com selos e duas ações; não incluir listas de features ou limites numéricos não confirmados. Mobile cards empilhados; ação sempre clara. Caso não haja canal de captura de leads funcional, substituir `Tenho interesse` por `Solicitar acesso antecipado` com destino operacional.

## 12 — PERGUNTAS FREQUENTES | 10 questões completas
**Eyebrow:** FAQ

**H2:** O que você precisa saber antes de começar.

**1. O que é a DM | Experience Intelligence?**
“É uma plataforma concebida para ajudar organizações a investigar desafios e orientar melhorias contínuas em experiências, serviços, produtos, atendimento, processos e operações, com pessoas no centro das decisões.”

**2. Preciso conhecer Service Design ou métodos de pesquisa?**
“Não. A proposta é orientar sua equipe em ações práticas: o que investigar, quem ouvir, quais informações buscar e como registrar descobertas, sem exigir domínio das metodologias que sustentam o processo.”

**3. A plataforma trabalha apenas com experiências digitais?**
“Não. Ela considera tanto o digital quanto as experiências presenciais, incluindo ambientes, relações humanas, processos internos e a operação que sustenta cada serviço.”

**4. Posso investigar a experiência de pacientes ou colaboradores?**
“Sim, esses são contextos de aplicação previstos. Em temas sensíveis, a investigação deve seguir regras de privacidade, consentimento e cuidados proporcionais ao risco; a plataforma não substitui avaliação clínica, jurídica ou profissional.”

**5. A investigação é igual para todas as empresas?**
“Não. A arquitetura do produto prevê interpretação do desafio e construção de atividades conforme o contexto e as evidências disponíveis, sem depender de perguntas universais fixas.”

**6. Que resultados minha organização poderá obter?**
“Um desafio mais claro, uma investigação organizada, evidências e hipóteses registradas, oportunidades de melhoria e um caminho para acompanhar intervenções. A profundidade e os resultados dependem das informações disponíveis e das decisões da organização.”

**7. A inteligência artificial decide o que minha empresa deve fazer?**
“Não de forma autônoma. Ela apoia o entendimento e propõe caminhos; a metodologia, a verificação de evidências e a avaliação humana são partes essenciais do processo.”

**8. A plataforma substitui uma consultoria especializada?**
“Ela foi concebida para que equipes avancem com autonomia em diversos desafios. Em transformações complexas, a consultoria do estúdio pode aprofundar o diagnóstico, conduzir pesquisas e apoiar a implementação.”

**9. Como funcionam planos e pagamentos?**
“As modalidades de assinatura estão em definição. Nesta fase, o acesso é por convite e não há contratação aberta na plataforma. As condições serão comunicadas quando estiverem disponíveis.”

**10. Como posso conhecer ou testar o produto?**
“Você pode solicitar interesse em acesso antecipado. Durante os testes, as liberações são controladas para garantir a evolução da experiência e dos mecanismos de segurança.”

**Componente:** Accordion acessível *single-open* com 10 items, expansão respeitando teclado, com `aria-expanded` e ícone `Plus`→`Minus`; link direto para pergunta por âncora. Primeira resposta aberta só se validado por testes de usabilidade; default tudo fechado para melhor escaneabilidade mobile. CTA logo abaixo: `Ainda tem dúvidas? Falar com o estúdio` com destino real.

## 13 — CTA FINAL | Converter com transparência
**Eyebrow:** O PRÓXIMO PASSO É SEU

**H2:** Sua organização já tem um desafio. Vamos começar por ele?

**Body:** Quando a experiência não funciona como deveria, cada informação pode ajudar a descobrir um caminho melhor. Conheça uma abordagem que conecta pessoas, operação e tecnologia para transformar desafios em oportunidades de evolução.

**CTA principal:** Solicitar acesso antecipado
**CTA secundário:** Conhecer a consultoria
**Microcopy:** Acesso à plataforma limitado a pessoas convidadas nesta fase. Sem contratação automática.

**Componente:** CTA band de alto contraste em fundo slate escuro, tipografia clara e vermelho editorial para CTA; mini diagrama de linha com 5 nós, não reutilizar cards; no mobile texto centralizado e botões empilhados.

## 14 — FOOTER | confiança e navegação
**Logo:** DM | Experience Intelligence
**Assinatura:** Um produto da Dani Moscatelli | Experience Design Studio.
**Frase:** “Tecnologia e conhecimento para transformar experiências humanas.”
**Navegação:** Como funciona · Aplicações · Diferenciais · Planos · FAQ · Entrar
**Legais:** Política de Privacidade · Termos de Uso (somente se páginas reais). Direitos autorais e ano vigente.
**Link institucional:** site oficial do estúdio configurado no projeto.

---

## Página separada /entrar — copy funcional
**Título:** Continue de onde sua organização parou.
**Subtítulo:** Acesse seus desafios, suas atividades e os próximos passos da sua jornada de melhoria.
**Campos:** E-mail · Senha
**CTA:** Entrar
**Auxiliares:** Esqueci minha senha · Solicitar acesso antecipado
**Estado acesso restrito:** “Nesta fase, a plataforma está disponível apenas para pessoas convidadas. Se você recebeu um convite, confirme seu e-mail antes de tentar novamente.”
**Mensagem genérica de erro:** “Não foi possível entrar. Confira seus dados ou tente recuperar sua senha.”
**Link de retorno:** Conhecer a plataforma
**Logo e assinatura:** mesmo branding da landing.

## Menu e microcopy de navegação
- Menu desktop: Como funciona / Aplicações / Diferenciais / Planos / FAQ.
- Desktop: CTA principal `Solicitar acesso` com significado consistente; `Entrar` secundário.
- Mobile: menu com botões grandes e fechamento via Escape/overlay.
- Link `Voltar ao topo` no rodapé.
- Em todos os CTAs apontar destinos reais e rastreáveis; não criar formulários decorativos sem persistência e política de privacidade.

## Requisitos visuais e de usabilidade (para o Claude Code)
- Identidade institucional: Plus Jakarta Sans, slate escuro `#131A27`/`#0D1119` e vermelho editorial existente no projeto (reusar tokens; não definir uma terceira cor arbitrária). Contraste AA; botões com foco visível; não usar vermelho claro para texto pequeno em fundo branco se contraste inadequado.
- Ritmo editorial: alternar fundos claros/escuros, evitar 13 seções em sequência de grids idênticos. Seções com funções visuais diferentes: hero com visualizador, dados, diagrama, stepper, tabs, entregáveis, filtros, diferenciais, comparação, confiança, pricing, FAQ, CTA final.
- Componentes funcionais com teclado e leitores de tela; quando JS estiver desativado, fornecer versão estática legível. Tabs com botões reais e conteúdo acessível; accordion sem armadilhas de foco; sem autoplay.
- Celular primeiro: largura 320–430px, botões altura recomendada ≥44px, espaçamento adequado, texto escalável, header compacto, sem scroll horizontal da página, evitar tabelas largas.
- Performance: ícones lucide-react importados seletivamente; evitar dependências pesadas, vídeos automáticos, dashboards falsos ou 3D. Visualizações SVG/CSS leves; respeitar prefers-reduced-motion.
- SEO: único H1, hierarquia H2/H3, title/description, Open Graph, JSON-LD `SoftwareApplication` apenas com dados factuais (sem preço ou avaliação inventados), sitemap/canonical correto.
- Analytics: medir eventos agregados `hero_cta_click`, `demo_tab_change`, `pricing_interest`, `consulting_cta_click`, `faq_expand`, `login_click`, sem dados pessoais e com configuração de consentimento quando aplicável.
- Privacidade: não inserir CPF, dados de saúde ou conteúdo de usuários no exemplo público; não acionar Gemini na landing. Não expor API keys. Sem promessas técnicas não validadas.
- Status das features: se algo ainda está em desenvolvimento, sinalizar com clareza onde pertinente em demonstrações, entregáveis e planos. Não encher cada card de ressalva, mas manter um **aviso editorial honesto e visível** na área demonstração/planos, com detalhes no FAQ.
- Revisar todos os links e formulários antes da publicação. Se não existe waitlist, solicitar design e implementação com consentimento apropriado ou usar contato institucional já disponível; não inventar destino.
- Manter login e rotas protegidas intactos; revisar impacto sobre Next.js/Netlify antes de publicar; evitar builds desnecessários e custos.

## Critérios de aceitação
1. Landing pública comercial claramente separada de /entrar, sem formulário de login no hero.
2. Em menos de 10s de leitura o visitante entende o que é, para quem serve e por que é diferente.
3. CTA coerente com estado atual de convite; não promete assinatura ativa.
4. Dados PwC/Qualtrics com escopo e fontes visíveis, links válidos.
5. Exemplo interativo com 3 desafios diversos funciona sem IA e sem enviar dados.
6. Seções com componente diverso, responsivo e acessível.
7. Consultoria apresentada como opcional e complementar.
8. FAQ completo com perguntas de objeção, segurança e pagamento.
9. Sem inventar resultados, clientes, prazos, preços ou funcionalidades disponíveis.
10. Claude apresenta antes: plano de arquivos/rotas, componentes, estados, dependências, mudanças previstas e eventuais riscos; não alterar sem aprovação.

## Observação de marca
Usar `Dani Moscatelli | Experience Design Studio` como assinatura institucional e `DM | Experience Intelligence` como marca de produto. “Pixels are not the journey.” pode aparecer discretamente como manifesto de marca na seção operação, apenas se não competir com a proposta de valor principal.
