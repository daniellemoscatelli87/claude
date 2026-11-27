# Decision Log

Cada decisão registra: data, quem decidiu, o que foi decidido, fundamento, alternativas consideradas e impacto. Decisões pendentes ficam na seção final até a dona do produto decidir.

Legenda de origem: **Dona do produto** (decidido por Dani Moscatelli) · **Proposta do Claude, aprovada** · **Proposta do Claude, pendente**.

---

## D-001 · 19/10/2026 · Documentação como parte integrante do produto

- **Origem:** Dona do produto.
- **Decisão:** a documentação do DM | Experience Intelligence é tratada como parte do produto, versionada no repositório, e não como material de apoio descartável.
- **Fundamento:** permitir continuar o desenvolvimento em novas sessões sem reconstruir o contexto e manter rastreável o que foi decidido, construído e validado.
- **Alternativas consideradas:** manter os documentos apenas no chat ou em arquivos soltos fora do repositório (descartado: o contexto se perde entre sessões).
- **Impacto:** toda entrega do produto inclui a atualização dos registros correspondentes no mesmo commit.

## D-002 · 19/10/2026 · Quatro registros permanentes

- **Origem:** Dona do produto.
- **Decisão:** manter quatro registros permanentes, atualizados pelo Claude sempre que uma funcionalidade for criada:
  - **Product Vision** (`docs/strategy/PRODUCT_VISION.md`): onde queremos chegar.
  - **Product Backlog** (`docs/product/PRODUCT_BACKLOG.md`): o que construir e em qual prioridade.
  - **Decision Log** (este arquivo): decisões, porquês e alternativas.
  - **Implementation Log** (`docs/engineering/IMPLEMENTATION_LOG.md`): o que foi desenvolvido, testado e colocado em funcionamento.
- **Fundamento:** separar visão, prioridade, decisão e execução real, para não confundir roadmap com algo pronto.
- **Alternativas consideradas:** um único documento de status (descartado: mistura intenção com fato).
- **Impacto:** índice e regras de atualização em `docs/README.md`; referência no topo do `CLAUDE.md`.

## D-003 · 19/10/2026 · O produto não pode virar um gerenciador de jornadas com IA

- **Origem:** Dona do produto.
- **Decisão:** a plataforma transforma competências especializadas de Service Design, pesquisa, experiência, negócios e operações em capacidade acessível às organizações. O valor está em a organização conseguir **Identificar um desafio → Investigar a realidade → Compreender as pessoas → Transformar o serviço → Avaliar os resultados**, mesmo sem especialistas internos. Produzir mapas, diagnósticos ou relatórios não é o valor em si.
- **Fundamento:** riscos estratégicos da seção 12 da visão (virar chatbot genérico, ferramenta para designers, dashboard ou aplicativo de jornada digital).
- **Alternativas consideradas:** nenhuma; é um princípio de produto.
- **Impacto:** registrado na seção 16 de `PRODUCT_VISION.md`. Todo item do backlog indica em qual elo da cadeia atua.

## D-004 · 19/10/2026 · Organização dos documentos no repositório

- **Origem:** instrução do kit (`CLAUDE.md` e `FIRST_INCREMENT_PROMPT.md`), executada pelo Claude.
- **Decisão:** documentos do kit copiados sem alteração de conteúdo:
  - `03-visao-negocio-produto-roadmap-v1.md` → `docs/strategy/PRODUCT_VISION.md` (acrescida apenas a seção 16, com a declaração da dona do produto);
  - `01-architecture-challenge-methodology-v1.md` → `docs/product/CHALLENGE_METHODOLOGY.md`;
  - `02-prompt-claude-code-primeiro-incremento.md` → `docs/engineering/FIRST_INCREMENT_PROMPT.md`;
  - `CLAUDE.md` → raiz do repositório (acrescida apenas uma nota de escopo no topo, porque o repositório também contém o site do estúdio).
- **Também criados:** `docs/README.md` (índice), `docs/strategy/BUSINESS_MODEL_CANVAS.md` e `docs/strategy/ROADMAP.md` (apontam para as seções 4 e 7 da visão, para não haver duas versões), `docs/research/VALIDATION_LOG.md` (vazio).
- **Fundamento:** seção 13 da visão e passo 1 do prompt do primeiro incremento.
- **Impacto:** nenhum código do site foi alterado. A pasta `docs/` não é publicada no site (o build só publica `public/` e a página inicial).

## D-005 · 19/10/2026 · O produto é uma aplicação própria dentro deste repositório

- **Origem:** Dona do produto (escolheu a alternativa A da antiga pendência P-001).
- **Decisão:** o DM | Experience Intelligence será uma aplicação própria em Next.js + TypeScript, em pasta separada deste repositório, publicada como um segundo site no Netlify, em subdomínio próprio.
- **Fundamento:** separar o SaaS do site do estúdio, seguir a arquitetura recomendada no kit e permitir vender o produto de forma independente.
- **Alternativas consideradas:** rota dentro do site atual (mistura o SaaS com o site e dificulta testes); repositório separado (fora do repositório que a dona do produto acompanha).
- **Pendente dentro desta decisão:** nome do subdomínio (será perguntado quando a publicação for configurada).

## D-006 · 19/10/2026 · O produto usa o mesmo projeto Supabase do site

- **Origem:** Dona do produto. Fundamento dado por ela: "os clientes são clientes do estúdio".
- **Decisão:** o produto usa o projeto Supabase do site (`lipfvnerohkaajegqvwr`), com tabelas e regras de acesso próprias do produto.
- **Alternativas consideradas:** projeto Supabase exclusivo do produto (recomendado pelo Claude por separar fisicamente os dados dos clientes do SaaS dos dados do site); estúdio com acesso a todos os dados dos clientes (não escolhido).
- **Regra que continua valendo:** o acesso do estúdio não é global. O papel `admin` do site **não** dá acesso aos desafios, evidências e demais dados das organizações clientes; o estúdio só acessa dados de uma organização quando ela autorizar explicitamente (papel `studio_consultant` por convite, previsto na metodologia).
- **Riscos registrados:**
  - um erro de política de acesso pode expor dados de clientes junto com dados do site; mitigação: RLS em todas as tabelas do produto e testes automatizados de isolamento;
  - o produto exige cadastro aberto de pessoas no Supabase Auth, que hoje é compartilhado com a área restrita do site; mitigação: antes de liberar o cadastro, revisar todas as políticas do site para confirmar que nenhuma dá acesso a quem apenas tem conta.

## D-007 · 19/10/2026 · IA desde o primeiro incremento

- **Origem:** Dona do produto ("Quero com IA desde o começo").
- **Decisão:** a organização inicial do desafio é sugerida pela IA (Google Gemini, já usado pelo site, com a chave nos segredos do Supabase). A sugestão é sempre editável e nunca substitui o texto original.
- **Alternativa considerada:** começar sem IA, com campos guiados (recomendada pelo Claude por deixar a escolha do provedor para depois).
- **Guardrails aplicados:** a IA não aponta causa, não propõe solução, não presume solução digital, não reproduz dados que identifiquem pessoas e só usa o que o texto diz. Prompt versionado (`interpretacao_desafio_v1`); a resposta é validada por schema antes de aparecer; a auditoria registra modelo e versão do prompt. A IA não escolhe a próxima pergunta nem autoriza avanço de fase (regra determinística).
- **Ainda pendente (visão, seção 14):** custos, limites e política de retenção do provedor de IA; avaliação de qualidade das sugestões com usuários.

## D-008 · 19/10/2026 · Site estático e escrita somente por funções do banco

- **Origem:** Proposta do Claude, aplicada no Corte 1.
- **Decisão:** a aplicação Next.js é gerada como site estático (sem servidor próprio). Leituras usam as regras de acesso do banco (RLS); toda escrita passa por funções do banco (`ei_create_organization`, `ei_create_challenge`, `ei_confirm_structure`, `ei_answer_question`) que conferem o papel da pessoa e gravam versão e auditoria na mesma transação. As APIs não escrevem direto nas tabelas.
- **Fundamento:** nenhum segredo fica no navegador nem num servidor a mais; a segurança fica concentrada e testável no banco; publicação simples no Netlify.
- **Alternativas consideradas:** rotas de API no servidor Next.js (exigiria guardar segredos e manter um servidor); escrita direta nas tabelas com RLS (versão e auditoria poderiam ser puladas).
- **Impacto:** os contratos lógicos da metodologia (seção 16, `POST /api/challenges` etc.) são atendidos por essas funções e pela função de IA, não por rotas `/api`.

## D-009 · 19/10/2026 · Tabela investigation_questions antecipada

- **Origem:** Proposta do Claude, aplicada no Corte 2.
- **Decisão:** além das cinco tabelas pedidas, foi criada `investigation_questions` (prevista na seção 15 da metodologia) para guardar as respostas das perguntas de entendimento, inclusive "não sei" e o caminho escolhido.
- **Fundamento:** o prompt pede para justificar tabelas extras. Sem ela, as respostas não persistiriam após recarregar a página (C2-06, C2-08, AC-12).

## D-010 · 19/10/2026 · Migrações do produto versionadas no repositório

