# DM | Experience Intelligence — Copy UX completa e inventário de interface
**Versão 1.0 — 20/10/2026.** Textos exatos propostos para a primeira experiência e seus estados. O Claude pode adaptar apenas aspectos gramaticais/limites de interface, não a promessa de valor nem a diferenciação entre recurso ativo/futuro. Microcopy apresentada entre aspas é texto final. Campos `{...}` são variáveis sanitizadas no servidor.

## 0. Terminologia e tom de voz
- Marca: **DM | Experience Intelligence**. Assinatura discreta: “Uma solução Dani Moscatelli | Experience Design Studio”.
- Usuário: “você”; organização: “sua organização”; pessoa beneficiada: “pessoas” ou o público declarado. Não chamar toda pessoa de cliente ou paciente.
- Evitar na interface: “Service Design”, “shadowing”, “blueprint”, “root cause”, “framework”, “AI agent”, “RAG”, “pipeline”, “diagnóstico confirmado”, “garantia de resultados”.
- Linguagem: objetiva, acolhedora, orientada à ação, sem tom professoral; não apresentar o software como consultoria humana automaticamente disponível.
- Promessa moderada: a plataforma ajuda a **investigar**, **encontrar oportunidades**, **orientar melhorias** e **acompanhar resultados**; não garante identificação de causa nem ganho de performance.

---

## TELA A — Entrada pública / acesso
**Tipo:** `AuthLanding`; componentes: `BrandHeader` + `Hero` + `ValueMiniList` (ícones `Target`, `UsersRound`, `Workflow`) + formulário/autorização na mesma página ou transição de tela.

**Eyebrow:** “Inteligência para transformar experiências”

**Título:** “Experiências melhores começam com perguntas melhores.”

**Descrição:** “Transforme desafios de atendimento, serviços, processos, operações e produtos em caminhos concretos de melhoria. A plataforma orienta cada etapa, com as pessoas no centro das decisões.”

**Três propostas em microcartões:**
- `Target` — “Comece pelo desafio” / “Conte o que precisa mudar, sem precisar saber a solução.”
- `Compass` — “Avance com orientação” / “Saiba o que investigar e como obter as informações.”
- `TrendingUp` — “Evolua continuamente” / “Organize melhorias e acompanhe o que muda.”

**CTA primário:** “Entrar na plataforma”
**CTA secundário (quando elegível ao fluxo auth atual):** “Criar minha conta”
**Badge de fase restrita:** “Acesso por convite nesta fase”
**Rodapé:** “Uma solução Dani Moscatelli | Experience Design Studio.”

> A existência de “Criar minha conta” **não significa acesso automático** ao SaaS: autorização por convite permanece no backend.

## TELA B — Criar conta
**Componente:** `AuthForm`, `EmailInput` (`Mail`), `PasswordInput` (`LockKeyhole`), `VisibilityToggle` (`Eye`/`EyeOff`), `Alert`, `PrimaryButton`.

**Título:** “Crie sua conta”
**Descrição:** “Use seu e-mail para começar. O acesso à plataforma está disponível apenas para pessoas convidadas nesta fase.”
**Campos:** “E-mail de trabalho”; “Senha”; quando houver input de confirmação: “Confirmar senha”.
**Helper senha:** “Use uma senha segura. Ela não será enviada por e-mail.”
**CTA:** “Criar conta”
**Link:** “Já tem uma conta? Entrar”
**Aviso curto:** “Para acessar a plataforma, seu e-mail precisa estar confirmado e autorizado.”
**Validação e-mail:** “Confira o endereço de e-mail informado.”
**Validação senha:** “A senha não atende aos requisitos de segurança. Confira as orientações do campo.”
**Validação cadastro duplicado (sem revelar existência em fluxos públicos quando políticas de auth exigirem):** “Não foi possível concluir o cadastro. Confira seus dados ou tente entrar.”
**Enviou confirmação:** “Enviamos um link de confirmação para seu e-mail. Confirme seu endereço para continuar.”
**Botão de reenvio:** “Reenviar e-mail de confirmação”
**Envio limitado:** “Aguarde alguns minutos antes de solicitar outro e-mail.”
**Bloqueio de convite:** “Seu cadastro foi recebido, mas o acesso à plataforma é por convite. Se você recebeu um convite, confira se entrou com o e-mail correto.”

