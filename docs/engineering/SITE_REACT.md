# Site público em React com o Design System: plano de migração

> Decisão de 27/11/2026 (D-053): o site público do estúdio (início, Projeto Piloto, Rede de Parceiros, cadastro, galeria, pesquisa, privacidade, descadastro, 404 e as páginas de apresentação do EI) passa a ser refeito em React, página por página, com os componentes reais do Design System Dani Moscatelli, como a área restrita (D-051, `docs/engineering/ADMIN_REACT.md`). Endereços, textos, cabeça (título, descrição, canonical, compartilhamento) e comportamento continuam os mesmos. A dona do produto delegou a escolha de como o site consome o DS.

> **Correção de 28/11/2026 (D-064):** a dona do produto pediu que as páginas originais não mudassem de estrutura: o trabalho era só identificar o que não está no DS e componentizar no DS. A página inicial, o Projeto Piloto, a Rede de Parceiros com o cadastro, a pesquisa de moda e a página de autorizar a galeria voltam às páginas de HTML de antes; só as **cores** (tokens do DS) e os **cards** (só borda, sem sombra parada) seguem o DS. As versões em React ficam só como prévia. Situação (28/11/2026): **pesquisa de moda e página inicial de volta** (HTML original com as cores e os cards do DS); depois, uma por pull request: Projeto Piloto, Rede de Parceiros com o cadastro, autorizar galeria. Exceção de cor: ícones de marcas (WhatsApp, Facebook, LinkedIn, Instagram) nas cores oficiais. O descadastro continua em React, com o conteúdo centralizado como no original. Como as cores chegam: seção 3.7.

## 1. Situação em 27/11/2026

| O quê | Estado |
|---|---|
| App em `apps/site/` (Vite 6 + React 18.3 + Tailwind 4.1.12, as versões do DS e da área restrita) | implementado e testado |
| HTML pronto de cada página gravado no build (o React assume a página no navegador) | implementado e testado |
| Mapa de páginas com o lote de cada uma e o estado "previa" ou "publicada" (`apps/site/src/rotas.json`) | implementado e testado |
| Pasta `ui` inteira do DS sincronizada no app (`27ff621` desde 28/11/2026; antes `0685afb` e `d2aeb40`) | implementado; os contornos que o DS corrigiu saíram (seção 9) |
| Conformidade com o DS (`npm run conformidade`) | zero desvios |
| Lote S0: app React antigo apagado (cerca de 3.000 linhas sem uso) | feito; o dist ficou igual byte a byte |
| Lote S7: 404, descadastro e privacidade **publicadas** | feito e testado (seção 6) |
| Lotes S1 (casca), S2 (Projeto Piloto), S3 (página inicial) e S4 (Rede de Parceiros) | publicados em React em 27/11/2026; pela D-064, voltam ao HTML original: **página inicial de volta** (28/11/2026); Projeto Piloto e Rede de Parceiros a seguir |
| Lote S5: cadastro de parceiro **publicado** (desde o DS `27ff621`, com o confete, o `https://` fixo e a política na janela); autorizar galeria **publicada** em React no lote S5b (28/11/2026) | feito e testado (seção 6e) |
| Lote S6: pesquisa moda Curitiba | publicada em React em 28/11/2026; **voltou ao HTML original pela D-064** (cores e cards do DS); o React fica em prévia |
| Páginas de HTML | pesquisa e página inicial de volta ao HTML original (D-064), com o build de HTML da raiz (Vite); as três apresentações do EI continuam em `public/` |

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

- `npm run build` na raiz (o comando do Cloudflare Pages): `node scripts/copiar-public.mjs` (copia `public/` para `dist/`; o build de HTML com Vite saiu em 28/11/2026, quando a última página pública passou para React), `npm run build:area-restrita` (D-051) e `npm run build:site`.
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
- A página de HTML só sai de `public/` num commit posterior, depois de a versão em React estar publicada e conferida no ar. Ela vai para `apps/site/tests/referencia/` (o `origem` do mapa aponta para lá), só para os testes de cabeça e de textos. Depois disso, voltar atrás pede também devolver o arquivo a `public/`. Já saíram (cópias em `apps/site/tests/referencia/`): `pesquisa/moda-curitiba/index.html` com `src/pesquisa-moda.ts`/`.css` e `public/rede-parceiros/galeria/autorizar/index.html` (28/11/2026, com o `vite.config.ts`, os `tsconfig` e as dependências de build da raiz); `404.html` e `comunicados/descadastro/index.html` (conferidas no ar em 27/11/2026), `privacidade/index.html` e `projeto-piloto/index.html` (com `src/projeto-piloto.ts`/`.css`, no lote S3), `index.html` (com `src/em-breve.ts`/`.css` e `public/inicio/ie3-secoes.*`, no lote S4) `rede-parceiros/index.html` (com `src/rede-parceiros-inicio.ts`/`.css`, conferida no ar em 27/11/2026) e `rede-parceiros/cadastro/index.html` (com `src/rede-parceiros.ts`/`.css` e as peças de HTML que só ele usava: `src/compartilhado/partes.ts`, `menu.ts`/`.css` e `textos-surgem.ts`/`.css`, conferido no ar em 28/11/2026). Cada arquivo apagado tira a entrada do `vite.config.ts` da raiz; o `comparar-dist` mostra como "sumiu" os arquivos de `assets/` que só aquela página usava (esperado).
- **Cabeça igual:** título, descrição, robots, referrer, canonical, Open Graph, Twitter e os dados estruturados (`jsonld`, só a página inicial tem) ficam em `cabeca` no `rotas.json`. O teste `tests/cabeca.test.ts` compara com a página de HTML enquanto ela existir.

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

