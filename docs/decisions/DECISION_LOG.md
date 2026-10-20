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

---

## Decisões pendentes

- **P-004 · 20/10/2026 · Proposta de primeiro acesso, cadastro B2B e investigação adaptativa** ([`UX_ONBOARDING_PROPOSAL.md`](../product/UX_ONBOARDING_PROPOSAL.md)). Aguarda a dona do produto decidir:
  - a assinatura (rodapé do kit ou "Dani Moscatelli Studio" no cabeçalho);
  - se o nome da pessoa é obrigatório;
  - a biblioteca de ícones `lucide-react`;
  - a ordem dos cortes UX-1 a UX-3;
  - o documento `docs/knowledge/RAG_ARCHITECTURE.md`, citado pelo kit e ausente no repositório.

Outras pendências de produto (preço, nicho, provedor de IA etc.) estão na seção 14 da visão.
