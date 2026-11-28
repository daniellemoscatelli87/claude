# Site público em React com o Design System: plano de migração

> Decisão de 27/11/2026 (D-053): o site público do estúdio (início, Projeto Piloto, Rede de Parceiros, cadastro, galeria, pesquisa, privacidade, descadastro, 404 e as páginas de apresentação do EI) passa a ser refeito em React, página por página, com os componentes reais do Design System Dani Moscatelli, como a área restrita (D-051, `docs/engineering/ADMIN_REACT.md`). Endereços, textos, cabeça (título, descrição, canonical, compartilhamento) e comportamento continuam os mesmos. A dona do produto delegou a escolha de como o site consome o DS.

## 1. Situação em 27/11/2026

| O quê | Estado |
|---|---|
| App em `apps/site/` (Vite 6 + React 18.3 + Tailwind 4.1.12, as versões do DS e da área restrita) | implementado e testado |
| HTML pronto de cada página gravado no build (o React assume a página no navegador) | implementado e testado |
| Mapa de páginas com o lote de cada uma e o estado "previa" ou "publicada" (`apps/site/src/rotas.json`) | implementado e testado |
| Pasta `ui` inteira do DS sincronizada no app (`0685afb` desde o lote S5, 28/11/2026; antes `d2aeb40`) | implementado; os contornos que o DS corrigiu saíram (seção 9) |
| Conformidade com o DS (`npm run conformidade`) | zero desvios |
| Lote S0: app React antigo apagado (cerca de 3.000 linhas sem uso) | feito; o dist ficou igual byte a byte |
| Lote S7: 404, descadastro e privacidade **publicadas** | feito e testado (seção 6) |
| Lotes S1 (casca), S2 (Projeto Piloto), S3 (página inicial) e S4 (Rede de Parceiros) **publicados** | feito e testado (seções 6b, 6c e 6d) |
| Lote S5: cadastro de parceiro **publicado**; autorizar galeria continua em HTML (FALTA NO DS: `RecorteDeFoto`) | feito e testado (seção 6e) |
| Lote S6: pesquisa moda Curitiba | não iniciado (seção 9) |
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
- A página de HTML só sai de `public/` num commit posterior, depois de a versão em React estar publicada e conferida no ar. Ela vai para `apps/site/tests/referencia/` (o `origem` do mapa aponta para lá), só para os testes de cabeça e de textos. Depois disso, voltar atrás pede também devolver o arquivo a `public/`. Já saíram: `404.html` e `comunicados/descadastro/index.html` (conferidas no ar em 27/11/2026), `privacidade/index.html` e `projeto-piloto/index.html` (com `src/projeto-piloto.ts`/`.css`, no lote S3), `index.html` (com `src/em-breve.ts`/`.css` e `public/inicio/ie3-secoes.*`, no lote S4) `rede-parceiros/index.html` (com `src/rede-parceiros-inicio.ts`/`.css`, conferida no ar em 27/11/2026) e `rede-parceiros/cadastro/index.html` (com `src/rede-parceiros.ts`/`.css` e as peças de HTML que só ele usava: `src/compartilhado/partes.ts`, `menu.ts`/`.css` e `textos-surgem.ts`/`.css`, conferido no ar em 28/11/2026). Cada arquivo apagado tira a entrada do `vite.config.ts` da raiz; o `comparar-dist` mostra como "sumiu" os arquivos de `assets/` que só aquela página usava (esperado).
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
| Quem buscamos | `Badge` (as 9 especialidades) e `Card` com ícone (os 12 setores, duas colunas no celular) no lugar da roda animada |
| Da conexão à colaboração | `Simulacao` (4 etapas, avança sozinha; Pausar); cenas com `LinhaDeDado`, `ChipDeEstado`, `Badge`, `Avatar`, `Conversa`/`BalaoDaConversa` e `Quadro` |
| Chamada depois da simulação | `Card` com divisor e `Button` no canto inferior direito, `AvatarCircles` |
| Dúvidas | `Accordion` (respostas no HTML mesmo fechadas), `Prosa`; e-mail com as marcas `email_off` (`compartilhado/EmailDoEstudio.tsx`) |
| Convite | `PartnerCard` com a foto da Dani |
| Cadastro | `SidePanel` com a página `/rede-parceiros/cadastro/` dentro (como a janela de antes); fecha no X, no Esc e pelo aviso `dm-fechar-cadastro` da própria página; evento `cadastro_parceiro_aberto` |
| Fixos | `PilulaDeAcao` ("Quero ser parceiro", depois do hero), `BotaoSubir`, `BotaoWhatsApp`, `RodapeSite variante="claro"` |

