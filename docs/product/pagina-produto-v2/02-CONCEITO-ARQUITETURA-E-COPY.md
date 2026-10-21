# DM | Experience Intelligence — página de produto
## Proposta de arquitetura, narrativa e COPY COMPLETA v2

### Papel desta página
**Origem da visita:** menu principal e/ou card da seção “Soluções” da Home do estúdio. O visitante já teve contato com o discurso institucional. Esta é uma **página de produto** que transforma curiosidade em compreensão funcional e interesse comercial.

**Tese criativa:** **“Veja a inteligência trabalhando, antes de contratar.”** A página deve se comportar como uma amostra da lógica do produto, e não como um folheto institucional.

**Mensagem-mestra:** “Você traz o desafio. A plataforma constrói o caminho de investigação e ajuda a transformar evidências em melhorias.”

**Regra editorial:** usar linguagem direta e precisa; evitar slogans genéricos repetidos da Home. Termos como RAG e Service Blueprint ficam para uma nota técnica, não para o texto principal. Explicações devem ocorrer preferencialmente **por demonstração**.

---

## 01 — HERO DE PRODUTO | *Produto em funcionamento*

**Função cognitiva:** reconhecer de imediato o produto e antecipar sua experiência.  
**Componente recomendado:** hero assimétrico com à direita **prévia navegável da aplicação** (não imagem institucional). O mock é demonstrativo e deve sinalizar isso.

**Eyebrow:** `DM | EXPERIENCE INTELLIGENCE`  
**H1:** `Do desafio à melhoria. Com direção em cada etapa.`

**Lead:** `Uma plataforma que ajuda sua organização a investigar o que precisa mudar e a transformar descobertas em melhorias de serviços, processos, atendimento, operações e produtos digitais — com as pessoas no centro.`

**Texto de apoio:** `Você não precisa saber qual método aplicar. Descreva o desafio: a plataforma ajuda a definir o que investigar, orienta as atividades e organiza as evidências para apoiar suas próximas decisões.`

**CTA primário:** `Solicitar acesso antecipado`  
**CTA secundário:** `Explorar uma demonstração`  
**Utilidade no topo, sem concorrer com CTAs:** `Já tem acesso? Entrar`  
**Microcopy:** `Plataforma em evolução • Acesso atual por convite`.

**Mock funcional do hero, conteúdo:**
```
Seu desafio
“Os clientes iniciam o cadastro, mas muitos não concluem.”

Próxima ação sugerida
“Descubra em qual etapa as pessoas desistem.”

O que você fará
“Verifique os registros de conclusão por etapa ou descreva como esse dado pode ser obtido.”

[Ver exemplo de atividade]
```
Rótulo visual visível: `Exemplo demonstrativo — não é uma análise de dados reais`.

**Comportamento:** CTA secundário rola para seção 02; a prévia alterna entre dois estados demonstrativos (desafio e atividade). Não fazer requisições à API, nem aceitar texto livre aqui no lançamento.

---

## 02 — EXPERIMENTE A LÓGICA | *Demonstração sem IA*

**Função cognitiva:** fazer o visitante compreender a promessa por experimentação.  
**Componente:** simulador interativo “Escolha um desafio”, usando **tabs/chips** + painel principal dividido em 3 visões, com estados e transições discretas.

**Eyebrow:** `NA PRÁTICA`  
**H2:** `Desafios diferentes. Investigações diferentes.`  
**Introdução:** `A plataforma não parte de um questionário universal. O ponto de partida é o que sua organização precisa compreender.`

**Opções de escolha:** `Atendimento presencial` · `Produto digital` · `Processo interno`.

### Cenário A — Atendimento presencial
- **Desafio:** `“As pessoas reclamam da espera e da falta de informação na recepção.”`
- **A plataforma começa por:** `Entender onde a espera acontece, o que as pessoas recebem de orientação e como a operação organiza o atendimento.`
- **Sua atividade:** `“Vamos comparar horários de chegada e atendimento. Você tem esses registros?”`
- **Se a resposta for “não”:** `“Sem problema. Veja duas maneiras simples de obter essa informação ou deixe como pendente.”`
- **Evidência esperada:** `Registros de tempo de espera e relatos contextualizados.`

