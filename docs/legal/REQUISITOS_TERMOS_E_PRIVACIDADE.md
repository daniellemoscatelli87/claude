# Requisitos para os Termos de Uso e a Política de Privacidade do produto (D-026)

**Status:** requisitos de produto para redação jurídica. **Não é texto jurídico final** e precisa de revisão por profissional habilitado antes do lançamento comercial. Um **aviso resumido** deve estar disponível já na fase de testes.

## 1. Controlador, operadores e contato
- **Controladora:** Dani Moscatelli | Experience Design Studio, com contato do encarregado (DPO) ou canal equivalente. Hoje: contato@danimoscatelli.com.br.
- **Operadores e suboperadores a declarar:**
  - Supabase: banco, autenticação, funções e e-mails de confirmação;
  - Netlify: hospedagem do app;
  - Google: Gemini, quando a IA estiver ligada;
  - provedor de e-mail, se for configurado.
- Informar a **transferência internacional** de dados, onde houver servidores fora do Brasil (verificar a região de cada serviço).

## 2. Dados e finalidades

| Dado | Finalidade | Base legal provável (LGPD, art. 7º) |
|---|---|---|
| Nome, e-mail, senha (hash, guardado pelo Supabase Auth) | Criar e proteger a conta; comunicação sobre o serviço | Execução de contrato ou procedimentos preliminares (V) |
| Telefone, estado e cidade | Contato e suporte; contexto da conta | Execução de contrato (V) |
| Declaração de maioridade | Garantir que a pessoa responsável é maior de idade | Execução de contrato (V) |
| Dados da empresa (nome, segmento, o que oferece, tipo, porte, CNPJ quando informado) | Configurar o espaço de trabalho e adaptar as orientações; evitar duplicidade | Execução de contrato (V); legítimo interesse (IX) para integridade cadastral |
| Conteúdo dos desafios, respostas e evidências | Prestar o serviço de investigação guiada | Execução de contrato (V) |
| Registros de auditoria e de uso da IA | Segurança, prevenção de fraude, controle de custos | Legítimo interesse (IX) |
| Acesso da equipe do estúdio aos projetos (D-011) | Suporte e qualidade, com registro visível ao cliente | Execução de contrato (V); informar com destaque |
| Envio de conteúdo a provedor de IA | Gerar o entendimento e o plano de investigação | Execução de contrato (V); informar o provedor e as condições de uso dos dados |
| Contato anterior pelo site (se P-006 for aprovado) | Aproveitar o que a pessoa já enviou, com a escolha dela | Consentimento (I), no momento do uso |
| CPF (somente se houver necessidade futura) | Contrato ou cobrança de pessoa física | Execução de contrato (V) ou obrigação legal (II), conforme o caso |

## 3. Conteúdo obrigatório
- **Direitos do titular** (art. 18): confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação do consentimento. Informar o canal e o prazo de resposta.
- **Retenção:** quanto tempo cada dado é guardado (conta ativa, depois do encerramento, obrigações legais) e o que acontece ao excluir a conta ou a empresa.
- **Segurança:** medidas adotadas (isolamento entre empresas, acesso mínimo, criptografia em trânsito, auditoria); sem promessa absoluta.
- **IA:** a IA sugere e a pessoa confirma; não há decisão automatizada com efeito jurídico. Informar o direito de revisão (art. 20) quando aplicável.
- **Proibição** de inserir dados de saúde ou de terceiros identificáveis no conteúdo, nesta fase.
- **Fase de testes:** a plataforma está em testes, com acesso por convite e sem garantia de disponibilidade.
- **Armazenamento local no navegador:** sessão de login e empresa selecionada (`localStorage`). Política de cookies, se houver medição.
- **Termos de Uso:** objeto, conta e responsabilidades da pessoa responsável, uso aceitável, propriedade do conteúdo do cliente, limites de responsabilidade (orientações não substituem profissionais habilitados), encerramento, alterações dos termos, foro.

## 4. Aviso resumido para a fase de testes (requisito imediato, aguarda aprovação)
- **Onde aparece:** na tela de cadastro, antes de "Criar conta", com o link "Como usamos seus dados".
- **O que diz:** o que coletamos, para quê, quem processa (Supabase, Netlify e Google, quando a IA estiver ligada), que a equipe do estúdio pode acessar os projetos com registro, e como pedir correção ou exclusão.
- **Aceite:** caixa obrigatória, registrada com data, hora e versão do aviso.