- **Origem:** Proposta do Claude (antiga pendência P-003), aplicada.
- **Decisão:** toda mudança de banco do produto nasce como arquivo em `apps/experience-intelligence/supabase/migrations/` e é aplicada a partir dele.

## D-011 · 19/10/2026 · A usuária master vê todos os projetos dos clientes, com registro

- **Origem:** Dona do produto ("Dani Moscatelli poderá em algum momento visualizar sim os projetos dos clientes, pois ela é a usuária master"; escolheu "Vê tudo, com registro").
- **Decisão:** a usuária master vê todas as organizações, todos os desafios e as respostas. Todo acesso passa por funções do banco que registram quem viu o quê e quando, na auditoria da organização do cliente (visível para a administração do cliente) e no registro da plataforma (`master_access_log`). A master não tem leitura direta nas tabelas, então não existe acesso sem registro.
- **Altera:** a regra "o acesso de estúdio não é global" (`CLAUDE.md`, metodologia seção 15 e D-006) e "administrador SaaS sem acesso irrestrito aos dados de clientes" (visão, seção 2.2). Os textos originais do kit não foram editados; esta decisão prevalece sobre eles.
- **Quem é master:** marca `ei_master` no `app_metadata` da conta (definida só no servidor), separada do papel `admin` do site. Aplicada à conta contato@danimoscatelli.com.br.
- **Alternativas consideradas:** ver só com autorização do cliente (regra anterior); ver tudo sem registro (descartada: não há como provar ao cliente quem acessou).
- **Obrigatório antes do lançamento comercial:** termos de uso e política de privacidade do produto informando esse acesso (LGPD). Por enquanto, a tela de cadastro avisa que a equipe do estúdio pode acessar os projetos e que cada acesso fica registrado.

## D-012 · 19/10/2026 · Login do cliente separado do admin

- **Origem:** Dona do produto.
- **Decisão:** o cliente tem a própria conta e entra pela plataforma; a área restrita do site continua só da administradora. As contas ficam no mesmo Supabase Auth (D-006), mas uma conta de cliente não dá acesso a nada do site (testado: o papel `admin` vem só do `app_metadata`).

## D-013 · 19/10/2026 · Fluxo comercial: cadastro, pagamento e uso; livre durante os testes

- **Origem:** Dona do produto ("A pessoa vai vir de um fluxo de cadastro > pagamento e daí vai poder usar a plataforma"; para agora escolheu "Livre para testes").
- **Decisão:** no produto comercial, a pessoa só usa a plataforma depois do pagamento. Enquanto a cobrança não existir, qualquer pessoa cadastrada usa sem pagar, e a tela de cadastro informa que a plataforma está em fase de testes.
- **Pendente (bloqueia o corte de cobrança, não os testes):** provedor de pagamento, preços e planos (visão, seção 14).

## D-014 · 20/10/2026 · Testes reais controlados: acesso por convite

- **Origem:** Dona do produto ("preparar a aplicação para testes reais controlados após a publicação, restringindo inicialmente o acesso").
- **Decisão:** durante a fase de testes, só usam a plataforma a master e as pessoas cujo e-mail está na lista `ei_testers` e foi confirmado na conta. Sem isso, a pessoa entra, mas vê "Acesso por convite" e não cria organização, desafio nem usa a IA. Conferido no banco (`ei_has_access`), não só na tela.
- **Fundamento:** o Supabase Auth é compartilhado com o site (D-006); qualquer pessoa pode criar conta, então o controle precisa estar no banco.
- **Alternativas consideradas:** deixar o cadastro do Supabase fechado e convidar pelo painel (também gratuito, mas fecha o cadastro do site inteiro e não impede uso por quem já tem conta); senha única de acesso (fácil de vazar).
- **Como convidar:** um comando no SQL Editor (README da aplicação).

## D-015 · 20/10/2026 · IA com custo controlado

- **Origem:** Dona do produto ("implemente mecanismos para evitar consumo desnecessário das APIs de inteligência artificial").
- **Decisão:**
  - a sugestão da IA fica guardada por desafio (`ai_interpretations`); abrir ou recarregar a página devolve a guardada, sem nova chamada;
  - cada uso é reservado no banco antes da chamada (`ei_ai_begin`) e contado em `ai_usage`, inclusive os que falham;
  - limites iniciais: 3 por desafio, 20 por pessoa por dia, 100 na plataforma por dia; ajustáveis em `ei_settings` sem publicar código;
  - chave `ai_enabled` desliga a IA na hora; a pessoa continua preenchendo à mão;
  - duas chamadas simultâneas para o mesmo desafio são bloqueadas;
  - no máximo 2 tentativas por pedido (antes eram até 10) e limite de tamanho da resposta;
  - "Tentar de novo" só aparece quando pode funcionar.
- **Altera:** D-007 dizia que a auditoria não guarda o texto gerado. A auditoria continua sem o texto; a sugestão passa a ser guardada em tabela própria, sem acesso direto pelas APIs, para não pagar duas vezes pela mesma sugestão.
- **Números dos limites:** escolhidos pelo Claude como ponto de partida conservador; a dona do produto pode mudar a qualquer momento.

## D-016 · 20/10/2026 · Custo operacional mínimo

- **Origem:** Dona do produto (desativou o ambiente de homologação por custo; "nunca contrate, ative ou provisione serviços pagos sem minha autorização").
- **Decisão:** sem ambientes adicionais pagos. Testes automatizados, testes no banco dentro de transação desfeita e telas com servidor simulado; testes reais só depois da publicação, com acesso por convite (D-014). Nenhum serviço, plano ou recurso pago é ativado sem autorização.
- **Riscos de custo conhecidos:** listados no Implementation Log (entrada de 20/10/2026).

## D-017 · 20/10/2026 · IA desligada até revisar o tratamento de dados; conclusão do uso só pelo servidor

- **Origem:** Dona do produto (condições para aplicar a migração e publicar a função da IA).
- **Decisão:**
  - a IA fica desligada (`ei_settings.ai_enabled = false`) até a revisão das condições de tratamento de dados da API do Gemini; nenhuma informação real de cliente vai para a IA antes disso;
  - `ei_ai_finish` só pode ser chamada pelo servidor (função da IA com a chave de serviço); pessoas logadas não gravam sugestão nem auditoria de IA direto pela API;
  - toda mudança de banco do produto tem procedimento de reversão em `apps/experience-intelligence/supabase/rollback/`, e as versões anteriores da função da IA ficam guardadas na mesma pasta.
- **Religar a IA:** só com autorização da dona do produto, com um comando no SQL Editor (README da aplicação).

## D-018 · 20/10/2026 · Gemini sem faturamento; condições para religar a IA

- **Origem:** Dona do produto.
- **Fato verificado por ela:** a chave do Gemini está no Free Tier, no projeto "Rede de parceiros" do Google AI Studio, sem faturamento configurado.
- **Decisão:** não ativar faturamento neste momento. A IA continua desligada e o acesso continua restrito por convite.
- **Antes de ativar a IA para clientes, obrigatório:**
  - revisar as condições de tratamento de dados da API do Gemini no nível usado (D-017);
  - fazer um teste real de concorrência dos limites (C2-14). Os testes até agora rodaram em uma conexão só; a garantia contra chamadas simultâneas vem da trava do banco e ainda não foi medida com conexões paralelas.
- **Proibido sem nova autorização:** executar `supabase/rollback/20261020120000_reverter.sql`, que apaga as tabelas de convite e uso da IA.

## D-019 · 20/10/2026 · Arquitetura de IA independente de fornecedor

- **Origem:** Dona do produto.
- **Decisão:** a plataforma não fica dependente só do Gemini. A arquitetura deve permitir usar modelos do Google Gemini, da Anthropic (Claude), da OpenAI e de outros fornecedores. As seis diretrizes estão na seção 1 de [`PRODUCT_ARCHITECTURE.md`](../product/PRODUCT_ARCHITECTURE.md):
  1. escolher o modelo conforme a atividade;
  2. Methodology Engine e RAG independentes do fornecedor;
  3. comparar modelos por qualidade metodológica, precisão, confiabilidade, privacidade, velocidade e custo;
  4. registrar consumo e custo estimado por organização, pessoa e funcionalidade;
  5. limites de uso de IA por plano de assinatura;
  6. contratar ou configurar serviços com condições adequadas de privacidade antes de processar dados reais de clientes.
- **Fundamento:** evitar dependência de um único fornecedor e poder escolher pela qualidade, pela privacidade e pelo custo de cada atividade.
- **O que não muda agora:** nenhuma API nova é contratada ou integrada; a IA continua desligada (D-017, D-018); os controles de custo (D-015) continuam valendo.
- **Próximo passo:** quando começarem o Methodology Engine e o RAG, o Claude apresenta uma proposta técnica que aproveite o código existente. Nada é implementado antes da aprovação.

## D-020 · 20/10/2026 · A IA desenha o discovery desde a submissão do desafio