### Cenário B — Produto digital
- **Desafio:** `“As pessoas começam a se cadastrar, mas muitas não concluem.”`
- **A plataforma começa por:** `Localizar os pontos de desistência e compreender barreiras de uso, clareza e confiança.`
- **Sua atividade:** `“Verifique onde as tentativas são interrompidas. Se não tiver dados, podemos observar algumas tentativas de uso com participação voluntária.”`
- **Se a resposta for “não”:** `“Vou orientar como identificar esses dados ou registrar uma observação de uso, respeitando a privacidade.”`
- **Evidência esperada:** `Taxas por etapa, observações de uso e relatos de dificuldades.`

### Cenário C — Processo interno
- **Desafio:** `“Na troca de turno, as equipes perdem informações e precisam refazer atividades.”`
- **A plataforma começa por:** `Reconstruir o fluxo de comunicação, responsabilidades, ferramentas e pontos de passagem.`
- **Sua atividade:** `“Acompanhe uma passagem de turno e registre quais informações são transmitidas, onde ficam anotadas e o que precisa ser confirmado depois.”`
- **Se a resposta for “não”:** `“Use a ficha pronta de acompanhamento ou converse com quem participa desse momento.”`
- **Evidência esperada:** `Fluxo observado, registros existentes e pontos de retrabalho.`

**Legenda fixa:** `Demonstrações fictícias que ilustram o funcionamento previsto; não representam diagnósticos automáticos nem recursos já integralmente disponíveis.`

**Condução visual:** trocar **conteúdo e instrumento** conforme o cenário, não apenas mudar o título; ícones com semântica: Clock3 / MousePointerClick / Workflow. Incluir botão `Ver próximo passo` dentro do cenário para revelar o bloco de evidência.

---

## 03 — O MOTOR DE CONDUÇÃO | *Da dúvida à ação*

**Função cognitiva:** responder à objeção “minha equipe não conhece Service Design”.  
**Componente:** **fluxo bifocal** com trilha superior `O que a pessoa vê` e trilha inferior `O que a plataforma organiza`, com ligação entre as duas; não repetir stepper da Home.

**Eyebrow:** `ORIENTAÇÃO, NÃO COMPLEXIDADE`  
**H2:** `Sua equipe executa. A complexidade metodológica fica nos bastidores.`

**Texto:** `Em cada atividade, a plataforma orienta o que fazer, com quem conversar, o que observar, onde procurar informações e como registrar os resultados. Se faltar uma resposta, ela ajuda a descobrir o caminho para obtê-la.`

**Dupla de estados selecionáveis:**

**Estado 1 — O que você vê:**  
`“Converse com quem vive essa experiência. Aqui estão as perguntas e onde registrar as respostas.”`  
**Nos bastidores:** `Seleção de um protocolo de pesquisa, adaptação das perguntas ao desafio e preparação do instrumento.`

**Estado 2 — O que você vê:**  
`“Acompanhe como essa atividade acontece. Use esta ficha para registrar o que observar.”`  
**Nos bastidores:** `Estrutura de observação contextual, critérios de registro e cuidados de privacidade.`

**Estado 3 — O que você vê:**  
`“O que encontramos é um sinal, mas ainda precisamos conferir outra perspectiva.”`  
**Nos bastidores:** `Análise de suficiência, identificação de lacunas e definição do próximo passo.`

**Fechamento editorial:** `Não é necessário dominar o método para avançar com método.`

**Nota funcional:** não prometer automação irrestrita. IA propõe, regras validam, pessoas confirmam descobertas. O percurso se adapta em marcos relevantes — não a cada clique.

---

## 04 — DO DADO À DECISÃO | *Entregáveis concretos*

**Função cognitiva:** tornar palpável o que é produzido.  
**Componente:** **mesa de trabalho digital** (artifact workspace): coluna estreita com lista de artefatos, painel de visualização grande e um vínculo visual entre eles. Em mobile, seletor horizontal + detalhe.

