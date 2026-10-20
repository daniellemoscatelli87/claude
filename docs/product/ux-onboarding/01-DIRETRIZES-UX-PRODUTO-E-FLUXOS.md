# DM | Experience Intelligence — Diretrizes de UX, onboarding e condução adaptativa
**Versão:** 1.0 • **Data:** 20/10/2026 • **Status:** especificação de produto para revisão no repositório; não representa funcionalidade implementada.

## 0. Contexto e hierarquia
Esta especificação complementa, sem substituir, `docs/strategy/PRODUCT_VISION.md`, `docs/product/CHALLENGE_METHODOLOGY.md`, `docs/knowledge/RAG_ARCHITECTURE.md`, `CLAUDE.md`, decisões recentes e o código atual. Antes de programar, verifique o estado real do repositório e sinalize conflitos. Não reabra cadastro público nem ative Gemini, pagamentos ou serviços pagos. A tela capturada em 20/10/2026 mostra a pergunta “O que você quer melhorar?”, um textarea muito alto e indicação “Área master”; ela é o ponto de partida da revisão — não confundir com a experiência de um cliente real.

## 1. O que vendemos — definição inegociável
SaaS B2B para **conduzir organizações na transformação contínua da experiência humana** de clientes, consumidores, pacientes, usuários, colaboradores, parceiros e demais públicos envolvidos. Um desafio pode envolver **serviços, operações, processos, atendimento, políticas, ambientes físicos, produtos digitais, sistemas internos ou uma combinação dessas dimensões**. Digital é meio; transformação organizacional e humana é fim. A ferramenta não pressupõe que o usuário saiba Service Design; orienta ações em linguagem cotidiana e com evidências verificáveis. A consultoria do estúdio pode ser oferecida quando pertinente, de modo opcional e transparente.

**Norte da jornada:** “Você traz o desafio. Nós conduzimos os próximos passos para compreender a experiência, identificar o que pode mudar, orientar ações e acompanhar resultados.”

**Unidade de trabalho:** `desafio` dentro de uma `organização`, envolvendo um ou mais `públicos impactados` e `objetos de melhoria`. Não tratar segmento, método, canal ou plataforma digital como ponto de partida obrigatório.

## 2. O problema da interface atual
- Começa solicitando dados sem explicar o serviço, por que a atividade existe, quais são as etapas e quais resultados são esperados.
- Visual dominado por textarea grande, aviso e CTA; pouca hierarquia visual e orientação de valor.
- Não deixa claro em que momento da jornada o usuário está.
- A identificação “Área master” indica uma experiência administrativa; não prova o que o usuário cliente verá.
- Não há especificação completa de onboarding da conta e da organização.
- Perguntas predefinidas por setor ou desafio seriam incompatíveis com a proposta de orientação inteligente: o plano deve ser construído a partir do desafio, com regras e limitações.

## 3. Arquitetura de experiência — jornadas distintas e não repetitivas
### 3.1 Visitante sem autenticação
1. Acessa página de entrada (com proposta de valor resumida e CTA para entrar). 
2. Pode criar/confirmar conta **somente conforme política vigente de convite**; cadastro no provedor de autenticação pode existir, mas uso do produto permanece restrito por autorização verificada no backend. A interface distingue “conta criada” de “acesso à plataforma concedido”.
3. Entra por e-mail e senha com confirmação de e-mail quando aplicável.

### 3.2 Usuário autorizado em primeiro acesso
1. **Boas-vindas / proposta de valor** — uma apresentação curta da transformação e do percurso, sem tutorial longo. CTA “Começar”.
2. **Configurar organização / escolher organização** — se ainda não pertence a nenhuma, cria uma (mediante autorização); se já participa, escolhe ou entra na organização. Nunca criar organização sem respeitar a política de permissões.
3. **Contexto mínimo da organização** — coletar só os campos necessários para personalizar a experiência; permitir “Ainda não sei / completar depois” nos opcionais.
4. **Visão da jornada** — cinco etapas com estado informativo, sem prometer etapas não implementadas.
5. **Entrada do desafio** — texto livre, aviso discreto de privacidade e exemplos multissetoriais opcionais.
6. **Síntese do desafio** — se IA permitida e habilitada: sugerida, editável, com original imutável; se não, fluxo manual claramente identificado.
7. **Próxima pergunta/atividade** — gerada/adaptada ao desafio (quando IA estiver disponível), com fallback seguro e rastreável.

