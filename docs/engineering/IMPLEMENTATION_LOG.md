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

## 2026-10-21 · Cadastro aprovado: migrações aplicadas (D-029)

- Aplicadas no Supabase: `20261021090000_contexto_organizacao.sql` e `20261021100000_perfil_pessoal.sql` (antes: colunas novas ausentes, sem `ei_profiles`, nenhum gatilho em `auth.users`).
- Testes no banco real, em transação desfeita: `organization_context.sql` 7 de 7 e `personal_profile.sql` 8 de 8. Conferido depois: nenhum usuário de teste nem perfil ficou gravado.
- Avisos de segurança do Supabase: os mesmos tipos de antes (funções do banco chamáveis por quem está logado, por desenho, com as verificações dentro de cada função; tabelas sem políticas porque o acesso é só por funções). Proteção contra senhas vazadas segue desligada (recurso do plano pago).

## 2026-10-21 · Ícone nos títulos das etapas do cadastro

- Pedido da dona do produto: ícone vermelho sobre base quadrada rosa clara, com cantos arredondados, ao lado do título de cada etapa.
- Novo componente `TituloEtapa` (`src/design-system/campos.tsx`), classes `.etapa-cabecalho` e `.etapa-icone` (`globals.css`): 44 px, cantos de 12 px, fundo `--red-tint`, ícone `--red`. "Seus dados" usa `UserRound`; "Empresa ou negócio" usa `Building2`. Documentado em `docs/design-system/COMPONENTES.md`.
- Verificado: `tsc --noEmit`, `oxlint` (sem erros; 2 avisos antigos), `vitest` (48 de 48), `npm run build`, teste no navegador a 320 e 375 px sem erros e sem rolagem lateral.

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

## 2026-11-16 · Padrões do site no design system (D-030)

- **Produto:** `.janela-topo` (`apps/experience-intelligence/src/app/globals.css`) sem `border-bottom`; fundo graphite-50 (`#EDF0F5`) até 72% e degradê até transparente, padding inferior 26 px, `z-index: 1` para o conteúdo passar por baixo ao rolar.
- **Documentação:** `docs/design-system/COMPONENTES.md` com a `Janela` atualizada, a seção "Padrões do site registrados para uso futuro" (accordion e cabeçalho de janela/gaveta) e as regras 4 (descrição de seção 14 px no celular) e 5 (sombras).
- **Site (mesmo período, publicado à parte):** accordions do Projeto Piloto no estilo dos da Rede de Parceiros; cabeçalho com degradê nas gavetas de contato e de cadastro (`.gaveta-topo`); descrições `.sec-desc` em 14 px no celular; cards do mockup com a sombra do DS.
- **Banco e migrações:** nenhuma alteração.
- **Verificação executada:** em `apps/experience-intelligence`: `npm run typecheck` (sem erros), `npm run lint` (sem erros; 3 avisos antigos de `only-export-components`), `npm test` (48 de 48), `npm run build` (exportação estática). No navegador (Playwright, iPhone 13 e 1280 px), `/cadastro/` → "Como usamos seus dados": cabeçalho com o degradê, sem borda, e o texto passa por baixo dele ao rolar.

## 2026-11-16 · Rastreamento dos e-mails da Rede de Parceiros (site), publicado

- **Banco:** migração `supabase/migrations/20261116120000_email_rastreio.sql`: tabelas `email_envios` e `email_eventos` (RLS: leitura só da administradora; ela só pode alterar `visualizado_em`) e função `registrar_email_evento` (só `service_role`).
- **Funções:** nova `email-eventos` (webhook do Resend, `verify_jwt` desligado, assinatura Svix verificada); `galeria-convite` e `comunicado-parceiros` gravam cada e-mail aceito pelo Resend em `email_envios`.
- **Área restrita:** sino com "abriu o e-mail" e "clicou no link do e-mail"; card "E-mails enviados" no perfil do parceiro, que marca os avisos como vistos.
- **Política de Privacidade:** item "E-mails da Rede de Parceiros" e data de atualização.
- **Verificação executada:** função `email-eventos` no Node com assinaturas reais da biblioteca `svix` (aceita assinadas; recusa sem assinatura, corpo alterado, segredo errado e horário com mais de 5 min); migração aplicada num Postgres 16 local descartável (contagem, aviso só no primeiro evento de cada tipo, evento repetido ignorado, e-mail desconhecido ignorado, RLS e permissões); `node --check` dos scripts do painel; `npm run build`; painel no navegador com login e banco simulados (card, sino e marcação de visto).
- **Publicação e teste real (16/11):** migração aplicada; funções publicadas; rastreamento de abertura e cliques ligado no domínio do Resend (subdomínio `links.danimoscatelli.com.br`, CNAME criado na Cloudflare pela configuração automática); webhook criado; segredo guardado em `RESEND_WEBHOOK_SECRET_RASTREIO` (separado do `RESEND_WEBHOOK_SECRET` das respostas de contato). E-mail real de teste: entregue, aberto e clicado registrados em `email_envios` (3 eventos).

## 2026-11-23 · Pesquisa Moda em Curitiba: mensagem da tela final no Alerta do DS, não publicado

- **Pedido:** a mensagem do fim ("Assim que a plataforma for lançada…") não seguia o padrão do DS.
- **O que mudou (`pesquisa/moda-curitiba/index.html`, `src/pesquisa-moda.css`, `src/pesquisa-moda.ts`):** a caixa rosa centralizada com o presente virou o Alerta do DS, variante info (`alert.tsx`): ícone de sino de 20 px em `#3D7CAA` (`--info`) à esquerda, texto de 14 px alinhado à esquerda, fundo `--info-muted`, borda `--info` a 20% e raio de 12 px; `role="status"`. "E-mail" com hífen que não quebra (U+2011).
- **Verificação executada:** `npm run build`; fluxo completo no celular até a tela final; captura da mensagem; sem erros no console.

## 2026-11-23 · Pesquisa Moda em Curitiba: títulos com destaque, textos revisados e perguntas 8 e 10 unidas, publicado

- **Pedidos da dona:**
  - trecho de cada título em vermelho;
  - novos textos para as perguntas 3, 4, 5, 7, 8 e 9 e para a mensagem final;
  - "fusão da pergunta 8 com a 10": ela escolheu "Tudo na escala da 8".
- **Questionário (`moda-curitiba-v9-2026-11-23`):**
  - campo `destaque` em cada pergunta (o trecho em vermelho);
  - textos novos nas perguntas 3, 4, 5, 7, 8 e 9;
  - a pergunta 8 ganhou 7 linhas com os itens da antiga 10, escritos para a escala de facilidade e dificuldade (mesmos ids: `precos`, `onde_encontrar`, `muitas_lojas`, `esgotada`, `tempo`, `distancia`, `avaliar_online`);
  - a pergunta 10 saiu, e a pesquisa passa a ter 9 perguntas.
- **Página (`src/pesquisa-moda.ts`, `src/pesquisa-moda.css`):** `cabecalho` pinta o trecho de destaque, também em "sobre você" e "experiência de compra". Nova mensagem final: "Assim que a plataforma for lançada, avisaremos você por e-mail e WhatsApp para que fique por dentro de todas as novidades!"
- **Painel (`public/admin/pesquisas/index.html`):**
  - pergunta 8 em largura cheia, com a grade preenchendo os espaços livres (`grid-auto-flow: dense`);
  - frases "O que mais dificulta" no lugar de "O mais difícil de encontrar";
  - o destaque da antiga 10 saiu;
  - o cartão "não sabem em quais lojas procurar" passa a usar a linha `onde_encontrar` da 8 (difícil ou muito difícil), e as respostas antigas da 10 continuam contando.
- **Verificação executada:**
  - `npm run build`;
  - função com banco simulado (8 completa com 12 linhas aceita; só as 5 antigas recusada; 10 ignorada);
  - fluxo completo no celular ("Pergunta 8 de 9", 12 linhas, 12 títulos com destaque, nova mensagem final);
  - painel com dados fictícios (alturas iguais, 16 cartões, sem erros no console).

## 2026-11-23 · Política de Privacidade revisada (pesquisa, Hostinger e e-mail visível), publicado

- **Pedido:** a dona pediu a revisão do texto e perguntou o que era "[email protected]". É a proteção de e-mails da Cloudflare, que esconde contato@danimoscatelli.com.br de robôs: aparece certo no navegador, mas não ao copiar o texto.
- **O que mudou (`public/privacidade/index.html`), com os 5 pontos aprovados pela dona:**
  1. seção 1: a pesquisa passa a dizer que nome, e-mail e WhatsApp são pedidos no início para garantir uma participação por pessoa (antes dizia "só se pedir novidades");
  2. seção 2: finalidades da pesquisa com "garantir uma participação por pessoa" e "entregar os benefícios de lançamento";
  3. seção 4: Hostinger (caixa de e-mail contato@) entre os fornecedores;
  4. seção 8: "vantagens de quem participou" trocado por "benefícios de lançamento" e "novidades do projeto", os mesmos termos da pesquisa;
  5. os 4 endereços de e-mail da página entre `<!--email_off-->` e `<!--/email_off-->`, para a Cloudflare não escondê-los.
- **Verificação executada:** `npm run build`; página conferida no ar depois da publicação.

## 2026-11-23 · Pesquisa Moda em Curitiba: abertura no modelo enviado pela dona ("Por que vale participar"), publicado

- **Pedido:** refazer a abertura seguindo o modelo enviado (imagem), com os textos dele.
- **O que mudou (`pesquisa/moda-curitiba/index.html`, `src/pesquisa-moda.css`):**
  - textos novos: "Queremos entender como é procurar e comprar roupas e acessórios na cidade." e o parágrafo do projeto e do que as respostas vão ajudar a identificar;
  - bloco "Por que vale participar", em tom rosa claro, depois da explicação: presente vermelho animado, divisor, título e "Ao final, você poderá escolher receber novidades do projeto e benefícios de lançamento.", mais 3 selos ("Novidades em primeira mão", "Benefícios no lançamento", "Ajude a construir a solução"), com ícones e um leve movimento no hover;
  - boxes de informação: "Leva de 3 a 5 minutos", "Participação voluntária" e "Privacidade protegida";
  - fechamento e link da política com os textos do modelo.
  - No celular, os selos ficam um embaixo do outro. A faixa de vantagens anterior saiu.
- **Verificação executada:** `npm run build`; Playwright no celular, em 1366×768 e em 1440×900 (botão visível sem rolar, selos em uma linha, sem erros no console); capturas.

## 2026-11-23 · Pesquisa Moda em Curitiba: faixa de vantagens mais suave e depois da explicação, publicado

- **Pedido:** a faixa vermelha das vantagens competia com o botão "Começar pesquisa" e aparecia antes da explicação da pesquisa.
- **O que mudou (`src/pesquisa-moda.css`):** a faixa passou a fundo rosa claro (`--pq-tint`) com borda vermelha suave e textos escuros. O ícone de presente continua num quadrado vermelho animado, e o brilho que passa continua (sem animação com "menos movimento"). O vermelho cheio fica só no botão. Depois, a pedido da dona ("ruim falar da vantagem antes de explicar a pesquisa"), a faixa foi para depois dos textos que explicam a pesquisa, antes dos boxes de informação (`pesquisa/moda-curitiba/index.html`).
- **Verificação executada:** `npm run build`; Playwright no celular e em 1440×900 (botão visível sem rolar, sem erros no console); capturas.

## 2026-11-23 · Painel de pesquisas: "Leitura" no Alerta do DS e pergunta 8 sem números dentro das barras, não publicado

- **Pedido:** a dona perguntou se a caixa "Leitura" seguia o DS. Não seguia: foi feita à mão, com fundo cinza, sem borda e ícone cinza. Conferido no repositório do DS (`alert.tsx`), junto com a regra de gráficos de 19/11/2026: barras sem número dentro.
- **O que mudou (`public/admin/pesquisas/index.html`):**
  - "Leitura" no padrão do Alerta do DS, variante info: fundo `--info-muted`, borda `--info` a 20%, ícone de 20 px em `--info`, texto de 14 px, 16 × 14 px de espaçamento e raio `--radius-md`;
  - pergunta 8: os percentuais saíram de dentro das barras e vêm abaixo, na ordem das partes, cada um depois de um ponto na cor dela.
- **Verificação executada:** `npm run build`; painel com dados fictícios no computador e no celular (nenhum número dentro das barras, sem erros no console); capturas.

## 2026-11-23 · Pesquisa Moda em Curitiba: abertura em card, botão sempre à vista e barra de navegação fixa, não publicado

- **Pedido:** abertura dentro de um card; "Começar pesquisa" acima da dobra; botões fixos durante o formulário; "Pergunta X de 10" alinhado com o início da barra de progresso; título da pesquisa sempre visível no cabeçalho.
- **O que mudou (`src/pesquisa-moda.css`):** abertura num card branco. No computador, o card é mais largo (920 px) e os quatro boxes de informação ficam em grade 2×2. O bloco do botão fica preso ao pé da tela, com um degradê, enquanto o resto da abertura não couber. A barra Voltar/Continuar fica presa ao pé da tela também no computador, com fundo de ponta a ponta. O texto da etapa ganhou margem automática e fica alinhado com a barra. O título da pesquisa ("Vamos conversar sobre moda em Curitiba?") fica acima da barra de progresso, sempre visível durante o formulário (`pesquisa/moda-curitiba/index.html`).
- **Textos (pedido da dona):** pergunta 2 passa a "Onde você mais comprou roupas e acessórios este ano?" e a 2.1 a "Quais os principais motivos para você comprar roupas e acessórios em marketplaces ou lojas online de outras cidades?"; questionário `moda-curitiba-v6-2026-11-23` (a função `pesquisa` precisa ser publicada junto).
- **Verificação executada:** `npm run build`; Playwright no celular (iPhone 13), em 1440×900 e em 1366×768: botão visível sem rolar (540/664, 743/900, 655/768), "Continuar" visível na pergunta 2, texto da etapa alinhado com a barra (mesmo x), sem erros no console.

## 2026-11-23 · Pesquisa Moda em Curitiba: perguntas 4, 5 e 6 revisadas, campo "Outro" em foco e topo branco, não publicado

- **Pedidos da dona:**
  - pergunta 4 com 3 notas de 0 a 10, conforme o modelo enviado: Qualidade; Estética; Correspondência com o que eu procurava (cada uma com descrição); "0 = Muito ruim" e "10 = Excelente";
  - pergunta 7: "Quando você procura uma roupa ou acessório específico, com que frequência tem dificuldade para encontrar exatamente o que deseja?", com "Nunca / Raramente / Às vezes / Frequentemente / Quase sempre tenho dificuldade" (mesmos ids); frases do painel ajustadas para "têm dificuldade para encontrar";
  - pergunta 8 sem a opção "Não se aplica" (questionário `moda-curitiba-v8-2026-11-23`; o servidor deixa de aceitar "na"; o painel só mostra a coluna se houver respostas antigas com ela);
  - pergunta 9: "Neste ano, o que você fez quando não encontrou uma roupa ou acessório que queria comprar?", com novos textos e a opção nova "Não encontrei na hora, mas deixei para procurar depois" (id `depois`);
  - pergunta 10: "Além de encontrar a peça que você procura, o que mais dificulta suas compras de roupas e acessórios?", com novos textos (mesmos ids; "Outro motivo" passa a "Outra dificuldade");
  - pergunta 5 e pergunta 6 com os novos textos (a 6 ganhou a opção "Por recomendações de influenciadores e criadores de conteúdo", e "Vendo anúncios…" passou a ser só anúncios);
  - "Outro" sempre abre um campo para digitar;
  - topo branco ao rolar, nunca escuro.
- **Questionário (`supabase/functions/pesquisa/questionario.json`, `moda-curitiba-v7-2026-11-23`):** novo tipo `escalas` na pergunta 4, com `linhas` (id, texto e descrição); resposta gravada como `{ qualidade, estetica, correspondencia }`. Pergunta 5 com os mesmos ids e novos textos. Pergunta 6 com o id novo `influenciadores`.
- **Página (`src/pesquisa-moda.ts`, `src/pesquisa-moda.css`):** a pergunta 4 é um card com um bloco por aspecto; a validação aponta qual aspecto falta. Ao escolher "Outro" (perguntas 2.1, 6, 10 e gênero), o campo aparece, a tela rola até ele e o cursor já fica nele. Topo ao rolar: fundo branco translúcido em todos os tamanhos.
- **Servidor (`supabase/functions/pesquisa/index.ts`):** valida o tipo `escalas` (nota inteira de 0 a 10 para cada aspecto).
- **Painel (`public/admin/pesquisas/index.html`) (D-036):**
  - nota geral = média dos 3 aspectos de cada pessoa (respostas antigas com nota única continuam valendo);
  - a correspondência com o que procuravam também aparece separada: card da pergunta 4 com a nota geral e a média de cada aspecto (correspondência destacada), destaques, cartão novo "Correspondência por canal" na Inteligência, e números próprios nos cartões "O que mais pesa na nota geral" e "Primeiros interessados";
  - a aba Respostas mostra as 3 notas.
- **Verificação executada:**
  - `npm run build`;
  - função testada com banco simulado (aspecto faltando, nota 11 e nota única antiga recusados; "outro" sem texto recusado; gravação correta);
  - Playwright no celular: pergunta 4 com aviso do que falta; "Outro" abre o campo com foco em 2.1, 6, 10 e gênero; fluxo completo até a tela final;
  - painel com 42 respostas fictícias: 16 cartões na Inteligência e alturas iguais;
  - sem erros no console.

## 2026-11-23 · Pesquisa e painel: vantagens em destaque e Destaques em cartões, não publicado

- **Pedidos da dona:** as vantagens exclusivas e a contribuição da pessoa tinham pouco destaque, tanto no fim quanto na abertura; o bloco Destaques do painel precisava ser mais visual e intuitivo.
- **Abertura (`pesquisa/moda-curitiba/index.html`, `src/pesquisa-moda.css`):** "Vantagens exclusivas para quem participa" saiu da lista de boxes e virou uma faixa vermelha logo abaixo do título, com ícone de presente animado e brilho (sem animação com "menos movimento"). Os outros 3 boxes ficam em 3 colunas no computador. O botão continua visível sem rolar (celular, 1366×768 e 1440×900).
- **Última etapa (`src/pesquisa-moda.ts`):** título "Sua contribuição vale vantagens exclusivas"; card de destaque com o presente ("Obrigada por contribuir com a solução que estamos desenvolvendo!" e as vantagens no lançamento); a pergunta sobre os avisos vem em seguida, com o "Sim" em negrito.
- **Painel, Destaques (`public/admin/pesquisas/index.html`):** grade de cartões, cada um com ícone, tema, número grande e frase curta; cartões em rosa para os achados mais importantes (onde mais compram, correspondência e dificuldade para encontrar); selo de "amostra pequena" com menos de 30 respostas completas; estado vazio quando ainda não há respostas completas. Primeira linha com os 4 principais (onde mais compram, dificuldade para encontrar, correspondência e o mais difícil de encontrar); os demais abrem em "Ver mais destaques (N)", com animação e "Ver menos" para fechar. 4 colunas no computador e 2 em telas menores.
- **Verificação executada:** `npm run build`; fluxo completo no celular; painel com dados fictícios e com o caso sem respostas completas; capturas no computador e no celular; sem erros no console.

