# Área restrita em React: plano de migração

> Decisão da dona do produto (27/11/2026, D-051): a área restrita do site do estúdio (`/admin/`) será refeita em React, para usar os componentes reais do Design System Dani Moscatelli em vez de cópias em HTML feitas à mão. Este documento é o plano. A fundação está no branch `claude/admin-react`, **sem publicação**.

## 1. Situação em 27/11/2026

| O quê | Estado |
|---|---|
| App em `apps/area-restrita/` (Vite 6 + React 18.3 + Tailwind 4.1.12, os mesmos do DS) | implementado, testado, não publicado |
| Casca do painel (menu lateral, cabeçalho, notificações, perfil, fundo cinza) | implementado com o `sidebar` do DS (provisório, ver seção 6) |
| Entrar, definir senha, nova senha e sem acesso (mesma conta e mesma sessão das páginas de HTML) | implementado e testado |
| Início em React, com a mesma informação da página de HTML | implementado e testado, só em prévia (`/admin/app/`) |
| Conferência de conformidade com o DS (`npm run conformidade`) | em zero desvios desde o primeiro dia |
| Sincronização da pasta `ui` inteira do DS (`arquivos.txt` com pasta e `excluir`) | implementado |
| Teste na rotina diária do DS (tipos, testes, conformidade e build do app) | implementado no workflow |
| Páginas de HTML em `public/admin/` | **intactas** e servidas como hoje |

## 2. Como publicar (regra da dona do produto, 27/11/2026)

> "Migração para o DS em lotes por tela. Lotes sem mudança visível podem ser publicados pelo Claude depois de todos os testes, da conferência e das capturas antes e depois, com resumo e imagens enviados à dona do produto em seguida. Lotes com mudança visível são aprovados por ela antes, com um 'sim' por lote."

**As páginas em React mudam a aparência** (componentes reais do DS no lugar das cópias à mão; ver as capturas antes e depois de cada lote). Por isso **todo lote desta migração é "com mudança visível": só é publicado depois do "sim" da dona do produto para aquele lote.** Isso vale também para a fundação: o merge dela publica a prévia em `/admin/app/` (as páginas de `/admin/` não mudam), então também espera o "sim".

Cada lote leva: testes (tipos, unitários, conformidade em zero, build), o teste no navegador em 1280 e 390 px, capturas antes (HTML) e depois (React), o resumo e a lista de componentes do DS usados em cada peça.

## 3. Arquitetura

### 3.1 Onde o app fica e por quê

`apps/area-restrita/`, um pacote próprio (com `package.json` e `package-lock.json`), como o app Experience Intelligence, publicado **dentro do mesmo projeto do Cloudflare Pages do site**:

- **Mesmo projeto e mesmo domínio.** A área restrita continua em `www.danimoscatelli.com.br/admin/`, com a mesma origem das páginas de HTML. Isso permite o corte página a página e a mesma sessão nas duas (seção 3.4). Um projeto separado (como o do EI) mudaria o domínio e quebraria a sessão compartilhada.
- **Pacote separado do site.** O site tem a própria folha de estilos (`src/index.css`, com paleta antiga) e não tem as bibliotecas dos componentes do DS (Radix, Recharts…). Misturar as duas no mesmo build arriscaria o site público. O app só entra no build do site no fim (seção 3.2).
- **Vite, não Next.** O site já é Vite; o app é estático (a segurança vem do RLS do Supabase), não precisa de servidor; e o Next do app EI tem uma falha de segurança pendente (D-048).
- **As mesmas versões do DS:** React 18.3.1, Vite 6, Tailwind 4.1.12 pelo plugin do Vite e as mesmas versões de Radix, lucide-react (1.70.0), Recharts, react-day-picker etc. Assim **todos** os componentes da pasta `ui` compilam e funcionam como no site do DS, inclusive o `calendar` (a FindLook usa React 19 e precisa excluí-lo). O DS não tem checagem de tipos; aqui ela roda em modo estrito sobre a pasta `ui` inteira e passou sem ajustes.

### 3.2 Build e publicação

- `npm run build` na raiz (o comando do Cloudflare Pages) agora faz: `tsc -b && vite build` (site, igual) e `npm run build:area-restrita` (instala as dependências do app com `npm ci` e roda o build dele).
- O build do app gera `apps/area-restrita/dist/` com `base: "/admin/app/"`; `scripts/montar-saida.mjs` copia para `dist/admin/app/` do site e grava os `index.html` das páginas em React (seção 3.3).
- Nada muda em `functions/` nem no painel do Cloudflare. O build do site fica um pouco mais longo: instala as dependências do app (6 s aqui, com cache; sem cache, mais) e compila (cerca de 5 s).

