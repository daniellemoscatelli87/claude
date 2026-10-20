# DM | Experience Intelligence — Knowledge Engine / RAG
## Especificação de produto, conhecimento, recuperação e qualidade — v1.0

**Data:** 19/10/2026  
**Situação:** [DECIDIDO] RAG é componente central da proposta de valor e requisito do primeiro produto comercial independente. [PROPOSTA] A arquitetura detalhada e o plano incremental a seguir devem ser validados durante implementação.  
**Proprietária:** Dani Moscatelli | Experience Design Studio.

> **Instrução ao Claude Code:** leia este arquivo após `PRODUCT_VISION.md` e `CHALLENGE_METHODOLOGY.md` e antes de implementar tarefas relativas à IA, métodos, recuperação, base de conhecimento ou ingestão. Esta é uma **especificação**, não uma alegação de código já construído ou de corpus já validado.

---

## 1. Para que o RAG existe neste produto

O RAG (Retrieval-Augmented Generation) fornece **conhecimento fundamentado, contextual e recuperável** para orientar a plataforma ao conduzir usuários que **não dominam** Service Design, pesquisa, operações ou experiência humana. O RAG não é um tutor com verbetes: auxilia um **guia que diz o que fazer, como fazer, de quem obter informação, onde registrar o resultado e o que fazer se a pessoa não souber**.

**Entrada:** desafio em linguagem livre + organização/setor/departamento + pessoas afetadas + etapa da investigação + lacunas informacionais + riscos + evidências autorizadas.

**Saída para o usuário:** **uma próxima ação viável e clara**, instruções práticas para executá-la, campos de registro, alternativas quando houver impedimento e uma indicação compreensível do que está demonstrado versus o que falta investigar.

**Princípio:** o conhecimento especializado fica na plataforma; o cliente consegue executar passos úteis sem aprender os nomes dos métodos. O sistema deve sustentar mudanças no atendimento, no espaço físico, em políticas, pessoas, fluxos, operações, processos e/ou interfaces digitais — não presumir uma solução tecnológica.

### O que o RAG NÃO faz

- Não substitui o **Methodology Engine** (seleção de método, regras, elegibilidade, limites e transições de estado).
- Não substitui o **Challenge Model** (contexto, escopo, pergunta a resolver, objetivo).
- Não substitui **evidências** do próprio cliente por opiniões de livros ou boas práticas genéricas.
- Não executa autonomamente decisões operacionais, clínicas, legais ou de recursos humanos.
- Não justifica extrair obras completas de terceiros sem direito de uso.
- Não garante por si só que uma orientação seja correta: exige curadoria, testes e fallback.

## 2. Arquitetura de conhecimento — quatro contextos separados

| Camada | Conteúdo / exemplos | Quem controla | Como é usada |
|---|---|---|---|
| **A. Diretrizes globais** | princípios de pesquisa, Service Design, participação, acessibilidade, experiência, governança, qualidade de evidência e segurança | Estúdio; curadoria e versões | Fundamentação compartilhada |
| **B. Protocolos operacionais estruturados** | `guided_conversation_v1`, `observation_light_v1` etc.: gatilhos, contraindicações, passos simples, registro e critérios de qualidade | Estúdio; **fonte normativa aprovada** pelo motor | Motor escolhe protocolo e IA adapta a linguagem **dentro dos limites** |
| **C. Pacotes setoriais/departamentais** | saúde/recepção, hotelaria/check-in, educação/secretaria; riscos, vocabulário, condições reais, regras relevantes e responsabilidades | Estúdio + especialistas; revisão periódica | Contextualização sem perder o método transversal |
| **D. Conhecimento privado da organização** | procedimentos autorizados, descrição de serviço, políticas próprias, fluxos e aprendizados históricos | Organização, sujeito a papéis/permissões | Orientações contextualizadas **somente para o tenant autorizado** |