**Eyebrow:** `O QUE SUA ORGANIZAÇÃO CONSTRÓI`  
**H2:** `Descobertas precisam virar decisões.`  
**Lead:** `O trabalho não termina em uma resposta de IA. Cada investigação pode gerar registros estruturados que conectam o desafio às hipóteses, às oportunidades e aos próximos passos.`

**Caso 100% fictício para demonstrar o percurso:** `Clínica Aurora — recepção e espera`.

**Artefato A — Desafio estruturado**  
`“Pacientes relatam insegurança durante a espera; a organização quer compreender o que está acontecendo antes de propor mudanças.”`

**Artefato B — Plano de investigação**  
`“Conferir registros de chegada e atendimento, ouvir perspectivas de pacientes e equipe e observar o fluxo de acolhimento.”`

**Artefato C — Registro de evidências**  
`“Relatos simulados indicam dúvidas sobre a ordem de atendimento; registros de horários e observações ainda precisam ser reunidos.”`

**Artefato D — Hipóteses e lacunas**  
`“A comunicação pode contribuir para a insegurança; hipótese ainda não validada. Faltam registros e outras perspectivas.”`

**Artefato E — Proposta de experimento**  
`“Testar uma orientação mais clara sobre etapas e previsão de espera, definindo responsáveis e condições de avaliação.”`

**Artefato F — Acompanhamento**  
`“Comparar, depois do teste, o esforço percebido para obter informações e os registros de dúvidas; resultados ainda não disponíveis.”`

**Legenda:** `Exemplo fictício e ilustrativo. Os entregáveis variam conforme o desafio e a qualidade das evidências.`  
**Micro-CTA:** `Ver outro exemplo` → alterna para caso Produto Digital com, no mínimo, dois artefatos equivalentes; se não houver conteúdo aprovado, remover o botão em vez de gerar texto no cliente.

---

## 05 — DA EXPERIÊNCIA À OPERAÇÃO | *Diferencial físico + digital*

**Função cognitiva:** mostrar que a solução não é um produto de pesquisas nem um gerador de interfaces.  
**Componente:** **mapa de camadas** que conecta um evento de experiência visível a possíveis elementos de bastidores. Parece um blueprint compacto, mas sem exigir que o visitante conheça esse nome.

**Eyebrow:** `ALÉM DA INTERFACE`  
**H2:** `Melhorar a experiência pode exigir mudar aquilo que o cliente não vê.`

**Texto:** `Uma dificuldade percebida no contato com a organização pode estar relacionada ao fluxo de trabalho, às responsabilidades, às informações disponíveis ou aos sistemas que sustentam o serviço.`

**Exemplo interativo:**
- **Pessoas vivenciam:** `“Não sei quanto tempo vou esperar.”`
- **Pontos de contato:** `Recepção · Comunicação · Sinalização`.
- **O que investigar na operação:** `Critérios de fila · Atualização de status · Passagem de informações · Capacidade da equipe`.
- **Possíveis intervenções a testar:** `Melhorias na orientação · Revisão do fluxo · Suporte digital à equipe`.

**Nota curta:** `Relações ilustrativas: só uma investigação pode indicar quais fatores realmente contribuem para o problema.`

**Interação:** clicar/tocar em um nó destaca conexões relevantes, não animações aleatórias. Priorizar versão acessível de lista conectada no mobile.

---

## 06 — AUTONOMIA + ESPECIALISTA | *Duas camadas de valor*

**Função cognitiva:** deixar claros os limites da plataforma e a oferta da consultoria, sem desvalorizar o SaaS.  
**Componente:** comparador por **situações** com dois painéis alternáveis `Avançar na plataforma` / `Acionar especialista`; jamais tabela extensa duplicando serviços da Home.

**Eyebrow:** `QUANDO VOCÊ PRECISA DE MAIS`  
**H2:** `Autonomia para evoluir. Especialistas para aprofundar.`