## TELA C — Entrar
**Título:** “Que bom ter você por aqui.”
**Descrição:** “Entre para continuar os desafios da sua organização.”
**Campos:** “E-mail”; “Senha”.
**CTA:** “Entrar”
**Link recuperar:** “Esqueci minha senha”
**Link criar:** “Ainda não tem conta? Criar conta”
**Erro credenciais:** “Não conseguimos entrar com esses dados. Confira e tente novamente.”
**Aviso e-mail:** “Confirme seu e-mail antes de continuar.”
**Sem convite:** “Acesso por convite. Sua conta ainda não foi autorizada a utilizar a plataforma.”
**Sessão expirada:** “Sua sessão terminou. Entre novamente para continuar de onde parou.”

## TELA D — Boas-vindas à jornada (só primeiro acesso relevante)
**Tipo:** `WelcomeJourney`, com hierarquia visual curta: `Hero` → 3 `ValuePillars` → `JourneyStepper` (sem parágrafos longos) → `Callout` autonomia → CTA.

**Eyebrow:** “Bem-vindo à DM | Experience Intelligence”
**Título:** “Transforme desafios em experiências melhores.”
**Descrição principal:** “Toda organização enfrenta situações que precisam mudar. Vamos ajudar você a compreender o que acontece, descobrir oportunidades e orientar melhorias que façam diferença para as pessoas e para a operação.”
**Texto de apoio:** “O desafio pode estar no atendimento, em um serviço, processo, ambiente físico, produto digital ou na relação entre diferentes áreas. Começamos pelo que você quer melhorar.”

**ValuePillars:**
- `UsersRound` “Pessoas no centro” / “Entenda quem é impactado e como vive a experiência.”
- `Workflow` “Além das telas” / “Considere atendimento, processos, equipes, ambientes e tecnologia.”
- `Compass` “Um passo por vez” / “Receba instruções práticas, mesmo sem conhecer métodos especializados.”

**Seção percurso — título:** “Como sua jornada funciona”
**Descrição curta:** “Você não precisa ter todas as respostas agora. Vamos descobrir o que falta, juntos, etapa por etapa.”
**5 etapas do Stepper (ícone + nome + microtexto):**
1. `Target` “Definir desafio” / “O que precisa melhorar?”
2. `Search` “Investigar” / “O que está acontecendo?”
3. `Lightbulb` “Compreender” / “O que as evidências indicam?”
4. `Wrench` “Transformar” / “O que vale a pena mudar?”
5. `ChartNoAxesCombined` “Acompanhar” / “O que mudou depois?”

**Callout:** “Seu trabalho é contar o que sabe e realizar pequenas atividades orientadas. A plataforma organiza o caminho e mostra os próximos passos.”
**CTA:** “Começar minha jornada”
**Link opcional:** “Ver como funciona depois” (não obriga assistir tutorial)
**Aviso de estágio quando pertinente:** “Nesta versão de testes, algumas etapas ainda estão em desenvolvimento. Você poderá começar pelo seu desafio.”

**Regra:** não tornar o percurso inteiro clicável enquanto só a primeira etapa está pronta; sem falso progresso.

## TELA E — Criar organização (onboarding B2B)
**Tipo:** `OrganizationSetup`; ícone principal `Building2` e formulário em seção única no mobile, com campos obrigatórios primeiro, demais opcionais em seção compacta. Se organização existente, mostrar seletor/continuação em vez de duplicar.

**Eyebrow:** “Preparando seu espaço de trabalho”
**Título:** “Vamos conhecer sua organização.”
**Descrição:** “Essas informações ajudam a adaptar as orientações ao seu contexto. Você pode completar os detalhes depois.”

**Campo obrigatório 1:** “Como sua organização é chamada?”
**Placeholder:** “Ex.: Clínica Horizonte, Escola Aurora, Loja Central”
**Helper:** “Use o nome pelo qual você identifica sua organização.”

**Campo opcional 2:** “Em que área ela atua?”
**Placeholder / seletor:** “Selecione um segmento (opcional)”
**Opções ilustrativas:** “Saúde”; “Educação”; “Hospitalidade e turismo”; “Varejo e comércio”; “Serviços financeiros”; “Tecnologia”; “Indústria”; “Serviços profissionais”; “Setor público”; “Terceiro setor”; “Outro”; “Prefiro não informar”.

**Campo opcional 3:** “O que sua organização oferece?”
**Placeholder:** “Ex.: atendimento médico, hospedagem, ensino, plataforma de serviços...”
**Helper:** “Pode ser um serviço, um produto, uma operação ou uma combinação.”

