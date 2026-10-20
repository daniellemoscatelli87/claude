# DM | Experience Intelligence
## Documento-mestre de visão do produto, modelo de negócio e roadmap — v1.0

**Proprietária:** Dani Moscatelli | Experience Design Studio  
**Data:** 19/10/2026  
**Estado:** visão estratégica aprovada em seus princípios; Business Model Canvas e hipóteses comerciais **a validar**.  
**Uso:** documento de referência permanente para a dona do produto, Claude Code, designers, parceiros e futuros colaboradores. Não confundir **norte de produto** com escopo de implementação imediata.

---

## 0. Como interpretar este documento

- **[DECIDIDO]** = intenção/decisão expressa da dona do produto nas conversas de definição.
- **[PROPOSTA]** = recomendação de arquitetura, posicionamento ou produto, sujeita a validação.
- **[HIPÓTESE]** = suposição sobre usuários, mercado, compra, precificação ou impacto, ainda não comprovada.
- **[PENDENTE]** = exige decisão posterior. Não inventar nem tratar como requisito firmado.
- Quando houver conflito com os documentos de engenharia, este documento prevalece em **visão, princípios, público e modelo de negócio**; a especificação `01-architecture-challenge-methodology-v1.md` prevalece em **regras técnicas do domínio inicial**. Registre a divergência e peça decisão apenas quando bloquear o incremento atual.

## 1. Resumo executivo — o produto que estamos construindo

**[DECIDIDO]** A DM | Experience Intelligence é uma **plataforma SaaS B2B, independente da consultoria**, criada pela Dani Moscatelli | Experience Design Studio, para que empresas e organizações de múltiplos setores possam investigar, redesenhar e melhorar continuamente as experiências de **clientes, pacientes, usuários, colaboradores e outras pessoas envolvidas nos serviços**.

O software não é um repositório de mapas de jornada, um dashboard de satisfação, um chatbot genérico, um curso de Service Design nem um aplicativo voltado exclusivamente à saúde.

**Sua unidade de valor é o desafio de experiência**: uma pessoa informa o que deseja resolver ou melhorar; a plataforma a conduz, em linguagem cotidiana e com atividades acionáveis, a entender o contexto, produzir evidências, investigar causas possíveis, testar transformações **físicas, humanas, operacionais, processuais e/ou digitais**, medir impactos e iniciar novos ciclos.

**[DECIDIDO]** A experiência precisa ser útil para clientes **sem formação em Service Design**. O método existe nos bastidores e não depende de o usuário aprender sua nomenclatura. Não basta pedir dados: quando uma informação estiver ausente, o produto explica **como obtê-la, de quem, com que cuidados, em que formato registrar e o que fazer se não conseguir**.

**[DECIDIDO]** O produto também cria pontos de contato transparentes, contextuais e facultativos para solicitar consultoria especializada do estúdio. A operação do SaaS e a venda de consultoria são produtos relacionados, mas **a contratação da consultoria não é pré-requisito para obter valor**.

**Promessa de produto (rascunho, não alegação validada):**
> Conte o que precisa melhorar. Nós conduzimos a investigação e os próximos passos para transformar a experiência das pessoas — e verificar o que mudou.

**Norte ético:** pessoas primeiro; tecnologia a serviço do cuidado, do atendimento, da operação e das relações no mundo real. **Pixels are not the journey.**

## 2. O problema e as pessoas envolvidas

### 2.1 Problema que pretendemos resolver

**[HIPÓTESE]** Muitas organizações percebem fricções nos serviços, mas não possuem método, tempo ou profissionais especializados para sair de relatos isolados e chegar a mudanças sustentadas por evidências. Dados de CX, atendimento, operação e pesquisa ficam desconectados. Ferramentas especializadas pressupõem letramento em pesquisa, análise e design.

A plataforma visa reduzir a distância entre **perceber um problema** e **conduzir uma melhoria verificável**, mesmo quando a equipe não sabe por onde começar.

### 2.2 Usuário, comprador e beneficiário — não confundir

