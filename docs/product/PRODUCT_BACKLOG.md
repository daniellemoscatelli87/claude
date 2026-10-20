# Product Backlog

Status possíveis: **Aprovado, não iniciado** · **Em andamento** · **Implementado (não testado)** · **Implementado e testado** · **Validado com usuários** · **Planejado (não autorizado)** · **Fora de escopo**.

Cada item indica o elo da cadeia de valor em que atua: **Identificar** um desafio → **Investigar** a realidade → **Compreender** as pessoas → **Transformar** o serviço → **Avaliar** os resultados. Itens de fundação são marcados como **Base**.

Referência dos cortes: seção 18 de [`CHALLENGE_METHODOLOGY.md`](CHALLENGE_METHODOLOGY.md). Escopo aprovado: [`../engineering/FIRST_INCREMENT_PROMPT.md`](../engineering/FIRST_INCREMENT_PROMPT.md).

**Atualizado em:** 20/10/2026 (testes controlados, limites da IA e decisão de IA independente de fornecedor).

---

## Incremento atual (aprovado): Corte 1 + Corte 2

Onde mora e qual banco: decididos (D-005 e D-006). IA desde o começo (D-007). Detalhes e evidências de teste no [Implementation Log](../engineering/IMPLEMENTATION_LOG.md).

Legenda de teste: **banco** = teste executado no banco real (`rls_isolation.sql`); **regras** = testes automatizados (`npm test`); **telas** = fluxo no navegador com o servidor simulado. Nenhum item foi testado ainda com login real e IA real, porque a aplicação não está publicada.

### Corte 1 · Fundação SaaS · Base

| ID | Item | Status | Teste |
|---|---|---|---|
| C1-01 | Cadastro e login de pessoas | Implementado (não publicado) | telas |
| C1-02 | Organizações e membros com papéis iniciais (quem cria vira `org_admin`) | Implementado (não publicado) | banco, telas |
| C1-03 | RLS em todas as tabelas; nenhuma escrita direta nas tabelas | Implementado e testado | banco |
| C1-04 | Auditoria mínima (`audit_events`) em criação, confirmação, edição, respostas e uso da IA | Implementado e testado | banco |
| C1-05 | Testes de isolamento entre duas organizações (e administradora do site sem acesso) | Implementado e testado | banco (8 verificações) |
| C1-06 | README para rodar o projeto | Implementado | revisão |

### Corte 2 · Entrada do desafio · Identificar

| ID | Item | Status | Teste |
|---|---|---|---|
| C2-01 | Tela "O que você quer melhorar?" logo após criar a organização | Implementado (não publicado) | telas |
| C2-02 | `original_statement` gravado literalmente e nunca sobrescrito | Implementado e testado | banco, regras |
| C2-03 | Sugestão da IA editável, separada do texto original | Implementado (não publicado); IA real não testada | telas (IA simulada) |
| C2-04 | Histórico de versões com autor e motivo | Implementado e testado | banco |
| C2-05 | Próxima pergunta, uma por vez, por regra determinística | Implementado e testado | regras, telas |
| C2-06 | "Não sei" com quatro caminhos práticos | Implementado e testado | regras, telas |
| C2-07 | Aviso para não inserir dados identificáveis ou de saúde | Implementado (não publicado) | telas |
| C2-08 | Retomar após atualizar a página | Implementado (não publicado) | telas; após novo login: não testado |
| C2-09 | Validação dos campos do Challenge Model com schema | Implementado e testado | regras |
| C2-10 | Tipos preparados para o Methodology Engine | Implementado | typecheck |

### Acesso master (D-011) · Base

| ID | Item | Status | Teste |
|---|---|---|---|
| M-01 | Funções de leitura da master com registro de cada acesso (auditoria do cliente e registro da plataforma) | Implementado e testado | banco (6 verificações, `master_access.sql`) |
| M-02 | Área master na aplicação: clientes, desafios e desafio completo, somente leitura | Implementado (não publicado) | telas |
| M-03 | Aviso no cadastro de que o estúdio pode acessar os projetos e que tudo fica registrado | Implementado (não publicado) | telas |