## 2026-11-23 · Painel de pesquisas: aba Resultados redesenhada, não publicado

- **Pedido:** a apresentação dos dados não estava intuitiva, didática nem no padrão do design system; cards lado a lado precisam ter a mesma altura.
- **O que mudou (`public/admin/pesquisas/index.html`):** card padrão por pergunta, com número em selo rosa, pergunta, quantas responderam, "Leitura" em uma frase (calculada dos números), o gráfico e um pé com "Ver números" e notas, sempre no fim do card. Todos os gráficos usam a mesma lista de barras (rótulo, percentual em destaque, quantidade e barra fina; a mais escolhida em vermelho, as outras em cinza-azulado, "Prefiro não informar" e opções exclusivas em cinza claro). Na pergunta 2, uma camada clara mostra "entre os 3 lugares". Nota de 0 a 10: média em destaque e três faixas. Pergunta 8: barra 100% com fácil, médio e difícil, da característica mais difícil para a mais fácil. Funil em quatro etapas ("Quem chegou até onde"). Gênero e faixa etária em dois cards lado a lado. Pergunta 1 e gênero em rosca, com o percentual principal no centro e legenda com números (as demais seguem em barras: escolhas múltiplas, muitas opções ou escala ordenada). Pergunta sem respostas: estado vazio, sem gráfico zerado. Grade com cards da mesma altura, sem buracos.
- **Verificação executada:** `npm run build`; Playwright com 42 respostas fictícias e com o caso real atual (1 participação, nenhuma completa), no computador e no celular: alturas iguais em todas as linhas de 2 cards, sem erros no console.

## 2026-11-23 · Área restrita: hover de linha com --row-hover e card rosa sem repetição, não publicado

