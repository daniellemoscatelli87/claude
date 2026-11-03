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

- **Pedido da dona do produto:** depois do login, cabeçalho com o ícone DM à esquerda (o mesmo da Home do site), divisor vertical e o nome "Experience Intelligence", com "Dani Moscatelli Studio" embaixo; à direita, avatar e seta que abre a barra lateral de perfil.
- **Feito:** `src/components/Shell.tsx` (cabeçalho e barra lateral), `src/components/avatar.ts` (iniciais), `public/logo-dm-icone.png` (cópia de `public/favicon-dm.png` do site), estilos em `globals.css`. A barra lateral reúne as opções que já existiam no topo: e-mail e organização atual, troca de organização (quando há mais de uma), "Área master" (só para a master) e "Sair". Nenhuma opção nova foi criada. Sem login, o cabeçalho continua como antes.
- **Acessibilidade:** botão com `aria-expanded`, painel como diálogo com título, foco vai para o painel ao abrir e volta ao botão ao fechar; fecha com Esc, com o "×" ou tocando fora.
- **Testes:** `npm test` 31 de 31 (3 novos, iniciais do avatar); `typecheck` sem erros; `lint` 0 erros; `build` ok. Navegador com servidor simulado, 390 px: master e cliente; ícone carrega; painel abre, recebe o foco, mostra as opções certas para cada uma (cliente sem "Área master" e sem troca de organização), fecha com Esc e tocando fora, foco volta ao botão; sem rolagem lateral; nenhum erro de página.

## 2026-10-20 · Kit de UX recebido e proposta (só documentação)

- **Feito:** kit `DM_Experience_Intelligence_UX_Onboarding_Dinamico_v1.zip` copiado sem alteração para `docs/product/ux-onboarding/` (`cmp` confirmou os 4 arquivos idênticos); proposta em `docs/product/UX_ONBOARDING_PROPOSAL.md`; itens UX-1 a UX-6 no Backlog; pendência P-004 no Decision Log.
- **Achado:** as perguntas de enquadramento atuais (`src/domain/challenge/framing.ts`) são 5 perguntas fixas, iguais para todos os desafios e com exemplos de saúde, o que contraria o kit e D-003. A proposta substitui por um motor de condução por regras com protocolo versionado.
- **Código, banco e configurações:** nenhum alterado.

## 2026-10-20 · IA ligada para testes (D-023) e arquitetura revisada (só documentação)

- **IA:** antes de ligar, verificado que a lista de convidadas está vazia, que a única master é contato@danimoscatelli.com.br, que visitantes sem login não executam `ei_ai_begin`, que pessoas logadas não executam `ei_ai_finish` e que os limites estão em 3, 20 e 100. Depois, `ai_enabled = true` (20/10/2026, 19:40 UTC). Hoje a IA só faz a interpretação inicial do desafio; o plano e a análise adaptativa ainda não existem.
- **Documentos:**
  - princípio central em `PRODUCT_VISION.md` (seção 16);
  - decisões D-021, D-022 e D-023;
  - arquitetura revisada na seção 8 de `UX_ONBOARDING_PROPOSAL.md`;
  - Backlog com UX-3a, UX-3b, UX-1 e UX-4 a UX-9.
- **Código e banco:** nenhum outro alterado.

## 2026-10-21 · UX-3a, incremento 1: contexto da organização, nome obrigatório e rodapé (não publicado)

- **Banco:**
  - migração `supabase/migrations/20261021090000_contexto_organizacao.sql`, **ainda não aplicada**;
  - colunas opcionais `offering`, `org_type`, `size_band` e `context_updated_at` em `organizations`, e `job_area` em `organization_members`;
  - funções `ei_setup_organization`, `ei_update_organization_context` (só `org_admin`; a auditoria guarda só os nomes dos campos alterados) e `ei_update_my_job_area`;
  - reversão em `supabase/rollback/20261021090000_reverter.sql`.
- **Aplicação:**
  - `src/domain/organization/context.ts` (opções do kit e validações);
  - `src/application/profile.ts` (nome no perfil da conta);
  - `OrganizationForm` reescrito com a copy da tela E;
  - `NameForm` (pede o nome antes de continuar e permite editar na barra lateral);
  - nome obrigatório no cadastro;
  - página `/organizacao/`;
  - aviso na área de trabalho quando falta contexto;
  - barra lateral com nome, "Editar nome", "Informações da organização", "Área master" (só master) e "Sair";
  - rodapé "by Dani Moscatelli Studio";
  - `lucide-react` 1.52.0 (versão fixa, licença ISC).
- **Testes executados:**
  - `organization_context.sql` junto com a migração, no banco real, em transação desfeita: **OK, 6 verificações**:
    - sem convite não cria organização;
    - a convidada cria a organização com contexto;
    - valores fora da lista e textos longos são recusados;
    - a auditoria guarda só os campos alterados;
    - outra organização não lê nem altera o contexto, e ninguém escreve direto na tabela;
    - a pessoa atualiza a própria área.
  - `npm test`: 36 de 36. `typecheck`, `lint` e `build` sem erros.
  - Navegador com servidor simulado (320 e 375 px, sem rolagem lateral, nenhum erro de página):
    - cadastro recusa conta sem nome;
    - conta sem nome é levada a "como podemos chamar você?";
    - a organização é criada com os campos certos e segue para o desafio;
    - o aviso de contexto incompleto aparece;
    - a barra lateral mostra o nome, sem o e-mail;
    - a edição chama as duas funções e mostra "Informações salvas.".

## 2026-10-21 · Cadastro em etapas e perfil pessoal (D-025), não publicado

- **Banco:**
  - migração `supabase/migrations/20261021100000_perfil_pessoal.sql`, **não aplicada**;
  - tabela `ei_profiles`, sem leitura direta;
  - funções `ei_cpf_valido`, `ei_validar_perfil`, `ei_my_profile` (CPF mascarado) e `ei_save_my_profile`;
  - gatilho `ei_capturar_cadastro` em `auth.users`: só age com a chave `ei_signup`; grava o perfil e limpa os metadados;
  - reversão em `supabase/rollback/20261021100000_reverter.sql`;
  - mensagens das funções de 20261021090000 trocadas para "empresa ou negócio".
- **Aplicação:**
  - `src/domain/profile/personal.ts` (as mesmas regras do banco, máscaras de CPF e telefone);
  - `src/application/profile.ts` (cadastro, reenviar confirmação, salvar perfil, trocar e-mail e senha);
  - `PersonalForm` (cadastro, completar e editar), `Etapas` (indicador "Etapa X de 2"), login com a copy da tela C e mostrar senha;
  - páginas `/cadastro/` e `/perfil/`;
  - a área logada pede os dados pessoais (etapa 1) e depois a empresa ou negócio (etapa 2);
  - primeiro acesso com "Seu primeiro desafio começa aqui";
  - barra lateral com "Meus dados" e "Empresa ou negócio";
  - a master não precisa do perfil;
  - `NameForm` removido.
- **Testes executados:**
  - `personal_profile.sql` junto com a migração, no banco real, em transação desfeita: **OK, 8 verificações**:
    - CPF validado pelos dígitos verificadores;
    - o cadastro grava o perfil e só o nome fica nos metadados (CPF fora do token);
    - CPF repetido e menor de 18 anos são recusados;
    - contas do site não são afetadas;
    - a pessoa vê o próprio CPF mascarado, e ninguém lê a tabela direto;
    - a edição mantém o CPF quando ele fica em branco;
    - outra conta não vê nem reaproveita CPF, e conta antiga completa o perfil;
    - visitante sem login não acessa perfis.
  - `npm test`: 43 de 43. `typecheck`, `lint` (0 erros) e `build` (8 páginas) ok.
  - Navegador com servidor simulado (320 e 375 px, sem rolagem lateral, nenhum erro de página):
    - erros aparecem junto de cada campo e somem ao editar;
    - máscaras de CPF e telefone funcionam;
    - o envio leva os dados em `ei_signup`, só com dígitos;
    - aparecem a tela "Falta só confirmar seu e-mail" e o reenvio;
    - conta sem perfil passa por etapa 1, etapa 2 e primeiro desafio;
    - "Meus dados" mostra o CPF mascarado e envia CPF vazio ao manter, e a troca de e-mail funciona;
    - a master não é levada à etapa 1.
- **Não testado:** cadastro real com envio de e-mail (depende de aplicar a migração e publicar).

## 2026-10-21 · Cadastro com os padrões do site e início do design system (não publicado)

- **Pedido da dona do produto:**
  - "Crie sua conta" como título, acima da barra de progresso;
  - "Seus dados" como nome da etapa, abaixo da barra;
  - "Etapa 1 de 2" sem repetir o nome da etapa;
  - telefone, e-mail, estado e cidade com os mesmos padrões dos formulários de parceiros e de contato;
  - senha com confirmação, medidor de força e visualização;
  - rodapé igual ao do site, com copyright.
- **Feito:**
  - `src/design-system/` (`padroes.ts` e `campos.tsx`) e `docs/design-system/COMPONENTES.md`;
  - `PersonalForm`, `AuthForm`, `/cadastro/`, `/perfil/` e a etapa 2 passam a usar esses componentes;
  - `Etapas` substituído por `BarraProgresso`;
  - rodapé com copyright no lugar de "by Dani Moscatelli Studio" (substitui o rodapé de D-022);
  - script `scripts/copiar-municipios.mjs` no `prebuild`, que copia as cidades do site (`public/data/` do app fica fora do Git);
  - senha passa a exigir letras e números, além de 8 caracteres.
- **Testes:** `npm test` 47 de 47 (4 novos dos padrões); `typecheck`, `lint` (0 erros) e `build` ok. Navegador com servidor simulado (320 e 375 px, sem rolagem lateral, nenhum erro):
  - ordem título → barra → etapa;
  - mensagens de erro iguais às do site;
  - cidade bloqueada até escolher o estado (400 cidades do PR carregadas);
  - máscara de telefone;
  - 4 sugestões de e-mail;
  - força Fraca → Média → Forte;
  - "As senhas não são iguais.";
  - a confirmação da senha não é enviada;
  - rodapé com copyright;
  - etapa 2 com "Crie sua conta", "Etapa 2 de 2" e "Empresa ou negócio";
  - "Meus dados" carrega estado, cidade e telefone.

## 2026-10-21 · P-007: cadastro sem CPF, maioridade, aviso de privacidade e CNPJ (D-027), não publicado

