# Corpus inicial de protocolos × Knowledge Engine e Methodology Engine

**Data:** 21/10/2026 · **Arquivo:** [`protocols/05-corpus-inicial-protocolos-v0.1.json`](protocols/05-corpus-inicial-protocolos-v0.1.json), incorporado **sem alteração** (`cmp` idêntico ao enviado pela dona do produto).

**Status do conteúdo:** **rascunho** (`status: draft`, versão 0.1.0, `reviewed_by: null`). Não é metodologia definitiva nem está aprovado para produção. Os protocolos serão aprofundados com as fontes especializadas do RAG e a validação da dona do produto como especialista. Nada aqui foi recriado: esta é só a verificação de compatibilidade.

## 1. Conformidade com o esquema do Knowledge Engine

Esquema: `RAG_ARCHITECTURE.md`, seção 4. Verificação automática feita em 21/10/2026.

| Item | Resultado |
|---|---|
| JSON válido | Sim; 6 protocolos; `metadata` 0.1.0 `draft` |
| Os 19 campos obrigatórios do esquema | Presentes nos 6 protocolos |
| Campos a mais | `user_facing_title` nos 6 (título em linguagem simples; útil para o Experience Guide; não conflita) |
| `status` | `draft` nos 6: pelo esquema, **não pode** servir de fonte normativa em produção |
| `source_ids` | Vazios nos 6, como o próprio arquivo avisa (aguardam revisão editorial) |
| `questions` | **Vazias nos 6** |
| `applicable_contexts` | Só `generic_service_experience` (sem pacotes por setor, o que é esperado nesta fase) |
| `risk_and_privacy` | O mesmo texto genérico nos 6 |

## 2. Correspondência com o Methodology Engine

A metodologia (`CHALLENGE_METHODOLOGY.md`, seção 7) nomeia os protocolos com sufixo de versão no id (ex.: `guided_conversation_v1`, versão 1.0.0). O corpus usa id sem sufixo + campo `version` (ex.: `guided_conversation` 0.1.0), como o esquema do RAG. **Adotar o formato do corpus** (id estável + versão separada), que permite várias versões do mesmo protocolo.

| Metodologia (seção 7) | Corpus | Título para a pessoa (corpus) |
|---|---|---|
| `clarify_challenge_v1` | `clarify_challenge` | Entender o que você quer melhorar |
| `review_existing_signals_v1` | `review_existing_signals` | Olhar o que a organização já sabe |
| `guided_conversation_v1` | `guided_conversation` | Conversar com quem vive a experiência |
| `observation_light_v1` | `observation_light` | Observar como acontece na prática |
| `service_flow_walkthrough_v1` | `service_flow_walkthrough` | Entender como o atendimento funciona por trás |
| `small_change_test_v1` | `small_change_test` | Testar uma melhoria pequena e segura |

Os campos da estrutura YAML da metodologia correspondem aos do corpus assim:

| YAML da metodologia | Corpus | Observação |
|---|---|---|
| `applies_when` | `intent_tags` | Compatível |
| `avoid_when` | `do_not_apply_when` | Compatível |
| `required_permissions` | `prerequisites` (`permissions_checked`) | Compatível |
| `user_steps` | `steps_for_user` | Compatível (já em linguagem simples) |
| `outputs` | `expected_outputs` | Compatível |
| `quality_checks` | `quality_checks` | Compatível |
| `failure_recovery` | `if_user_cannot_do_it` | Compatível |
| `inputs` | — | **Ausente** no corpus |

## 3. O que o Methodology Engine (D-021, D-024) precisa e o corpus ainda não tem

Lacunas a resolver **na curadoria**, com a dona do produto. Não foram preenchidas pelo Claude.