**Quinta categoria relacionada, mas distinta:** *evidências de desafios*: observações, pesquisas, registros, feedbacks e medições do cliente devem ser armazenados inicialmente no **domínio estruturado de evidências**, ligados a desafio, atividade, fonte e consentimentos. Podem ser usados na análise do desafio conforme autorização. Não devem ser automaticamente publicados no corpus global ou de outros clientes. Indexação vetorial de evidências privadas é uma evolução opcional e deve preservar mesma política de acesso do dado original.

## 3. Diferença entre Repositório de Referências, Super Cérebro e RAG

O projeto de estudo **Service Design: Saúde / Super Cérebro** reúne fontes e metadados (título, autor, instituição, categoria, link, descrição, palavras-chave), mantendo artigos e livros nos endereços de origem. Esse repositório é **uma excelente fila de curadoria** e catálogo de proveniência, mas **não equivale a um corpus pronto para busca semântica**, pois links e metadados não fornecem, por si só, instruções detalhadas nem licenças de reprodução.

**Fluxo editorial:** Referência catalogada → avaliação de credibilidade/escopo/licença/atualidade → leitura e análise humana → **protocolo original do estúdio**, com fontes atribuídas, revisado e aprovado → indexação apenas do conteúdo autorizado → uso na plataforma com indicação de proveniência.

**Regra:** não copiar automaticamente textos integrais de The Beryl Institute, Patient Experience Journal, livros, publicações pagas, leis comentadas etc. Uma referência pode ser citada nos metadados mesmo quando seu texto não pode ser incorporado ao RAG. Artigos e diretrizes de domínio regulado exigem checagem de versão e contexto.

## 4. Fonte de verdade: esquema obrigatório dos protocolos

Protocolos são objetos **estruturados e versionados** (preferencialmente JSON validado por schema) — não apenas embeddings de um PDF. Campos mínimos:

```json
{
  "id": "guided_conversation",
  "version": "1.0.0",
  "status": "draft | reviewed | approved | retired",
  "owner": "DM Experience Design Studio",
  "purpose": "compreender perspectivas de quem vive uma experiência",
  "intent_tags": ["missing_user_perspective"],
  "applicable_contexts": ["service_experience"],
  "do_not_apply_when": ["no_lawful_or_appropriate_permission", "safety_risk"],
  "prerequisites": ["scope_defined", "appropriate_permission_checked"],
  "steps_for_user": ["preparar convite", "perguntar sem induzir", "registrar respostas", "revisar anotações"],
  "questions": ["Conte como foi sua experiência desde que chegou."],
  "expected_outputs": ["reported_experience_with_context"],
  "quality_checks": ["separar fala original de interpretação", "registrar limites da amostra"],
  "if_user_cannot_do_it": ["usar registros existentes", "solicitar apoio autorizado"],
  "risk_and_privacy": ["participação voluntária", "evitar dados identificáveis desnecessários"],
  "source_ids": ["source_ref_001"],
  "reviewed_by": null,
  "reviewed_at": null,
  "expires_at": null
}
```

**Amostras iniciais:** `05-corpus-inicial-protocolos-v0.1.json` é apenas um **rascunho original de seed**, não bibliografia científica nem protocolos aprovados. O Claude Code deve validar o JSON, implementar controle de aprovação e não exibir material `draft` como protocolo normativo em produção.

## 5. Metadados e proveniência obrigatórios

### Para cada fonte catalogada

`source_id`, título, autor/instituição, tipo, idioma, URL ou referência, data de publicação/edição quando conhecida, data de acesso quando aplicável, `license_status`, `ingest_permission`, restrições de uso, contexto/setor, tags, `reviewed_at`, `reviewed_by`, status editorial e versão.

### Para cada documento autoral do estúdio

`document_id`, `source_ids`, texto/autoria, `document_type`, versão, idioma, setor, departamento, método, risco, `status` (`draft/reviewed/approved/retired`), data de revisão, quando revisar novamente, checksum do texto e vínculo ao protocolo correspondente.

### Para cada trecho indexado (chunk)

