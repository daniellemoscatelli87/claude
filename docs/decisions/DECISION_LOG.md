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

---

## Decisões pendentes

### P-003 · Migrações versionadas no repositório

- **Origem:** Proposta do Claude, pendente.
- **Contexto:** até hoje as migrações do site foram aplicadas direto no Supabase e não estão versionadas no repositório. O kit exige `supabase/migrations/` versionado, com RLS e políticas.
- **Proposta:** para o produto, toda mudança de banco nasce como arquivo em `supabase/migrations/` (dentro da pasta da aplicação), aplicada a partir do arquivo e registrada no Implementation Log.