| Papel | Quem pode ser | Necessidade prioritária | Status |
|---|---|---|---|
| Comprador / patrocinador | Gestor de operações, experiência, atendimento, qualidade, inovação ou proprietário de organização | Melhorar indicadores, operação e experiência sem estruturar uma equipe de Service Design | [HIPÓTESE] ICP inicial |
| Usuário condutor | Gestor ou pessoa designada para resolver o desafio | Próxima ação concreta, orientação simples e controle do progresso | [DECIDIDO] |
| Contribuidor | Colaborador, atendente, supervisor, pesquisador interno | Executar tarefas curtas, registrar observações e fornecer evidências | [PROPOSTA] |
| Pessoas impactadas | Clientes, pacientes, usuários, trabalhadores, acompanhantes, parceiros e outras pessoas afetadas | Serem realmente compreendidas e ver melhorias no serviço | [DECIDIDO] centro humano |
| Especialista opcional | Equipe/partners do estúdio, quando contratados e autorizados | Investigar profundamente, facilitar cocriação, apoiar transformação | [DECIDIDO] |
| Administrador SaaS | Operação do produto | Administração de planos, conhecimento e qualidade do serviço sem acesso irrestrito aos dados de clientes | [PROPOSTA] |

**[PENDENTE] ICP de lançamento:** selecionar e validar primeiro nicho pagante com entrevistas e sinais de disposição de compra. A arquitetura será multissetorial desde a origem, mas **o marketing e os protocolos iniciais não precisam cobrir todos os segmentos**. Saúde é um caso de referência relevante, não a única vertical.

## 3. Proposta de valor e diferenciação

### Para o cliente

- Começar por uma pergunta simples: **“O que você deseja melhorar?”**
- Ser conduzido por microtarefas, perguntas e instruções, sem aprender antecipadamente conceitos técnicos.
- Saber o que ainda não se conhece, como descobrir e por que isso importa para a decisão.
- Relacionar **vivências humanas** a operação, processos, pessoas, ambientes, regras, canais e tecnologia.
- Priorizar melhorias e registrar se a mudança ajudou, para quem e sob quais limites.
- Repetir esse ciclo sem depender continuamente da consultora.

### Diferenciais pretendidos — hipóteses a testar

1. **Orientação operacional, não educação abstrata:** o sistema não só recomenda entrevistar pessoas; orienta preparação, perguntas, coleta e registro adequado.
2. **Método governado, não improvisação por chat:** motor de estados, protocolos versionados, critérios de suficiência e IA assistiva.
3. **Rastreabilidade:** evidência → achado → hipótese → oportunidade → intervenção → resultado; distinguir relato de observação, e correlação de causalidade.
4. **Experiência física + digital:** não pressupor que o problema seja resolvido com uma interface.
5. **Contexto setorial e departamental:** método transversal contextualizado por conhecimento de operações e riscos de cada segmento.
6. **Escalada especializada relevante:** sugestão de consultoria quando agrega valor real; transparência e consentimento.
7. **Memória de aprendizagem por organização:** preservar decisões, tentativas, resultados e lacunas para ciclos futuros.

**[PENDENTE]** Estudos de concorrentes, entrevistas e testes devem demonstrar quais diferenciais o mercado percebe e valoriza.

## 4. Business Model Canvas — versão 0.1 (HIPÓTESES, não fatos de mercado)