| # | Necessidade (decisões) | Situação no corpus | Efeito se usado como está |
|---|---|---|---|
| L1 | Instrumentos prontos e contextualizados (roteiro, ficha de observação, levantamento de dados, reconstrução de fluxo) (D-021, D-024) | Não há campo de tipo de instrumento nem modelo; `questions` vazias | A IA teria de criar o instrumento inteiro só a partir de `purpose`, `steps_for_user` e `quality_checks`. Funciona como teste, mas sem base metodológica revisada para as perguntas |
| L2 | Critérios de suficiência por método, contexto, diversidade de perspectivas e risco (D-021, D-024) | Ausentes | O Engine não teria regra do estúdio para dizer "ainda não é suficiente"; precisaria de critérios provisórios marcados como tal |
| L3 | Tipo de evidência produzida (relato, observação, registro, medição) para a validação de evidências (D-021) | Ausente (só `expected_outputs` em texto livre) | A classificação dependeria de uma correspondência provisória (abaixo) |
| L4 | Em que fase o protocolo pode ser oferecido | Ausente | `small_change_test` é de experimentação (fase `experiment`) e **não** deveria ser oferecido no discovery inicial; sem o campo, só uma regra do Engine impede |
| L5 | Vocabulário controlado das etiquetas (`intent_tags`, `prerequisites`, `do_not_apply_when`) e como o Engine decide cada uma (ex.: quando `risk_screened` está satisfeito) | Etiquetas existem, sem definição | O Engine precisaria de definições provisórias |
| L6 | Entradas do protocolo (`inputs` da metodologia) | Ausentes | A IA usaria o contexto inteiro do desafio |
| L7 | Linguagem sem jargão na interface (kit de UX) | `observation_light`, em `if_user_cannot_do_it`: "peça um **walkthrough**" | O texto chegaria à pessoa com jargão; precisa de revisão (ex.: "peça a um profissional autorizado que mostre o passo a passo") |
| L8 | Cuidados específicos por protocolo | `risk_and_privacy` igual nos 6 | Cuidados específicos (ex.: participação voluntária em conversas, observação não oculta) aparecem só em `quality_checks` |

Correspondência **provisória** de tipo de evidência (L3), só para os testes e a confirmar pela dona do produto:
- `clarify_challenge` → declaração de quem relata;
- `review_existing_signals` → registro ou medição;
- `guided_conversation` → relato;
- `observation_light` → observação;
- `service_flow_walkthrough` → relato da equipe e registro do fluxo;
- `small_change_test` → medição e observação.

## 4. Arquitetura extensível (preservada)

- **Protocolo = id estável + versão + status** (`draft`, `reviewed`, `approved`, `retired`). Novas versões convivem com as antigas, e só `approved` vale em produção (RAG_ARCHITECTURE, seção 6).
- **Novas disciplinas:** o esquema já aceita qualquer método (Service Design, UX Research, CX, Business Design, operações, setoriais), porque a seleção é feita por etiquetas (`intent_tags`, `applicable_contexts`, `do_not_apply_when`), não por uma lista fixa no código. Para organizar a biblioteca maior, propõe-se acrescentar no futuro, como campos **opcionais**:
  - `disciplines` (ex.: `service_design`, `ux_research`, `cx`, `business_design`, `operations`);
  - `phases` (L4);
  - `instrument_type` (L1);
  - `evidence_kinds` (L3);
  - `sufficiency_criteria` (L2).

  Isso só entra com aprovação, numa versão nova do esquema.
- **Pacotes por setor** (camada C do RAG) entram como `applicable_contexts` próprios, sem mudar os protocolos transversais.
- **A IA não inventa procedimentos:** só aplica protocolos presentes no catálogo e no status permitido. Nos testes com dados fictícios, `draft` só com a chave de teste (RAG_DIVERGENCES, item 5).

## 5. Como o corpus pode ser usado agora (proposta, aguarda aprovação)

Para os testes do UX-3a com dados fictícios, usar o corpus **exatamente como está**:
- carregado como catálogo `draft`;
- a IA só escolhe entre esses 6 e justifica;
- os instrumentos são gerados pela IA dentro de `steps_for_user` e `quality_checks`, marcados como "rascunho para avaliação";
- as lacunas L1 a L8 aparecem no relatório de qualidade que a dona do produto vai avaliar (D-024).

Nenhuma lacuna é preenchida pelo Claude sem aprovação.
