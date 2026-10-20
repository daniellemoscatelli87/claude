# Product Architecture

Decisões de arquitetura do produto DM | Experience Intelligence que valem para além de um incremento. Cada seção separa o que foi **decidido** (direção) do que **existe hoje** no código. A especificação funcional e técnica de origem continua em [`CHALLENGE_METHODOLOGY.md`](CHALLENGE_METHODOLOGY.md), que não é editado.

**Atualizado em:** 20/10/2026.

---

## 1. Inteligência artificial independente de fornecedor (D-019)

**Status:** decisão registrada. **Não implementada e não autorizada para implementação.** Nenhuma API nova foi contratada ou integrada.

### 1.1 Decisão

A plataforma não pode depender de um único fornecedor de IA. A arquitetura deve permitir usar modelos do Google Gemini, da Anthropic (Claude), da OpenAI e de outros fornecedores.

### 1.2 Diretrizes definidas pela dona do produto

1. **Modelo por atividade:** escolher modelos diferentes conforme a atividade executada.
2. **Motor e conhecimento independentes do fornecedor:** o Methodology Engine e o RAG funcionam da mesma forma qualquer que seja o fornecedor de IA.
3. **Comparação de modelos** por qualidade metodológica, precisão, confiabilidade, privacidade, velocidade e custo.
4. **Registro de consumo e custo estimado** por organização, por pessoa e por funcionalidade.
5. **Limites de uso de IA por plano de assinatura** na futura estrutura comercial.
6. **Privacidade antes de dados reais:** antes de processar dados reais de clientes, contratar ou configurar serviços com condições adequadas de privacidade e proteção de dados.

### 1.3 O que existe hoje (20/10/2026)

| Parte | Situação | Relação com a decisão |
|---|---|---|
| Função `ei-interpretar-desafio` | Chama só o Gemini, direto pela API dele, para uma única atividade (organizar o desafio) | Será o ponto de partida da adaptação a vários fornecedores |
| Prompt versionado (`interpretacao_desafio_v1`) e validação da resposta por schema | Existem dentro da função | Já não dependem do formato de resposta do fornecedor depois da validação |
| `ai_usage` | Registra cada uso por desafio, organização e pessoa, com resultado | Ainda não registra fornecedor, funcionalidade, tokens nem custo estimado |
| `ei_settings` | Liga e desliga a IA e define limites globais, por desafio e por pessoa por dia | Ainda não tem limites por plano nem por funcionalidade |
| Auditoria (`audit_events`) | Registra modelo e versão do prompt de cada sugestão | Já guarda qual modelo foi usado |
| IA | **Desligada** (D-017) | Continua desligada até a revisão de privacidade e o teste de concorrência (D-018) |
| Methodology Engine e RAG | Não existem (só tipos do motor em `src/domain/methodology/contracts.ts`) | Serão construídos já sem depender de fornecedor |

### 1.4 Próximo passo combinado

Quando começarem o Methodology Engine e o RAG, o Claude apresenta **uma proposta técnica** para a arquitetura com vários fornecedores, aproveitando o código existente. Nada é implementado antes da aprovação dessa proposta.

---

## 2. Identidade, contas e cadastros (D-026)

**Status:** diretrizes da dona do produto registradas; proposta em [`../security/DADOS_PESSOAIS.md`](../security/DADOS_PESSOAIS.md). **Mudanças no banco e no cadastro aguardam aprovação.**

1. **Pessoa e empresa são cadastros diferentes.** A conta pessoal identifica a pessoa (id interno + e-mail confirmado). A empresa ou negócio é um espaço de trabalho com membros.
2. **Uma pessoa, várias empresas, sem conta duplicada:** o vínculo fica em `organization_members` (um por empresa), e a interface troca de empresa. Já existe no banco; falta o convite para entrar numa empresa existente (UX-6).
3. **Duplicidades:** de contas, pelo e-mail confirmado (Supabase Auth); de empresas brasileiras, pelo CNPJ (proposto, opcional).
4. **CPF** só com necessidade real que não possa ser atendida por meio menos invasivo. Se for necessário: criptografia recuperável no servidor + HMAC com chave secreta para duplicidade; nunca na IA, em logs, nos metadados da conta ou na auditoria.
5. **Transparência desde os testes:** aviso de privacidade no cadastro, com aceite registrado. Requisitos em [`../legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md`](../legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md).
