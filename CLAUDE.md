# CLAUDE.md — DM | Experience Intelligence

> **Escopo deste repositório.** Além do produto DM | Experience Intelligence, este repositório contém o site do estúdio (danimoscatelli.com.br: página inicial, área restrita, Rede de Parceiros e Store). As regras abaixo valem para o produto. Ao mexer no site, siga as convenções já existentes no código do site.
>
> **Registros permanentes do produto** (ver `docs/README.md`): Product Vision (`docs/strategy/PRODUCT_VISION.md`), Product Backlog (`docs/product/PRODUCT_BACKLOG.md`), Decision Log (`docs/decisions/DECISION_LOG.md`) e Implementation Log (`docs/engineering/IMPLEMENTATION_LOG.md`). Sempre que uma funcionalidade do produto for criada ou alterada, atualize os registros correspondentes no mesmo commit.

> **Arquivo de instrução persistente do repositório** para Claude Code. Se recebido como anexo no chat, crie ou atualize `CLAUDE.md` na raiz do projeto e copie os documentos de referência para `/docs` antes de programar. Se não tiver permissão/acesso ao workspace, explique isso claramente e oriente a dona do produto pelo celular, sem afirmar que salvou arquivos.

## Missão e visão obrigatórias

Construir SaaS B2B multiorganização **comercializável e utilizável independentemente da consultoria**, da Dani Moscatelli | Experience Design Studio. O usuário começa por **“O que você deseja melhorar?”** e é conduzido, sem jargões de Service Design, a investigar um desafio humano, reunir evidências, entender hipóteses, planejar/testar melhorias **também físicas, operacionais e humanas** e avaliar resultados. A consultoria é opção especializada complementar, nunca pré-requisito artificial. O objetivo não é criar somente telas nem um chatbot genérico.

## Leia antes de executar

1. `docs/strategy/PRODUCT_VISION.md` — visão completa, Business Model Canvas, jornada, horizontes e hipóteses (origem: `03-visao-negocio-produto-roadmap-v1.md`).
2. `docs/product/CHALLENGE_METHODOLOGY.md` — Challenge Model + Methodology Engine e regras de domínio (origem: `01-architecture-challenge-methodology-v1.md`).
3. `docs/engineering/IMPLEMENTATION_LOG.md` e `docs/decisions/DECISION_LOG.md`, se existirem.
4. O prompt atual da usuária (origem do primeiro incremento: `02-prompt-claude-code-primeiro-incremento.md`).

Se os arquivos estiverem ausentes, informe precisamente quais faltam e peça apenas o necessário; **não invente conteúdo**. Se os anexos estiverem legíveis, materialize o conteúdo no repositório antes de codificar e confirme caminhos criados.

## Regras permanentes

- **Distinguir visão ≠ roadmap ≠ escopo do incremento ≠ implementado ≠ validado.** Não implementar recursos futuros sem autorização.
- **Prioridade de referência:** visão/modelo de negócio = `PRODUCT_VISION.md`; regras de domínio = `CHALLENGE_METHODOLOGY.md`; escopo imediato = último prompt aprovado; segurança sempre obrigatória.
- Cada tarefa deve manter: problema humano, valor para o cliente, dados/evidências necessários, UX guiada e critérios de aceitação.
- Preferir fluxo com `next_best_action` controlado, estado verificável e protocolos versionados; IA redige/analisa sob guardrails, mas não decide sozinha permissões/transições críticas.
- O RAG deve recuperar conhecimento curado, com proveniência, licenças e contexto; **não** simular “RAG pronto” só com strings ou prompts.
- Diferenciar declaração de participante, observação, registro, medição, hipótese e conclusão. Não inventar causa, fonte ou eficácia.
- O usuário pode responder “não sei”; ofereça instrução de como obter a informação e alternativa segura.
- Não presumir que a solução é digital; investigar operação, ambientes, pessoas, processos, sistemas, políticas e contexto.
- Consultoria via notificações/CTA contextuais e transparentes, com opt-in e proteção dos dados do cliente; não forçar compra.
- Multi-tenant com isolamento rigoroso, RLS, autenticação, roles, auditoria, proteção de segredos e cuidado com LGPD.
- Em saúde, não coletar dados clínicos identificáveis no primeiro incremento nem sugerir decisões clínicas automáticas.
- Acessibilidade, responsividade mobile e linguagem simples desde o primeiro fluxo.
- Testar o comportamento com scripts e casos de aceitação. **Nunca afirmar que algo está funcional sem executar/verificar.**

## Modo de colaboração: dona do produto trabalha no celular

- Use respostas curtas, orientadas a ação, com **um passo de configuração por vez**, caminhos clicáveis/instruções em português e um critério de verificação para cada passo.
- Execute diretamente no workspace o que puder. Não peça cópia manual de blocos enormes se puder gravar arquivos.
- Antes de mudanças significativas: explique objetivo, arquivos, migrações e risco resumidamente.
- Ao terminar cada incremento: informe arquivos alterados, testes realmente executados, evidência, pendências e próximo passo.
- Nunca exponha chaves privadas ou peça para colá-las em mensagens; instrua o uso seguro de variáveis/segredos.
- Não decidir silenciosamente preço, nicho, regras clínicas ou ofertas comerciais. Registre hipóteses e solicite decisão somente se bloquear o corte.

## Registro obrigatório após mudanças

Se existirem no repositório, atualize:
- `docs/decisions/DECISION_LOG.md`: decisão, data, fundamento, trade-offs.
- `docs/engineering/IMPLEMENTATION_LOG.md`: status real, caminhos, migrations, comandos de teste e falhas.
- `docs/product/PRODUCT_BACKLOG.md`: incremento concluído, próximo e fora de escopo.

## Corte inicial explicitamente aprovado

Implementar **fundação SaaS + entrada e enquadramento inicial de desafios** conforme o arquivo `02-prompt-claude-code-primeiro-incremento.md`. Os recursos de RAG real, diagnóstico avançado, billing e ciclo de transformação completo fazem parte do norte/roadmap, não estão autorizados a serem simulados nem implementados integralmente no primeiro corte.
