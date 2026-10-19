# DM | Experience Intelligence
## Especificação funcional e técnica v1.0 — Challenge Model + Methodology Engine

**Status:** especificação inicial pronta para orientar o primeiro incremento em Claude Code.  
**Dona do produto:** Dani Moscatelli | Experience Design Studio.  
**Posicionamento:** SaaS B2B, multiorganização, independente da consultoria, com serviços especializados opcionais.  
**Premissa:** a pessoa informa o que deseja melhorar; a plataforma a conduz a investigar, agir e verificar efeitos, sem exigir que conheça Service Design.

> **Regra de produto:** o ser humano é o centro do serviço. A operação física, as pessoas, os processos, os ambientes e o digital são partes de um mesmo ecossistema. Não presumir que a solução deva ser digital.

---

## 1. Decisões de produto que já estão tomadas

1. **A unidade principal é o Desafio (`Challenge`)**, não o mapa da jornada. Uma organização pode manter vários desafios e jornadas associados.
2. **A entrada é livre:** “O que você deseja melhorar?” — sem exigir que o usuário selecione ferramentas de design.
3. **A condução é orientada à ação:** cada pedido de informação traz instruções concretas sobre como encontrá-la, produzi-la e registrá-la.
4. **As respostas não equivalem automaticamente a evidências.** Separar percepções, fatos observados, dados documentados, hipóteses e resultados de testes.
5. **O progresso é adaptativo:** a plataforma propõe a próxima melhor atividade, pode retornar a uma etapa, registrar pendências e explicitar incerteza.
6. **A IA interpreta linguagem e assiste em tarefas; regras explícitas controlam estados, riscos, permissões e transições.**
7. **O conhecimento metodológico é rastreável:** protocolos versionados, referências, critérios de qualidade e regras de aplicação. RAG recupera orientações; não determina sozinho a metodologia.
8. **A consultoria é uma oferta adicional contextual e opcional.** Alertas comerciais não podem ser disfarçados de bloqueios técnicos.
9. **A organização controla seus dados.** Isolamento multi-tenant, permissões, minimização de dados e auditoria são requisitos desde o início.
10. **O produto fecha o ciclo de melhoria:** desafio → investigação → evidências → hipóteses → intervenções → medição → aprendizado → novo ciclo.

## 2. Pessoas que utilizarão o produto

- **Responsável pelo desafio:** descreve o problema, decide prioridades, aprova ações e acompanha resultados; não precisa dominar metodologia.
- **Colaborador:** executa atividades simples, como observar atendimento, informar como a operação funciona, convidar participantes e anexar registros.
- **Gestor da organização:** acompanha carteira de desafios, permissões, aprovações e resultados.
- **Especialista do estúdio:** quando convidado/contratado, pode colaborar no ambiente da organização nos limites de permissão concedidos.
- **Administrador do produto:** cuida de assinaturas, protocolos, segurança e operação do SaaS; não recebe acesso irrestrito a dados de clientes.

## 3. O que o cliente vê: jornada orientada por linguagem simples

| Estado da experiência | Texto na interface | Entrega material |
|---|---|---|
| `intake` | **Conte o que quer melhorar** | Descrição original e contexto inicial |
| `framing` | **Vamos entender a situação** | Desafio delimitado, público afetado, resultado desejado |
| `discovery` | **Vamos descobrir o que acontece** | Atividades feitas, relatos, observações e dados |
| `sensemaking` | **O que descobrimos até aqui?** | Padrões e hipóteses, com fontes e lacunas |
| `opportunities` | **O que pode melhorar?** | Alternativas de mudanças físicas, humanas, processuais e digitais |
| `experiment` | **Vamos testar uma melhoria** | Plano de ação, responsável, riscos e medida de sucesso |
| `measurement` | **Funcionou?** | Evidência de antes/depois e limitações |
| `continuous` | **O que vamos acompanhar agora?** | Aprendizados e próximo ciclo |

Observação: o usuário **não** deve precisar seguir essas etapas como abas lineares obrigatórias. O motor calcula a próxima ação a partir de informações, lacunas, risco e fase atual. Etapas posteriores são vistas como planejamento enquanto ainda não há base suficiente.