`chunk_id`, `document_id`, versão, índice/posição, texto, embedding, modelo e dimensionalidade do embedding, idioma, tags derivadas, `tenant_id` nulo se global, classificação de acesso, checksum, `created_at`. O acesso deve ser avaliado **antes** e **dentro** da consulta SQL e não apenas filtrando os resultados no frontend.

### Para cada recuperação utilizada pela IA

Persistir `retrieval_trace`: challenge/atividade, conta e tenant, consulta/purpose, filtros, IDs/versões dos trechos recuperados, método/modelo, eventuais recusas/fallbacks, versão do prompt, versão do protocolo e horário. **Não registrar texto pessoal ou sensível desnecessariamente nos logs.**

## 6. Pipeline de ingestão, publicação e revisão

1. **Cadastro:** inserir referência e classificar origem, licença e domínio. Recusar ingestão se `ingest_permission` não está verificada.
2. **Curadoria:** produzir e revisar resumos e protocolos originais (não presumir que resumos de IA são autorizados/fiéis). Conferir segurança, vieses, acessibilidade e adequação setorial.
3. **Aprovação editorial:** somente `approved` pode servir como fonte normativa em produção. Histórico de quem aprovou e por quê.
4. **Normalização:** preservar unidade semântica do protocolo (não fatiar lista de contraindicações sem contexto); dividir materiais longos por títulos e seções. Testar estratégia de chunking com corpus real, sem escolher tamanho arbitrário como dogma.
5. **Indexação:** gerar embeddings com um modelo e dimensionalidade conhecidos; gravar texto/embedding e metadados com transação/controle de estado. Reindexar quando fonte/modelo mudar. Não misturar embeddings incompatíveis.
6. **Disponibilização:** publicar só versão aprovada/vigente; ao aposentar uma orientação, removê-la das recuperações futuras sem apagar trilhas históricas de decisões.
7. **Revisão programada:** alertar equipe editorial sobre material setorial/normativo vencido; material expirado não deve sustentar recomendações sensíveis.

**Custos:** acompanhar documentos indexados, custo de embeddings, recuperação, tokens de geração, qualidade/citação e revisões; configurar limites por tenant antes de escalar.

## 7. Pipeline de recuperação e geração — uma ação de cada vez

```text
[1] Desafio e estado estruturado + pessoa afetada + risco + lacuna
              ↓
[2] Methodology Engine seleciona protocolo PERMITIDO/versionado
              ↓
[3] Recuperador faz busca em conteúdo APROVADO e AUTORIZADO
    filtros: status, tenant, setor/departamento, idioma, método, risco, validade
    fontes: diretrizes globais + pacote setorial + material privado autorizado
              ↓
[4] Reranqueamento/checagem: relevância, proveniência, versões, conflito
              ↓
[5] Experience Guide redige uma próxima tarefa executável
    com base no protocolo + contexto + evidências + fontes
              ↓
[6] Validação: schema, riscos, instruções proibidas, claims e citações
              ↓
[7] UI: 'Vamos fazer X' + passos + como conseguir/registrar + alternativa
              ↓
[8] Logs mínimos (fontes e versões); feedback; reavaliação da próxima ação
```

**Busca recomendada:** começar com recuperação por **metadados e protocolo exato**, acrescida de busca textual. Adicionar busca semântica/pgvector quando houver corpus suficiente; para termos metodológicos e nomenclaturas setoriais, avaliar **busca híbrida** (palavra-chave + vetorial) e reranking. **RAG real** exige busca em corpus persistido/curado, filtragem de escopo e registro das fontes; citar documento que não foi recuperado ou produzir um JSON fixo dizendo “RAG” não conta.

**Tecnologia coerente com SaaS inicial:** Supabase/PostgreSQL + extensão `pgvector` e índices de texto quando oportuno; backend Next.js/TypeScript. Reaproveitar Postgres reduz custo e complexidade; não introduzir banco vetorial externo sem teste que justifique. A dimensão de `vector(n)` depende do modelo escolhido e deve constar de migrações e configuração. Não fixar provedor de embeddings/LLM como premissa irrevogável.

