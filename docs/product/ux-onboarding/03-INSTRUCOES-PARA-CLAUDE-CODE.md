# Enviar esta instrução ao Claude Code — DM | Experience Intelligence

Estou testando a DM | Experience Intelligence no celular e identifiquei problemas estratégicos na primeira experiência. Estou enviando dois documentos: `01-DIRETRIZES-UX-PRODUTO-E-FLUXOS.md` e `02-COPY-COMPLETA-E-COMPONENTES.md`.

**OBJETIVO:** redesenhar o primeiro acesso e o início da jornada como uma experiência de serviço guiado, e não como um formulário. Considerar desafios de processos, serviços, operações, atendimento, produtos digitais, ambientes físicos e experiências de públicos diversos (clientes, consumidores, pacientes, usuários, colaboradores, parceiros etc.). A copy completa, os componentes e ícones sugeridos estão definidos nos documentos. O desenho é mobile-first e usa a identidade do estúdio.

**EXIGÊNCIA CENTRAL:** as perguntas e tarefas subsequentes devem ser específicas ao desafio informado. Não adotar perguntas fixas universais como solução. O Methodology Engine governa necessidades de informação/estado; a IA estrutura e adapta instruções sob validação; o RAG fundamentará a orientação quando implementado. Gerar planos estruturados, armazená-los, evitar chamadas em reload e respeitar limites de custo. **A IA está DESLIGADA agora; não religue nem afirme personalização automática funcionando.** Proponha uma alternativa manual honesta até a implementação aprovada.

**NOVO REQUISITO:** revisar a experiência de cadastro em três partes distintas: (1) conta/autenticação e autorização por convite, (2) configuração da organização/workspace, (3) criação do desafio; mostrar onboarding diferente para quem acessa pela primeira vez e para quem retorna. Não criar cobrança nem pedir dados fiscais neste incremento. Separar área master da jornada de clientes.

**O que quero de você AGORA, antes de alterar o código:**
1. Leia o `CLAUDE.md`, Product Vision, Challenge Methodology, Backlog, Decision Log e Implementation Log mais recentes; inspecione rotas/componentes/formulários e tabelas já existentes. Não recrie o que já funciona.
2. Compare a aplicação atual com as especificações anexas; liste o que já existe, o que pode ser ajustado sem migração e o que depende de implementação futura (IA/RAG/assinaturas).
3. Apresente um plano de telas e fluxo (primeiro acesso, retorno, organização, desafio, interpretação, pergunta adaptativa), com os componentes Lucide sugeridos e a copy dos anexos.
4. Apresente proposta técnica de planejamento adaptativo ao desafio, armazenamento de plano/perguntas, `não sei`, retomada, validação, limite de consumo e fallback manual com IA desativada. Esclareça como evitar perguntas fixas sem gerar requisições de IA a cada resposta.
5. Mostre os arquivos que mudariam, as migrações estritamente necessárias (se houver), riscos LGPD/permissão, testes e eventuais custos. Proponha ordem de implementação curta, verificável e reversível.
6. Registre os requisitos nos documentos permanentes do projeto sem afirmar que foram implementados. **Aguarde minha aprovação antes de programar, fazer merge, migrações ou deploy.**

Restrições permanentes: não reativar Gemini; não contratar novas APIs; não alterar o site principal; preservar convite/e-mail confirmado, autenticação, RLS multiempresa, auditoria, master e limites; não gerar deploy nem criar ambientes pagos; não armazenar dados reais de pacientes/colaboradores; orientações sempre uma ação por vez porque trabalho pelo celular.

**Primeiro retorno esperado:** uma proposta objetiva do fluxo e dos componentes, o mapeamento dos cadastros já implementados e o desenho técnico das perguntas dinâmicas, separando claramente o que está implementado, o que está somente projetado e o que precisa de autorização.
