# Documentação do produto DM | Experience Intelligence

Esta documentação é parte integrante do produto, não material de apoio descartável. Ela permite continuar o desenvolvimento em novas sessões sem reconstruir o contexto, desde que os arquivos permaneçam no repositório.

## Os quatro registros permanentes

| Registro | Pergunta que responde | Arquivo |
|---|---|---|
| **Product Vision** | Onde queremos chegar? | [`strategy/PRODUCT_VISION.md`](strategy/PRODUCT_VISION.md) |
| **Product Backlog** | O que precisamos construir e em qual prioridade? | [`product/PRODUCT_BACKLOG.md`](product/PRODUCT_BACKLOG.md) |
| **Decision Log** | Quais decisões foram tomadas, por que e quais alternativas foram consideradas? | [`decisions/DECISION_LOG.md`](decisions/DECISION_LOG.md) |
| **Implementation Log** | O que foi efetivamente desenvolvido, testado e colocado em funcionamento? | [`engineering/IMPLEMENTATION_LOG.md`](engineering/IMPLEMENTATION_LOG.md) |

## Documentos de referência

| Documento | Conteúdo | Origem |
|---|---|---|
| [`strategy/PRODUCT_VISION.md`](strategy/PRODUCT_VISION.md) | Visão, Business Model Canvas, jornada, roadmap por horizontes, riscos e declaração da dona do produto | `03-visao-negocio-produto-roadmap-v1.md` |
| [`strategy/BUSINESS_MODEL_CANVAS.md`](strategy/BUSINESS_MODEL_CANVAS.md) | Aponta para a seção 4 da visão | Criado na organização |
| [`strategy/ROADMAP.md`](strategy/ROADMAP.md) | Aponta para a seção 7 da visão | Criado na organização |
| [`product/CHALLENGE_METHODOLOGY.md`](product/CHALLENGE_METHODOLOGY.md) | Challenge Model, Methodology Engine, regras de domínio, testes de aceitação e cortes | `01-architecture-challenge-methodology-v1.md` |
| [`product/PRODUCT_ARCHITECTURE.md`](product/PRODUCT_ARCHITECTURE.md) | Decisões de arquitetura que valem para além de um incremento (ex.: IA independente de fornecedor), separando decidido de existente | Criado em 20/10/2026 |
| [`product/ux-onboarding/`](product/ux-onboarding/00-LEIA-PRIMEIRO.md) | Kit de Product Design: primeiro acesso, cadastro B2B, copy e investigação adaptativa | `DM_Experience_Intelligence_UX_Onboarding_Dinamico_v1.zip` (copiado sem alteração) |
| [`product/UX_ONBOARDING_PROPOSAL.md`](product/UX_ONBOARDING_PROPOSAL.md) | Comparação do kit com o código e proposta de implementação (aguardando aprovação) | Criado em 20/10/2026 |
- [`product/LANDING_PROPOSAL.md`](product/LANDING_PROPOSAL.md): landing page pública do produto, separada do login (aprovada em D-030, implementada) e fontes dos dados de mercado.
- [`product/LANDING_COMERCIAL_PLANO.md`](product/LANDING_COMERCIAL_PLANO.md) e [`product/landing-comercial/`](product/landing-comercial/): especificação da landing comercial v1, complemento dos cinco conteúdos e plano de implementação (implementado, D-031).
- [`product/LANDING_REVISAO_UIUX.md`](product/LANDING_REVISAO_UIUX.md): revisão de UI/UX da landing com a skill ui-ux-pro-max (pontos para decisão).
| [`knowledge/RAG_ARCHITECTURE.md`](knowledge/RAG_ARCHITECTURE.md) | Knowledge Engine / RAG: camadas de conhecimento, protocolos, proveniência, recuperação e testes | Kit Completo v4 (copiado sem alteração) |
| [`knowledge/RAG_DIVERGENCES.md`](knowledge/RAG_DIVERGENCES.md) | Diferenças entre o documento do RAG e as decisões recentes; arquivos citados e ausentes | Criado em 20/10/2026 |
| [`knowledge/protocols/05-corpus-inicial-protocolos-v0.1.json`](knowledge/protocols/05-corpus-inicial-protocolos-v0.1.json) | Corpus inicial com os 6 protocolos (rascunho, não aprovado para produção) | Enviado pela dona do produto (copiado sem alteração) |
| [`knowledge/PROTOCOLS_COMPATIBILITY.md`](knowledge/PROTOCOLS_COMPATIBILITY.md) | Compatibilidade do corpus com o esquema do RAG e o Methodology Engine; lacunas para curadoria | Criado em 21/10/2026 |
| [`security/DADOS_PESSOAIS.md`](security/DADOS_PESSOAIS.md) | Dados pessoais: estado atual do CPF, necessidade e proposta de proteção | Criado em 21/10/2026 |
| [`legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md`](legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md) | Requisitos dos Termos de Uso e da Política de Privacidade | Criado em 21/10/2026 |
| [`design-system/COMPONENTES.md`](design-system/COMPONENTES.md) | Componentes do produto e origem no site | Criado em 21/10/2026 |
| [`engineering/FIRST_INCREMENT_PROMPT.md`](engineering/FIRST_INCREMENT_PROMPT.md) | Escopo aprovado do primeiro incremento (Cortes 1 e 2) | `02-prompt-claude-code-primeiro-incremento.md` |
| [`research/VALIDATION_LOG.md`](research/VALIDATION_LOG.md) | Aprendizados de validação de mercado e com usuários | Criado na organização |
| [`../CLAUDE.md`](../CLAUDE.md) | Instruções persistentes para o Claude Code | `CLAUDE.md` do kit |

## Regras de atualização

1. Quando uma funcionalidade for criada ou alterada, o Claude atualiza no mesmo commit:
   - **Implementation Log**: o que foi feito, arquivos, migrações, comandos de teste executados e resultado real (inclusive falhas).
   - **Product Backlog**: status do item (concluído, em andamento, próximo, fora de escopo).
   - **Decision Log**: toda decisão de produto ou arquitetura tomada no caminho, com fundamento e alternativas.
   - **Product Vision**: somente quando a dona do produto alterar visão, princípios, público ou modelo de negócio.
2. Distinguir sempre: **visão** ≠ **roadmap** ≠ **escopo aprovado** ≠ **implementado** ≠ **testado** ≠ **validado com usuários**.
3. Nunca marcar algo como pronto por existir tela, tabela, mockup ou prompt.
4. Toda funcionalidade deve indicar em qual elo da cadeia de valor atua: **Identificar um desafio → Investigar a realidade → Compreender as pessoas → Transformar o serviço → Avaliar os resultados**.