---

# PARTE A — CHALLENGE MODEL

## 4. Estrutura do Desafio

### 4.1 Campos essenciais

| Campo | Tipo lógico | Função |
|---|---|---|
| `id` | UUID | Identificação |
| `organization_id` | UUID obrigatório | Isolamento por organização |
| `created_by` | UUID | Autor |
| `title` | string | Nome curto, gerado como sugestão e editável |
| `original_statement` | texto | Descrição literal de quem iniciou; nunca sobrescrever |
| `current_problem_statement` | texto opcional | Reformulação baseada no que foi descoberto; sempre versionada |
| `desired_outcome` | texto | O que deveria melhorar para as pessoas |
| `context` | JSON estruturado | Segmento, departamento, local, canal, operação e peculiaridades |
| `affected_people` | lista | Quem vive ou entrega a experiência; incluir grupos invisibilizados |
| `scope` | objeto | Onde começa/termina o problema; limites conhecidos |
| `initial_signals` | lista de referências | Reclamações, dados, impressões ou pedidos motivadores |
| `constraints` | lista | Tempo, orçamento, regulamentação, operação e acesso |
| `risk_level` | enum | `low`, `moderate`, `high`, `critical` |
| `status` | enum | `active`, `paused`, `completed`, `archived` |
| `current_phase` | enum | Uma das etapas da seção 3 |
| `owner_id` | UUID | Responsável |
| `created_at`, `updated_at` | timestamp | Auditoria básica |

`organization_id` também deve estar em todos os registros dependentes sensíveis e todas as consultas devem aplicar escopo de organização.

### 4.2 Objetos vinculados (não colocar tudo em JSON único)

- **`challenge_versions`**: histórico de mudanças do enunciado e escopo, com autor/motivo.
- **`people_groups`**: grupos de pessoas impactadas; nome público/grupo, necessidades e barreiras, sem presumir identidade individual.
- **`journey_scopes`**: trechos e pontos de contato físicos/digitais relacionados ao desafio.
- **`questions`**: perguntas de investigação que a plataforma precisa responder.
- **`activities`**: tarefas práticas propostas, responsáveis, instruções, prazo opcional e status.
- **`evidence`**: registros de observação, relatos, arquivos, indicadores, medições; com fonte, data, contexto, permissão e qualidade.
- **`findings`**: sínteses ligadas às evidências de origem.
- **`hypotheses`**: possíveis explicações, evidências a favor/contra e estado da validação.
- **`opportunities`**: mudanças possíveis, relacionando grupos, fatores operacionais e problemas.
- **`interventions`**: mudanças planejadas, testes, responsáveis, restrições e resultados.
- **`metrics` / `measurements`**: definição do indicador, linha de base, período, coleta e leituras.
- **`method_runs`**: aplicações específicas de protocolos; versão usada e resultado de validação.
- **`expert_recommendations`**: sugestões de apoio humano e seu fundamento; decisões e opt-in.
- **`audit_events`**: trilha de eventos relevantes.

### 4.3 Tipos de informação e integridade epistêmica

Toda entrada deve ser classificada em uma das categorias abaixo, podendo conter mais de uma classificação **em registros distintos**:

- `stakeholder_claim`: percepção/opinião da organização.
- `participant_report`: o que a pessoa relatou.
- `direct_observation`: o que alguém observou diretamente.
- `operational_record`: informação comprovada por registro operacional.
- `measurement`: métrica com definição e período.
- `inference`: interpretação da IA/equipe, explicitamente marcada.
- `validated_learning`: aprendizagem sustentada por verificação documentada, com limitações.

**Regras:** nunca converter relato em fato observado; nunca afirmar causalidade apenas por correlação; cada `finding` referencia pelo menos uma evidência; cada hipótese pode registrar evidências contraditórias; guardar texto original e síntese separadamente.

### 4.4 Resultado da primeira conversa

A experiência de entrada deve produzir:

