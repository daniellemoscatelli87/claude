# RAG_ARCHITECTURE.md × decisões recentes

Comparação feita em 20/10/2026 entre [`RAG_ARCHITECTURE.md`](RAG_ARCHITECTURE.md) (Kit v4, 19/10/2026, incorporado sem alteração) e as decisões D-011 a D-023. **Onde houver conflito, valem as decisões mais recentes.** Nenhuma divergência abaixo muda decisão aprovada.

| # | O documento diz | Decisão ou estado atual | Como fica |
|---|---|---|---|
| 1 | Incremento A (Cortes 1 e 2): criar `docs/knowledge/`, schema de protocolos e tipos `KnowledgeProvider`/`KnowledgeCitation` | Não foi feito nos Cortes 1 e 2 | Entra no UX-3a: pasta criada; schema e tipos no código, **sem RAG simulado** |
| 2 | O Methodology Engine seleciona o protocolo; a IA adapta a linguagem | D-020/D-021: a IA propõe o plano e escolhe protocolos | Compatível: o Engine primeiro filtra os protocolos aplicáveis por regras (`listApplicableProtocols`), a IA escolhe só entre eles e justifica, e o Engine valida |
| 3 | Experience Guide entrega uma próxima ação por vez | D-021: plano inicial com fila curta de atividades, revisto nos marcos | Compatível: a fila é interna e a interface mostra uma atividade por vez |
| 4 | Tabela `method_protocols`, status `draft/reviewed/approved/retired`, campos do item 4 | Proposta usava `methodology_protocols` com 2 status | Adotar o nome e o schema do documento (mais completos) |
| 5 | Material `draft` não pode aparecer como protocolo normativo em produção | Os 6 protocolos ainda não foram escritos nem aprovados | Nos testes, protocolos `draft` só com uma chave de teste ligada; produção exige `approved` pela dona do produto |
| 6 | Não fixar provedor de embeddings ou LLM | D-019 | Compatível |
| 7 | RAG real só com corpus persistido, curado e com citação | D-020/D-021: até o RAG existir, a IA não afirma ter consultado fontes | Compatível; `knowledge_citations` fica vazio e a interface não fala em fontes |
| 8 | Consultoria em motor separado, sem upsell automático | Visão e CLAUDE.md | Compatível; fora do UX-3a |
| 9 | Evidências em domínio estruturado próprio, não no corpus | Proposta UX-3a (`evidences`) | Compatível |

## Arquivos citados pelo documento e ausentes no repositório

- ~~`05-corpus-inicial-protocolos-v0.1.json`~~: **recebido em 21/10/2026** e incorporado em [`protocols/`](protocols/05-corpus-inicial-protocolos-v0.1.json); compatibilidade em [`PROTOCOLS_COMPATIBILITY.md`](PROTOCOLS_COMPATIBILITY.md);
- `docs/knowledge/SOURCE_CATALOG.json` (origem: `catalogo_fontes_rag_especialista.json`, 89 fontes candidatas);
- `docs/knowledge/RAG_SOURCE_PLAN.md` (origem: `plano_construcao_rag_especialista.md`);
- `docs/knowledge/RAG_INTEGRATION_NOTES.md`.

Os outros três seguem ausentes e não bloqueiam o UX-3a.
