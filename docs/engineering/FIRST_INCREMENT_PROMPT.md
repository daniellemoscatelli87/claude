# Prompt de implementação para Claude Code — DM | Experience Intelligence

Você é o engenheiro responsável por implementar o **primeiro incremento funcional de um SaaS B2B multi-tenant**. Antes de programar, leia integralmente `03-visao-negocio-produto-roadmap-v1.md` (visão, Business Model Canvas, roadmap e hipóteses), `01-architecture-challenge-methodology-v1.md` (regras do domínio) e `CLAUDE.md` (instruções persistentes). A visão estratégica explica **onde queremos chegar**; este prompt delimita **somente o incremento atual**. Não confunda roadmap com autorização de construção. Não crie funcionalidades além do escopo para esconder lacunas de implementação.

## Contexto de produto
**A plataforma precisa nascer com arquitetura de produto independente comercializável, mesmo que este primeiro corte ainda não constitua uma versão pronta para venda.** O Business Model Canvas descreve hipóteses a validar, não certezas; preço, nicho e funcionalidades futuras não devem ser inventados.

O usuário começa descrevendo **o desafio que quer resolver**. O sistema conduz uma investigação fundamentada, uma pergunta/atividade por vez, e registra evidências. A pessoa não precisa conhecer Service Design. A plataforma considera serviços físicos, digitais, humanos, processos e operação. A consultoria especializada é opcional, acionada por contexto e consentimento.

## Sua primeira tarefa (sem atalhos)
1. Examine o repositório existente. Identifique stack, estrutura, scripts, configurações, banco e testes. Se estes arquivos foram enviados como anexos e estiverem acessíveis, grave cópias permanentes no repositório: `CLAUDE.md` na raiz; `03-visao-negocio-produto-roadmap-v1.md` em `docs/strategy/PRODUCT_VISION.md`; `01-architecture-challenge-methodology-v1.md` em `docs/product/CHALLENGE_METHODOLOGY.md`; e este prompt em `docs/engineering/FIRST_INCREMENT_PROMPT.md`. Crie também logs mínimos `docs/decisions/DECISION_LOG.md`, `docs/product/PRODUCT_BACKLOG.md`, `docs/engineering/IMPLEMENTATION_LOG.md`, com status honesto. Não afirme que gravou se o workspace não estiver acessível.
2. Relate brevemente o estado encontrado e proponha um plano incremental com arquivos a criar/alterar, migrações e riscos.
3. Se o repositório estiver vazio, inicialize projeto com Next.js + TypeScript, interface responsiva, componentes acessíveis e Supabase (PostgreSQL/Auth/RLS). Use uma biblioteca de validação de schemas, separando regras de domínio das páginas.
4. **Implemente apenas o Corte 1 (fundação SaaS) e Corte 2 (Challenge Intake)**, mas deixe interfaces tipadas para o próximo módulo. Não avance silenciosamente para todos os cortes.
5. Faça testes automatizados de isolamento multi-tenant e validação dos campos do Challenge Model.
6. Execute lint, typecheck e testes disponíveis; relate o resultado de cada comando sem inventar execução.
7. Apresente instruções explícitas, passo a passo, para configurar variáveis de ambiente, criar projeto Supabase, aplicar migrações e testar o fluxo no navegador. Não solicite que eu exponha chaves secretas no chat nem coloque segredos no código.

## Requisitos que não podem ser descumpridos
- Tabelas iniciais: `organizations`, `organization_members`, `challenges`, `challenge_versions`, `audit_events`. Adicionar tabelas adicionais apenas com justificativa.
- **RLS obrigatório** em tabelas organizacionais, com políticas testadas. Nem cliente nem API podem acessar dados de outro tenant. O acesso de estúdio não é global.
- Desafio salva `original_statement` literalmente; extração de título/contexto por IA é proposta editável e não sobreescreve texto original.
- UI inicial: criar/selecionar organização, informar “O que você quer melhorar?”, ver versão estruturada, confirmar ou editar, visualizar desafio criado e a próxima pergunta contextual (pode estar inicialmente mockada por regra determinística).
- O usuário deve entender próximo passo em linguagem simples; nada de termos metodológicos na interface padrão.
- Suporte a “não sei” como estado válido; o usuário recebe alternativas práticas, mesmo se implementadas inicialmente como fluxo simples.
- Não inventar fonte ou causa do problema, não presumir solução digital, não usar modelos de linguagem para autorizar transições de fase.
- Dados sensíveis: não criar coleta de dados pessoais clínicos na primeira versão; instrução visível de não inserir dados identificáveis.
- Implementação em incrementos testáveis, com estrutura preparada para RAG, mas **não** implementar um RAG fictício sobre textos aleatórios.

## Arquitetura recomendada
```text
src/
  app/                 # rotas, layouts e UI
  components/          # componentes de experiência guiada
  domain/
    challenge/         # tipos, regras, estados e validadores
    methodology/       # contratos para protocolos e next_best_action
  application/         # casos de uso e orquestração
  infrastructure/      # Supabase, Auth, repositórios, logs
  lib/                 # utilidades compartilhadas
supabase/migrations/   # migrações versionadas, RLS e policies
tests/                 # domínio, API e isolamento por organização
```
Adapte à estrutura real se o repositório já existir, explicando o motivo.

## Critérios de aceite desta primeira rodada
- Uma pessoa consegue cadastrar a organização e criar seu primeiro desafio.
- A experiência começa pelo problema e não por uma ferramenta ou dashboard vazio.
- A estrutura inicial é editável e distingue declaração original de interpretação.
- Há persistência e recuperação de dados após refresh/login.
- Uma segunda organização não consegue ler nem editar o desafio da primeira.
- Há testes automatizados relevantes, e os comandos executados estão documentados.
- Um README explica como rodar o projeto sem pressupor experiência em programação.

## Importante para o modo de trabalho
Sou a dona do produto e estou construindo sozinha com sua orientação. Dê **um passo de configuração por vez**, explique onde clicar ou qual comando executar e como confirmar que deu certo. Não faça escolhas de produto importantes silenciosamente; registre pressupostos no README. Não confunda código compilando com fluxo validado. Após entregar Corte 1 e 2, proponha o próximo prompt para Corte 3, mas não o implemente sem uma instrução explícita.
