# Planejamento: painel da loja no DS FindLook

**Situação:** aprovado pela dona do produto em 06/11/2026 (decisões em D-042) e implementado no FindLook v53. Ver o Implementation Log.
**Base:** três telas de referência do painel da loja (Início), enviadas pela dona do produto em 06/11/2026, comparadas com o que o DS FindLook tem hoje (commit `3a960dc`).

Legenda:
- **Já existe:** usar como está.
- **Ampliar:** existe, mas falta o que a tela pede.
- **Novo:** ainda não existe no DS.

---

## 1. O que as telas mostram

As três telas são versões da mesma página (Início do painel da loja). Elas compartilham a mesma estrutura:

1. Uma **estrutura do painel**, com menu lateral e barra superior.
2. Um **cabeçalho da página**, com saudação e ações.
3. **Indicadores** (KPIs).
4. Um **gráfico de desempenho**.
5. **Insights** e **próximas ações**.
6. A **tabela de produtos**.
7. Uma lista de **atividade recente**.
8. Blocos de **engajamento**: saúde do catálogo, dicas, banner e faixa de benefícios.

---

## 2. Componentes

### 2.1 Estrutura do painel (menu lateral e barra superior)

| Elemento na tela | No DS hoje | O que fazer |
|---|---|---|
| Menu lateral com item ativo em rosa claro, ícone e texto | `sidebar` (genérico) | **Ampliar:** visual FindLook, item ativo, grupos com título ("Minha loja") e divisor |
| Contador no item do menu (Pedidos e reservas **3**) | `badge` | **Novo:** item de menu com contador, com texto para leitor de tela ("3 novos") |
| Seletor de loja (avatar, nome, "Loja verificada" com check, seta) | `avatar`, `dropdown-menu` | **Novo:** seletor de loja |
| Card de plano no rodapé do menu (Plano Profissional / Plano de lançamento R$ 9,99, botão "Ver meu plano") | não existe | **Novo:** card de plano no menu |
| Card de ajuda no rodapé ("Precisa de ajuda?", link externo) | não existe | **Novo:** card de ajuda (variação do anterior) |
| Busca global com atalho "Ctrl + K" | `command` | **Ampliar:** campo de busca na barra superior que abre o `command` |
| Sino de notificações com ponto de não lido | não existe | **Novo:** botão de notificações com indicador e contagem acessível |
| Menu da pessoa (foto, nome, papel "Proprietária", seta) | `avatar`, `dropdown-menu` | **Novo:** gatilho do menu da conta |
| Menu "hambúrguer" (celular) | `sheet` / `drawer` | **Já existe:** documentar no template |

### 2.2 Cabeçalho da página

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Saudação ("Olá, Ana! 👋") e subtítulo | `heading` | **Novo (padrão):** cabeçalho de página com área de ações |
| Selo acima do título ("Olá, Ana!" em rosa) e palavra da marca em destaque no título | `selo-secao`, `heading` com destaque | **Já existe:** só compor |
| Seletor de período ("Últimos 30 dias") | `select` | **Novo:** seletor de período com opções prontas (7, 30, 90 dias, personalizado) |
| Botão principal com menu ("Cadastrar produto ▾") | `button`, `dropdown-menu` | **Novo:** botão dividido (ação principal e menu de opções) |
| Botão "Ver minha loja ↗" (abre em nova aba) | `button` | **Ampliar:** regra e ícone de link externo |
| Banner fechável com imagem ("Destaque sua coleção") | `alert` | **Novo:** banner promocional fechável, com imagem e botão |

### 2.3 Indicadores (KPIs)

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Ícone em círculo claro, número grande, rótulo, variação com seta | Cards de KPI | **Já existe** |
| Número no formato brasileiro (1.284) e "+18,6%" | não verificado | **Ampliar:** regra de formatação pt-BR (milhar com ponto, decimal com vírgula) |
| Ícone "i" com explicação ao lado do rótulo ("Buscas compatíveis ⓘ") | `tooltip` | **Ampliar:** KPI com explicação acessível (por toque e teclado, não só por mouse) |
| Variação em pílula no canto (tela 3) | não existe | **Ampliar:** variação "pílula" do KPI |

### 2.4 Gráficos

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Área com degradê rosa | `chart` | **Já existe** |
| Legenda que liga/desliga as séries (Visualizações, Favoritos, Contatos) | não existe | **Ampliar:** legenda interativa |
| Último ponto destacado com valor (1.284) | não existe | **Ampliar:** marcador de valor atual |
| Card de gráfico com número principal e variação no topo | parcial | **Ampliar:** cabeçalho do card de gráfico |
| Gráfico com lista lateral de números (Visualizações, Favoritos, Contatos) | não existe | **Ampliar:** variação com resumo ao lado |

### 2.5 Listas

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Insight com foto ou ícone, título, descrição e seta (Vestidos midi em alta) | não existe | **Novo:** item de lista navegável (insight / próxima ação), usado também em "Próximas ações" |
| Atividade recente: ícone em círculo, título, detalhe, tempo relativo ("há 12 min"), link "Ver tudo" | existe no template Dashboard (genérico) | **Novo como componente:** item de atividade com tipos do FindLook (favorito, busca, reserva, importação, contato) |
| Ranking de buscas da região com variação (Vestido midi ↑ +62%) e "Ver mais oportunidades" | não existe | **Novo:** lista de tendências |
| Checklist de saúde do catálogo (check verde e alerta, com seta) | estados de informação, `progress` | **Novo:** item de checklist com estado |
| Anel de pontuação (85% Bom) | `progress` (barra) | **Novo:** progresso circular com valor e texto |

