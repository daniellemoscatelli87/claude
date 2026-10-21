# Página de produto v2: proposta de composição (aguarda aprovação)

**Data:** 21/10/2026 · **Base:** documentos 00 a 05 desta pasta, enviados pela dona do produto. · **Status:** nada programado.

## 1. O que foi conferido no código atual

- **Site do estúdio (danimoscatelli.com.br):** a página inicial publicada ainda é a "Em breve" (`index.html` + `src/em-breve.ts`), com cabeçalho, rodapé e a gaveta de contato. **Não existe menu nem seção "Soluções"** no código: a nova Home do ZIP do Stitch ainda não foi implementada. Por isso, não há cabeçalho, rodapé ou tokens da nova Home para herdar diretamente; uso a linguagem visual das referências (fonte, vermelhos, grafite, fundos claros, respiro).
- **App (app.danimoscatelli.com.br):** a landing comercial v1 está em `/` sem login; o protótipo anterior, em `/prototipo-landing/`. Entrar (`/entrar/`), recuperar senha e o aviso de cookies continuam.

## 2. Home do estúdio × página do produto (o que não repetir)

| Já dito na Home (referências) | Na página do produto |
|---|---|
| Posicionamento da consultora ("Transformo objetivos de negócio…") | Não repete. Topo mostra o produto funcionando |
| Tese de mercado e dados (85%, 78%, 39%, 86%) | **Sai** a seção de dados de mercado da landing v1 |
| "Era da Eficiência × Era da Experiência" | Não repete |
| Visão sistêmica em órbitas | Substituída pelo mapa da experiência à operação (camadas, sem órbitas) |
| "Onde você está nessa jornada?" (linha do tempo) | Não usa linha do tempo. A condução vira o "fluxo bifocal" |
| Método do estúdio em abas | Não repete. A página mostra o método da plataforma, não o do estúdio |
| Segmentos atendidos | Sai a seção de aplicações com filtros da v1 |
| Depoimentos e artigos | Não há (são da consultoria, não do produto) |
| CTA de diagnóstico | Fechamento com dois caminhos: acesso à plataforma e especialista |

## 3. Composição (10 momentos)

Ritmo visual: topo claro com a tela do produto → demonstração larga → fluxo em duas trilhas → mesa de trabalho → mapa em camadas → comparador → princípios compactos → planos → perguntas → faixa escura curta. Movimento forte só em dois lugares (topo e mapa); o resto reage ao toque.

| # | Momento | Componente (novo ou reaproveitado) | Interação | Resultado esperado |
|---|---|---|---|---|
| 01 | Produto em funcionamento | **Prévia do desafio** (nova): janela do app com dois estados, "Seu desafio" e "Próxima ação sugerida / O que você fará" | Botão "Ver exemplo de atividade" troca o estado; selo "Exemplo demonstrativo, não é uma análise de dados reais" | Em segundos: é um software que conduz |
| 02 | Experimente a lógica | **Explorador de cenários** (novo): abas Atendimento presencial, Produto digital, Processo interno; painel com 3 partes | A atividade aparece como um cartão do app com duas respostas, **"Tenho"** e **"Não tenho"**; "Não tenho" mostra o caminho alternativo; "Ver próximo passo" revela a evidência esperada | Sentir o "não sei" virar caminho, o centro do produto |
| 03 | Como a plataforma conduz | **Lente da atividade** (nova): duas trilhas ligadas, em cima "O que você vê" (cartão do app), embaixo "Nos bastidores" (camada escura) | 3 estados selecionáveis (Conversar, Observar, Conferir) | Ver que o método fica escondido e a pessoa só executa |
| 04 | O que sua organização constrói | **Mesa de trabalho** (nova): lista dos 6 artefatos (A a F) ligados por uma linha de progresso + grande folha de documento com cabeçalho do caso, tipo e situação | Tocar no artefato abre a folha; no celular, seletor horizontal + folha | Ver o conhecimento evoluir do desafio ao acompanhamento |
| 05 | Da experiência à operação | **Mapa de camadas** (novo): 4 faixas (Pessoas vivenciam · Pontos de contato · O que investigar na operação · Possíveis intervenções) | Tocar em um item destaca as faixas ligadas (ver decisão 4); no celular vira lista encadeada | Entender que a solução vai além da tela |
| 06 | Plataforma + especialista | **Comparador por situação** (novo): 3 situações em abas; dois painéis "Com a plataforma" e "Com especialista" | Troca de situação | Consultoria como complemento, não condição |
| 07 | Inteligência com critério | **Princípios** (novo, compacto): 3 linhas com ícone e marcador, sem cards | Nenhuma | Diferença para uma IA genérica |
| 08 | Planos | **Prévia de planos** (adaptado da v1): 3 colunas, sem destaque de "mais popular" | Botão por plano (destino: decisão 2) | Objeção comercial sem preço inventado |
| 09 | Perguntas frequentes | **Acordeão** (reaproveitado): 2 grupos, "Uso e metodologia" e "Acesso e contratação" | Uma resposta aberta por vez | Dúvidas de contratação |
| 10 | Próximo passo | **Faixa escura compacta** (nova) | 2 botões + "Já sou convidado(a): Entrar na plataforma" | Escolha objetiva |