### 3.3 Corte página a página

O estado de cada página fica em `apps/area-restrita/src/rotas.json` (campo `react`), lido pelo app e pelo build:

| Estado | O que o build faz | O que a pessoa vê |
|---|---|---|
| sem entrada | nada | `/admin/<página>/` é a página de HTML, como hoje |
| `"previa"` | grava `dist/admin/app/<página>/index.html` | a página em React em `/admin/app/<página>/`; `/admin/<página>/` continua HTML |
| `"publicada"` | também grava `dist/admin/<página>/index.html`, **no lugar da cópia de HTML só no `dist`** | `/admin/<página>/` passa a ser React |

- Cada pasta recebe o próprio `index.html` porque o site tem `404.html` (o Cloudflare não faz o "SPA fallback"); assim, abrir direto `/admin/contatos/?id=…` funciona.
- **Voltar atrás** é trocar `"publicada"` por `"previa"`: a página de HTML volta no próximo build.
- A página de HTML em `public/admin/<página>/` só é apagada num commit posterior, depois que a versão em React estiver publicada e conferida. Até lá, as duas convivem.
- Hoje: `{ "inicio": "previa" }`.

### 3.4 Sessão e login

- Mesmo projeto e mesma chave pública do Supabase, a mesma `storageKey` (`dm-admin-auth`) e a mesma regra de "Permanecer conectado" (`dm-admin-remember`: `localStorage` ou `sessionStorage`). **A sessão vale nas duas versões:** quem entra no React abre as páginas de HTML já logado, e vice-versa (testado).
- O acesso continua pelo papel `admin` no `app_metadata` (só o servidor define), com a mesma renovação única da sessão antiga. A segurança dos dados continua no RLS; o app não traz segredo nenhum.
- Os mesmos fluxos e textos: Entrar, "Esqueci minha senha ou ainda não tenho senha" (link de redefinição para `/admin/`), Nova senha (8 caracteres ou mais) e Sem acesso. Os registros "Entrou/Saiu da área restrita" continuam no `admin_log`.
- Também compartilhados: a escolha de menu recolhido (`dm-admin-menu-recolhido`) e o aviso que uma página deixa para a próxima (`admin-toast`, mostrado com o `Toaster` do DS).

### 3.5 Roteamento

- React Router, com a base `/admin/app` na prévia e `/admin` depois do corte (`baseDoRoteador`).
- Links da casca e dos dados são sempre escritos como `/admin/<caminho>` e passam por `LinkDaArea` (`resolverHref`): se a página já é React na base atual, a navegação é interna (sem recarregar, a casca fica); senão, abre a página de HTML. Busca e âncora seguem junto (`?id=`, `?aba=`, `?situacao=`, `?p=`, `#emails`).
- Página que ainda não existe em React, aberta dentro da prévia: aviso do DS com o link de volta para a Início.

## 4. Design system no app

- **Sincronização:** `design-system/arquivos.txt` ganhou as linhas do app: `index.css`, `fonts.css`, `tailwind.css`, `theme.css` e **a pasta `src/app/components/ui/` inteira** (`apps/area-restrita/src/components/ui/`). O `scripts/sincronizar-design-system.sh` passou a aceitar pastas inteiras (com destino terminado em `/`; o que sair do DS é apagado no app) e linhas `excluir <arquivo>`, com a mesma semântica do script do produto FindLook. Nenhuma exclusão hoje. As linhas avulsas de antes continuam iguais (conferido: a sincronização na mesma versão `30d1ef0` não mudou nenhum arquivo existente).
- **Nunca editar a pasta `ui` do app nem os estilos copiados.** Peça que falta é criada no DS pelo processo de `propostas/README.md` do DS e chega pela sincronização.
- **Catálogo:** antes de cada tela, consultar `design-system/CATALOGO.md` (sincronizado) ou https://designsystem.danimoscatelli.com.br.
- O Tailwind lê a pasta `ui` inteira (`@source` do DS), então o CSS do app tem todas as classes do DS (180 kB, 27 kB comprimido). O JavaScript tem 426 kB (134 kB comprimido) mais o cliente do Supabase em arquivo próprio (230 kB, 60 kB comprimido).

## 5. Conformidade com o DS (desde o primeiro dia, em zero)

`npm run conformidade` (em `apps/area-restrita/`) é a mesma verificação do produto FindLook, com três ajustes para este DS:

- regras herdadas: cor solta (hexadecimal, rgb, hsl), cor arbitrária do Tailwind, paleta padrão do Tailwind, tamanho de texto, raio, sombra e espaçamento arbitrários, `<button>`, `<input>`, `<select>` e `<textarea>` soltos, componente feito à mão que o DS tem;
- **paleta `pink` também proibida** (as escalas deste DS são graphite e crimson);
- **sombra parada proibida** (`shadow`, `shadow-sm`…; D-041: cards sobre o fundo cinza só com borda; sombra só em `hover:`/`focus:`);
- **componente com o nome de um componente do DS** (lidos da pasta `ui` sincronizada) conta como duplicado; e as peças à mão das páginas de HTML (`Toast`, `ConfirmDialog`, `RowLink`) não podem voltar.

A base (`apps/area-restrita/conformidade-base.json`) está em **zero**; qualquer desvio falha. A catraca (a base só desce) é a mesma da FindLook, para o caso de a dona do produto aceitar uma exceção registrada. A verificação roda nos testes (`tests/conformidade.test.ts`) e no workflow.

## 6. Componentes do DS em cada peça da fundação

| Peça | Componentes do DS |
|---|---|
| Menu lateral | `painel-shell`: `MenuLateralProvider` (chave `dm-admin-menu-recolhido`, a mesma das páginas de HTML), `MenuLateral grudarAbaixoDe={64}` (coluna branca da altura da página toda, 240/64 px, empurra o conteúdo), `TopoDoMenu` ("≡ MENU"), `NavDoMenu`, `GrupoDoMenu` (Parceiros e Projetos, com contador), `ItemDoMenu` (com `as={LinkDaArea}` e `ContadorDoPainel`); abaixo de 1024 px, os mesmos itens num `SidePanel side="left"`. Contadores: Contato = não lidas; Parceiros = candidaturas não vistas + e-mails abertos pelos parceiros; Projetos = respostas novas; o sino é a soma deles |
| Cabeçalho | `BarraSuperiorDoPainel` (branca, na largura toda), `Button` ghost (abrir o menu no celular), `BotaoDeNotificacoes` (contador redondo vermelho no canto do sino), `GatilhoDaConta` + `DropdownMenu*` (perfil: Configurações e Sair) |
| Notificações | `SidePanel`, `SidePanelContent`, `SidePanelHeader`, `SidePanelBody`, `LinhaDeLista`, `IconeComBase` (rosa = nova, cinza = já vista), `Badge`, `Separator` |
| Entrar e senha | `Card`, `CardHeader`, `CardDescription`, `CardContent`, `Heading`, `Selo`, `Label`, `Input`, `PasswordInput`, `PasswordConfirm`, `Checkbox`, `Button`, `Alert` |
| Início | `CabecalhoDaPagina` (Opção A, uma linha curta), `AlertaComAcao` tom aviso + `BotaoDoAlerta` + `LinkDoAlerta` (o que fazer agora) ou tom sucesso ("Tudo em dia"), `GradeDeCards` + `CardIndicador compacto soNumeroNoCelular` (rótulo, número e contexto; card inteiro clicável; 4 lado a lado a partir de 44rem de conteúdo, 2 × 2 antes; no celular, só rótulo e número), `CardComCabecalho` + `LinkVerTudo` + `DivisorSuave` (um por linha), `BarraDeComposicao` (situação das últimas mensagens), `LinhaDeLista` + `IconeComBase` + `ChipDeEstado` (estado em texto), `Alert` (erro), `Skeleton` |
| Avisos rápidos | `Toaster` (`sonner`) |

Fora dos componentes, o código do app só usa classes de layout (grid, flex, gap, padding da escala) e tokens.

## 7. Peças que faltam no DS (vão para o DS primeiro, pelo processo formal)

Nenhuma foi feita à mão no app; enquanto não chegam, a fundação usa o componente mais próximo do DS e a diferença aparece nas capturas.

**Atualização (27/11/2026):** os itens 1 a 4 foram trazidos da FindLook para o DS Dani Moscatelli no branch `claude/pecas-do-painel` do DS (proposta `propostas/2026-11-27-pecas-do-painel.md`, ainda sem o "sim") e a casca e a Início já usam essas peças. **Atenção:** a pasta `src/components/ui/` deste branch veio da sincronização com `DS_REF=claude/pecas-do-painel`, mas `design-system/versao.txt` continua em `30d1ef0` de propósito: só muda (com nova sincronização pelo `main`) depois que o DS publicar as peças no `main`. Antes disso, este branch não pode ir para o `main`.