### 3.7 Cores do DS nas páginas originais (D-064)

- As classes de cor do Tailwind das páginas originais (`slate`, `red`, `rose`, `white`, `black`, `brand-*`, `ds-*`) apontam para os tokens no `@theme` do `src/compartilhado/menu.css`. Campos com `--input`. Ícones de marcas nas cores oficiais (exceção).
- As páginas originais em HTML (a pesquisa pelo próprio script; as outras pelo `src/compartilhado/menu.ts`) importam `virtual:cores-ds.css`, um módulo do `vite.config.ts` da raiz que lê `apps/site/src/styles/theme.css` (a cópia sincronizada do DS) e entrega só as variáveis de cor do tema claro. Quando o DS muda uma cor, o próximo build já usa a nova.
- As cores escritas à mão nas folhas das páginas viraram `var(--token)` (ou `color-mix(in srgb, var(--token) N%, transparent)` para transparências). Dentro de SVG embutido em `url(data:...)`, onde `var()` não funciona, fica o valor hexadecimal do token. A troca foi feita por um script com a tabela de papéis (vermelho antigo → `--primary`, cinza de texto → `--muted-foreground`, erros → `--error*`, fundo → `--background`) e, sem papel conhecido, o token mais próximo; o resultado foi conferido à mão.
- Cards: só borda, sem sombra parada (a sombra continua no passar do mouse e nas janelas).
- Prova de fidelidade: capturas contra o build de antes da troca para React, comparando a geometria e os estilos de cada elemento fora a cor (seção 6g).

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
| **S1** | peças de todas as páginas: cabeçalho, gaveta de contato, rodapé, WhatsApp, botão subir, cookies, janela da política, aviso "Tem um projeto?", entrada ao rolar | todas | `RodapeSite`, `BotaoWhatsApp`, `BotaoSubir`, `AvisoCookies`, `AvisoProjeto`, `SurgirAoRolar`/`TituloQueSurge`, `SidePanel`, `Input`, `Select`, `Textarea`, `Checkbox`, `Button`, `Accordion`, `Dialog` | — (`CabecalhoDoSite`, `CampoDeEmail` e o "Fechar" em português chegaram em `d2aeb40`) | M | **feito** na casca `CascaDoSite` (cabeçalho, gaveta de contato, rodapé, cookies, WhatsApp), usada pelas páginas em React; o aviso "Tem um projeto?" entrou com a Início (S3) |
| **S2** | Projeto Piloto | `/projeto-piloto/` | `Selo`, `Heading`, `Button`, `CardDeFrente`, `GradeDeCards`, `Card`, `CurvaSecao`, `Timeline`, `Accordion`, `PartnerCard`, `SidePanel`, campos | — (todas as peças chegaram em `d2aeb40`) | M | **publicada** |
| **S3** | Início | `/` | `Heading`, `Input`, `Button`, `Carousel`, `SeloSecao` | `CardDeDepoimento`, `CardDeArtigo`, `FaixaDeLogos`, `LinkSaibaMais`, `PilulaDeAcao`, `LuzesDifusas`, estado de envio e de sucesso no `Button` | G | **publicada** (seção 6c) |
| **S4** | Rede de Parceiros | `/rede-parceiros/` | `Selo`, `Heading`, `AvatarCircles`, `Button`, `Tabs`/`ToggleGroup`, `Carousel`, `Accordion`, `PartnerCard`, `SidePanel` | `ListaDePilares`, `CartaoFlutuante`, `LinkSaibaMais`, `Simulacao`/`CursorDeDemonstracao`, `Quadro`, `CardDeParceiro`, diagrama do ecossistema | G | **publicada** (seção 6d) |
| **S5** | Cadastro de parceiro + autorizar galeria | `/rede-parceiros/cadastro/`, `/rede-parceiros/galeria/autorizar/` | `Input`, `Select`, `Checkbox`, `RadioGroup`, `Textarea`, `Label`, `Collapsible`, `Dialog`, `Upload`, `Alert`, `Card` | `RecorteDeFoto` (galeria); campo com prefixo fixo (`https://`); `Confete` (as peças do cadastro chegaram em `d2aeb40`) | G | cadastro **publicado** (seção 6e); autorizar galeria em HTML |
| **S6** | Pesquisa moda Curitiba | `/pesquisa/moda-curitiba/` | `CabecalhoDoSite`, `Progress`, `BarraDaEtapa`, `GrupoDeCartoesDeEscolha`/`CartaoDeEscolha`, `Checkbox`, `Campo`, `CampoDeTelefone`, `CampoDeEmail`, `Textarea` (contador), `Select`, `CommandDialog` (busca de bairro), `AlertDialog`, `Dialog` + `Prosa`, `Alert`, `EstadoFinal`, `BotaoDeEnvio`, `CampoCopiavel`, `Avatar`, `RodapeSite` (seção 6f) | — (`EscolhaOrdenada`, `EscalaDeNotas` e `Confete` chegaram em `27ff621`) | M | **publicada** (seção 6f) |
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