- **Banco** (migrações ajustadas, ainda **não aplicadas**):
  - `20261021100000_perfil_pessoal.sql`:
    - `ei_profiles` sem CPF e sem data de nascimento;
    - com `adult_declared_at`, `privacy_notice_version` e `privacy_accepted_at`;
    - o gatilho exige maioridade declarada e a versão do aviso, e retira dos metadados telefone, estado e cidade;
    - `ei_save_my_profile` exige os aceites só ao criar o perfil.
  - `20261021090000_contexto_organizacao.sql`:
    - `organizations.cnpj` único, com 14 dígitos;
    - `ei_cnpj_valido` e `ei_cnpj_normalizado`;
    - CNPJ repetido gera mensagem orientando a pedir convite;
    - a auditoria registra "cnpj" como campo alterado, sem o valor.
  - Reversões atualizadas.
- **Aplicação:**
  - `src/domain/privacy/aviso.ts` (texto e versão do aviso), `AvisoPrivacidade`, página `/aviso-de-privacidade/`;
  - `PersonalForm` sem CPF e sem data de nascimento, com as caixas "Declaro que tenho 18 anos ou mais" e "Li e aceito o aviso de privacidade";
  - o aviso abre numa janela sobre o formulário, e "Meus dados" mostra a versão e a data do aceite;
  - campo CNPJ opcional na empresa ou negócio;
  - design system com `CampoCnpj`, `CampoConfirmacao` e `Janela`.
- **Testes executados:**
  - no banco real, com as migrações em transação desfeita:
    - `personal_profile.sql`: **OK, 8 verificações** (perfil, maioridade e aceite gravados com versão; só o nome nos metadados; recusa sem maioridade, sem aceite ou com telefone inválido; contas do site intactas; sem colunas de CPF e de nascimento; leitura só do próprio perfil; edição mantém o aceite; conta antiga só completa com os aceites; visitante sem acesso);
    - `organization_context.sql`: **OK, 7 verificações** (com CNPJ inválido recusado, normalizado, único, sem CNPJ possível, CNPJ fora da auditoria);
  - `npm test`: 48 de 48; `typecheck`, `lint` (0 erros) e `build` ok;
  - navegador com servidor simulado (320 e 375 px, sem rolagem lateral, nenhum erro):
    - sem campos de CPF e de nascimento;
    - os aceites são exigidos;
    - a janela do aviso abre e fecha com Esc;
    - o envio leva `adult_declared` e a versão do aviso;
    - o CNPJ tem máscara, recusa dígito errado e é enviado só com dígitos;
    - "Meus dados" mostra o aceite e não reenvia aceites na edição.

## 2026-10-21 · Landing: 7 melhorias da revisão de UI/UX aplicadas (não publicado)

- Detalhes em `docs/product/LANDING_REVISAO_UIUX.md`. Arquivos: `globals.css`, `Landing.tsx`, `landing/Interativos.tsx`.
- Verificado: `tsc`, `oxlint` (sem erros), build; contraste medido em todos os textos da landing (só o logotipo abaixo de 4,5:1); áreas de toque ≥ 44 px (exceto link dentro de frase); navegador a 320, 375, 430 e 1280 px sem rolagem lateral e sem erros; todas as interações retestadas.
- A dona do produto não gostou do design geral (densa, pouco fluida, pouca variação de componentes): redesenho em proposta.

## 2026-10-21 · Landing comercial v1, recuperação de senha e GA4 com consentimento (D-031, não publicado)

- Arquivos: `src/components/Landing.tsx`, `src/components/landing/{conteudo.ts,Cabecalho.tsx,Interativos.tsx}`, `src/components/AvisoCookies.tsx`, `src/infrastructure/analytics.ts`, `src/app/{entrar,recuperar-senha,redefinir-senha}/page.tsx`, `src/components/AuthForm.tsx` (textos), `src/components/Shell.tsx` (props `largo` e `medir`), `src/application/profile.ts` (`requestPasswordReset`), `src/app/layout.tsx` (Open Graph e marcação de sessão salva), `src/app/page.tsx`, `src/app/cadastro/page.tsx`, `globals.css` (`.lp-*`, `.cookies`). Sem mudança em banco, funções, IA ou regras de acesso.
- Verificado:
  - `tsc`, `oxlint` (sem erros), `vitest` 49 de 49, build estático com as rotas novas;
  - navegador a 320, 375, 430 e 1280 px: sem rolagem lateral, um único H1, sem "—", nenhuma chamada externa sem consentimento;
  - interações: ciclo do hero, sintomas pelo teclado (setas), stepper com Próxima/Anterior e selo "Visão do funcionamento planejado • Em desenvolvimento" nas etapas 2 a 5, trilha de entregáveis com "Explorar outro entregável", filtros (estado inicial, só público, par sem exemplo, par com exemplo e o botão que abre a aba certa da demonstração), "Ver exemplo" nos diferenciais, FAQ com uma resposta aberta por vez, menu do celular (abre, Esc fecha, fecha ao navegar);
  - sem JavaScript: a landing aparece completa;
  - recuperação de senha com o Supabase simulado: envia só o e-mail, mensagem sempre igual; `/redefinir-senha/` sem link válido mostra "O link expirou ou já foi usado";
  - GA4 com ID de teste: nada carrega antes de "Aceitar"; "Recusar" não carrega; depois de aceitar, `page_view` sem o token do link de senha; "Preferências de cookies" reabre o aviso. Build final sem ID: nenhum aviso de cookies;
  - regressão: cadastro completo (320 e 375 px), barra lateral sem e-mail e busca na cidade continuam funcionando.
- Não testado: envio real do e-mail de recuperação e GA4 real (dependem do Supabase e do ID de medição da dona do produto).

## 2026-10-21 · Landing page pública e página Entrar (D-030, não publicado)

- `src/components/Landing.tsx` (11 seções, dados com fonte), `src/app/entrar/page.tsx` (formulário de entrar; com sessão volta ao início), `src/app/page.tsx` (sem login mostra a landing), `src/components/Shell.tsx` (props `largo` e `publico`: "Entrar" e "Criar conta" no cabeçalho), links "Entrar" do cadastro para `/entrar/`, estilos `.lp-*` em `globals.css`. A Tela A anterior foi substituída.
- Verificado: `tsc`, `oxlint` (sem erros), `vitest` 49 de 49, build (rota `/entrar` gerada). Navegador a 320, 375 e 1280 px: sem formulário na landing, 6 cards de dados, sem "—" e sem placeholders, FAQ abre, tabela no computador e cartões no celular, "Entrar" leva a `/entrar/` com o formulário, "Criar conta" leva ao cadastro, sem erros e sem rolagem lateral.

## 2026-10-21 · Busca digitando na cidade (não publicado)

- Pedido da dona do produto (corrigido por ela: só a cidade; o estado segue como lista): novo `CampoBusca` em `src/design-system/campos.tsx`, usado na cidade de `CampoEstadoCidade`; `buscaNormalizada` em `padroes.ts`; estilos `.busca*` em `globals.css`.
- Verificado: `tsc`, `oxlint` (sem erros), `vitest` 49 de 49 (1 teste novo da busca), build. Navegador a 375 px: "curi" mostra Curitiba e Curiúva; texto sem resultado avisa e volta para a cidade anterior ao sair; nome digitado completo é aceito; trocar o estado limpa a cidade; sem erros e sem rolagem lateral. Fluxo completo do cadastro (320 e 375 px) envia `state` PR e `city` Curitiba.

## 2026-10-21 · Tela de entrada com a proposta de valor (Tela A do kit de UX, não publicado)

- Pedido da dona do produto: a tela de entrada não trazia o contexto do produto. Aplicada a Tela A de `docs/product/ux-onboarding/02-COPY-COMPLETA-E-COMPONENTES.md` com os textos do kit: eyebrow, título, descrição, 3 microcartões (`Target`, `Compass`, `TrendingUp`), "Entrar na plataforma" (leva ao formulário na mesma página), "Criar minha conta" (/cadastro/) e selo "Acesso por convite nesta fase". O formulário de entrar continua abaixo. Rodapé mantido como o do site (pedido anterior da dona do produto), no lugar da assinatura do kit.
- Arquivos: `src/app/page.tsx`, `src/components/AuthForm.tsx`, `src/app/globals.css`.
- Verificado: `tsc`, `oxlint` (sem erros), `vitest` 48 de 48, build e navegador a 320, 375 e 1024 px, sem erros e sem rolagem lateral.

## 2026-10-21 · E-mail escondido na barra lateral (não publicado)

- Pedido da dona do produto: na barra lateral de perfil, esconder o e-mail. Mostra o nome da pessoa e, abaixo, a empresa; sem nome cadastrado (ex.: conta master), só a empresa. `src/components/Shell.tsx`.
- Verificado: `tsc`, `oxlint` (sem erros), `vitest` 48 de 48, build e navegador a 375 px (master e cliente): nenhum e-mail no painel, sem erros.

## 2026-10-21 · Cadastro aprovado: migrações aplicadas (D-029)

- Aplicadas no Supabase: `20261021090000_contexto_organizacao.sql` e `20261021100000_perfil_pessoal.sql` (antes: colunas novas ausentes, sem `ei_profiles`, nenhum gatilho em `auth.users`).
- Testes no banco real, em transação desfeita: `organization_context.sql` 7 de 7 e `personal_profile.sql` 8 de 8. Conferido depois: nenhum usuário de teste nem perfil ficou gravado.
- Avisos de segurança do Supabase: os mesmos tipos de antes (funções do banco chamáveis por quem está logado, por desenho, com as verificações dentro de cada função; tabelas sem políticas porque o acesso é só por funções). Proteção contra senhas vazadas segue desligada (recurso do plano pago).

## 2026-10-21 · Ícone nos títulos das etapas do cadastro

- Pedido da dona do produto: ícone vermelho sobre base quadrada rosa clara, com cantos arredondados, ao lado do título de cada etapa.
- Novo componente `TituloEtapa` (`src/design-system/campos.tsx`), classes `.etapa-cabecalho` e `.etapa-icone` (`globals.css`): 44 px, cantos de 12 px, fundo `--red-tint`, ícone `--red`. "Seus dados" usa `UserRound`; "Empresa ou negócio" usa `Building2`. Documentado em `docs/design-system/COMPONENTES.md`.
- Verificado: `tsc --noEmit`, `oxlint` (sem erros; 2 avisos antigos), `vitest` (48 de 48), `npm run build`, teste no navegador a 320 e 375 px sem erros e sem rolagem lateral.