### 3.3 Usuário que retorna
- Com desafios existentes: abrir **Minha área de trabalho** com cartões “Continuar”, situação atual, última atividade, organização e informações pendentes. Nada de reapresentar onboarding automaticamente.
- Sem desafio: estado vazio útil com CTA “Criar primeiro desafio”.
- Com mais de uma organização: seletor de organização; dados e contexto não misturados.
- Master: módulo administrativo separado. Em testes, usar **“Visualizar experiência de cliente”** em workspace fictício/autorizado, sem contornar RLS nem acessar clientes como se fosse um usuário comum; sempre com auditoria. Se a simulação segura ainda não existe, registrar no backlog e usar cliente de teste convidado.

### 3.4 Diferenciar três cadastros
1. **Conta pessoal:** credencial de autenticação, e-mail confirmado, nome de exibição opcional, autorização por convite; não pedir CPF/RG/data de nascimento sem necessidade.
2. **Organização (workspace / conta B2B):** razão/nome de exibição da organização; setor de atuação; porte opcional por faixas; tipo de serviço ou produto; país/região opcional; papel do usuário na organização; preferências gerais. CNPJ, faturamento, contrato, endereço e cobrança são futuros/condicionais e não devem ser exigidos no MVP.
3. **Desafio:** problema/oportunidade livre; quem é afetado (multi-seleção e campo livre); o que se deseja melhorar (multi-seleção); contexto de atuação; resultado esperado; evidências existentes; urgência/risco quando pertinente; **perguntas adicionais dinâmicas** selecionadas depois que a plataforma entenda o desafio.

Não confundir cadastro de organização com coleta metodológica do desafio. Um mesmo cliente pode ter múltiplos desafios e múltiplos públicos impactados.

## 4. Jornada visível e estados honestos
Cinco macroetapas, apresentadas como **visão do percurso**, com ícones e descrições curtas:
1. **Definir desafio** — “Vamos entender o que precisa melhorar.”
2. **Investigar** — “Descubra o que as pessoas realmente vivenciam.”
3. **Compreender** — “Relacione evidências, dificuldades e possíveis causas.”
4. **Transformar** — “Escolha, teste e implemente melhorias.”
5. **Acompanhar** — “Veja o que mudou e o que ainda precisa evoluir.”

Na implementação atual, se apenas a primeira etapa existir, as demais são rotuladas **“Próximas etapas — em desenvolvimento”**, não clicáveis como funcionalidades concluídas. Os estados possíveis no futuro são: `disponível`, `em andamento`, `aguardando dados`, `concluída`, `ainda não disponível`. Não usar porcentagens arbitrárias de “conclusão” sem critérios de progresso reais; não prometer resultado ou diagnóstico quando ainda não existirem dados.

### Componentes propostos
- **WelcomeHero**: título, descrição curta, CTA, ilustração abstrata leve opcional (sem fotos genéricas de reuniões). Ícone `Sparkles` ou `Compass` discreto.
- **ValuePillars**: 3 cartões curtos com ícones `UsersRound` (pessoas), `Workflow` (operações/serviços), `TrendingUp` (evolução); enfatizar consequências reais de UX para operação.
- **JourneyStepper**: 5 etapas em layout horizontal scrollável no desktop; no mobile lista vertical compacta ou cartões sequenciais. Ícones `Target`, `Search`, `Lightbulb`, `Wrench`, `ChartNoAxesCombined` (Lucide React) + estados acessíveis.
- **ContextBar**: nome da organização, nome do desafio e etapa atual; breadcrumb responsivo.
- **ChallengeComposer**: título específico, ajuda breve, textarea dimensionado por conteúdo (aprox. 4–6 linhas no celular), botão principal, exemplos em chips acionáveis, aviso de privacidade acessível.
- **ChallengeScopeTags**: escolhas múltiplas de quem é impactado (cliente/paciente/colaborador/usuário/parceiro/outro) e onde a mudança pode ocorrer (processo/operação/atendimento/serviço/produto digital/ambiente físico/política/outro). **São pistas contextuais, nunca diagnóstico fechado; não forçar seleção antes do relato livre.**
- **GuidedTaskCard**: microtarefa com objetivo, por que agora, instruções executáveis, campo de registro e opções `Não sei`, `Como descobrir`, `Pedir ajuda`, `Deixar pendente`.
- **ProgressSummary**: “Você já contou X / Falta descobrir Y” baseado em dados reais; não em resposta gerada sem lastro.
- **EvidenceIndicator**: etiquetas “Relato”, “Observação”, “Registro”, “Hipótese” ou “Não confirmado” para impedir confusão entre tipos de evidência.
- **ExpertHelpCard** (futuro/condicional): apoio especializado opcional, não persuasão coercitiva; jamais bloquear avanço somente para venda de consultoria.

