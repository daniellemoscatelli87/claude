# Site público em React com o Design System: plano de migração

> Decisão de 27/11/2026 (D-053): o site público do estúdio (início, Projeto Piloto, Rede de Parceiros, cadastro, galeria, pesquisa, privacidade, descadastro, 404 e as páginas de apresentação do EI) passa a ser refeito em React, página por página, com os componentes reais do Design System Dani Moscatelli, como a área restrita (D-051, `docs/engineering/ADMIN_REACT.md`). Endereços, textos, cabeça (título, descrição, canonical, compartilhamento) e comportamento continuam os mesmos. A dona do produto delegou a escolha de como o site consome o DS.

## 1. Situação em 27/11/2026

| O quê | Estado |
|---|---|
| App em `apps/site/` (Vite 6 + React 18.3 + Tailwind 4.1.12, as versões do DS e da área restrita) | implementado e testado |
| HTML pronto de cada página gravado no build (o React assume a página no navegador) | implementado e testado |
| Mapa de páginas com o lote de cada uma e o estado "previa" ou "publicada" (`apps/site/src/rotas.json`) | implementado e testado |
| Pasta `ui` inteira do DS sincronizada (`d2aeb40`, com as peças do site pedidas na lista "FALTA NO DS") | implementado |
| Conformidade com o DS (`npm run conformidade`) | zero desvios |
| Lote S0: app React antigo apagado (cerca de 3.000 linhas sem uso) | feito; o dist ficou igual byte a byte |
| Lote S7: 404, descadastro e privacidade **publicadas** | feito e testado (seção 6) |
| Páginas de HTML de hoje | intactas; continuam servidas até cada página ser trocada |

## 2. Como publicar

A dona do produto delegou a publicação (decisões de 27/11/2026: autonomia total para finalizar os DS e publicar, sem parar para aprovação). Cada lote vai ao `main` por pull request só depois de todos os testes abaixo, e o resumo com as capturas antes e depois vai para ela em seguida. O S0 (limpeza) não muda nada no ar.

Cada lote leva: tipos, testes, conformidade em zero, build, comparação do dist (seção 3.4), o teste no navegador em 390, 768, 1024 e 1280 px, capturas antes e depois e a lista de componentes do DS de cada peça.

## 3. Arquitetura

### 3.1 Por que um app próprio (`apps/site`) e não o da área restrita

- **Buscadores e primeira pintura.** As páginas públicas precisam chegar com o texto pronto no HTML (SEO, compartilhamento, leitura antes do JavaScript). A área restrita é um app de uma página só, montado no navegador e protegido por login. O site grava o HTML de cada página no build (renderização no servidor, só no build) e o navegador só "liga" o React nele. São necessidades diferentes; misturar as duas no mesmo app complicaria as duas.
- **Base e risco separados.** Os arquivos do site ficam em `/site/`, os da área restrita em `/admin/app/`. Um erro num app não derruba o outro.
- **O que é igual:** as mesmas versões do DS, a mesma sincronização da pasta `ui` inteira, a mesma conferência de conformidade, o mesmo corte por `rotas.json`, o mesmo projeto do Cloudflare Pages e o mesmo domínio. Quando os dois estiverem maduros, dá para juntá-los num só pacote para instalar as dependências uma vez (pendência de otimização, seção 9).
- **Por que não estender o build antigo do site (Vite 8 + React 19 na raiz):** as páginas de HTML de hoje usam outra versão do Tailwind e uma folha própria por página; os componentes do DS precisam do React 18.3 e das mesmas versões do site do DS. Separado, o HTML de hoje fica intocado até cada troca.

### 3.2 Build