## 2026-11-03 · FindLook: Mascote & Ilustrações na hierarquia completa, com a folha canônica da Nyx (publicado: FindLook v35)

- **Origem:** dona do produto: hierarquia sugerida (Brand Identity › Mascot & Illustrations › Character/Master, Expressions & Poses, Illustration Style, Empty States, Error States, Usage Guidelines, Assets & Naming), textos de "Sobre o mascote", princípios de utilização, diretrizes de aplicação e governança, e a folha canônica da Nyx (personagem oficial, turnaround, cinco expressões, elementos e proporções, paleta base).
- **Verificação prévia (D-041):** `main` remota igual à local.
- **Feito** (commit `8e71d18` FindLook): item do menu renomeado para "Mascote & Ilustrações" com sete subitens na ordem sugerida. `public/mascote/` com a folha canônica (WebP e PNG) e cinco painéis recortados dela (master, turnaround, expressões, elementos, paleta). Página: (1) Personagem: texto "Sobre o mascote" da dona do produto, retrato, turnaround, elementos, paleta e tabela mapeando a paleta do personagem para os tokens (pelagem grafite-950, óculos e lenço `--primary`, branco, sombra grafite-200), download da folha; (2) Expressões e poses: as cinco expressões com quando usar e qual cena da biblioteca usa cada uma ("Radiante" ainda sem cena), poses em uso e o que não é permitido; (3) Estilo; (4) Estados vazios (três cenas) e (5) Estados de erro (404), cada cena com nome, expressão, imagem, visão web, visão mobile, onde/quando e como não usar; (6) Diretrizes de uso: os seis princípios, as diretrizes de aplicação e a governança no texto dela; (7) Ativos e nomenclatura: regra `findlook-<contexto>-<estado>` e `nyx-<parte>`, tabela de todos os arquivos. Changelog. Logo e cores/tipografia da hierarquia sugerida já existem como seções próprias (Marca e Fundamentos) e não foram movidas.
- **Hipótese registrada:** a folha cita `#0D1119` e `#FF0A5A` como cores do personagem; no produto a documentação manda usar os tokens (grafite-950 `#000000` e pink-500 `#E62040`), para a mascote seguir a paleta oficial. A dona do produto decide se a folha deve ser regerada nessas cores.
- **Verificação:** build sem erros; nenhuma imagem quebrada; capturas de Personagem, Expressões, Diretrizes e Ativos; recorte do turnaround refeito para não pegar a etiqueta. A primeira execução do workflow foi bloqueada pelo guardião de versões: seis itens "sumiram" em relação à v34 (os cinco subitens antigos do menu e a âncora `ilustracoes-estilo`, substituídos pelos sete novos; nenhuma seção ou componente removido). Conferido o diff de inventário v34→v35 e republicado com `aceitar_remocoes`; FindLook v35 no ar, folha canônica respondendo 200 no GitHub Pages.

## 2026-11-03 · FindLook: seção Ilustrações reconstruída em torno da mascote Nyx (publicado: FindLook v34)

- **Origem:** dona do produto ("a seção de ilustrações da marca precisa ser melhor construída explicando que é parte da identidade da marca, mascote gata preta Nyx; os títulos das imagens precisam melhorar; deixar mais simples: nome, imagem, visão web, visão mobile, onde/quando usar e como não usar").
- **Verificação prévia (D-041):** `main` remota igual à local; a mascote não estava documentada em lugar nenhum (nome Nyx informado agora pela dona do produto).
- **Feito** (commit `d7e10b0` FindLook): `IllustrationsShowcase.tsx` reescrito. Abertura "Ilustrações e a mascote Nyx": as ilustrações como parte da identidade da marca ao lado do símbolo, cores e tipografia; retrato da Nyx e seis cards (quem ela é, marca registrada: óculos escuros pink e lenço pink, seu mundo: pin com cabide e peças de moda, estilo, onde aparece, onde não aparece). Títulos das peças revisados para o momento que representam: "Página não encontrada (404)", "Favoritos ainda vazios", "Nenhuma loja seguida", "Nenhum contato com lojas" (também no menu). Cada peça com a estrutura pedida: nome, imagem (WebP/PNG, dimensões, texto alternativo com a Nyx nomeada), visão web e visão mobile (esqueleto de estado vazio com título, texto de apoio e ação, textos marcadores), onde/quando usar e como não usar (regras específicas da peça, ex.: 404 não serve para erro 500; favoritos vazio não serve para "nenhum resultado"; lojas seguidas não vai na lista de busca porque os botões "+ Seguir" parecem clicáveis). Catálogo com links. Changelog.
- **Verificação:** build sem erros; capturas no claro e no escuro da abertura, do catálogo e de uma peça completa; sem erros de JavaScript. Workflow concluído; FindLook v34 no ar, conferido no pacote publicado.

## 2026-11-03 · FindLook: ilustração "Contatos com lojas vazios" (publicado: FindLook v33)

- **Origem:** dona do produto, com a imagem (WebP 1536×1024, fundo transparente): "para a tela vazia do consumidor 'Seus contatos com lojas', representando que nenhum contato ainda foi feito".
- **Verificação prévia (D-041):** `main` remota igual à local e nenhuma ilustração de contatos existente.
- **Feito** (commit `d35f44e` FindLook): `public/ilustracoes/findlook-contatos-vazio.webp` e `.png`; quarta entrada na seção Ilustrações (uso, arquivo, dimensões, fundo, texto alternativo, elementos: gato com celular na pata, balão de pensamento com vestido no cabide, sacola), subitem no menu, catálogo e changelog.
- **Verificação:** build sem erros; imagem carregada no navegador (1536×1024) e captura da seção; sem erros de JavaScript. Workflow concluído; FindLook v33 no ar, arquivo respondendo 200 no GitHub Pages.

## 2026-11-03 · FindLook: ilustração "Lojas seguidas vazias" (publicado: FindLook v32)

- **Origem:** dona do produto, com a imagem (WebP 1536×1024, fundo transparente): "para a página vazia de lojas seguidas na área logada do consumidor".
- **Verificação prévia (D-041):** `main` remota igual à local e nenhuma ilustração de lojas seguidas existente.
- **Feito** (commit `d482e72` FindLook): `public/ilustracoes/findlook-lojas-seguidas-vazio.webp` e `.png`; terceira entrada na seção Ilustrações (uso, arquivo, dimensões, fundo, texto alternativo, elementos: três vitrines com o pin da marca no telhado e botões "+ Seguir", gato pensativo), subitem no menu, catálogo e changelog.
- **Verificação:** build sem erros; imagem carregada no navegador (1536×1024) e captura da seção; sem erros de JavaScript. Workflow concluído; FindLook v32 no ar, arquivo respondendo 200 no GitHub Pages.

## 2026-11-03 · FindLook: ilustração "Favoritos vazios" (publicado: FindLook v31)

- **Origem:** dona do produto, com a imagem (WebP 1448×1086, fundo transparente): "para a página de favoritos da área logada do consumidor, quando não há favoritos adicionados ainda".
- **Verificação prévia (D-041):** `main` remota igual à local (nenhum commit novo da outra conversa) e nenhuma ilustração de favoritos existente.
- **Feito** (commit `223c628` FindLook): `public/ilustracoes/findlook-favoritos-vazio.webp` e `.png`; segunda entrada na seção Ilustrações (uso, arquivo, dimensões com proporção calculada por peça, fundo, texto alternativo, elementos, faça/não faça, código), subitem no menu, catálogo e changelog atualizados; a regra de proporção passou de "3:2" fixo para "proporção original".
- **Verificação:** build sem erros; imagem carregada no navegador (1448×1086) e captura da seção; sem erros de JavaScript. Workflow concluído; FindLook v31 no ar, arquivo respondendo 200 no GitHub Pages.

## 2026-11-03 · FindLook: seção Ilustrações com a ilustração da página 404 (publicado: FindLook v30)

- **Origem:** dona do produto ("Você vai criar uma seção de ilustrações, e essa seção é apenas no design system da FindLook. Estou enviando a primeira ilustração, que é para a página 404"), com a imagem (WebP 1536×1024, fundo transparente: 404 com o pin da marca e o cabide no lugar do zero, gato de óculos escuros numa sacola pink, botas).
- **Feito** (commit `bc9228a` FindLook): `IllustrationsShowcase.tsx` no grupo Marca, item "Ilustrações" (subitens Estilo e Página 404): estilo observado na peça (formas chapadas, paleta pink/grafite/branco, pin com cabide, gato, peças de moda), aviso de que as ilustrações são fornecidas pela dona da marca e não geradas no produto, catálogo com status. A peça: `public/ilustracoes/findlook-404.webp` (original) e `.png` (convertido), prévia sobre superfície branca nos dois temas (o gato e o número são grafite), botões de download, tabela de atributos (uso, arquivo, dimensões, fundo, texto alternativo, elementos), faça/não faça e código de uso. Changelog. Nada no DM.
- **Integração:** a outra sessão (produto FindLook) havia mesclado na `main` do DS o PR #1 (componente `IconeModa` em `ui/fashion-icons.tsx` e seção em Ícones); o commit das ilustrações foi rebaseado sobre ele, com conflito só no changelog, resolvido mantendo as duas entradas.
- **Verificação:** build sem erros; imagem carregada no navegador nos dois temas (1536×1024) e capturas da seção; sem erros de JavaScript. Workflow concluído; FindLook v30 no ar, arquivo da ilustração respondendo 200 no GitHub Pages.

## 2026-11-02 · FindLook: textura doodle só com peças de moda (publicado: FindLook v29)

- **Origem:** dona do produto, em duas mensagens: a textura do FindLook tem que ter especificamente vestido, calça, boné, óculos de sol, sandália, tênis e camiseta; depois "inclua saia, e não coloque outros elementos juntos, tem que ficar visível que é algo sobre moda".
- **Feito** (commits `2286ce1` e `42ae92e` FindLook; `dccfcd7` e `e8f643f` DM só sincronizam o gerador): a textura do FindLook passou a ter exatamente oito peças (vestido, calça, saia, boné, óculos de sol, sandália, tênis e camiseta), sem nenhum outro ícone e sem os preenchimentos decorativos (pontos, estrelas). Boné e sandália foram desenhados; a saia foi redesenhada com cós e pregas para ler melhor em tamanho pequeno. Arquivos SVG (claro, escuro, primária, traço) e PNG regerados; descrição na seção Backgrounds, comentário do componente e changelog atualizados. A textura do estúdio não muda. O primeiro commit (sete itens com peso dobrado, mantendo os demais) foi substituído pelo segundo após a segunda mensagem.
- **Verificação:** prova dos desenhos isolados em 64 px (os sete pedidos legíveis), prévia do ladrilho 2×2 nos dois temas lendo como moda à primeira vista, build sem erros. Workflow concluído; FindLook v29 no ar, arquivo de textura novo conferido no GitHub Pages.