**Mobile-first e acessibilidade:** usar tipografia Plus Jakarta Sans já usada no site se disponível/licenciada no projeto; slate escuro para texto, vermelho institucional como destaque/CTA; fundos claros com contraste. Ícones Lucide consistentes em 20–24 px com legenda (não ícones isolados); alvo de toque >=44x44 px; labels visíveis; foco de teclado; erros junto ao campo; espaçamento com ritmo 8/16/24; componentes fluidos 320–430 px; botões sem ocultar teclado; estados de loading, erro, offline e retorno. Evitar excesso de cartões e textos longos no primeiro acesso. Não incluir gráficos decorativos/falsos KPIs. Não implementar animação complexa.

## 5. A IA NÃO pode usar questionário fixo
### 5.1 Princípio de implementação
As perguntas seguintes não são um formulário de 10 questões iguais para todo cliente. **São construídas segundo o conteúdo do desafio e o contexto real da organização**, podendo investigar públicos afetados, evidências existentes, jornada, experiência física, produto digital, processos, operação, métricas, restrições e riscos conforme necessário.

O fluxo é **adaptativo, governado e auditável**, não “IA inventa todas as perguntas e avança sozinha”. O `Methodology Engine` (regras + protocolos versionados) define necessidades informacionais, critérios de suficiência, limitações, estados e próximos passos possíveis; a IA pode estruturar, priorizar e redigir perguntas em linguagem acessível. O RAG fornecerá fundamentos quando implementado e aprovado. Fatos e hipóteses não devem ser confundidos.

### 5.2 Entrada canônica para o planejador
- `organization_id` resolvido e validado no servidor; `actor_id` autenticado.
- `challenge_id`, `original_statement` (imutável) e `approved_statement` ou interpretação editada quando existir.
- `organization_context` mínimo; `audiences[]`, `focus_areas[]`, `constraints[]` e `goal` (podem estar vazios).
- `answers[]` com tipo, data, status e evidência; `pending_information[]`; `plan_version`.
- `knowledge_context[]` **apenas** se RAG operacional e fontes aprovadas; caso contrário, nenhuma afirmação de consulta ao RAG.
- Flags de privacidade, limitações do plano, limites de chamadas, nível de risco.

### 5.3 Saída estruturada (proposta de contrato)
A IA sugere **um plano revisável**, validado por esquema e critérios determinísticos, sem executar mudança automática no serviço:
```json
{
  "challenge_summary": "string",
  "audiences": ["string"],
  "focus_areas": ["service|process|operations|attendance|digital_product|physical_space|policy|other"],
  "uncertainties": ["string"],
  "information_needs": [{"key":"string", "why":"string", "priority":"high|medium|low", "status":"missing|partial|known"}],
  "next_step": {"id":"string", "kind":"question|activity", "prompt":"string", "guidance":"string", "input_type":"text|single_choice|multi_choice|number|date|file_reference", "options":[], "reason":"string"},
  "alternative_if_unknown": {"find_where":"string", "produce_how":"string", "ask_whom":"string", "leave_pending":true},
  "evidence_requirements": ["string"],
  "safety_flags": ["string"],
  "source_ids": [],
  "confidence_note": "string"
}
```
Chaves são **proposta de interface de dados** a compatibilizar com o domínio atual; não migre banco apenas para reproduzir este exemplo. Não exigir que todos os campos apareçam na interface do usuário. A aplicação pode serializar um plano inicial de múltiplas necessidades e exibir uma só atividade por vez.