- `npm run build` na raiz (o comando do Cloudflare Pages): `tsc -b && vite build` (páginas de HTML, como hoje), `npm run build:area-restrita` (D-051) e `npm run build:site`.
- `build:site` instala as dependências do app (`npm ci`) e roda o build dele: o JavaScript e o CSS de cada página (`apps/site/dist/`, com o manifesto do Vite), a versão para o servidor (`apps/site/dist-servidor/servidor.js`, só para o build) e `scripts/montar-saida.mjs`, que grava as páginas no `dist` do site.
- Uma entrada por página: `apps/site/src/paginas/<id>/entrada.tsx`, só as que estão em `react` no `rotas.json`. O que as páginas dividem (React, peças do DS, estilos) fica em arquivos `comum-*.js` e `site-*.css`, guardados no cache do navegador entre as páginas.
- Nada muda em `functions/`, em `_redirects` nem no painel do Cloudflare.

### 3.3 Corte página a página

O estado de cada página fica em `apps/site/src/rotas.json` (campo `react`):

| Estado | O que o build faz | O que a pessoa vê |
|---|---|---|
| sem entrada | nada | a página de HTML, como hoje |
| `"previa"` | grava `dist/site/previa/<caminho>index.html` (a 404 em `/site/previa/404/`), sempre com `noindex, nofollow` | a página em React no endereço da prévia; o endereço de hoje continua HTML |
| `"publicada"` | também grava `dist/<saida>` (por exemplo `dist/404.html` ou `dist/comunicados/descadastro/index.html`), **no lugar da cópia do HTML, só no `dist`** | o endereço de hoje passa a ser React, com a mesma cabeça da página de HTML |

- **Voltar atrás:** trocar `"publicada"` por `"previa"`; o próximo build volta a servir o HTML, enquanto ele estiver em `public/`.
- A página de HTML só sai de `public/` num commit posterior, depois de a versão em React estar publicada e conferida no ar. Ela vai para `apps/site/tests/referencia/` (o `origem` do mapa aponta para lá), só para os testes de cabeça e de textos. Depois disso, voltar atrás pede também devolver o arquivo a `public/`. Já saíram: `404.html` e `comunicados/descadastro/index.html` (conferidas no ar em 27/11/2026).
- **Cabeça igual:** título, descrição, robots, referrer, canonical, Open Graph e Twitter ficam em `cabeca` no `rotas.json`. O teste `tests/cabeca.test.ts` compara com a página de HTML enquanto ela existir.

### 3.4 Prova de que nada mais muda

`node apps/site/scripts/comparar-dist.mjs <dist-antes> <dist-agora>` compara dois builds byte a byte e só aceita como diferença a pasta `site/` e as páginas marcadas `"publicada"`. Em 27/11/2026: **301 arquivos iguais** ao build do `main` (`cd2aab0`), 11 diferenças esperadas (6 arquivos do app, 3 prévias e as 2 páginas publicadas). Os dois builds são determinísticos (o mesmo código gera os mesmos bytes).

### 3.5 Peças de todas as páginas

- **Aviso de cookies e medição:** `AvisoCookies` do DS (mesma chave `dm-cookies` no navegador que o `public/analytics.js`, então a escolha vale nas duas versões) e `src/compartilhado/medicao.ts`, com a mesma regra do `analytics.js` (Google só depois de "Aceitar", anúncios negados, `window.dmEvento`, cookies `_ga` apagados ao recusar depois de aceitar). O rodapé e os links "Preferências de cookies" chamam `abrirAvisoCookies()`.
- **WhatsApp:** `BotaoWhatsApp` do DS (mesmo número e mensagem do `public/whatsapp.js`), com `RodapeSite espacoFlutuante`.
- **Fontes:** o endereço vem do `fonts.css` sincronizado e entra por `<link>` na cabeça (como nas páginas de HTML), sem o `@import` encadeado.
- **E-mails no texto:** as marcas `email_off` do Cloudflare continuam em volta do e-mail do estúdio na Política de Privacidade.
- As páginas de HTML continuam com `analytics.js` e `whatsapp.js` até o lote S1.

### 3.6 Tamanho