**Campo opcional 4:** “Qual é o seu papel na organização?”
**Opções:** “Gestão ou liderança”; “Atendimento ou operações”; “Produto ou tecnologia”; “Pessoas e cultura”; “Qualidade ou experiência”; “Outro”; “Prefiro não informar”.

**Campo opcional 5 (se realmente necessário no dado atual):** “Qual é aproximadamente o porte da organização?”
**Opções:** “1 a 10 pessoas”; “11 a 50”; “51 a 200”; “Mais de 200”; “Prefiro não informar”.

**Ação primária:** “Continuar”
**Ação opcional:** “Completar depois” (apenas quando nome e regras obrigatórias já atendidos)
**Sucesso:** “Espaço de trabalho preparado. Agora podemos começar pelo seu desafio.”
**Erro nome vazio:** “Informe o nome da organização para continuar.”
**Erro permissão:** “Sua conta não tem permissão para criar uma organização. Solicite acesso à pessoa responsável.”
**Erro duplicidade/membership:** “Você já participa de um espaço com esse nome. Confira se deseja continuar nele.”
**Nota proteção:** “As informações desta organização ficam separadas das demais contas.” (somente se isolamento estiver realmente implementado e testado)

## TELA F — Minha área de trabalho (retorno)
**Tipo:** `WorkspaceHome`; `OrganizationSwitcher` (`Building2`), `WelcomeLine`, `ChallengeCards` (`Target`, `ArrowRight`), `EmptyState` (`Compass`), botão criar (`Plus`).
**Título com desafios:** “Seus desafios, em um só lugar.”
**Descrição:** “Continue de onde parou ou comece a investigar uma nova oportunidade de melhoria.”
**Card título dinâmico:** “{challenge_title}”
**Card status:** “Em andamento”; “Aguardando informação”; “Rascunho”.
**Card detalhe:** “Próximo passo: {next_step_short}” (apenas se existir e estiver registrado; caso contrário “Retome para definir a próxima atividade.”)
**CTA de card:** “Continuar desafio”
**CTA global:** “Criar novo desafio”
**Empty title:** “Seu primeiro desafio começa aqui.”
**Empty descrição:** “Conte o que precisa melhorar. Vamos organizar as informações e orientar os próximos passos.”
**Empty CTA:** “Descrever um desafio”
**Mensagem primeira vez após setup:** “Sua organização está pronta. Vamos começar pelo desafio que mais importa agora.”

## TELA G — Etapa 1: apresentação do desafio
**Tipo:** `ChallengeStart`; `ContextBar` (organização/etapa), `StepIndicator`, `ChallengeComposer`, `SuggestionChips`, `PrivacyNote` (`ShieldCheck`).

**Eyebrow:** “Etapa 1 de 5 • Definir desafio”
**Título:** “O que você quer melhorar?”
**Descrição:** “Conte o que está acontecendo na sua organização ou o que você gostaria que fosse diferente. Não precisa conhecer a causa nem chegar com uma solução pronta.”
**Label do campo:** “Descreva seu desafio”
**Placeholder:** “Ex.: Pessoas desistem do cadastro no nosso aplicativo e não sabemos por quê.”
**Ajuda (linha curta):** “Pode envolver pessoas, atendimento, processos, serviços, equipes, espaços físicos ou produtos digitais.”

**Seção exemplos:** “Precisa de um exemplo?” — chips com ícones:
- `Clock3` “A espera no atendimento está longa”
- `Smartphone` “Usuários abandonam uma etapa no aplicativo”
- `Workflow` “Nosso processo de reembolso gera retrabalho”
- `UsersRound` “Colaboradores têm dificuldade na troca de turno”

**Interação chips:** inserir exemplo no texto apenas mediante ação explícita e editável; nunca usar um exemplo como evidência real. Em telas estreitas, usar carrossel de chips horizontal com acessibilidade.

**Aviso privacidade curto:** `ShieldCheck` “Por enquanto, use informações gerais. Não inclua nomes, documentos, contatos ou dados pessoais e de saúde de outras pessoas.”
**Link:** “Por que pedimos isso?” — explicação em `Dialog/Disclosure`: “Nesta fase de testes, evite informações identificáveis ou confidenciais. Elas não são necessárias para começar a investigar o desafio.”

**CTA:** “Continuar”
**Validação vazio:** “Descreva o que você gostaria de melhorar para continuar.”
**Validação tamanho:** “Seu texto ultrapassou o limite permitido. Resuma a situação sem perder as informações principais.” (mostrar contador/limite real quando definido)
**Salvando:** “Salvando seu desafio…”
**Salvo:** “Seu desafio foi salvo.”
**Erro:** “Não foi possível salvar agora. Seu texto continua aqui. Tente novamente.”

