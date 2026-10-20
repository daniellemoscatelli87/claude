# Proposta: primeiro acesso, cadastro B2B e investigação adaptativa

**Status:** proposta para aprovação da dona do produto. **Nada aqui está implementado.** Base: kit `docs/product/ux-onboarding/` (v1.0, 20/10/2026), comparado com o código do `main` em 20/10/2026.

Legenda: **Existe** (implementado e testado) · **Ajuste** (muda código, sem migração) · **Migração** (exige mudança no banco) · **Futuro** (depende de IA, RAG, cobrança ou outra decisão).

---

## 1. O que já existe e o que muda

### 1.1 Rotas e telas

| Tela do kit | Hoje | Proposta | Tipo |
|---|---|---|---|
| A. Entrada pública | `/` sem login: título "O que você quer melhorar…" e formulário direto | Página de entrada com a proposta de valor (eyebrow, título, 3 microcartões), "Entrar na plataforma", "Criar minha conta", selo "Acesso por convite nesta fase" e rodapé com a assinatura | Ajuste |
| B. Criar conta | Formulário único com alternância criar/entrar; e-mail e senha | Copy do kit; mostrar/ocultar senha; "Reenviar e-mail de confirmação"; mensagens de erro do kit; campo de nome (ver 1.3) | Ajuste |
| C. Entrar | Mesmo formulário | Copy do kit; "Esqueci minha senha" com tela de nova senha (recurso gratuito do Supabase) | Ajuste |
| Sem convite | Tela "Acesso por convite" | Copy do kit | Existe + ajuste de texto |
| D. Boas-vindas | Não existe | Tela curta, só no primeiro acesso: 3 pilares, percurso em 5 etapas (só a 1ª ativa, as demais "em desenvolvimento"), CTA "Começar minha jornada" | Ajuste |
| E. Criar organização | Nome (obrigatório) e segmento em texto livre | Nome obrigatório; segmento, o que oferece, seu papel, tipo de organização e porte, todos opcionais e com "Completar depois" | **Migração** (novas colunas) |
| F. Área de trabalho | Lista "Seus desafios" | Cartões com situação real e "Continuar desafio"; estado vazio do kit; seletor de organização | Ajuste |
| G. Apresentar o desafio | Campo grande, aviso de dados, botão | Campo de 4 a 6 linhas com contador (limite real de 4.000 caracteres, já validado no banco); exemplos em chips (só inserem texto se a pessoa tocar); aviso de privacidade curto com "Por que pedimos isso?"; texto preservado em caso de erro | Ajuste |
| G2. Pistas do desafio | Não existe | Depois do relato livre: quem é impactado e onde a mudança pode ocorrer (múltipla escolha + campo livre), sempre opcionais | Ajuste (guardado em `context_json`, sem migração) |
| H. Revisão do desafio | Com a IA desligada, mostra "A organização automática está pausada" e o editor manual | Variante do kit para IA desligada: "Seu desafio está registrado.", "Confirmar e continuar", "Editar descrição". Variante com IA preparada, mas não ligada | Ajuste |
| I. Próximo passo | **5 perguntas fixas iguais para todos** (`FRAMING_QUESTIONS`), com exemplos de saúde | Substituir pelo motor de condução por regras (seção 2), com o cartão de tarefa do kit e o menu "Não sabe responder?" | Ajuste (1 coluna opcional; ver 2.4) |
| J. Progresso | Pendências na tela do desafio | "O que já sabemos", "O que ainda falta descobrir", "Sua próxima atividade", só com dados registrados | Ajuste |
| K. Mensagens globais | Parcial | Copy do kit para carregando, salvo, sem conexão, sessão expirada, IA desligada e limite | Ajuste |
| Master | Área master separada, link só na barra lateral | Mantém. "Visualizar experiência de cliente" em espaço fictício fica para depois; por enquanto, testar com uma conta de cliente convidada | Existe; simulação é Futuro |

### 1.2 Cadastros