CSS do site em React: 188 kB (28 kB comprimido), com todas as classes da pasta `ui` (o Tailwind lê a pasta inteira, como na área restrita). JavaScript comum: 174 kB (56 kB comprimido); cada página: 1 a 20 kB. Ficam no cache entre as páginas. Antes, a 404 e o descadastro não carregavam nada além do HTML.

## 4. Design system no app

- `design-system/arquivos.txt`: `index.css`, `fonts.css`, `tailwind.css`, `theme.css` e a pasta `src/app/components/ui/` inteira em `apps/site/src/components/ui/`. **Nunca editar** esses arquivos no site.
- `apps/site/src/styles/site.css` é a entrada de estilos do app (Tailwind e tokens do DS, sem o `@import` das fontes).
- Conformidade: `npm run conformidade` (em `apps/site/`), a mesma verificação da área restrita (cor solta, valores arbitrários do Tailwind, paletas padrão, sombra parada, elementos HTML soltos, componente com nome de um do DS), mais as peças à mão do site que não podem voltar (`Rodape`, `Tag`, botão do WhatsApp e aviso de cookies próprios). Base em zero.
- A rotina diária do DS testa o app (tipos, testes, conformidade e build) antes de abrir o PR.

## 5. Páginas, ordem e o que cada uma precisa do DS

Esforço: P = até 1 dia, M = 2 a 3 dias, G = 4 dias ou mais (sem contar a criação das peças no DS).

| Lote | Páginas / peças | Endereço | Componentes do DS que já existem | FALTA NO DS | Esforço | Estado |
|---|---|---|---|---|:---:|---|
| **S0** | limpeza: app React antigo | — | — | — | P | **feito** (dist igual byte a byte) |
| **S1** | peças de todas as páginas: cabeçalho, gaveta de contato, rodapé, WhatsApp, botão subir, cookies, janela da política, aviso "Tem um projeto?", entrada ao rolar | todas | `RodapeSite`, `BotaoWhatsApp`, `BotaoSubir`, `AvisoCookies`, `AvisoProjeto`, `SurgirAoRolar`/`TituloQueSurge`, `SidePanel`, `Input`, `Select`, `Textarea`, `Checkbox`, `Button`, `Accordion`, `Dialog` | `CabecalhoDoSite` (+ menu do celular), `CampoDeEmail` (sugestão de domínio), `Dialog`/`Sheet` com "Fechar" em português (hoje "Close") | M | cookies, WhatsApp e rodapé já prontos no app (`PecasDoSite`) |
| **S2** | Projeto Piloto | `/projeto-piloto/` | `Selo`, `Heading`, `Button`, `CardDeFrente`, `GradeDeCards`, `Card`, `CurvaSecao`, `Timeline`, `Accordion`, `PartnerCard`, `SidePanel`, campos | `Citacao`, `ListaDePilares` (ou confirmar `GradeDeCards` + `Card`) | M | planejado |
| **S3** | Início | `/` | `Heading`, `Input`, `Button`, `Carousel`, `SeloSecao` | `CardDeDepoimento`, `CardDeArtigo`, `FaixaDeLogos`, `LinkSaibaMais`, `PilulaDeAcao`, `LuzesDifusas`, estado de envio e de sucesso no `Button` | G | planejado |
| **S4** | Rede de Parceiros | `/rede-parceiros/` | `Selo`, `Heading`, `AvatarCircles`, `Button`, `Tabs`/`ToggleGroup`, `Carousel`, `Accordion`, `PartnerCard`, `SidePanel` | `ListaDePilares`, `CartaoFlutuante`, `LinkSaibaMais`, `Simulacao`/`CursorDeDemonstracao`, `Quadro`, `CardDeParceiro`, diagrama do ecossistema | G | planejado |
| **S5** | Cadastro de parceiro + autorizar galeria | `/rede-parceiros/cadastro/`, `/rede-parceiros/galeria/autorizar/` | `Input`, `Select`, `Checkbox`, `RadioGroup`, `Textarea`, `Label`, `Collapsible`, `Dialog`, `Upload`, `Alert`, `Card` | `Stepper` e o cadastro em etapas (`MolduraDoCadastro`, `EtapaDoCadastro`, `BarraDaEtapa`, `ListaDeRevisao`, `LinhaDeDado`), `Campo` (rótulo + ajuda + erro), `CampoDeEmail`, `CampoEstadoCidade`, máscaras de telefone e CNPJ, `EstadoFinal` | G | planejado |
| **S6** | Pesquisa moda Curitiba | `/pesquisa/moda-curitiba/` | `Card`, `Heading`, `Button`, `RadioGroup`, `Checkbox`, `Textarea`, `Input`, `Progress`, `AlertDialog`, `Dialog` | `PerguntaGuiada`, `EstadoFinal`, cartões selecionáveis | M | planejado |
| **S7** | Privacidade, descadastro, 404 | `/privacidade/`, `/comunicados/descadastro/`, 404 | `Selo`, `Heading`, `Button`, `Card` (rodapé com divisor), `Alert`, `RodapeSite`, `AvisoCookies`, `BotaoWhatsApp` | `Prosa` (texto longo), `Logo`, `PaginaDeErro`/`EstadoVazio`, links do `RodapeSite` com 44 px no celular | P | **feito**: as três publicadas (privacidade com a `Prosa` desde `d2aeb40`) |
| **S8** | Apresentação do EI (a versão escolhida) | `/experience-intelligence*` | `Selo`, `SeloSecao`, `Heading`, `Timeline`, `GlassCard`, `Card`, `Accordion`, `Carousel`, `SidePanel` | as de S3 e `Citacao`; antes, a dona do produto escolhe a versão (seção 7) | G | aguarda a escolha |