```json
{
  "challenge_id": "uuid",
  "original_statement": "Muitas pessoas reclamam da espera na recepção.",
  "provisional_title": "Melhorar a experiência de espera na recepção",
  "affected_people": ["pessoas atendidas", "equipe de recepção"],
  "context": {
    "industry": "saude",
    "department": "recepcao",
    "channels": ["presencial"],
    "site": "unidade a confirmar"
  },
  "desired_outcome": "Pessoas compreendem o fluxo e enfrentam menos dificuldades durante a espera.",
  "known_information": ["há relatos de demora"],
  "unknown_information": [
    "quanto tempo as pessoas esperam",
    "o que as pessoas vivenciam enquanto esperam",
    "como funciona o fluxo de atendimento"
  ],
  "next_question": "Em qual unidade ou local isso acontece com mais frequência?"
}
```

**Não salvar como fato:** "o problema é falta de pessoal" antes de investigar.  
**Não sugerir de imediato:** "instale totens", "faça um app" ou "contrate mais recepcionistas".

---

# PARTE B — METHODOLOGY ENGINE

## 5. Responsabilidade do motor

O Methodology Engine toma decisões controladas sobre **o que precisamos descobrir, qual atividade cabe agora, como validar o retorno e quando é adequado avançar**. O modelo de linguagem apenas ajuda a formular perguntas, resumir respostas e propor atividades dentro das opções e limitações autorizadas.

### 5.1 Entradas

1. Fase e estado do desafio.
2. Lacunas informacionais obrigatórias e opcionais.
3. Qualidade, diversidade e atualidade das evidências.
4. Setor, área, canal, riscos e regulação.
5. Recursos disponíveis e permissões do usuário.
6. Atividades anteriores e respostas incompletas.
7. Protocolos da biblioteca metodológica, com versão.

### 5.2 Saídas

Um objeto **`next_best_action`** estruturado, contendo:

```json
{
  "action_type": "ask_question | guided_activity | request_evidence | summarize | review_hypothesis | propose_experiment | measure | escalate",
  "goal": "Entender o que ocorre enquanto as pessoas aguardam",
  "user_facing_title": "Vamos observar a espera na prática",
  "user_facing_instruction": "Em um período de atendimento, anote o que acontece sem registrar informações que identifiquem pacientes.",
  "steps": [
    "Escolha um horário representativo e autorizado",
    "Anote hora de chegada e início do atendimento de forma não identificável",
    "Registre interrupções e dúvidas recorrentes",
    "Volte e conte o que percebeu"
  ],
  "expected_fields": ["contexto", "periodo", "ocorrencias", "observacoes", "limitacoes"],
  "method_protocol_id": "observation_light_v1",
  "why_now_internal": "Relato inicial sem observação direta",
  "safety_notes": ["Não observar ou registrar informações clínicas identificáveis"],
  "completion_rule": "Registro contém período, observações e limitações",
  "blocking": false,
  "allow_skip_with_reason": true
}
```

`why_now_internal` e `method_protocol_id` ficam disponíveis em detalhes, auditoria e modo especialista, mas não precisam aparecer na interface padrão.

## 6. Regras do motor por fase

### 6.1 `intake` → `framing`
**Obrigatório:** uma intenção/desafio interpretável; organização associada; tipo de experiência ou contexto básico.  
**Se não souber o setor:** perguntar de forma simples; não bloquear a captura do desafio.  
**Saída:** rascunho do desafio, com termos editáveis.

### 6.2 `framing` → `discovery`
**Obrigatório:** grupo impactado inicialmente, local/contexto, resultado desejado, sinal inicial e escopo provisório.  
**Lacunas permitidas:** frequência, causa, jornada detalhada, volume e indicador.  
**Saída:** plano curto com perguntas de pesquisa priorizadas. Não apresentar causa como conclusão.

### 6.3 `discovery` → `sensemaking`
**Obrigatório:** evidências suficientes para formular *hipóteses preliminares*, ao menos uma fonte além da impressão inicial do patrocinador, representação de mais de uma perspectiva quando pertinente, e registro de limitações.  
**Se falta dado:** oferecer tarefa alternativa compatível com acesso/recursos, ou marcar análise como provisória.  
**Saída:** achados rastreáveis, divergências e lacunas.