## 6b. Lotes S1 e S2: componentes do DS em cada peça

| Peça | Componente do DS |
|---|---|
| Cabeçalho (todas as páginas em React) | `CabecalhoDoSite` (pílula no computador, folha inferior no celular, some ao rolar para baixo), com o `Logo` e a ação "Contato" |
| Gaveta de contato | `SidePanel` + `SidePanelHeader`/`Body`/`Actions`/`Footer`, `Campo`, `GradeDeCampos`, `CampoDeEmail` (sugestão de domínio), `CampoDeTelefone` (máscara), `GrupoDeCartoesDeEscolha` + `CartaoDeEscolha` ("Meu negócio é…"), `Select`, `Textarea`, `Checkbox` (dias), `MensagemDeErro`, `Alert`, `BotaoDeEnvio`, `EstadoFinal` |
| Rodapé, cookies, WhatsApp | `RodapeSite` (claro, escuro ou compacto), `AvisoCookies` (com a medição), `BotaoWhatsApp` |
| Projeto Piloto: hero | foto da página, `LinkSaibaMais`; o título e o texto do programa ficam para leitores de tela e buscadores, como no HTML |
| Projeto Piloto: sobre o programa | `Selo`, `Heading`, `ListaDePilares`, `GradeDeCards` + `Card`, `SurgirAoRolar`, `Button` |
| Projeto Piloto: onde podemos atuar | `CurvaSecao`, `LuzesDifusas`, `GradeDeFrentes` + `CardDeFrente tom="escuro"` |
| Projeto Piloto: como funciona | `Timeline`, `Card` horizontal com `CardMidia` |
| Projeto Piloto: guia | `Accordion` (uma pergunta aberta por vez; as respostas ficam no HTML mesmo fechadas), `Prosa` nas respostas |
| Projeto Piloto: convite e cadastro | `PartnerCard`, `SidePanel` com `Campo`, `CampoDeEmail`, `CampoDeTelefone`, `Select`, `Textarea`, `Checkbox`, `BotaoDeEnvio`, `EstadoFinal` |
| Projeto Piloto: fixos | `PilulaDeAcao` ("Cadastrar empresa", depois do hero), `BotaoSubir` |

**Diferenças em relação ao HTML:** os campos passam a ter rótulo visível (antes, o rótulo estava no texto de exemplo) e cada campo mostra o próprio erro, além da mensagem geral de sempre; "Meu negócio é…" deixa de ser um acordeão e vira cartões de escolha; os dias viram caixas de seleção; o link da política no cadastro abre a página numa aba nova (como o texto já dizia), sem a janela da política; o hero sem a moldura arredondada. Textos, tabelas gravadas, rascunho do contato, identificador do envio do cadastro e eventos de medição: os mesmos (testes `tests/projeto-piloto.test.ts` e `tests/navegador/projeto-piloto.cjs`).

## 6c. Lote S3 (página inicial): componentes do DS em cada peça

| Peça | Componente do DS |
|---|---|
| Hero | `Selo` ("Em breve"; "Meaningful Experiences" no celular), `Heading size="hero"` com os destaques, `LuzesDifusas`, `SurgirAoRolar`, foto da página |
| Notificar lançamento | `CampoDeEmail` (rótulo visível e sugestão de domínio), `BotaoDeEnvio` (Enviando… e Obrigado! Até breve!, volta em 4 s) |
| Redes sociais | `Button variant="outline" size="lg"` com os ícones `Linkedin` e `Instagram` de `icones-preservados` |
| Saiba mais | `LinkSaibaMais` |
| Depoimentos | `CabecalhoDeSecao` (comum ao site: `Selo`, `Heading`, `SurgirAoRolar`), `Badge variant="outline"` com ícones, `Carousel` com `CardDeDepoimento` (1, 2 ou 3 por vez), `CarouselPrevious`/`CarouselNext` (44 px) e o contador "1 de N" |
| Ver as 35 recomendações | `Card orientacao="horizontal"` + `CardMidia tipo="icone"`, divisor e `Button` no canto inferior direito |
| Artigos | `CardDeArtigo` (destaque e horizontais) em `GradeDeCards` |
| Empresas atendidas | `FaixaDeLogos` (com o botão Pausar; com menos movimento, grade parada) |
| Fixos | `AvisoProjeto` ("Tem um projeto?", abre o WhatsApp), `BotaoWhatsApp`, `RodapeSite variante="claro"` |

**Diferenças em relação ao HTML:** o campo de e-mail com rótulo visível e o botão embaixo dele; no celular, tudo alinhado à esquerda numa borda só (antes, centralizado); o hero em duas colunas a partir de 1280 px (em 1024 px o título ficava em cinco linhas); as aspas dos depoimentos viram o ícone do card; o card inteiro do artigo é clicável pelo título; as setas da faixa de logos dão lugar ao botão Pausar; o número do carrossel conta as posições (21 no celular, 20 no tablet, 19 no computador). Textos, links, tabela e eventos: os mesmos (testes `tests/inicio.test.ts` e `tests/navegador/inicio.cjs`).