### 5.4 Padrão de decisão por etapa
1. Ler desafio e respostas com autorização validada.
2. Identificar o que já é conhecido, o que é relato, o que falta, contradições e risco.
3. Selecionar **necessidades de informação relevantes àquele caso**, com justificativa interna.
4. Sugerir no máximo a próxima pergunta/atividade visível ao usuário; evitar jargão.
5. Mostrar forma de obter resposta: em que lugar, com quem, o que observar, como registrar, cuidados de privacidade.
6. Salvar plano e perguntas versionados; recarregar nunca dispara nova geração.
7. Após resposta, atualizar estado; **não chamar modelo a cada clique**. Perguntas do mesmo lote são usadas enquanto adequadas; replanejamento só quando há contexto novo relevante, com autorização de custo e limites.
8. Confirmar entendimento com o usuário antes de tratar interpretação como dado aprovado.
9. Em caso de ausência, erro, limite ou IA desligada, usar **modo manual explicitamente rotulado** com resposta livre e pendências; não disfarçar perguntas genéricas de “personalização inteligente”.

### 5.5 Três casos distintos para teste (não criar hardcode)
**Saúde / espera em recepção**: explorar etapa de chegada, canal, pessoas impactadas, evidências sobre tempo de espera, comunicação e operação; não solicitar prontuários nem dados pessoais/saúde identificáveis.

**Produto digital / abandono de cadastro**: explorar etapa e dispositivo, onde as pessoas deixam o fluxo, dados agregados de funil, barreiras de linguagem/acessibilidade, falhas técnicas e contexto de suporte; evitar pedir logs com identificadores pessoais.

**Experiência do colaborador / trocas de turno**: explorar quem participa, impactos percebidos, comunicação e procedimentos internos, situações observadas, restrições operacionais e segurança psicológica; evitar avaliações pessoais identificáveis.

O plano e a primeira pergunta devem ser materialmente diferentes nos três casos. Não classificar “problema digital” como automaticamente resolvido por UI. Se desafio for “processo de reembolso”, examinar os envolvidos e as experiências no fluxo, mesmo sem contato direto com consumidor final.

### 5.6 Custos, privacidade e limites do estado atual
- Gemini **está desativado** no ambiente relatado; manter assim até autorização. **Não** implementar roteiro falso afirmando ser IA adaptativa.
- Limites atuais reportados: 3 solicitações por desafio, 20 por usuário/dia, 100 global/dia, 2 tentativas; preservar ou tornar mais restritivos, nunca contornar.
- Planejar geração econômica em lote, cache, persistência, versionamento e gatilhos explícitos para replanejamento; não gerar uma chamada por pergunta.
- Testar com fixtures sintéticas e mocks; não provisionar APIs, billing, plano pago, Netlify adicional ou ambiente de homologação pago.
- Em dados sensíveis e alto risco: escalar para intervenção humana, respeitar exigências legais. Não coletar dados individuais de pacientes/trabalhadores na primeira versão.
- Se IA estiver desligada, criar desafio deve continuar utilizável por entrada manual, sem bloquear navegação e sem prometer “análise inteligente” já realizada.

## 6. Cadastro e ciclo de vida de organizações
### 6.1 Objetivo do cadastro
O cadastro contextualiza a organização **sem virar uma entrevista corporativa nem exigir dados fiscais antes de haver cobrança**. Separar o que é obrigatório para segurança/conta, o que é útil para personalizar os planos e o que só será solicitado quando fizer sentido.

### 6.2 Campos mínimos sugeridos
- **Conta** (auth existente): e-mail, senha, confirmação de e-mail. Nome de exibição opcional quando ainda não coletado.
- **Organização:** `display_name` (obrigatório), `industry_segment` (opcional/recomendado), `organization_type` (opcional: privada, pública, terceiro setor, outra), `org_size_band` (opcional: 1–10, 11–50, 51–200, 201+, prefiro não informar), `user_role` (opcional: gestão, atendimento/operações, produto/tecnologia, pessoas/RH, qualidade/experiência, outra), `what_you_deliver` (campo curto opcional). Nome de organização **não** é necessário na criação da conta de autenticação.
- **Preferências** (posterior): idioma, nome de exibição, frequência de notificações.
- **Billing futuro**: dados fiscais, razão social, contratos, meios de pagamento e administradores de cobrança — não criar campos obrigatórios ou mecanismos pagos agora.
- **Convidados / equipes**: segundo papel de usuário (admin, colaborador, leitor), sujeito ao domínio de permissões vigente e implementação autorizada; não criar convites ilimitados nem exposição de dados.