**Texto:** `A DM | Experience Intelligence foi concebida para conduzir sua equipe com autonomia. Em desafios que envolvem pesquisa sensível, múltiplas áreas ou mudanças estruturais, a Dani Moscatelli | Experience Design Studio pode apoiar a investigação e a transformação.`

**Situações demonstrativas selecionáveis:**

**Situação 1:** `“Quero entender por que usuários desistem de uma etapa do meu sistema.”`  
**Com a plataforma:** `Organize o problema, reúna dados de uso, conduza atividades orientadas e teste melhorias.`  
**Com especialista:** `Aprofunde a pesquisa, a análise dos comportamentos e o redesenho do fluxo.`

**Situação 2:** `“A experiência falha entre setores e ninguém sabe onde a responsabilidade muda.”`  
**Com a plataforma:** `Documente o fluxo, reúna evidências e acompanhe hipóteses de melhoria.`  
**Com especialista:** `Facilite alinhamentos entre áreas, redesenhe o serviço e apoie a implementação.`

**Situação 3:** `“O problema envolve contexto clínico ou informações sensíveis.”`  
**Com a plataforma:** `Estruture o desafio com informações não identificáveis e siga orientações de segurança.`  
**Com especialista:** `Avalie pesquisa e intervenção com profissionais qualificados, governança e limites aplicáveis.`

**CTA:** `Conhecer o apoio especializado` → link para página/contato real da consultoria, definido no repositório.

**Fechamento:** `A contratação da consultoria complementa a plataforma; não é condição para utilizá-la.`

---

## 07 — CONFIANÇA E LIMITES | *Por que não é apenas usar uma IA*

**Função cognitiva:** diferenciar método e responsabilidade de texto generativo.  
**Componente:** três linhas de **princípios verificáveis** em layout compacto com indicadores visuais. Não inventar selos/certificações.

**Eyebrow:** `INTELIGÊNCIA COM CRITÉRIO`  
**H2:** `Uma boa investigação não termina na primeira resposta.`

**Blocos de microcopy:**

**Evidências antes das conclusões**  
`Relatos, observações, registros e hipóteses não são a mesma coisa. A plataforma foi concebida para explicitar essas diferenças.`

**Orientação com contexto**  
`As próximas atividades são propostas a partir do desafio e das informações disponíveis, com limites metodológicos definidos.`

**Decisões com pessoas responsáveis**  
`A inteligência orienta a investigação; decisões profissionais e organizacionais continuam humanas.`

**Nota de transparência do estágio:** `Parte das capacidades descritas está em desenvolvimento e será liberada progressivamente. O acesso atual é controlado por convite.`

---

## 08 — PLANOS | *Oferta ainda em definição*

**Função cognitiva:** resolver objeção comercial sem inventar preço ou planos prontos.  
**Componente:** **pricing preview**, três opções bem legíveis, sem falsa tabela de funcionalidades; um destaque em `Professional` somente se houver estratégia comercial aprovada — por padrão, sem “mais popular”.

**Eyebrow:** `MODALIDADES DE ACESSO`  
**H2:** `Uma solução que acompanha o estágio da sua organização.`

**Intro:** `Estamos definindo os formatos comerciais da plataforma. Você pode manifestar interesse e conhecer possibilidades de uso conforme a necessidade da sua equipe.`

**Essential — Estruture os primeiros desafios**  
`Para equipes que desejam começar a investigar e organizar oportunidades de melhoria com orientação prática.`  
`Preço: em definição`  
**CTA:** `Quero conhecer este plano`.

**Professional — Evolua com continuidade**  
`Para organizações que desejam aprofundar a investigação, colaborar e acompanhar o desenvolvimento de melhorias ao longo do tempo.`  
`Preço: em definição`  
**CTA:** `Quero conhecer este plano`.

**Transformation — Plataforma + especialistas**  
`Para desafios que podem exigir apoio especializado em pesquisa, redesenho de serviços e transformação organizacional.`  
`Condições: sob consulta`  
**CTA:** `Conversar sobre esta modalidade`.