| Bloco | Modelo inicial | Status / perguntas a validar |
|---|---|---|
| **1. Segmentos de clientes** | PMEs e organizações de serviços com atendimento recorrente; áreas de experiência, operações, qualidade e inovação; expansão a saúde, hospitalidade, educação, varejo e outros | [HIPÓTESE] Quem sofre mais com o problema e paga por ele? Qual nicho de entrada? |
| **2. Propostas de valor** | Conduzir equipes não especialistas da percepção do problema à melhoria mensurada; visão integrada humano–operação–digital; evidências rastreáveis | [HIPÓTESE] O cliente considera isso suficientemente distinto de planilhas, CX, IA genérica e consultoria? |
| **3. Canais** | Site e conteúdo do estúdio, demonstrações, relacionamento profissional/LinkedIn, rede de parceiros e indicações, onboarding self-service e vendas assistidas | [PROPOSTA] Quais canais convertem sem depender da agenda da fundadora? |
| **4. Relacionamento com clientes** | Experiência guiada no produto, ajuda contextual, suporte; opcionalmente consultoria especializada, formação de champions nas empresas e programa de clientes fundadores | [PROPOSTA] Quanta ajuda humana é necessária para ativar e reter? |
| **5. Fontes de receita** | Assinaturas SaaS por organização e/ou faixas de uso; serviços avulsos de consultoria como oferta complementar; possíveis planos para equipes/organizações maiores | [HIPÓTESE] Preço, packaging, limites de IA, trial e ticket ainda não definidos |
| **6. Recursos principais** | IP metodológica proprietária, motores de condução/análise, base RAG curada e versionada, software, dados da própria organização, marca do estúdio e parceiros | [DECIDIDO/PROPOSTA] Direitos de uso das fontes e custo de manutenção do conhecimento devem ser controlados |
| **7. Atividades principais** | Evoluir plataforma, curar protocolos e conteúdos, operar com segurança, avaliar qualidade das respostas da IA, vender/ativar clientes, suporte, medir impacto e realizar consultorias optativas | [PROPOSTA] Medir tempo/custo por cliente e por desafio |
| **8. Parceiros principais** | Infraestrutura cloud, modelos de IA, provedor de pagamento, especialistas por setor/método, rede de parceiros do estúdio e clientes-piloto | [HIPÓTESE] Contratos, SLAs e parcerias ainda não firmados |
| **9. Estrutura de custos** | Infraestrutura, banco e armazenamento, inferência/embeddings, suporte, aquisição de clientes, segurança/legal/LGPD, curadoria metodológica, manutenção e eventuais parceiros especializados | [HIPÓTESE] Construir planilha de unit economics antes de fixar preço |

### Lógica de receita proposta

**[DECIDIDO]** O SaaS deve entregar valor sem consultoria. **[PROPOSTA]** Ofertas comerciais futuras: assinatura autônoma; assinatura com capacidades adicionais para organizações maiores; projetos especializados contratados sob demanda. Os nomes/limites dos planos **não são decisões fechadas**.

### Questões de viabilidade a validar logo

- Quanto tempo até o primeiro resultado percebido pelo cliente?
- Qual esforço real de coleta/execução recai sobre a equipe usuária?
- Quem autoriza atividades de observação/pesquisa e mudanças operacionais?
- Como demonstrar valor antes que uma transformação produza indicadores robustos?
- Qual custo marginal por organização/desafio (tokens, processamento, armazenamento, suporte)?
- O cliente pagaria pelo produto sozinho ou só pelo serviço humano?
- Quais funcionalidades permitem autoatendimento e quais exigem onboarding assistido?

## 5. Jornada-alvo do cliente — visão de ponta a ponta

### Antes do uso

1. Descobre uma promessa clara e vê demonstração de um desafio realista.
2. Conhece limitações, preços/condições aplicáveis e o que a plataforma faz ou não faz.
3. Cria conta/organização e escolhe começar com um desafio.

### Primeiro ciclo completo

| Momento visto pelo usuário | O que ele faz | O que o sistema executa internamente | Resultado verificável |
|---|---|---|---|
| **Meu desafio** | Descreve problema ou intenção de melhoria com suas palavras | Estrutura contexto sem tratar suposições como fatos | Desafio registrado e editável |
| **Vamos entender** | Responde perguntas curtas sobre público, local, contexto e objetivo | Detecta informações conhecidas, desconhecidas, riscos e escopo | Primeiro enquadramento do desafio |
| **Descobrir na prática** | Executa uma tarefa específica: localizar registro, conversar, observar, acompanhar operação etc. | Seleciona protocolo autorizado e descreve onde/como coletar/registrar | Evidências contextualizadas |
| **O que encontramos** | Confirma, contesta e complementa achados | Analisa dados com fontes, lacunas e contradições | Hipóteses explícitas, não falsas certezas |
| **O que pode mudar** | Avalia opções e decide prioridades | Relaciona possíveis mudanças a pessoas e bastidores do serviço | Intervenção justificada |
| **Vamos testar** | Designa responsáveis, executa teste compatível com riscos | Oferece plano, critérios de segurança e linha de base | Teste registrado |
| **Funcionou?** | Registra efeitos e experiências observadas | Compara indicadores, assinala limitações | Aprendizado e decisão sobre próximos passos |
| **Continue evoluindo** | Reabre ou inicia desafios relacionados | Preserva memória organizacional e recomenda próximos ciclos | Melhoria contínua |