## TELA H — Compreensão do desafio / revisão da proposta
**Tipo:** `ChallengeReview`; quando IA ativa: bloco `SuggestedSummary` (`Sparkles`), distinção “Seu relato” (`MessageSquareText`) vs “Nossa interpretação” (`Pencil`), ações de aprovação/edição; quando desativada: modo manual.

**Com IA ativa, validada e permitida:**
**Título:** “Vamos conferir se entendemos seu desafio.”
**Descrição:** “Organizamos o que você contou em uma primeira leitura. Revise antes de seguir — você conhece o contexto melhor do que ninguém.”
**Label original:** “O que você contou”
**Label interpretação:** “Proposta de entendimento”
**Badge:** “Sugestão da IA • ainda não confirmada”
**Ações:** “Está correto”; “Ajustar entendimento”; “Voltar ao relato”.
**Editar label:** “O que precisa ser ajustado?”
**Confirmado:** “Entendimento confirmado. Vamos descobrir o que ainda falta saber.”

**Com IA desativada (estado ATUAL):**
**Título:** “Seu desafio está registrado.”
**Descrição:** “Você pode revisar o que escreveu e continuar com as informações disponíveis. A organização inteligente do desafio está desativada nesta fase de testes.”
**Label:** “Seu relato”
**Ações:** “Confirmar e continuar”; “Editar descrição”.

**IA indisponível:** “Não conseguimos organizar seu relato agora. Ele está salvo, e você pode continuar pelo modo manual.”
**CTA:** “Continuar sem IA”

## TELA I — Pergunta/atividade guiada contextual (dinâmica)
**Tipo:** `GuidedTaskCard`, ícone definido pelo tipo de atividade, `StepIndicator`, `ReasonHint`, componentes de input condizentes com `input_type`, `NeedHelpMenu`.

**Eyebrow:** “Próximo passo do seu desafio”
**Título:** `{next_step.prompt}` — vindo de plano validado, **não texto fixo universal**.
**Descrição de objetivo:** `{next_step.guidance}` — instrução curta e prática.
**Disclosure:** “Por que estamos perguntando isso?” — `{next_step.reason}` em linguagem simples, jamais só jargão técnico.
**Label de resposta:** “Sua resposta” (se tipo texto) / “Escolha as opções que se aplicam” (multi) / campo específico gerado sob esquema.
**CTA:** “Salvar e continuar”
**Ações alternativas no menu `CircleHelp`:**
- `MapPin` “Onde encontro essa informação?”
- `ClipboardList` “Como posso descobrir?”
- `HandHelping` “Preciso de ajuda”
- `Clock3` “Responder depois”

**Copy de menu:** “Não sabe responder? Escolha como quer seguir.”
**Resposta onde encontrar:** `{find_where}` (se não houver conteúdo verificado: “Essa informação ainda não foi localizada. Você pode registrar onde acredita que ela esteja ou marcar para depois.”)
**Como descobrir:** `{produce_how}` com instruções executáveis e cuidados.
**Pedir ajuda:** “Quem na sua organização poderia ajudar com essa informação?” (campo opcional para papel/equipe, não nome/contato de pessoa).
**Pendente:** “Sem problema. Marcamos esta informação como pendente. Você poderá voltar quando tiver os dados.”
**Erro obrigatório:** “Responda ou escolha uma das opções para continuar.”
**Sucesso:** “Resposta salva. Vamos para o próximo passo.”
**Sem próxima pergunta verificada:** “Já registramos o que sabemos até aqui. Vamos organizar as informações antes de definir a próxima atividade.”

**Não imprimir texto genérico como se fosse método personalizado** quando o planejador/RAG ainda não estiver ativo. Se não há pergunta contextual validada, oferecer somente registro manual, resumo da lacuna e progresso honesto.

## TELA J — Progresso da investigação
**Tipo:** `ChallengeProgress`, `JourneyStepper`, `InfoTiles` (`CheckCircle2`, `CircleHelp`, `FileText`), mini-lista de informações pendentes, não dashboard com números inventados.

**Título:** “Seu caminho até aqui”
**Descrição:** “Veja o que já registramos e o que ainda precisamos compreender.”
**Bloco 1:** “O que já sabemos”
**Bloco 2:** “O que ainda falta descobrir”
**Bloco 3:** “Sua próxima atividade”
**CTA:** “Continuar investigação”
**CTA secundário:** “Revisar desafio”
**Etapas posteriores não prontas:** “Esta etapa fará parte da evolução da plataforma. Por enquanto, continue estruturando seu desafio.”
**Evidência não suficiente:** “Ainda não temos informações suficientes para concluir por que isso acontece. Vamos investigar antes de recomendar mudanças.”