| Cadastro | Campo do kit | Hoje | Proposta |
|---|---|---|---|
| Conta | e-mail, senha, confirmação | Existe (Supabase Auth, confirmação ligada) | Mantém |
| Conta | nome de exibição | Não existe (a sua conta não tem nome salvo) | Campo no cadastro e no primeiro acesso de quem já tem conta (ver 1.3); guardado no perfil da conta, sem migração |
| Conta | autorização por convite | Existe (`ei_testers`, conferido no banco) | Mantém |
| Organização | nome | Existe (2 a 120 caracteres) | Mantém |
| Organização | segmento | Existe como texto livre | Lista do kit + "Outro" (texto) |
| Organização | o que oferece, tipo, porte | Não existe | Novas colunas opcionais, com limites |
| Membro | papel na organização | Não existe | Nova coluna opcional em `organization_members` |
| Organização | CNPJ, cobrança, contrato | Não existe | **Não criar** (Futuro, corte comercial) |
| Equipe | convidar pessoas para a organização | Não existe | Futuro |

### 1.3 Nome da pessoa (pedido de 20/10/2026)

O kit trata o nome como opcional; você pediu que o nome apareça ao lado do avatar. Proposta: pedir o nome no cadastro e, para quem já tem conta, uma vez no primeiro acesso. Enquanto não houver nome, mostrar o e-mail. **Decisão pendente: o nome é obrigatório ou opcional?**

---

## 2. Investigação adaptativa sem perguntas fixas

> **Revisão de 20/10/2026 (D-020):** a dona do produto decidiu que a IA atua desde a submissão do desafio e desenha o discovery inteiro (o que perguntar, qual método aplicar e o que a pessoa precisa fazer para obter e enviar as informações). A seção 2.5 substitui 2.2 e 2.3 como caminho principal; o motor por regras de 2.2 passa a ser **o guarda-corpo e o modo de contingência** (IA desligada, limite atingido ou resposta inválida).

### 2.1 Problema atual
A tela do desafio usa 5 perguntas fixas, iguais para qualquer desafio, com exemplos de recepção e pacientes. Isso contraria o kit e a decisão D-003.

### 2.2 Como fica com a IA desligada (honesto e sem custo)
Um **motor de condução por regras**, versionado, no domínio da aplicação (`src/domain/methodology/`), conforme a seção 8 de `CHALLENGE_METHODOLOGY.md` ("regras primeiro, linguagem natural depois"):

1. **Catálogo versionado de necessidades de informação** (arquivo de protocolo, ex.: `protocols/definir_desafio_v1.json`). Cada necessidade tem: chave, por que importa, quando se aplica (condições sobre as pistas marcadas e o que já se sabe), prioridade, e orientações para "onde encontrar", "como descobrir" e "a quem pedir", escritas para cada tipo de foco (atendimento, processo, produto digital, ambiente físico, política, equipe…).
2. **Seleção pelo caso:** o motor lê o que a pessoa já registrou (relato, estrutura confirmada, pistas marcadas, respostas e pendências) e escolhe só as necessidades que se aplicam àquele desafio, na ordem de prioridade. Um desafio de produto digital, um de espera presencial e um de troca de turno marcados de formas diferentes recebem sequências e orientações diferentes.
3. **Uma atividade por vez**, com "Por que estamos perguntando isso?" e o menu "Não sabe responder?" (onde encontrar, como descobrir, preciso de ajuda, responder depois). As 4 rotas já existem no banco.
4. **Rótulo honesto:** a tela informa "Orientação com base no que você registrou e marcou. A orientação com IA está desativada nesta fase de testes." Nada é chamado de "inteligente" ou "personalizado pela IA".
5. **Sem custo e sem chamadas:** o cálculo é determinístico, roda no navegador a partir dos dados salvos; recarregar a página não gera nada novo.

**Limite honesto:** com a IA desligada, a adaptação depende do que a pessoa marcou e respondeu. O motor não "lê" o texto livre. Se a pessoa não marcar nenhuma pista, recebe as necessidades gerais do protocolo, rotuladas como tal.