## 6d. Lote S4 (Rede de Parceiros): componentes do DS em cada peça

| Peça | Componente do DS |
|---|---|
| Hero | `Selo`, `Heading size="hero"`, `AvatarCircles`, `Button` (Quero ser parceiro e Como funciona), `CartaoFlutuante` (os três cartões sobre a foto, legíveis por leitores de tela como antes), `LuzesDifusas`, `LinkSaibaMais` |
| Sobre a rede | `CabecalhoDeSecao`, `ListaDePilares` (Contato, Relacionamento, Indicação) |
| Quem buscamos | `DiagramaDeEcossistema` (desde o DS `27ff621`): o centro "12 setores · Expertises conectadas.", as 9 especialidades em pétalas e os 12 setores no anel de fora, com os ícones da roda de HTML (equivalentes do Lucide); no celular, o centro, o tronco com as especialidades e os setores em duas colunas |
| Da conexão à colaboração | `Simulacao` (4 etapas, avança sozinha desde a primeira pintura; Pausar); cenas com `MockDeCampo` (o cadastro sendo digitado: nome, e-mail, especialidade, as duas seleções e os setores marcados; o briefing do novo projeto), `LinhaDeDado`, `ChipDeEstado`, `Badge`, `Avatar`, `Conversa`/`BalaoDaConversa` e `Quadro` |
| Chamada depois da simulação | `Card` com divisor e `Button` no canto inferior direito, `AvatarCircles decorativo` (as fotos são enfeite: sem link e fora dos leitores de tela, também no hero) |
| Dúvidas | `Accordion` (respostas no HTML mesmo fechadas), `Prosa`; e-mail com as marcas `email_off` (`compartilhado/EmailDoEstudio.tsx`) |
| Convite | `PartnerCard` com a foto da Dani |
| Cadastro | `SidePanel` com a página `/rede-parceiros/cadastro/` dentro (como a janela de antes); fecha no X, no Esc e pelo aviso `dm-fechar-cadastro` da própria página; evento `cadastro_parceiro_aberto` |
| Fixos | `PilulaDeAcao` ("Quero ser parceiro", depois do hero), `BotaoSubir`, `BotaoWhatsApp`, `RodapeSite variante="claro"` |

**Diferenças em relação ao HTML:** a roda do ecossistema é o `DiagramaDeEcossistema` do DS (entra uma vez ao aparecer; conferido a 1280 px que cada linha termina na sua etiqueta); cada etapa da simulação mostra uma cena (as 9 telas de antes viram 4), com os campos de exemplo do `MockDeCampo` e sem botões de mentira; a galeria continua oculta (decisão da Dani de 23/11/2026) e a prévia `?galeria=exemplo` não foi levada; o cadastro abre numa gaveta lateral em vez da janela de tela cheia. Textos, links e eventos: os mesmos (testes `tests/rede-parceiros.test.ts` e `tests/navegador/rede-parceiros.cjs`).

## 6e. Lote S5 (cadastro de parceiro): componentes do DS em cada peça (DS `0685afb`)

| Peça | Componente do DS |
|---|---|
| Moldura e etapas | `MolduraDoCadastro` com o `Stepper` (9 etapas; sem espaço para os nomes, "Etapa N de 9 · nome"; etapas feitas reabrem) |
| Cada etapa | `EtapaDoCadastro` (título com foco a cada troca, "Campos marcados com * são obrigatórios.", erro geral e `ResumoDeErros` com 2 erros ou mais), `BarraDaEtapa` (Voltar e Próxima; Enviar cadastro com "Enviando…") |
| Texto, e-mail, telefone, link, parágrafo | `Campo` (`obrigatorio` no `Label`), `CampoDeEmail` (sugestão de domínio), `CampoDeTelefone` (máscara), link com `Input prefixo="https://"` (o "https://" sai do que se digita e volta no valor gravado, como antes), `Textarea`; ajuda em lista com a `Prosa` |
| Estado e cidade | `CampoEstadoCidade` (cidades de `/data/municipios/<UF>.json`, a mesma falha de antes) |
| Escolha única | `GrupoDeCartoesDeEscolha` + `CartaoDeEscolha` (duas colunas quando as opções são curtas) |
| Várias escolhas | `Checkbox` + `Label`; setores com `GrupoDeChipsFiltraveis`; áreas e ferramentas por categoria no `Accordion` (`manterNoHtml`) com a contagem num `Badge` |
| "Outro" | `Input` "Qual? Escreva aqui" (abre e recebe o foco ao marcar) |
| Listas e idiomas | `Input`, `Select` (nível), `Button` (remover e "Adicionar item"/"Adicionar idioma") |
| Autorizações | `Checkbox`, `Collapsible` ("O que estou autorizando"), `Prosa` com o e-mail em `email_off`; "Política de privacidade" abre a política num `Dialog` com a `Prosa` (`compartilhado/TextoDaPolitica.tsx`, o mesmo texto da página `/privacidade/`); o Esc fecha só a janela |
| Grupo do WhatsApp | `Alert` informativo com o link |
| Rascunho recuperado | `Alert` com "Começar do zero" |
| Telas finais (boas-vindas, PJ, privacidade) | `EstadoFinal` com `Prosa`, `Avatar` e "Fechar" (manda `dm-fechar-cadastro`); boas-vindas com `comemorar` (o `Confete` do DS; nada com "menos movimento") |
| Aberto direto pelo endereço | `Heading` e "Fechar cadastro" (`Button` de ícone), `AvisoCookies` |