Ordem sugerida (junto com a área restrita): S7 (feito) → S1 → S2 → S3 → S4 → S5 → S6 → S8. S1 vem primeiro porque o cabeçalho e a gaveta de contato estão em todas as páginas grandes.

## 6. Lote S7: componentes do DS em cada peça (DS `d2aeb40`)

| Página | Peça | Componente do DS |
|---|---|---|
| 404 | logo, título, texto, botão | `PaginaDeErro` (com o `Logo` como ilustração), `Button size="lg" asChild` (link para `/`); "Erro 404" fica para leitores de tela |
| Descadastro | moldura (logo com link para o início, título, texto) | `MolduraDeConta` com o `Logo` |
| Descadastro | link inválido, erro do servidor | `Alert variant="error"` + `AlertTitle` (+ `AlertDescription`), ícone `CircleAlert` (Lucide) |
| Descadastro | envio e "Pronto!" | `BotaoDeEnvio` ("Confirmando…"), `EstadoFinal` ("Pronto!", com foco e anúncio), `Button variant="outline"` "Ir para o site" |
| Privacidade | logo, voltar ao site, selo, título | `Logo`, `Button variant="link"`, `Selo`, `Heading` |
| Privacidade | texto longo | `Prosa` (parágrafos, listas e links sem classes próprias) |
| Privacidade | rodapé, cookies, WhatsApp | `RodapeSite variante="compacto"` (mesmo texto de direitos; sem o crédito do DS, como hoje), `AvisoCookies`, `BotaoWhatsApp` |

**Diferenças visíveis em relação ao HTML** (capturas em 390, 768, 1024 e 1280 px): botões com os cantos do DS em vez de pílula (no celular, o da 404 ocupa a largura, regra das ações do DS); na 404, o "Erro 404" vira texto para leitores de tela e o título vem antes do texto; no descadastro, a moldura das telas de conta do DS (logo, título e texto alinhados à esquerda, botão na largura do cartão) e o "Pronto!" com o ícone de sucesso; na privacidade, a tipografia da `Prosa` e o rodapé compacto do DS. Textos e links: os mesmos (teste `tests/textos.test.ts`).