**Nota necessária:** `Modalidades e funcionalidades sujeitas à definição comercial. Ainda não há contratação automática pelo site.`  
**Implementação do CTA:** enviar ao formulário/contato existente com assunto do plano, somente se já existir fluxo válido. Caso não exista, abrir o contato comercial real — nunca botão sem destino ou coleta de dados fictícia.

---

## 09 — FAQ DE PRODUTO | *Objeções práticas*

**Função cognitiva:** ajudar decisão de contratação.  
**Componente:** accordion sem autoanimação excessiva; dois grupos opcionais `Uso e metodologia` / `Acesso e contratação`.

**Pergunta:** `Preciso conhecer Service Design ou pesquisa?`  
**Resposta:** `Não. A proposta é orientar sua equipe no que investigar, como executar atividades e como organizar o que for descoberto. Os métodos especializados sustentam a experiência, sem exigir domínio técnico do usuário.`

**Pergunta:** `Serve para processos internos e produtos digitais?`  
**Resposta:** `Sim. A plataforma foi concebida para desafios envolvendo atendimento, operações, serviços, processos e produtos físicos ou digitais, considerando os diferentes públicos que vivenciam essas experiências.`

**Pergunta:** `A plataforma faz toda a pesquisa sozinha?`  
**Resposta:** `Não. Ela ajuda a planejar e orientar atividades, mas a organização precisa obter informações, ouvir pessoas e registrar evidências quando isso for necessário. O percurso é conduzido passo a passo.`

**Pergunta:** `Ela me entrega um diagnóstico pronto?`  
**Resposta:** `O sistema foi concebido para organizar evidências, formular hipóteses e orientar decisões. A profundidade das conclusões depende da qualidade das informações reunidas; em situações complexas pode ser necessário apoio especializado.`

**Pergunta:** `Como a inteligência artificial é utilizada?`  
**Resposta:** `Ela apoia a interpretação do desafio e, nas etapas previstas, a construção de atividades e a análise de evidências. Regras metodológicas e validação humana devem limitar conclusões indevidas.`

**Pergunta:** `Posso utilizar sem contratar a consultoria?`  
**Resposta:** `Essa é a proposta do produto: autonomia. A consultoria especializada é complementar para desafios que exigem aprofundamento, facilitação ou apoio à transformação.`

**Pergunta:** `Posso contratar agora?`  
**Resposta:** `O acesso permanece por convite durante os testes. Os planos e condições comerciais serão apresentados quando estiverem disponíveis.`

**Pergunta:** `Posso registrar dados pessoais ou informações de saúde?`  
**Resposta:** `Na fase atual de testes, não inclua dados pessoais identificáveis, informações de saúde ou conteúdo confidencial nos desafios. A liberação de outros usos dependerá de regras e condições adequadas de privacidade e segurança.`

---

## 10 — CTA DE ENCERRAMENTO + RODAPÉ COMPARTILHADO

**Função cognitiva:** terminar com escolha objetiva.  
**Componente:** faixa editorial compacta e escura, com dois caminhos; **não repetir o grande CTA da Home**.

**H2:** `Seu próximo desafio já é um bom ponto de partida.`  
**Texto:** `Conheça a plataforma em evolução ou converse com o estúdio sobre um projeto que pede atuação especializada.`

**CTA primário:** `Solicitar acesso antecipado`  
**CTA secundário:** `Conversar com especialista`  
**Link utilitário:** `Já sou convidado(a) → Entrar na plataforma`.

**Rodapé:** herdar Footer do site; não criar segundo footer exclusivo replicando menus/copy institucionais. Incluir link para política de privacidade e termos **apenas se o destino existir**.

---

## Foco de conversão
- **Visitante vindo de “Soluções”:** aprender funcionamento → explorar demo → considerar acesso.
- **Visitante comparando ferramentas:** entender método, entregáveis e privacidade → considerar plano.
- **Visitante com problema complexo:** perceber quando especialista agrega valor → contato com o estúdio.
- **Usuário já convidado:** acesso simples e separado à aplicação.

Não criar cadastro fictício, compra simulada nem formulário capturando dados sem backend, finalidade e texto de privacidade adequados.