## 2026-11-02 · Cards de vidro: área de teste com ícones pequenos e alerta de contraste (publicado: DM v23 e FindLook v28)

- **Origem:** dona do produto ("remova esses fundos multicolor, deixe um fundo com ícones pequenos; a ideia da área de teste é testar transparência/opacidade e legibilidade de título e subtítulo dentro de cards; notifique com um alerta no card quando os níveis de acessibilidade ficarem comprometidos de acordo com a configuração e o fundo").
- **Feito** (commits `1c619bd` DM e `dd9369d` FindLook):
  - `GlassScene` sem blocos de cor: só a textura doodle do sistema em ícones pequenos (nova escala `xs` de 320 px no `DoodleTexture`), grafite-300 no claro e grafite-700 no escuro, sobre o fundo da página.
  - `ui/contrast.ts`: utilitários WCAG (leitura de cores, resolução de `var(--token)` pelo navegador, composição alfa, luminância, razão de contraste, mínimos AA e formatação em português).
  - `glass-card.tsx`: tabela numérica de opacidades por acabamento/tom/intensidade/tema (`glassOpacityTable`, espelho das classes) e helper `glassTextContrast`, que compõe fundo → vidro (branco ou grafite-950 na opacidade) → tingimento e devolve as razões e o veredito do título (3:1) e do subtítulo (4,5:1); arredonda a uma casa para bater com o número exibido.
  - Documentação: `GlassTestCard` na seção Cards glassmorphism: título, subtítulo e ação reais sobre o vidro; avaliação sempre visível ("Contraste OK" com as razões) que vira alerta (`role="alert"`, borda âmbar, ícone de atenção, razões abaixo do mínimo em vermelho) quando a configuração compromete. A medição é no **pior caso**: o texto cruzando um traço da textura através do vidro, não a média da cena (sobre página branca a média não variava com a opacidade). Vale para os dois cards do seletor e para as quatro amostras de acabamento.
- **Verificação:** builds sem erros; no navegador (FindLook): claro/translúcido subtítulo 3,0:1 (alerta), fosco 4,5:1 (OK), opacidade livre 10 % 2,8:1 (alerta), tom escuro 10 % título 2,6:1 (alerta); escuro/translúcido 5,3:1 (OK), fosco 4,0:1 (alerta); sem erros de JavaScript. Duas correções durante o teste: limite da opacidade no helper (`min(1, pct)` em vez de `min(100, pct)`, que zerava o efeito) e veredito calculado sobre o valor arredondado. Workflows concluídos; DM v23 e FindLook v28 conferidos no ar.

## 2026-11-02 · FindLook: escala de grafite rebalanceada (D-040; publicado: FindLook v26)

- **Origem:** dona do produto, com quatro amostras do balanço desejado (`#000000`, `#19191c`, `#2c2c33`, `#3e3e46`).
- **Feito** (commit `2f87928` FindLook): `theme.css` com grafite-800 `#2C2C33`, grafite-900 `#19191C` e grafite-950 `#000000`; valores fixos equivalentes (hex e `rgba`) substituídos em 19 arquivos de documentação e exemplos, mantendo o histórico do changelog e os SVGs do logo (`#060608`); nota na seção Marca ("Preto Grafite" agora `#000000`, com a observação sobre o vetor); entrada no changelog. DM sem alteração (decisão registrada em D-040).
- **Verificação:** build sem erros; tokens computados no navegador no tema escuro (`--graphite-950: #000`, `--background: #000`, `--card: #19191ccc`); capturas da paleta nos dois temas mostrando a escala nova. Workflow concluído; FindLook v26 no ar com `--graphite-950: #000` conferido no CSS publicado.

## 2026-11-02 · Fundos neutros de demonstração dos cards de vidro (publicado: DM v21 e FindLook v25)

- **Origem:** dona do produto: o fundo com degradê, textura rosa e cinza juntos não deixava avaliar transparência e opacidade dos cards de vidro; o foco da seção é mostrar configurações e aplicações.
- **Feito** (commits `ff90d58` DM e `2618c87` FindLook): o `GlassScene` perdeu gradientes e manchas. Agora usa o fundo da página e três fundos neutros escolhíveis (`backdrop`): **blocos de cor** (padrão: quatro faixas sólidas da paleta — primária, grafite-900, âmbar, grafite-300; no escuro grafite-100 e grafite-600 — com duas linhas de texto nítido atrás, uma branca e uma grafite-950), **texto** (linhas de título nítidas na cor do texto) e **textura** (textura doodle em grafite-400). Com isso dá para ver quanta cor atravessa o vidro (opacidade) e quão nítido fica o que está atrás (desfoque). Seletor "Fundo" no painel da seção; a regra "Fundo" da tabela foi reescrita. Vale para o seletor, as intensidades, o bloco escuro e as amostras.
- **Verificação:** builds sem erros; capturas no claro com os três fundos (blocos + translúcido, texto + fosco, textura + cristal), sem erros de JavaScript. Workflows concluídos; DM v21 e FindLook v25 conferidos no ar.
- **Correção (commits `b9c5219` DM e `11a6e4a` FindLook):** a dona do produto reprovou a versão com blocos de cor atrás dos cards com conteúdo ("ficou horrível, não tem usabilidade, acessibilidade"): o texto dos cards ficava ilegível sobre as faixas. A seção foi reorganizada em duas partes: **aplicação** (cards com conteúdo sobre a textura doodle discreta do sistema, grafite-300 no claro e grafite-700 no escuro, legíveis) e **amostra** (um vidro sem conteúdo sobre blocos de cor e texto nítido, com rótulo fora do vidro, para comparar opacidade e desfoque). O seletor de fundo saiu; as quatro amostras de acabamento também viraram vidros sem texto com rótulo abaixo; intensidades e bloco escuro voltaram para a textura. Conferido no claro e no escuro no FindLook; publicado como DM v22 e FindLook v27 (ver abaixo).
- **Pendente de decisão da dona do produto:** escala de cinza — ela apontou distância grande entre grafite-900 e grafite-950 e pediu um cinza mais escuro antes do preto, ou revisão da paleta. No DM os passos são regulares (900 `#131A27`, 950 `#0D1119`); no FindLook há o salto (900 `#1D1D20`, 950 `#060608`, que é o grafite oficial do vetor). Opções apresentadas a ela; nada alterado até a decisão.

## 2026-11-02 · Card de vidro com controle livre de opacidade e desfoque nos dois design systems (publicado: DM v19 e FindLook v23)

- **Origem:** dona do produto ("Permita que a pessoa controle o nível de transparência e opacidade do card de acordo com o desejo dela").
- **Feito** (commits `a854664` DM e `15d9d98` FindLook): `GlassCard` ganhou as props numéricas `opacity` (0 a 100 %, opacidade do fundo do vidro: 0 totalmente transparente, 100 sólido) e `blur` (0 a 80 px de desfoque), que sobrepõem o acabamento escolhido. Implementadas com `color-mix` sobre branco (vidro claro) ou grafite-950 (vidro escuro) e `backdrop-filter` em linha, com limites aplicados. Sem elas, o card segue o acabamento como antes.
- **Documentação:** no seletor da seção Cards glassmorphism, dois sliders (componente Slider do sistema) de opacidade do fundo e de desfoque, com valor ao vivo ("do acabamento" enquanto não mexidos), aplicados aos dois cards de demonstração; a linha de código do card interativo passa a mostrar `opacity={…} blur={…}`; botão "Voltar ao acabamento" limpa os dois; linha de tokens e exemplo de código; changelog nos dois.
- **Verificação:** builds sem erros; teste no navegador: sliders pelo teclado levaram a opacidade a 10 % e o desfoque a 0 px, o estilo em linha do card acompanhou (`color-mix … 10%`, `blur(0px)`), o código exibido refletiu os valores e o botão de voltar removeu o estilo livre; sem erros de JavaScript. Workflows concluídos; DM v19 e FindLook v23 conferidos no ar.
- **Complemento (commits `6fa5703` DM e `404eb59` FindLook):** a dona do produto apontou que o fundo claro estava lavado e não deixava ver o efeito do vidro. A cena clara do `GlassScene` ficou contrastada de propósito: manchas fortes da primária (80%), do âmbar `--warning` (90%), do grafite-800 (70%) e do chart-2, com desfoque menor nas manchas, e textura doodle em grafite-500; a cena escura ficou como estava. Conferido no claro nos dois DS: as quatro amostras de acabamento agora se distinguem e o vidro clareia e desfoca o fundo de forma visível.

## 2026-11-01 · Cenas do vidro com textura e cores do DS, só do tema ativo; nome no card da textura (publicado: DM v17 e FindLook v21)

- **Origem:** dona do produto ("Use texturas e cores do próprio DS para construir os exemplos; se o light mode está ativado não mostrar nada que seja do dark mode. E o background de ícones está sem nome").
- **Feito** (commits `80aed74` DM e `4aba5a2` FindLook): o `GlassScene` (fundo de demonstração dos cards de vidro) trocou as linhas diagonais improvisadas pela textura doodle do próprio DS, mantém só manchas de cor dos tokens (primária, warning, chart-2) e passou a seguir o tema: no modo claro nenhuma cena escura aparece; o bloco "Vidro escuro (tom escuro)" mostra o vidro grafite sobre a cena clara da marca e, no modo escuro, sobre a escura. Para isso o vidro escuro ficou mais opaco no tema claro (valores originais no escuro), o tingimento `tint` virou uma camada em vez de substituir o fundo do vidro (bug: no tom escuro o fundo grafite sumia) e os textos secundários dos exemplos ficam brancos no tom escuro em qualquer tema. Em Backgrounds, o card "Textura doodle" ganhou cabeçalho com nome e etiqueta SVG, como os demais fundos.
- **Verificação:** builds sem erros; capturas no claro e no escuro da seção de vidro (seletor em tom escuro, bloco de vidro escuro) e do card da textura, sem erros de JavaScript. Workflows concluídos; DM v17 e FindLook v21 conferidos no ar.
- **Complemento (commits `b28de9d` DM e `acd26cf` FindLook):** a dona do produto pediu que o bloco "Vidro escuro (tom escuro)" não apareça no modo claro; ele passou a ser exibido só com o tema escuro ativo (`hidden dark:block`), conferido no navegador nos dois temas (display none no claro, block no escuro).