**Mesmo comportamento** (testes `tests/rede-parceiros-cadastro.test.ts` e `tests/navegador/rede-parceiros-cadastro.cjs`): as 40 perguntas iguais às do script de antes (o teste roda o script original e compara), as mesmas mensagens de erro, a consulta `email_ja_cadastrado` ao sair do campo e o 409 no envio, a linha da tabela `cadastros` no mesmo formato (inclusive `consentimento_texto`, `outros`, `galeria_aceite_cadastro`), o rascunho `dm-parceiros-rascunho` no mesmo formato, o fim "PJ" na etapa 2, o evento `cadastro_parceiro` e o Esc pedindo à Rede de Parceiros para fechar a gaveta (`dm-fechar-cadastro`; fora de uma lista aberta do `Select`).

**Diferenças em relação ao HTML:** o cabeçalho próprio da janela (título, X e barra de progresso) sai, porque a gaveta já tem título e X; o progresso vira o `Stepper`. "Seção N" dá lugar ao número da etapa. A introdução (passo 0) não foi levada: ela nunca aparecia, porque a página sempre abria na etapa 1 (`show(EMBUTIDO ? 1 : 0)` com `embutido` sempre ligado); os textos dela já estão na Rede de Parceiros. A ajuda fica embaixo do campo (regra do `Campo`). Desde o DS `27ff621`, o "https://" fixo, a janela da política e o confete voltaram. Nas telas finais, o botão "Fechar" (antes só o X). A gaveta da Rede de Parceiros passou a alinhar o formulário à borda do título.

**Autorizar galeria** (`/rede-parceiros/galeria/autorizar/`, `functions/v1/galeria-autorizacao`): **publicada em React no lote S5b (28/11/2026)**, em `apps/site/src/paginas/galeria-autorizar/`. Peças do DS: `Logo`, `Selo`, `Heading`, `Skeleton` (carregando), `Alert` (situação e erro), `Campo` (especialidade; LinkedIn com `Input prefixo="https://"`), `Select` (senioridade com o nível), `RecorteDeFoto` (que traz o `UploadDropzone`), `Avatar` + `Badge` + `Card` (prévia do perfil), `Checkbox` + `Label`, `Dialog` (termos), `BotaoDeEnvio`, `EstadoFinal comemorar`. O fluxo com o token é o mesmo: `ver`, `ia` e `decidir` com os mesmos campos (a foto em JPEG de 600 × 600 como data URL); o teste `tests/navegador/galeria-autorizar.cjs` compara o corpo de `decidir` com o da página de HTML. Diferenças de forma: a área de envio aparece direto quando não há foto (antes, o botão "Enviar foto"); com foto, a linha mostra "Foto atual" ou "Foto nova" (o `RecorteDeFoto` não devolve o nome do arquivo); a tela final usa o `EstadoFinal` com a foto da Dani. A galeria continua oculta (decisão da Dani de 23/11/2026).

## 6f. Lote S6 (pesquisa moda Curitiba): publicada em 28/11/2026 (DS `27ff621`)

**Feito:** `apps/site/src/paginas/pesquisa-moda/` (`logica.ts` com as regras, `Perguntas.tsx` com cada tipo de pergunta, `PesquisaModa.tsx` com as telas), publicada no mesmo endereço. As regras vêm do mesmo `questionario.json`. Teste `tests/navegador/pesquisa-moda.cjs`: responde a mesma participação na página de HTML e na nova e confere que as chamadas `status`, `verificar`, `parcial` e `enviar` saem na mesma ordem e com os mesmos corpos (fora o `envio_id`), o rascunho no mesmo formato e recuperado, o fim na mesma chave, o encerramento na pergunta 1, o 409 e a pesquisa fora do ar, as mensagens de erro, e em 390, 768, 1024 e 1280 px: sem rolagem horizontal, axe, 44 px e a mesma borda esquerda a 390. Diferenças de forma: o cabeçalho é o `CabecalhoDoSite` (no celular, "Home" fica no botão Menu, porque o DS sempre mostra o menu abaixo de 768 px); a busca de bairro e cidade usa `Dialog` + `Command` (o `CommandDialog` do DS põe o título fora da janela e não recebe o filtro sem acento); a barra de progresso fica no topo do formulário, não no cabeçalho; Voltar e Continuar seguem o conteúdo, sem ficar presos embaixo (desde 28/11/2026: presa, a barra cobria as últimas opções ao rolar e deixava um vão antes do rodapé; o teste mede que não há rolagem interna e que nada fica atrás dela); o confete cai do topo (o `Confete` do DS), em vez de sair do selo. A tabela abaixo vale como foi feito, com `EscolhaOrdenada` (2 e 5) e `GrupoDeEscalas` + `EscalaDeNotas` (4).

Análise de antes (DS `0685afb`), mantida como registro: a página tinha ficado em HTML porque o DS não tinha a classificação nem a escala de notas.

