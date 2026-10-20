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

---

## 8. Arquitetura revisada: condução adaptativa (D-021, D-022)

> Esta seção substitui as seções 2.5 e 6 como proposta principal. Nada está implementado. Aguarda aprovação.

### 8.1 O ciclo

```text
Desafio → Plano inicial → Atividade guiada → Evidências → Análise → Próxima decisão
                              ↑                                          │
                              └────────── aprofundar / outra perspectiva / revisar hipótese
                                                                         ↓
                                                    avançar (evidências suficientes)
```

### 8.2 Os cinco componentes e quem decide o quê

| Componente | Responsabilidade | Agora | Depois |
|---|---|---|---|
| **Methodology Engine** (regras, determinístico) | Estado do desafio; catálogo de protocolos aprovados; quais transições são permitidas; critérios de suficiência; quando chamar a IA; validação de tudo que a IA devolve | Sim | Critérios mais finos com uso real |
| **Experience Guide** (tradução do método em ação) | Para cada protocolo: modelo do instrumento (roteiro, ficha, levantamento, fluxo), linguagem sem jargão, o que fazer, com quem, onde, como registrar; lista de termos proibidos na interface | Sim, com modelos para os 6 protocolos | Novos instrumentos com novos protocolos |
| **IA** | Interpretar o desafio; montar o plano inicial; personalizar o instrumento (ex.: perguntas do roteiro para aquele desafio); analisar evidências nos marcos; propor a próxima decisão | Sim, Gemini gratuito, só dados fictícios | Vários fornecedores (D-019) |
| **Validação de evidências** | Tipo da evidência; de qual perspectiva veio (público ou papel, nunca a identidade); fonte única; perspectiva faltando; campos obrigatórios; contradições apontadas pela IA e confirmadas pela pessoa | Regras + análise da IA nos marcos | Critérios por setor e risco, com RAG |
| **RAG especialista** | Fundamentos curados, com procedência, para escolher e aplicar métodos | **Não existe.** A IA usa só o texto dos protocolos aprovados e não afirma ter consultado fontes | Corte próprio (metodologia, seção 11) |

**Regra de decisão:** a IA **propõe**; o Engine **valida e decide** o que pode acontecer; a pessoa **confirma** tudo que vira dado aprovado (entendimento, descobertas). Nenhuma transição crítica é decidida só pela IA (CLAUDE.md).

### 8.3 Planejamento inicial (na submissão)
- **Entrada da IA:**
  - o texto original do desafio;
  - o contexto mínimo da organização (segmento, o que oferece, papel de quem responde, porte);
  - as pistas marcadas pela pessoa;
  - o catálogo de protocolos **aprovados**.
- **Saída validada pelo Engine:**
  - entendimento do desafio, para a pessoa confirmar;
  - hipóteses iniciais, marcadas como hipóteses;
  - necessidades de informação, com o porquê de cada uma;
  - uma fila curta de atividades, cada uma ligada a um protocolo aprovado;
  - **o instrumento da primeira atividade já personalizado.**
- **Custo:** 1 chamada. Salva e versionada; recarregar não gera nada.

### 8.4 Execução da atividade (sem chamar a IA)
- **Cartão da atividade:**
  - o que vamos descobrir e por quê;
  - o que você vai fazer, com quem e onde;
  - **o instrumento:** "Ver roteiro de conversa", "Abrir ficha de observação", "Quais dados procurar", "Desenhar o caminho";
  - os cuidados de privacidade.
- **Registro estruturado:** um campo para cada item do instrumento (ex.: uma resposta por pergunta do roteiro, por pessoa conversada).
  - A pessoa informa o **perfil** da fonte (ex.: "cliente que desistiu", "atendente"), nunca nome ou contato.
  - O tipo da evidência é registrado: relato, observação, registro ou medição.
- **"Não sei":** as quatro saídas que já existem (onde encontrar, como descobrir, pedir ajuda, deixar para depois).
- **Regras imediatas, sem custo:**
  - "você registrou 1 conversa; o roteiro pede ao menos 3 perspectivas";
  - "ainda não há relato de quem usa o serviço, só da equipe";
  - campos obrigatórios em branco.

### 8.5 Análise e próxima decisão (nos marcos)
- **Marcos que liberam uma chamada:**
  - a pessoa conclui uma atividade;
  - a pessoa marca "Descobri algo importante";
  - a fila de atividades acabou.

  Responder campo a campo nunca chama a IA.