**Correção pedida ao DS:** o `Logo` desenha os caminhos sem `fill-rule="evenodd"` (os SVGs oficiais do próprio DS usam), e os miolos de letras como D, o e a saem preenchidos. O site passa `fillRule="evenodd"` pelo próprio componente (`LOGO_CORRIGIDO` em `src/compartilhado/marca.ts`), sem editar o DS; quando o DS corrigir, a propriedade pode sair.

## 7. Páginas de apresentação do EI: três versões (decisão da dona do produto pendente)

Todas privadas (`noindex`, login de administrador pelas funções `functions/experience-intelligence*/_middleware.js`). Nenhuma página pública tem link para elas.

| Versão | Endereço | O que é | De onde se chega |
|---|---|---|---|
| EI 1 | `/experience-intelligence/` | página do produto DM \| Experience Intelligence (hero com painel animado, PRs #32 e #33) | destino padrão do login das páginas privadas (`functions/acesso-privado/entrar.js`: abrir `/acesso-privado/entrar` leva para ela, e `destinoSeguro` cai nela quando o destino pedido não vale) |
| EI 2 | `/experience-intelligence-2/` | home do protótipo, para comparar lado a lado (PR #59) | nenhum link; só pelo endereço (liberado pelo login) |
| EI 3 | `/experience-intelligence-3/` | mescla em teste: home com o Método da página do produto (PRs #60, #61, #147) | nenhum link; só pelo endereço. **Três seções dela foram levadas para a página inicial** (`public/inicio/ie3-secoes.css` e `.js`: prova social, artigos e empresas atendidas) |

Nada foi apagado. A dona do produto escolhe a versão que fica; só ela é migrada (S8), e as outras saem num commit próprio.

## 8. Testes

Em `apps/site/`:

- `npm run typecheck` (estrito, inclusive a pasta `ui` inteira), `npm test` (Vitest: mapa e corte, cabeça igual à do HTML, textos iguais aos do HTML, regras do descadastro, medição, comparação do dist, conformidade), `npm run conformidade`, `npm run build`.
- Na raiz: `npm run build` e `node apps/site/scripts/comparar-dist.mjs <dist-do-main> dist`.
- `tests/navegador/paginas.cjs` (Playwright, com o Supabase e o Google simulados na rede): capturas antes e depois em 390, 768, 1024 e 1280 px; sem erros no console (inclusive de hidratação); sem rolagem horizontal; alvos de toque de 44 px no celular; bordas esquerdas alinhadas a 390 px; axe (WCAG A/AA); descadastro (link inválido, válido, enviando, sucesso com foco, erro do servidor); aviso de cookies (recusar, reabrir pelo texto e pelo rodapé, aceitar liga a medição); WhatsApp; 404 respondendo 404 com a página em React. Lacunas do DS aparecem como AVISO.

## 9. Riscos e pendências

- **Build do site depende do app** (como na área restrita): se ele não compilar, o site não publica. O workflow do DS testa o app antes do PR.
- **Duas instalações de dependências** no build (área restrita e site, as mesmas versões): mais tempo de build. Otimização futura: um pacote só para os dois apps.
- **Duas versões das peças comuns** durante a migração (HTML com `analytics.js`/`whatsapp.js`, React com `AvisoCookies`/`BotaoWhatsApp`), com a mesma chave de cookies: a escolha vale nas duas.
- **Lacunas do DS** que seguram páginas: seção 5 (coluna FALTA NO DS). Nenhuma peça foi feita à mão no app.
- **Botão de 44 px no celular:** o `Button` padrão do DS ainda tem 40 px; as páginas usam `size="lg"` (44 px). Os links do `RodapeSite` têm 24 px (passa no WCAG 2.5.8, fica abaixo dos 44 px da regra da dona do produto).