### Exemplo transversal

**Desafio:** “Pacientes reclamam da demora na recepção.” O sistema NÃO responde “contrate mais funcionários” nem “instale um aplicativo”. Ele pergunta onde e quando ocorre, orienta obtenção de registros não identificáveis de espera, conversas permitidas com pessoas afetadas, observação autorizada e compreensão do fluxo operacional. Propõe hipóteses (sinalização, prioridades, capacidade, comunicação, agendamento etc.) condicionadas a dados; orienta testar mudança física/processual/comunicacional; mede resultados. Em saúde, não atua como sistema clínico nem substitui profissionais habilitados.

### Princípios de linguagem e interação

- **Uma decisão/ação viável por vez.** Contexto e progresso visíveis; tarefa não pode parecer interrogatório interminável.
- Pergunte **“o que você sabe?”**, depois **“como podemos descobrir?”** quando resposta for “não sei”.
- Mostre passo a passo, exemplos, duração aproximada da tarefa só se sustentada, quem envolver e como registrar.
- Evite jargões de design na interface padrão; ofereça explicação técnica opcional a especialistas.
- A pessoa pode pausar/retomar, pedir alternativa, registrar impossibilidade ou contestar uma hipótese.
- Não “gamificar” a conclusão de etapas em detrimento de qualidade da evidência.
- Ao recomendar consultoria, explicar **por que** seria útil, o que oferece e como solicitar; nunca penalizar recusa.
- Não induzir respostas de entrevistados, esconder incertezas ou manipular pessoas; “conduzir” significa instruir a execução com transparência.

## 6. Modelo conceitual do produto completo

### Núcleo atual e extensões futuras

```text
ORGANIZAÇÃO
  ├─ usuários, papéis, assinatura e preferências
  ├─ portfólio de DESAFIOS (unidade central)
  │    ├─ contexto, pessoas afetadas, escopo e objetivos
  │    ├─ investigações → atividades → evidências
  │    ├─ jornadas e pontos de contato relacionados
  │    ├─ achados → hipóteses → oportunidades
  │    ├─ intervenções / experimentos
  │    ├─ métricas → medições → aprendizados
  │    └─ recomendações opcionais de apoio especializado
  ├─ biblioteca/memória da organização (com permissões)
  └─ integrações futuras (fontes de informação operacionais)

CAMADA TRANSVERSAL DO PRODUTO
  ├─ Journey Orchestrator (fases, tarefas, transições, retomada)
  ├─ Methodology Engine (protocolos versionados, limites e requisitos)
  ├─ Knowledge Engine (RAG: referências/metadados + conteúdo licenciado/autoral)
  ├─ Intelligence Engine (síntese, padrões, hipóteses, incerteza)
  ├─ Experience Guide (experiência conversacional e orientações práticas)
  ├─ Expert Intervention (oferta contextual, opt-in, encaminhamento)
  ├─ Segurança e governança (multi-tenant, RBAC, RLS, trilha de auditoria)
  └─ Billing & Product Operations (planos, assinatura, suporte, uso)
```

**Importante:** uma arquitetura lógica com vários motores não exige múltiplos modelos/agentes nem microserviços. Implementar como **monólito modular** no início é uma opção pragmática. A camada de IA nunca recebe autonomia irrestrita para controlar permissões, etapas críticas ou mudanças reais.

### Como o RAG deve evoluir

1. **Fundamentos transversais:** Service Design, pesquisa, experiência, comportamento, operações, análise, acessibilidade e negócios.
2. **Protocolos estruturados:** aplicação, requisitos, contraindicações, qualidade, cuidados, instruções para leigos, critérios de conclusão, referências.
3. **Pacotes contextuais:** setor, departamento, tipo de serviço, normas aplicáveis e riscos, com versões/data de revisão.
4. **Conhecimento por organização:** evidências e aprendizados exclusivos daquele cliente, isolados por tenant e autorização.