- **A IA analisa as evidências daquele marco e devolve:**
  - descobertas, sempre ligadas às evidências que as sustentam;
  - tipo e força de cada descoberta (relato individual não vira conclusão geral);
  - contradições, lacunas, perspectivas faltando e riscos de viés;
  - **uma decisão proposta:** aprofundar, buscar outra perspectiva, revisar hipótese ou avançar;
  - a próxima atividade, com o instrumento personalizado.
- **O Engine valida a resposta:**
  - **avançar** só se as regras de suficiência da etapa forem atendidas, conforme método, diversidade de perspectivas e risco;
  - nenhuma recomendação ou conclusão categórica;
  - risco alto (saúde, colaboradores) → sugere apoio especializado, sem bloquear o que é seguro.
- **Tela "O que descobrimos até aqui":** descobertas com a etiqueta do tipo de evidência e "Ainda precisamos verificar…". A pessoa confirma ou corrige antes de continuar.

### 8.6 Dados (migração do UX-3)
Novas tabelas, com RLS (só leitura para membros), escrita por funções do banco com auditoria e escrita da IA só pelo servidor:
- **`organizations` e `organization_members`:** colunas opcionais do contexto mínimo.
- **`methodology_protocols`:**
  - id, versão, status (rascunho, aprovado), especificação e fontes;
  - só a master altera, e só os aprovados vão para a IA;
  - começa com os 6 protocolos.
- **`challenge_plans`:** versões do plano, com origem (IA ou regras), modelo, versão do prompt e versão do catálogo.
- **`challenge_activities`:** atividade, protocolo, necessidades, status e instrumento personalizado.
- **`evidences`:**
  - atividade, tipo, perspectiva (perfil, sem identidade), conteúdo com limite e data;
  - anexos ficam para depois (exigem armazenamento privado e revisão de LGPD).
- **`evidence_analyses`:** marco, evidências usadas, descobertas, contradições, lacunas, decisão proposta, confirmação da pessoa, modelo e versão do prompt.
- **`ai_usage`:** passa a registrar também a funcionalidade (plano ou análise).
- **`investigation_questions`:** fica para os desafios antigos.

### 8.7 Custos e limites
- **Gratuito:** Gemini no Free Tier e Supabase no plano gratuito. Nenhum serviço novo.
- **Chamadas por desafio:** 1 no plano inicial + 1 por marco. O limite atual de **3 por desafio** é baixo para o ciclo. **Decisão sua:** proposta de 10 por desafio durante os testes, mantendo 20 por pessoa por dia e 100 por dia na plataforma.
- **Contingência:** quando a IA recusa, falha ou estoura o limite, o Engine segue com o plano por regras, identificado como tal.

### 8.8 Cadastro completo do cliente (D-022), fora do acesso público
- **Fluxo:**
  - entrada;
  - criar conta, com nome obrigatório, e confirmar o e-mail;
  - verificação do convite;
  - boas-vindas curtas;
  - organização, com o contexto mínimo;
  - pagamento, **pulado nos testes** (marcado no estado da conta);
  - desafio.
- **"Escondido":** o app não tem link no site, o projeto está "Private" no Netlify e o uso exige convite.
- **Para você viver o fluxo como cliente:** sugiro uma conta de cliente de teste sua, por exemplo `daniellemoscatelli87+cliente@gmail.com` (o Gmail entrega no seu e-mail principal), adicionada à lista de convidadas. A conta master continua separada.

### 8.9 Ordem de implementação proposta
1. **UX-3a · Base:**
   - contexto mínimo da organização e nome obrigatório;
   - catálogo de protocolos e modelos de instrumentos;
   - plano inicial pela IA;
   - cartão de atividade com instrumento e registro estruturado de evidências;
   - regras imediatas de qualidade.
2. **UX-3b · Adaptação:**
   - análise nos marcos e tela "O que descobrimos até aqui";
   - decisão proposta, validada pelo Engine e confirmada pela pessoa.
3. **UX-1 restante:** entrada pública, boas-vindas, "Esqueci minha senha" e rodapé "by Dani Moscatelli Studio".
4. **Depois:** RAG especialista, anexos, novos protocolos com curadoria, encaminhamento a especialista, vários fornecedores, pagamento, simulação para a master e equipe.

Cada corte termina com:
- testes automáticos;
- os 3 casos fictícios do kit, com a IA simulada e depois real;
- prints em 375 px;
- os registros atualizados.

E só vai ao `main` com a sua autorização.