### 2.6 Tabela de produtos

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Título com contagem ("Seus produtos (137)") e subtítulo | `table` | **Ampliar:** cabeçalho da tabela |
| Abas de filtro com contagem (Todos 137, Publicados 128, Pendentes 6, Esgotados 3, Reservados 2) | `tabs`, `segmented-control` | **Ampliar:** abas com contador (versões pílula e sublinhada, como nas telas) |
| Busca e botão "Filtros" | `input`, `button` | **Novo (padrão):** barra de ferramentas da tabela; o botão "Filtros" abre o painel lateral |
| Caixa de seleção por linha e "selecionar todos" | `checkbox` | **Ampliar:** seleção de linhas e barra de ações em lote (ex.: publicar, excluir) |
| Célula de produto (foto, nome, SKU, tamanho e material) | `product-card` (card, não célula) | **Novo:** célula de produto |
| Condição como texto ou chip (Nova / Usada) | `badge` | **Já existe:** definir uma forma só |
| Medidor de desempenho em barrinhas, visualizações e favoritos | não existe | **Novo:** medidor de desempenho, sempre com o número em texto ao lado |
| Status (Publicado, Pendente, Esgotado, Reservado) com motivo abaixo ("Foto em baixa qualidade") | chip de status (outro vocabulário: A confirmar, Confirmado, Desatualizado, Esgotado) | **Ampliar:** status de publicação do produto e linha de motivo |
| Menu de ações da linha (⋯) | `dropdown-menu` | **Já existe:** documentar ações e nome acessível ("Ações de Vestido midi") |
| Rodapé "Exibindo 4 de 128 produtos" e "Ver todos os produtos →" | `pagination` | **Ampliar:** rodapé resumido para tabelas de prévia |

### 2.7 Engajamento

| Elemento | No DS hoje | O que fazer |
|---|---|---|
| Dicas em carrossel ("1 de 3", anterior/próximo, fechar) com imagem e botão | `carousel` | **Novo:** card de dica fechável dentro do carrossel |
| Faixa "Mais visibilidade, mais oportunidades" com pílulas de benefício | não existe | **Novo:** faixa de benefícios (prioridade baixa) |

---

## 3. Templates

| Template | Situação | Proposta |
|---|---|---|
| **Estrutura do painel** (menu lateral, barra superior, versão celular com menu hambúrguer) | não existe | **Novo**, base de todas as telas do painel |
| **Início do painel da loja** | o "Dashboard" atual é genérico (receita, clientes, pedidos) | **Substituir** pela página das telas enviadas |
| **Produtos** (tabela completa com filtros, seleção, ações em lote, estado vazio e carregamento) | não existe | **Novo** |
| Preços e planos | já existe e foi atualizado | Ligar ao card de plano do menu |
| Configurações | existe (genérico) | Revisar depois para o perfil da loja |
| Auth, Team, Inbox, Contact, Landing | existem (genéricos) | **Decisão sua:** manter, adaptar ao FindLook ou retirar |

Telas que aparecem no menu e ficam para depois, se você quiser: Importar produtos, Estoque, Pedidos e reservas, Buscas e interesse, Inteligência de vendas, Perfil da loja, Integrações e Ajuda.

---

## 4. Ordem sugerida

1. **Fase 1: estrutura do painel.** Menu lateral, seletor de loja, item com contador, card de plano e de ajuda, barra superior (busca, notificações, conta), cabeçalho da página, seletor de período e botão dividido. Entrega o template "Estrutura do painel".
2. **Fase 2: dados.** Ampliações de KPI e gráfico, item de atividade, item de insight / próxima ação e lista de tendências.
3. **Fase 3: produtos.** Ampliações da tabela, célula de produto, medidor de desempenho e status de publicação. Entrega o template "Produtos".
4. **Fase 4: engajamento.** Anel de pontuação, checklist, card de dica, banner fechável e faixa de benefícios. Entrega o template "Início do painel da loja" completo.

Cada fase é publicada e conferida antes da próxima (claro, escuro, celular, teclado e leitor de tela).

---

## 5. Decisões necessárias antes de começar

1. **Qual tela é a base do Início?** As três têm diferenças. Opções: escolher uma, ou juntar o que há de melhor nas três.
2. **Nomes do menu.** As telas usam nomes diferentes para a mesma coisa: "Interesses" × "Buscas e interesse"; "Desempenho" × "Inteligência de vendas"; "Contatos de interesse" × "Contatos / reservas". Qual nome vale?
3. **Cores do gráfico.** A tela 1 usa roxo e laranja nas séries, e essas cores não estão no DS. Proposta: usar a paleta de gráficos do DS (rosa e grafites).
4. **Card de plano no menu.** As telas mostram "Plano Profissional" e "Plano de lançamento R$ 9,99", mas os planos do template de preços são Visibilidade, Desempenho e Oportunidades. Qual vale?
5. **Templates genéricos** (Auth, Team, Inbox, Contact, Landing): manter, adaptar ou retirar do DS FindLook?
6. **Por onde começar:** Fase 1, como sugerido?

---

## 6. Observação fora do escopo

O menu do DS FindLook mostra os nomes dos templates em inglês ("Dashboard", "Settings", "Auth", "Team", "Inbox", "Pricing", "Contact", "Landing Page"), embora o DS seja só em português. Posso corrigir junto com a Fase 1, se você quiser.