**O que cada peça usaria do DS** (para o lote andar rápido quando as duas peças chegarem):

| Peça da pesquisa | Componente do DS |
|---|---|
| Cabeçalho (logo e "Home") | `CabecalhoDoSite` com o `Logo` e a ação "Home"; "Home" no meio da pesquisa abre o `AlertDialog` "Quer mesmo interromper a pesquisa?" (Continuar respondendo / Sair e voltar para o site) |
| Progresso ("Pergunta N de 12", "Antes de começar", "Quase lá…") | `Progress` (o `Stepper` não serve: são até 16 etapas e a barra conta só as perguntas principais) |
| Apresentação | `Selo`, `Heading`, `Prosa`, `Card` com `IconeComBase` ("Por que vale participar"), `ListaDePilares` (tempo, voluntária, privacidade), `Button` "Começar pesquisa" |
| Identificação | `Campo`, `CampoDeTelefone` (a máscara do DS dá o mesmo texto que a `mascaraWhats` de hoje), `CampoDeEmail`, `Card` com o aviso da LGPD e o `Checkbox` do aceite, `ResumoDeErros` |
| Voltar e Continuar, "Conferindo…"/"Enviando…", aviso do campo que falta | `BarraDaEtapa` (de `cadastro-em-etapas`) com `Alert` de erro |
| Escolha única (1, 1.1, 3, foto, disponibilidade, 7) | `GrupoDeCartoesDeEscolha` + `CartaoDeEscolha`; na 1, o campo de cidade ou bairro entra logo abaixo da opção, dentro do grupo |
| Bairro (75, por regional) e cidade da Região Metropolitana (28) | `CommandDialog` (`CommandInput`, `CommandGroup` "Regional …", `CommandItem` com o `Check` na opção escolhida, `CommandEmpty` com o texto de hoje; filtro sem acento pela prop `filter`), aberto por um `Button variant="outline"` com o valor escolhido |
| Várias escolhas (2.1, 6, categorias, 9), com limite, opção exclusiva e "Outro" | `Checkbox` + `Label` em lista (como no cadastro de parceiro), `Input` "Qual?" no "Outro" |
| Matriz (8) | um `GrupoDeCartoesDeEscolha` por item, com a legenda do item |
| **Classificação (2 e 5)** | **FALTA NO DS: `EscolhaOrdenada`** |
| **Notas de 1 a 10 por aspecto (4)** | **FALTA NO DS: `EscalaDeNotas`** |
| Relato (opcional) | `Textarea` com `contador` e `maxLength` 2.000 |
| Sobre você (gênero, faixa etária, estado civil) | `GrupoDeCartoesDeEscolha colunas={2}` no computador e `Select` no celular, como hoje; `Input` "Qual?" no "Outro" |
| Novidades (sim ou não, com o consentimento no "Sim") | `Card` de destaque com `IconeComBase`, `GrupoDeCartoesDeEscolha` (o consentimento na `descricao` do "Sim") |
| Política de Privacidade | `Dialog` com a `Prosa` (carrega `/privacidade/` e rola até `#pesquisa-moda`), como hoje |
| Telas finais (enviada, encerrada, sem compras, já participou, fora do ar) | `EstadoFinal` com `Avatar` (assinatura da Dani); "Indique a pesquisa": `CampoCopiavel` com o link e `Button` "Compartilhar" (compartilhar do aparelho; sem ele, os links de WhatsApp com o `IconeWhatsApp`, Facebook e LinkedIn de `icones-preservados`) |
| Rodapé | `RodapeSite variante="compacto"` |
| Confete na tela de enviada | FALTA NO DS: `Confete` (opcional; sem ele a tela fica sem o confete, como no cadastro) |

O que não muda (e o teste do lote deve conferir rodando o script de hoje, como em `tests/rede-parceiros-cadastro.test.ts`): perguntas e ordem lidas do mesmo `questionario.json`; condicionais (1.1 e 2.1); opções que encerram (1 "outra cidade", 2 "Não comprei"); mensagens de erro; rascunho `pq-moda-rascunho-v5` (localStorage, 30 dias) com o contato `pq-moda-rascunho-v5-contato` (sessionStorage) e o fim `pq-moda-concluida`; os corpos das chamadas `status`, `verificar`, `parcial` (ao trocar de etapa, ao sair da página, com `keepalive`) e `enviar` (mesmo `envio_id`), o campo isca `site`, as respostas 409 (`ja_respondeu`) e 410 (fora do ar); o endereço; a cabeça (já está em `rotas.json`); a medição (só o `analytics.js`, sem eventos próprios).

**Especificação: `EscolhaOrdenada`** (classificação pela ordem dos toques; perguntas 2 e 5)