1. **Casca do painel (`PainelShell`).** A casca aprovada (D-039, D-041: cabeçalho branco na largura toda, menu embaixo com o botão "Menu", 240/64 px, item ativo rosa claro com texto vermelho, grupos com linha-guia e painel ao lado no recolhido) existe no site do DS só como marcação do `App.tsx` e, como componente, **só no DS da FindLook** (`ui/painel-shell.tsx`, "moldura igual à do site do design system"). O `ui/sidebar` do DS Dani Moscatelli é o do shadcn sem adaptação: item ativo cinza, menu na altura toda (o cabeçalho fica ao lado, não acima), textos em inglês para leitores de tela ("Toggle Sidebar", "Sidebar", "Displays the mobile sidebar."), botão de grupo em seminegrito (herda o `button` da base) e, no celular, a dica invisível ainda abre uma camada que o primeiro Esc fecha (contornado no app sem dica no celular). **Proposta:** trazer `painel-shell.tsx` da FindLook para o DS Dani Moscatelli (com os tokens deste DS) e corrigir os textos do `sidebar`.
2. **Cabeçalho da página do painel (`CabecalhoDaPagina`)** e o layout "Opção A" (título, descrição e abas fora dos cards, no fundo cinza; conteúdo em cards com cabeçalho de ícone): decisão de 23/11 no DS da FindLook (`ui/painel-cabecalho.tsx` e `PainelTemplates`); no DS Dani Moscatelli os templates (Dashboard, Configurações, Equipe, Caixa de entrada) são só demonstração, em moldura de navegador.
3. **Card de indicador (KPI).** O `CardsDeKpi` do DS é só demonstração (e com sombra, contra a D-041). A Início usa `Card` + `CardMidia`; ficam faltando o número em destaque, o estado de alerta (hoje o card rosa de "não respondidas") e o estado zero (ícone cinza). **Proposta:** trazer o card de indicador de `ui/painel-dados.tsx` da FindLook.
4. **Ícone com base de estado** para o início das linhas (envelope verde quando respondida, calendário azul com reunião, rosa quando não lida, cinza quando lida). Hoje a `LinhaDeLista` recebe um `Avatar` cinza com o ícone e o estado por texto para leitores de tela; as cores de estado se perdem. A FindLook tem o "ícone com base" em `painel-dados.tsx` (regra de 20/11/2026).
5. **Template de autenticação** importável (o `AuthTemplate` do DS é só demonstração).
6. **Rótulo de grupo em lista** ("Novas", "Já visualizadas") e **estado vazio** (a seção "Rótulos › Estados vazios" é marcação à mão).
7. **Caixa de entrada** (`InboxTemplate`, só demonstração) para Contato; **agenda do mês com eventos** para Reuniões (o `Calendar` do DS é um seletor de datas; servir como agenda precisa ser conferido no DS); **chip de estado** com ícone e texto (a FindLook tem `status-chip.tsx`).
8. `ui/dialog` com o botão fechar "Close" em inglês para leitores de tela (já registrado em D-047): necessário antes das páginas com janelas (Contato, Comunicados, Lançamento).

## 8. Ordem das páginas e estimativa

P = até 1 dia de trabalho, M = 2 a 3 dias, G = 4 dias ou mais (sem contar a criação das peças no DS).

| Lote | Página | Componentes e templates do DS | Depende do DS | Esforço |
|---|---|---|---|---|
| 0 | **Fundação** (este branch): app, casca provisória, login, Início em prévia, conformidade, sincronização | ver seção 6 | não | feito |
| 1 | Casca definitiva + **Início publicada** | `PainelShell`, `CabecalhoDaPagina`, card de indicador, ícone com base, `LinhaDeLista`, `GradeDeCards` | itens 1 a 4 | P (depois do DS) |
| 2 | **Lançamento** (abas Novas e Notificadas, disparar lançamento) | `Tabs`, `LinhaDeLista`, `AlertDialog` (confirmação), `Button`, `Badge`, `Toaster` | item 8 | P |
| 3 | **Configurações** (dados pessoais e foto, e-mail, senha, gestão de dados, log da plataforma) | layout "Opção A", `Card`, `Input`, `Label`, `Upload` (`ImageUpload`), `PasswordConfirm`, `AlertDialog`, `Table` ou `LinhaDeLista` (log), `Pagination` | item 2 | M |
| 4 | **Reuniões** (agenda do mês, próximas reuniões, Google Agenda) | `Calendar` (agenda), `LinhaDeLista`, `Badge`, `Button` | item 7 (agenda) | M |
| 5 | **Comunicados** (escrever, enviados, ver enviado) | `Dialog` ou `SidePanel`, `Textarea`, `Input`, `Checkbox`, `LinhaDeLista`, `AlertDialog` | item 8 | M |
| 6 | **Contato** (Recebidos/Enviados, conversa, responder, novo e-mail com Cc/Cco e anexos, reunião) | `InboxTemplate`, `Tabs`, `LinhaDeLista`, `SidePanel` ou `Dialog`, `Textarea`, `Upload` (`UploadDropzone`, `UploadList`), `Calendar`, `Badge`, `AlertDialog` | itens 7 e 8 | G |
| 7 | **Parceiros** (Dashboard, perfis e candidaturas, e-mails, autorização da galeria, insights) | `Tabs`, gráficos do DS (`BarrasOrdenadas`, `GraficoDeRosca`…), `LinhaDeLista`, `Accordion`, `SidePanel`, `Calendar`, `Badge`, `Timeline`, `AlertaComAcao` | itens 3 e 4 | G |
| 8 | **Pesquisas** (painel de cada pesquisa, gráficos, matriz, relatos com IA, respostas) | gráficos do DS (`GraficoDeLinhas`, `BarrasOrdenadas`, `BarrasEmpilhadas100`, `MapaDeCalorMatricial`, `DescobertaVisual`, `TabelaDeDados`…), `Timeline`, cards de indicador, `LinhaDeLista`, `Tabs`, `SegmentedControl` | item 3 | G |