## 2026-11-01 · Cards glassmorphism com acabamentos (graus de transparência) nos dois design systems (publicado: DM v16 e FindLook v20)

- **Origem:** dona do produto ("o card glassmorphism precisa ter graus de transparência para o usuário escolher qual ele quer: bem transparente translúcido, transparente fosco, transparente com foco de luz etc").
- **Feito** (commits `2c5600c` DM e `751a165` FindLook): `GlassCard` ganhou a prop `finish` com cinco acabamentos: `padrao` (o anterior), `translucido` (desfoque de 2 px, branco 10/18/28%, o fundo aparece inteiro), `fosco` (desfoque de 64 px, branco 60/72/84%, sem fio de luz: o mais legível), `luz` (desfoque de 24 px, branco 35/48/62% mais foco de luz radial no canto superior esquerdo e brilho interno) e `cristal` (desfoque de 12 px, branco 22/32/44%, borda branca a 90% e reflexo diagonal). Cada acabamento combina com `tone` (vidro claro ou escuro) e `intensity` (leve/média/forte), que dentro do acabamento controla a opacidade. No tom escuro e no tema escuro, foco de luz e reflexo são mais suaves. Nenhuma cor nova.
- **Documentação:** bloco "Acabamentos — graus de transparência" no início da seção Cards glassmorphism, com seletor interativo feito com o controle segmentado (acabamento, tom, opacidade) aplicando a escolha na hora em dois cards (um interativo e um com `tint` e a descrição do acabamento), amostra dos quatro acabamentos lado a lado, tokens dos acabamentos na tabela e código atualizado. Changelog nos dois.
- **Verificação:** builds sem erros; capturas de cada acabamento no claro e do cristal no tom escuro, sem erros de JavaScript; um ajuste: o reflexo do cristal e o foco de luz no tom escuro estavam fortes demais e foram suavizados. Workflows concluídos; DM v16 e FindLook v20 conferidos no ar.

## 2026-11-01 · Textura doodle na seção Backgrounds dos dois design systems (publicado: DM v14 e FindLook v18; ajuste da demonstração em DM v15 e FindLook v19)

- **Origem:** dona do produto, com imagem de referência (papel de parede escuro com ícones de traço): textura em claro e escuro para a seção de backgrounds; no DS do estúdio os elementos remetem a pesquisa, inovação, UX, UI, usuário, jornada, post-it e design thinking; no FindLook, a peças de roupa e acessórios (calça, saia, cropped, vestido, salto, anel, colar, óculos…). Correção dela durante o trabalho: "não é para os ícones ficarem transparentes" → traços em cor sólida.
- **Feito** (commits `de1e78f` DM e `df5d242` FindLook):
  - `scripts/gerar-texturas.mjs`: gera um ladrilho SVG de 800 px sem emenda (grade de 10×10 com linhas alternadas deslocadas, tamanho 40–64 px, rotação e deslocamento aleatórios com semente fixa; o que cruza a borda reaparece do outro lado) a partir de ícones do Lucide, lidos do pacote instalado, e de desenhos próprios no mesmo estilo (DM: duplo diamante, jornada, wireframe, persona, post-it, teste A/B, fluxo, protótipo, mapa de empatia…; FindLook: cabide, calça, saia, cropped, vestido, salto, anel, colar, brinco, bolsa, chapéu, bota, tênis, batom, perfume, laço, biquíni, pulseira, óculos de sol…). DM: 66 desenhos distintos; FindLook: 48.
  - `public/texturas/`: `-claro.svg` (grafite-200), `-escuro.svg` (grafite-800), `-primaria.svg` (crimson-200 / pink-200), `-traco.svg` (currentColor) e PNG claro e escuro de 1600 px com fundo transparente. Traços opacos, sem transparência.
  - `ui/doodle-texture.tsx`: `DoodleTexture` aplica o arquivo de traço como máscara CSS, então a cor é qualquer token sólido (padrão grafite-200 no claro e grafite-800 no escuro); escalas p/m/g (480/640/800 px); `aria-hidden`, sem eventos de ponteiro.
  - Backgrounds › "Textura doodle": prévia que segue o tema com controles de escala e de traço (neutra, forte, primária), seis botões de download, código React e CSS, regras de uso. Item no menu e changelog.
- **Verificação:** builds sem erros; prévias do ladrilho repetido 2×2 nos dois temas; capturas da seção no claro e no escuro sem erros de JavaScript; arquivos SVG e PNG respondendo 200 no GitHub Pages. Workflows concluídos; DM v14 e FindLook v18 conferidos no ar. Ajustes a partir das prévias: ícones maiores e linhas deslocadas (a primeira versão ficou miúda e em grade), desenhos do cropped e da jaqueta refeitos, e traços passados de translúcidos para cores sólidas após a correção da dona do produto. Depois, por sugestão dela, o conteúdo central da demonstração passou a ficar dentro de um card sólido sobre a textura (commits `c4fa9ce` DM e `57ab03d` FindLook; DM v15 e FindLook v19 conferidos no ar).

## 2026-11-01 · Subcategoria "Cards glassmorphism" nos dois design systems (publicado: DM v13 e FindLook v17)

- **Origem:** dona do produto ("crie uma subcategoria de cards glass morphism").
- **Feito** (commits `969d3d5` DM e `8e4b450` FindLook): `ui/glass-card.tsx` com `GlassCard` (vidro claro e escuro, intensidades leve/média/forte = desfoque 12/24/40 px com opacidades 40/55/70% no claro e 35/50/65% no grafite, `tint` na primária, `interactive` com elevação e foco, fio de luz de 1 px no topo, raio 20 px e espaçamento 24 px iguais ao Card) e `GlassScene` (fundo de demonstração com manchas de cor dos tokens primária, warning e chart-2). Com `prefers-reduced-transparency` o card vira sólido (card ou grafite). Nenhuma cor nova: só branco, grafite-950 e tokens existentes em opacidade.
- **Documentação:** Componentes › Cards › "Cards glassmorphism" (`#card-glass`, logo após Shine Border): vidro claro em três intensidades sobre o gradiente da marca (número em destaque, card de perfil com Avatar Circles, chamada com botão), vidro escuro sobre ambiente, tabela de regras (fundo obrigatório, quantidade, contraste mínimo, conteúdo curto, desempenho do backdrop-filter, transparência reduzida), faça/não faça, código e tokens. Item no menu e changelog. Exemplos do FindLook: peças salvas, brechó a 1,2 km, buscar por foto; do DM: desafios em andamento, organização de saúde, "O que você deseja melhorar?".
- **Verificação:** builds sem erros; capturas no claro, no escuro e em 390 px nos dois, sem erros de JavaScript. Um ajuste: a tabela de tokens usava campos errados (`title`/`value`) e foi corrigida para o formato do `TokenTable` (`group`, `description`, `light`, `dark`). Workflows concluídos; DM v13 e FindLook v17 conferidos no ar.

## 2026-11-01 · Componente Controle segmentado nos dois design systems (publicado: DM v12 e FindLook v16)

- **Origem:** dona do produto, com esboço (três células acopladas "Nova | Usada | Tanto faz", a ativa com fundo rosa claro): "componente estilo interruptor onde o usuário pode tocar como se fosse um botão e as opções são acopladas, mas siga o estilo do design system".
- **Feito** (commits `11c91c4` DM e `aaf8da5` FindLook): `ui/segmented-control.tsx` sobre o Radix ToggleGroup (dependência já existente): opções acopladas com uma sempre selecionada (toque repetido não desmarca), variantes `suave` (ativa com `--primary-muted` e texto na primária, como o esboço) e `solida` (ativa na primária), tamanhos sm/md/lg com os raios e alturas dos botões do sistema (8/12 px; 32/40/44 px), ícones, `fullWidth`, opção desabilitada, foco visível, setas selecionam a próxima opção habilitada com volta ao início e Tab cai na opção ativa. Colunas crescem para o conteúdo em telas estreitas (sem cortar rótulos).
- **Documentação:** Componentes › Botões › Controles de formulário › "Controle segmentado" (`#segmented`): exemplo controlado com o estado exibido, variante sólida, ícones, largura total, três tamanhos, opção desabilitada, código e regras (quando usar Select, Checkbox ou Switch no lugar). Item no menu e changelog. Exemplos do FindLook: condição da peça, tipo de loja, quero comprar/vender; do DM: condição do item, cobrança mensal/anual, pessoa física/jurídica.
- **Verificação:** builds sem erros; teste no navegador: clique seleciona, segundo clique mantém, seta direita avança e o estado exibido acompanha; capturas no claro, no escuro e em 390 px sem erros de JavaScript. Dois ajustes feitos a partir dos testes: setas passaram a selecionar (o Radix só movia o foco) e colunas iguais cortavam rótulos no celular. Workflows concluídos; DM v12 e FindLook v16 conferidos no ar.

## 2026-11-01 · Shine Border com combinações de cores nos dois design systems (publicado: DM v11 e FindLook v15)

- **Origem:** dona do produto ("para o componente shine border eu quero poder combinar cores de bordas, como o amarelo/dourado com a cor primária do ds").
- **Feito** (commits `7e3eebf` DM e `db087c3` FindLook): `ui/shine-border.tsx` ganhou a prop `preset` e o mapa exportado `shinePresets` com cinco combinações só de tokens: `primaria` (primária + chart-2), `dourada` (warning + primária), `primaria-dourada`, `ouro` (warning + warning-foreground) e `contraste` (primária + foreground). O dourado é o token `--warning` (âmbar `#e5a94e` no claro, `#f5b320` no escuro); nenhuma cor nova foi criada. `shineColor` continua aceitando uma cor ou lista e tem prioridade sobre `preset`; o padrão sem props segue a primária.
- **Documentação:** Motion › Shine Border, bloco "Combinações de cores" com as cinco combinações animadas (dourada e ouro com borda de 2 px), bolinhas das cores, tokens usados e código; changelog.
- **Verificação:** builds sem erros; capturas no claro (DM) e no escuro (FindLook) sem erros de JavaScript. Workflows concluídos; DM v11 e FindLook v15 conferidos no ar.
- **Hipótese registrada:** o design system não tem um token "dourado" próprio; usou-se `--warning`. Se a dona do produto quiser um dourado específico da marca, é uma decisão de token a registrar.

## 2026-11-01 · Componente Avatar Circles nos dois design systems (publicado: DM v10 e FindLook v14)