### 2.3 Como fica quando a IA for autorizada (Futuro)
- **Uma chamada por plano, não por pergunta:** ao confirmar o desafio, a IA propõe um plano (contrato da seção 5.3 do kit) com várias necessidades de uma vez.
- **Validação:** o plano é validado por esquema e pelo motor, que só aceita chaves do catálogo ou novas necessidades dentro de regras. Se falhar, volta para as regras.
- **Persistência:** o plano fica salvo e versionado numa tabela própria (`challenge_plans`). Recarregar lê o salvo.
- **Novo plano só com gatilho explícito** ("Atualizar plano" ou contexto novo relevante), dentro dos limites que já existem (`ai_usage`, `ei_settings`), com a funcionalidade registrada no uso.
- **Dependências:** revisão de privacidade do provedor (D-017, D-018), teste real de concorrência (C2-14) e proposta de vários fornecedores (D-019, IA-01).

### 2.5 Discovery desenhado pela IA desde a submissão (caminho principal, D-020)
1. **Na submissão do desafio**, uma única chamada da IA devolve, juntas, a proposta de entendimento (o que já existe hoje) e o **plano de discovery**:
   - necessidades de informação priorizadas, com o porquê de cada uma;
   - para cada necessidade, o método escolhido entre os seis protocolos versionados da seção 7 de `CHALLENGE_METHODOLOGY.md`;
   - a atividade concreta: o que perguntar, a quem, onde observar, como registrar e como enviar para a plataforma;
   - os cuidados de privacidade;
   - o que fazer quando a pessoa não sabe.
2. **A IA não inventa método:** ela só escolhe entre os protocolos do catálogo e justifica a escolha. O motor por regras valida o plano:
   - esquema;
   - protocolos permitidos;
   - proibição de dados pessoais ou de saúde;
   - nenhuma conclusão ou solução antecipada;
   - limite de tamanho.

   Se falhar, o app usa o plano por regras, rotulado como tal.
3. **A pessoa confirma o entendimento.** Se editar algo relevante, o app propõe gerar o plano de novo, no máximo 1 vez, dentro do limite de 3 pedidos por desafio que já existe. Recarregar a página nunca gera nada.
4. **O plano é salvo e versionado** na tabela nova `challenge_plans`, ligada ao desafio, com o modelo, a versão do prompt e a auditoria. A pessoa vê **uma atividade por vez**. As respostas atualizam o estado sem chamar a IA. Um plano novo só com gatilho explícito.
5. **Qualidade:** você, como especialista, revisa os planos gerados para os 3 casos fictícios do kit antes de qualquer cliente. O resultado fica no `VALIDATION_LOG.md`. A versão do prompt só avança depois dessa revisão.
6. **Sem RAG por enquanto:** a IA não diz que consultou fontes. Os fundamentos vêm só dos protocolos do catálogo, até o RAG existir.
7. **Custo:** cerca de 1 a 2 chamadas por desafio, no plano gratuito, sem faturamento. Acima da cota gratuita, o Google recusa e o app segue pelo plano por regras.
8. **Privacidade:** no plano gratuito, o Google pode usar e revisar o conteúdo. Testes só com desafios fictícios; clientes reais só depois de D-017 e D-018.

### 2.4 Armazenamento agora
- Respostas, "não sei" e pendências continuam em `investigation_questions`. A chave da pergunta passa a ser a chave da necessidade.
- **1 coluna opcional `protocol_version`**, para saber com qual versão do catálogo cada resposta foi dada. Pode entrar na mesma migração da organização.
- Pistas do desafio dentro de `context_json`, que já existe e já é validado como objeto.
- **Sem nova tabela de plano agora:** a tabela `challenge_plans` só será criada com a IA.

---

