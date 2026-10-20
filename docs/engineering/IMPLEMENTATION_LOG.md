# Implementation Log

Registro do que foi **efetivamente** desenvolvido, testado e colocado em funcionamento no produto DM | Experience Intelligence. Cada entrada informa: data, o que foi feito, arquivos, migrações, comandos executados com o resultado real (inclusive falhas) e o que ficou pendente.

Distinguir sempre: **implementado** (código existe), **testado** (comando executado e resultado registrado), **em funcionamento** (publicado e verificado no ambiente real) e **validado** (testado com usuários, ver `docs/research/VALIDATION_LOG.md`).

---

## Estado atual (20/10/2026)

**Cortes 1 e 2, acesso master, acesso por convite e limites da IA implementados, não publicados.** Banco, regras e telas testados (ver entradas abaixo). As migrações de 20/10 estão aplicadas, a função da IA publicada é a versão 3 e **a IA está desligada** (D-017). Ainda não houve teste com login real e IA real, porque a aplicação não está no ar.

## 2026-10-19 · Organização da documentação

- **Feito:** documentos do kit copiados para o repositório e registros permanentes criados (ver D-004 no Decision Log).
- **Arquivos criados:** `CLAUDE.md`, `docs/README.md`, `docs/strategy/PRODUCT_VISION.md`, `docs/strategy/BUSINESS_MODEL_CANVAS.md`, `docs/strategy/ROADMAP.md`, `docs/product/CHALLENGE_METHODOLOGY.md`, `docs/product/PRODUCT_BACKLOG.md`, `docs/decisions/DECISION_LOG.md`, `docs/engineering/FIRST_INCREMENT_PROMPT.md`, `docs/engineering/IMPLEMENTATION_LOG.md`, `docs/research/VALIDATION_LOG.md`.
- **Verificação executada:** `cmp` confirmou que `CLAUDE.md` foi copiado idêntico ao do kit antes de receber a nota de escopo; os outros três documentos do kit foram copiados sem edição (a visão recebeu apenas a seção 16 ao final).
- **Código, banco e testes:** nenhum alterado.

## 2026-10-19 · Cortes 1 e 2: fundação SaaS e entrada do desafio

**Aplicação:** `apps/experience-intelligence/` (Next.js 16 + TypeScript 6, site estático, Zod 4, Vitest 5, oxlint). Decisões D-005 a D-010.

**Banco (projeto `lipfvnerohkaajegqvwr`):**
- Migração `apps/experience-intelligence/supabase/migrations/20261019120000_fundacao_e_desafio.sql`, aplicada no Supabase como `ei_20261019120000_fundacao_e_desafio`.
- Tabelas: `organizations`, `organization_members`, `challenges`, `challenge_versions`, `audit_events` e `investigation_questions` (D-009). RLS em todas; leitura só para membros; nenhuma permissão de escrita direta para `anon` ou `authenticated`.
- Funções de escrita: `ei_create_organization`, `ei_create_challenge`, `ei_confirm_structure`, `ei_answer_question`, `ei_log_interpretation`; auxiliares `ei_is_member`, `ei_snapshot`. Gatilho `challenges_texto_original_imutavel` impede alterar `original_statement` e trocar a organização do desafio.
- Revisão de segurança do site antes de abrir cadastro: todas as políticas do site para `authenticated` exigem `is_admin()`; todas as tabelas do site têm RLS. Conclusão: ter uma conta não dá acesso a nada do site.

**Função da IA:** `ei-interpretar-desafio` (código em `apps/experience-intelligence/supabase/functions/ei-interpretar-desafio/index.ts`), publicada no Supabase (versão 1, exige login). Lê o desafio com o token da pessoa (RLS), pede ao Gemini uma proposta, valida com schema e registra na auditoria modelo e versão do prompt (`interpretacao_desafio_v1`). Não grava nada no desafio.

**Telas:** início (criar conta/entrar, criar organização, lista de desafios), `/desafio/novo/` ("O que você quer melhorar?" com aviso de dados) e `/desafio/?id=` (texto original, revisão da sugestão da IA, resumo, próxima pergunta, "não sei", pendências).

**Testes executados e resultados:**

