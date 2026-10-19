# Product Backlog

Status possíveis: **Aprovado, não iniciado** · **Em andamento** · **Implementado (não testado)** · **Implementado e testado** · **Validado com usuários** · **Planejado (não autorizado)** · **Fora de escopo**.

Cada item indica o elo da cadeia de valor em que atua: **Identificar** um desafio → **Investigar** a realidade → **Compreender** as pessoas → **Transformar** o serviço → **Avaliar** os resultados. Itens de fundação são marcados como **Base**.

Referência dos cortes: seção 18 de [`CHALLENGE_METHODOLOGY.md`](CHALLENGE_METHODOLOGY.md). Escopo aprovado: [`../engineering/FIRST_INCREMENT_PROMPT.md`](../engineering/FIRST_INCREMENT_PROMPT.md).

**Atualizado em:** 19/10/2026.

---

## Incremento atual (aprovado): Corte 1 + Corte 2

Onde mora e qual banco: decididos (D-005 e D-006 do [Decision Log](../decisions/DECISION_LOG.md)). Aguardando aprovação do plano do Corte 1.

### Corte 1 · Fundação SaaS · Base · Aprovado, não iniciado

| ID | Item | Critério de aceite |
|---|---|---|
| C1-01 | Cadastro e login de pessoas | Uma pessoa cria conta, entra e sai |
| C1-02 | Organizações e membros (`organizations`, `organization_members`) com papéis iniciais | A pessoa cria ou seleciona uma organização |
| C1-03 | RLS em todas as tabelas organizacionais | Uma segunda organização não lê nem edita dados da primeira, inclusive via API e banco (AC-07) |
| C1-04 | Trilha de auditoria mínima (`audit_events`) | Criação e edição de desafio geram evento |
| C1-05 | Testes automatizados de isolamento entre duas organizações | Testes executados e resultado registrado no Implementation Log |
| C1-06 | README para rodar o projeto sem experiência em programação | Passo a passo testado |

### Corte 2 · Entrada do desafio · Identificar · Aprovado, não iniciado

| ID | Item | Critério de aceite |
|---|---|---|
| C2-01 | Tela inicial "O que você quer melhorar?" (a experiência começa pelo problema, não por um painel vazio) | Primeira tela após criar a organização |
| C2-02 | `challenges` salva `original_statement` literalmente e nunca o sobrescreve | Teste automatizado |
| C2-03 | Proposta de estrutura (título, pessoas afetadas, contexto, resultado desejado) editável, separada do texto original | A pessoa confirma ou edita; o original continua intacto |
| C2-04 | Histórico de versões (`challenge_versions`) | Cada confirmação ou edição gera versão com autor e motivo |
| C2-05 | Ver o desafio criado e a próxima pergunta contextual (regra determinística nesta fase) | Linguagem simples, sem termos de metodologia |
| C2-06 | "Não sei" como resposta válida, com alternativas práticas (encontrar, produzir, pedir ajuda, marcar pendente) | AC-02 |
| C2-07 | Aviso visível para não inserir dados identificáveis ou clínicos | Visível na entrada do desafio |
| C2-08 | Persistência após atualizar a página e após novo login | AC-12 |
| C2-09 | Validação de campos do Challenge Model com biblioteca de schemas | Testes automatizados |
| C2-10 | Interfaces tipadas preparadas para o próximo módulo (Methodology Engine) | Tipos existem; nada do Corte 3 implementado |

---

## Próximos cortes (planejados, não autorizados)

| Corte | Item | Elo | Status |
|---|---|---|---|
| 3 | Motor de condução: perguntas, protocolos em JSON, `next_best_action`, "não sei" completo | Investigar | Planejado (não autorizado) |
| 4 | Registro e síntese: atividades, evidências, cobertura, tela "O que sabemos / O que falta saber" | Investigar · Compreender | Planejado (não autorizado) |
| 5 | Integração de inteligência: busca em protocolos curados, prompts versionados, saída validada e logs | Compreender | Planejado (não autorizado) |
| 6 | Oferta especializada: regras, cartões, consentimento e notificação ao estúdio | Transformar | Planejado (não autorizado) |
| 7 | Teste de ponta a ponta: clínica, hotel e experiência do colaborador, sem regras fixas por setor | Avaliar | Planejado (não autorizado) |

Horizontes seguintes (H1 a H3) estão na seção 7 da visão e não foram detalhados em itens de backlog.

---

## Fora de escopo do primeiro incremento

Conforme a seção 14 de `CHALLENGE_METHODOLOGY.md` e o `CLAUDE.md`:

- Cobrança e assinaturas.
- RAG real ou simulado (nada de "RAG" feito com textos soltos ou prompts).
- Diagnóstico avançado e ciclo de transformação completo.
- Desenhos visuais complexos (mapas, canvases).
- Integração com sistemas clínicos ou coleta de dados pessoais de pacientes.
- Agente autônomo que executa ações externas.
- Métricas preditivas.