## 3. Componentes e ícones
- **Biblioteca de ícones:** `lucide-react`, código aberto (licença ISC) e sem custo. **Precisa de aprovação** para entrar como dependência.
- **Componentes:** os do kit (WelcomeHero, ValuePillars, JourneyStepper, ContextBar, ChallengeComposer, ChallengeScopeTags, GuidedTaskCard, ProgressSummary, EvidenceIndicator), com os ícones sugeridos.
- **Tipografia e estilo:** Plus Jakarta Sans, já usada no app; botões sem degradê; telas mobile de 320 a 430 px; toque mínimo de 44 px.

## 4. Arquivos que mudariam (estimativa)
- **Telas:** `src/app/page.tsx` e uma nova página de redefinir senha.
- **Componentes:** `src/components/` (AuthForm, OrganizationForm, Shell e componentes novos do kit).
- **Desafio:** `src/app/desafio/novo/page.tsx` e `src/app/desafio/page.tsx`.
- **Domínio:** `src/domain/challenge/framing.ts`, que será substituído pelo motor, e `src/domain/methodology/` (motor e protocolo).
- **Aplicação:** `src/application/organizations.ts` e `src/application/challenges.ts`.
- **Banco:** uma migração com as colunas opcionais da organização e do membro, `protocol_version` e as funções `ei_create_organization` e `ei_update_organization` com auditoria. Junto vão o script de reversão e o teste de RLS atualizado.
- **Testes:** unitários do motor, com 3 cenários sintéticos diferentes, e testes dos estados das telas.

## 5. Riscos e custos
- **LGPD:**
  - nome da pessoa e textos livres da organização são dados pessoais ou internos; por isso, limites de tamanho e avisos de privacidade;
  - continua proibido coletar dados de saúde ou de pessoas identificáveis;
  - os termos de uso continuam obrigatórios antes de vender.
- **Permissões:**
  - só quem administra a organização (`org_admin`) altera os dados dela, por função do banco com auditoria;
  - o convite e o RLS não mudam.
- **E-mail:** "Esqueci minha senha" e "Reenviar confirmação" usam o envio gratuito do Supabase, que tem limite baixo por hora. Serve para poucos testadores.
- **Netlify:**
  - cada merge que muda o app consome um build do plano gratuito;
  - o projeto está "Private" no Netlify. Antes de convidar testadores, será preciso decidir se ele passa a ser público. O acesso por convite do próprio app continua valendo.
- **Custos novos:** nenhum.

## 6. Ordem proposta (cortes curtos e reversíveis)
1. **UX-1 · Entrada, conta e boas-vindas** (sem migração): telas A, B, C, D e K, nome da pessoa, mostrar senha, esqueci a senha, reenviar confirmação, ícones e cabeçalho.
2. **UX-2 · Organização** (migração pequena): tela E, editar depois e seletor.
3. **UX-3 · Desafio e discovery desenhado pela IA** (migração: `challenge_plans` e `protocol_version`):
   - telas F, G, G2, H, I e J;
   - protocolos da seção 7 em formato versionado;
   - prompt versionado de plano e validação pelo motor;
   - plano por regras como contingência;
   - testes com os 3 cenários do kit, com IA simulada e depois real, só com dados fictícios.
4. **Futuro:** vários fornecedores de IA (D-019) e RAG.
5. **Futuro:** simulação "ver como cliente" para a master, convite de equipe e apoio especializado.

Cada corte termina com testes, prints em 375 px e registros atualizados, e só vai ao `main` com a sua autorização.

## 7. Pontos que precisam da sua decisão
1. **Assinatura:** o kit pede "Uma solução Dani Moscatelli | Experience Design Studio" no rodapé; o cabeçalho que você pediu tem "Dani Moscatelli Studio". Manter os dois, ou unificar?
2. **Nome da pessoa:** obrigatório ou opcional?
3. **Ícones:** aprovar a biblioteca `lucide-react`?
4. **Ordem:** aprovar os cortes UX-1, UX-2 e UX-3, nessa ordem?
5. **Referência ausente:** o kit cita `docs/knowledge/RAG_ARCHITECTURE.md`, que não existe no repositório. Se esse documento existir, envie; se não, sigo sem ele.