### 6.4 `sensemaking` → `opportunities`
**Obrigatório:** achados vinculados a evidências, hipóteses marcadas por estado, checagem de contradições e implicações para pessoas e operação.  
**Saída:** oportunidades que não presumem soluções digitais.

### 6.5 `opportunities` → `experiment`
**Obrigatório:** prioridade justificada, resultado humano esperado, esforço/viabilidade, responsável, risco, indicador e linha de base ou plano explícito para obtê-la.  
**Saída:** experimento pequeno, reversível quando possível; mudança organizacional significativa requer aprovação competente.

### 6.6 `experiment` → `measurement`
**Obrigatório:** registro do que foi efetivamente feito, onde, quando, por quem e quais grupos foram afetados.  
**Saída:** plano de comparação compatível com o contexto; ressalvas sobre fatores externos.

### 6.7 `measurement` → `continuous`
**Obrigatório:** resultados coletados, comparação razoável, limitações e decisão explícita de manter, adaptar, expandir ou interromper.  
**Saída:** registro de aprendizado e nova questão, se houver.

**Atenção:** nunca forçar avanço por contagem fixa de perguntas; validação é por informação/qualidade/risco. Uma análise pode seguir provisoriamente com avisos, sem apresentar conclusões como confirmadas.

## 7. Escolha de métodos: biblioteca inicial

Começar com **seis protocolos versionados**, sem tentar cobrir todas as disciplinas:

| Protocolo interno | O que o usuário lê | Quando usar | Entrega |
|---|---|---|---|
| `clarify_challenge_v1` | “Vamos entender o que você quer melhorar” | Entrada imprecisa | Desafio formulado |
| `review_existing_signals_v1` | “Vamos olhar o que sua empresa já sabe” | Há reclamações, planilhas ou registros | Inventário de indícios e qualidade |
| `guided_conversation_v1` | “Converse com quem vive essa experiência” | Falta perspectiva da pessoa afetada | Relatos contextualizados |
| `observation_light_v1` | “Observe como acontece na prática” | Há lacunas sobre comportamento ou ambiente | Registro observacional |
| `service_flow_walkthrough_v1` | “Mostre como o atendimento funciona” | Suspeita de fricção operacional | Fluxo visível e bastidores |
| `small_change_test_v1` | “Teste uma melhoria de forma segura” | Há intervenção plausível de baixo risco | Teste e critérios de medição |

Para cada protocolo, guardar em estrutura controlada:

```yaml
id: guided_conversation_v1
version: 1.0.0
purpose: compreender como pessoas vivenciam uma situação
applies_when: falta_perspectiva_do_usuario
avoid_when: consentimento_inadequado_ou_risco_relevante
required_permissions: [autorizacao_da_organizacao, consentimento_quando_aplicavel]
inputs: [pergunta_de_pesquisa, publico, contexto]
outputs: [relatos, contexto, limitacoes]
user_steps: [preparar_convite, realizar_conversa, registrar_respostas, revisar_registro]
quality_checks:
  - diferenciar relato de interpretacao
  - incluir perguntas abertas
  - evitar perguntas indutoras
  - registrar perfil e contexto sem expor identidade
failure_recovery: sugerir_registros_existentes_ou_apoio_especializado
source_ids: [govuk_user_research]
```

**Esses protocolos são diretrizes de produto**, não autorizações para que leigos realizem pesquisas sensíveis ou atividades sujeitas a normas profissionais sem supervisão.

## 8. Algoritmo inicial: regras primeiro, linguagem natural depois

Pseudoalgoritmo:

```text
1. Ler challenge, contexto, evidências e histórico de atividades.
2. Detectar bloqueios de privacidade, segurança ou escopo de atuação.
3. Definir perguntas de investigação ainda sem resposta e importância relativa.
4. Conferir se a etapa atual possui critérios mínimos para avançar.
5. Se houver bloqueio real: orientar caminho seguro e revisão humana.
6. Se não houver bloqueio:
   a. selecionar a lacuna prioritária;
   b. escolher um protocolo compatível com contexto, risco e recursos;
   c. oferecer a atividade mais simples que produza evidência útil;
   d. adaptar linguagem e exemplos ao setor via IA + conhecimento recuperado.
7. Receber resultado, validar campos e classificar tipo de evidência.
8. Atualizar estados, manter referências e calcular próxima ação.
9. Quando pertinente, oferecer apoio especializado sem bloquear continuação segura.
```

### Critérios para escolher a próxima atividade (priorização qualitativa)

- **Valor informacional:** ajuda a esclarecer a hipótese/decisão central?
- **Esforço:** usuário consegue executar sem treinamento formal?
- **Acesso:** há pessoas, locais, documentos ou registros acessíveis?
- **Risco:** atividade pode afetar segurança, privacidade ou direitos?
- **Viés:** fonte representa apenas opinião de quem contratou o produto?
- **Redundância:** a informação já está disponível em evidências confiáveis?

Na v1, implementar **regras transparentes e testes**, e não escores numéricos supostamente científicos. O motor deve registrar por que selecionou um protocolo.

## 9. Como o sistema responde quando a pessoa diz “não sei”

Jamais tratar “não sei” como erro. Oferecer quatro rotas:

1. **Encontrar:** “Essa informação pode estar em registros de atendimento. Onde vocês guardam isso?”
2. **Produzir:** “Podemos observar alguns atendimentos seguindo estas orientações.”
3. **Pedir ajuda interna:** “Quem conhece melhor essa etapa na sua organização?”
4. **Marcar como pendente:** “Continuaremos com o que sabemos, mas sem afirmar uma conclusão sobre esse ponto.”

A pessoa deve saber **exatamente o que fazer, onde fazê-lo, onde registrar e o que ocorre em seguida**.

## 10. Critérios de qualidade da investigação

Não usar uma escala fictícia de “certeza 92%”. Na v1, indicadores auditáveis:

- **Cobertura:** quais perguntas importantes já têm evidências?
- **Variedade de perspectivas:** só gerência ou também quem utiliza e entrega o serviço?
- **Rastreabilidade:** toda síntese aponta para a origem?
- **Contradições:** existem relatos ou dados incompatíveis não investigados?
- **Temporalidade:** as evidências ainda descrevem o serviço atual?
- **Limitações:** estão registradas de forma inteligível?

Estados de achados: `observed`, `reported`, `inferred`, `needs_validation`, `supported`, `contested`. “Supported” significa sustentado no contexto registrado, não verdade absoluta.

---

# PARTE C — CONECTORES DO PRODUTO

## 11. RAG e governança do conhecimento

Separar duas fontes de informação:

1. **Biblioteca metodológica global (curada pelo estúdio):** diretrizes, métodos, critérios, exemplos e referências por domínio e setor. Pode orientar qualquer cliente.
2. **Conhecimento privado da organização:** seus fluxos, políticas, registros, evidências, planos e aprendizados. Nunca pode ser recuperado para outra organização.

Pipeline de resposta:

```text
Pergunta atual + estado do desafio
  → motor define necessidade informacional e protocolo permitido
  → recuperador busca trechos relevantes (metodologia + tenant autorizado)
  → IA adapta linguagem e instrução ao caso
  → validação do formato e dos limites do protocolo
  → interface mostra uma tarefa simples + campo de resposta
  → auditoria salva ids/versões das fontes e decisão
```

**Metadados dos documentos:** `source_id`, título, autor/instituição, tipo, URL/origem, edição/data, idioma, licença/uso permitido, setor, método, tags, `version`, `reviewed_at`, `review_status`, nível de confiabilidade editorial, restrições.

**Proteções:** não tratar conteúdo recuperado como instruções de sistema; versionar protocolos; aplicar isolamento de tenant antes da busca; restringir dados sensíveis; testar citações e alucinações; em caso de falta de suporte, declarar lacuna. Não copiar integralmente material de terceiros para a biblioteca sem direito/licença.