- **Origem:** dona do produto ("Inclua o componente https://magicui.design/docs/components/avatar-circles em ambos os ds").
- **Feito** (commits `085392c` DM e `9954794` FindLook): `ui/avatar-circles.tsx`, portado do código do Magic UI (lido do registro oficial) com adaptações aos tokens: bordas em `border-background` no lugar de branco/cinza fixos (funciona no claro e no escuro), círculo "+N" em `foreground`/`background`, "+N" só vira link quando `moreHref` é informado (o original tinha `href=""`), prop `size` sm/md/lg, `name` por avatar para o texto alternativo e tooltip, foco visível. Props originais `avatarUrls`, `numPeople` e `className` mantidas.
- **Documentação:** subseção "Avatar Circles" dentro de Componentes › Badges › Avatar (`#avatar-circles`) com os três tamanhos, um exemplo de prova social ao lado de texto, código e regras de uso; item no menu; changelog. Avatares de demonstração são SVGs locais em `public/avatares/` (nenhuma imagem de host externo e nenhuma pessoa real).
- **Verificação:** builds sem erros; capturas no claro e no escuro nos dois, sem imagens quebradas e sem erros de JavaScript; "+1200" não cabia no círculo no exemplo do FindLook, trocado por "+120". Workflows concluídos; DM v10 e FindLook v14 conferidos no ar.

## 2026-11-01 · Rodapé dos dois design systems com link para o site (publicado: DM v9 e FindLook v13)

- **Origem:** dona do produto: no rodapé "© 2026 Dani Moscatelli • Experience Design Studio. All rights reserved.", o trecho "Dani Moscatelli • Experience Design Studio" deve levar a www.danimoscatelli.com.br.
- **Feito** (commits `c4a155a` DM e `86550ae` FindLook): em `App.tsx`, o trecho inteiro virou um link para `https://www.danimoscatelli.com.br` (nova aba, `rel="noopener noreferrer"`), com o sublinhado discreto na cor primária que o DM já usava. No DM, o link antigo apontava para o domínio errado (`daniellemoscatelli.com.br`) e só envolvia o nome; corrigido. No FindLook não havia link.
- **Verificação:** builds sem erros; no FindLook, captura do rodapé e leitura do `href` no navegador; nos dois endereços publicados, o pacote novo contém o link.

## 2026-11-01 · Títulos com destaque na cor primária e card de convite ao parceiro (publicado: DM v8 e FindLook v12, conferido no ar)

- **Origem:** dona do produto ("Padronizar títulos com o do Hero onde palavras de destaque ficam destacadas na cor principal da paleta, pink ou vermelho dependendo do DS. Outra inclusão é o card do parceiro convidando para o cadastro: um card bonito vertical e horizontal com tamanho p, m e g").
- **Feito** (commits `958ce5a` DM e `b5d9c3d` FindLook):
  - `ui/heading.tsx`: componente `Heading` com o padrão do hero do site (Plus Jakarta Sans 700, tracking -0,03em, entrelinha 1,1) e a expressão-chave escrita entre dois asteriscos renderizada na cor primária (vermelho no DM, pink no FindLook); tamanhos `hero`, `page`, `section` e `card`; helpers `withHighlight` (para títulos já existentes) e `Destaque`.
  - Títulos de página do design system (`PageHeader`) passam pelo destaque: "Primeiros **passos**" e "Princípios de **design**" nos dois; no FindLook também "Tom de **voz**", "Estados de **informação**" e o subtítulo da Home "Uma experiência, **dois públicos**".
  - Fundamentos › Tipografia: bloco "Título com destaque (padrão do hero)" com exemplo hero (DM: "ativo estratégico"; FindLook: "Muitos estilos."), título de página, seção/card, regras (um destaque por título, de uma a três palavras, a expressão que carrega o valor, nunca o título inteiro) e código.
  - `ui/partner-card.tsx`: `PartnerCard` com `orientation` vertical/horizontal, `size` p/m/g, `surface` card/tint/dark, selo (eyebrow), título com destaque, descrição, ação principal (pílula na cor primária com seta), link secundário e área visual (ícone ou imagem); brilho suave na cor primária no canto, como o fundo do hero.
  - Componentes › Cards › "Card de convite ao parceiro": seis formatos (vertical P, M e G; horizontal P, M em rosa de apoio e G em grafite), orientações de tamanho, superfície e conteúdo e exemplo de código. DM: "Faça parte da **Rede de Parceiros**", texto da página Rede de Parceiros do site, ação "Quero ser parceiro". FindLook: "Seja encontrado por quem já **procura o que você vende**.", ação "Cadastrar minha loja". Item no menu e entradas no changelog dos dois.
- **Verificação:** builds dos dois sem erros; capturas de tela no navegador (1366 px claro e escuro, 390 px) das seis variações do card, do bloco de tipografia e dos títulos de página com destaque, sem erros de JavaScript. Dois ajustes feitos a partir das capturas: aspas que apareciam nos exemplos de título e o card vertical G, que ficava apertado em três colunas (agora P e M lado a lado e G abaixo, com largura máxima de 600 px).
- **Publicação:** workflows `publish.yml` e `publish-findlook.yml` concluídos com sucesso; DM v8 e FindLook v12 no GitHub Pages, seção `card-partner` conferida nos dois endereços publicados.

## 2026-11-01 · Componentes de upload nos dois design systems (publicado: DM e FindLook no ar, conferido)

- **Origem:** dona do produto ("Desenvolva os componentes de upload bem bonitos e estéticos").
- **Feito** (commits `591b0b4` DM e `b4235cc` FindLook): `ui/upload.tsx` com `UploadDropzone` (arrastar e soltar, acessível por teclado, botão "Tirar foto" com `capture` no celular, tamanhos md/lg/compacta, validação de tipo, tamanho e quantidade com mensagens em português e nome do arquivo), `UploadItem`/`UploadList` (ícone por tipo ou miniatura, barra de progresso `role="progressbar"`, estados pendente/enviando/concluído/erro, tentar de novo, remover, lista `aria-live`), `ImageUpload` (círculo, quadrado e larga 3:1, trocar no hover/foco, remover), `ImageGrid` (galeria com selo "Capa", progresso por miniatura, limite e contador), `formatBytes` e `validateFiles`. Os componentes não enviam nada: entregam os arquivos ao produto. Cor de texto primária por `var(--primary-text, var(--primary))` para funcionar nos dois sistemas.
- **Página Componentes › Upload** (`UploadShowcase.tsx`, um arquivo com a constante `FINDLOOK` que troca só os exemplos): área de soltar com lista (envio simulado; o segundo arquivo de um lote falha de propósito para mostrar o "tentar de novo"), compacta, foto com câmera (FindLook: "Busca por foto"), imagem única (foto de perfil ou logo da loja, capa da vitrine), galeria (fotos da peça), importar planilha, estados e mensagens, checklist de acessibilidade, uso e tokens. Item "Upload" no grupo Componentes com 9 subitens; changelog.
- **Verificação:** builds sem erros; no FindLook, capturas com arquivos reais injetados pelo navegador (PDF, PNG, CSV) mostrando concluído, falha com "tentar de novo", galeria com capa e contador 2/8; versão celular no escuro; 0 erros de console.

## 2026-11-01 · Componente "Selo (tag do hero)" nos dois design systems (publicado)

- **Origem:** dona do produto: a tag padrão do design system (pílula com fundo e borda em pink) é menos bonita que a tag do hero da página Experience Intelligence do site, que ela quer no design system.
- **Padrão replicado do site** (`public/experience-intelligence/estilo.css`, classe `.selo`): pílula com fundo de card, borda `--border`, 6 × 14 px, texto 0,75 rem semibold em caixa alta com tracking 0,14em em `graphite-700`, ponto de 8 px na cor primária, gap 8 px.
- **Feito:** `ui/selo.tsx` nos dois repositórios (tons neutro e primário, tamanhos md e sm, ponto ou ícone, grafite-300 no escuro; no DM o tom primário usa `text-primary`, no FindLook `text-primary-text`). Documentação em Rótulos › "Selo (tag do hero)" com exemplos, versão sobre superfície escura, regras de uso (um por página ou seção, texto curto, ponto ou ícone, não interativo), código e tokens; subitem no menu; changelog. Commits `c0b2d79` (DM) e `fbeff59` (FindLook). Builds sem erros; captura do bloco conferida no FindLook (claro e escuro).
- **Observação:** a tag "Moda local em Curitiba" do print não existe nos design systems; vem do produto FindLook em construção, que agora pode trocar pelo `Selo`.

## 2026-11-01 · DM Design System: seção "Painel lateral (gaveta)" (publicada na v3)