**Diferenças em relação ao HTML:** a roda do ecossistema vira etiquetas e cards (sem a animação); as telas da simulação ficam sem campos e botões de mentira e cada etapa mostra uma cena (as 9 telas de antes viram 4); a galeria continua oculta (decisão da Dani de 23/11/2026) e a prévia `?galeria=exemplo` não foi levada; o cadastro abre numa gaveta lateral em vez da janela de tela cheia. Textos, links e eventos: os mesmos (testes `tests/rede-parceiros.test.ts` e `tests/navegador/rede-parceiros.cjs`).

## 6e. Lote S5 (cadastro de parceiro): componentes do DS em cada peça (DS `0685afb`)

| Peça | Componente do DS |
|---|---|
| Moldura e etapas | `MolduraDoCadastro` com o `Stepper` (9 etapas; sem espaço para os nomes, "Etapa N de 9 · nome"; etapas feitas reabrem) |
| Cada etapa | `EtapaDoCadastro` (título com foco a cada troca, "Campos marcados com * são obrigatórios.", erro geral e `ResumoDeErros` com 2 erros ou mais), `BarraDaEtapa` (Voltar e Próxima; Enviar cadastro com "Enviando…") |
| Texto, e-mail, telefone, link, parágrafo | `Campo`, `CampoDeEmail` (sugestão de domínio), `CampoDeTelefone` (máscara), `Textarea`; ajuda em lista com a `Prosa` |
| Estado e cidade | `CampoEstadoCidade` (cidades de `/data/municipios/<UF>.json`, a mesma falha de antes) |
| Escolha única | `GrupoDeCartoesDeEscolha` + `CartaoDeEscolha` (duas colunas quando as opções são curtas) |
| Várias escolhas | `Checkbox` + `Label`; setores com `GrupoDeChipsFiltraveis`; áreas e ferramentas por categoria no `Accordion` (`manterNoHtml`) com a contagem num `Badge` |
| "Outro" | `Input` "Qual? Escreva aqui" (abre e recebe o foco ao marcar) |
| Listas e idiomas | `Input`, `Select` (nível), `Button` (remover e "Adicionar item"/"Adicionar idioma") |
| Autorizações | `Checkbox`, `Collapsible` ("O que estou autorizando"), `Prosa` com o e-mail em `email_off` |
| Grupo do WhatsApp | `Alert` informativo com o link |
| Rascunho recuperado | `Alert` com "Começar do zero" |
| Telas finais (boas-vindas, PJ, privacidade) | `EstadoFinal` com `Prosa`, `Avatar` e "Fechar" (manda `dm-fechar-cadastro`) |
| Aberto direto pelo endereço | `Heading` e "Fechar cadastro" (`Button` de ícone), `AvisoCookies` |

**Mesmo comportamento** (testes `tests/rede-parceiros-cadastro.test.ts` e `tests/navegador/rede-parceiros-cadastro.cjs`): as 40 perguntas iguais às do script de antes (o teste roda o script original e compara), as mesmas mensagens de erro, a consulta `email_ja_cadastrado` ao sair do campo e o 409 no envio, a linha da tabela `cadastros` no mesmo formato (inclusive `consentimento_texto`, `outros`, `galeria_aceite_cadastro`), o rascunho `dm-parceiros-rascunho` no mesmo formato, o fim "PJ" na etapa 2, o evento `cadastro_parceiro` e o Esc pedindo à Rede de Parceiros para fechar a gaveta (`dm-fechar-cadastro`; fora de uma lista aberta do `Select`).

**Diferenças em relação ao HTML:** o cabeçalho próprio da janela (título, X e barra de progresso) sai, porque a gaveta já tem título e X; o progresso vira o `Stepper`. "Seção N" dá lugar ao número da etapa. A introdução (passo 0) não foi levada: ela nunca aparecia, porque a página sempre abria na etapa 1 (`show(EMBUTIDO ? 1 : 0)` com `embutido` sempre ligado); os textos dela já estão na Rede de Parceiros. A ajuda fica embaixo do campo (regra do `Campo`). O link fica sem o prefixo "https://" desenhado (o valor gravado continua com ele). A política abre em nova aba, sem a janela. Sem o confete. Nas telas finais, o botão "Fechar" (antes só o X). A gaveta da Rede de Parceiros passou a alinhar o formulário à borda do título.

