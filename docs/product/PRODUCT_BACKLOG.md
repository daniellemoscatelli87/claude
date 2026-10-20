# Product Backlog

Status possíveis: **Aprovado, não iniciado** · **Em andamento** · **Implementado (não testado)** · **Implementado e testado** · **Validado com usuários** · **Planejado (não autorizado)** · **Fora de escopo**.

Cada item indica o elo da cadeia de valor em que atua: **Identificar** um desafio → **Investigar** a realidade → **Compreender** as pessoas → **Transformar** o serviço → **Avaliar** os resultados. Itens de fundação são marcados como **Base**.

Referência dos cortes: seção 18 de [`CHALLENGE_METHODOLOGY.md`](CHALLENGE_METHODOLOGY.md). Escopo aprovado: [`../engineering/FIRST_INCREMENT_PROMPT.md`](../engineering/FIRST_INCREMENT_PROMPT.md).

**Atualizado em:** 20/10/2026 (testes controlados e limites da IA).

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
| T-04 | Função da IA com no máximo 2 tentativas por pedido | Publicado (versão 2); chamada real não testada | revisão |
| T-05 | Build da aplicação no Netlify só quando a pasta dela muda | Implementado (não publicado) | revisão |

### Para fechar o incremento

| ID | Item | Status |
|---|---|---|
| C2-11 | Publicar a aplicação (segundo site no Netlify, subdomínio) | Aguardando a dona do produto |
| C2-12 | Liberar cadastro e endereço de retorno do login no Supabase | Aguardando a dona do produto |
| C2-13 | Teste com login real e IA real, no celular | Depois da publicação |

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
