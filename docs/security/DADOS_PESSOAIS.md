# Dados pessoais: estado atual e proposta (D-026)

**Data:** 21/10/2026 · **Status:** a proposta da seção 3 foi aprovada (D-027) e implementada no código; as migrações ainda **não foram aplicadas** e o app **não foi publicado**.

## 1. Como o CPF está hoje

| Onde | Situação |
|---|---|
| Banco (produção) | **Não existe CPF armazenado.** A migração `20261021100000_perfil_pessoal.sql` (tabela `ei_profiles` e gatilho `ei_capturar_cadastro`) **nunca foi aplicada**. Verificado em 21/10/2026: a tabela não existe, o gatilho não existe, nenhuma coluna com "cpf" em `public` ou `auth`, nenhum metadado de conta com CPF |
| Testes de banco | Rodaram só com CPFs fictícios, em transações desfeitas; nada ficou gravado |
| Código (branch de trabalho, não publicado) | `src/domain/profile/personal.ts` (validação), `src/application/profile.ts` (envio no cadastro), `src/components/PersonalForm.tsx` (campo) e a migração não aplicada |
| Desenho da migração não aplicada | CPF em texto simples, com índice único em `ei_profiles`; o cadastro levaria o CPF nos metadados da criação da conta e o gatilho o retiraria antes de salvar; leitura só mascarada; sem leitura direta da tabela |
| IA, auditoria, logs do app | Nunca usados: o CPF não é enviado à IA, não entra em `audit_events` nem em `ai_usage` |

**Riscos do desenho não aplicado:**
- o CPF ficaria em texto simples, recuperável por quem tiver acesso de administração ao banco;
- ele passaria pela API de autenticação do Supabase na criação da conta, onde pode aparecer em logs de erro do serviço;
- o índice único sobre o CPF em claro permitiria consultas por CPF a quem tivesse acesso ao banco.

## 2. O CPF é necessário para impedir duplicidades?

**Não, nesta fase.**

| Necessidade | Já atendida por | CPF ajuda? |
|---|---|---|
| Uma conta por pessoa | O Supabase Auth já impede duas contas com o mesmo e-mail; o acesso exige e-mail confirmado e convite | Só contra a mesma pessoa com dois e-mails, o que não é um problema real com acesso por convite |
| Pessoa em várias empresas sem conta duplicada | `organization_members` com `unique (organization_id, user_id)`: uma conta participa de várias empresas; a barra lateral já troca de empresa | Não |
| Empresa duplicada | Hoje não há proteção | Não; o identificador adequado é o **CNPJ** da empresa |
| Identificar o responsável pela conta | Nome completo + e-mail confirmado + id interno | Só quando houver contrato ou cobrança que exijam |
| Maioridade | — | Não; o CPF não comprova idade sem consulta externa. Declaração de maioridade é menos invasiva |

**Conclusão:** coletar CPF e data de nascimento agora não passa no teste de necessidade (LGPD, art. 6º, III). Há mecanismos menos invasivos para cada finalidade.

## 3. Proposta (aguarda aprovação)

**Pessoa (conta pessoal)**
- Identificador: `user_id` interno + e-mail confirmado.
- Perfil:
  - nome completo (obrigatório);
  - telefone (obrigatório, para contato e suporte);
  - estado e cidade (**obrigatórios**: confirmado pela dona do produto em 21/10/2026, para a análise posterior do perfil de clientes; a finalidade precisa constar no aviso de privacidade);
  - **sem CPF e sem data de nascimento.**
- Maioridade: caixa "Declaro ter 18 anos ou mais", registrada com data e versão do texto.
- Os dados do perfil continuam fora dos metadados da conta (o gatilho grava em `ei_profiles` e limpa os metadados), para não irem para o token de acesso.

**Empresa ou negócio**
- **CNPJ opcional** para empresas brasileiras, com validação dos dígitos e único por empresa cadastrada (14 dígitos completos; cada filial tem o seu).
- Se o CNPJ já existir, não cria uma duplicada e orienta a pedir convite a quem administra.
- Sem CNPJ continua possível: profissionais autônomos, organizações estrangeiras e grupos informais.
- O CNPJ é dado de pessoa jurídica (público), mas não vai para a IA sem necessidade.

**CPF no futuro (só se surgir necessidade concreta, como cobrança de pessoa física ou assinatura de contrato):**
- coletado na etapa que precisa dele, não no cadastro;
- **criptografado (AES-256-GCM)** numa função do servidor, com a chave nos segredos das funções do Supabase; o banco guarda só o texto cifrado;
- **HMAC-SHA256 com chave secreta** separada, em coluna única, para comparar duplicidades sem guardar o CPF em claro;
- exibição só dos 2 últimos dígitos;
- nunca nos metadados da conta, na IA, em logs ou na auditoria (a auditoria registra só "CPF atualizado");
- a rotação de chaves fica documentada antes de entrar em uso.

**Transparência desde os testes**
- Aviso de privacidade da fase de testes no cadastro: o que é coletado, para quê, base legal, com quem é compartilhado (operadores) e como pedir exclusão.
- Aceite registrado com data e versão do texto.
- Requisitos completos em [`../legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md`](../legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md).