| Comando / teste | Resultado |
|---|---|
| `npm test` (Vitest, `tests/challenge.test.ts` e `tests/framing.test.ts`) | 25 testes, 25 passaram |
| `npm run typecheck` (`tsc --noEmit`) | sem erros |
| `npm run lint` (oxlint) | 0 erros, 3 avisos de "fast refresh" em arquivos do Next (sem efeito no site gerado) |
| `npm run build` | sucesso; 4 páginas estáticas em `out/` |
| `supabase/tests/rls_isolation.sql` no banco real, dentro de transação desfeita | "OK: 8 verificações passaram": A cria organização e desafio com versão e auditoria; confirmar a estrutura preserva o texto original e avança para framing; ninguém escreve direto na tabela; B não lê organização, membros, desafio, versões nem auditoria de A; B não edita, não responde e não cria desafios em A; a administradora do site não lê dados das organizações; visitante sem login não lê nem cria nada; o texto original não muda nem com acesso total ao banco |
| Conferência após o teste | 0 usuários de teste, 0 organizações, 0 desafios no banco |
| Fluxo das telas no navegador (Playwright, celular 390 px, servidor simulado) | entrar → criar organização → ir direto para "O que você quer melhorar?" → sugestão da IA (simulada) → editar e confirmar (origem `ai_edited`, sem texto original no envio) → perguntas na ordem, pulando as já respondidas pela estrutura → "não sei" com caminho "Pedir ajuda a alguém" → recarregar a página e retomar com pendências visíveis → desafio de outra organização mostra "Desafio não encontrado"; nenhum erro de página |

**Não testado ainda:** cadastro e login reais (inclusive e-mail de confirmação), resposta real do Gemini e qualidade das sugestões, retomada após novo login, uso em celular real. Dependem da publicação.

**Pendências para publicar:** segundo site no Netlify com pasta base `apps/experience-intelligence` (o `netlify.toml` já define build e pasta `out`), subdomínio, e no Supabase Auth: cadastro liberado e o endereço do app nas URLs de retorno.

## 2026-10-19 · Acesso master com registro (D-011) e avisos de fase de testes

- **Banco:** migração `apps/experience-intelligence/supabase/migrations/20261019150000_acesso_master.sql`, aplicada como `ei_20261019150000_acesso_master`. Tabela `master_access_log` (sem acesso para `anon` e `authenticated`); funções `ei_is_master`, `ei_master_organizations`, `ei_master_challenges`, `ei_master_challenge` e `ei_master_registrar` (esta última só chamada pelas outras).
- **Conta master:** `ei_master: true` adicionado ao `app_metadata` de contato@danimoscatelli.com.br (o papel `admin` do site continua lá). A marca passa a valer no próximo login ou renovação da sessão.
- **Aplicação:** `src/application/master.ts`, tela `src/app/master/page.tsx`, link "Área master" no topo (só para a master) e aviso de fase de testes e de acesso do estúdio no cadastro (`AuthForm`).
- **Testes executados:**
  - `supabase/tests/master_access.sql` no banco real, transação desfeita: "OK: 6 verificações passaram": cliente não usa as funções da master; o papel admin do site sozinho não dá acesso master; master não lê direto nas tabelas; master vê organizações, lista de desafios e desafio completo; cada acesso fica registrado na plataforma e na auditoria do cliente; o cliente vê na própria auditoria que a master acessou, mas não o registro geral.
  - Telas da master no navegador (servidor simulado): master navega clientes → desafios → desafio completo, chamando as três funções; conta comum que abre `/master/` volta ao início e não vê o link; nenhum erro de página.
  - `npm test` (25 de 25), `npm run typecheck` (sem erros) e `npm run build` (5 páginas, incluindo `/master`).
- **Não testado ainda:** a área master com login real.

## 2026-10-20 · Revisão técnica e de segurança, acesso por convite e limites da IA (D-014 a D-016)