## TELA K — Mensagens globais, segurança e continuidade
- **Carregando:** “Preparando seu espaço…”
- **Salvando:** “Salvando suas informações…”
- **Salvo:** “Tudo salvo. Você pode continuar depois.”
- **Offline:** “Você parece estar sem conexão. Verifique a internet antes de continuar.”
- **Falha temporária:** “Não foi possível concluir esta ação agora. Tente novamente.”
- **Sem acesso:** “Acesso por convite. Esta conta ainda não tem permissão para usar a plataforma.”
- **Sem organização:** “Ainda não encontramos uma organização vinculada à sua conta.”
- **Conflito de dados:** “Essas informações foram atualizadas em outro acesso. Recarregue para conferir antes de continuar.”
- **Limite IA:** “A análise automática está temporariamente indisponível. Seu desafio continua salvo e pode ser revisado manualmente.”
- **IA desligada:** “A orientação com IA está desativada nesta fase de testes.”
- **Sem dados suficientes:** “Ainda não há informações suficientes para propor uma conclusão confiável.”
- **Reabrir ajuda:** “Precisa entender melhor esta etapa?”
- **Privacidade geral:** “Descreva situações sem identificar pessoas. Evite dados confidenciais nesta fase de testes.”
- **Ajuda especialista FUTURA / contextual e facultativa** (`HandHelping`): “Este desafio pode se beneficiar de apoio especializado.” / “Se você quiser aprofundar a investigação ou redesenhar o serviço com acompanhamento, pode solicitar uma avaliação do estúdio.” / CTA “Conhecer apoio especializado” / alternativa “Continuar por conta própria”. **Não exibir como CTA funcional se a oferta e o encaminhamento ainda não existirem.**

## Componentes e escolhas de interface — inventário rápido
| Contexto | Componente | Ícones Lucide sugeridos | Tratamento |
|---|---|---|---|
| Promessa de valor | Hero + ValuePillars | `UsersRound`, `Workflow`, `Compass` | Até três benefícios curtos; sem muro de texto |
| Percurso | JourneyStepper | `Target`, `Search`, `Lightbulb`, `Wrench`, `ChartNoAxesCombined` | Horizontal desktop, vertical compacto mobile |
| Organização | OrganizationSetup + switcher | `Building2`, `ChevronDown`, `Check` | Campos progressivos e opcionais |
| Entrada de desafio | ChallengeComposer + SuggestionChips | `Target`, `Clock3`, `Smartphone`, `Workflow` | Textarea 4–6 linhas, não ocupar uma tela inteira |
| Privacidade | PrivacyNote + disclosure | `ShieldCheck`, `Info` | Curto e visível, sem competir com CTA |
| Revisão do desafio | ComparisonCards | `MessageSquareText`, `Sparkles`, `Pencil` | Original imutável vs sugestão editável |
| Pergunta/atividade | GuidedTaskCard + NeedHelpMenu | `CircleHelp`, `ClipboardList`, `MapPin`, `Clock3` | Uma ação por vez, ajuda contextual |
| Dashboard de retorno | WorkspaceHome + ChallengeCards | `Target`, `ArrowRight`, `Plus` | Retomada rápida e estado real |
| Erro/salvamento | InlineAlert/Toast | `AlertCircle`, `CheckCircle2` | Texto acionável, salvar contexto |

**Nota visual sobre a captura:** a barra flutuante inferior com “Make public” parece pertencer ao ambiente de visualização/publicação e não ao design principal da aplicação. Verificar sua origem antes de tentar removê-la ou alterar componentes do produto.

## Critérios editoriais de QA
1. Testar 375 px e garantir que o CTA não fique oculto por teclado ou barra flutuante.
2. Validação: o cliente entende em **uma olhada** o que a plataforma oferece, sem ler manual.
3. Todo CTA leva a tela existente ou informa claramente funcionalidade futura.
4. Público, serviço e tipo de desafio não são confundidos com segmento de mercado.
5. A frase “orientação inteligente” só aparece quando a funcionalidade de fato opera; com IA off, fallback manual explícito.
6. Nunca exibir etapas de investigação como finalizadas somente por preencher um questionário.
7. A política por convite, Supabase/RLS/auditoria e separação master x cliente permanecem intactas.