**[DECIDIDO]** O RAG ajuda a fundamentar a condução. **[PROPOSTA]** Usar protocolos estruturados como fonte normativa e RAG para contexto, não um amontoado de PDFs como único “cérebro”. Metadados de publicações e links **não autorizam** cópia integral de livros/artigos; respeitar licenças, direitos autorais e atualidade das normas. Evidenciar fontes, não inventar referências nem transformar recuperação semântica em autoridade automática.

### Critérios mínimos de qualidade e confiança

- Rastreabilidade de toda hipótese/recomendação a dados ou protocolo, quando aplicável.
- Diferenciar informação do cliente, observação, medição, interpretação e proposta.
- Registrar qualidade, diversidade e limitações de evidências.
- Guardrails de setor: privacidade, consentimento, riscos operacionais, acessibilidade, segurança das pessoas.
- Em saúde, minimizar/evitar dados clínicos identificáveis no lançamento; eventual expansão requer análise de risco, base legal, contratos, controles, validações e governança específica.
- Mudanças operacionais ficam sob aprovação de responsáveis humanos; a plataforma orienta, não altera autonomamente sistemas/fluxos físicos.
- Métricas e comparações antes/depois não provam causalidade isoladamente.

## 7. Escada de valor e roadmap por horizontes (sem promessa de prazo)

### H0 — Fundamento comercial e técnico [CONSTRUIR PRIMEIRO]

**Objetivo:** plataforma de verdade com contas e organizações separadas; primeira experiência guiada centrada no desafio.

- Autenticação, organização, membros/permissões iniciais, RLS e auditoria mínima.
- Entrada textual “O que você deseja melhorar?”, estruturação editável, retomada e próxima pergunta contextual.
- Interface responsiva no celular e desktop.
- README e critérios de teste; controles de dados e secrets.
- **Não** prometer que já existe RAG, diagnóstico, medição ou billing só porque há telas.

### H1 — Primeiro ciclo completo utilizável [PRIMEIRA VERSÃO COMERCIAL, APÓS TESTES]

**Objetivo:** uma organização realiza um desafio do começo à aprendizagem, sem consultora obrigatória.

- Discovery guiado com protocolos iniciais; suporte a “não sei”.
- Registro de evidências, fontes e anexos adequados; achados e hipóteses rastreáveis.
- IA assistiva controlada + base de conhecimento metodológico curada e recuperável.
- Oportunidades, intervenção orientada e medição simples de resultados.
- Recomendações contextuais de apoio especializado e contato consentido.
- Gestão de organização, papéis, produto/assinatura e suporte/comercialização.
- Onboarding compreensível e autonomia testada com pessoas não especialistas.
- Segurança, privacidade, acessibilidade, logs, backup e monitoramento proporcionais a SaaS comercial.
- Testes reais de fluxo ponta a ponta, incluindo vazamento entre organizações e qualidade de orientações.

**Porta de saída de H1:** um cliente-piloto sem formação em Service Design consegue completar um ciclo relevante e entende limitações, próximo passo e resultado; operação SaaS permite ativar, apoiar e cobrar com segurança. Não significa ter todos os módulos futuros.

### H2 — Ampliação e inteligência organizacional

- Portfólio de desafios, dependências entre áreas, jornadas interligadas e memória organizacional.
- Colaboração ampliada, permissões por equipe/unidade, relatórios e indicadores transversais.
- Importação CSV e integrações seletivas com ferramentas de feedback/atendimento/operação.
- Pacotes metodológicos/verticais validados por setor e área.
- Workflows especializados, experimentação mais sofisticada e governança de qualidade da IA.
- Melhoria da ativação self-service e oferta comercial segmentada.

### H3 — Inteligência longitudinal e escala

- Detecção assistida de padrões entre desafios de uma mesma organização.
- Sugestão contextual de oportunidades preventivas com explicação e confirmação humana.
- Integrações de dados mais profundas e métricas avançadas, quando houver qualidade suficiente.
- Comparações/benchmarks **somente** com base legítima, governança, consentimentos e controles contra reidentificação.
- Ecossistema de parceiros/especialistas e playbooks setoriais escaláveis.