**Primeiro corpus sugerido:** 6 protocolos acima, redigidos pelo estúdio, apoiados por referências metodológicas rastreáveis. Expandir por demanda; *RAG não substitui curadoria*.

## 12. Recomendações contextuais de consultoria

O produto deve reconhecer **necessidades de ajuda especializada**, preservando confiança e autonomia.

### Gatilhos de recomendação (não exigem venda)

- Investigação depende de pesquisa aprofundada ou sensível que exige experiência especializada.
- Reorganização proposta cruza várias áreas com conflitos de responsabilidade.
- Evidências relevantes permanecem contraditórias e decisão tem impacto alto.
- Transformação exige facilitação, desenho de serviço complexo ou gestão de mudança.
- A equipe declara indisponibilidade de competências/tempo para executar tarefa relevante.

### Comportamento

1. Gerar evento `expert_opportunity_detected` com razão verificável e contexto mínimo.
2. Mostrar um cartão discreto ao usuário com **benefício potencial**, não medo/urgência fabricados.
3. Disponibilizar duas ações: **“Continuar com orientação da plataforma”** e **“Conversar com especialista”**, salvo bloqueio real por segurança/regulação.
4. Apenas se o usuário aceitar: coletar permissão explícita para compartilhar resumo selecionado do desafio com o estúdio e criar `consulting_lead`.
5. Notificar o estúdio sobre o pedido **com os dados autorizados**, e registrar consentimento/escopo do compartilhamento.
6. Permitir dispensar a oferta e limitar repetições. Nunca manipular uma classificação de risco para vender serviço.

Mensagem sugerida:

> “Esta melhoria envolve várias equipes e mudanças no atendimento. Você pode continuar por aqui com um plano simplificado ou contar com apoio especializado do nosso estúdio para aprofundar o diagnóstico e facilitar a implementação.”

## 13. Segurança e governança desde o início

- Autenticação, membros por organização e papéis `org_admin`, `manager`, `contributor`, `viewer`, `studio_consultant` (apenas convite explícito).
- RLS por `organization_id` no PostgreSQL/Supabase; testes automatizados de isolamento entre duas organizações.
- Logs de mudanças e de consultas sensíveis; política de retenção e exclusão.
- Minimização: na v1, orientar dados anonimizados/desidentificados; não solicitar prontuários, diagnósticos identificáveis, documentos pessoais ou gravações sem política própria aprovada.
- Gestão de consentimentos/autorizações e segurança em pesquisas; proteção adicional para saúde, crianças, trabalhadores e outros contextos vulneráveis.
- Enviar apenas contexto necessário ao fornecedor de IA; documentar fornecedores e fluxos de dados conforme LGPD e contratos.
- Para decisões que possam afetar segurança, direitos ou obrigações legais, exigir governança humana e limites claros.

---

# PARTE D — PRIMEIRO INCREMENTO NO CLAUDE CODE

## 14. O primeiro vertical slice que construiremos

**Cenário de demonstração:** gestora de clínica quer melhorar espera na recepção. Esse cenário representa serviço presencial; o sistema também deve suportar outros setores sem condições especiais fixas.

**Fluxo mínimo real:**

1. Pessoa cria conta e organização.
2. Inicia desafio respondendo “O que deseja melhorar?”.
3. Sistema registra texto original e propõe título, público/contexto e perguntas pendentes.
4. Usuário responde uma pergunta por vez, pode escrever “não sei” e obter orientação.
5. Motor seleciona `review_existing_signals_v1` ou `observation_light_v1` para preencher lacuna.
6. Interface mostra tarefa concreta e formulário de registro de evidência.
7. Ao salvar evidência, sistema distingue relato/observação e atualiza cobertura.
8. Sistema exibe **“O que sabemos / O que ainda precisamos investigar”**, com links de origem.
9. Em caso definido de complexidade, exibe convite opcional ao apoio do estúdio.
10. Recarregar a página e retomar exatamente de onde parou; outra organização não vê nada do desafio.