- **Origem:** Dona do produto ("A IA precisa começar a atuar desde o momento que a empresa submeteu o desafio, pois todas as etapas posteriores vão se desenhar de acordo com o desafio… Um discovery mal feito vai gerar recomendações ruins").
- **Decisão:** ao submeter o desafio, a IA propõe o plano de discovery: o que perguntar, qual método aplicar e o que a pessoa precisa fazer para obter e enviar as informações. As regras e os protocolos versionados (metodologia, seções 7 e 8) validam o plano e servem de contingência.
- **Fundamento:** a qualidade do discovery determina a qualidade das recomendações. Perguntas fixas não servem a desafios diferentes.
- **Guarda-corpos mantidos:**
  - a IA escolhe métodos só do catálogo e justifica;
  - o plano é validado e salvo, e recarregar não gera nada;
  - limites de uso;
  - a pessoa confirma o entendimento;
  - sem RAG simulado;
  - só dados fictícios no plano gratuito do Gemini (D-017, D-018).
- **Implementação:** proposta no corte UX-3 de [`UX_ONBOARDING_PROPOSAL.md`](../product/UX_ONBOARDING_PROPOSAL.md). Aguarda aprovação.

## D-021 · 20/10/2026 · Condução adaptativa: a plataforma conduz, acompanha e adapta (refina D-020)

- **Origem:** Dona do produto.
- **Decisão:** o discovery é um **ciclo adaptativo**, e não um plano fixo:

  > Desafio → Plano inicial → Atividade guiada → Evidências → Análise → Próxima decisão

  O ciclo se repete até haver evidências suficientes para avançar.
  - **Papéis:** a IA define a estratégia inicial; o Methodology Engine acompanha a execução e decide quando aprofundar, buscar outra perspectiva, revisar hipóteses ou avançar.
  - **Método nos bastidores:** o método fica oculto; a interface mostra ações, sem termos técnicos.
  - **Instrumentos:** toda atividade entrega o que é preciso para executá-la (roteiro de conversa, ficha de observação, orientação para registros e indicadores, campos estruturados de evidência, reconstrução de fluxo; anexos quando autorizados).
  - **Qualidade das evidências:** o sistema distingue fato, relato, observação, hipótese e conclusão, e aponta insuficiência, contradições, perspectivas não investigadas e risco de viés. A suficiência depende do método, do contexto, da diversidade de perspectivas e do risco. Não há diagnóstico ou recomendação categórica sem sustentação.
  - **Custo:** regras determinísticas sempre que possível; novas análises da IA só em marcos da investigação, com cache, limites e controle de custo.
  - **Biblioteca metodológica:** os seis protocolos iniciais são só o corpus de partida. A arquitetura deve permitir expandir com métodos validados (Methodology Engine e RAG especialista). A IA aplica apenas protocolos disponíveis e aprovados.
  - **Abrangência:** o percurso é multissetorial e multidisciplinar e é construído para o desafio e o contexto de cada caso.
  - **Sistema, não só IA:** Methodology Engine + RAG + IA + Validação de evidências + Experience Guide, com encaminhamento a especialista quando necessário (saúde e experiência de colaboradores exigem cuidado redobrado).
- **Arquitetura proposta:** seção 8 de [`UX_ONBOARDING_PROPOSAL.md`](../product/UX_ONBOARDING_PROPOSAL.md). Aguarda aprovação.

## D-022 · 20/10/2026 · Decisões de interface e prioridade

- **Origem:** Dona do produto.
- **Interface:**
  - marca **DM | Experience Intelligence** no cabeçalho e assinatura **"by Dani Moscatelli Studio"** no rodapé;
  - nome da pessoa **obrigatório** no cadastro, com edição posterior;
  - biblioteca de ícones `lucide-react` aprovada;
  - interface visual, responsiva, acessível e orientada por tarefas, com pouco texto.
- **Cadastro do cliente:**
  - fluxo completo (conta → organização → pagamento → desafio), mantido fora do acesso público enquanto o produto é construído;
  - nos testes, a etapa de pagamento é pulada.
- **Prioridade:**
  - primeiro, o contexto organizacional mínimo de que a IA precisa;
  - depois, o UX-3 (discovery inteligente);
  - o restante do onboarding pode vir depois.
- **Altera:** o subtítulo "Dani Moscatelli Studio" do cabeçalho, ainda não publicado, sai do cabeçalho e vai para o rodapé como "by Dani Moscatelli Studio".

## D-023 · 20/10/2026 · IA ligada temporariamente para testes com dados fictícios

- **Origem:** Dona do produto. Condições dela: só a conta dela autorizada; limites ativos; desligamento imediato; nenhum serviço pago.
- **Verificado antes de ligar:**
  - lista de convidadas vazia; a única conta master é contato@danimoscatelli.com.br;
  - visitante sem login não usa a IA, e pessoas logadas não concluem uso direto;
  - limites de 3 por desafio, 20 por pessoa por dia e 100 por dia na plataforma;
  - chave do Gemini no Free Tier, sem faturamento (D-018).
- **Feito:** `ei_settings.ai_enabled = true` em 20/10/2026, às 19:40 UTC.
- **Desligar:** `update public.ei_settings set ai_enabled = false where id;` (SQL Editor do Supabase), ou pedir ao Claude.
- **Regra:** só desafios fictícios, sem nomes, empresas reais, dados pessoais, de saúde ou confidenciais (termos do Gemini para o plano gratuito). Clientes reais continuam dependendo de D-017 e D-018.
- **Conta de cliente de teste:** a dona do produto indicou `daniellemoscatelli@gmail.com`, que é dela. Adicionada à lista de convidadas em 20/10/2026, às 19:54 UTC. É a única convidada, e as duas contas são da dona do produto.

## D-024 · 20/10/2026 · UX-3a aprovado, com condições

- **Origem:** Dona do produto.
- **Aprovado:** a arquitetura da seção 8 de `UX_ONBOARDING_PROPOSAL.md` e o início do UX-3a, em incrementos pequenos e verificáveis.
- **Condições:**
  - **personalização desde o primeiro momento:** para cada desafio, a plataforma determina quais informações são necessárias, quais atividades as produzem e quais critérios indicam investigação suficiente;
  - **cada atividade apresenta:**
    - o que fazer e por que (linguagem simples);
    - onde e com quem obter;
    - como executar;
    - quais perguntas fazer ou dados observar;
    - como registrar e enviar;
    - o que fazer se não conseguir;
  - **instrumentos gerados para o desafio e o contexto da organização;** nada de roteiros universais;
  - **qualidade:**
    - avaliar a suficiência antes de concluir;
    - resposta preenchida não é informação confiável por si só;
    - reconhecer lacunas, contradições e perspectivas não investigadas;
    - a validação de formato da IA não substitui a avaliação metodológica;
  - **o plano evolui** nos marcos, sem recomeçar do zero;
  - **conduzir, não transferir:** a plataforma acompanha a execução (explica, entrega o roteiro, registra, aponta insuficiência e orienta o próximo passo). Não é uma lista de tarefas transferida ao cliente;
  - **interface:** visual, com cards, indicadores de progresso, ícones e formulários adequados a cada atividade; nem formulário extenso nem chatbot interminável; preservar a copy e as diretrizes do kit de UX.
- **Limites:**
  - `ai_per_challenge` passou de 3 para **10**, só durante os testes (aplicado em 20/10/2026); 20 por pessoa por dia e 100 por dia na plataforma, mantidos;
  - registrar o consumo por atividade;
  - não gerar de novo conteúdo já salvo;
  - **o limite não encerra a investigação:** com dados insuficientes, a plataforma informa e permite continuar depois.
- **Conta de cliente de teste:** `daniellemoscatelli@gmail.com`, da dona do produto, separada da master, sem privilégios administrativos e só com dados fictícios.
- **RAG:** `RAG_ARCHITECTURE.md` incorporado em `docs/knowledge/`, com as divergências em `docs/knowledge/RAG_DIVERGENCES.md`.
- **Avaliação do incremento:** testar 3 desafios fictícios bem diferentes (experiência do paciente, usuários de um produto digital, processos e colaboradores). Antes do próximo incremento, a dona do produto avalia principalmente **a qualidade das atividades propostas**, não só se o código funciona.
- **Publicação:** antes de publicar, apresentar os resultados dos testes e pedir autorização.

## D-025 · 21/10/2026 · Cadastro em etapas: dados pessoais, depois empresa ou negócio

- **Origem:** Dona do produto.
- **Fluxo:**
  - botão "Cadastrar" no site (fica para depois);
  - **Etapa 1 · Seus dados:** nome completo, CPF, data de nascimento, estado, cidade, telefone, e-mail e senha, editáveis depois em "Meus dados";
  - confirmação do e-mail;
  - **Etapa 2 · Empresa ou negócio;**
  - área logada, que no primeiro acesso mostra a chamada para o primeiro desafio (o primeiro discovery).
- **Nomenclatura:** "organização" passa a ser **"empresa ou negócio"** na interface (escolha da dona do produto). No banco os nomes continuam os mesmos.
- **Finalidades do CPF e da data de nascimento** (LGPD; escolha da dona do produto):
  - identificar quem aceita o contrato e os termos de uso;
  - evitar contas duplicadas;
  - confirmar a maioridade;
  - cobrança, no futuro.

  Nota fiscal, não por enquanto. O texto da tela informa essas finalidades.