### Testes controlados e custo (D-014 a D-016) · Base

| ID | Item | Status | Teste |
|---|---|---|---|
| T-01 | Acesso por convite (lista de teste com e-mail confirmado, ou master), conferido no banco | Implementado e testado | banco (9 verificações, `controlled_access_ai_limits.sql`), telas |
| T-02 | Sugestão da IA guardada por desafio; recarregar não chama a IA de novo | Implementado e testado | banco, telas |
| T-03 | Limites de uso da IA (por desafio, pessoa por dia e plataforma por dia) e chave para desligar | Implementado e testado | banco, regras, telas |
| T-04 | Função da IA com no máximo 2 tentativas por pedido | Publicado (versão 3); chamada real não testada | revisão |
| T-06 | IA desligada até revisar o tratamento de dados da API (D-017) | Aplicado | banco |
| T-07 | Conclusão do uso da IA só pelo servidor | Implementado e testado | banco |
| T-08 | Procedimento de reversão das migrações e versões anteriores da função da IA | Pronto; reversão parcial testada | banco |
| T-05 | Build da aplicação no Netlify só quando a pasta dela muda | Implementado (não publicado) | revisão |

### Para fechar o incremento

| ID | Item | Status |
|---|---|---|
| C2-11 | Publicar a aplicação (segundo site no Netlify, subdomínio) | Segundo site publicado em 20/10/2026 (`dm-experience-intelligence.netlify.app`, Private no Netlify); `app.danimoscatelli.com.br` com HTTPS ativo |
| C2-12 | Liberar cadastro e endereço de retorno do login no Supabase | Concluído em 20/10/2026 pela dona do produto: endereço de retorno `https://app.danimoscatelli.com.br/**` adicionado; conferido que o cadastro por e-mail está ligado, "Confirm email" ligado e login anônimo desligado. Site URL não alterado |
| C2-13 | Teste com login real e IA real, no celular | Depois da publicação e da revisão do tratamento de dados do Gemini |
| C2-14 | Teste real de concorrência dos limites da IA (várias chamadas ao mesmo tempo, em conexões diferentes) | **Obrigatório antes de ativar a IA para clientes** (D-018) |

---

## Próximos cortes (planejados, não autorizados)

| Corte | Item | Elo | Status |
|---|---|---|---|
| Comercial | Cobrança antes do uso: cadastro → pagamento → uso (D-013) | Base | Planejado (não autorizado); depende de provedor de pagamento e preços |
| Comercial | Termos de uso e política de privacidade do produto, incluindo o acesso da master (D-011) | Base | Obrigatório antes do lançamento comercial |
| 3 | Motor de condução: perguntas, protocolos em JSON, `next_best_action`, "não sei" completo | Investigar | Planejado (não autorizado) |
| 4 | Registro e síntese: atividades, evidências, cobertura, tela "O que sabemos / O que falta saber" | Investigar · Compreender | Planejado (não autorizado) |
| 5 | Integração de inteligência: busca em protocolos curados, prompts versionados, saída validada e logs | Compreender | Planejado (não autorizado) |
| 6 | Oferta especializada: regras, cartões, consentimento e notificação ao estúdio | Transformar | Planejado (não autorizado) |
| 7 | Teste de ponta a ponta: clínica, hotel e experiência do colaborador, sem regras fixas por setor | Avaliar | Planejado (não autorizado) |

### Condução adaptativa, cadastro e primeiro acesso: proposto, aguardando aprovação

Especificação: `docs/product/ux-onboarding/` (kit v1.0). Proposta e comparação com o código: [`UX_ONBOARDING_PROPOSAL.md`](UX_ONBOARDING_PROPOSAL.md), seção 8 (D-021, D-022). Ordem: UX-3a → UX-3b → UX-1. Nada implementado.