- **Para quê:** escolher até N opções na ordem de importância, sem arrastar: o primeiro toque é o 1º lugar, o segundo é o 2º, e assim por diante. Serve a qualquer pesquisa ou formulário com "escolha até 3, na ordem".
- **API sugerida:** `EscolhaOrdenada({ opcoes: { valor, titulo, descricao?, exclusiva? }[], valor: string[], onValorChange(valor: string[]), maximo, rotulo | aria-labelledby, textos?, className })`. O valor é a lista na ordem dos toques (o formato que a função `pesquisa` já valida).
- **Comportamento (o de hoje):** tocar numa opção não escolhida põe-na no fim da lista; tocar de novo tira-a, e as seguintes sobem uma posição. Com o máximo atingido, as outras opções ficam desativadas (a exclusiva continua livre). A opção `exclusiva` ("Não comprei…", "Não costumo procurar…") fica sozinha e tira as demais; escolher outra tira a exclusiva.
- **Aparência (com os tokens do DS):** cada opção é um cartão do tamanho e da moldura do `CartaoDeEscolha` (borda neutra; escolhida: borda primária e fundo `--primary-suave`; hover cinza; desativada: `bg-disabled`). À esquerda, um selo redondo de 32 px: vazio com borda quando não escolhida; preenchido na primária com "1º", "2º", "3º" em branco quando escolhida; na exclusiva, o `Check` no lugar do número. Embaixo da lista, a contagem: "Toque em até 3 opções, na ordem." / "2 de até 3 escolhidas · toque de novo para tirar".
- **Movimento:** o selo entra com um pulo curto (`--duration-fast`, `--ease-out`) ao ganhar um número; parado com "menos movimento".
- **Acessibilidade:** cada opção é uma caixa de seleção nativa (`checkbox`) com o cartão inteiro como rótulo e alvo de toque (44 px ou mais); o nome lido inclui a posição ("Marketplaces…, 1º lugar"); uma região `aria-live="polite"` anuncia cada mudança ("Marketplaces…: 1º lugar."); grupo com nome (a pergunta). Opcional para uma versão 2: botões "Subir"/"Descer" nas escolhidas, para reordenar sem tirar e pôr de novo (com o mesmo anúncio).
- **Estados:** erro do grupo pelo `MensagemDeErro` embaixo; desativado; somente leitura (para mostrar uma resposta na área restrita).

**Especificação: `EscalaDeNotas`** (uma nota de `minimo` a `maximo`; pergunta 4, três aspectos de 1 a 10)

- **Para quê:** dar uma nota numa escala curta e numerada (1 a 10, 0 a 10, 1 a 5), com o significado das pontas escrito. Também serve ao NPS.
- **API sugerida:** `EscalaDeNotas({ minimo, maximo, valor?: number, onValorChange(n), rotulo, descricao?, rotuloMinimo, rotuloMaximo, erro?, name?, className })` e `GrupoDeEscalas` para várias escalas num só card, separadas por divisor (cada uma com título e descrição, como "Qualidade · Qualidade dos materiais, tecidos e acabamentos").
- **Aparência:** uma fileira de botões numerados do mesmo tamanho (44 px de altura no toque, 40 px no computador; cantos `--radius-md`), em grade de 5 colunas quando o espaço é estreito (duas linhas: 1 a 5 e 6 a 10) e de 10 ou 11 colunas quando cabe (a partir de cerca de 34 rem, pela largura do próprio bloco). Escolhido: fundo primário com texto branco; hover cinza; foco com o anel do DS. Embaixo, as pontas: "1 = Muito ruim" à esquerda e "10 = Excelente" à direita. Faltando no envio: borda de erro nos botões daquele aspecto e a `MensagemDeErro`.
- **Acessibilidade:** rádios nativos (`role="radiogroup"` com o nome do aspecto; setas trocam a nota); o nome do primeiro e do último inclui a ponta ("1, Muito ruim", "10, Excelente"), como hoje; nunca só a cor (o escolhido também muda o peso do texto ou ganha contorno).
- **Movimento:** a troca de cor com `--duration-fast`; nada além disso.

## 6g. Páginas originais de volta (D-064): prova de fidelidade