**Explicitamente fora deste incremento:** assinaturas cobradas, todos os módulos futuros, desenhos visuais complexos, integração com sistemas clínicos, agente autônomo que executa ações externas, métricas preditivas, coleta direta de dados pessoais de pacientes.

## 15. Modelo relacional inicial

Tabelas mínimas:

```text
organizations(id, name, industry, created_at)
organization_members(id, organization_id, user_id, role, created_at)
challenges(id, organization_id, owner_id, title, original_statement,
           current_problem_statement, desired_outcome, context_json,
           current_phase, status, risk_level, created_at, updated_at)
challenge_versions(id, challenge_id, organization_id, changed_by,
                   snapshot_json, reason, created_at)
investigation_questions(id, challenge_id, organization_id, question_key,
                        wording, priority, status, answer_summary)
method_protocols(id, version, content_json, enabled, reviewed_at)
method_runs(id, challenge_id, organization_id, protocol_id, protocol_version,
            status, decision_reason, started_at, completed_at)
activities(id, challenge_id, organization_id, method_run_id, assigned_to,
           action_type, user_instruction_json, status, completed_at)
evidence(id, challenge_id, organization_id, activity_id, kind, original_text,
         structured_json, source_description, occurred_at, recorded_by,
         limitations, created_at)
findings(id, challenge_id, organization_id, summary, finding_status, created_at)
finding_evidence(finding_id, evidence_id, organization_id, relation_type)
expert_recommendations(id, challenge_id, organization_id, reason_code,
                       user_message, status, shown_at, dismissed_at)
consulting_leads(id, challenge_id, organization_id, requested_by,
                 consent_scope_json, status, requested_at)
audit_events(id, organization_id, actor_id, entity_type, entity_id,
             event_type, metadata_json, created_at)
```

As fases seguintes acrescentarão `hypotheses`, `opportunities`, `interventions`, `metrics`, `measurements`, arquivos, assinaturas e base vetorial. Não criar campo de autorização global para consultores do estúdio.

## 16. Contratos lógicos do backend

- `POST /api/challenges`: cria desafio e texto original; retorna `challenge_id`.
- `GET /api/challenges/:id`: retorna desafio do tenant autorizado.
- `POST /api/challenges/:id/interpret`: IA extrai contexto **como proposta**, sem substituir original; valida schema e pede confirmação do usuário.
- `GET /api/challenges/:id/next-action`: motor determinístico escolhe protocolo e lacuna; IA só personaliza instrução dentro do schema.
- `POST /api/challenges/:id/answers`: registra resposta ou “não sei”; vincula à pergunta e produz próxima ação.
- `POST /api/challenges/:id/evidence`: salva evidência com tipo e origem.
- `GET /api/challenges/:id/knowledge-state`: retorna sabemos/não sabemos/contradições e fontes.
- `POST /api/challenges/:id/expert-request`: registra opt-in e resumo autorizado; pode acionar notificação.

Preferir validação de schemas nas bordas, serviços testáveis separados de componentes visuais e operações idempotentes nas rotas de gravação.

## 17. Testes de aceitação indispensáveis

| ID | Dado / quando | Resultado esperado |
|---|---|---|
| AC-01 | Usuário informa “O atendimento está ruim” | Sistema pede contexto; não diagnostica causa nem recomenda sistema digital |
| AC-02 | Usuário diz “não sei quanto tempo esperam” | Oferece encontrar, produzir, pedir ajuda ou marcar pendente |
| AC-03 | Uma opinião de gestor entra no sistema | Classificada como percepção; não como medição ou observação |
| AC-04 | IA propõe “contratar mais gente” com poucos dados | Não apresenta como conclusão; marca como hipótese não validada |
| AC-05 | Atividade de observação registrada | Exige contexto, observações, limitações e indicação de fonte |
| AC-06 | Duas evidências se contradizem | Sinaliza contradição; não apaga nem oculta uma delas |
| AC-07 | Organização A tenta abrir URL de desafio da B | Acesso negado inclusive via API e banco |
| AC-08 | Usuário dispensa apoio especializado | Pode continuar; oferta não reaparece imediatamente |
| AC-09 | Usuário aceita falar com o estúdio | Compartilhamento limitado ao consentimento e evento auditável |
| AC-10 | RAG não encontra orientação confiável | Sistema não inventa método/autoridade; oferece alternativa segura |
| AC-11 | Ambiente hospitalar pede coleta de dados identificáveis | Fluxo bloqueia coleta inadequada e orienta abordagem segura |
| AC-12 | Usuário fecha e reabre navegação | Desafio, respostas e atividade pendente persistem |