**Revisão (antes do merge do PR #28).** Achados:

| # | Achado | Gravidade | Situação |
|---|---|---|---|
| R1 | A tela pedia nova sugestão à IA toda vez que o desafio pendente era aberto ou recarregado; cada pedido podia fazer até 10 chamadas ao Gemini; sem limite por pessoa ou por dia | Alta (custo) | Corrigido (D-015) |
| R2 | Qualquer conta do Supabase Auth (compartilhado com o site) podia criar organizações e desafios sem limite | Média | Corrigido (D-014) |
| R3 | `ei_log_interpretation` permitia a um membro gravar na auditoria um uso de IA que não aconteceu | Baixa | Corrigido: permissão retirada; a auditoria da IA agora só nasce de um uso reservado |
| R4 | `ei_confirm_structure` não limita o tamanho das listas da estrutura (pode ocupar espaço no banco) | Baixa (mitigado pelo convite) | Pendente: aguarda decisão da dona do produto |
| R5 | A função da IA aceita chamadas de qualquer origem (CORS `*`); exige login | Baixa | Pendente: restringir ao endereço do app depois da publicação |
| R6 | Aviso do Supabase: proteção contra senhas vazadas desligada | Informativo | Não ativar: recurso de plano pago |
| R7 | Aviso do Supabase: funções `SECURITY DEFINER` executáveis por pessoas logadas | Informativo | Intencional (D-008): cada função confere se a pessoa é membro |

Conferido também: nenhuma função do produto é executável por visitante sem login (`anon`); `ei_master_registrar` e `ei_snapshot` não são portas de escrita; não existe ambiente de homologação (branch) no Supabase; plano do Supabase: Free.

**Banco:** migração `apps/experience-intelligence/supabase/migrations/20261020120000_testes_controlados_e_limites_ia.sql` (tabelas `ei_settings`, `ei_testers`, `ai_usage`, `ai_interpretations`; funções `ei_has_access`, `ei_ai_begin`, `ei_ai_finish`; `ei_create_organization` e `ei_create_challenge` passam a exigir convite). Aplicada em 20/10/2026 como `ei_20261020120000_testes_controlados_e_limites_ia`, com autorização da dona do produto.

**Função da IA:** `ei-interpretar-desafio` reescrita para reservar o uso, devolver a sugestão guardada e fazer no máximo 2 chamadas. Publicada no Supabase como versão 2 (exige login; chamada sem login devolve 401, verificado).

**Aplicação:** tela "Acesso por convite"; mensagens para limite, IA pausada e sem acesso; "Tentar de novo" só para falhas temporárias; aviso de convite no cadastro; `netlify.toml` só gera a aplicação quando a pasta dela muda.

**Testes executados:**

| Comando / teste | Resultado |
|---|---|
| Migração + `controlled_access_ai_limits.sql` no banco real, numa única transação desfeita | "OK: 9 verificações passaram"; conferido depois que nenhuma tabela nova ficou no banco |
| `npm test` | 28 testes, 28 passaram (3 novos sobre as respostas da IA) |
| `npm run typecheck` | sem erros |
| `npm run lint` | 0 erros, os mesmos 3 avisos de "fast refresh" |
| `npm run build` | sucesso, 5 páginas |
| Telas com servidor simulado (390 px) | sem convite: "Acesso por convite", sem formulário; convidada: formulário da organização; limite: mensagem, sem "Tentar de novo", preenchimento manual disponível; ocupado: "Tentar de novo" visível; sugestão guardada: aparece preenchida; nenhum erro de página |

**Falha durante os testes:** a primeira execução no banco ficou parada até o tempo esgotar, porque um `update` sem `where` pedia confirmação na ferramenta. Corrigido com `where id`; nada foi gravado.

**Depois de aplicar (banco real, transações desfeitas):** `rls_isolation.sql` 8 de 8, `master_access.sql` 6 de 6 e `controlled_access_ai_limits.sql` 9 de 9. Conferido em seguida: limites no padrão (3, 20, 100), IA ligada, lista de convidadas vazia, nenhum uso, usuário ou organização de teste no banco.

**Ainda não testado:** chamada real ao Gemini pela versão 2 (depende de uma conta convidada na aplicação publicada).

### Custos recorrentes identificados (nada contratado)

| Serviço | Situação hoje | O que pode gerar custo | Cuidado adotado |
|---|---|---|---|
| Supabase | Plano Free (verificado em 20/10/2026), sem branches | Branches de homologação (cobrados por hora), aumento de computação, backups com recuperação por horário, domínio próprio, proteção de senhas vazadas e passar dos limites do Free (banco de 500 MB, invocações de funções, e-mails) | Nada disso foi ativado; testes no banco dentro de transação desfeita; IA e cadastro limitados |
| Google Gemini | Free Tier, no projeto "Rede de parceiros", sem faturamento configurado (verificado pela dona do produto em 20/10/2026) | Só passaria a cobrar se o faturamento fosse ativado; a dona do produto decidiu não ativar | Limites D-015; IA desligada (D-017) |
| Netlify | Site do estúdio já publicado; segundo site ainda não criado | Cada build consome minutos ou créditos do plano, inclusive pré-visualizações de PR | Build da aplicação só quando a pasta dela muda |
| E-mail de confirmação | Envio padrão do Supabase, gratuito, com limite baixo por hora | Para volume maior será preciso um serviço de e-mail próprio, que pode ser pago | Suficiente para poucos convidados |
| Subdomínio | Não criado | Nenhum: é configuração de DNS no domínio que já existe | Nenhum necessário |

## 2026-10-20 · Condições da dona do produto: IA desligada, conclusão pelo servidor e reversão (D-017)

**Observação:** a migração `20261020120000` e a versão 2 da função já tinham sido aplicadas após o "Sim pode seguir" da dona do produto, antes de ela enviar as condições abaixo. As condições foram cumpridas sobre o que já estava no ar.

| Condição | Como foi atendida | Evidência |
|---|---|---|
| 1. Não afetar o site | As migrações só criam ou alteram objetos do produto (`ei_*`, `ai_*`) | Nenhuma função do site usa as tabelas novas; nenhuma tabela do site aponta para elas; nenhum gatilho novo; funções do site com a mesma versão de antes |
| 2. Versão anterior e reversão | `supabase/rollback/ei-interpretar-desafio-v1.ts` e `-v2.ts`; `supabase/rollback/20261020130000_reverter.sql` (desfaz só a última) e `20261020120000_reverter.sql` (volta ao estado de 19/10; apaga as tabelas novas, só com autorização) | Reversão da última migração executada numa transação desfeita: permissões voltaram como esperado |
| 3. Gemini desligado | Migração `20261020130000_ia_desligada_e_conclusao_pelo_servidor.sql` (`ai_enabled = false`) | `ei_settings.ai_enabled = false` após aplicar; com a IA desligada, `ei_ai_begin` devolve "disabled" antes de qualquer chamada ao Gemini |
| 4. Só pessoas autenticadas e autorizadas, conferido no servidor | O gateway exige token válido (`verify_jwt`); no banco, `ei_ai_begin` confere login, membro com papel de edição e convite com e-mail confirmado (ou master); `ei_ai_finish` só com a chave de serviço | Sem login: 401; token falso: 401; testes no banco (abaixo) |
| 5. Limites não contornáveis | Cada reserva roda sob uma trava única do banco (`pg_advisory_xact_lock`), então chamadas simultâneas são contadas uma de cada vez; uso em andamento no mesmo desafio bloqueia outro; o Gemini só é chamado pelo servidor (a chave não sai dele); chamar `ei_ai_begin` direto só gasta o limite da própria pessoa, e `ei_ai_finish` não é chamável por pessoas | Testes no banco; concorrência real (duas conexões ao mesmo tempo) não foi simulada, a garantia vem da trava |
| 6. Nada pago | Nenhum serviço, plano ou recurso foi ativado | Plano Free; sem branches |

**Função da IA versão 3** publicada: conclui o uso com a chave de serviço (variável `SUPABASE_SERVICE_ROLE_KEY`, já usada pelas funções do site).

**Testes depois de aplicar (banco real, transações desfeitas):**

| Teste | Resultado |
|---|---|
| `controlled_access_ai_limits.sql` (agora inclui: a própria pessoa não grava sugestão direto pela API; só o servidor conclui) | OK: 9 verificações |
| `rls_isolation.sql` | OK: 8 verificações |
| `master_access.sql` | OK: 6 verificações |
| Estado final | IA desligada; limites 3, 20 e 100; 0 convidadas, 0 usos, 0 sugestões, 0 usuários e 0 organizações de teste |
| `npm test`, `typecheck`, `lint`, `build` | 28 de 28; sem erros; 0 erros de lint; build ok |

## 2026-10-20 · Decisão de IA independente de fornecedor (D-019), só documentação

- **Feito:** criado `docs/product/PRODUCT_ARCHITECTURE.md` (seção 1) e registrados D-019 no Decision Log e IA-01 a IA-07 no Backlog; índice em `docs/README.md`.
- **Código, banco, funções e configurações:** nenhum alterado. IA continua desligada (`ai_enabled = false`).

## 2026-10-20 · Conferência antes de publicar no Netlify

- **Compatibilidade do Next.js:** `output: "export"`, `trailingSlash` e imagens sem otimização: site 100% estático em `out/`. Next 16 exige Node 20.9 ou superior; o Netlify usará Node 22. `package-lock.json` versionado (necessário para `npm ci`).
- **Serviços corretos:** o build aponta só para `https://lipfvnerohkaajegqvwr.supabase.co` e para a chave publicável `default` do projeto (conferidas com o Supabase; pública por definição). Busca no build por chave de serviço, chave secreta, chave do Gemini e tokens: nenhum segredo (o único resultado é o código da biblioteca do Supabase que reconhece prefixos de chave).
- **Ajustes no `netlify.toml`:**
  - `NETLIFY_NEXT_PLUGIN_SKIP = "true"`: impede o adaptador de Next.js do Netlify de criar funções de servidor ou otimização de imagens; só arquivos estáticos são publicados;
  - regra de pular build corrigida para sempre gerar no primeiro deploy. Testada: primeiro deploy gera; mesmo commit gera; mudança só em `docs/` pula; mudança no app gera.
- **Configuração do site no Netlify (feita pela dona do produto):** projeto `dm-experience-intelligence`, time danimoscatelli, branch `main`, pasta base `apps/experience-intelligence`, build `npm ci && npm run build`, publicação `apps/experience-intelligence/out`, sem variáveis de ambiente. Ajuste levado ao `main` pelo PR #29.
- **Primeiro deploy (20/10/2026, 13:04):** publicado em `https://dm-experience-intelligence.netlify.app`, projeto marcado como **Private** no Netlify. Verificado de fora: `/`, `/desafio/novo/` e `/master/` respondem 401 com redirecionamento para o login do Netlify (só quem está no time do Netlify abre). Verificado pela dona do produto no celular, logada no Netlify: a tela inicial "O que você quer melhorar…" carrega, com o aviso de fase de testes e acesso por convite. IA continua desligada. Login real ainda não testado.
- **Subdomínio (20/10/2026):** `app.danimoscatelli.com.br` adicionado como domínio principal do projeto no Netlify; registro `CNAME app → dm-experience-intelligence.netlify.app` criado pela dona do produto na Hostinger (DNS do domínio continua na Hostinger; "Netlify DNS" não foi usado). Verificado: o CNAME já responde no Google e no Cloudflare; os registros do site (`@` → 75.2.60.5, `www` → danimoscatelli.netlify.app) continuam iguais e o site responde 200; o app responde 401 (privado) por HTTP. Certificado HTTPS emitido pelo Netlify (Let's Encrypt, `CN=app.danimoscatelli.com.br`, válido até 18/01/2027, verificação ok em 20/10/2026 às 17:27 UTC); o site do estúdio continua respondendo 200.

## 2026-10-20 · Cabeçalho logado com marca e barra lateral de perfil

- **Pedido da dona do produto:** depois do login, cabeçalho com o ícone DM à esquerda (o mesmo da Home do site), divisor vertical e o nome "Experience Intelligence", com "Dani Moscatelli studio" embaixo; à direita, avatar e seta que abre a barra lateral de perfil.
- **Feito:** `src/components/Shell.tsx` (cabeçalho e barra lateral), `src/components/avatar.ts` (iniciais), `public/logo-dm-icone.png` (cópia de `public/favicon-dm.png` do site), estilos em `globals.css`. A barra lateral reúne as opções que já existiam no topo: e-mail e organização atual, troca de organização (quando há mais de uma), "Área master" (só para a master) e "Sair". Nenhuma opção nova foi criada. Sem login, o cabeçalho continua como antes.
- **Acessibilidade:** botão com `aria-expanded`, painel como diálogo com título, foco vai para o painel ao abrir e volta ao botão ao fechar; fecha com Esc, com o "×" ou tocando fora.
- **Testes:** `npm test` 31 de 31 (3 novos, iniciais do avatar); `typecheck` sem erros; `lint` 0 erros; `build` ok. Navegador com servidor simulado, 390 px: master e cliente; ícone carrega; painel abre, recebe o foco, mostra as opções certas para cada uma (cliente sem "Área master" e sem troca de organização), fecha com Esc e tocando fora, foco volta ao botão; sem rolagem lateral; nenhum erro de página.

## Estado do repositório encontrado (19/10/2026)

Levantamento feito antes de propor o plano do Corte 1:

- **Site do estúdio:** Vite 8 + TypeScript 6 + React 19 (`src/`), com `index.html` + `src/em-breve.ts` como página inicial. Páginas da área restrita, Rede de Parceiros, Store e Política de Privacidade em HTML e JavaScript puro dentro de `public/`, copiadas para `dist/` no build.
- **Scripts:** `npm run build` (`tsc -b && vite build`), `npm run lint` (`oxlint`), `npm run dev`, `npm run preview`. Não há script nem biblioteca de testes automatizados.
- **Hospedagem:** Netlify (publica `dist/`). Existe também um `vercel.json` antigo.
- **Banco:** Supabase, projeto `lipfvnerohkaajegqvwr`, usado pelo site (contatos, parceiros, lançamento, Store, log da administração) com RLS e papel `admin` no `app_metadata`. As migrações foram aplicadas direto no Supabase e **não** estão versionadas no repositório.
- **Funções:** edge functions do Supabase para e-mail, Google Agenda, IA dos parceiros (Gemini), lançamento e gestão de dados.