- **Proteção:**
  - os dados pessoais ficam em `ei_profiles`, sem leitura direta por ninguém;
  - a pessoa vê o próprio CPF mascarado;
  - a validação é feita no banco (dígitos do CPF, maioridade, telefone, UF);
  - no cadastro, os dados seguem com a criação da conta e um gatilho os grava e **retira dos metadados**, para o CPF nunca ir para o token de acesso;
  - o gatilho só age em cadastros do produto, e contas do site não são afetadas;
  - CPF repetido gera mensagem genérica, sem revelar que já existe.
- **Master:** não precisa do perfil pessoal para entrar (não é tratada como cliente).
- **Obrigatório antes do lançamento:** termos de uso e política de privacidade do produto com essas finalidades, retenção e direitos; avaliar a criptografia do CPF no banco.
- **Complemento (21/10/2026), dona do produto:**
  - título "Crie sua conta", barra de progresso e nome da etapa abaixo;
  - campos com os padrões do site (design system, `docs/design-system/COMPONENTES.md`);
  - senha com confirmação, força e visualização;
  - rodapé igual ao do site, com copyright, no lugar de "by Dani Moscatelli Studio".
- **Pendente (P-006):** cruzar o cadastro com o formulário de contato do site.

## D-026 · 21/10/2026 · Dados pessoais com necessidade, segurança e transparência (revê D-025)

- **Origem:** Dona do produto.
- **Diretrizes:**
  1. separar o cadastro da pessoa física do cadastro da empresa;
  2. gerenciar contas pessoais com id interno e e-mail confirmado, e avaliar o CNPJ para empresas brasileiras;
  3. antes de tornar o CPF obrigatório, verificar se há necessidade real que meios menos invasivos não atendam;
  4. se o CPF for necessário, criptografia quando recuperável e HMAC com chave secreta para duplicidade;
  5. nunca enviar CPF à IA nem colocá-lo em logs ou na auditoria sem necessidade;
  6. uma pessoa pode participar de várias empresas sem contas duplicadas;
  7. preparar os requisitos dos Termos de Uso e da Política de Privacidade (finalidades e bases legais), com a informação disponível desde os testes;
  8. registrar na documentação de arquitetura, segurança e produto.
- **Estado verificado (21/10/2026):** nenhum CPF armazenado; a migração do perfil pessoal (D-025) nunca foi aplicada. Detalhes em `docs/security/DADOS_PESSOAIS.md`.
- **Análise:** o CPF não é necessário para impedir duplicidades nesta fase. As contas já são únicas por e-mail confirmado, as empresas devem usar o CNPJ, e a maioridade pode ser declarada.
- **Suspenso até nova decisão:** CPF e data de nascimento obrigatórios no cadastro (D-025). A migração `20261021100000` e o formulário **não serão aplicados ou publicados** nessa forma.
- **Proposta:** ver P-007.
- **Estado e cidade (21/10/2026):** a dona do produto decidiu mantê-los obrigatórios, porque são importantes para a análise posterior do perfil de clientes. Essa finalidade precisa aparecer no aviso de privacidade e na política, com base legal declarada (ver `docs/legal/`).

## D-027 · 21/10/2026 · P-007 aprovada: cadastro sem CPF

- **Origem:** Dona do produto ("Sim, aprovo a P-007").
- **Decisão:**
  - sem CPF e sem data de nascimento;
  - caixa "Declaro que tenho 18 anos ou mais";
  - CNPJ opcional na empresa ou negócio, validado e único;
  - aviso de privacidade da fase de testes no cadastro ("Como usamos seus dados"), com aceite obrigatório registrado com data e versão (`testes-2026-10-21`);
  - CPF só no futuro, se houver necessidade, com criptografia e HMAC (`docs/security/DADOS_PESSOAIS.md`).
- **Estado:** implementado e testado, **não aplicado no banco e não publicado**. Ver o Implementation Log de 21/10/2026.

## D-028 · 21/10/2026 · Corpus inicial de protocolos incorporado como rascunho

- **Origem:** Dona do produto (envio do arquivo `05-corpus-inicial-protocolos-v0.1.json`).
- **Decisão:**
  - o arquivo foi incorporado sem alteração em `docs/knowledge/protocols/`;
  - os 6 protocolos são **rascunhos iniciais, não aprovados para produção** e não são metodologia definitiva;
  - não serão recriados do zero;
  - serão aprofundados com as fontes do RAG e a validação da dona do produto como especialista;
  - a arquitetura continua extensível para novos métodos de Service Design, UX Research, CX, Business Design, operações e outras disciplinas.
- **Compatibilidade:** `docs/knowledge/PROTOCOLS_COMPATIBILITY.md`.
  - **Esquema do RAG:** os 6 protocolos têm todos os 19 campos obrigatórios.
  - **Methodology Engine:** formato de id adotado do corpus; lacunas L1 a L8 registradas para a curadoria (instrumentos, critérios de suficiência, tipo de evidência, fase, vocabulário das etiquetas, entradas, um termo de jargão, cuidados específicos).
- **Nenhuma alteração** de código ou banco.

## D-029 · 21/10/2026 · Cadastro aprovado e P-008 aprovada

- **Origem:** Dona do produto ("Podemos aprovar o cadastro e usar os 6 protocolos, ainda em rascunho, nos testes da IA").
- **Decisão:**
  - cadastro em etapas aprovado para publicação (D-025, D-026, D-027): migrações `20261021090000` e `20261021100000` aplicadas no Supabase em 21/10/2026;
  - P-008 aprovada: nos testes da IA do UX-3a, os 6 protocolos do corpus v0.1 são usados como estão, como catálogo `draft`, só com dados fictícios, com instrumentos gerados pela IA dentro dos passos e cuidados de cada protocolo, marcados como rascunho para avaliação, e as lacunas L1 a L8 no relatório de qualidade. Produção continua exigindo protocolos `approved`.
- **P-006:** a dona do produto detalhou o pedido (contato do site vinculado ao perfil e desafios organizados em projetos). Registrado como P-009, aguardando proposta e aprovação.

---

## D-030 · 16/11/2026 · Padrões do site levados ao design system

- **Origem:** Dona do produto ("Verifique se isso deve ser levado para o design System" e "Sim, pode fazer"), depois de padronizar no site os accordions, o cabeçalho das gavetas, as descrições de seção e as sombras.
- **Decisão:**
  - cabeçalho de janelas e gavetas sem linha divisória, com fundo graphite-50 e degradê sutil até o conteúdo; aplicado à `Janela` do produto, que replica esse padrão do site;
  - accordion único do site (estilo das Dúvidas frequentes da Rede de Parceiros) registrado no design system para uso futuro; o produto ainda não tem accordion;
  - regras de tipografia (descrição de seção em 14 px no celular) e de sombra (cards com `--shadow-ds-md`, brilho vermelho só em botões) registradas.
- **Fora do design system:** a linha do tempo animada e os itens que surgem ao rolar ficam como recursos das páginas do site, não componentes do produto.
- **Trade-off:** o degradê ocupa um pouco mais de altura no topo da janela (padding inferior de 26 px) em troca da transição sem linha, igual à do site.

---

## D-031 · 16/11/2026 · Rastreamento dos e-mails da Rede de Parceiros (site)

- **Origem:** Dona do produto: saber quando cada integrante abre o comunicado da galeria, ser notificada e ver isso no perfil. Respostas: abertura e cliques; aviso no painel (sino) e no perfil; frase na Política de Privacidade aprovada.
- **Decisão:**
  - os e-mails do convite da galeria e dos comunicados registram entrega, abertura e clique pelos avisos (webhook) do Resend, gravados por e-mail enviado em `email_envios`, associado ao cadastro;
  - aviso no sino da área restrita na primeira abertura e no primeiro clique de cada e-mail; o aviso sai quando o perfil é aberto;
  - Política de Privacidade passa a informar o registro de entrega, abertura e acesso aos links.
- **Limites conhecidos:** a abertura é estimativa (Apple Mail abre sozinho; bloqueio de imagens esconde aberturas); o clique é o sinal confiável; só vale para e-mails enviados depois da ativação.
- **Segurança:** avisos aceitos só com assinatura válida do Resend (segredo `RESEND_WEBHOOK_SECRET_RASTREIO` nos segredos do Supabase, separado do `RESEND_WEBHOOK_SECRET` das respostas de contato, nunca no código); tabelas com RLS só para a administradora; e-mails que não são da rede são ignorados.

---

## D-032 · 17/11/2026 · Padrão de interface e interação por iniciativa própria

- **Origem:** dona do produto: "não quero mais ter que solicitar, já tem que ser propositiva do seu lado".
- **Decisão:** toda página, tela ou funcionalidade, do produto ou do site do estúdio, nova ou refeita, traz por iniciativa do Claude, sem pedido:
  - UX, UI e UX writing de qualidade;
  - motion design (transições, microinterações, retorno visual a cada ação, respeitando "menos movimento");
  - design de interação (mockups funcionais, simulações de cenários, demonstrações animadas, elementos que reagem ao uso);
  - visual bonito e moderno dentro do design system;
  - entrega funcionando e testada, com capturas, inclusive no celular.

  Regra registrada no `CLAUDE.md` (seção "Padrão de interface e interação"), igual à do projeto FindLook.