**Autorizar galeria** (`/rede-parceiros/galeria/autorizar/`, `functions/v1/galeria-autorizacao`): continua em HTML. Falta no DS o `RecorteDeFoto` (especificação: escolher a imagem com o `UploadDropzone`; área quadrada com máscara circular sobre o fundo `bg-sobreposicao`; arrastar com o dedo ou o mouse e mover com as setas do teclado; zoom de 1 a 3 com o `Slider`; "Usar esta foto" e "Cancelar"; devolve um `Blob` 600 x 600 px recortado no aparelho, sem os dados da foto; textos "Arraste a foto para enquadrar o rosto no círculo e use o zoom se precisar."; respeita "menos movimento"). A galeria continua oculta (decisão da Dani de 23/11/2026).

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

- **Contornos retirados com o DS `0685afb` (lote S5):** `LOGO_CORRIGIDO` (o `Logo` já desenha com evenodd), as respostas do `Accordion` mantidas no HTML à mão (agora `AccordionContent manterNoHtml`) e o link "Pular para o conteúdo" feito no site (agora `LinkPularConteudo`).
- **Lacunas do DS achadas no lote S5:** `Label`/`Campo` são flex e, com rótulo longo, o asterisco de obrigatório vai para a ponta direita (o cadastro passa o texto e o asterisco num só bloco); falta campo com prefixo fixo (`https://`); falta `RecorteDeFoto` (seção 6e); falta um efeito de comemoração (`Confete`), opcional.
- **Lote S6 (pesquisa) não feito:** a página tem perguntas de classificação, busca de bairro por regional numa janela, identificação antes das perguntas, conferência de participação, progresso no servidor e indicação por redes. Ficou para o próximo lote.

- **Build do site depende do app** (como na área restrita): se ele não compilar, o site não publica. O workflow do DS testa o app antes do PR.
- **Duas instalações de dependências** no build (área restrita e site, as mesmas versões): mais tempo de build. Otimização futura: um pacote só para os dois apps.
- **Duas versões das peças comuns** durante a migração (HTML com `analytics.js`/`whatsapp.js`, React com `AvisoCookies`/`BotaoWhatsApp`), com a mesma chave de cookies: a escolha vale nas duas.
- **Lacunas do DS** que seguram páginas: seção 5 (coluna FALTA NO DS). Nenhuma peça foi feita à mão no app.
- **Botão de 44 px no celular:** desde o DS `0685afb`, o `Button` tem 44 px no celular e em telas de toque (`max-sm:`/`pointer-coarse:`), conferido no app; as páginas continuam com `size="lg"` onde o desenho pede o botão maior. Os links do `RodapeSite` têm 24 px (passa no WCAG 2.5.8, fica abaixo dos 44 px da regra da dona do produto).
- **Lacunas do DS achadas no lote S3** (contornadas no site, sem editar o DS):
  - `AvisoProjeto`: o `<style>` dentro do componente tem aspas, que o servidor grava escapadas, e a hidratação falha. O site monta o aviso só no navegador (ele já aparecia 0,6 s depois). Correção no DS: mover o CSS para o `theme.css`/classes ou usar `dangerouslySetInnerHTML`.
  - `FaixaDeLogos`: falta um tom "silhueta" para logos coloridos ou com partes brancas (somem no fundo claro). O site passa `brightness-0` e opacidade pelos `className` das imagens, como o filtro da página de HTML.
  - `CampoDeEmail`: o bloco de fora não recebe `className` (não ocupa a largura num `flex` com `items-start`); o formulário usa `items-stretch`.
  - `Button`: sem quebra de linha para rótulos longos no celular ("Acessar Recomendações no LinkedIn" passava da borda do card); o site passa `whitespace-normal h-auto`.
  - `CardDeArtigo`: "Ler artigo" fica escondido dos leitores de tela (o link é o título). Quatro artigos da página continuam com `href="#"`, como no HTML: falta o endereço dos textos (conteúdo da dona do produto).
- **Lacunas do DS achadas no lote S4:**
  - `Simulacao`: desenha o botão Pausar conforme "menos movimento" na primeira pintura (o servidor não sabe a preferência) e a hidratação falha para quem pede menos movimento. O site liga o avanço automático só depois de a página abrir. A cena das etapas fechadas não vai para o HTML.
  - `AvatarCircles`: cada foto é sempre um link que abre em nova aba; falta o modo decorativo (sem link). O site aponta as fotos para o cadastro, com nome acessível e 48 px.
  - Diagrama do ecossistema (roda de especialidades e setores): não existe no DS; a página usa etiquetas e cards.