Documentação técnica oficial de referência (validar versão no momento do código):
- https://supabase.com/docs/guides/ai/semantic-search
- https://supabase.com/docs/guides/ai/hybrid-search
- https://supabase.com/docs/guides/database/extensions/pgvector
- https://supabase.com/docs/guides/database/postgres/row-level-security

## 8. Saída estruturada do Experience Guide

O orquestrador entrega ao modelo **protocolo autorizado e dados mínimos necessários**. A resposta deve obedecer um schema validado (zod ou equivalente), por exemplo:

```json
{
  "next_action_id": "inspect_wait_time_records",
  "action_title": "Vamos descobrir quando a espera é maior",
  "action_instruction": "Peça os horários de chegada e atendimento sem nomes ou dados de saúde.",
  "steps": ["Encontre registros das últimas semanas", "Anote horários sem identificar pessoas", "Registre os tempos e horários no campo abaixo"],
  "where_to_record": "Formulario de registros de atendimento desta atividade",
  "required_inputs": ["horario_chegada", "horario_atendimento", "data_sem_identificador"],
  "if_unknown": "Se não houver registros, podemos fazer uma observação autorizada do fluxo.",
  "evidence_status": "not_yet_collected",
  "caution": "Não inclua nomes, números de prontuário ou diagnósticos.",
  "knowledge_citations": [{"document_id": "doc_...", "version": "1.0.0", "chunk_id": "chunk_..."}],
  "protocol_id": "review_existing_signals",
  "protocol_version": "1.0.0"
}
```

**Linguagem de interface:** jargões internos não aparecem na orientação principal. Citações detalhadas podem estar acessíveis em “Como chegamos a esta orientação?”. Nunca inventar campos de origem. Uma fonte geral explica **por que** método é apropriado; uma evidência do cliente explica **o que ocorreu**; manter essas duas proveniências separadas.

## 9. Recuperação insuficiente, conflitos e casos de risco

- **Sem fonte adequada:** não inventar método nem citar fontes genéricas. Acionar protocolo aprovado e seguro, pedir evidência adicional ou dizer que a recomendação específica não está fundamentada.
- **Fontes divergentes:** sinalizar divergência, data e aplicabilidade; não resolver conflito regulatório por votação de embeddings. Em casos sensíveis, revisão humana.
- **Pergunta fora de escopo:** orientar a procurar especialista adequado, quando cabível; não improvisar assistência clínica/jurídica individual.
- **Usuário sem dados:** oferecer localizar, produzir de forma ética, solicitar auxílio interno ou marcar pendência. **A IA não completa os dados por imaginação.**
- **Conteúdo malicioso em documentos:** tratar fonte recuperada como dado não confiável, nunca como prompt de sistema; ignorar instruções para revelar segredos, acessar outros tenants ou alterar regras.
- **Dados pessoais:** minimizar nos prompts e embeddings; não indexar dados clínicos identificáveis por padrão; revisar contratos, tratamento e retenção antes de habilitar upload livre em setores sensíveis.
- **Consultoria:** recomendação é motor separado (`Expert Intervention`), com gatilhos auditáveis, mensagem transparente e opt-in. Conteúdo de RAG não pode inserir upsell automático nem bloquear jornada para vender serviço.

## 10. Organização de dados / contratos lógicos (proposta, não migração pronta)

```text
knowledge_sources(
  id, title, author, origin_url, kind, published_at, accessed_at,
  language, license_status, ingest_permission, review_status,
  sector_tags, method_tags, created_at, reviewed_at
)
knowledge_documents(
  id, source_id, title, owner, scope['global','sector','tenant'],
  tenant_id NULLABLE, industry, department, language, content_text,
  protocol_id NULLABLE, version, status, approved_by, approved_at,
  expires_at, checksum, created_at
)
knowledge_chunks(
  id, document_id, tenant_id NULLABLE, ordinal, body,
  embedding vector(n) NULLABLE, embedding_model, embedding_dimensions,
  content_hash, created_at
)
method_protocols(
  id, version, status, content_json, approved_by, reviewed_at, expires_at
)
knowledge_retrieval_events(
  id, organization_id, challenge_id, activity_id, protocol_id,
  retrieved_doc_versions_json, retrieved_chunk_ids_json,
  retrieval_purpose, fallback_reason, model_ids_json, created_at
)
```