- **DS em prévia:** sincronizado de novo com `DS_REF=claude/ajustes-painel` (commit `085153d`), que traz o token `--row-hover` (metade do `--graphite-50` sobre o card, ≈ #F6F8FA; branco a 4% no escuro). `?v=085153d` nas páginas.
- **Hover de linha ou item dentro de card:** todos passam a `var(--row-hover)` (Início, comunicados, contatos, parceiros, pesquisa, notificações). Na tabela de parceiros, o foco pelo teclado ganhou o anel `--ring` (antes só mudava o fundo).
- **Início, card rosa (Novas mensagens):** sai o "N não lidas" do canto; fica o "N não respondidas" embaixo. O card Novos parceiros mantém "N não vistas" (informação diferente de "nos últimos 7 dias"). A linha não lida (ex.: Ana) não tem fundo parado: o estado é o nome em negrito e o ícone vermelho; o cinza era o hover.
- **Verificação executada:** `npm run build`; Playwright, 130 verificações.

## 2026-11-23 · Área restrita: divisor que some nas pontas, hover mais claro e DS da branch de ajustes (D-042), publicado

- **DS em prévia:** `DS_REF=claude/ajustes-painel bash scripts/sincronizar-design-system.sh` trouxe o `theme.css` do commit `85a5ddb` do DS (desabilitado `--graphite-100` com texto `--graphite-400`, 3,6:1); `versao.txt` atualizado; `?v=85a5ddb` nas páginas. Depois que o DS for publicado, a sincronização volta a seguir o `main`.
- **Cabeçalho do card (`admin.css`, Início e Configurações):** sai a faixa cinza (`.card-faixa`); entra `.card-cab`, com divisor de 1px na largura interna do card, em gradiente transparente → `--border-strong` → transparente (some nos últimos 18% de cada lado). Texto de apoio volta ao `--muted-foreground` (5,0:1 no branco).
- **Hover de linha ou item dentro do card:** `--graphite-50` (#EDF0F5) em todos (linhas da Início, listas e mensagens, comunicados, contatos, tabela de parceiros, respostas da pesquisa, notificações).
- **Menu:** confirmado que empurra o conteúdo a 1280px, expandido e recolhido (o conteúdo começa onde o menu termina).
- **Verificação executada:** `npm run build`; Playwright a 1280px e 390px, 127 verificações (inclui divisor, cor do texto do cabeçalho, hover no `--graphite-50`, botão desabilitado com `--graphite-100` e `--graphite-400`, menu empurrando o conteúdo).

## 2026-11-23 · Área restrita com a casca do site do DS, cards só com borda e faixa de cabeçalho (D-041), publicado

- **Cabeçalho (`admin.js`, `admin.css`):** faixa branca fixa na largura toda (64px, borda inferior e `--shadow-sm`, como o site do DS), acima do menu lateral; à esquerda o logo (símbolo DM + "Dani Moscatelli"; no celular, o menu sanduíche vem antes do logo), à direita notificações e perfil.
- **Menu lateral:** abaixo do cabeçalho, branco (`--sidebar`), borda à direita; no topo o botão "≡ Menu" (recolhe e expande; nome acessível "Recolher menu" / "Expandir menu", `aria-expanded`, `aria-controls`), no lugar do "Recolher menu" da base. Itens como a navegação do DS (ícone 16px, nome 14px, cinza; ativo com `--primary-muted` e `--primary-text`); Parceiros e Projetos viraram grupos com seta, que abrem e fecham os subitens numa linha-guia (`aria-expanded`), abertos quando a página atual é um deles. Larguras do site do DS: 240px e 64px. Recolhido: só ícones, contador vira ponto (o número continua no nome acessível), dicas e painel de subitens mantidos (o `aria-expanded` do grupo acompanha o painel; clicar no ícone do grupo leva ao primeiro subitem).
- **Cards:** sem sombra parada (só borda `--border`); cards clicáveis da Início ganham `--border-strong` e `--shadow-md` no hover.
- **Faixa de cabeçalho do card (`.card-faixa`):** `--graphite-100` na largura toda, sem linha, cantos de cima do card; texto de apoio em `--graphite-500` (5,4:1) e destaque em `--crimson-600` (6,7:1). Aplicada nos cards Contato, Parceiros e Lançamento da Início e nas seções de Configurações. Texto de Configurações: "Nome e foto aparecem no cabeçalho da área restrita".
- **Verificação executada:** `npm run build`; Playwright a 1280px e 390px, 118 verificações (as anteriores, mais: cabeçalho na largura toda acima do menu, logo no cabeçalho, botão no topo do menu, grupo abrindo e fechando, cards sem sombra, faixa com o token e o contraste, dicas e painel fora do menu sem deslocar os ícones). O teste visual achou e corrigiu um erro: com o menu recolhido, o painel de subitens fazia o menu rolar de lado e sumir com os ícones.

## 2026-11-23 · Área restrita consome o Design System Dani Moscatelli (D-040), publicado

- **Sincronização (como na FindLook):** `design-system/README.md`, `design-system/arquivos.txt` (por enquanto só `src/styles/theme.css` → `public/design-system/theme.css`), `design-system/versao.txt` (commit `e334fe5111df7200188e2f33afcbc161783fc6f3` do DS), `scripts/sincronizar-design-system.sh` e `.github/workflows/sincronizar-design-system.yml` (todo dia e pelo botão Run workflow; copia, roda `npm run build`, abre ou atualiza o PR "Sincroniza o design system Dani Moscatelli"; em falha, abre uma issue). `design-system/.ultimas-mudancas.txt` no `.gitignore`.
- **`theme.css` no navegador, sem Tailwind:** cada página de `public/admin/` carrega `/design-system/theme.css?v=e334fe5` antes de `admin.css`. As variáveis de `:root` valem; `@custom-variant`, `@theme inline` e os `@apply` são ignorados. A camada `@layer base` do DS também vale (tamanhos de `label`, `input`, títulos), abaixo do `admin.css`. `fonts.css` não foi copiado: a Plus Jakarta Sans já vem do Google Fonts nas páginas.
- **`admin.css`:** sem paleta própria (saíram `--red`, `--dark`, `--muted` antigo, `--line`, `--bg`, `--track`, `--s1`–`--s6`, `--slate`, `--seq`). Só tokens do DS; os únicos aliases são os raios `-sm/-lg/-xl` (mesmo cálculo do `@theme` do DS), `--radius-full` e `--sobreposicao` (o DS usa preto a 50% nas janelas, sem token). Botões no padrão do `button.tsx` (40px, cantos `--radius`, 15px seminegrito; principal `--primary`; secundário de contorno `--border-strong`; desabilitado `--disabled`/`--disabled-foreground` com `not-allowed` e sem mudar no hover); campos de 40px com borda `--input` e anel `--ring`; caixas de seleção de 20px; abas no padrão do `tabs.tsx`; selos de estado com fundo `-muted`, ponto na cor do estado e texto em grafite; dica, painel de subitens, menu do perfil, aviso rápido e janela de confirmação com `--popover`, `--border`, sombras e raios do DS; movimento com `--duration-*` e `--ease-*`.
- **Páginas (`public/admin/*/index.html`):** estilos próprios passaram para os tokens do DS (verde, azul e âmbar viraram `--success`, `--info` e `--warning`; cinzas viraram `--muted`, `--border` e a escala grafite); botões de cada página usam o visual central do `admin.css`.
- **Gráficos da pesquisa (`public/admin/pesquisas/`):** só `var(--chart-N)`, `--chart-neutral` e `--chart-seq-*`, com as regras do DS: um foco por gráfico (tom 1) e o restante no tom 6; "Prefiro não informar" e sem destaque no neutro; 1º/2º/3º nos tons 1, 2 e 3; escalas ordenadas do cinza ao vermelho (com 5 passos, começa no tom 7); funil com a etapa da maior perda no tom 1; nenhum texto sobre a cor (o percentual da barra segmentada fica acima dela); sem trilho cinza atrás das barras; dica no padrão do Tooltip do DS.
- **Verificação executada:** script de sincronização rodado duas vezes (cópia idêntica ao DS, confirmada com `cmp`; a segunda rodada não muda nada); YAML do workflow lido sem erro; `npm run build`; navegador (Chromium, Playwright) com Supabase simulado só no teste, a 1280px e 390px, 101 verificações (menu recolhível e perfil; as 8 páginas sem erro de JavaScript e sem rolagem horizontal; tokens do DS aplicados; botão desabilitado com as cores do `--disabled`; 144 marcas de gráfico com `--chart`, nenhuma com cor escrita à mão; campo de 40px no login). Busca por cores hexadecimais em `admin.css`, `admin.js` e nas páginas: só sobra o traço do ícone de busca (SVG dentro de `url()`, com o valor do `--muted-foreground`).
- **Pendente:** ver com a dona do produto; publicar. O workflow só roda depois de estar no `main`.

## 2026-11-23 · Área restrita: menu lateral recolhível, perfil no cabeçalho e cabeçalho branco (D-039), publicado

- **Menu lateral (`public/admin/admin.js` e `public/admin/admin.css`):** a partir de 1024px, expandido (ícone e nome, 248px) ou recolhido (só ícones, 72px), pelo botão "Recolher menu" / "Expandir menu" na base do menu (ícone de painel no estilo do menu; `aria-expanded`, `aria-controls`, anel de foco; recolhido, só ícone com `aria-label`). A largura anima em 0,3 s com a curva do site (`cubic-bezier(.16, 1, .3, 1)`); com "menos movimento", troca na hora. A escolha fica no `localStorage` (`dm-admin-menu-recolhido`, com try/catch) e é aplicada antes de o menu ser montado, sem piscar.
- **Recolhido:** nomes escondidos só visualmente (continuam como nome acessível); dica com o nome ao passar o mouse ou focar pelo teclado; Escape esconde a dica; item ativo continua destacado (o item principal também, quando a página atual é um subitem); contador vira selo no canto do ícone; logo só com o símbolo. Subitens (Parceiros e Projetos) abrem num painel ao lado ao passar o mouse ou focar o item principal; o painel é alcançado pelo Tab e Escape fecha e devolve o foco ao item principal.
- **Perfil no cabeçalho, à direita do sino:** foto, nome e seta; abre um menu com nome, e-mail, Configurações e Sair (`aria-expanded`; Escape fecha e devolve o foco ao botão; clique fora fecha; setas navegam). Saiu do menu lateral. No celular, o nome fica só para leitores de tela.
- **Cabeçalho branco** (mesmo fundo do menu, `--card`) com borda inferior `--line`, continua fixo no topo; o conteúdo segue no cinza claro.
- **Abaixo de 1024px:** sem recolher; o menu continua abrindo pela esquerda pelo botão do menu (agora com o logo no topo).
- **Cache:** `admin.js` e `admin.css` com `?v=20261123c` em todas as páginas da área restrita.
- **Verificação executada:** `npm run build`; navegador (Chromium, Playwright) com o Supabase simulado só no teste, a 1280px e 390px: 66 verificações passaram (recolher pelo clique, por Enter e por Espaço, `aria-expanded`, escolha mantida ao recarregar já em 72px, dica e painel de subitens no mouse e no teclado, Escape, perfil abrindo e fechando, cabeçalho branco, sem rolagem horizontal, menos movimento, celular sem o botão de recolher e com os nomes visíveis mesmo com o recolhido guardado, as 8 páginas carregando sem erro). O teste encontrou e corrigiu um erro: com o recolhido guardado, o celular escondia os nomes do menu.
- **Pendente:** ver com a dona do produto; publicar.

## 2026-11-23 · Pesquisa Moda em Curitiba: identificação no início, uma participação por pessoa, vantagens e tela final com confete (D-034), publicado

- **Banco:** `supabase/migrations/20261123180000_pesquisa_identificacao.sql` (não aplicada): `pesquisa_respostas` ganha `nome`, `email`, `whatsapp`, `identificacao_em`, `identificacao_versao` e `identificacao_texto`, com índices únicos por pesquisa para e-mail (sem diferenciar maiúsculas) e WhatsApp.
- **Função `pesquisa` (`supabase/functions/pesquisa/index.ts`, não publicada):** nova ação `verificar` (e-mail ou WhatsApp já usado); `enviar` exige `identificacao` com `ciente: true` e devolve 409 se já houver participação; "Sim" nos avisos grava em `pesquisa_interessados` com a autorização v2. Questionário `moda-curitiba-v5-2026-11-23` com os textos `identificacao` (v1) e `consentimento` (v2).
- **Página (`pesquisa/moda-curitiba/index.html`, `src/pesquisa-moda.ts`, `src/pesquisa-moda.css`):** etapa "Antes de começar" (nome, e-mail, WhatsApp, aviso da LGPD e confirmação), conferida no servidor antes da primeira pergunta. Abertura com o item "Vantagens exclusivas" e o item de privacidade citando a LGPD. A última etapa ficou só com Sim ou Não, com a nota da autorização. Telas finais em card branco, confete saindo do selo de sucesso para quem concluiu tudo (desligado com "menos movimento") e nova tela "Você já participou". O bloqueio por aparelho saiu.
- **Ajustes pedidos pela dona:** "já participou" em vermelho no título; sem o coração em "Obrigada por participar!"; ícone de presente no box rosa da tela final (texto centralizado); item de privacidade da abertura mais curto ("Seus dados ficam protegidos e são usados só nesta pesquisa."), já que o detalhe aparece na identificação; textos da abertura centralizados, com os boxes de informação alinhados à esquerda.
- **Política de Privacidade:** seção 8 reescrita (identificação, respostas ligadas à identificação com acesso restrito, avisos opcionais, base legal, exclusão).
- **Verificação executada:** `npm run build`; função empacotada com `esbuild` e testada com banco simulado (15 casos: identificação faltando ou inválida, sem confirmação, reenvio do mesmo envio, `verificar` com e-mail em maiúsculas e WhatsApp formatado, e-mail e WhatsApp repetidos com 409, encerrada na Q1 identificada, interessados com autorização v2); migração num Postgres 16 local (duplicados barrados, WhatsApp inválido barrado, exclusão libera o e-mail); fluxo no celular com Playwright e servidor simulado (erros da identificação, "já participou", Voltar da Q1, novidades, envio com identificação, confete, recarregar sem confete, nova aba sem bloqueio, rascunho local sem dados pessoais, retorno em outra sessão volta à identificação e continua na pergunta salva, 409 no envio, encerramento na Q1); capturas no celular e no computador; sem erros no console.
- **Publicado em 23/11/2026** (autorizado pela dona): migração aplicada, função `pesquisa` publicada e site publicado.

## 2026-11-23 · Pesquisa Moda em Curitiba: pergunta 8 com todas as respostas escritas e topo claro no celular, publicado

- **Pedido:** a escala de bolinhas também não ficou intuitiva. Todas as respostas precisam aparecer escritas e parecer clicáveis, inclusive para pessoas de mais idade. O topo do celular ficava escuro ao rolar e deve seguir o padrão claro.
- **Pergunta 8 (`src/pesquisa-moda.ts`, `src/pesquisa-moda.css`):** um cartão por característica, com as 6 respostas ("Muito fácil" a "Muito difícil" e "Não se aplica") em cartões clicáveis com bolinha de marcação, iguais aos das outras perguntas. No celular, uma resposta por linha. No computador, as 5 lado a lado e "Não se aplica" abaixo, com borda tracejada. Os dados continuam "1" a "5" ou "na"; servidor e painel não mudam.
- **Texto:** "Nem fácil nem difícil" passou a "Médio" (pedido da dona), no questionário e nos rótulos do painel; versão do questionário `moda-curitiba-v4-2026-11-23`. A função `pesquisa` precisa ser publicada de novo junto com o site.
- **Texto da pergunta 8 (pedido da dona):** "Quando procura roupas e acessórios, o que é mais fácil ou difícil de encontrar?", com as características "Roupas que combinam com meu estilo", "Peças disponíveis no meu tamanho", "Roupas que vestem bem no meu corpo", "Peças com o tecido e a qualidade que procuro" e "Acessórios que combinam com meu gosto" (mesmos identificadores). No painel, as frases da aba Inteligência e dos destaques que citam a característica foram reescritas ("O mais difícil de encontrar: …", "O que mais pesa na satisfação: …") e passam "meu/minha" para "seu/sua".
- **Topo:** no celular, ao rolar, a barra fica clara e translúcida, com o texto escuro. No computador, continua como antes.
- **Verificação executada:** `npm run build`; fluxo completo no celular (Playwright, iPhone 13) com envio simulado, conferindo os valores da pergunta 8; capturas no celular e no computador, incluindo o topo depois de rolar; setas do teclado; sem rolagem lateral e sem erros no console.

## 2026-11-23 · Contatos: e-mails enviados direto para contato@ no painel e aviso no Gmail (D-035), publicado

- **Pedido:** os e-mails que chegam em contato@danimoscatelli.com.br devem aparecer na página Contatos, com tag que diferencie formulário do site e e-mail direto; só os que chegarem daqui pra frente; sem custo; aviso de cada e-mail novo no Gmail da dona.
- **Banco (`supabase/migrations/20261123190000_contatos_email_direto.sql`, não aplicada):** `contatos.origem` ("site" ou "email") e `contatos.email_ref` (único); "melhores dias" obrigatório só para o formulário; o aviso "Novo contato pelo site" não dispara para e-mail direto; tabela `caixa_email_estado` (ponto de leitura da caixa, endereço do aviso e último erro; sem acesso pelo site); agendamento `importar-emails` a cada 5 minutos.
- **Função `importar-emails` (não publicada):** lê a caixa de entrada da Hostinger por IMAP em modo só leitura (`EXAMINE`, `BODY.PEEK`: não apaga nem marca como lido), com a senha no segredo `CONTATO_IMAP_SENHA`. Na primeira execução só marca o ponto de partida. Remetente novo vira contato com origem "email"; remetente que já tem conversa recebe a mensagem no histórico, que volta a ficar não lida. Ignora remetentes @danimoscatelli.com.br (avisos do próprio site). Lê até 5 MB por e-mail; anexos ficam só na caixa, com uma nota na mensagem. Manda aviso (Resend, remetente site@) para o endereço em `caixa_email_estado.notificar_para`, com link para o painel.
- **Painel (`public/admin/contatos/index.html`):** selo "E-mail" ou "Site" na lista (no computador, ao lado da data com um divisor; no celular, abaixo do ícone) e no cabeçalho da mensagem; cada linha em três níveis (nome; assunto; e-mail e empresa), com a data numa coluna própria que o texto não invade; ficha do e-mail direto só com nome, e-mail, assunto e mensagem; a busca também encontra por "e-mail" ou "site".
- **Política de Privacidade:** item sobre e-mails enviados para contato@ na seção 1.
- **Verificação executada:** `npm run build`; função empacotada com `esbuild` e testada em Node contra um servidor IMAP simulado com TLS e banco simulado (primeira execução só marca o ponto; 5 e-mails com nome e assunto codificados, aviso do próprio site ignorado, remetente existente no histórico, HTML em ISO-8859-1 com anexo, e-mail de 3 MB com linha "A9 OK" no corpo; nova execução sem novidades; reprocessamento sem duplicar nem repetir aviso; senha errada guarda o erro; sem senha não faz nada; cerca de 0,5 s); painel com dados simulados no computador e no celular (selos, busca, ficha), sem erros no console. **Não testado com a caixa real** (depende da senha cadastrada).
- **Publicado em 23/11/2026:** função `importar-emails` (v2), migração aplicada, endereço do aviso gravado em `caixa_email_estado`, site publicado (conferido no ar). Na primeira tentativa, a caixa recusou a senha ("Authentication failed"), então o agendamento foi pausado para não bloquear a caixa. A função passou a ignorar espaços nas pontas do segredo. Depois que a dona corrigiu a senha, o login funcionou: ponto de partida gravado (sem importar e-mails antigos) e agendamento reativado.
- **Pendente:** conferir com um e-mail de teste real enviado para contato@ (painel e aviso no Gmail).

## 2026-11-23 · Painel de pesquisas: novos gráficos e aba Inteligência, não publicado

- **Resultados com a forma certa para cada dado** (método da skill de visualização de dados, cores do design system): funil de participação; barra segmentada para Sim/Não (Q1); barras empilhadas 1º/2º/3º para a classificação (Q2); ranking com destaque na primeira e as demais em cinza-azulado (Q2.1, Q5, Q6, Q9, Q10, gênero); escala ordenada em tons de vermelho com número em destaque (Q3, Q7); colunas por faixa de nota com média, mediana e extremos (Q4); barras divergentes fácil × difícil a partir do neutro, em escala comum (Q8); colunas na ordem natural (faixa etária). Toda marca tem dica ao passar o mouse ou focar pelo teclado e cada gráfico tem "Ver números" (tabela).
- **Aba Inteligência:** cartões calculados cruzando as respostas completas, sem IA, em três grupos: Negócio (para onde vai a compra principal, procuram em Curitiba e compram fora, por que a compra vai para fora, venda que não acontece, espaço da segunda mão), Comportamento (satisfação por canal principal, caminho busca → compra, desistência por frequência de não encontrar, característica que mais pesa na satisfação, descoberta de lojas por quem não sabe onde encontrar, hábitos por faixa etária) e Estratégia (hipóteses para investigar: onde concentrar a investigação de oferta, demanda que poderia ficar em Curitiba, canal com mais alcance, quem pediu novidades). Cada cartão mostra a base; "Amostra pequena" abaixo de 30; recortes só com 5 ou mais respostas.
- **Cartão de insight (modelo enviado pela dona do produto):** etiqueta e sinal no topo (ícone + texto; verde para oportunidade, âmbar para atenção, vermelho para perda, cinza para informação), título com o achado, descrição, painel com base, recorte, números em destaque e barras, "O que isso significa?" e "Próximo passo sugerido". Fundo claro, como o resto do painel.
- **Verificação executada:** painel com login e respostas fictícias, no computador e no iPhone 13; 15 cartões gerados; sem erros de JavaScript.

## 2026-11-23 · Painel de pesquisas: excluir respostas, não publicado

- Nova aba **Respostas** em Projetos > Pesquisas: cada participação (número, data e hora, situação, resumo com perfil e onde mais comprou) abre todas as respostas em texto; botão **Excluir** em cada uma, com confirmação.
- **Apagar todas as respostas:** confirmação com a palavra APAGAR; apaga as participações e os relatos da pesquisa; os contatos da aba Interessados continuam (têm exclusão própria). As duas ações ficam no log da plataforma.
- Usa a permissão de exclusão da administradora que já existia na tabela `pesquisa_respostas` (sem migração).
- **Verificação executada:** painel com login e dados simulados (42 respostas fictícias): detalhe, exclusão de uma (números e gráficos atualizados, continua na aba Respostas), "Apagar todas" bloqueado até digitar APAGAR e depois vazio; sem erros de JavaScript.

## 2026-11-23 · Pesquisa Moda em Curitiba: cabeçalho do design system, "Voltar para o site", rascunho guardado e avatar, publicado

- **Cabeçalho:** modelo "Full-width bar" do design system: logo completo à esquerda (ícone no celular), "Voltar para o site" com ícone à direita; transparente no topo, fundo escuro translúcido ao rolar com o logo virando ícone; some ao rolar para baixo e volta ao subir; a barra de progresso continua visível.
- **Sair da pesquisa:** com a pesquisa em andamento, o "Voltar para o site" (e o logo) abre a janela "Quer mesmo interromper a pesquisa?" com "Continuar respondendo" e "Sair e voltar para o site"; na apresentação e nas telas finais, vai direto para a página inicial.
- **Rascunho:** as respostas ficam guardadas neste aparelho (localStorage) a cada toque, por 30 dias; ao voltar pelo link, a pessoa continua de onde parou. Nome, e-mail e WhatsApp ficam só na sessão do navegador. O rascunho é apagado ao enviar.
- **Telas finais:** assinatura com o avatar da Dani (`/dani-assinatura.webp`, a mesma foto já usada no site).
- **Verificação executada:** computador e iPhone 13 simulados: estados do cabeçalho, janela de confirmação, "Continuar respondendo", saída para a página inicial, retomada numa aba nova com as respostas marcadas, contato fora do localStorage, avatar nas telas finais; sem erros de JavaScript.

## 2026-11-23 · Store tirada do ar, publicado

- Pedido da dona do produto: a Store sai do site e do painel.
- Removidos `public/store/` (página e imagens) e `public/admin/store/`; item "Store" fora do menu da área restrita.
- `public/_redirects`: `/store` e `/admin/store` levam ao início do site e do painel (302, temporário).
- Os dados (tabelas `loja`, `marcas` e `produtos`) continuam no banco; nada foi apagado. Os arquivos ficam no histórico do git para voltar, se preciso.
- **Verificação executada:** build sem a pasta `store`; menu do painel sem "Store", sem erros de JavaScript.

## 2026-11-23 · Pesquisa Moda em Curitiba: cabeçalho, pergunta 2 classificada e perfil (gênero e faixa etária), publicado

- **Cabeçalho:** pílula branca centralizada com o logo e o nome do estúdio, no estilo do menu da Home, sem links (pedido da dona do produto).
- **Pergunta 2:** novo texto ("Onde você realizou a maior parte...") e formato de classificação: de 1 a 3 escolhas, na ordem dos toques (1º é onde mais comprou); "Não comprei" fica sozinha e encerra. A 2.1 aparece se marketplaces ou lojas online de outras cidades estiver em qualquer posição. Gravada como lista ordenada.
- **Perfil (fora da contagem das 10):** etapa "Sobre você" depois da pergunta 10 e antes do relato: gênero (Feminino, Masculino, Não binário, Outro com texto, Prefiro não informar) e faixa etária (18 a 24 ... 65 ou mais, Prefiro não informar); obrigatória, com "Prefiro não informar"; no celular, listas suspensas; no computador, cartões e pílulas. Gravado em `respostas.perfil`.
- **Questionário:** versão `moda-curitiba-v3-2026-11-23`. **Função `pesquisa`:** tipo `ranking`, condição pela lista, perfil obrigatório nas completas.
- **Painel:** gráfico da pergunta 2 com 1º lugar e "entre as 3"; card "Perfil de quem respondeu"; destaque "onde mais compraram (1º lugar)".
- **Política de Privacidade:** a seção 8 menciona gênero e faixa etária.
- **Verificação executada:** função no Node com banco simulado (33 casos); página no iPhone 13 e no computador (classificação, limite, exclusiva, 2.1 com a opção em 2º lugar, perfil com lista suspensa e com cartões, "Outro" com texto, Voltar, envio); painel com respostas fictícias, sem erros de JavaScript.
- **Ordem de publicação:** primeiro o site, depois a função.

## 2026-11-23 · Pesquisa Moda em Curitiba: pergunta 2.1 (motivos para comprar fora de Curitiba), publicado

- **Questionário (`supabase/functions/pesquisa/questionario.json`, versão `moda-curitiba-v2-2026-11-23`):** pergunta 2.1, múltipla escolha com até 3 opções e "Outro motivo" com texto, mostrada só para quem escolheu na pergunta 2 "Marketplaces" ou "Lojas online de outras cidades"; fora da contagem das 10 perguntas.
- **Função `pesquisa`:** pergunta condicional exigida e gravada só para quem se aplica; enviada por quem não se aplica, é ignorada.
- **Página:** a 2.1 aparece depois da 2 só quando se aplica (Continuar e Voltar pulam a etapa para os demais); rótulo "Pergunta 2.1"; progresso continua contando as 10.
- **Painel:** gráfico da 2.1 calculado só entre quem viu a pergunta, com nota explicando quem a recebeu; destaque com o motivo mais citado.
- **Verificação executada:** função no Node com banco simulado (2.1 exigida, limite de 3, "outro" sem texto, válida, ignorada para quem não se aplica); página no iPhone 13 simulado (aparece com marketplaces e lojas online de outras cidades, pula com lojas físicas, Voltar, limite, envio com a 2.1); painel com respostas fictícias, sem erros de JavaScript.
- **Ordem de publicação:** primeiro o site, depois a função (a função nova exige a 2.1; a página antiga não a envia).

## 2026-11-23 · Pesquisa pública Moda em Curitiba e Projetos > Pesquisas (SITE-02), publicado

- **Banco:** migração `supabase/migrations/20261123120000_pesquisas.sql` (aplicada no Supabase em 23/11): tabelas `pesquisas` (liga e desliga), `pesquisa_respostas` (situação, respostas em JSON, relato, interesse, visto em) e `pesquisa_interessados` (nome, e-mail, WhatsApp, consentimento com data, versão e texto). RLS: o público não acessa as tabelas; a administradora lê, marca como visto, exclui e liga ou desliga a pesquisa.
- **Função `pesquisa` (pública, publicada em 23/11, versão 1):** `status` devolve se está no ar e o questionário; `enviar` valida tudo no servidor (opções, limite de 3, exclusivas, "outro" com texto, matriz completa, nota de 0 a 10, relato até 2.000 caracteres, e-mail, WhatsApp brasileiro, consentimento), define a situação pelas regras de encerramento e grava uma vez por envio.
- **Página `pesquisa/moda-curitiba/` (`src/pesquisa-moda.ts` e `.css`):** apresentação, uma pergunta por etapa com progresso, Voltar e Continuar; rascunho na sessão; telas de encerramento, agradecimento e "fora do ar"; participação concluída neste aparelho mostra a tela final sem novo envio; política de privacidade em janela.
- **Área restrita:** menu Projetos > Pesquisas (`public/admin/pesquisas/`): lista; painel com status, link para copiar, ver a pesquisa, tirar do ar e colocar no ar; números, destaques, gráfico de cada pergunta, relatos e interessados (com exclusão). Sino e contador do menu com respostas novas, marcadas como vistas ao abrir o painel.
- **Política de Privacidade:** seção 8 sobre a pesquisa (finalidade, separação dos contatos, prazo, cancelamento e exclusão).
- **Verificação executada:** função no Node com banco simulado (21 casos: encerramentos, duplicidade, limites, exclusivas, contato inválido, fora do ar, robô); migração num Postgres 16 local (RLS: público sem acesso, administradora lê e liga ou desliga, não altera respostas); página e painel no navegador (iPhone 13 e computador) com servidor simulado: fluxo completo, encerramentos, Voltar, máscara do WhatsApp, troca de Sim para Não limpa o contato, envio único; painel com 42 respostas fictícias, sem erros de JavaScript. Nenhuma resposta real foi enviada.
- **Publicação (23/11):** site publicado; página e painel conferidos no ar.
- **Pendente:** teste real de ponta a ponta; validar o tempo de resposta (3 a 5 min).

## 2026-11-27 · Painel de pesquisas: Inteligência em Achados e Oportunidades, Voz do cliente em card único com ranking, não publicado

- **Pedido da dona do produto:** os textos dos insights estavam confusos e dois cards pareciam iguais; Destaques fora do padrão de card; Voz do cliente em card único com accordions e ranking das dores; diluir os Destaques nos cards; dividir a Inteligência em duas seções; tirar a oportunidade de dentro dos cards de achados.
- **Textos dos insights (`public/admin/pesquisas/index.html`, `inteligencia()`):** "Procura aqui, compra fora" com título claro ("Começar a procura em Curitiba nem sempre significa comprar aqui") e sem afirmar uma causa que a pesquisa não mede; "Vendas perdidas" fala do que acontece quando não encontram a peça; o card de comparação virou "Quem mais desiste", com números absolutos e porcentagem, e título correto quando a diferença é inversa; o qualificador "uma parte menor" virou "uma minoria".
- **Destaques diluídos:** a seção Destaques saiu da aba. O número principal foi para o card correspondente (compra fora/comércio local, por que compram fora, vendas perdidas, o que mais dificulta, segunda mão), num bloco à direita do título (embaixo no celular). Sem card correspondente e por isso fora da aba: público da pesquisa, onde a procura começa, nota geral, correspondência e dificuldade frequente (continuam na aba Resultado). Antes disso, os cards de Destaques já tinham passado a seguir a regra de cards aninhados do DS (sem sombra interna).
- **Duas seções:** "Achados" (os assuntos, cada um com seus insights, incluindo a Voz do cliente) e "Oportunidades" (antes "Por onde o Find Look pode começar"). Nos achados o card mostra só "O que descobrimos" e "O que isso significa".
- **Voz do cliente:** um card único: resumo no topo e "Ranking das dores nos relatos" em accordion (padrão Accordion do DS: posição, nome, barra proporcional e quantos relatos; o 1º vem aberto; animação respeita "menos movimento"; no PDF todos saem abertos).
- **Verificação executada:** dados fictícios e servidor simulado (computador e iPhone 13): seções e números conferidos, accordion abre e fecha com `aria-expanded`, nenhuma oportunidade nos achados, sem rolagem lateral, sem erros de JavaScript.

## 2026-11-26 · Painel de pesquisas: cabeçalho no padrão do DS e números do topo unificados no funil, publicado (#242)
- **Pedidos da dona do produto:** o título estava fora do padrão do DS e os botões muito em cima do texto; os números do topo (participações, completas, fora do público, querem novidades) repetiam o bloco "Quem chegou até onde": unificar e deixar na aba Resultado.
- **`public/admin/pesquisas/index.html`:** cabeçalho no padrão PageHeader do DS (sobretítulo "PESQUISA" 12 px em vermelho, título 32/40 px negrito com fonte de destaque, descrição 17 px), com Exportar relatório e Apagar pesquisa alinhados embaixo, à direita (no celular, abaixo do texto, com 20 px de espaço). A fileira de números do topo saiu do painel e do PDF; o funil "Quem chegou até onde" (aba Resultado) ganhou a frase com quem ficou fora do público (fora de Curitiba e RMC, não comprou) e os contatos guardados.
- **Ajuste pedido em seguida:** o cabeçalho com sobretítulo não agradou; virou um card com título (26 px; 22 px no celular) e descrição em cima e uma barra de ações embaixo, separada por uma linha (Exportar relatório e Apagar pesquisa à direita; no celular, um embaixo do outro, na largura toda). Sem rolagem lateral no celular.
- **Ajuste pedido em seguida:** cabeçalho e card do link juntos num cabeçalho único: situação (No ar / Fora do ar) em cima, título e descrição, o link com Copiar, Abrir e QR Code, e a barra de ações (última resposta à esquerda; Tirar do ar, Exportar relatório e Apagar pesquisa à direita; no celular, botões na largura toda). O card separado do link (`.pa-topo`) deixou de existir. Testado: QR Code lido corretamente, bloqueio e exclusão da pesquisa, "Apagar tudo", sem rolagem lateral.
- **Ajuste pedido em seguida:** os botões de objetivos diferentes (Tirar do ar, Exportar relatório, Apagar pesquisa) ficam separados por mais espaço e uma linha fina entre eles (vertical no computador, horizontal no celular).
- **Ajuste pedido em seguida (modelo enviado pela dona do produto):** cabeçalho refeito conforme a imagem. Título e descrição soltos, com Exportar relatório (ícone de documento) e Apagar pesquisa no canto superior direito. Embaixo, um card com: "No ar" e a última resposta; o link com o botão de copiar dentro do campo; Abrir, QR Code e **Compartilhar** (novo: abre o compartilhamento do aparelho; onde não houver, copia o link e avisa); e, separado, Tirar do ar em fundo vermelho-claro. Apagar pesquisa aparece na cor normal mesmo no ar, como no modelo, mas continua bloqueado (aviso + tremida). No celular: os dois botões do topo empilhados, link na largura toda, Abrir/QR Code/Compartilhar em três colunas com ícone sobre o texto e Tirar do ar na largura toda. Testado (computador e iPhone 13): menu de exportar abre por cima do card, copiar com retorno (✓ e aviso), compartilhar, QR Code lido corretamente, bloqueio e exclusão da pesquisa, sem rolagem lateral.
- **Ajuste pedido em seguida:** a descrição quebra a linha depois de "analisados em" quando a primeira linha cabe inteira (computador); em telas estreitas e no celular o texto corre normalmente. Conferido em 1280, 1024, 800, 700 e 390 px, sem rolagem lateral.
- **Verificação executada:** painel com dados fictícios e servidor simulado (computador e iPhone 13): sem a fileira de números no topo; frase do funil correta; botões separados do texto (no celular, 20 px abaixo da descrição); sem erros de JavaScript.

## 2026-11-26 · Pesquisa: tempo de resposta recalculado ("Leva de 5 a 8 minutos"), publicado (#241)
- **Pedido da dona do produto:** corrigir "Leva de 3 a 5 minutos" e recalcular.
- **Cálculo (banco de produção, só leitura):** tempo entre o início (identificação, quando o progresso começa a ser salvo) e a conclusão de 32 participações completas: mediana 6,1 min; metade das pessoas entre 4,8 e 8,2 min; mínimo 3,1 e máximo 20,2. Arredondado para "5 a 8 minutos".
- **Arquivos:** `pesquisa/moda-curitiba/index.html` (cartão da apresentação e descrição para compartilhamento) e `src/pesquisa-moda.ts` (mensagem de "Indique a pesquisa").
- **Verificação executada:** página da pesquisa no navegador (iPhone 13) com servidor simulado mostra "Leva de 5 a 8 minutos"; sem erros de JavaScript.

## 2026-11-26 · Painel de pesquisas: apagar pesquisa, "Apagar tudo" nas Ações, Destaques no padrão do DS, insights sem buracos e "Voz do cliente", publicado (#240)
- **Pedidos da dona do produto:** (1) "Exportar relatório" e "Apagar pesquisa" no canto superior direito do cabeçalho; apagar a pesquisa inteira só fora do ar e sempre com confirmação; (2) "Apagar todas as respostas" vira "Apagar tudo" no menu Ações da aba Dados; (3) cards de Destaques no padrão do DS; (4) títulos dos insights com a descoberta em linguagem natural, sem estatística (números ficam em "O que descobrimos"), e um formato sem "buracos"; (5) seção "Voz do cliente" com outro formato, mais espaço; (6) a IA dos relatos estava demorando demais.
- **`public/admin/pesquisas/index.html`:** cabeçalho com `#cab-acoes` (Exportar relatório e Apagar pesquisa; no celular, em largura total). "Apagar pesquisa" no ar fica apagado e mostra o aviso "Não é possível apagar uma pesquisa no ar…"; fora do ar pede confirmação digitando APAGAR e apaga a linha de `pesquisas` (respostas, interessados e análise da IA saem em cascata), volta para a lista. Card "Recomeçar do zero" removido; "Apagar tudo" no menu Ações (mesma confirmação de antes). Destaques no cartão de KPI do DS (rótulo e valor juntos à esquerda, ícone à direita, padding 20, gap 16, sombra), com 1 coluna no celular. Insights: títulos qualitativos ("Procurar roupa por foto já é um hábito"); um cartão por linha, com "O que descobrimos", "O que isso significa" e "Oportunidade" lado a lado (empilhados no celular). "Voz do cliente": resumo (frustração mais comum, leitura geral da IA, oportunidade, botão da IA) e um bloco por tema com as falas lado a lado.
- **Migração `20261126120000_pesquisas_apagar.sql`:** política de exclusão em `pesquisas` só para administradora e só com `ativa = false`, e `grant delete`.
- **`supabase/functions/relatos-ia/index.ts`:** modelo rápido primeiro (gemini-2.5-flash-lite), raciocínio desligado nos modelos 2.5 (`thinkingBudget: 0`), tempo máximo de 20 s por tentativa e prazo total de 55 s, saída menor; pedido explícito de acentos e cedilha (a leitura geral tinha vindo sem acentos).
- **Verificação executada:** painel com dados fictícios e servidor simulado (computador e iPhone 13): no ar, "Apagar pesquisa" não abre a confirmação e mostra o aviso; fora do ar, confirmação só libera com APAGAR e envia a exclusão de `pesquisas`, voltando para a lista; "Apagar tudo" no menu Ações apaga respostas e interessados; Exportar relatório no cabeçalho com PDF e Excel; títulos sem números; seção Voz do cliente com resumo e temas; sem erros de JavaScript. Função no Node com Gemini simulado: modelo lite primeiro com `thinkingBudget: 0`; 503 e tempo esgotado passam para o próximo modelo.

## 2026-11-26 · Painel de pesquisas: Destaques na Inteligência, temas nas duas abas e títulos com a descoberta, publicado (#238)
- **Pedidos da dona do produto:** (1) os Destaques fazem mais sentido na aba Inteligência; (2) a Inteligência deve seguir o padrão de cards e de organização da aba Resultado; (3) a aba Resultado dividida em assuntos, com setores para as perguntas; (4) o título de cada cartão de insight já deve trazer a descoberta.
- **`public/admin/pesquisas/index.html`:** Destaques saem da aba Resultado e abrem a aba Inteligência (texto: "O principal da pesquisa em números…"; o selo "Amostra pequena" virou um aviso no texto). Resultado: depois de "Quem chegou até onde", as perguntas ficam em 5 temas com título e descrição (Onde compram, Notas das compras, Como procuram, Dificuldades, Quem respondeu), mantendo a ordem. Inteligência: mesmos temas com título e descrição acima de uma grade de 2 colunas (1 no celular) de cards brancos no padrão dos cards da aba Resultado. Títulos dos insights reescritos com a descoberta e o número (ex.: "24 de 36 pessoas já procuram roupa mandando foto para as lojas"); itens de dificuldade como ações ("encontrar roupas que vestem bem no corpo").
- **Verificação executada:** painel com dados fictícios e servidor simulado (computador e iPhone 13), com 42 e 9 participações: Resultado sem Destaques e com os 5 temas (todas as perguntas e perfis distribuídos, nenhum card solto); Inteligência com Destaques no topo e 6 temas; títulos revisados no texto gerado; sem erros de JavaScript.
- **Publicação (26/11):** painel publicado pelo PR #238 e conferido no ar. Só a área restrita mudou.

## 2026-11-25 · Painel de pesquisas: WhatsApp e e-mail na ficha da resposta, publicado (#236)
- **Pedido da dona do produto:** mostrar telefone e e-mail na ficha de resposta de cada pessoa.
- **`public/admin/pesquisas/index.html`:** a lista de respostas passa a carregar `email` e `whatsapp` (leitura só da administradora, como antes); a ficha ganha o bloco "Contato" no topo, com WhatsApp formatado (link para conversar) e e-mail (link para escrever), ou "Não informado". No celular o bloco fica em uma coluna.
- **Verificação executada:** painel com dados fictícios e servidor simulado (iPhone 13 e computador): contato aparece formatado com link correto; ficha sem contato mostra "Não informado"; sem erros de JavaScript. Banco de produção só consultado, nada alterado.
- **Publicação (25/11):** painel publicado pelo PR #236 e conferido no ar. Só a área restrita mudou.

## 2026-11-25 · Painel de pesquisas: QR Code do link da pesquisa, publicado (#234)
- **Pedido da dona do produto:** um QR Code no mesmo bloco do link; ao tocar, abre uma janela com o QR Code que leva ao endereço da pesquisa.
- **`public/admin/pesquisas/index.html`:** botão "QR Code" ao lado de Copiar e Abrir (só ícone no celular, com nome para leitores de tela). Janela com título, código (gerado no navegador pela biblioteca qrcode-generator 1.4.4, carregada do cdnjs só quando a janela abre), instrução "Aponte a câmera do celular…" e o endereço; estados de carregando e erro; fecha no X, no fundo e no Esc, com o foco voltando ao botão; entrada suave, sem movimento com "menos movimento".
- **Ajuste pedido em seguida:** fundo desfocado (blur de 8 px) atrás da janela do QR Code; o código continua lido corretamente.
- **Verificação executada:** painel com dados fictícios e servidor simulado, no iPhone 13 e no computador: o QR Code da captura de tela foi lido por um leitor de QR (jsQR) e abre `https://www.danimoscatelli.com.br/pesquisa/moda-curitiba/`; linha do link sem rolagem lateral; Esc fecha e devolve o foco; sem erros de JavaScript.
- **Publicação (25/11):** painel publicado pelo PR #234 e conferido no ar. Só a área restrita mudou.

## 2026-11-25 · Painel de pesquisas: Inteligência só com cartões de insight, para decidir o Find Look, publicado (#232)
- **Pedido da dona do produto:** a aba Inteligência deve extrair valor do que foi descoberto para decidir a construção do produto dela, o Find Look. Tudo em cartões de insight, didáticos, em linguagem natural, sempre com conclusão e oportunidade; sem o selo "Primeiros sinais", sem os rótulos abaixo das etiquetas, sem número de pergunta e sem gráficos (a leitura dos gráficos fica na aba Resultado).
- **`public/admin/pesquisas/index.html`:** novo cartão `insight()` com tema, título, "O que descobrimos", "O que isso significa" e "Oportunidade para o Find Look" (em destaque), e rodapé "Com base em N pessoas". Seções: Para onde vai a compra, A dor de encontrar, Como as pessoas procuram, Quem são essas pessoas, Na voz das pessoas e Por onde o Find Look pode começar. Comparações entre grupos só aparecem com 5 ou mais pessoas por grupo; as que faltam viram o cartão "O que vamos conseguir descobrir com mais respostas". Itens de dificuldade, formas de conhecer lojas e caminhos de procura reescritos em linguagem natural. Relatos: mesmo cartão, com citação de exemplo, e botão "Organizar os relatos com IA" (mesma função `relatos-ia`). Removidos o cartão antigo, os selos, as tabelas, as barras e os estilos sem uso.
- **Verificação executada:** painel com dados fictícios e servidor simulado (iPhone 13), com 42 e 9 participações: todos os cartões com os três blocos; nenhuma tabela, barra ou "pergunta N" na aba; textos revisados no texto completo gerado; IA simulada atualiza o cartão de relatos; sem erros de JavaScript.
- **Publicação (25/11):** painel publicado pelo PR #232 e conferido no ar. Só a área restrita mudou; banco e funções sem alteração.

## 2026-11-25 · Painel de pesquisas: aba Inteligência refeita para amostra pequena, publicado (#230)
- **Pedido da dona do produto:** mais cruzamentos e conclusões mais robustas sobre descobertas e oportunidades. Como a amostra pode ser pequena (9 respostas completas em 25/11), ela aprovou a versão adaptada: números como "quantas de quantas pessoas", grupos juntados, cruzamentos que só aparecem com 5 ou mais pessoas por grupo, selo de confiança e relatos agrupados por tema. Relatos agrupados por palavras-chave, sem inteligência artificial.
- **`public/admin/pesquisas/index.html` (`inteligencia()` reescrita):** seções "Para onde vai a compra", "A dor de encontrar", "Como as pessoas procuram", "Quem são", "O que dizem os relatos" e "Oportunidades a validar". Selo por cartão e faixa no topo: Primeiros sinais (menos de 20), Tendência (20 a 49), Mais consistente (50 ou mais). Cruzamentos novos (2 grupos, tabela "k de n"): dificuldade (pergunta 7 em 2 níveis) × desistência, troca de peça e compra fora; foto de referência × dificuldade, desistência e compra fora; contato com a loja antes de ir × esgotado, saber onde procurar e desistência; idade (até 34 × 35 ou mais) e Curitiba × Região Metropolitana × compra fora, dificuldade, desistência, segunda mão e foto. Cruzamento sem volume aparece como "Disponível com mais respostas", com quantas pessoas faltam em cada grupo. Oportunidades: as 3 dores da pergunta 8 com mais pessoas afetadas e a desistência entre elas; perfil de quem pediu os avisos × total. Textos de significado marcados como hipótese.
- **Política (aprovada pela dona do produto):** também passa a dizer "nome, WhatsApp e, se quiser, e-mail" na identificação.
- **Relatos com IA (pedido em seguida, plano gratuito do Gemini):** nova função `relatos-ia` (só administradora; envia ao Gemini apenas o texto dos relatos, numerados, com e-mails e telefones de 8 ou mais dígitos trocados por "[contato]"; devolve temas com resumo, ids e leitura geral; descarta números inventados; cache na nova tabela `pesquisa_relatos_ia`, migração `20261125120000_pesquisa_relatos_ia.sql`, RLS sem políticas). No card de relatos: botão "Agrupar com IA" (carregando, erro "IA ocupada" e volta ao agrupamento por palavras-chave), análise guardada aparece sem nova chamada, aviso quando chegam relatos novos ("Atualizar com IA"). Política de Privacidade (seção 4 e item "Respostas da pesquisa" da seção 8) com o uso da IA do Google nos relatos, sem dados de identificação, e o aviso de que no plano gratuito o Google pode usar o conteúdo. Testes: função no Node com banco e Gemini simulados (sem login 403; cache vazio; e-mail e telefone mascarados, ano "2023" mantido; ids inventados descartados; travessões trocados); painel com a função simulada (palavras-chave → "Agrupando…" → temas da IA, leitura geral e data; uma chamada de cache e uma de geração). Nenhum relato real enviado à IA.
- **Verificação executada:** painel com dados fictícios e servidor simulado (iPhone 13), com 42 e com 9 participações (36 e 8 completas): seções e selos corretos (Tendência e Primeiros sinais); com 8 completas, 5 cruzamentos trancados com quantas pessoas faltam; temas dos relatos com trechos; sem erros de JavaScript. Banco de produção só consultado (contagem), nada alterado.
- **Publicação (25/11):** tabela `pesquisa_relatos_ia` criada; função `relatos-ia` v1 no ar (chamada sem login recusada com 401); site, painel e política publicados pelo PR #230 e conferidos no ar. A IA ainda não foi rodada com os relatos reais: fica para a dona do produto tocar em "Agrupar com IA".

## 2026-11-25 · Pesquisa: "TikTok Shop" nos exemplos de marketplaces, publicado (#228)
- **Pedido da dona do produto:** incluir o TikTok Shop nas opções de loja online. Decisão dela: acrescentar aos exemplos (não criar opção nova), para manter comparáveis as respostas já recebidas.
- **`supabase/functions/pesquisa/questionario.json`:** pergunta 2 "Marketplaces (Shein, Shopee, Mercado Livre, TikTok Shop etc.)" e pergunta 5 "Pesquiso em marketplaces, como Shein, Shopee, Mercado Livre ou TikTok Shop". Identificadores das opções e versão do questionário sem mudança. Precisa publicar a função `pesquisa` (o painel usa os textos que ela devolve).
- **Verificação executada:** navegador (iPhone 13) com servidor simulado: textos novos nas perguntas 2 e 5; sem erros de JavaScript.
- **Publicação (25/11):** função `pesquisa` v17 no ar (questionário do `status` igual ao do repositório); site e painel publicados pelo PR #228; textos novos conferidos no código publicado. Sem envio de teste no site real (já há respostas reais); nada alterado no banco.

## 2026-11-24 · Painel de pesquisas: resposta nova só conta como vista ao abrir a aba Dados, publicado (#228)
- **Problema relatado:** a dona do produto respondeu a pesquisa e o aviso foi direto para "Já visualizadas": a resposta foi concluída às 20:42:01 e marcada como vista às 20:42:17, porque abrir a página da pesquisa marcava todas as respostas novas como vistas. (O celular dela também mostrava a versão antiga do sino, em cache.)
- **Decisão dela:** a resposta passa a contar como vista só ao abrir a aba Dados.
- **`public/admin/pesquisas/index.html`:** marcação movida de `painel()` para `marcarVistas()`, chamada ao abrir a aba Dados (uma vez; o estado local é atualizado para não repetir). Abrir a pesquisa em Resultado ou Inteligência não marca nada.
- **Verificação executada:** painel com dados fictícios e servidor simulado (iPhone 13): ao abrir (Resultado) 0 marcações; Inteligência 0; Dados 1 (as 3 novas); voltar a Dados não repete; sem erros de JavaScript. Banco de produção só consultado (horários da resposta), nada alterado.

## 2026-11-24 · Pesquisa: item respondido sai do vermelho na hora, publicado (#226)
- **Pedido da dona do produto:** depois que a pessoa responde um item obrigatório, ele deve deixar de ficar vermelho (na grade de dificuldade, as opções de linhas já respondidas continuavam rosadas). Pesquisa já recebendo respostas reais: nada deve ser apagado do banco.
- **`src/pesquisa-moda.css`:** nas perguntas com vários itens (notas e grade), o vermelho das opções vale só para os itens ainda sem resposta; nas demais, continua até a primeira escolha.
- **Verificação executada:** navegador (iPhone 13) com servidor simulado, contando elementos em vermelho antes e depois de responder: identificação 8→0, pergunta 1 4→0, bairro 3→0, 2: 7→0, notas 37→25 com a linha respondida em 0, depois 0; 6: 10→0; grade 73, linha respondida 0 e as outras ainda em vermelho, depois 0; "Sobre você" 9, campo respondido 0, depois 0; avisos 3→0. Sem erros de JavaScript. Nenhum envio real e nada apagado do banco.
- **Publicação (24/11):** site publicado pelo PR #226; CSS novo conferido no ar. Sem teste com envio no site real (avançar na pesquisa grava progresso no banco, que já tem respostas reais).

## 2026-11-24 · Painel de pesquisas: abas principais sublinhadas e "Ações" só com ícone, publicado (#224)
- **Pedido da dona do produto:** os dois níveis de abas usavam modelos parecidos (conflito visual); trocar o modelo das abas principais e deixar "Ações" só com o ícone de três pontinhos, ao lado das abas internas também no celular.
- **`public/admin/pesquisas/index.html`:** Resultados · Inteligência · Respostas no modelo "Abas sublinhadas" do DS (linha da aba ativa em vermelho, deslizando entre as abas; sem movimento com "menos movimento"); abas internas continuam segmentadas. `menuAcoes` ganhou a opção só com ícone (`aria-label` e dica "Ações"). No celular, as abas internas e o botão ficam na mesma linha, com espaçamento ajustado para caber de 375 px em diante.
- **Ajuste pedido em seguida:** abas principais renomeadas para Resultado · Inteligência · Dados (antes Resultados · Inteligência · Respostas); textos que citam as abas atualizados (subtítulo do painel e Destaques). Títulos das seções do PDF e da planilha do relatório não mudaram.
- **Ajuste pedido em seguida:** abas sem números (Respostas, nos dois níveis, Relatos e Interessados), para números grandes não quebrarem a linha; a quantidade fica no card de cada aba (Respostas: "N participações…" e filtros; Relatos: nova linha "N relatos, do mais recente para o mais antigo."; Interessados: indicador "pessoas querem os avisos"). Testado em 375 px, iPhone 13 e computador.
- **Ajuste pedido em seguida:** no celular, "Exportar relatório" ocupa 100% da largura, com o menu (PDF e Excel) também na largura toda. Medido: 343/343 px (375 px) e 358/358 px (iPhone 13); no computador continua no canto direito.
- **Ajuste pedido em seguida:** abas internas com a mesma altura do botão de três pontinhos (40 px), medido em 375 px, iPhone 13 e computador.
- **Ajuste pedido em seguida:** no celular, as abas ocupam 100% da largura (principais divididas na largura toda; internas + botão de três pontinhos preenchendo a linha). Medido: 343/343 px (375 px) e 358/358 px (iPhone 13).
- **Verificação executada:** painel com dados fictícios e servidor simulado em 375 px, iPhone 13 e computador: linha da aba acompanha a aba escolhida; abas internas cabem sem rolagem (299/299 e 314/314 px); menu abre com "Exportar respostas" e "Excluir"; Esc devolve o foco ao botão; sem erros de JavaScript.

## 2026-11-24 · Pesquisa: e-mail opcional e avisos de campo faltando mais visíveis, publicado (#224)
- **Pedido da dona do produto:** pessoas mais velhas podem não ter e-mail e podem não perceber o aviso de campo obrigatório. Ordem passa a ser nome, WhatsApp e e-mail (opcional); feedback de campos não preenchidos mais visual, intuitivo e acessível em todo o formulário.
- **`src/pesquisa-moda.ts` e `.css`, `pesquisa/moda-curitiba/index.html`:** e-mail "(opcional)", validado só quando preenchido. Novo aviso colado aos botões (`#pq-falta`, `role="alert"`), sempre à vista, dizendo o que falta em linguagem simples ("Falta preencher seu nome e marcar a autorização."); "Ver" leva e põe o foco no primeiro campo com problema; some quando a pessoa começa a corrigir ou muda de etapa. A tela rola até o primeiro problema. Campos com problema: borda mais grossa, fundo rosado, rótulo em vermelho; mensagem junto ao campo maior, com ícone e fundo. Movimento de entrada e o tremor existente respeitam "menos movimento". Fundo da barra de botões refeito (pseudo-elemento) para não cortar o aviso.
- **Ajuste pedido em seguida:** o aviso flutuante passa a ter uma mensagem única para qualquer campo faltando: "Preencha os campos em vermelho para prosseguir." (o detalhe continua junto de cada campo). Avisos do servidor ("já participou", sem conexão) mantêm o próprio texto. Testado: identificação, pergunta 1, bairro, notas, grade e "Sobre você" mostram a mensagem única; "já participou" mostra o próprio texto.
- **Publicação (24/11):** migração aplicada no Supabase; função `pesquisa` v16 no ar (questionário do `status` igual ao do repositório; `verificar` sem e-mail responde normalmente); site publicado pelo PR #224. Teste no site real (iPhone 13, dados fictícios): aviso "Preencha os campos em vermelho para prosseguir." ao continuar vazio; ordem nome, WhatsApp, e-mail (opcional); participação completa sem e-mail e com avisos aceita pelo servidor (`contato_salvo: true`) e outra com e-mail. As duas respostas de teste foram excluídas pela dona do produto no painel logo em seguida; pesquisa com 0 respostas, 0 interessados e no ar.
- **`supabase/functions/pesquisa/index.ts`:** e-mail opcional em `verificar`, `parcial` e `enviar` (gravado como nulo); uma participação por WhatsApp e, quando informado, por e-mail.
- **Migração `20261124200000_pesquisa_email_opcional.sql`:** `pesquisa_interessados.email` aceita nulo (o CHECK de formato continua valendo quando informado). `pesquisa_respostas.email` já aceitava nulo, com índice único parcial.
- **Verificação executada:** função no Node com banco simulado (21 casos, incluindo sem e-mail: parcial, verificar, final com avisos, duas pessoas sem e-mail sem conflito, WhatsApp repetido bloqueado, e-mail inválido recusado, sem WhatsApp recusado). Navegador (iPhone 13 e computador) com servidor simulado: ordem dos campos, avisos na identificação, pergunta 1, bairro, notas, grade de dificuldade e "Sobre você"; "Ver" põe o foco no campo; participação sem e-mail segue; fluxos completos, busca, notas, Home e salvamento parcial sem erros de JavaScript.

## 2026-11-24 · Notificações: "Fulano respondeu a pesquisa", publicado (#223)
- **Pedido da dona do produto:** o aviso de resposta passa a trazer o nome da pessoa.
- **`public/admin/admin.js`:** um aviso por resposta concluída ("<nome> respondeu a pesquisa", com o nome da pesquisa embaixo e a hora da conclusão), no lugar de um aviso agrupado por pesquisa. Novas: até 200; já vistas: as 30 mais recentes dos últimos 30 dias. Contador do sino inalterado.
- **Verificação executada:** painel no navegador (iPhone 13) com dados fictícios e servidor simulado: 3 novas e as já vistas, cada uma com nome, pesquisa e hora; sem erros de JavaScript.

## 2026-11-24 · Pesquisa: tela de sucesso mais enxuta, publicado (#223)
- **Pedido da dona do produto:** sai a frase "Cada resposta contribui para este projeto de inovação." e o quadro com o sino (aviso do lançamento ou agradecimento); a frase "Para cancelar os avisos…" vai para baixo do cartão "Indique a pesquisa".
- **Arquivos:** `pesquisa/moda-curitiba/index.html`, `src/pesquisa-moda.ts` (texto do quadro removido), `src/pesquisa-moda.css` (espaço acima da frase).
- **Verificação executada:** navegador (iPhone 13) com servidor simulado, fluxo completo com "Sim" (frase de cancelamento abaixo do cartão) e com "Não" (sem a frase); sem erros de JavaScript.

## 2026-11-24 · Pesquisa: pergunta aberta (relato) antes de "Sobre você", publicado (#223)
- **Pedido da dona do produto:** a pergunta da experiência frustrante vem antes das perguntas sobre a pessoa (gênero, faixa etária e estado civil).
- **`src/pesquisa-moda.ts`:** ordem das etapas extras passa a ser relato → perfil → novidades (constantes `ETAPA_RELATO`, `ETAPA_PERFIL` e ordem de montagem). Servidor e painel não mudam.
- **Verificação executada:** navegador (iPhone 13) com servidor simulado: depois da pergunta 12 aparece o relato ("Pular"), depois "Sobre você", depois os avisos; Voltar do perfil volta ao relato com o texto mantido; envio final com relato, perfil e novidades; salvamentos parciais com as etapas certas; fluxos completos (Região Metropolitana, Curitiba, outra cidade) sem erros de JavaScript.

## 2026-11-24 · Publicação: Home, cartão LGPD v2 e texto da 2.1 (#222)
- Função `pesquisa` v15 no ar (consentimento de identificação v2; `identificacao_texto` = finalidades + frase da caixa). Questionário do `status` igual ao do repositório.
- Site publicado e conferido no ar. Teste real (iPhone 13, dados fictícios): Região Metropolitana com avisos, Curitiba sem avisos, outra cidade, não comprou e repetição bloqueada. Banco conferido: versão v2 e texto completo gravados. Respostas de teste apagadas.
- Ficou 1 resposta (e 1 interessado) enviada antes desta publicação pelo e-mail da dona do produto; não apagada, aguardando decisão dela.

## 2026-11-24 · Pesquisa: link do cabeçalho vira "Home" com ícone de casa, publicado (#222)

- **Pergunta 2.1, sugestão da dona do produto:** a opção "Dificuldade para encontrar o que procuro em Curitiba" passa a ser "Acesso a produtos indisponíveis no comércio local".
  - O id `dificuldade_cwb` continua igual; não há respostas gravadas.
  - Painel, aba Inteligência: o grupo dos motivos vira "Produtos indisponíveis no comércio local", e o destaque passa a dizer "…% de quem compra fora busca produtos indisponíveis no comércio local", com a descrição ajustada.
  - A função `pesquisa` precisa ser publicada junto.
  - Teste: no iPhone 13, a 2.1 aparece para quem marca Marketplaces, com o texto novo; marcada, salva `dificuldade_cwb`; sem erros de JS.

- Janela de busca de bairro e cidade, no celular: sai a borda vermelha do X ao abrir, por pedido da dona do produto. Era o anel de foco, porque a janela focava o X ao abrir. Agora o foco inicial vai para o título (`tabindex=-1`, sem contorno), o que também não abre o teclado. Quem usa teclado ainda vê o anel ao chegar no X com Tab. Teste: iPhone 13 com foco no título, sem contorno no X; Tab leva ao X; Esc fecha; sem erros de JS.

- **Identificação, novos textos da dona do produto:**
  - No cartão: "**Seus dados e sua privacidade**" em linha própria e "Usamos seu nome, e-mail e WhatsApp apenas para esta pesquisa e para informar sobre o lançamento da solução. Suas respostas não serão divulgadas de forma identificável." Este texto foi revisado duas vezes pela dona do produto; vale a versão final.
  - Na caixa: "Autorizo o uso dos meus dados conforme as finalidades acima e a Política de Privacidade."
  - "Política de Privacidade" vira link sempre que estiver no fim da frase da caixa, não mais só depois de "conforme a".
- **Alinhamento, a pedido da dona do produto:** os dois blocos de texto começam na mesma posição à esquerda. A caixinha de 22 px fica centrada sob o escudo de 34 px (6 px de cada lado). Teste: o parágrafo e o texto da caixa começam ambos a 85 px, e o centro do escudo e o da caixinha ficam ambos a 56 px; a caixa continua marcando e desmarcando.
- **Espaçamento:** a regra `#pq-id .pq-aceite-q { padding: 2px … }` zerava o espaço abaixo da linha divisória, colando o texto nela. Agora há 18 px acima e 18 px abaixo da linha, e o cartão tem 18/20 px de respiro.
- **Registro (`questionario.json`):** a identificação passa para `moda-curitiba-identificacao-v2-2026-11-24`, com o campo novo `finalidades` (o texto do cartão). A função grava em `identificacao_texto` as finalidades seguidas da frase da caixa, porque "finalidades descritas" sozinho não diria quais são. A função `pesquisa` precisa ser publicada junto.
- **Teste:**
  - Função com banco simulado: os 13 cenários passam e o registro sai com v2 e o texto completo.
  - Playwright no iPhone 13: os textos estão certos; há 18 px acima e 19 px abaixo do divisor; a caixa marca ao tocar na caixinha ou no texto e desmarca com novo toque; os fluxos completos seguem iguais; sem erros de JS.

- Pedido da dona do produto: o link "Voltar para o site" do cabeçalho da pesquisa passa a mostrar o ícone de casa e o texto "Home".
  - Leva para `/`, como antes. O nome para leitores de tela é "Home: ir para o site".
  - Continua perguntando antes de sair de uma pesquisa em andamento.
  - No hover, a casa sobe 2 px (antes, a seta ia para a esquerda).
- Teste: Playwright no iPhone 13 e no computador. Conferidos o texto "Home", o `href="/"` e a janela "Quer mesmo interromper…" ao tocar durante a pesquisa; sem erros de JS.

## 2026-11-24 · Pesquisa: respostas incompletas guardadas no servidor, publicado (#220)

- Publicado em 24/11/2026, nesta ordem: migração `pesquisa_incompletas` aplicada, função `pesquisa` v14 (código conferido igual ao do repositório; questionário igual pela ação `status`) e site pelo PR #220.
- Teste no site real (iPhone 13, dados fictícios `teste-claude-…@exemplo.com`, sem erros de JS):
  - P1 respondeu até a pergunta 3 e fechou a página. No banco: `parcial`, `parou_em` = `q4`, perguntas 1 a 3 e o bairro.
  - P2 parou na pergunta 2, fechou e voltou pelo link. Retomou na pergunta 3 e terminou. No banco: uma única linha `completa`, com as 12 perguntas e o perfil completo, aparecendo no sino.
- A pedido da dona do produto ("resete todo o formulário" antes de divulgar), foram apagados os 2 envios, ambos de teste. Estado final: 0 respostas, 0 interessados, pesquisa no ar.


- Pedido da dona do produto: guardar no servidor as respostas de quem para no meio, para ela ver quem parou e em qual pergunta. Antes, o progresso ficava só no aparelho da pessoa (rascunho de 30 dias), e o servidor só recebia a resposta no fim.
- **Migração `20261124200000_pesquisa_incompletas.sql`:** `situacao` passa a aceitar `parcial`. Entram as colunas `parou_em` (etapa em que a pessoa estava) e `atualizado_em`.
- **Função `pesquisa`, nova ação `parcial`:**
  - exige a mesma identificação válida do envio final e uma etapa conhecida;
  - grava só as respostas válidas até ali (as inválidas ou pela metade são ignoradas, sem bloquear);
  - nunca sobrescreve uma participação concluída;
  - substitui a incompleta da mesma pessoa feita em outro aparelho (e-mail e WhatsApp são únicos por pesquisa);
  - trata dois salvamentos simultâneos do mesmo envio.
- **Mudanças no fluxo existente:**
  - "Já participou" (`verificar` e envio) passa a ignorar as incompletas.
  - O envio final atualiza a mesma linha (mesmo `envio_id`) para a situação final, limpa `parou_em` e zera `visualizado_em`, para acender o sino.
- **Pesquisa (`src/pesquisa-moda.ts`):** depois da identificação, salva o progresso a cada etapa (`irPara`) e ao sair da página (`pagehide` ou aba oculta, com `keepalive`). Não reenvia se nada mudou. Falhas não atrapalham a pessoa, porque o rascunho local continua.
- **Painel:**
  - As incompletas aparecem só na aba Respostas: filtro "Incompletas", etiqueta amarela "Incompleta" e o resumo "Parou na pergunta N · última atividade em …".
  - Na ficha, um aviso no topo diz que a pessoa não terminou e mostra o que ela respondeu até ali.
  - As incompletas entram na contagem da aba Respostas e em "Exportar respostas" (situação "Incompleta (parou …)"). Ficam fora dos indicadores, dos gráficos, do relatório e do sino (`neq situacao parcial` em `admin.js` e na lista de pesquisas).
  - `admin.js?v=20261124a` em todas as páginas da área restrita.
- **Testes:**
  - Função com banco simulado (unicidade de `envio_id`, e-mail e WhatsApp): 13 cenários. Conferidos: salvar e avançar; resposta inválida ignorada; incompleta não conta como "já participou"; outro aparelho substitui; o final converte a mesma linha e guarda o contato; parcial atrasado não altera a concluída; 409 para quem já concluiu; 400 para identificação ou etapa inválidas; corrida de dois parciais.
  - Pesquisa (Playwright, iPhone 13): nenhum salvamento antes da identificação; `q1` logo depois dela; `q2`, `q3` e `q4` a cada etapa; ao sair da página, salva a etapa atual com a nota marcada; sem reenvio repetido. Os fluxos completos (Região Metropolitana, Curitiba, outra cidade e "Sim") seguem iguais; sem erros de JS.
  - Painel com 3 incompletas fictícias: indicadores sem elas (42); aba com elas (45); filtro "Incompletas 3" com onde cada uma parou; ficha com o aviso; planilha com "Incompleta (parou …)"; exclusão funcionando; sino filtrando; sem erros de JS.
- A etiqueta da situação (Completa, Incompleta, Fora de Curitiba e RMC, Não comprou) só aparece no filtro "Todas", onde as respostas estão misturadas, por pedido da dona do produto. Nos outros filtros, a coluna da etiqueta some e o texto usa a largura toda. A ficha aberta a partir de um filtro também fica sem etiqueta; a incompleta mantém o aviso amarelo. Teste: "Todas" com 45 etiquetas em 45 linhas; "Completas" e "Incompletas" sem etiquetas e com o texto em 98% da largura; ficha sem etiqueta no filtro e com etiqueta em "Todas"; computador e iPhone 13, sem erros de JS.
- Para publicar, nesta ordem: migração, função e site.

## 2026-11-24 · Pesquisa: teste completo no site real antes da divulgação, publicado (#218)

- Pedido da dona do produto: publicar tudo e testar todo o formulário antes de divulgar o link ("nada pode ser perdido").
- Publicado o painel (#218).
- Antes de enviar de verdade, foi conferido que `pesquisa_respostas` e `pesquisa_interessados` não têm gatilhos: gravar uma resposta não dispara e-mail.
- Teste no site real, sem simulação do servidor: Playwright no iPhone 13, com dados fictícios (`teste-claude-…@exemplo.com`). Função `pesquisa` v13.
  - A, Região Metropolitana + relato + "Sim": 200 `completa`, contato salvo, tela de sucesso. No banco: 13 perguntas mais o perfil (com a 1.1 e a cidade), relato, `quer_novidades` true e contato com o aceite `moda-curitiba-contato-v3-2026-11-24`.
  - B, Curitiba (bairro pela busca) + "Não": 200 `completa`, tela de sucesso. No banco: 12 perguntas mais o perfil com o bairro; sem contato.
  - C, Outra cidade: 200 `fora_de_curitiba`, tela de fora da região. No banco: só a pergunta 1.
  - D, Não comprei: 200 `sem_compras`, tela sem compras. No banco: perguntas 1 e 2.
  - E, mesmo e-mail de A: barrado na identificação com "Este e-mail ou WhatsApp já participou da pesquisa…", sem seguir para as perguntas.
  - Sem erros de JS em nenhum cenário.
- Na primeira rodada, o teste do cenário A avançou antes de o servidor responder à conferência do e-mail (primeira chamada mais lenta) e não registrou o envio. O envio foi gravado mesmo assim (apareceu no banco). Nas rodadas seguintes, com espera pela resposta, tudo foi registrado.
- Limpeza: apagados os 9 envios e os 3 contatos de teste (`email like 'teste-claude-%@exemplo.com'`). Estado final: 0 respostas, 0 interessados, nenhum resto de teste, pesquisa no ar.

## 2026-11-24 · Painel da pesquisa: Relatos e Interessados dentro de Respostas e exportações separadas, publicado (#218)

- Subtítulo do painel, aprovado pela dona do produto: "Projeto do Dani Moscatelli Studio. Resultados analisados em conjunto; os nomes aparecem só na aba Respostas."
- **Relatos:** só os relatos, sem o aviso no topo, por pedido da dona do produto.
- **Interessados:** em vez da lista de nomes, números e perfil de quem quer os avisos, sem nomes, por pedido da dona do produto. Quem quer os avisos aparece na ficha de cada resposta ("Sim, quer receber os avisos do lançamento.").
  - Cartões: "N pessoas querem os avisos" e "% das respostas completas".
  - Gráficos de perfil iguais aos de Resultados (cidade; bairro por regional com a tabela dos bairros; gênero em rosca; faixa etária; estado civil). O trecho virou a função `cardsDePerfil(lista)`, usada nas duas abas.
  - Base: respostas completas com "Sim" que têm o contato guardado (`interessadosR`), o mesmo número na aba interna e no cartão. Contatos sem resposta, se houver, aparecem numa nota.
  - Gráfico sem ninguém na base (ex.: bairro quando ninguém do grupo mora em Curitiba) não aparece.
  - Os gráficos animam também ao trocar de aba interna.
  - Na aba Interessados, o menu Ações tem só "Exportar respostas", porque não há mais lista para marcar. Os contatos (nome, e-mail e WhatsApp) continuam na planilha de "Exportar respostas".
- Teste: Playwright com dados fictícios, no computador e no iPhone 13, sem erros de JS. Conferidos:
  - Relatos sem aviso (11 relatos);
  - Interessados com 2 pessoas e 6% (2 de 36), e os cartões de perfil com base 2;
  - nenhum nome ou e-mail na tela;
  - os 5 cartões de perfil em Resultados continuam;
  - a ficha da resposta mostra o "Sim".

- Pedido da dona do produto: Relatos e Interessados ficam dentro da área de Respostas, como abas internas, e a barra de ações fica no nível da resposta.
- Exportações, por decisão dela: no nível da resposta, exportar só o que é da resposta (respostas, relatos e interessados); fora da aba Respostas, um "Exportar relatório" com toda a visão analítica.
- **Abas de cima:** Resultados · Inteligência · Respostas.
  - No canto direito, na mesma linha, fica o menu "Exportar relatório", com PDF (Resultados e Inteligência, com os indicadores) e Excel (abas Resumo, Resultados e Inteligência).
  - No celular, o menu fica acima das abas.
- **Dentro de Respostas:** abas internas Respostas · Relatos · Interessados, no padrão SegmentedControl do DS (variante suave, tamanho sm), para não confundir com as abas de cima.
  - Na mesma linha fica o menu "Ações", com "Exportar respostas" (Excel com as abas Respostas, Relatos e Interessados, arquivo `…-respostas-AAAA-MM-DD.xlsx`) e "Excluir". "Excluir" só aparece em Respostas e Interessados e exclui o que estiver marcado.
  - Depois de excluir, o painel volta para a mesma aba interna.
- Teste: Playwright com dados fictícios, no computador e no iPhone 13, sem erros de JS. Conferidos:
  - as abas de cima (3) e as internas (3, com as contagens);
  - os menus ("PDF" e "Excel"; "Exportar respostas" e "Excluir" desativado sem seleção);
  - as abas de cada planilha baixada (relatório: Resumo, Resultados e Inteligência; respostas: Respostas, Relatos e Interessados);
  - excluir 2 respostas pelo menu: a contagem passa de 42 para 40, os contatos delas saem de Interessados e o painel continua em Respostas › Respostas;
  - excluir 1 contato: continua em Respostas › Interessados;
  - a aba Relatos abre.

## 2026-11-24 · Painel da pesquisa: aba Interessados com a mesma estrutura da aba Respostas, não publicado (substituído depois por números e perfil, sem lista)

- Pedido da dona do produto: a aba Interessados deve ter a mesma estrutura da aba Respostas.
- Mesma estrutura:
  - aviso no topo e contagem ("N contatos, do mais recente para o mais antigo");
  - barra "Selecionar todos · N selecionados" (excluir pelo menu Ações);
  - linhas com caixa de seleção, nome em destaque e "Autorizou em …";
  - e-mail e WhatsApp clicáveis (`mailto:` e `wa.me`), cada um sem quebrar no meio;
  - etiqueta na coluna fixa de 168 px e lixeira;
  - hover e seleção na linha inteira.
- **Etiqueta "Aceite de DD/MM":** mostra com qual versão do texto a pessoa concordou. A versão completa (`moda-curitiba-contato-v3-…`) aparece ao passar o mouse.
- **Excluir:** um contato ou vários de uma vez (`pesquisa_interessados` por `id`). As respostas da pesquisa continuam. Depois de excluir, a aba Interessados continua aberta.
- "Excluir selecionadas/selecionados" saiu da barra de seleção e virou item do menu Ações, por pedido da dona do produto. Vale para as abas Respostas e Interessados.
  - O item mostra a quantidade ("Excluir 2 respostas selecionadas") e, embaixo, uma dica ("Apaga também o contato delas em Interessados" ou "As respostas da pesquisa continuam").
  - Sem nada marcado, o item fica desativado, com "Marque as caixas na lista para escolher". Nas outras abas, ele não aparece.
  - A barra mostra "Selecionar todos", a contagem e "Para excluir, use o menu Ações". Na primeira marcação, o botão "Ações" pulsa, respeitando "menos movimento".
- Menu "Ações" só com o nome das ações (Exportar Excel, Exportar PDF, Excluir), sem explicações, e mais estreito, por pedido da dona do produto.
  - "Excluir" fica no menu também no computador e apaga exatamente o que estiver marcado: uma, várias ou todas as respostas, ou os contatos marcados na aba Interessados. Sem nada marcado, fica desativado.
  - Os interessados fazem parte da resposta: excluir respostas continua apagando o contato delas em Interessados, mas isso não é mais explicado no menu, nas confirmações nem no bloco "Recomeçar a pesquisa do zero" ("Apaga todas as respostas e relatos.").
  - Teste: computador e iPhone 13, sem erros de JS. Conferidos:
    - o menu com os 3 nomes;
    - o "Excluir" desativado sem seleção;
    - 2 respostas excluídas: a contagem passa de 42 para 40 e os contatos delas saem de Interessados (de 4 para 2 no computador);
    - um contato excluído na aba Interessados.
- No computador (a partir de 768 px), o menu "Ações" fica na mesma linha das abas, no canto direito, por pedido da dona do produto. No celular continua acima das abas, alinhado à direita.
  - Teste: computador e iPhone 13, sem erros de JS. Conferidos:
    - o menu só com as exportações em Resultados;
    - o item desativado sem seleção;
    - com 2 respostas marcadas: "Excluir 2 respostas selecionadas" → confirmação → DELETE `id=in.(…)`, com a contagem passando de 42 para 40;
    - em Interessados: "Excluir 1 contato selecionado", com a contagem caindo 1.
- Teste: Playwright com 4 contatos fictícios (2 com aceite v3 e 2 com v2), no computador e no iPhone 13, sem erros de JS. Conferidos:
  - as etiquetas certas, todas na mesma coluna;
  - 2 contatos selecionados e excluídos: DELETE `id=in.(i1,i3)` e a contagem passando de 4 para 2.

## 2026-11-24 · Pesquisa: sai o "Saiba como tratamos seus dados" de baixo do botão da abertura e ícones dos cartões em cinza, publicado (#216)

- Publicado em 24/11/2026: site pelo PR #216 e função `pesquisa` v13 (questionário idêntico ao do repositório, conferido pela ação `status`). Checagem no site real (iPhone 13, sem envio): busca de bairro ("umbara" → Umbará), sem erros de JS.

- Pedido da dona do produto: a informação já aparece em outros lugares, no rodapé da página e no passo de identificação, ambos com o link para a Política de Privacidade.
- Removido `p.pq-privacidade` de `pesquisa/moda-curitiba/index.html` e o estilo correspondente.
- Sem repetição da etapa: o texto vermelho acima do título ("PERGUNTA 2", "ANTES DE COMEÇAR", "SOBRE VOCÊ"…) sai de todas as etapas, por escolha da dona do produto. A etapa fica só na barra de progresso ("Pergunta 2 de 12", "Antes de começar", "Quase lá · sobre você"); no título fica um texto só para leitores de tela.
- Tela de quem mora fora de Curitiba e da Região Metropolitana: a frase termina em "…moram em Curitiba e Região Metropolitana." (sai "e compraram roupas, calçados ou acessórios este ano", que já está na tela de quem não comprou).
- Identificação: "quem é você" em vermelho no título "Conte quem é você".
- Identificação: o aceite ("Li e concordo…") fica dentro do cartão branco do aviso da LGPD, separado por uma linha.
- "Indique a pesquisa" nas telas finais (obrigada, fora de Curitiba e da Região Metropolitana, não comprou e já participou), por pedido da dona do produto:
  - Campo com o link da pesquisa (tocar seleciona tudo) e botão "Compartilhar", como pedido pela dona do produto.
  - No celular, o botão abre o compartilhar do próprio aparelho (todos os apps, inclusive o Direct do Instagram), com a mensagem e o link.
  - Sem esse recurso (alguns computadores), abre uma lista: WhatsApp (`wa.me` com a mensagem), Facebook (`sharer.php`), LinkedIn (`share-offsite`) e "Copiar link" (check "Copiado"), com a nota "Para o Direct do Instagram, copie o link e cole na conversa".
  - a prévia do link usa as tags `og:` que a página já tem.
  - Teste: Playwright no iPhone 13 nas telas obrigada, não comprou e fora da região (links certos; "Copiar link" coloca o endereço na área de transferência); bloco montado também em "já participou"; sem erros de JS. O compartilhar do aparelho foi testado com um substituto que confere título, texto e link; a lista de redes foi testada sem esse recurso. Falta conferir a folha de compartilhar num celular de verdade.
- Bairro (Curitiba) e cidade (Região Metropolitana) na pergunta 1: a lista suspensa vira um botão que abre uma janela com busca, por pedido da dona do produto.
  - Janela vem de baixo no celular e fica no centro no computador.
  - A busca ignora acentos e também acha pelo nome da regional ("boa vista" mostra os bairros da Regional Boa Vista).
  - Os bairros continuam agrupados por regional; quando a busca não encontra nada, aparece um aviso.
  - O bairro ou a cidade escolhidos ficam marcados com check.
  - Ao escolher, a janela fecha, o botão mostra o nome e o foco volta para ele; Esc ou o X fecham sem mudar nada.
  - O valor continua na lista nativa (oculta), então validação e envio não mudam.
  - Teste: Playwright no iPhone 13 e no computador (1280 px). Buscas "umbara" (1 resultado), "boa vista" (13), "xyz" (aviso) e "sitio" + Enter (escolhe Sítio Cercado). Ao reabrir, a opção escolhida aparece marcada; Esc fecha. Na Região Metropolitana (28 cidades), "sao jose" acha São José dos Pinhais e a pesquisa avança para a 1.1. Sem erros de JS.
- Notas de 1 a 10 no celular: 5 números em cima e 5 embaixo, ocupando toda a largura do cartão (antes eram 6 + 4), por pedido da dona do produto. Teste: iPhone 13 e iPhone SE com 5 + 5 alinhados às bordas; computador sem mudança; sem erros de JS.
- Notas: 14 px entre a descrição ("Aparência, estilo e beleza das peças") e os botões. O `margin-top` de 12 px dos botões era anulado pelo título flutuante (`legend` com float); o espaço passou para a margem de baixo do título. Teste: 14 px medidos no iPhone 13, no iPhone SE e no computador; sem erros de JS.
- Pergunta 12: "Quando você não encontrou **um produto** que queria comprar, o que acabou fazendo?" (sai "uma roupa, calçado ou acessório"), por pedido da dona do produto. Só muda o texto: opções, destaque ("não encontrou") e versão do questionário seguem iguais. A função `pesquisa` será publicada junto para o servidor ficar com o mesmo texto. Teste: build com o texto novo no pacote da página.
- Etapa "Para finalizar · opcional" (relato), textos da dona do produto. Título: "Você já teve alguma experiência frustrante ao procurar ou comprar roupas e acessórios?", com destaque em "experiência frustrante" (no lugar de "experiência de compra"). Apoio: "Pode ser relacionada à busca, ao atendimento, à disponibilidade das peças, à qualidade ou ao pós-venda." Placeholder: "Conte o que aconteceu e, se possível, o que poderia ter sido diferente…". O relato continua opcional, com até 2.000 caracteres.
- Última etapa (novidades), por pedido da dona do produto:
  - Título: "Obrigado por participar", com "Obrigado" em vermelho. Substitui "Sua contribuição vale vantagens exclusivas", que chegou a ser retirado.
  - Cartão no padrão da referência enviada por ela. Título: "Você terá vantagens exclusivas no lançamento!", com "vantagens exclusivas" em vermelho escuro (`--pq-red-escuro`), 20 px, peso 800. Texto: "Essa é a nossa forma de agradecer por sua contribuição na construção dessa nova solução."
  - Teste: fluxo completo no iPhone 15 Pro Max (títulos e destaques conferidos; envio com "Sim" leva à tela de obrigada); sem erros de JS.
- Última etapa: novos textos do aceite de avisos, por pedido da dona do produto:
  - Pergunta: "Quer receber avisos sobre o lançamento e suas vantagens por e-mail e WhatsApp?"
  - Opções: "Sim, quero receber os avisos." e "Não, prefiro não receber."
  - Consentimento dentro do cartão do "Sim", abaixo do texto principal, visível antes da escolha: "Autorizo o uso dos meus contatos exclusivamente para essa finalidade, conforme a Política de Privacidade. Posso revogar meu consentimento a qualquer momento."
  - Estilo do consentimento: 13 px, peso regular, cor secundária, link em vermelho e sublinhado.
  - Nenhuma opção vem marcada. O círculo do "Sim" fica alinhado à primeira linha.
  - O link abre a política sem marcar o "Sim". Sai a nota que ficava abaixo das opções.
  - `questionario.json`: o consentimento passa para a versão `moda-curitiba-contato-v3-2026-11-24`, com o texto completo que a pessoa vê (pergunta + opção + autorização). Assim, cada "Sim" guarda exatamente o que foi aceito. A função `pesquisa` precisa ser publicada junto.
  - Teste: fluxo completo no iPhone 15 Pro Max. Sem opção marcada ao chegar; estilo conferido (13 px, 400, cinza; link vermelho sublinhado); o link abre a política e não marca o "Sim"; com "Sim", o envio sai com quer = true e a tela de obrigada aparece; sem erros de JS.
- Tela de sucesso (`#pq-obrigada`): o título "Obrigada por participar!" vira "Pesquisa **enviada** com sucesso", com "enviada" em vermelho, por pedido da dona do produto. É a única tela final com esse título. Teste: envio completo no iPhone 15 Pro Max chega na tela com o título novo e o destaque em vermelho; sem erros de JS.
- Admin › Pesquisas › Respostas: "Apagar todas as respostas" agora apaga também os contatos da aba Interessados (`pesquisa_interessados` da pesquisa), por pedido da dona do produto.
  - O botão aparece também quando só sobraram interessados.
  - A confirmação (digitar APAGAR) diz quantas participações e quantos contatos serão apagados.
  - Se a exclusão dos interessados falhar, aparece um aviso e a aba Interessados é aberta.
  - Teste: Playwright com dados fictícios, no computador (42 respostas + 1 interessado) e no iPhone 13 (0 respostas + 3 interessados). Nos dois casos, DELETE em `pesquisa_respostas` e em `pesquisa_interessados` filtrado pela pesquisa; abas zeradas; botão some; sem erros de JS. A regra de acesso "Admin exclui interessados" já existia.
- Admin › Pesquisas, aba Respostas refeita, com as escolhas da dona do produto:
  - **"Apagar todas as respostas" fora das abas:** um bloco "Recomeçar a pesquisa do zero" entre os indicadores e as abas. Não fica no menu Ações, a pedido dela, porque reinicia a pesquisa inteira. Apaga respostas, relatos e interessados, com confirmação "APAGAR". O bloco some quando não há nada.
  - **Filtros por situação:** Todas, Completas, Fora de Curitiba e RMC, Não comprou, cada um com sua contagem. No celular ficam numa linha com rolagem lateral.
  - **Lista enxuta:** linha inteira clicável (#, data, situação, resumo do perfil e de onde mais comprou, em até 2 linhas). Ícone de lixeira em cada linha.
  - **Ficha da resposta:** painel lateral no computador e tela cheia no celular, organizada em blocos: Perfil, Onde compra, Notas das compras (barras de 1 a 10), Como procura, Dificuldades (pergunta 10 com etiquetas coloridas de Muito fácil a Muito difícil), Relato e Avisos do lançamento.
  - **Leitura da ficha:** cada pergunta aparece com o número e um rótulo curto; o texto completo fica na dica ao passar o mouse.
  - **Navegação na ficha:** "Anterior / Próxima", com "1 de 42", que respeita o filtro escolhido. Setas ← → do teclado funcionam. A lixeira também fica no topo da ficha.
  - **Excluir uma resposta também apaga o contato da pessoa em Interessados.** A ligação é feita pelo `envio_id`, que a função grava igual nas duas tabelas e que agora entra nas consultas. A confirmação avisa quando há contato.
  - Múltipla escolha na ficha (perguntas 2.1, 7, 11 e 12): lista simples com check vermelho. Substitui as etiquetas, que herdavam o estilo `.tag` do design system (maiúsculas, espaçamento e ponto) e ficaram feias, segundo a dona do produto. Teste: os itens da pergunta 7 aparecem em lista no iPhone 13 e no computador, sem erros de JS.
  - Identificador: o nome que a pessoa informou no início aparece em destaque na lista, no topo da ficha e nas confirmações de exclusão, por pedido da dona do produto. O "#número · data" vem logo abaixo, e a coluna `nome` de `pesquisa_respostas` passa a entrar na consulta. Respostas sem nome, de antes da identificação, mostram "Sem nome" em itálico. Teste: com nomes fictícios, lista, ficha, "Próxima" (inclusive para uma resposta sem nome) e confirmação conferidas no computador e no iPhone 13; sem erros de JS.
  - Lista: a etiqueta da situação (Completa, Fora de Curitiba e RMC, Não comprou) fica à direita, ao lado da seta, por pedido da dona do produto. No celular, ela se alinha ao nome e o resumo usa a largura toda. Teste: computador e iPhone 13 sem sobreposição; sem erros de JS.
  - Por pedido da dona do produto:
    - **Seta removida da lista.**
    - **Seleção de respostas:** caixa de seleção em cada linha e barra "Selecionar todas · N selecionadas · Excluir selecionadas". "Selecionar todas" vale só para o filtro aberto, e trocar de filtro limpa a seleção.
    - **Excluir várias de uma vez:** apaga também os contatos dessas pessoas em Interessados, e a confirmação diz quantos são.
    - **Menu "Ações" acima das abas:** só com Exportar Excel e Exportar PDF.
    - **Ações do link fora do menu:** "Tirar do ar / Colocar no ar" e "Abrir" saíram do menu e ficam no cartão do link, junto da situação e do "Copiar".
    - **Celular:** o cartão do topo deixou de passar da borda (`grid-template-columns: minmax(0, 1fr)`), e o botão "Tirar do ar" ocupa a linha toda.
  - Teste: Playwright com dados fictícios, no computador e no iPhone 13, sem erros de JS. Conferidos:
    - os botões do topo (Tirar do ar, Copiar link, Abrir);
    - o menu "Ações" antes das abas, só com as duas exportações;
    - nenhuma seta na lista;
    - 2 respostas selecionadas: DELETE `id=in.(r0,r2)` e interessados `envio_id=in.(e0,e2)`, com a contagem passando de 42 para 40;
    - selecionar todas com o filtro "Não comprou" dá 3;
    - trocar de filtro limpa a seleção;
    - a ficha continua abrindo.
  - Cartão do link rediagramado, por pedido da dona do produto:
    - Linha 1: situação ("No ar · recebendo respostas"; abaixo de 400 px fica só "No ar") e "Tirar do ar" compacto, na mesma linha.
    - Linha 2: o link, com Copiar e Abrir.
    - Rodapé: ícone de relógio e "Última resposta em …", separado por uma linha.
    - Teste: computador, iPhone 13 e larguras de 375 e 320 px, sem nada passando da borda; sem erros de JS.
  - Aba Inteligência, cartões de destaque no padrão do cartão de indicador do DS (`CardsDeKpi`, vitrine Cards/Dados do DS), por pedido da dona do produto, que apontou que cor, ícone e tipografia fugiam do DS.
    - Card branco com borda e sombra do DS (`--shadow`), raio `--radius-lg` e padding de 20 px, estático (sem levantar no hover).
    - Rótulo em 13 px, peso 500, `--muted-foreground`, sem caixa alta.
    - Valor em 26 px, peso 700, `--foreground` (não mais vermelho).
    - Ícone de 18 px em `--muted-foreground`, numa base `--muted` de 36 px, à direita.
    - Frase em 13,5 px, `--muted-foreground`, com o trecho em destaque na cor do texto.
    - Sai o fundo rosa e o número vermelho dos 4 principais.
    - Valores alinhados entre os cartões no computador.
  - Aba Inteligência, cartões de destaque no celular (até 560 px): um por linha, por pedido da dona do produto. O rótulo e o ícone ocupam uma linha inteira em cima. Embaixo ficam o número à esquerda, numa coluna fixa de 84 px e separado por uma linha vertical, e a frase à direita, começando na mesma posição em todos os cartões. O computador continua com 4 por linha. Teste: computador, iPhone 13 e 320 px, com o título numa linha só em todos os cartões e nada passando da borda; sem erros de JS.
  - Regra da dona do produto: nos grids, o texto nunca passa da coluna de etiquetas ou de ações.
    - Lista: a coluna da situação tem largura fixa de 168 px, igual para todas as linhas, com as etiquetas alinhadas à esquerda dela. No celular, a etiqueta ganha linha própria, entre a data e o resumo.
    - Ficha, pergunta 10: a coluna da etiqueta (Fácil, Difícil…) tem largura fixa de 112 px.
    - Teste: medição automática no computador e no iPhone 13, sem nenhum texto avançando sobre a coluna das etiquetas e com todas começando na mesma posição (computador: 1017 px na lista e 1135 px na ficha); sem erros de JS.
  - Lista: o hover e a seleção pintam a linha inteira (caixa de seleção, texto, etiqueta e lixeira), sem cantos arredondados, por pedido da dona do produto. Saiu o hover arredondado só na área do texto. Teste: hover medido no iPhone 13 e no computador, com o fundo cobrindo a largura toda da linha e raio 0; sem erros de JS.
  - Animações: entrada da lista, painel deslizando, troca de ficha e barras. Todas respeitam "menos movimento".
  - Teste: Playwright com dados fictícios, no computador e no iPhone 13, sem erros de JS. Conferidos:
    - o bloco de apagar fica fora das abas;
    - os filtros e as contagens, com 36 completas e 3 em cada uma das outras situações;
    - a ficha, com os 6 blocos, "Próxima" e a seta ←;
    - excluir pela ficha uma resposta com contato faz DELETE em `pesquisa_respostas` (`id`) e em `pesquisa_interessados` (`envio_id`), e as abas passam de 42 para 41 e de 1 para 0;
    - excluir uma resposta sem contato pelo ícone da lista apaga só a resposta.
- Barra "Voltar / Continuar" sempre presa no rodapé da tela, também nas perguntas curtas, como na abertura. O formulário ocupa a altura da tela abaixo do cabeçalho (`--pq-topo-h`, medida pelo script) e a barra fica no fim. Teste: no iPhone 13 e no computador, a barra fica no rodapé da tela em todas as etapas, sem rolagem extra nas telas curtas.
- Ícones dos cartões "Leva de 3 a 5 minutos", "Participação voluntária" e "Privacidade protegida": padrão cinza (fundo graphite-50 `#EDF0F5` e ícone em `--pq-muted`), por pedido da dona do produto.
- Teste executado: Playwright no iPhone 13 (abertura sem o texto, botão "Começar pesquisa" funcionando, link da política no rodapé e na identificação), sem erros de JS.

## 2026-11-24 · Painel de pesquisas: ações num menu e correção da aba Respostas e do Excel com respostas antigas da pergunta 5, publicado

- **Card do topo (`public/admin/pesquisas/index.html`):**
  - O botão "Ações" abre um menu com Ver a pesquisa, Exportar Excel, Exportar PDF e Tirar do ar ou Colocar no ar.
  - O menu segue o Dropdown Menu do DS (fundo do popover, borda, sombra média, itens com ícone e descrição curta).
  - Abre por cima dos números e fecha com Esc, com clique fora ou ao escolher um item. Setas, Home e End navegam entre os itens.
  - O botão mostra o andamento ("Gerando planilha…" e depois "Planilha baixada").
  - O link e "Copiar link" ficam numa linha só; no celular, o botão mostra só o ícone, com o nome acessível.
- **Defeito (no ar desde a v13):** a pergunta 5 virou classificação, mas as respostas antigas guardam uma escolha só (texto). `textoResposta` usava `v.map`, o que quebrava a aba Respostas e a exportação do Excel.
  - No banco há 1 resposta antiga da pergunta 5.
  - **Correção:** usa `valores(v)`, e a resposta antiga aparece como "1º …". O erro da exportação também passa a ser registrado no console.
- **Cards de pergunta no celular (até 640 px):**
  - Viram acordeões fechados: mostram número, título, quantidade de respostas e o resumo. O gráfico e "Ver números" abrem tocando no cabeçalho (seta à direita, `aria-expanded`), com transição de altura que respeita "menos movimento".
  - No computador nada muda.
  - No PDF, os cards saem sempre abertos.
- **Resumo (antes "Leitura"):** Alerta do DS (info), com título "Resumo" (14 px, peso 600) e a frase em `--muted-foreground`, com os números em destaque.
- Testes executados (Playwright, computador e iPhone 13, 42 respostas fictícias com a pergunta 5 antiga e nova):
  - menu com 4 itens, foco no primeiro, setas, Esc devolvendo o foco e clique fora;
  - menu inteiro dentro da tela;
  - Excel baixado pelo menu, PDF abrindo a impressão e "Tirar do ar" pedindo confirmação;
  - aba Respostas com 42 respostas, incluindo as antigas;
  - acordeão: no celular, card fechado com 247 px, aberto com 557 px e fechado de novo; no computador, sempre aberto; no PDF, os 19 cards abertos;
  - sem erros de JS.
  - Antes da correção, a mesma aba ficava vazia, com o erro `v.map is not a function`.

## 2026-11-23 · Pesquisa: tela própria para quem não comprou, campos subordinados abaixo da opção, perguntas 11 e 12 revisadas e faixa etária em cartões, publicado (função `pesquisa` v12, questionário v13)

- **Tela de quem não comprou este ano (`#pq-semcompras`), na estrutura do modelo enviado pela dona do produto:**
  - check em contorno;
  - "Obrigada pelo seu interesse!";
  - "Neste momento, nossa pesquisa é voltada a quem comprou roupas, calçados ou acessórios neste ano.", com "comprou roupas, calçados ou acessórios neste ano" em negrito vermelho;
  - "Agradecemos por dedicar um tempinho para participar!";
  - linha divisória e assinatura com a foto da Dani, como nas outras telas finais (pedido da dona do produto: todas as telas de conclusão da pesquisa com o avatar, padronizadas).
  - Quem mora fora de Curitiba e da Região Metropolitana continua com a tela de encerramento.
  - Ao recarregar a página, a tela é mantida.
- **Pergunta 1:** o campo de bairro aparece logo abaixo de "Curitiba" e o de cidade logo abaixo de "Região Metropolitana de Curitiba", recuados e com uma linha vermelha à esquerda.
- **Pergunta 11:** 14 opções novas, na ordem enviada. Ids mantidos onde o sentido é o mesmo; novas: `casuais`, `basicas` e `intimas`.
- **Pergunta 12:**
  - texto "Quando você não encontrou uma roupa, calçado ou acessório que queria comprar, o que acabou fazendo?", com "não encontrou" em vermelho;
  - apoio "Selecione todas as situações que você viveu neste ano.";
  - opções revisadas, sem ponto final, como as demais (ids mantidos).
- **"Sobre você" no computador:** a faixa etária deixa as pílulas e usa os mesmos cartões de gênero e estado civil. No celular continua a lista suspensa.
- Testes executados:
  - Playwright no iPhone 13: fluxo completo nos três caminhos; "Não comprei", em Curitiba e na Região Metropolitana, mostra a tela nova sem confete e a mantém ao recarregar; ordem dos campos na pergunta 1; 15 itens na pergunta 11, com a exclusiva.
  - Playwright no computador: "Sobre você" em cartões.
  - Sem erros de JS.

## 2026-11-23 · Pesquisa: correção da tela final de quem marca "Não comprei nenhuma peça este ano", publicado (função `pesquisa` v12, questionário v13)

- **Defeito (no ar desde a v11):** `encerraEm()` em `src/pesquisa-moda.ts` olhava só as duas primeiras perguntas. Com a 1.1 entre a 1 e a 2, quem marcava "Não comprei" na pergunta 2 via a tela de agradecimento com confete em vez da tela de encerramento.
  - O servidor gravava certo (`sem_compras`); só a tela estava errada.
- **Correção:** olha todas as perguntas que valem para a pessoa.
- Testes executados: Playwright no iPhone 13, sem erros de JS:
  - "Não comprei", em Curitiba e na Região Metropolitana: tela de encerramento, sem confete;
  - fluxo completo nos três caminhos.

## 2026-11-23 · Pesquisa: pergunta 5 classificada em 1º, 2º e 3º (questionário v13), publicado (função `pesquisa` v12, questionário v13)

- Pedido da dona do produto: a pergunta 5 segue o padrão da 2.
  - Até 3 escolhas, na ordem.
  - Apoio "Escolha até 3, na ordem: toque primeiro por onde você mais começa." (trecho em negrito).
  - "Não costumo procurar produtos específicos" fica exclusiva.
- O servidor passa a exigir a lista em ordem e recusa o formato antigo de uma só escolha (`ranking` com `max: 3`).
- Painel:
  - Card no formato da pergunta 2: 1º lugar em destaque, "entre os 3" mais claro, tabela.
  - Destaques e cruzamentos da Inteligência usam o 1º lugar.
  - Respostas antigas (texto único) contam como 1º lugar.
- Testes executados:
  - Playwright no iPhone 13: selos 1º, 2º e 3º e exclusiva; fluxo completo nos três caminhos, sem erros de JS.
  - Função em bundle: formato antigo recusado, exclusiva com outra recusada, 4 opções recusadas, 3 em ordem gravadas.
  - Painel com dados mistos (antigos e novos), sem erros de JS.
- Na publicação: reimplantar a função `pesquisa`.

## 2026-11-23 · Pesquisa: pergunta 3 com "peças de segunda mão" em vermelho, publicado (função `pesquisa` v12, questionário v13)

- `questionario.json`: o destaque da pergunta 3 passa de "brechós" para "peças de segunda mão"; "(brechós)" fica no texto normal.
- O destaque só é usado pela página. O JSON da função `pesquisa` fica igual ao repositório na próxima publicação dela.
- Teste executado: Playwright no iPhone 13 (trecho em vermelho na pergunta 3), sem erros de JS.

## 2026-11-23 · Assinatura dos e-mails da página de contatos: telefone, e-mail e site, publicado (PR #211; `responder-contato` v15; `comunicado-parceiros` v6)

- `supabase/functions/responder-contato/index.ts`: a assinatura passa a ter, nesta ordem, o telefone (link para o WhatsApp, `https://wa.me/5541997485414`), contato@danimoscatelli.com.br (link `mailto:`) e o site (link para o site). Sai o Instagram (@danimoscatellistudio). A versão em texto simples segue a mesma ordem.
- Visual novo (opção B, escolhida pela dona do produto): retrato de meio corpo com cantos arredondados e fundo graphite-50, linha vermelha e os dados ao lado.
  - Imagem `public/email/dani-assinatura.png`, de 220 × 280 exibida em 110 × 140, com 18 KB.
  - Gerada a partir da foto enviada pela dona do produto (WEBP com fundo transparente, que o Outlook não mostra), com a autorização dela.
  - A `dani-foto.jpg` antiga continua no site para os e-mails já enviados.
- `supabase/functions/comunicado-parceiros/index.ts` passa a usar a mesma assinatura e a mesma imagem, por pedido da dona do produto. A função no ar (v5) estava igual ao repositório antes da mudança. Teste: prévia do comunicado gerada pela função em bundle (status 200, link do WhatsApp e imagem nova) e conferida em imagem.
- Teste executado: a assinatura foi gerada a partir do código da função e conferida em imagem, com os três links (WhatsApp, `mailto:` e site).
- Na publicação: publicar o site antes (para a imagem existir) e depois reimplantar `responder-contato` e `comunicado-parceiros`.

## 2026-11-23 · Contatos: abas Recebidos e Enviados, vários destinatários, Cc e Cco, janela no centro (D-046), publicado (migration aplicada; função `responder-contato` v14)

- `public/admin/contatos/index.html`:
  - Abas "Recebidos" (formulário do site e e-mails que chegaram) e "Enviados" (e-mails novos), com contagem. A aba fica no endereço (`?aba=enviados`).
  - "Novo e-mail" abre numa janela no centro da tela (`<dialog>`), com o cabeçalho da Janela do DS, entrada suave e respeito a "menos movimento". Esc, × ou toque fora fecham.
  - Campos de vários e-mails: cada endereço vira uma etiqueta (Enter, vírgula, ponto e vírgula, espaço ou sair do campo); e-mail incompleto fica marcado.
  - Botões "Cc" e "Cco" abrem os campos de cópia e de cópia oculta, com explicação do que é a cópia oculta.
  - Limite de 20 endereços no total.
  - A lista, o detalhe, a bolha do histórico e o "Para:" da resposta mostram destinatários, Cc e Cco.
  - "← E-mails enviados" volta para a aba certa.
- `supabase/functions/responder-contato/index.ts`:
  - `novo.para`, `novo.cc` e `novo.cco` em lista; sem repetidos; Cc e Cco não repetem quem já está em Para.
  - O envio vai pelo Resend com `cc` e `bcc`.
  - As respostas seguintes da conversa vão para os mesmos destinatários e cópias, sem a cópia oculta.
- Migration `20261123230000_contatos_destinatarios_copias.sql`: `contatos.destinatarios`, `copias` e `copias_ocultas`, e `respostas.copias` e `copias_ocultas`.
- Testes executados:
  - `npm run build`.
  - Playwright com dados fictícios (computador e iPhone 13): abas e contagens, janela centralizada, erros dos campos, etiqueta inválida, Cc e Cco, envio, conversa na aba Enviados, detalhe e histórico com Para/Cc/Cco, sem erros de JS.
  - Função em bundle com banco e Resend simulados:
    - vários destinatários com repetidos removidos;
    - `cc` e `bcc` no envio;
    - resposta seguinte sem `bcc`;
    - Cc inválido e mais de 20 endereços recusados;
    - "para" como texto continua aceito.
  - Nenhum e-mail real foi enviado.
- Na publicação: aplicar a migration e reimplantar `responder-contato`.

## 2026-11-23 · Pesquisa: pergunta 4 com notas de 1 a 10 (questionário v12), publicado (função `pesquisa` v11)

- Pedido da dona do produto: tirar o zero; "1 = Muito ruim".
- Pergunta 5: o trecho em vermelho volta a ser "produto específico" (antes, "começar").
- Pergunta 6 (foto de referência): "foto de referência" e "comprar algo igual ou parecido" em vermelho.
- Pergunta 10 (matriz): novo texto "Quando você procura por um produto, qual é o grau de facilidade ou dificuldade para conseguir peças que atendam às suas expectativas?", com "produto" e "atendam às suas expectativas" em vermelho.
- "Roupas, calçados e acessórios" aparece em 4 perguntas espaçadas (2, 4, 7 e 11), além da 1.1. Nenhuma pergunta diz mais "roupas e acessórios":
  - 2.1: "…comprar em marketplaces ou lojas online de outras cidades?";
  - 3: "Você tem comprado peças de segunda mão (brechós)…";
  - 4: "Pensando nas roupas, calçados e acessórios que comprou recentemente…";
  - 12: "…quando não encontra um produto que gostaria de comprar?".
- Opções ajustadas (os ids não mudam; respostas antigas continuam valendo):
  - "Não comprei nenhuma peça este ano";
  - "Não costumo procurar produtos específicos";
  - "Não conheço lojas físicas desse tipo em Curitiba".
- Outros textos ajustados:
  - tela de encerramento: "compraram roupas, calçados ou acessórios este ano";
  - apoio do relato: "ao procurar ou comprar peças".
- Cidade e bairro saem do "Sobre você" e passam para a pergunta 1, logo abaixo da escolha:
  - Curitiba mostra o bairro;
  - Região Metropolitana mostra "Em qual cidade da Região Metropolitana você mora?", com as 28 cidades;
  - Outra cidade não mostra nada.
  - O campo aparece com movimento suave (respeita "menos movimento"), é obrigatório para continuar e mostra o erro junto ao campo.
  - Os dados continuam gravados em `respostas.perfil`, que o servidor valida como antes.
- Estado civil no "Sobre você":
  - opções Solteiro(a), Casado(a), União estável, Divorciado(a) ou separado(a), Viúvo(a) e Prefiro não informar;
  - obrigatório, validado também no servidor;
  - card no painel.
- Testes executados:
  - Playwright no iPhone 13, nos três caminhos:
    - a pergunta 1 não segue sem a cidade (Região Metropolitana) ou sem o bairro (Curitiba);
    - "Sobre você" mostra só gênero, faixa etária e estado civil;
    - o envio leva cidade, bairro e estado civil;
    - Outra cidade encerra.
  - Função em bundle: sem estado civil é recusado; com estado civil, gravado.
  - Painel com o card novo, sem erros de JS.
- `questionario.json`:
  - `min: 1` na pergunta 4;
  - apoio "Avalie de 1 a 10…";
  - versão `moda-curitiba-v12-2026-11-23`.
- A página já monta os botões e os rótulos a partir de `min` e `max`.
- Painel: textos "de 1 a 10", "1 = Muito ruim · 10 = Excelente" e faixa "1 a 6".
- Respostas antigas com nota 0 continuam contando na faixa mais baixa.
- Na publicação: reimplantar a função `pesquisa`, que passa a recusar nota 0.
- Testes executados:
  - `npm run build`;
  - Playwright no iPhone 13: botões de 1 a 10, rótulos e apoio, e a pesquisa segue para a pergunta 5;
  - função em bundle com banco simulado: nota 0 recusada, nota 1 aceita.

## 2026-11-23 · Pesquisa: destaques das perguntas 1 e 1.1 e tela de encerramento com a Região Metropolitana, publicado

- Pergunta 1: "Onde você mora" em vermelho. Pergunta 1.1: "fazer compras" e "Curitiba" em vermelho (campo `destaque` do `questionario.json`).
- Tela de encerramento: "moram em Curitiba e Região Metropolitana", em negrito vermelho.
- "Leva de 3 a 5 minutos" continua igual: a dona do produto não pediu mudança.
- O `destaque` só é usado pela página, que lê o questionário do próprio site. A função `pesquisa` não precisa ser reimplantada para isso; o JSON publicado ficou igual ao do repositório na publicação da v12.
- Testes executados: `npm run build`; Playwright no iPhone 13 (trechos em vermelho nas perguntas 1 e 1.1 e texto da tela de encerramento), sem erros de JS.

## 2026-11-23 · Pesquisa: Região Metropolitana, quatro perguntas novas, cidade e bairro, e exportação do relatório (questionário v11, D-044), publicado (função `pesquisa` v10; questionário publicado em JSON compacto, igual ao do repositório)

- `supabase/functions/pesquisa/questionario.json` (v11):
  - Pergunta 1: "Onde você mora atualmente?", com Curitiba (`sim`), Região Metropolitana de Curitiba (`rmc`) e Outra cidade (`nao`, que encerra).
  - Pergunta 1.1, condicional para quem marcou `rmc`: "Você costuma fazer compras de roupas, calçados e acessórios em Curitiba?", na escala da pergunta de disponibilidade.
  - Perguntas novas, nas posições recomendadas:
    - foto de referência (6);
    - disponibilidade (8), com dois trechos em vermelho;
    - categorias (11): até 3 opções, "Não tive dificuldade" exclusiva, "Outro" com campo.
  - "Calçados" na abertura (em negrito) e nas perguntas 2, 7 e 11.
  - Perfil:
    - Cidade: Curitiba e as 28 cidades da Região Metropolitana, segundo a AMEP.
    - Bairro: só para Curitiba, com os 75 bairros agrupados pelas 10 regionais, segundo o PDF da Prefeitura de 2017 conferido com o material da SME de 2022, e "Prefiro não informar".
- `src/pesquisa-moda.ts`:
  - Vários trechos em vermelho por título (`destaque` aceita uma lista).
  - Cidade e bairro em listas suspensas:
    - para quem mora em Curitiba, a cidade fica preenchida e travada ("Conforme sua resposta na pergunta 1");
    - para a Região Metropolitana, a lista mostra as 28 cidades e não há bairro.
- `supabase/functions/pesquisa/index.ts`:
  - O bairro só é exigido para Curitiba e é descartado nas outras cidades.
  - A cidade precisa combinar com a pergunta 1.
  - A pergunta 1.1 é ignorada para quem não é da Região Metropolitana.
- Abertura: "em Curitiba e Região Metropolitana" no texto principal, no parágrafo do projeto e nas descrições do link. O título continua "moda em Curitiba".
- `public/admin/pesquisas/index.html`:
  - Pergunta 1 com as 3 respostas; a 1.1 aparece logo depois dela.
  - Cards novos de Cidade e de Bairro (por regional, com a tabela dos bairros).
  - Textos "fora de Curitiba e RMC".
  - A nota da pergunta condicional cita o número certo da pergunta.
  - Botões "Exportar Excel" e "Exportar PDF":
    - Excel: abas Resumo, Resultados, Inteligência, Respostas, Relatos e Interessados, com SheetJS 0.18.5 carregado do cdnjs só ao clicar.
    - PDF: todas as abas numa página, pela janela de impressão ("Salvar como PDF").
- Testes executados:
  - `npm run build` passou.
  - Playwright no iPhone 13, sem erros de JS, nos três caminhos:
    - Região Metropolitana: 1.1, perguntas novas, exclusiva das categorias, Colombo, sem bairro;
    - Curitiba: cidade travada, 10 grupos de regionais, Batel;
    - Outra cidade: encerra.
  - Função em bundle com banco simulado:
    - Região Metropolitana sem a 1.1 é recusada;
    - cidade que não combina com a pergunta 1 é recusada;
    - Curitiba sem bairro é recusada;
    - a 1.1 é ignorada para Curitiba;
    - exclusiva e máximo de 3 nas categorias.
  - Painel com 42 respostas fictícias:
    - os cards novos aparecem na ordem;
    - Excel com as 6 abas, lido com openpyxl;
    - PDF com todas as abas, 86 páginas.
- Na publicação: reimplantar a função `pesquisa`. O painel lê o questionário da função.

## 2026-11-23 · Contatos: "Novo e-mail" para qualquer endereço, com anexos de qualquer tipo (D-043), publicado (migration aplicada; função `responder-contato` v13)

- `public/admin/contatos/index.html`:
  - botão "Novo e-mail" no topo da lista, que abre um painel lateral com Para, Nome (opcional), Assunto, Mensagem e anexos;
  - validação junto a cada campo; estados "Enviando arquivo X de N…" e "Enviando…";
  - tela de sucesso com check animado (respeita "menos movimento"), "Ver conversa" e "Escrever outro".
- O e-mail novo vira uma conversa na lista, com o selo "Enviado" (azul). Na conversa:
  - a primeira etapa se chama "Enviado";
  - o histórico começa pelo seu envio;
  - as respostas da pessoa chegam por `conversa-<id>@resposta…` e pela importação da caixa contato@, como nas demais conversas.
- Anexos de qualquer tipo de arquivo (antes, só imagens), até 10 por e-mail e 20 MB no total, também na resposta a um contato. Arquivos que não são imagem aparecem com a extensão.
- A contagem da lista passa a dizer "conversas".
- `supabase/functions/responder-contato/index.ts`:
  - código da função agora no repositório (antes só no Supabase, v12);
  - modo `novo` cria a conversa (`origem = 'enviado'`) e envia sem citação, com o assunto escrito; se o envio falhar, desfaz a conversa;
  - um envio repetido com o mesmo id não envia de novo;
  - mantém a mesma assinatura.
- Migration `20261123210000_contatos_email_enviado.sql`:
  - `origem` aceita `enviado`;
  - "melhores dias" é exigido só para `site`;
  - o aviso de novo contato vale só para `site`;
  - o bucket `anexos` (privado) passa a aceitar qualquer tipo de arquivo, até 20 MB cada.
- Testes executados:
  - `npm run build` passou;
  - Playwright com dados fictícios (computador e iPhone 13): erros dos campos, PDF e XLSX anexados e enviados para a pasta da conversa, sucesso, selo "Enviado" na lista, conversa com a primeira etapa "Enviado" e "Anexar arquivo", sem erros de JS;
  - função em bundle com banco e Resend simulados:
    - sem conta de administradora, 403;
    - e-mail inválido e falta de assunto recusados;
    - falha no Resend desfaz a conversa;
    - envio novo sem citação e com assinatura;
    - envio repetido não reenvia;
    - resposta em conversa enviada usa "Re:";
    - resposta a contato do site com .docx;
    - anexo de outra pasta recusado.
  - Nenhum e-mail real foi enviado.
- Na publicação: aplicar a migration e reimplantar `responder-contato`.

## 2026-11-23 · Pesquisa Moda em Curitiba: destaques de texto e regra da pergunta 6 (questionário v10), publicado (PR #204; função `pesquisa` v9)

- Tela "Obrigada pelo seu interesse!" (`pq-encerrada`): "moram em Curitiba" em negrito vermelho (`.pq-realce` em `src/pesquisa-moda.css`).
- Pergunta 2: "toque primeiro onde você mais comprou" em negrito (campo novo `apoio_negrito` no `questionario.json`, lido por `cabecalho()` em `src/pesquisa-moda.ts`).
- Pergunta 4: trecho em vermelho passa a ser "que nota você daria". Pergunta 5: "começar". Pergunta 8: "atendam às suas expectativas".
- Pergunta 6: novo texto "De que forma você descobre lojas de roupas e acessórios em Curitiba?", com "descobre lojas" em vermelho.
- Pergunta 6: "Costumo comprar nas mesmas lojas…" e "Não conheço lojas físicas…" deixam de desmarcar as outras opções (sem `exclusiva`). Com o campo novo `anula`, a função `pesquisa` grava só essas respostas negativas quando uma delas é marcada, e descarta as demais e o texto de "Outro".
- Versão do questionário: `moda-curitiba-v10-2026-11-23`. Na publicação, reimplantar a função `pesquisa`.
- Testes executados:
  - `npm run build` passou;
  - Playwright (iPhone 13): destaques das perguntas 2, 4, 5 e 6 e da tela de encerramento; 3 opções marcadas juntas na pergunta 6;
  - fluxo completo (`idt.js`) sem erros de JS;
  - função `pesquisa` em bundle com banco simulado: o envio de ["raramente", "nao_conheco", "indicacao"] grava ["raramente", "nao_conheco"]; os outros casos continuam iguais.

## 2026-11-16 · Cadastro de parceiros e página da galeria (site), publicado

- **Cadastro (`rede-parceiros/cadastro/index.html`):** nome completo obrigatório (pelo menos duas palavras com duas letras ou mais; espaços extras removidos ao salvar); campos de link com "https://" fixo antes do campo (a pessoa digita só o restante; se colar o link inteiro, o https:// sai do campo).
- **Página da galeria (`public/rede-parceiros/galeria/autorizar/`):** abre sem esperar a IA (antes levava de 9 a 11 s, medido nos logs da função); as sugestões da IA chegam depois e atualizam a prévia sem apagar o que a pessoa digitou; novo campo Senioridade (opções do campo 23 do cadastro, com o nível do card); LinkedIn com "https://" fixo.
- **Função `galeria-autorizacao`:** `ver` responde sem chamar a IA e informa `ia_pendente`; nova ação `ia`; `decidir` aceita `tempo` (só valores do campo 23) e atualiza `tempo_especialidade` do cadastro quando muda; o histórico da autorização guarda a senioridade exibida.
- **Verificação executada:** navegador (iPhone 13) com servidor simulado: validação do nome (Matheus e Matheus S recusados; Ana Lu e Maria da Silva aceitos), prefixo fixo (colar link inteiro, apagar tudo, host errado); página da galeria visível em 0,75 s com a IA atrasada 4 s, troca de senioridade refletida na prévia e enviada no formato do cadastro; `node --check` e `esbuild` da função; `npm run build`.
- **Publicação (16/11):** função `galeria-autorizacao` publicada (versão 13); `ver` no ar responde em 0,8 a 1 s.

## 2026-11-23 · Área restrita com as cores novas de aviso e erro do DS (D-045)

- `public/design-system/theme.css` e `design-system/versao.txt`: sincronizados com o DS Dani Moscatelli `697a765` (`scripts/sincronizar-design-system.sh`); `?v=` do `theme.css` atualizado nas 8 páginas.
- `public/admin/parceiros/index.html` e `public/admin/pesquisas/index.html`: textos e ícones de aviso passam de `--warning` para `--warning-text`.
- Testes: suíte Playwright da área restrita (Supabase simulado, `public/` servido localmente), 130 casos passaram, sem erros de página.

## 2026-11-23 · Experience Intelligence pronto para o Cloudflare Pages (D-038)

- **`apps/experience-intelligence/functions/_middleware.js`:** senha antes de qualquer página, no mesmo modelo do FindLook. Testado: sem segredo dá 503, senha errada dá 401 e senha certa dá 200 com `Cache-Control: private, no-store`.
- **Saem as referências ao Netlify:** `netlify.toml` removido; aviso de privacidade (`AVISO_VERSAO` = `testes-2026-11-23`), `docs/legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md`, README e comentário do `next.config.ts` atualizados.
- **Configuração do projeto no Cloudflare Pages (feita pela dona do produto):**
  - pasta base `apps/experience-intelligence`;
  - build `npm ci && npm run build`;
  - saída `out`;
  - `NODE_VERSION=22`;
  - variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
  - segredo `SITE_SENHA`;
  - caminhos de build `apps/experience-intelligence/*`;
  - domínio `app.danimoscatelli.com.br`.
- **Testes:**
  - `npm ci`, `npm run typecheck`, `npm test` (48 testes) e `npm run build` (gera `out/`);
  - aviso já existente do Next sobre a raiz do workspace (mais de um lockfile no repositório).

## 2026-11-23 · App Experience Intelligence com o padrão novo de alertas e as cores novas de aviso e erro do DS (D-047), não publicado

- **Mesclagem:** o `main` (com D-043, D-044 e D-045) entrou na branch `claude/ei-design-system`; a decisão do app, que era D-043, passou a D-047, porque D-046 ficou com os Contatos no main (Decision Log, este log, Product Backlog, READMEs, `arquivos.txt` e rotina de sincronização).
- **Sincronização:** `bash scripts/sincronizar-design-system.sh` com o DS `main` = `697a765`. Mudaram no app: `styles/theme.css` (aviso `#F0A020`, erro `#D9416E` e tokens `--warning-text`, `--error-text`, `--success-text`, `--info-text`), `ui/alert.tsx` (ícone com base, role automático) e `ui/password-field.tsx` ("As senhas não coincidem" em `--error-text`). Novo em `arquivos.txt`: `ui/alerta-com-acao.tsx` (`AlertaComAcao`, `BotaoDoAlerta`, `LinkDoAlerta`); dependências já existiam no app. Todas as 22 cópias conferidas com `cmp` contra o DS `697a765`.
- **Código do app:**
  - `src/design-system/campos.tsx`: mensagem de erro dos campos de `text-primary-text` para `text-error-text`, como na página Formulários do DS;
  - `src/components/Shell.tsx` (`Mensagem`): ícones iguais aos do DS (aviso: `AlertCircle`; erro: `TriangleAlert`). O aviso "Não escreva nomes, documentos…" do novo desafio passa a sair no padrão novo (base laranja clara, ícone em `--warning-text`), com os mesmos textos e `role="note"`.
  - Nenhum alerta do app pede ação; o `AlertaComAcao` ficou disponível, sem uso.
  - Nenhum código do app usava `--warning` ou `--error` como cor de texto.
- **Testes executados:** em `apps/experience-intelligence`: `npm run typecheck` (sem erros), `npm run lint` (0 erros; só avisos de "fast refresh"), `npm test` (48 de 48), `npm run build` (gera `out/`; uma execução terminou com o erro de segurança da versão do Next depois de gerar o site, como antes; repetida, passou). Sincronização rodada de novo: sem diferença no git. Navegador (Playwright, 1280 e 390 px, escala 2, Supabase simulado): 18 capturas (entrar, cadastro, cadastro com erros, aviso, meus dados, desafios, menu de perfil, empresa e novo desafio), sem rolagem horizontal, sem erros no console, fonte carregada.
- **Pendente:** a dona do produto ver as capturas; publicar. No DS, a borda de erro do `ui/input`, do `ui/textarea` e do `ui/checkbox` ainda usa `--destructive` (vermelho da marca), enquanto o campo de senha usa `--error` (rosa); a mudança fica no DS.

## 2026-11-23 · App Experience Intelligence consome tokens e componentes do Design System Dani Moscatelli (D-047), não publicado

- **Sincronização:** `design-system/arquivos.txt` ganhou 4 arquivos de estilo (`src/styles/`) e 16 componentes (`src/components/ui/`) do DS, copiados para `apps/experience-intelligence/`. Cópias nunca editadas. Versão do DS: `085153d`.
- **Rotina diária** (`.github/workflows/sincronizar-design-system.yml`): além do build do site, roda no app `npm ci`, `npm run typecheck`, `npm run lint`, `npm test` e `npm run build`; o PR só abre se tudo passar.
- **App:**
  - Tailwind v4 (`tailwindcss` e `@tailwindcss/postcss` 4.1.12, `postcss.config.mjs`) e dependências dos componentes (Radix, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`), nas versões do DS;
  - `src/app/globals.css` removido: zero cor hexadecimal fora das cópias do DS;
  - telas refeitas só na camada visual, com textos, campos, validações e fluxos iguais: entrar, cadastro, completar cadastro, empresa ou negócio, meus dados, novo desafio, desafio, área master e aviso de privacidade;
  - `src/design-system/campos.tsx` compõe os componentes do DS com a lógica de `padroes.ts` (máscaras, validações e mensagens, sem mudança); `src/design-system/classes.ts` guarda a classe de link de texto (variante "link" do botão do DS);
  - fontes por `<link>` lido do `fonts.css` copiado (o Next descarta o `@import url(...)` externo).
- **Telas que não existem:** `recuperar-senha` e `redefinir-senha` não existem no `main`; não foram criadas.
- **Testes executados:**
  - app: `npm ci`, `npm run typecheck` (sem erros), `npm run lint` (só avisos, os 3 de antes mais os de "fast refresh" das cópias do DS), `npm test` (48 testes passaram) e `npm run build` (gera `out/`; numa das execuções o Next encerrou com erro depois de gerar o site, por um aviso de segurança da própria versão do Next; repetido, passou);
  - site: `npm ci`, `npm run build` e `npm run lint` (só avisos);
  - sincronização: `DS_REF=085153d bash scripts/sincronizar-design-system.sh` reproduz as cópias byte a byte (sem diferença no git e `cmp` com o DS);
  - navegador (Playwright, 1280 e 390 px, escala 2, Supabase simulado com dados fictícios): entrar, cadastro (vazio, com erros e com o aviso aberto), meus dados, seus desafios, menu de perfil, empresa ou negócio e novo desafio; sem rolagem horizontal, sem erros no console e com a fonte Plus Jakarta Sans carregada.
- **Pendente:** a dona do produto ver as capturas; publicar; decidir no DS os itens que faltam (D-047).

## 2026-11-16 · Agendamento do envio da autorização da galeria (SITE-01), não publicado

- **Banco:** migração `supabase/migrations/20261116150000_galeria_agendamentos.sql`: liga o `pg_cron`; tabela `galeria_agendamentos` (RLS: só a administradora; criar, alterar e excluir só com situação `agendado`; o que foi enviado fica como histórico); tabela `agendador_chave` (chave interna, ninguém de fora lê); função `disparar_agendamentos_galeria` (só chama a função de envio quando há agendamento vencido); tarefa do `pg_cron` a cada minuto.
- **Função `galeria-convite`:** nova ação `agendados` (confere a chave interna, reserva cada agendamento vencido uma única vez, envia a todos que ainda não decidiram ou só aos escolhidos que ainda não decidiram e grava enviados, não enviados e quem já tinha decidido).
- **Área restrita (Parceiros > Autorização da galeria):** botão "Agendar envio"; janela com "Para quem" (todos que ainda não decidiram ou escolher pessoas, com busca), data e hora, "Ver o e-mail"; lista "Envios agendados" com situação, "Alterar" e "Excluir" enquanto agendado.
- **Verificação executada:** painel com login e dados simulados (validações, conversão do horário de Brasília, criar, alterar, excluir); migração num Postgres 16 local sem o `pg_cron` (RLS, colunas alteráveis, chave protegida, função protegida); `esbuild` da função; `npm run build`.
- **Pendente:** aplicar a migração, publicar a função e o site; teste real com um agendamento para o e-mail de teste.

## Estado do repositório encontrado (19/10/2026)

Levantamento feito antes de propor o plano do Corte 1:

- **Site do estúdio:** Vite 8 + TypeScript 6 + React 19 (`src/`), com `index.html` + `src/em-breve.ts` como página inicial. Páginas da área restrita, Rede de Parceiros, Store e Política de Privacidade em HTML e JavaScript puro dentro de `public/`, copiadas para `dist/` no build.
- **Scripts:** `npm run build` (`tsc -b && vite build`), `npm run lint` (`oxlint`), `npm run dev`, `npm run preview`. Não há script nem biblioteca de testes automatizados.
- **Hospedagem:** Netlify (publica `dist/`). Existe também um `vercel.json` antigo.
- **Banco:** Supabase, projeto `lipfvnerohkaajegqvwr`, usado pelo site (contatos, parceiros, lançamento, Store, log da administração) com RLS e papel `admin` no `app_metadata`. As migrações foram aplicadas direto no Supabase e **não** estão versionadas no repositório.
- **Funções:** edge functions do Supabase para e-mail, Google Agenda, IA dos parceiros (Gemini), lançamento e gestão de dados.