| Página | Comparada com | Estados e larguras | Resultado |
|---|---|---|---|
| Pesquisa de moda | build do `5d5eeb9` (antes do #268) | apresentação, identificação, classificação (pergunta 2), notas (pergunta 4), texto aberto, telas finais de obrigada, sem compras, encerrada e fora do ar; 390, 768, 1024 e 1280 px (36 capturas) | mesma altura, mesmos elementos, mesmas posições e tamanhos, mesmos estilos fora a cor em todas; outras diferenças: só a sombra parada tirada de `.pq-intro`, `.pq-fim`, `.pq-porque` e da opção marcada (regra dos cards) |
| Página inicial | build do `155ab15` (antes do #258) | página inteira, animações no estado final, Supabase simulado; 390, 768, 1024 e 1280 px | mesma altura, mesmos elementos, posições, tamanhos e estilos fora a cor; outras diferenças: a sombra parada tirada dos depoimentos, artigos, card das recomendações e card de clientes, e um degradê escrito de outro jeito pelo navegador (só cor) |

Fluxo testado com a função `pesquisa` simulada nas duas versões (status, identificação, verificar, parcial, enviar, 409, 410, erro do servidor), sem erros no console.

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

- **Contornos retirados com o DS `27ff621` (28/11/2026):** o `AvisoProjeto` volta ao HTML do servidor (antes só no navegador); a `Simulacao` avança sozinha desde a primeira pintura (antes só depois de abrir); a faixa de logos usa `FaixaDeLogos silhueta` (antes o filtro por `className`); as fotos do `AvatarCircles` são `decorativo` (antes links para o cadastro); o asterisco dos rótulos é o `obrigatorio` do `Label`/`Campo` (só a legenda de grupo, `Label asChild` no `<legend>`, continua com o asterisco no mesmo bloco do texto, porque o `obrigatorio` não funciona com `asChild`); o botão "Acessar Recomendações no LinkedIn" usa a quebra do celular do `Button` (antes `whitespace-normal h-auto`); `size="lg"` saiu dos botões de gaveta, rodapé de card, link e envio (o padrão já tem 44 px no celular) e ficou só nos botões principais de hero e da 404.
- **Lacuna do DS achada em 28/11/2026:** o X do `Dialog` tem 16 px de área de toque (a regra é 44 px no celular). A janela da política tem também o botão "Fechar" de 44 px no rodapé; o X fica como está até o DS corrigir.

- **Contornos retirados com o DS `0685afb` (lote S5):** `LOGO_CORRIGIDO` (o `Logo` já desenha com evenodd), as respostas do `Accordion` mantidas no HTML à mão (agora `AccordionContent manterNoHtml`) e o link "Pular para o conteúdo" feito no site (agora `LinkPularConteudo`).
- **Lacunas do DS achadas no lote S5 (resolvidas no DS `27ff621`):** asterisco do `Label` (`obrigatorio`), campo com prefixo fixo (`Input prefixo`), `RecorteDeFoto` e `Confete`.
- **Lote S6 (pesquisa) publicado com o DS `27ff621`** (seção 6f). Lacunas do DS achadas: `CabecalhoDoSite` sem itens ainda mostra o botão Menu no celular; `CommandDialog` com o título fora do `DialogContent` e sem o `filter` do `Command`. Antes: **parado por FALTA NO DS (28/11/2026):** a análise peça por peça está na seção 6f. Faltam no DS duas peças sem as quais a página teria de ser feita à mão: `EscolhaOrdenada` (as perguntas 2 e 5) e `EscalaDeNotas` (a pergunta 4). As especificações estão na seção 6f. Quando chegarem ao DS e forem sincronizadas, o lote pode ser feito sem outra análise; até lá, a pesquisa continua em HTML, intacta.

- **Build do site depende do app** (como na área restrita): se ele não compilar, o site não publica. O workflow do DS testa o app antes do PR.
- **Duas instalações de dependências** no build (área restrita e site, as mesmas versões): mais tempo de build. Otimização futura: um pacote só para os dois apps.
- **Duas versões das peças comuns** durante a migração (HTML com `analytics.js`/`whatsapp.js`, React com `AvisoCookies`/`BotaoWhatsApp`), com a mesma chave de cookies: a escolha vale nas duas.
- **Lacunas do DS** que seguram páginas: seção 5 (coluna FALTA NO DS). Nenhuma peça foi feita à mão no app.
- **Botão de 44 px no celular:** desde o DS `0685afb`, o `Button` tem 44 px no celular e em telas de toque (`max-sm:`/`pointer-coarse:`), conferido no app; as páginas continuam com `size="lg"` onde o desenho pede o botão maior. Os links do `RodapeSite` têm 24 px (passa no WCAG 2.5.8, fica abaixo dos 44 px da regra da dona do produto).
- **Lacunas do DS achadas no lote S3** (contornadas no site até o DS `27ff621`, que corrigiu `AvisoProjeto`, `FaixaDeLogos`, `CampoDeEmail` e `Button`):
  - `AvisoProjeto`: o `<style>` dentro do componente tem aspas, que o servidor grava escapadas, e a hidratação falha. O site monta o aviso só no navegador (ele já aparecia 0,6 s depois). Correção no DS: mover o CSS para o `theme.css`/classes ou usar `dangerouslySetInnerHTML`.
  - `FaixaDeLogos`: falta um tom "silhueta" para logos coloridos ou com partes brancas (somem no fundo claro). O site passa `brightness-0` e opacidade pelos `className` das imagens, como o filtro da página de HTML.
  - `CampoDeEmail`: o bloco de fora não recebe `className` (não ocupa a largura num `flex` com `items-start`); o formulário usa `items-stretch`.
  - `Button`: sem quebra de linha para rótulos longos no celular ("Acessar Recomendações no LinkedIn" passava da borda do card); o site passa `whitespace-normal h-auto`.
  - `CardDeArtigo`: "Ler artigo" fica escondido dos leitores de tela (o link é o título). Quatro artigos da página continuam com `href="#"`, como no HTML: falta o endereço dos textos (conteúdo da dona do produto).
- **Lacunas do DS achadas no lote S4** (resolvidas no DS `27ff621`: `Simulacao`, `AvatarCircles decorativo`, `DiagramaDeEcossistema`):
  - `Simulacao`: desenha o botão Pausar conforme "menos movimento" na primeira pintura (o servidor não sabe a preferência) e a hidratação falha para quem pede menos movimento. O site liga o avanço automático só depois de a página abrir. A cena das etapas fechadas não vai para o HTML.
  - `AvatarCircles`: cada foto é sempre um link que abre em nova aba; falta o modo decorativo (sem link). O site aponta as fotos para o cadastro, com nome acessível e 48 px.
  - Diagrama do ecossistema (roda de especialidades e setores): não existe no DS; a página usa etiquetas e cards.