- **Limites:** a iniciativa vale para a forma (visual, movimento, interação e textos de interface). Não vale para criar conteúdo, dados ou funcionalidades novas, que continuam sendo perguntados antes. Animação nunca prejudica acessibilidade, desempenho ou clareza.

---

## D-033 · 23/11/2026 · Pesquisa pública Moda em Curitiba (site)

- **Origem:** dona do produto: pesquisa aberta ao público, no estilo do cadastro de parceiros, com visão analítica no painel (Projetos > Pesquisas), link para compartilhar, botão para tirar do ar e notificação a cada resposta. Especificação da experiência e questionário revisado (10 perguntas) enviados por ela.
- **Decisão:**
  - respostas e contatos de quem pede novidades em tabelas separadas (`pesquisa_respostas` e `pesquisa_interessados`), com identificadores diferentes e sem ligação entre si; contatos nunca aparecem nos gráficos;
  - participações encerradas pelas perguntas 1 e 2 também são gravadas (só com as respostas até ali), para medir quem ficou fora do público; perguntas 3 a 10 analisadas só nas completas;
  - um único arquivo de perguntas (`supabase/functions/pesquisa/questionario.json`) alimenta a página, a validação no servidor e o painel;
  - destaques do painel calculados dos próprios números, sem IA; relato guardado exatamente como enviado;
  - consentimento salvo com data, horário, versão e texto; exclusão e cancelamento pelo e-mail de contato e pelo botão Excluir no painel.
- **Trade-offs:** o identificador do envio evita duplicar a mesma participação (atualizar a página, tocar duas vezes), mas não impede que a mesma pessoa responda de novo em outro aparelho; o tempo de 3 a 5 minutos ainda precisa ser validado em teste real.

## D-034 · 23/11/2026 · Pesquisa Moda em Curitiba: identificação no início e uma participação por pessoa (site)

- **Origem:** dona do produto: a pesquisa deve aceitar uma resposta por pessoa. Ela pediu identificação no início com aviso da LGPD, a mesma identificação usada para os avisos do lançamento, e vantagens exclusivas para quem participa. Escolhas dela: nome, e-mail e WhatsApp obrigatórios; bloqueio por e-mail ou WhatsApp repetido; texto "vantagens exclusivas" (sem prometer desconto).
- **Decisão:**
  - nome, e-mail e WhatsApp são pedidos antes da primeira pergunta, com aviso da LGPD e confirmação de leitura (data, versão e texto guardados); o servidor confere antes das perguntas e de novo no envio;
  - os dados ficam na própria resposta (`pesquisa_respostas`), com índices únicos por pesquisa para e-mail e WhatsApp; isso substitui a separação entre respostas e contatos de D-033;
  - excluir a resposta no painel libera o e-mail e o WhatsApp para responder de novo;
  - o bloqueio por aparelho sai: o aviso de "já concluída" vale só para a sessão do navegador;
  - no fim, "Sim" para os avisos é a autorização (texto e versão próprios) e copia o contato para `pesquisa_interessados`, que continua alimentando a aba Interessados;
  - a identificação fica só na sessão do navegador; no rascunho local de 30 dias ficam apenas as respostas.
- **Trade-offs:** a participação deixa de ser anônima para a equipe (os resultados continuam sendo analisados e divulgados em conjunto). Uma pessoa com outro e-mail e outro WhatsApp ainda consegue responder de novo. A conferência antes das perguntas revela se um e-mail ou WhatsApp já participou.

## D-035 · 23/11/2026 · E-mails enviados direto para contato@ no painel (site)

- **Origem:** dona do produto: ver na página Contatos, com tag, as mensagens do formulário e os e-mails enviados direto para contato@danimoscatelli.com.br; só os que chegarem daqui pra frente; sem custo; aviso no Gmail dela.
- **Decisão:** ler a caixa da Hostinger por IMAP a cada 5 minutos (gratuito, sem mudar o MX nem a caixa), em modo só leitura, com a senha guardada como segredo do Supabase e cadastrada pela própria dona. E-mail de remetente sem conversa vira contato com origem "email"; de remetente com conversa entra no histórico dela. Avisos do próprio site são ignorados para não duplicar. O aviso de e-mail novo usa o Resend que o site já usa, e o endereço dele fica só no banco.
- **Trade-offs:** até 5 minutos de atraso; anexos não são copiados (ficam na caixa, com aviso na mensagem); newsletters e outros e-mails automáticos que caírem na caixa de entrada também aparecem; se a senha da caixa mudar, o segredo precisa ser atualizado (o erro fica registrado em `caixa_email_estado`). Alternativa descartada: encaminhar a caixa para o recebimento do Resend, que dependeria da cota do plano.

---

## D-038 · 23/11/2026 · DM | Experience Intelligence sai do Netlify para o Cloudflare Pages

- **Decisão da dona do produto:** levar o app (app.danimoscatelli.com.br) para o Cloudflare, onde já ficam o site do estúdio e o FindLook. A conta do Netlify está com pagamento atrasado e com as publicações pausadas.
- **Acesso:** continua fechado. Antes de qualquer página, o app pede usuário e senha (`apps/experience-intelligence/functions/_middleware.js`, segredo `SITE_SENHA` no Cloudflare; usuário `dani` ou `SITE_USUARIO`). Depois vem o login por convite do próprio app. Sem o segredo, o app fica fechado.
- **Aviso de privacidade:** onde dizia "Netlify: hospedagem do aplicativo", agora diz "Cloudflare". Por isso a versão passa a `testes-2026-11-23`, e quem já aceitou recebe o pedido de novo aceite.
- **Desligamento do Netlify:** só depois que o app estiver funcionando no Cloudflare. O projeto antigo do FindLook no Netlify (`helpful-meerkat-e4c2aa`) também é desligado.

## D-036 · 23/11/2026 · Pesquisa Moda em Curitiba: pergunta 4 com três notas (site)

- **Origem:** dona do produto: a pergunta 4 passa a ter três notas de 0 a 10 (Qualidade, Estética e Correspondência com o que eu procurava). Ela escolheu usar a média das três nos cruzamentos e pediu que a correspondência também fosse tratada separadamente, por ser o dado que mais interessa.
- **Decisão:** a "nota geral" de cada pessoa é a média dos três aspectos. Ela substitui a antiga nota única nos cruzamentos da Inteligência, e a correspondência aparece ao lado em cada cruzamento e num cartão próprio por canal. Respostas antigas com nota única continuam contando como nota geral.
- **Trade-offs:** a média esconde diferenças entre os aspectos; por isso o card da pergunta 4 mostra a média de cada um.

## D-039 · 23/11/2026 · Menu lateral recolhível, perfil no cabeçalho e cabeçalho branco nos painéis (site)

- **Origem:** dona do produto (mesmo padrão em construção no design system da FindLook).
- **Decisão:**
  - nos painéis, o menu lateral pode ficar expandido (ícone e nome) ou recolhido (só ícones, 72px), a partir de 1024px; abaixo disso, continua o menu que abre pela esquerda;
  - o perfil (foto, nome, Configurações e Sair) fica sempre no cabeçalho, à direita do sino, nunca no menu lateral;
  - o cabeçalho do painel é branco, como o menu lateral, com borda inferior fina; o conteúdo continua no cinza claro.
- **Escolha do Claude (forma):** com o menu recolhido, os subitens abrem num painel ao lado do ícone principal (mouse e foco), em vez de virarem ícones próprios: os subitens não têm ícone no design system e criar ícones novos fugiria dele; o painel mostra o nome do grupo, mantém a ordem do Tab e fecha com Escape.
- **Trade-offs:** o painel some ao tirar o mouse ou o foco; quem só usa o toque não recolhe o menu (recolher existe só a partir de 1024px).

## D-040 · 23/11/2026 · A área restrita consome o Design System Dani Moscatelli (site)

- **Origem:** dona do produto: "tudo deve consumir o Design System".
- **Decisão:** a área restrita (`public/admin/`) deixa de ter cores e padrões escritos à mão e usa os tokens do DS a partir de uma cópia do `theme.css`, sincronizada com aprovação (mesma rotina da FindLook: cópia diária, build, pull request para a dona do produto aprovar, issue em caso de falha).
- **Escolhas do Claude (forma):** o arquivo do DS é usado como está, sem Tailwind (o navegador ignora os blocos do Tailwind); botões, campos, abas e selos seguem os componentes do DS; nos gráficos, o lado "fácil" da matriz fácil × difícil usa os tons 5 e 6 e o neutro, e o lado "difícil" (o foco) os tons 1 e 2, porque o DS não tem paleta divergente; escalas com 5 passos começam no tom 7.
- **Trade-offs:** o `?v=` do `theme.css` precisa mudar a cada sincronização (o PR lembra); o anel de foco do DS (`--ring`, vermelho a 35%) e o hover do botão principal (`--primary-hover` igual ao `--primary` no tema claro) vêm do DS como estão; se precisarem de mais contraste, a mudança é feita no DS.

