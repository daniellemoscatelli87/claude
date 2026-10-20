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

## Estado do repositório encontrado (19/10/2026)

Levantamento feito antes de propor o plano do Corte 1:

- **Site do estúdio:** Vite 8 + TypeScript 6 + React 19 (`src/`), com `index.html` + `src/em-breve.ts` como página inicial. Páginas da área restrita, Rede de Parceiros, Store e Política de Privacidade em HTML e JavaScript puro dentro de `public/`, copiadas para `dist/` no build.
- **Scripts:** `npm run build` (`tsc -b && vite build`), `npm run lint` (`oxlint`), `npm run dev`, `npm run preview`. Não há script nem biblioteca de testes automatizados.
- **Hospedagem:** Netlify (publica `dist/`). Existe também um `vercel.json` antigo.
- **Banco:** Supabase, projeto `lipfvnerohkaajegqvwr`, usado pelo site (contatos, parceiros, lançamento, Store, log da administração) com RLS e papel `admin` no `app_metadata`. As migrações foram aplicadas direto no Supabase e **não** estão versionadas no repositório.
- **Funções:** edge functions do Supabase para e-mail, Google Agenda, IA dos parceiros (Gemini), lançamento e gestão de dados.