**Não assumir como garantido:** impacto clínico, automação total, análise causal automática, predição confiável, integração universal, preço premium ou liderança competitiva. São possibilidades a validar, não promessas.

## 8. Priorização: o que entra e o que fica fora

**Princípio:** construir capacidade comercial independente **progressivamente**, sem retroceder à ideia de software exclusivo da consultora.

| Construir cedo | Deixar explicitamente depois |
|---|---|
| Fundação B2B multiorganização segura | Benchmark global entre empresas |
| Desafio livre + investigação guiada | Canvas visual sofisticado para todo framework |
| Protocolos poucos, fortes e versionados | Centenas de métodos superficiais |
| Evidências, hipóteses e oportunidade ligados | Diagnóstico autônomo supostamente infalível |
| Experimento simples e resultado mensurável | Mudanças automáticas em operação de clientes |
| Oferta consultiva contextual e consentida | Upsell intrusivo ou bloqueio comercial forçado |
| RAG pequeno e curado | Ingestão indiscriminada de PDFs/leis/artigos |
| Fluxo comercial real testado | Marketplace amplo de profissionais |

## 9. Modelo de consultoria dentro do produto

**[DECIDIDO]** Oportunidades de contratação são previstas desde a primeira versão comercial.

- **Gatilhos legítimos:** necessidade de investigação especializada, conflito de evidências persistente, impacto multissetorial, redesenho complexo, risco relevante ou dificuldade de conduzir uma mudança.
- **Entrega na UI:** apresentar benefício específico, opções de continuar autonomamente quando viável, e botão para solicitar apoio.
- **Fluxo:** recomendação com motivo → cliente opta por contato → confirma quais dados serão compartilhados → registro de interesse e notificação ao estúdio → continuidade normal do desafio.
- **Governança:** não inventar urgência, não exagerar risco para vender; riscos reais exigem encaminhamento apropriado independentemente de compra; especialistas só acessam dados explicitamente autorizados.
- **[PENDENTE]** Preços, pacote de consultoria, ferramenta de notificação e CRM.

## 10. Estratégia de entrada no mercado e validação

**[HIPÓTESE]** A aquisição inicial pode vir do estúdio, rede profissional e convites para clientes fundadores. Isso não substitui validação.

### Experimentos de negócio recomendados

1. **Descoberta de comprador:** entrevistar potenciais compradores sobre problemas reais, alternativas usadas, orçamento e decisões de compra (não conduzir perguntas tendenciosas).
2. **Teste da promessa:** apresentar fluxo demonstrável e observar se a pessoa entende o valor sem ser ensinada a usar Service Design.
3. **Teste de execução:** pessoa não especialista conclui tarefas de investigação com dados reais ou adequadamente anonimizados.
4. **Disposição de pagamento:** proposta com preço/condições explícitos; diferenciar elogio de intenção de compra e de pagamento efetivo.
5. **Teste de resultado:** registrar linha de base e efeito da intervenção, reconhecendo limitações do desenho.

### Métricas e marcos de produto

| Dimensão | Métrica indicativa | Condição de qualidade |
|---|---|---|
| Ativação | % de contas que descrevem e estruturam o primeiro desafio | Não basta criar login |
| Autonomia | % que conclui primeira tarefa sem ajuda humana | Segmentar por perfil e complexidade |
| Descoberta | % de desafios com evidências além de impressão inicial | Não premiar volume de dados irrelevantes |
| Transformação | % de desafios com intervenção efetivamente executada | Diferenciar planejada de executada |
| Aprendizado | % de intervenções com indicador comparável e ressalvas | Não equiparar antes/depois a causalidade |
| Receita | Conversão pago, retenção, expansão, receita recorrente | Precificação ainda não definida |
| Viabilidade | Custo variável de IA/suporte por organização e por ciclo | Medir para evitar margens negativas |
| Confiança | Ocorrências de fonte inventada, acesso indevido e recomendações arriscadas | Metas e resposta a incidentes |
| Oferta de consultoria | Solicitações opt-in qualificadas | Não otimizar a favor do upsell contra o usuário |