## D-041 · 23/11/2026 · Painel com a casca do site do DS, cards só com borda e faixa de cabeçalho (site)

- **Origem:** dona do produto (terceira rodada de ajustes da área restrita).
- **Decisão:** o painel segue a casca do site do Design System: cabeçalho branco na largura toda, com o logo à esquerda e notificações e perfil à direita; menu lateral abaixo dele, com o botão "Menu" no topo, grupos com seta e subitens numa linha-guia, item ativo rosa claro com texto vermelho, e o trilho recolhido só com ícones. Cards sobre o fundo `--background` só com borda, sem sombra parada. Cards com cabeçalho ganham a faixa `--graphite-100`.
- **Trade-offs:** larguras passam a ser as do site do DS (240px e 64px, antes 248px e 72px); o guia de cards do DS ainda indica "borda e sombra suave" para card sobre fundo cinza claro, o que diverge desta decisão (a mudança no DS fica com a dona do produto).

## D-042 · 23/11/2026 · Divisor no cabeçalho do card, hover mais claro e desabilitado do DS (site)

- **Origem:** dona do produto (quarta rodada de ajustes dos painéis).
- **Decisão:** o cabeçalho do card não tem faixa cinza; é separado do conteúdo por uma linha fina que some nas pontas. O hover de linha ou item dentro do card é bem claro e sutil: token `--row-hover` do DS (metade do `--graphite-50` sobre o card), decisão revista na quinta rodada. No card rosa da Início, o "não lidas" do canto sai por repetir a informação. O botão desabilitado usa o fundo `--graphite-100`. O menu lateral empurra o conteúdo, nunca o cobre (no DS e na área restrita). As mudanças de token foram feitas no DS (branch `claude/ajustes-painel`) e trazidas pela sincronização, sem editar a cópia.
- **Trade-offs:** a área restrita fica, por enquanto, com o `theme.css` de uma branch do DS ainda não publicada; ao publicar o DS, a sincronização diária volta ao `main` e o `?v=` precisa mudar.

## D-043 · 23/11/2026 · "Novo e-mail" na área de contatos, para qualquer endereço e com anexos de qualquer tipo (site)

- **Origem:** dona do produto. Escolheu:
  - o botão "Novo e-mail";
  - qualquer tipo de arquivo;
  - manter a assinatura atual;
  - as respostas da pessoa aparecem como conversa.
- **Decisão:**
  - O e-mail novo é gravado em `contatos` com `origem = 'enviado'` e o selo "Enviado". Assim, o histórico, as respostas recebidas e a reunião funcionam como nas outras conversas.
  - O envio usa a mesma função e a mesma assinatura das respostas, pelo remetente contato@danimoscatelli.com.br.
  - Anexos de qualquer tipo, até 10 por e-mail e 20 MB no total, no bucket privado `anexos`, que só a administradora lê.
- **Trade-offs:**
  - Aceitar qualquer tipo de arquivo amplia o que fica guardado no bucket. Ele continua privado e restrito à administradora.
  - Os e-mails enviados contam como conversas na lista, que passa a dizer "conversas" em vez de "mensagens recebidas".

## D-044 · 23/11/2026 · Pesquisa de moda inclui a Região Metropolitana; cidade e bairro no perfil (site)

- **Origem:** dona do produto.
- **Decisão:**
  - Quem mora em Curitiba ou na Região Metropolitana participa; só "Outra cidade" encerra.
  - Quem é da Região Metropolitana responde a 1.1, sobre comprar em Curitiba.
  - No perfil, a cidade é sempre perguntada e o bairro só para Curitiba ("não preciso saber o bairro da região metropolitana").
- **Fontes:**
  - 29 municípios da Região Metropolitana: AMEP, página "Municípios da Região Metropolitana de Curitiba", consultada em 23/11/2026.
  - 75 bairros e 10 regionais: "Administrações Regionais de Curitiba" (Prefeitura, 2017), conferido com "Curitiba: caminhos que educam" (SME, 2022).
  - O site da Prefeitura bloqueou a leitura automática; não foi possível conferir uma versão de 2025/2026.
- **Trade-offs:**
  - O Campo Comprido fica em Santa Felicidade, mas a parte sul pertence à regional Portão. O agrupamento por regional é aproximado nesse bairro.
  - O código `fora_de_curitiba` continua nos dados e passa a significar "fora de Curitiba e da Região Metropolitana".

## D-045 · 23/11/2026 · Alertas no padrão novo e cores de aviso e erro do DS Dani Moscatelli (site)

- **Origem:** dona do produto, ao aprovar o "Alerta com ação" e a opção B de cores no DS Dani Moscatelli (`697a765`).
- **Decisão:**
  - A área restrita recebe o `theme.css` do DS na versão `697a765`: o aviso passa a laranja amarelado (`#F0A020`) e o erro fica mais rosa (`#D9416E`); entram os tokens de texto `--warning-text`, `--success-text`, `--info-text` e `--error-text`.
  - Onde a área restrita usava `--warning` como cor de texto ou ícone, passa a usar `--warning-text`, porque o laranja amarelado não dá leitura sobre fundo claro:
    - Parceiros: `.tp-gal.wait`, `.ai-stale`, lacunas da IA (`--ai-av`), `.pcs-fit`, `.pc-fit` e o número da linha do tempo (`.tl-mark span`, com `--c-texto`);
    - Pesquisas: `.pa-dest-amostra` e o ícone de atenção.
- **Contraste:** `#935E0A` sobre o fundo de aviso dá 4,9:1 e no branco 5,5:1.
- **Trade-offs:** o ponto decorativo do selo pendente (`.badge.pend`) continua em `--warning`, porque não é texto.

## D-046 · 23/11/2026 · Contatos com abas Recebidos e Enviados; e-mail para vários destinatários, com Cc e Cco (site)

- **Origem:** dona do produto. Pediu:
  - separar enviados de recebidos em duas abas;
  - enviar com cópia, cópia oculta e para vários destinatários;
  - a janela no centro da tela, e não na lateral.
- **Decisão:**
  - A conversa guarda a lista de destinatários e as cópias. As respostas seguintes vão para os mesmos destinatários e cópias.
  - A cópia oculta vale só para o primeiro envio, para não expor nem incluir essas pessoas na conversa.
  - Limite de 20 endereços por envio.
- **Trade-offs:**
  - `contatos.email` continua com o primeiro destinatário, para não mudar a busca e a importação da caixa.
  - Uma resposta de alguém em cópia chega pela conversa, mas a conversa continua identificada pelo primeiro destinatário.

## D-047 · 23/11/2026 · App DM | Experience Intelligence consome tokens e componentes do DS Dani Moscatelli, com atualização diária

- **Origem:** dona do produto, 23/11/2026: "app EI consome tokens e componentes do DS Dani Moscatelli, com atualização diária" (escolheu "Tokens e componentes", não só os tokens).
- **Decisão:** o app (`apps/experience-intelligence/`) deixa de ter cores e componentes visuais feitos à mão. Usa Tailwind v4 com os arquivos do DS (`index.css`, `fonts.css`, `tailwind.css` e `theme.css`, mapeamento `@theme inline`) e os componentes `ui/` do DS (botão, campo, área de texto, rótulo, caixa de seleção, campo de senha, card, alerta, badge, progresso, avatar, menu suspenso, painel lateral, título, selo e, desde a versão `697a765`, o alerta com ação). Os arquivos são cópias listadas em `design-system/arquivos.txt`, atualizadas pela mesma rotina diária do site, que agora também roda tipos, lint, testes e build do app antes de abrir o pull request.
- **Escolhas do Claude (forma):**
  - nenhum componente copiado importa algo exclusivo do site do DS (como o `i18n`); por isso não foi preciso nenhum módulo de compatibilidade;
  - o Next descarta o `@import url(...)` externo do `fonts.css`; o `layout.tsx` lê o endereço das fontes da própria cópia do `fonts.css` e carrega por `<link>`, então muda junto com a sincronização;
  - as telas seguem a casca de painel do DS: cabeçalho branco na largura toda, perfil no cabeçalho (menu suspenso do DS no lugar da barra lateral), fundo cinza claro, cards só com borda e título da página fora dos cards;
  - seleções usam o select nativo no padrão da página Formulários do DS (o `ui/select` do Radix não aceita a opção vazia "Selecione" e troca o seletor nativo do celular);
  - o aviso de privacidade abre no painel lateral do DS (o `ui/dialog` tem o botão fechar com o texto "Close", em inglês, para leitores de tela);
  - o medidor de força da senha mantém as regras e os textos do app (`padroes.ts`), com as barras e os checks do campo de senha do DS.