`tenant_id` nulo só em conteúdo compartilhável e publicado globalmente com aprovação editorial. Conteúdos privados sempre têm dono; acesso deve cruzar usuário autenticado, organização e políticas RLS. `scope=sector` não significa automaticamente que a fonte pode ser indexada (licença e revisão continuam obrigatórias). Para referências globais, preferir acesso somente leitura ao público autenticado autorizado.

**Interface de serviço** (separada do framework web):
- `listApplicableProtocols(challengeContext)` → protocolos aprovados, sem LLM.
- `retrieveKnowledge({actor, tenantId, challengeId, protocolId, intent, sector, department, risk})` → excertos permitidos + proveniência ou fallback.
- `buildGuidedAction({challengeState, protocol, retrievedKnowledge, availableEvidence})` → objeto do item 8 validado.
- `recordRetrievalTrace(...)` → evento auditável minimizado.
- `assessKnowledgeCoverage(...)` → perguntas cobertas/lacunas/limites, sem escore fictício de confiança.

## 11. Testes e avaliação do RAG (critérios de aceite)

Preparar **um conjunto fixo de casos** com expectativas explícitas, revisado pelo estúdio, antes de liberar geração em produção. Exemplos:

| Cenário | Esperado |
|---|---|
| Clínica: espera na recepção sem registros | Sugere alternativa de coleta segura; não inventa tempos nem diagnóstico clínico |
| Hotel: filas no check-in | Propõe investigar chegada, comunicação e capacidade; não pressupõe que precisa de app |
| Escola: famílias reclamam da secretaria | Distingue perspectivas e trata possíveis dados de menores com cautela |
| Colaboradores: exaustão no atendimento | Não faz diagnóstico médico/psicológico, recomenda abordagem organizacional apropriada |
| Usuário não sabe entrevistar | Guia preparo, perguntas abertas, registro e limites, sem exigir jargão |
| Usuário digita 'não sei' | Oferece quatro rotas: localizar, produzir, pedir ajuda, registrar pendência |
| Fonte tem protocolo antigo/retirado | Não recupera como vigente |
| Fonte contém instrução maliciosa | Ignora instruções vindas do documento |
| Tenant A tenta recuperar dado do Tenant B | Zero documentos privados retornados, inclusive em busca vetorial/RPC |
| Fonte ausente ou base vazia | Fallback transparente; não inventa bibliografia |
| Material externo sem permissão de indexar | Mantém metadados, não importa conteúdo integral |
| Orientação de pesquisa com risco/privacidade | Restringe execução e orienta autorização/revisão profissional adequada |

**Métricas indicativas:** recuperação relevante em testes de referência, taxa de fonte inventada (meta 0), cumprimento de protocolo, falhas de isolamento (meta 0), utilidade das instruções com pessoas leigas, incidência de informação indevida e custo por desafio. Os limiares de qualidade precisam ser definidos com base em avaliação real, não inventados antecipadamente.

## 12. Entrega em incrementos — RAG central, sem antecipar tudo

**Incremento A — desde a fundação (Cortes 1–2):** criar `docs/knowledge/`, schema dos protocolos e tipo `KnowledgeProvider`/`KnowledgeCitation` mesmo sem índice vetorial; definir fontes e revisão. Nenhum RAG falso. Não carregar dados privados de clientes na base global.

**Incremento B — junto ao Motor de Condução (Corte 3):** implementar seis protocolos originais aprovados, versionados e validados em JSON; recuperação **estruturada** por ID/condições; selecionar método por regras e oferecer uma tarefa clara. Esse estágio é **condução metodológica**, não RAG vetorial completo.