Não presumir o segmento “saúde” porque o projeto de origem é saúde. Um usuário pode atender mais de um público em um mesmo desafio. A especificação atual não autoriza autoinscrição pública nem alteração de políticas de convite.

### 6.3 Regras de progresso
- Cadastro deve informar “Seu acesso é por convite” quando aplicável, independentemente do registro em Auth.
- Validar se a organização já existe/pertence ao usuário antes de abrir criação para evitar duplicidade e navegação confusa.
- `Pular por enquanto` apenas nos opcionais. Se usuário não tiver autorização para criar organização, mostrar mensagem apropriada e não esconder o motivo.
- Reentrada após interrupção retorna ao passo seguro: auth → organização → boas-vindas ou desafios existentes → desafio ativo.
- Caso de master não deve ser tratado automaticamente como cliente; separar administração e testes.
- Evento `onboarding_completed` somente quando conclusão efetiva; auditoria sem coletar texto de desafio em eventos analíticos.

## 7. Estados, erros, segurança, revisão e aceitação
**Estados de UI**: carregando; sem acesso por convite; e-mail não confirmado; sem organização; organização criada; sem desafios; etapa manual; IA indisponível; rascunho salvo; dado pendente; sessão expirada; erro de gravação com “Tentar novamente”; progresso retomado.

**Segurança e UX**: limite de caracteres definido e validado no servidor para relato e perfil, sem apagar rascunho; avisos de privacidade próximos aos campos; nunca armazenar senha ou chave API em estado frontend; validação por organization_id e RLS; mudanças administrativas auditadas. Não exibir em frontend que “RAG fundamentou” se não foi implementado. Não prometer “diagnóstico final” no fluxo atual.

**Critérios de aceitação — UX:**
- Novo convidado consegue diferenciar cadastro, convite, organização e desafio.
- Primeira entrada oferece contexto de valor e percurso em linguagem simples, sem tela mural de texto; retorno não repete boas-vindas compulsoriamente.
- Cliente sabe qual é a próxima ação, por que ela existe e como fazer — e pode prosseguir quando não sabe responder.
- Todos os públicos/objetos citados em 1 são contemplados, com múltiplas escolhas e liberdade textual.
- 3 cenários muito diferentes geram planejamentos distintos **quando o modo IA adaptativo estiver habilitado e comprovado**; enquanto não, modo manual honesto.
- Texto original do desafio permanece imutável; interpretações editáveis e auditadas.
- Recarregar não consome IA; falhas não causam perda de dados; respeitar quotas e isolamento.
- A apresentação de cinco etapas não finge disponibilidade de recursos futuros.
- Interface passa verificação mobile 320/375/430 px, foco de teclado, labels e contraste; componentes legíveis e resumidos.

**Critérios de aceitação — engenharia:** testes unitários dos estados, onboarding com convite, isolamento, quotas, erro de IA, persistência, retomada; fixtures sintéticas distintas; build/tipos/lint; nenhum deploy, merge, migração, IA ligada ou custo novo sem autorização da dona do produto.

## 8. Forma de entrega ao solicitar implementação
Claude deve PRIMEIRO produzir: (a) mapa do fluxo atual vs. proposto; (b) lista de telas/componentes, estados e papéis; (c) campos existentes vs. faltantes de cadastro; (d) arquitetura para perguntas adaptativas, limites e fallback manual; (e) arquivos/possíveis migrações; (f) riscos/custos; (g) plano incremental de implementação. Aguardar autorização antes de modificar código/dados/deploy. Não refatorar autenticação/RLS sem necessidade. Após cada corte, atualizar Backlog, Decision Log e Implementation Log.