- **Atualização (23/11/2026, DS `697a765`):** o app recebe o padrão novo de alertas (ícone com base) e as cores novas de aviso e erro do DS (D-045). Textos e ícones de erro do app passam ao token `--error-text` (a mensagem de erro dos campos usava `--primary-text`, que só coincidia com o erro enquanto o erro era o vermelho da marca); os ícones das mensagens seguem os do DS (aviso: círculo com exclamação; erro: triângulo). O `AlertaComAcao` passa a ser copiado, para quando um alerta do app pedir uma ação; hoje nenhum pede.
- **Trade-offs:** cada sincronização do DS pode mudar a aparência do app; os testes pegam erros de tipos e de build, não problemas visuais, então a dona do produto confere as telas antes de aprovar o PR. Itens que faltam no DS (rodapé sem "Preferências de cookies", select nativo como componente, "Fechar" em português no `ui/dialog`) ficam para decisão no DS, sem solução inventada no app.

## D-048 · 24/11/2026 · App DM | Experience Intelligence em stand-by

- **Origem:** dona do produto ("vamos deixar o app em stand-by por enquanto e quando eu retomá-lo você me notifica da tarefa de adequação").
- **Decisão:** nenhum trabalho novo no app até ela retomá-lo. O app segue no ar (Cloudflare Pages, com senha) e recebe a atualização diária do DS.
- **Ao retomar:** avisar a dona do produto da adequação pendente, a atualização do Next.js por causa de uma falha de segurança conhecida. O aviso está no `CLAUDE.md`, para qualquer sessão ver.

## D-049 · 27/11/2026 · Consumo obrigatório do design system por qualquer conversa e agente

- **Origem:** dona do produto ("quem está sendo o cérebro disso sou eu… gasta token à toa fazendo algo diferente do que já foi desenhado no DS").
- **Decisão:** regra fixa no `CLAUDE.md`: consultar o catálogo do DS antes de criar qualquer elemento visual e usar o componente ou template existente; se não existir, parar e perguntar; nada de valores ou componentes à mão; toda tarefa delegada leva a regra e o relatório diz qual componente cada peça usa; conferir antes de mostrar capturas.
- **Próximos passos:** catálogo gerado automaticamente nos dois DS e sincronizado com os projetos; conferência automática.

## D-050 · 27/11/2026 · Componente que falta é criado no DS, de forma formal e documentada

- **Origem:** dona do produto ("toda vez que eu pedir uma tela X… a primeira coisa é consultar o DS… se algo diferente for pedido que não esteja no DS, ambos os projetos têm autonomia para criar esse componente e enviá-lo para o DS de maneira formal e documental. Não podemos ter mais furos").
- **Decisão:** toda tela começa pela consulta ao DS. Se faltar algo, o projeto cria o componente dentro do DS, com a branch `componente/<nome>`, o componente em `ui/`, a documentação, o changelog, o catálogo e o registro em `propostas/`. O produto só o usa depois da sincronização, nunca como cópia local. Substitui o "parar e perguntar" da D-049.

## D-051 · 27/11/2026 · Área restrita refeita em React, com os componentes do DS, em lotes por tela (site)

- **Origem:** dona do produto: a área restrita (`/admin/`) passa a ser feita em React para usar os componentes reais do Design System Dani Moscatelli, porque as telas novas em HTML saíam fora do DS (cards com sombra no fundo cinza, bases de ícone com cores trocadas, linhas do tempo e cards de número feitos à mão). E, sobre a publicação: "Migração para o DS em lotes por tela. Lotes sem mudança visível podem ser publicados pelo Claude depois de todos os testes, da conferência e das capturas antes e depois, com resumo e imagens enviados à dona do produto em seguida. Lotes com mudança visível são aprovados por ela antes, com um 'sim' por lote."
- **Decisão:**
  - app em `apps/area-restrita/` (Vite 6, React 18.3 e Tailwind 4.1.12, as mesmas versões do DS), publicado no mesmo projeto do Cloudflare Pages do site: o `npm run build` da raiz também compila o app;
  - corte página a página por `apps/area-restrita/src/rotas.json`: "previa" serve a página em React em `/admin/app/<página>`; "publicada" a coloca no lugar da de HTML em `/admin/<página>` (só no build; a de HTML sai do repositório depois). As páginas de HTML continuam até cada uma ser substituída;
  - mesma conta, mesma sessão e mesmas chaves de armazenamento das páginas de HTML (entrar numa vale para a outra);
  - pasta `ui` inteira do DS sincronizada (o script do site passou a aceitar pastas e `excluir`, como o da FindLook);
  - conferência de conformidade com o DS (`npm run conformidade`, a da FindLook com paleta pink e sombra parada proibidas) em zero desde o primeiro dia, também na rotina diária do DS;
  - **as páginas em React mudam a aparência, então todo lote desta migração precisa do "sim" da dona do produto antes de publicar**; o merge da fundação publica só a prévia em `/admin/app/`.
- **Feito no branch `claude/admin-react` (sem publicar):** fundação, casca provisória com o `sidebar` do DS, login e a Início em prévia. Plano, ordem das páginas e estimativas em `docs/engineering/ADMIN_REACT.md`.
- **Trade-offs:** o build do site passa a depender do app (o workflow testa o app antes do PR); a casca aprovada (D-039, D-041), o card de número e o ícone com base de estado não existem como componentes no DS Dani Moscatelli (existem no DS da FindLook): a fundação usa o `sidebar` e o `Card` do DS e a diferença aparece nas capturas até as peças chegarem ao DS pelo processo formal (D-050); o `Button` principal e o `Badge` padrão do DS ficam em 4,2:1 de contraste (abaixo do AA), decisão no DS.

## D-052 · 27/11/2026 · Início da área restrita em React publicada (lote 1 da D-051)