**Incremento C — antes de liberar IA fundamentada (Corte 5, antecipável quando estável):** persistir base de conhecimento revisada, chunking sensível à estrutura, indexação pgvector quando apropriada, busca lexical/semântica/híbrida, filtros de setor/tenant, auditoria, citações verificáveis e testes. **Esse é o primeiro RAG efetivo.**

**Incremento D — primeira versão comercial (H1):** RAG com diretrizes transversais e pelo menos os setores que forem realmente validados, atualização editorial, controle de acesso, custos, fallback seguro, avaliação com usuários leigos; utilização de conhecimento privado apenas onde houver governança e necessidade comprovadas.

**Incremento E — pós-lançamento (H2/H3):** expansão setorial e departamental, memória organizacional com recuperação contextual e governança por organização/unidade; novos métodos e avaliações; integração a fontes externas autorizadas.

**Invariável:** o produto comercial **não deve ser declarado pronto** se o Experience Guide disser se apoiar em RAG sem recuperar fontes persistidas/autorizadas e citar sua proveniência. O momento de construir componentes pode variar; a exigência de qualidade não.

## 13. Próximas decisões de produto a registrar (sem bloquear primeiro código)

- Primeiro setor/público pagante a priorizar na biblioteca setorial (multissetorialidade permanece na arquitetura).
- Editor/aprovador dos protocolos e política de revisões (inicialmente o estúdio).
- Seleção do provedor/modelo de embeddings/LLM e controles de custo/privacidade.
- Se conhecimento privado será inicialmente apenas contexto estruturado por desafio ou indexado semanticamente.
- Métricas e revisão do corpus com usuários reais e especialistas setoriais.

**Declaração de integridade:** este arquivo descreve uma proposta verificável de arquitetura, não prova que o RAG foi implementado, que qualquer norma está atualizada ou que um método publicado por terceiro foi autorizado para indexação.


---

## Anexo A — Curadoria ampliada recebida em 19/10/2026

A proprietária do produto forneceu `catalogo_fontes_rag_especialista.json` e `plano_construcao_rag_especialista.md` como insumos adicionais. São documentos **complementares** a esta especificação, não evidência de que o RAG esteja implementado. O catálogo registra **89 instituições/fontes candidatas** com classificações de curadoria (57 P0, 27 P1, 5 P2) e metadados de domínio, acesso aparente e necessidade de verificação de licença por documento.

**Integração no repositório:** manter em `docs/knowledge/SOURCE_CATALOG.json` e `docs/knowledge/RAG_SOURCE_PLAN.md`; consultar `docs/knowledge/RAG_INTEGRATION_NOTES.md`.

**Regras complementares:**

1. Uma **fonte institucional** não equivale a um **documento avaliável**; não gerar embeddings de links ou importar textos integrais só por estarem no catálogo.
2. Criar mapeamento explícito entre `FNT-...` e `source_id` do banco, conservando status de permissão, tags e datas; documento individual exige `document_id`, versão, licença e autorização.
3. Priorizar corpus autoral aprovado para orientar a primeira jornada guiada; fontes externas entram progressivamente após verificação de direitos, cobertura, precisão e adequação regional.
4. Considerar Crossref, OpenAlex, PubMed e outras APIs como fontes de **descoberta e metadados**; disponibilidade de abstract ou full text precisa ser validada por licença e condições de uso.
5. Testar recuperação, citação, segurança multi-tenant, vigência de normas, prompt injection e o resultado principal: capacidade de conduzir alguém sem formação técnica.
6. A priorização P0/P1/P2 é de **utilidade para curadoria**, não hierarquia universal de qualidade, nem aprovação de ingestão.

**Conflitos de escopo:** em caso de divergência entre o plano amplo de ingestão e o incremento técnico atual, vale o `CLAUDE.md` e o corte explicitamente aprovado; registrar decisões antes de ampliar o desenvolvimento.
