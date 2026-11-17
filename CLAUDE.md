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

## Padrão de interface e interação (regra permanente da dona do produto, 17/11/2026)

Vale para o produto e para todo o site do estúdio (página inicial, área restrita, Rede de Parceiros e Store). A dona do produto preza muito por design de interação e não quer precisar pedir isso. **Por iniciativa própria, sem esperar pedido,** toda página, tela ou funcionalidade nova ou refeita deve trazer:
- **UX, UI e UX writing de qualidade:** hierarquia clara, linguagem simples e da marca, estados vazios, de carregamento, de sucesso e de erro bem escritos, e acessibilidade (WCAG 2.2 AA).
- **Motion design:**
  - entradas e transições suaves, microinterações e retorno visual a cada ação (por exemplo: carregando, depois sucesso com check, depois volta ao estado inicial);
  - os tokens e padrões de movimento do design system;
  - sempre respeitar "menos movimento".
- **Design de interação:**
  - mockups funcionais e simulações de cenários (por exemplo, a demonstração com cursor contando a história em etapas);
  - demonstrações animadas;
  - elementos que reagem ao uso (hover, toque, rolagem, arrastar), e não telas estáticas.
- **Interfaces bonitas e modernas,** dentro do design system oficial. O que faltar nele é proposto ao design system primeiro, como já é regra.
- **Pesquisa quando necessário:** buscar skills e recursos (por exemplo, as skills de design de interface disponíveis e as bibliotecas de animação já usadas no projeto) e entregar **funcionando e testado**, com capturas do resultado, inclusive no celular.

**Limites:**
- Ser propositiva vale para a forma: visual, movimento, interação e textos de interface da página ou funcionalidade pedida.
- Não vale para inventar conteúdo, dados ou funcionalidades novas. Novas funcionalidades e mudanças de escopo continuam sendo perguntadas antes.
- Animação nunca pode prejudicar acessibilidade, desempenho ou clareza.

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