- **Origem:** a dona do produto aprovou o desenho da Início em React e delegou a publicação (27/11/2026). O DS Dani Moscatelli publicou no `main` (`cb5847c`) as peças do painel (`painel-shell`, `painel-cabecalho`, `painel-dados`, `ChipDeEstado`, `BarraDeComposicao`, `MenuLateral grudarAbaixoDe`), as correções de alinhamento no celular e as cores aprovadas.
- **Decisão:**
  - `apps/area-restrita/src/rotas.json`: `"inicio": "publicada"`. O build grava a Início em React em `/admin/` (no lugar da de HTML, só no `dist`); as outras páginas continuam as de HTML até cada lote;
  - sincronização da área restrita pelo `main` do DS (`versao.txt` = `cb5847c`); o app Experience Intelligence fica de fora (stand-by, D-048): os arquivos dele continuam como no `main` do site;
  - páginas de HTML que continuam no ar: item ativo do menu no rosa do meio (`--primary-suave`, #FCEEEE), a regra de selecionado de 27/11/2026, e `?v=` novo no `theme.css` e no `admin.css` para o navegador não usar a versão antiga.
- **Voltar atrás:** trocar `"publicada"` por `"previa"` no `rotas.json`; o próximo build volta a servir a Início de HTML. A página `public/admin/index.html` só sai do repositório na limpeza (lote A9), depois de conferida no ar.
- **Trade-offs:** durante a migração, a pessoa alterna entre a Início em React e as páginas de HTML (aparências próximas, recarga ao trocar de página).

## D-053 · 27/11/2026 · Site público refeito em React com os componentes do DS, página por página (site)

- **Origem:** objetivo da dona do produto de o site e a área restrita consumirem 100% o Design System Dani Moscatelli (decisões de 27/11/2026). O site público consumia 0% do DS: nenhuma página carregava o `theme.css` nem componentes, o `menu.css` copiava valores do DS à mão e as páginas tinham milhares de cores soltas e estilos em linha. A dona do produto delegou a escolha de como o site consome o DS.
- **Decisão:** levar as páginas para React com os componentes do DS, uma de cada vez, como a área restrita (D-051), mantendo endereços, textos, cabeça (título, descrição, canonical, compartilhamento) e comportamento:
  - app próprio em `apps/site/` (Vite 6, React 18.3 e Tailwind 4.1.12, as versões do DS), no mesmo projeto do Cloudflare Pages: o `npm run build` da raiz também compila o app (`build:site`);
  - o build grava o HTML pronto de cada página (renderização no servidor só no build) e o navegador só liga o React nele: bom para buscadores e para a primeira pintura;
  - corte por `apps/site/src/rotas.json`: "previa" serve a página em `/site/previa/<caminho>` (sem indexação); "publicada" a coloca no lugar do HTML no mesmo endereço (só no `dist`; o HTML sai do repositório depois, num commit próprio); a cabeça de cada página fica no mapa e um teste compara com a do HTML;
  - pasta `ui` inteira do DS sincronizada, conformidade com o DS em zero (`npm run conformidade`), teste do app na rotina diária do DS;
  - `scripts/comparar-dist.mjs`: o dist do site precisa continuar igual byte a byte fora do app e das páginas publicadas;
  - aviso de cookies e WhatsApp das páginas em React vêm do DS (`AvisoCookies`, `BotaoWhatsApp`), com a mesma chave de cookies do `analytics.js` e a mesma regra de medição.
- **Alternativa descartada:** o DS publicar uma camada de CSS e HTML para as páginas estáticas (duplicaria o DS e manteria peças à mão).
- **Publicação:** a dona do produto delegou a publicação dos lotes (decisões de 27/11/2026: autonomia total para finalizar os DS e publicar, sem parar para aprovação). Cada lote só vai ao ar depois de todos os testes, da comparação do dist e das capturas antes e depois. A limpeza (S0) não muda nada no ar.
- **Feito (branch `claude/site-ds`, publicado no mesmo pull request):** S0 (app React antigo apagado, dist igual byte a byte); fundação do app; S7: 404 e descadastro publicadas, privacidade em prévia (falta a `Prosa` no DS). Plano, lotes S1 a S8 e lacunas do DS em `docs/engineering/SITE_REACT.md`.
- **Trade-offs:** o build do site passa a instalar e compilar mais um app (mais tempo de build); a 404 e o descadastro passam a carregar o CSS e o JavaScript comuns do site em React (28 kB e 56 kB comprimidos, em cache entre as páginas); durante a migração, convivem as peças comuns em HTML e em React; as páginas grandes dependem de peças que ainda faltam no DS (cabeçalho do site, cadastro em etapas, cards de depoimento e de artigo, entre outras) e não serão feitas à mão.
- **Lote S3 (página inicial, 27/11/2026, branch `claude/site-ds-2`):** `/` em React com o DS e publicada; cabeça igual à do HTML, agora com os dados estruturados (schema.org) no mapa (`cabeca.jsonld`); "Notificar lançamento" com a mesma tabela (`notificacoes_lancamento`, só o e-mail), as mesmas mensagens e o mesmo evento. Diferenças de forma: rótulo visível no campo de e-mail; alinhamento à esquerda no celular (uma borda só); duas colunas no hero a partir de 1280 px; setas dos logos trocadas pelo botão Pausar da `FaixaDeLogos` (WCAG 2.2.2). Apagados no mesmo lote: `projeto-piloto/index.html`, `src/projeto-piloto.ts`/`.css` (e a entrada no `vite.config.ts`) e `public/privacidade/index.html`, já publicadas e conferidas; as cópias ficam em `apps/site/tests/referencia/` só para os testes.
- **Lote S4 (Rede de Parceiros, 27/11/2026, branch `claude/site-ds-2`):** `/rede-parceiros/` em React com o DS e publicada; mesma cabeça, textos, links e eventos; o cadastro abre no `SidePanel` com a página do cadastro dentro (como a janela de antes). Diferenças de forma: a roda do ecossistema vira etiquetas e cards; a simulação vira a `Simulacao` do DS em 4 etapas, sem campos de mentira; a galeria continua oculta. Apagados: `index.html`, `src/em-breve.ts`/`.css` e `public/inicio/ie3-secoes.*` (Início conferida no ar).
- **Pendente da dona do produto:** escolher qual das três páginas de apresentação do EI fica (`/experience-intelligence/`, `-2/`, `-3/`); nenhuma foi apagada.

## D-054 · 27/11/2026 · Lançamento, Configurações e Comunicados da área restrita em React publicadas (lotes A2 a A4 da D-051); Reuniões espera o DS

- **Origem:** publicação delegada pela dona do produto (27/11/2026), com a mesma régua da Início (D-052): mesmos dados, comportamento e textos das páginas de HTML; só componentes do DS; testes, capturas e autocrítica.
- **Decisão:**
  - `rotas.json`: `lancamento`, `configuracoes` e `comunicados` em `"publicada"`; as páginas de HTML continuam no repositório até a limpeza (A9);
  - as janelas de escrever e-mail (Lançamento e Comunicados) e de ver o comunicado enviado passam a ser o `SidePanel` do DS (painel lateral com cabeçalho, corpo e barra de ação), porque o `Dialog` do DS ainda diz "Close" em inglês para leitores de tela; as confirmações são o `AlertDialog` do DS, com a palavra APAGAR nas exclusões definitivas;
  - Configurações em cards separados (Dados pessoais, E-mail de acesso, Senha, Gestão de dados, Log), cada um com o botão no canto inferior direito depois do divisor; campos com largura de leitura (até 36rem);
  - "Apagar tudo" usa o botão de contorno neutro com a lixeira (o DS ainda não tem o botão de exclusão em contorno); o vermelho fica na confirmação;
  - **Reuniões não foi feita**: o `Calendar` do DS é um seletor de datas (dia selecionado em vermelho cheio, dias de 32 px, sem marcação de eventos), não uma agenda. Fica como FALTA NO DS (`AgendaDoMes`) e a página continua a de HTML.
- **Voltar atrás:** trocar `"publicada"` por `"previa"` no `rotas.json` da página.

## D-055 · 27/11/2026 · Reuniões e Contato da área restrita em React publicadas, janelas no Dialog do DS e limpeza das páginas de HTML (lotes A5, A6 e A9 da D-051)

- **Origem:** o DS Dani Moscatelli publicou (`d2aeb40`) as peças que faltavam (`AgendaDoMes`, `CampoDeBusca`, `Button exclusao-contorno`, `EstadoVazio`/`EstadoFinal`, `CaixaDeEntrada`, `Conversa`, `CampoDeEmails`, `CampoDeHorario`, `TabelaAdaptavel`, `CampoCopiavel`, `Campo`, `ChipFiltravel`, `BotaoDeEnvio`), o `Dialog` com "Fechar", alvos de 44 px no toque e os tokens de tamanho de texto. Publicação delegada pela dona do produto.
- **Decisão:**
  - área restrita sincronizada com o DS `d2aeb40` (`apps/area-restrita` e `public/design-system/theme.css`); o app Experience Intelligence continua fora;
  - Reuniões (`AgendaDoMes` + lista) e Contato (`CaixaDeEntrada` + leitura com `Conversa`, responder, reunião em `Dialog`, novo e-mail com `CampoDeEmails`) em `"publicada"`;
  - as janelas de escrever e-mail (Lançamento, Comunicados), ver o comunicado enviado, reunião e novo e-mail voltam a ser janelas centrais (`Dialog`), como nas páginas de HTML; o painel lateral fica para o menu do celular e as notificações;
  - busca com `CampoDeBusca`, estados vazios com `EstadoVazio`, "Apagar tudo" e exclusões com `Button exclusao-contorno`, textos com os tokens `text-body`, `text-body-sm`, `text-label`;
  - páginas apagadas de `public/admin/` (A9): Início, Lançamento, Configurações, Comunicados, Contato e Reuniões; do `admin.js` saem as funções que só elas usavam; do `admin.css`, as regras sem uso. Parceiros e Pesquisas continuam de HTML.
- **O que mudou em relação à página de HTML (forma, não conteúdo):** a busca de endereço da reunião presencial (sugestões do OpenStreetMap) ficou de fora: o DS não tem campo de endereço com sugestões (FALTA NO DS, `ADMIN_REACT.md` §7.2); o endereço é digitado. O calendário da data da reunião abre embaixo do campo, dentro da janela (o `Popover` do DS não se posiciona dentro do `Dialog`).
- **Voltar atrás:** trocar `"publicada"` por `"previa"` no `rotas.json` e restaurar a página de HTML do histórico do git (commit anterior a este lote).

## Decisões pendentes

- **P-006 · 21/10/2026 · Cruzar o cadastro com o formulário de contato do site.** Pedido da dona do produto: se o e-mail já enviou contato pelo site, mostrar se a pessoa já relatou o desafio e o que ficou registrado. Proposta do Claude:
  - cruzar pelo e-mail confirmado, no servidor;
  - a pessoa vê só o que ela enviou e escolhe o que aproveitar (dados pessoais, empresa, mensagem como ponto de partida do desafio);
  - a master vê o histórico completo na Área master;
  - atualizar a Política de Privacidade antes do lançamento;
  - conteúdo real não vai para o Gemini gratuito.

  Substituída por P-009 (detalhamento da dona do produto em 21/10/2026).

- **P-009 · 21/10/2026 · Contato do site vinculado ao perfil e desafios em projetos.** Pedido da dona do produto:
  - o app procura um contato do site com o mesmo e-mail confirmado da conta; se achar, o histórico fica vinculado internamente ao perfil;
  - se o contato foi sobre um projeto (campo assunto), perguntar se o projeto é o mesmo e se a pessoa quer continuar de onde parou; a mensagem do contato pode vir para o campo do desafio, editável;
  - se o contato foi por outro motivo, ele também fica vinculado ao perfil;
  - se foi sobre outro projeto, o painel da organização mostra um card do projeto anterior (aberto, sem continuidade, que pode ser retomado) e o novo projeto;
  - desafios passam a ficar dentro de projetos, que a pessoa pode nomear;
  - fluxo: cadastro pessoal > escolha do pacote e pagamento (por enquanto pulado) > cadastro da empresa ou estabelecimento > projeto (desafio).

  Aguarda proposta do Claude e aprovação.

- **P-005 · Arquivos citados no RAG:**
  - `05-corpus-inicial-protocolos-v0.1.json` foi recebido em 21/10/2026 (D-028);
  - continuam ausentes `SOURCE_CATALOG.json`, `RAG_SOURCE_PLAN.md` e `RAG_INTEGRATION_NOTES.md`, que não bloqueiam o UX-3a.
- ~~**P-008**~~: aprovada em D-029.

Outras pendências de produto (preço, nicho, provedor de IA etc.) estão na seção 14 da visão.