**North Star proposta, a validar:** número de **ciclos de melhoria concluídos com evidência de aprendizado útil** por organização ativa (não número de mensagens ou mapas gerados).

## 11. Premissas de arquitetura e restrições

- **[DECIDIDO]** Construção pela dona do produto, individualmente, com Claude Code, com comunicação e execução principalmente via **celular/chat**.
- **[PROPOSTA]** Next.js + TypeScript, Supabase/PostgreSQL/Auth/RLS, arquitetura modular e hospedagem adequada. Escolhas ajustáveis se fundamentadas e registradas.
- **[DECIDIDO]** Multi-tenant desde o primeiro incremento; não expor um cliente a dados de outro.
- **[DECIDIDO]** Não confundir respostas geradas pela IA com evidências verdadeiras; usar validação estruturada e registro de fonte.
- **[DECIDIDO]** RAG com governança e protocolos metodológicos aplicáveis a setor/contexto.
- **[DECIDIDO]** Orientações em vez de jargão; o software deve levar a pessoa a agir, com passos acessíveis.
- **[PROPOSTA]** Começar com monólito modular, sem dispersar para microserviços e orquestração multiagente antes da necessidade.
- **[PENDENTE]** Marca final, domínio, preço, nicho de estreia, provedor de pagamentos/IA, termos jurídicos, certificações e integrações prioritárias.

## 12. Riscos estratégicos que não podem desaparecer nas decisões de engenharia

1. **Virar ferramenta para designers**, exigindo que o cliente saiba escolher metodologias.
2. **Virar chatbot genérico**, sem estados, controles, método ou rastreabilidade.
3. **Virar pesquisa de satisfação/dashboard**, sem intervenção e mensuração.
4. **Virar aplicativo de jornada digital**, ignorando atendimento, ambientes, bastidores e relação humana.
5. **Virar agência sob demanda disfarçada**, dependente da consultora para cada ação.
6. **Virar software excessivo antes de vender**, com custo maior que aprendizado comercial.
7. **Virar máquina de alucinações metodológicas**, com protocolos/sínteses não sustentados por fontes.
8. **Virar repositório de dados sensíveis**, sem base legal, minimização e governança.
9. **Virar ferramenta de persuasão opaca**, induzindo participantes a respostas ou clientes a compras.

## 13. Registros permanentes no repositório

**[PROPOSTA]** Manter as seguintes referências versionadas, mesmo se ainda forem arquivos mínimos:

```text
CLAUDE.md                               # instruções persistentes ao Claude Code
/docs/strategy/PRODUCT_VISION.md       # este documento
/docs/strategy/BUSINESS_MODEL_CANVAS.md # pode começar apontando a seção 4
/docs/strategy/ROADMAP.md              # pode começar apontando a seção 7
/docs/product/CHALLENGE_METHODOLOGY.md # documento 01
/docs/decisions/DECISION_LOG.md        # decisões, datas, justificativas, impacto
/docs/product/PRODUCT_BACKLOG.md       # hipóteses, épicos, incrementos, status
/docs/research/VALIDATION_LOG.md       # aprendizados e validação de mercado
/docs/engineering/IMPLEMENTATION_LOG.md# o que realmente está implementado e testado
```

**Regra:** a cada incremento, Claude Code deve diferenciar **visão futura**, **escopo aprovado**, **código implementado**, **código testado** e **pendências**. Nunca assinalar funcionalidade como pronta por existir um mockup, tabela ou prompt.

## 14. Decisões e hipóteses em aberto — fila de validação

| Tema | Pergunta | Estado |
|---|---|---|
| ICP | Qual primeiro nicho/porte/gestor comprador e principal desafio? | [PENDENTE] |
| Oferta | Quais resultados podem ser prometidos honestamente na versão 1? | [PENDENTE] |
| Preço | Por organização, por assento, por desafio, por uso ou híbrido? | [PENDENTE] |
| Aquisição | Self-service puro, demonstração assistida ou ambos na estreia? | [PENDENTE] |
| Suporte | Qual suporte a fundadora pode oferecer sem se tornar gargalo? | [PENDENTE] |
| IA | Quais provedores/custos/limites e como avaliar qualidade? | [PENDENTE] |
| RAG | Quais 6 protocolos autorais primeiro e quais fontes podem ser utilizadas licitamente? | [PROPOSTA] |
| Comercial | Qual fluxo de contato de consultoria e permissões associadas? | [PENDENTE] |
| Setores | Quando expandir a biblioteca além do primeiro caso de uso? | [PENDENTE] |
| Impacto | Como verificar causalidade/efeitos com rigor proporcional ao contexto? | [PENDENTE] |