**Reaproveitados do que já existe no app:** botões, selos em pílula, abas acessíveis com teclado, acordeão, cabeçalho com menu no celular, rodapé com copyright, aviso de cookies e medição (GA4, inativo até o ID), página Entrar e recuperação de senha. **Não reaproveitados de propósito:** órbitas, linha do tempo, grade bento, cards de dados, filtros de aplicações.

## 4. Esboço no celular (390 px)

```
[logo · Entrar · menu]
Selo: DM | EXPERIENCE INTELLIGENCE
H1: Do desafio à melhoria. Com direção em cada etapa.
Lead (3 linhas) · [Solicitar acesso antecipado] [Explorar uma demonstração]
"Plataforma em evolução • Acesso atual por convite"
┌ janela do app ─────────┐
│ Seu desafio            │
│ "Os clientes iniciam…" │
│ [Ver exemplo de ativ.] │
└────────────────────────┘
NA PRÁTICA · H2 · abas roláveis (3)
┌ cartão da atividade ───┐
│ Sua atividade          │
│ [Tenho] [Não tenho]    │
│ → caminho alternativo  │
│ [Ver próximo passo]    │
└────────────────────────┘
Lente: "O que você vê" (cartão) ↕ "Nos bastidores" (faixa escura) · 3 botões
Mesa: seletor A–F rolável + folha do documento
Mapa: 4 faixas empilhadas, itens tocáveis
Comparador: 3 abas + 2 painéis empilhados
Princípios (3 linhas) · Planos (3 cartões) · FAQ · Faixa final
```

No computador: topo em duas colunas (texto à esquerda, janela do app à direita); explorador largo com a atividade à direita das abas; lente com as duas trilhas lado a lado; mesa com lista à esquerda e folha grande à direita; mapa com as 4 faixas na horizontal.

## 5. Conflitos com o que já foi feito

| Item | O que acontece |
|---|---|
| Landing comercial v1 (D-031) e complemento dos 5 conteúdos | **Substituídos** pela copy v2. Ficam guardados em `docs/product/landing-comercial/` |
| Dados de mercado (PwC, Qualtrics) | Saem da página do produto (já estão na Home) |
| Decisão de 21/10 "botões de interesse ficam fora" | A v2 pede "Solicitar acesso antecipado", "Conversar com especialista" e botões nos planos com **destino real** (decisão 2) |
| Protótipo em `/prototipo-landing/` | Substituído por esta composição |
| Entrar, recuperar senha, aviso de cookies, medição | **Preservados** |
| Discovery, IA, banco, regras D-020 a D-023 | Não mudam |
| Travessões "—" na copy v2 (lead do topo, mapa, nota de etapa) | Trocados por vírgula ou dois-pontos (regra do site) |

## 6. Decisões necessárias (uma por vez)

1. **Onde a página fica:**
   - a) no app, em `app.danimoscatelli.com.br/` (como hoje), com link do menu e da seção "Soluções" quando a nova Home existir;
   - b) no site do estúdio, em `danimoscatelli.com.br/experience-intelligence/` (exige mexer no site, que hoje só tem a página "Em breve").
2. **Destino dos botões** "Solicitar acesso antecipado", "Conversar com especialista" e dos planos (a v2 exige destino real).
3. **"Ver outro exemplo"** na mesa de trabalho: a v2 só traz o caso da Clínica Aurora; sem um segundo caso aprovado, o botão fica fora.
4. **Ligações do mapa de camadas:** a v2 não diz quais itens se ligam a quais. Proposta: tocar em qualquer item destaca o caminho inteiro do exemplo (todas as faixas), sem inventar relações item a item.

## 7. Critérios de aceite (após autorizada a implementação)

- Entende-se em segundos o que o produto faz; o topo mostra a janela do app.
- O explorador muda a investigação de verdade conforme o cenário, inclusive o caminho "Não tenho"; sem IA e sem rede.
- Nenhum componente repete a Home na mesma forma ou ordem.
- Artefatos com hipótese, evidência e lacuna diferenciadas; tudo marcado como fictício.
- Botões com destino real; login separado; nenhuma coleta de dados.
- Teclado, toque e leitor de tela; 320 a 1280 px sem rolagem lateral; movimento reduzido respeitado; contraste AA.