- **Origem:** dona do produto ("o sidebar não está em nenhum dos design systems"): o formulário de contato do site abre em gaveta lateral e o padrão não estava documentado.
- **Feito (commit `620a0d9` em `DaniMoscatelli-DesignSystem`):** componente `ui/side-panel.tsx` (Radix Dialog; larguras 100% / 500 px / 540 px, overlay `bg-foreground/40` com desfoque, cantos esquerdos 24 px, zonas cabeçalho + corpo rolável + barra de ação + rodapé; Esc, clique fora, foco preso e devolvido, rolagem travada) e página `SidePanelShowcase.tsx` (anatomia, comportamento com demonstração, variante formulário de contato idêntica ao site com validação, máscara de telefone, mensagens e estado de sucesso, checklist de acessibilidade, uso e tokens). Item "Side Panel / Painel lateral" no grupo Componentes; changelog.
- **Verificação:** `pnpm build` sem erros; capturas via navegador real: página, gaveta aberta, validação com campos destacados e acordeão aberto, versão celular (390 px); 0 erros de console.
- **Publicação:** a primeira tentativa (execução 41286234747) falhou com 403 ao gravar a tag, porque o token `DEPLOY_TOKEN` tinha perdido o acesso ao repositório `DaniMoscatelli-DesignSystem` ao incluir o FindLook; a dona do produto recolocou os dois repositórios no token. Execução 41286813279: sucesso, **v3 = `620a0d9`** (desatrelamento + painel lateral) publicada, 0 removidos e 15 adicionados em relação à v2, tag `v3`; `danimoscatelli.com.br/designsystem` já serve o bundle novo com a seção.
- **Ajuste (01/11/2026, pedido da dona do produto ao ver o painel genérico):** a demonstração do bloco Comportamento passou a abrir o painel com formulário (DM: contato; FindLook: "Cadastrar minha loja"); o painel genérico foi removido. Commits `9c79ce0` (DM, v4) e `5397153` (FindLook, v6). As duas publicações rodaram ao mesmo tempo e o push do registro do DM foi rejeitado (os dois fluxos gravam no repositório Deploy); a publicação em si tinha ocorrido. Correção nos fluxos (commit `362803d` do Deploy): tag idempotente (não falha se já existir) e push do registro com `pull --rebase` e até 5 tentativas; registro da v4 do DM reparado com os próprios scripts.
- **GitHub Pages travado (01/11/2026):** depois de várias publicações seguidas, o GitHub Pages dos dois repositórios ficou com uma entrega "em andamento" (FindLook v5, DM v4) e recusou todas as seguintes (`Deployment request failed … due to in progress deployment`); a página de status do GitHub não indicava incidente e repetir a execução não resolveu. Solução, feita pela dona do produto nas configurações de Pages de cada repositório: Source → Branch = None → Save, depois gh-pages / (root) → Save. Em seguida os dois endereços passaram a servir as versões novas. Lição: evitar publicar muitas vezes em poucos minutos no mesmo repositório; o fluxo pode agrupar mudanças.
- **Favicon e títulos (01/11/2026, pedido da dona do produto):** nos dois design systems, `public/` com `favicon.svg` (símbolo oficial), `favicon-32.png`, `favicon-192.png` e `apple-touch-icon.png` (fundo transparente), `index.html` com `<title>` padronizado ("FindLook - Design System" e "Dani Moscatelli - Design System"), links dos ícones e `theme-color` na cor primária; README com o mesmo título. Build confirmou os caminhos com o `base` de cada repositório; a regra de proxy do site já cobre `/DaniMoscatelli-DesignSystem/favicon.svg`. Commits `8bfbb99` (FindLook) e `b37686a` (DM). **No ar:** FindLook v9 (título, favicon, cabide branco, demonstração com formulário, assinatura com 0,3 F) e DM v5 (título, favicon, demonstração com formulário), conferidos nos dois endereços.
- **Cabide sempre branco (FindLook, commit `22e1059`):** correção apontada pela dona do produto: os vetores oficiais traziam o cabide como recorte (grafite no fundo escuro). Acrescentado um círculo branco atrás do cabide, dentro da cabeça do pin, no símbolo e nas quatro assinaturas, sem alterar os traçados; os monocromáticos seguem vazados por serem de uma cor só. PNGs, favicons e textos da seção Marca regenerados; changelog.
- **Assinatura horizontal (FindLook, commit `186e32b`):** a pedido da dona do produto (manter a proporção do símbolo, aumentar o afastamento do “F”), o espaço entre símbolo e logotipo passou de 0,13 F para 0,3 F nas duas versões horizontais, deslocando só o grupo das letras do vetor oficial; símbolo mantido em 2,25 F. Três proporções alternativas (1,0, 1,25 e 1,5 F) foram mostradas em imagem e descartadas por ela. SVGs e PNGs regenerados; regra documentada na seção Marca; changelog.
- **FindLook (commit `dd71036`):** mesmo componente e mesma página, só em português, com exemplo de demonstração “Cadastrar minha loja” (nome da loja, WhatsApp com máscara, bairro e cidade, tipo; textos do próximo passo tirados do brand book: cadastre produtos ou importe a planilha; revise, publique e seja encontrado), marcado como demonstração. Build e capturas (página, painel, validação, celular) sem erros; publicação registrada quando concluída.

## 2026-11-01 · Design system Dani Moscatelli desatrelado do Figma Make (D-039)

- **Feito:** no repositório `DaniMoscatelli-DesignSystem`, commit `1d4f3dc`: README em português sem o link do Figma, `vite.config.ts` sem o comentário do Make, `.gitignore`, entrada no changelog interno ("Mantido no GitHub, não mais no Figma Make"). Fluxo `publish.yml` disparado para publicar a v3. Cópia de referência `docs/design-system/oficial/` sincronizada com `1d4f3dc` (`diff -rq` sem diferenças).
- **Verificação:** nenhum `figma:asset` em uso no código; build do v2 já validado; publicação da v3 registrada no Deploy quando concluída.

## 2026-11-01 · FindLook Design System v1.0 publicado (D-037)

- **Onde:** árvore pronta e commit local `c11a490` (115 arquivos) para o repositório `daniellemoscatelli87/FindLook-DesignSystem`, que ainda não existe (a dona do produto cria; esta sessão não cria repositórios). Fluxo de publicação pronto no repositório Deploy (commit local `60ce897`, `publish-findlook.yml`, scripts com `REGISTRO_DIR`), a enviar depois que o repositório existir.
- **Feito:** `theme.css` (escalas pink e grafite, semânticos claro e escuro, `--primary-text`, `--surface-tint`, `--brand-*`), `fonts.css` (só Plus Jakarta Sans), `i18n.tsx` fixo em pt-BR, `App.tsx` (logo, wordmark Find/Look, menu da Marca com 12 itens, seções Tom de voz e Estados, rodapé), `BrandShowcase` reescrita (10 logos com download SVG e PNG), `HomeShowcase`, `PrinciplesShowcase`, `GetStartedShowcase`, novas `VoiceShowcase` e `StatesShowcase` (com `StatusChip`), `changelog.ts` zerado, Fundamentos e Acessibilidade adaptados, troca mecânica de 379 linhas de cores antigas (hex, rgba e nomes de token `crimson-*` → `pink-*`), ativos do DM removidos, `vite.config.ts` com `base: '/FindLook-DesignSystem/'`.
- **Logos:** gerados por script (`scratchpad/logos/gerar.py`): símbolo em geometria própria (pin + cabide) e wordmark em caminhos da Plus Jakarta Sans ExtraBold (fonte baixada do Google Fonts), 10 variantes em SVG e PNG transparente (Playwright); conferidos visualmente lado a lado com as imagens enviadas.
- **Verificação executada:** `pnpm build` sem erros (aviso pré-existente `GitBranch2` em IconsShowcase); servidor local com o mesmo `base` e capturas via Playwright: Início (escuro, claro, celular), Marca (claro, escuro, celular), Fundamentos, Estados, Tom de voz, Princípios e Primeiros passos, sem erros de console; varredura final sem "Dani Moscatelli" fora do changelog; cores soltas restantes são da paleta nova ou exemplos didáticos (violeta/azul/âmbar de sintaxe).
- **Publicação (01/11/2026):** repositório `daniellemoscatelli87/FindLook-DesignSystem` criado pela dona do produto; `main` = `c11a490`; fluxo `publish-findlook.yml` publicado no repositório Deploy (`60ce897`, `238637a` com `VITE_BASE` por design system). Primeira execução (41277272879) falhou na tag por falta de acesso do `DEPLOY_TOKEN` ao repositório novo; a dona do produto incluiu o repositório no token (fine-grained, Contents read/write). Segunda execução (41277622383): sucesso em todas as etapas, `v1` registrada e publicada, tag `v1` na fonte, branch `gh-pages` criado; o GitHub Pages ativou sozinho. **No ar:** https://daniellemoscatelli87.github.io/FindLook-DesignSystem/ (200, título "FindLook Design System", aberto em navegador real no tamanho de celular sem erros de console).
- **v2 (01/11/2026, logos oficiais):** a dona do produto enviou os vetores oficiais (assinaturas horizontal e vertical para fundo claro e escuro, símbolo). Substituíram os logos gerados: horizontais limpos do retângulo branco de fundo; wordmark recortado da assinatura oficial; monocromáticos do símbolo a partir do vetor oficial; PNGs regenerados; variante "cabide grafite" removida (o cabide oficial é vazado). Commit `62cdc4c`; execução 41279983190 (sucesso): `v2` publicada, 0 removidos, tag `v2`; bundle novo no ar (`index-D8-N7IKJ.js`). **Achado:** os vetores oficiais usam pink `#E62040` e texto `#060608`, diferentes dos tokens do brand book (`#F4144B`, `#111014`); registrado na seção Marca, decisão pendente.
- **v3 (01/11/2026):** rodapé "© 2026 Dani Moscatelli • Experience Design Studio. All rights reserved." (commit `06ed8d1`; execução 41282267471, sucesso).
- **v4 (01/11/2026, D-038):** tokens unificados com as cores do logo oficial (`#E62040`, `#060608`), escalas e contrastes recalculados, 413 linhas remapeadas, textos de Marca, Princípios e Acessibilidade revisados, changelog atualizado (commit `e8ca1e4`). Build local e capturas (Início, Marca, Fundamentos, Acessibilidade) sem erros; publicação registrada abaixo quando concluída.
- **Pendências:** domínio da FindLook (decisão futura); textos em inglês herdados continuam no código sem uso.

## 2026-11-01 · Design system v2 publicada por envio manual (integração Figma Make → GitHub fora do ar)

- **Situação:** o arquivo do Figma Make perdeu o vínculo com o repositório (pedido à IA do Make de "desconectar do GitHub", seguido de desinstalação/reinstalação do app do Figma no GitHub). O Figma Make só envia para repositório que ele mesmo cria; as tentativas de "Create repository" criaram dois repositórios vazios e privados (`DaniMoscatelli-DesignSystem-Final`, `Dani-Moscatelli-Design-System`) com o erro "You do not appear to have sufficient permissions for the operation". Chamado aberto no suporte do Figma pela dona do produto.
- **Contorno executado:** código exportado do Figma Make (zip) → normalizado para o mesmo conjunto de arquivos que o Make enviava (`src/`, `guidelines/`, `index.html` sem marcadores internos, `vite.config.ts` com `base`; excluídos `.figma/`, `.figaro/`, `.tmp/`, `vite.figma.config.ts`, `CLAUDE.md`, `AGENTS.md`, `.gitattributes` com LFS, `pnpm-lock.yaml`, `tsconfig.json` e um `deploy.yml` do Make) → commit `50f63f1` no `main` de `DaniMoscatelli-DesignSystem` → fluxo do repositório Deploy (execução 41267197935, sucesso): `v2` criada, tag `v2` na fonte, 0 removidos e 25 adicionados em relação à `v1` (seção Cards com 10 itens, componente `shine-border`, token `--animate-shine`), publicada no `gh-pages` (commit `950531f`).
- **Verificação:** build local com pnpm antes do envio (bundle com `base` correto); site `danimoscatelli.com.br/designsystem/` responde 200 com o bundle novo `index-B5eTsOs2.js`, contendo "Card Anatomy", "Nested Cards" e "Shine Border".
- **Achado:** a seção Cards que a dona do produto dava como perdida existia no Figma Make e nunca tinha chegado ao GitHub.
- **Pendências:** resposta do suporte do Figma; apagar os dois repositórios vazios (decisão da dona do produto); a cópia de referência em `docs/design-system/oficial/` continua em `633044c` (v1).