## 15. Orientação explícita ao Claude Code

> Leia este documento antes de implementar. Preserve a visão de plataforma SaaS independente, guiada por desafios, centrada no humano e capaz de levar uma equipe não especialista a melhorias físicas, operacionais e digitais. **Não tente construir todo este futuro agora.** Para cada tarefa, respeite o corte aprovado no prompt de implementação. Se uma decisão técnica comprometer um princípio do produto, sinalize e apresente alternativas. Atualize os registros do repositório de maneira verificável e explique a execução em passos pequenos, considerando que a fundadora trabalha pelo celular.

---

**Critério de êxito final da visão:** a organização consegue começar com um desafio real, obter orientação prática segura, construir compreensão fundamentada, realizar uma melhoria viável e observar seus efeitos, sem precisar saber o que é Service Design e sem depender da contratação contínua do estúdio.

---

## 16. Declaração da dona do produto (19/10/2026)

**[DECIDIDO]** Registrada a partir da mensagem da dona do produto que abriu a construção do produto neste repositório.

**O que não podemos permitir que aconteça:** a plataforma terminar sendo apenas um gerenciador de jornadas com recursos de inteligência artificial. A visão é muito maior.

**O que estamos propondo:** um produto que transforma competências especializadas de Service Design, pesquisa, experiência, negócios e operações em uma capacidade acessível às organizações.

O valor não está simplesmente em produzir mapas, diagnósticos ou relatórios. Está em fazer com que uma organização consiga:

> **Identificar um desafio → Investigar a realidade → Compreender as pessoas → Transformar o serviço → Avaliar os resultados.**

Mesmo sem possuir especialistas internos nessas disciplinas.

**Como usar esta declaração:** toda funcionalidade proposta deve indicar em qual elo dessa cadeia ela atua e como ajuda a organização a avançar para o elo seguinte. Uma funcionalidade que apenas produz um artefato (mapa, relatório, painel) sem levar a uma ação verificável deve ser questionada antes de entrar no backlog.

### Decisões complementares da dona do produto (19/10/2026)

- **[DECIDIDO]** O login do cliente é separado do login da administração do estúdio (D-012).
- **[DECIDIDO]** Fluxo comercial: **cadastro → pagamento → uso da plataforma**. Durante a fase de testes, o uso é livre e sem cobrança (D-013). Provedor de pagamento e preços seguem **[PENDENTE]**.
- **[DECIDIDO]** Dani Moscatelli é a **usuária master** e pode visualizar os projetos de todos os clientes. Cada acesso fica registrado e visível ao cliente na auditoria da organização (D-011). Isso substitui, nas seções 2.2 e 9 deste documento, a regra de que o estúdio só acessa dados autorizados caso a caso. Antes do lançamento comercial, os termos de uso e a política de privacidade do produto devem informar esse acesso.

### Princípio central da dona do produto (20/10/2026)

- **[DECIDIDO]** "A DM | Experience Intelligence transforma conhecimento especializado em jornadas de ação acessíveis, conduzindo pessoas e organizações da identificação de desafios à melhoria contínua de experiências, serviços, produtos e operações."
- **[DECIDIDO]** "O método fica nos bastidores. A ação fica na interface." O cliente executa atividades orientadas; a plataforma aplica Service Design e outras disciplinas sem exigir que ele as conheça, entregando os instrumentos necessários (roteiros, fichas, campos de registro) e acompanhando a execução (D-021).
- **[DECIDIDO]** A responsabilidade metodológica não fica só na IA: o sistema combina Methodology Engine, RAG, IA, validação de evidências e Experience Guide (D-021).