## 18. Ordem de implementação (cortes entregáveis)

**Corte 1 — Fundação SaaS:** auth, organizations, members, RLS e testes de tenant.  
**Corte 2 — Challenge Intake:** formulário/conversa, interpretação estruturada e revisão humana.  
**Corte 3 — Motor de condução:** perguntas, protocolos em JSON, `next_best_action`, “não sei”.  
**Corte 4 — Registro e síntese:** atividades, evidências, cobertura e tela “sabemos/falta saber”.  
**Corte 5 — Integração de inteligência:** retrieval de protocolos curados, prompts versionados, saída validada e logs.  
**Corte 6 — Oferta especializada:** regras, cartões, consentimento e notificação.  
**Corte 7 — Teste end-to-end:** clínica, hotel e experiência do colaborador; verificar que os protocolos se adaptam sem hardcode por segmento.

## 19. Métricas para avaliar o produto

Medições **do produto** (não métricas clínicas):

- % de desafios que chegam a uma investigação concreta.
- % de pessoas que concluem primeira atividade orientada sem ajuda humana.
- Tempo e esforço percebido até registrar a primeira evidência útil.
- % de achados com fonte rastreável.
- % de desafios que geram experimento e medição posterior.
- Taxa de abandono por etapa e motivos de “não sei”.
- Conversão de convites de consultoria **sem** aumento artificial de bloqueios.

**North Star provisória:** número de desafios que completam ao menos um ciclo de mudança com resultado verificado, por organização ativa (validar com clientes reais).

## 20. Decisões em aberto — não bloquear o primeiro incremento

1. Nome final, registro de marca e domínio.
2. Planos/preços e provedor de cobrança no Brasil.
3. Fornecedor de modelo de IA, política de retenção, custos e localidade de processamento.
4. Possibilidades de upload, transcrição e limites por assinatura.
5. Setores inicialmente priorizados para validação comercial.
6. Revisão jurídica/privacidade e base legal aplicável às diferentes pesquisas.

---

## 21. Referências iniciais para curadoria — somente metadados e links

- **GOV.UK — Service Manual, “Learning about users and their needs”**. Fundamento para foco em necessidades reais, pesquisa e distinção entre suposição e evidência. https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- **GOV.UK — Service Manual, “User research in discovery”**. Abrangência de canais presenciais/digitais, experiência ponta a ponta e atores internos. https://www.gov.uk/service-manual/user-research/user-research-in-discovery
- **GOV.UK — Service Manual, “Contextual research and observation”**. Referência de observação em ambientes reais. https://www.gov.uk/service-manual/user-research/contextual-research-and-observation
- **Nielsen Norman Group — “Service Blueprinting FAQ”**. Conexão entre jornada visível, backstage, processos de apoio e áreas organizacionais. https://www.nngroup.com/articles/service-blueprinting-faq/

**Diretriz editorial:** catalogar referências e metadados, manter material de terceiros em suas fontes, e produzir protocolos originais referenciados. Revisar adequação e direitos antes de indexar obras completas.

---

## 22. Definition of Done do primeiro incremento

Está concluído quando uma pessoa sem formação em Service Design consegue criar um desafio, responder perguntas contextuais, receber orientação concreta para descobrir informação ausente, registrar ao menos uma evidência, entender o que já sabe e o que ainda precisa investigar, e retomar a sessão sem perder dados — tudo em um ambiente comercializável com isolamento real entre organizações. O fluxo deve funcionar sem intervenção da consultora, com apoio especializado apenas como opção contextual e consentida.