| ID | Item | Elo | Status |
|---|---|---|---|
| UX-3a | Base da condução adaptativa (D-021): contexto mínimo da organização, nome obrigatório, catálogo de protocolos aprovados, Experience Guide com instrumentos, plano inicial pela IA, cartão de atividade, registro estruturado de evidências e regras imediatas de qualidade | Identificar · Investigar | **Aprovado (D-024), em andamento** |
| UX-10 | Cadastro em etapas (D-025): /cadastro/ com dados pessoais, confirmação de e-mail, empresa ou negócio, chamada para o primeiro desafio; "Meus dados" com edição, troca de e-mail e senha | Base | Implementado e testado (não publicado). CPF e data de nascimento retirados (D-027) |
| UX-13 | Cadastro sem CPF: declaração de maioridade, CNPJ opcional na empresa, aviso de privacidade com aceite registrado (D-027) | Base | Implementado e testado (não aplicado no banco, não publicado) |
| UX-14 | Termos de Uso e Política de Privacidade do produto (requisitos em `docs/legal/`) | Base | Requisitos prontos; texto jurídico obrigatório antes do lançamento |
| UX-11 | Cruzar o cadastro com o formulário de contato do site (P-006) | Base · Identificar | Proposto; aguarda decisão |
| UX-12 | Botão "Cadastrar" no site do estúdio, apontando para /cadastro/ | Base | Depois (pedido da dona do produto) |
| UX-3b | Adaptação: análise da IA nos marcos, "O que descobrimos até aqui", decisão proposta (aprofundar, outra perspectiva, revisar hipótese, avançar) validada pelo Engine e confirmada pela pessoa | Investigar · Compreender | Proposto (aguardando aprovação) |
| UX-1 | Entrada pública, cadastro completo do cliente fora do acesso público (pagamento pulado nos testes), boas-vindas, "Esqueci minha senha", rodapé "by Dani Moscatelli Studio" (D-022) | Base | Proposto (aguardando aprovação) |
| UX-4 | Revisão dos planos e análises da IA pela dona do produto nos 3 casos fictícios, antes de clientes reais | Investigar | Obrigatório antes de clientes reais |
| UX-5 | Simulação "Visualizar experiência de cliente" para a master | Base | Futuro |
| UX-6 | Convite de pessoas para a organização; encaminhamento a especialista | Base · Transformar | Futuro |
| UX-7 | Anexos de evidências (armazenamento privado, revisão de LGPD) | Investigar | Futuro |
| UX-8 | Expansão da biblioteca metodológica com curadoria (novos protocolos e disciplinas) e RAG especialista | Compreender | Futuro (metodologia, seção 11) |
| UX-9 | Tela na Área master para convidar clientes de teste | Base | Proposto |

### IA independente de fornecedor (D-019): planejado, não autorizado

Diretrizes completas na seção 1 de [`PRODUCT_ARCHITECTURE.md`](PRODUCT_ARCHITECTURE.md). Nenhum item abaixo deve ser antecipado.

| ID | Item | Elo | Status |
|---|---|---|---|
| IA-01 | Proposta técnica da arquitetura com vários fornecedores, aproveitando o código existente | Base | Planejado: apresentar quando começarem o Methodology Engine e o RAG |
| IA-02 | Escolha do modelo conforme a atividade | Base | Planejado (não autorizado) |
| IA-03 | Methodology Engine e RAG sem depender do fornecedor de IA | Investigar · Compreender | Planejado (não autorizado); faz parte dos Cortes 3 a 5 |
| IA-04 | Comparação de modelos: qualidade metodológica, precisão, confiabilidade, privacidade, velocidade e custo | Base | Planejado (não autorizado) |
| IA-05 | Registro de consumo e custo estimado por organização, pessoa e funcionalidade | Base | Planejado (não autorizado); hoje `ai_usage` registra uso por desafio, organização e pessoa, sem custo |
| IA-06 | Limites de uso de IA por plano de assinatura | Base | Planejado (não autorizado); depende do corte comercial |
| IA-07 | Serviço de IA com condições adequadas de privacidade e proteção de dados, antes de dados reais de clientes | Base | Obrigatório antes de usar dados reais; depende de decisão e contratação pela dona do produto |

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