A ordem vai do mais simples ao mais complexo, para a casca e as peças novas do DS se firmarem antes das telas grandes. Pesquisas fica por último também porque outra conversa está mexendo em `public/admin/pesquisas/` agora.

## 9. Riscos e cuidados

- **Build do site depende do app.** Se o app não compilar, o site inteiro não publica. Mitigação: o workflow do DS testa o app antes de abrir o PR, e cada lote roda tipos, testes, conformidade e build.
- **Peças que faltam no DS** atrasam os lotes que dependem delas (seção 8). Sem elas, a página não é publicada; não há solução à mão.
- **Acessibilidade de peças do DS** (decisão da dona do produto, seção 10): o `Button` principal e o `Badge` padrão do DS (texto branco sobre `--primary`, 4,2:1) e o texto `--muted-foreground` sobre o fundo `--background` (4,3:1) ficam abaixo de 4,5:1 (WCAG AA para texto normal). Na Início, os selos usam o `Badge` de contorno e o texto de apoio usa `--foreground`; o botão Entrar continua o do DS.
- **Duas versões ao mesmo tempo:** durante a migração, a pessoa alterna entre páginas de HTML e React (aparências diferentes, recarga ao trocar). Mitigação: lotes curtos e a casca definitiva no lote 1.
- **Mudanças do DS** chegam todo dia ao app pela sincronização (aprovada pela dona do produto): o teste pega erros de tipos, testes, conformidade e build, não de aparência.
- **Tamanho:** 426 kB de JavaScript (134 kB comprimido) na primeira visita. Se crescer muito com as páginas grandes, dividir por página (`import()` dinâmico).
- **Testes no navegador** não estão na integração contínua (o repositório não tem workflow de pull request); rodam a cada lote, com as capturas.

## 10. Testes

- `npm run typecheck` (estrito, inclusive a pasta `ui` inteira), `npm test` (Vitest: rotas e corte, textos e regras da Início, notificações, sessão guardada, conformidade), `npm run conformidade`, `npm run build`.
- `tests/navegador/inicio.cjs`: Playwright com o Supabase simulado na rede (cliente real, respostas falsas com dados fictícios), em 1280 e 390 px: login (validação, olho da senha), Início (cards, listas, links para as páginas de HTML, fundo cinza, cards sem sombra), menu (itens, página atual, grupos, recolher e a chave compartilhada; painel no celular, fecha com Esc), notificações (abre, lista, fecha com Esc), perfil, axe (WCAG A/AA) sem violações na Início, sem erros no console, sem rolagem horizontal da página nem dos cards, e a Início de HTML aberta já logada com a sessão do React (com captura para comparar).

## 11. Decisões pendentes da dona do produto

1. **Peças do DS:** aprovar a proposta de trazer da FindLook para o DS Dani Moscatelli a casca do painel, o cabeçalho da página ("Opção A") e o card de indicador, com o ícone com base (seção 7). Sem isso, o lote 1 não sai.
2. **Contraste do DS:** texto branco sobre `--primary` (botão principal e badge padrão, 4,2:1) e `--muted-foreground` sobre o fundo cinza (4,3:1) ficam abaixo do AA. Decidir no DS (escurecer o tom, ou outro caminho).
3. **"Sim" para a fundação:** o merge publica só a prévia em `/admin/app/` (as páginas de `/admin/` não mudam).