## 2026-10-31 · Versionamento da publicação do design system (em funcionamento, repositório Deploy)

- **Onde:** repositório `daniellemoscatelli87/DaniMoscatelli-DesignSystem-Deploy` (commits `b4cc0cb`, `afde9bf`), não neste repositório. Arquivos: `.github/workflows/publish.yml`, `scripts/inventario.mjs`, `scripts/versionar.mjs`, `versoes/versoes.json`, `README.md`.
- **Comportamento:** a cada 15 minutos, se o `main` do design system mudou, cria `vN`, etiqueta a fonte, inventaria, compara com a versão no ar e publica só se nada sumiu; caso contrário retém e falha com a lista. Ações manuais: `aceitar_remocoes` e `voltar`. Checagem do `base` do `vite.config.ts` antes de publicar. Decisão da dona do produto (31/10/2026): no ar só a versão atual; as anteriores só no Git.
- **Testes executados localmente:** inventário nos commits `099abec` e `633044c` da fonte; comparação detecta a remoção real (seção Posts) e ignora troca de rótulos por tradução (comparação por id); cenários de planejamento: manifesto vazio → `v1`; mesma fonte → nada; versão retida com e sem aceite; voltar para versão existente e inexistente.
- **Execuções reais:** 41244614314 falhou na tag (identidade do Git ausente), corrigido em `afde9bf`; 41244691669 sucesso em todas as etapas: `v1` = `633044c` publicada, tag `v1` criada na fonte, manifesto gravado (`93b61d7`). O `gh-pages` não recebeu commit novo porque o build era idêntico ao que já estava no ar; site e GitHub Pages seguem idênticos (bundle `index-D7YADOkR.js`).
- **Pendência:** o primeiro caso real de retenção ainda não aconteceu; acompanhar o próximo envio do Figma Make.

## 2026-10-31 · Cópia de referência do design system oficial sincronizada, só documentação

- **Feito:**
  - `docs/design-system/oficial/` atualizada do commit `21f89da` para o `633044c` (último commit do Figma Make no `main` de `daniellemoscatelli87/DaniMoscatelli-DesignSystem`): 20 arquivos alterados, 10 novos (seções Início, Primeiros passos, Princípios, Usabilidade, Acessibilidade e Desenvolver, `i18n.tsx`, `changelog.ts`, `Guidance.tsx`, `image-7.png`) e 1 removido (`PostsShowcase.tsx`, removido pelo próprio Figma Make);
  - `ORIGEM.md` com o fluxo real de publicação: Figma Make → `main` do design system → repositório `DaniMoscatelli-DesignSystem-Deploy` (`publish.yml`, a cada 15 minutos) → branch `gh-pages` → GitHub Pages → proxy do site em `/designsystem`. O `deploy.yml` dentro do repositório do design system foi apagado pelo Figma Make em `d5508e5` e `417ed42`.
- **Verificação executada:**
  - `diff -rq` entre a cópia e o clone do `main` em `633044c`: nenhuma diferença (fora `ORIGEM.md`, que é nosso);
  - `src/styles/theme.css` não mudou entre `21f89da` e `633044c` (`git diff --stat` vazio), então o `tokens.css` da página do produto não ficou defasado por esta sincronização;
  - no ar: `danimoscatelli.com.br/designsystem/` responde 200 com HTML idêntico ao do GitHub Pages (mesmo bundle `index-D7YADOkR.js`), e esse bundle contém textos que só existem a partir de `417ed42`; último commit do `gh-pages` em 31/10/2026 18:58 UTC, feito pelo fluxo do repositório Deploy.
- **Código e banco:** nenhum alterado. O design system continua como referência, não ligado ao app nem ao site (D-032 pendente de adoção).

## 2026-10-21 · Corpus inicial de protocolos incorporado (D-028), só documentação

- **Feito:**
  - `docs/knowledge/protocols/05-corpus-inicial-protocolos-v0.1.json` copiado sem alteração (`cmp` idêntico);
  - relatório `docs/knowledge/PROTOCOLS_COMPATIBILITY.md`;
  - `RAG_DIVERGENCES.md`, Decision Log (D-028, P-005 e P-008), Backlog (UX-15) e índice atualizados.
- **Verificação executada:** script de conferência (não versionado):
  - JSON válido; 19 campos obrigatórios do esquema presentes nos 6 protocolos;
  - `user_facing_title` a mais;
  - `questions` vazias e `status: draft` nos 6;
  - um termo de jargão na interface ("walkthrough" em `observation_light`).
- **Código e banco:** nenhum alterado.

## 2026-10-27 · Encontrabilidade e medição do site (D-036, publicado)

- Arquivos: `index.html` (título, descrição, canonical, Open Graph, dados estruturados, verificação do Search Console, link "Preferências de cookies", eventos nos links), `public/rede-parceiros/index.html`, `public/privacidade/index.html` (textos de medição e seção 6 "Cookies"), `public/robots.txt`, `public/sitemap.xml`, `public/404.html`, `public/compartilhar.png`, `public/_redirects` (sem a regra `/* /index.html 200`), `public/analytics.js` (aviso de cookies, GA4 com consentimento e `window.dmEvento`), eventos em `src/em-breve.ts`, `public/experience-intelligence/{pagina.js,contato.js}` e `public/rede-parceiros/index.html`.
- Fora do código: registro TXT do Google na Hostinger, propriedade do Search Console, propriedade do GA4 e eventos principais marcados pela dona do produto.
- Publicado pelos PRs #38 a #41.
- Verificado:
  - no site publicado: `robots.txt`, `sitemap.xml` (XML válido, lido como Googlebot), 404 em endereço inexistente, demais páginas e `/designsystem` sem regressão;
  - aviso de cookies: nada do Google antes da escolha; recusar, reabrir e aceitar; ao aceitar, `page_view` e evento chegam ao GA4 e os cookies `_ga` são criados; com "Recusar", nenhum evento; área restrita sem aviso;
  - visita registrada no Tempo real do GA4 (conferido pela dona do produto).
- Não testado no navegador: `contato_enviado` e `cadastro_parceiro` com envio real (para não criar registros falsos); conferir no GA4 quando houver o primeiro.
- Pendente: status "Concluído" do mapa do site no Search Console.

## 2026-10-22 · Página do produto: hero (D-033, publicado)

- Arquivos: `public/experience-intelligence/` (`index.html`, `estilo.css`, `tokens.css` copiado do design system oficial, `pagina.js`, `contato.css`, `contato.js`, `simbolo.svg`, `foto-citacao.webp`, `foto-perfil.webp`, `painel-celular.webp`). Imagem do painel em `docs/product/pagina-produto-v2/imagens/` (PNG e WebP, fundo transparente). Sem mudança no app, na página inicial, na autenticação ou nas funções.
- `contato.css`: utilitários do Tailwind usados pela gaveta, gerados a partir de `src/em-breve.css`, com o reset e as variáveis restritos a `#contact-drawer` e `#drawer-backdrop`; `contato.js`: lógica de `src/em-breve.ts` sem a parte de "Notificar lançamento".
- Publicado pelos PRs #32, #33, #34 e #35 (só a pasta da página).
- Verificado:
  - build do site; navegador de 320 a 1600 px sem rolagem lateral e sem erros de JavaScript;
  - janela "Avise-me" com envio simulado: e-mail válido, inválido e falha de rede; foco e fechamento (X, Cancelar, Esc, fora);
  - gaveta de contato com envio simulado: dados no mesmo formato da página inicial, validação dos obrigatórios, mensagem de sucesso; foco no primeiro campo;
  - menu lateral (abrir, fechar no X, no fundo, com Esc e ao escolher um item);
  - animações (entrada, gráficos, cartões flutuando, estrelas, fundo) e movimento reduzido (tudo parado e completo);
  - no site publicado: página, janela do Avise-me, menu lateral e gaveta de contato, sem envio de dados reais.
- Não testado: envio real do Avise-me e do contato (para não criar registros falsos) e a fluidez das animações em aparelhos reais.

## 2026-10-25 · Área restrita e Store (D-034, D-035, publicado)

- Arquivos: `public/admin/admin.js` (botão de mostrar/ocultar senha para todo campo de senha, inclusive os criados depois; mensagem de redefinição sem o e-mail), `public/admin/admin.css` (`.campo-senha`, `.olho-senha`), `public/admin/store/index.html` (1 a 10 fotos, quadro da capa e quadro "+", retirar com "×"), `public/store/index.html` (vitrine com até 10 fotos e nova capa), `public/store/dani-store-4.webp`.
- Banco: migração `produtos_fotos_1_a_10` (restrição `produtos_fotos_check` entre 1 e 10).
- Publicado pelos PRs #36 e #37.
- Verificado: build; mensagem de redefinição com envio simulado; botão de senha no login e nos 7 campos das Configurações; cadastro com 10 fotos, retirada e quadros vazios; banner da Store em 1440 e 375 px; no site publicado: senha, mensagem e capa.
- Não testado: as Configurações com a sessão real (exige a conta da dona do produto) e a vitrine com um produto real de mais de 3 fotos (nenhum produto de teste foi salvo).

## Estado do repositório encontrado (19/10/2026)

Levantamento feito antes de propor o plano do Corte 1:

- **Site do estúdio:** Vite 8 + TypeScript 6 + React 19 (`src/`), com `index.html` + `src/em-breve.ts` como página inicial. Páginas da área restrita, Rede de Parceiros, Store e Política de Privacidade em HTML e JavaScript puro dentro de `public/`, copiadas para `dist/` no build.
- **Scripts:** `npm run build` (`tsc -b && vite build`), `npm run lint` (`oxlint`), `npm run dev`, `npm run preview`. Não há script nem biblioteca de testes automatizados.
- **Hospedagem:** Netlify (publica `dist/`). Existe também um `vercel.json` antigo.
- **Banco:** Supabase, projeto `lipfvnerohkaajegqvwr`, usado pelo site (contatos, parceiros, lançamento, Store, log da administração) com RLS e papel `admin` no `app_metadata`. As migrações foram aplicadas direto no Supabase e **não** estão versionadas no repositório.
- **Funções:** edge functions do Supabase para e-mail, Google Agenda, IA dos parceiros (Gemini), lançamento e gestão de dados.
