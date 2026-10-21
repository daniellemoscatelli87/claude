# Sistema de apresentação: conteúdo → forma → interação

## A regra principal
**Não escolha o componente porque ele aparece na Home. Escolha-o pelo tipo de compreensão que o conteúdo exige.** O design system é compartilhado; a composição editorial é nova.

| Trabalho cognitivo do visitante | Forma útil | Não fazer |
|---|---|---|
| Entender imediatamente a função do produto | Hero com preview de interface e estado demonstrativo | Repetir a foto, headline ou animação principal da Home |
| Comparar aplicações diferentes | Scenario switcher com abas/tabs + painel contextual | Cards idênticos de segmentos |
| Ver o método sem aprender metodologia | Trilhas “você faz” / “plataforma organiza” | Repetir timeline institucional |
| Conhecer entregáveis | Artifact workspace, exemplos navegáveis | Seis cards genéricos sem conteúdo |
| Compreender físico ↔ digital ↔ operação | Mapa de relações em camadas, exploração por nós | Órbitas decorativas copiadas da Home |
| Comparar SaaS e consultoria | Comparador por situação real | Tabela genérica com checkmarks em dezenas de linhas |
| Avaliar confiança | Princípios sucintos e estados de informação | Dados de mercado repetidos, selos não comprovados |
| Avaliar planos | Pricing preview honesto | Preço fictício, desconto falso, “mais vendido” não validado |
| Resolver objeções | FAQ em accordion | Copiar FAQ do estúdio |

## Gramática visual herdada (verificar tokens vigentes no repositório)
- **Plus Jakarta Sans**; headings escuros; tracking editorial.
- Red editorial na ação/foco, grafite nos textos, fundos muito claros e bastante respiro.
- Nos estudos HTML: `brand.500 #D44D4D`, `graphite.900 #1E242B`, `graphite.700 #3D4653`, superfícies `#F1F4F8`. Estes são exemplos de **uma variante**, não autorização para sobrepor os tokens reais.
- Bordas leves, radii consistentes, sombras sutis; containers que herdam o grid existente.
- Título inicial do produto pode ser azul/grafite escuro; vermelhos como destaques, sem virar uma página inteira vermelha.
- Preservar a coerência da navegação global, ícones, botões, focus rings e footer.

## Composição específica da página de produto
- Primeira dobra: muito mais próxima de **software demonstrável** que de posicionamento de consultoria.
- Ritmo editorial variável: hero + simulador largo + fluxo bifocal + mesa de artefatos + mapa de camadas + comparador + pricing + FAQ.
- No máximo duas zonas de forte movimento (por exemplo, hero preview e mapa de relações). Demais transições discretas.
- Não usar carrossel automático, contador de métricas animado, órbitas só por estética ou 10 seções com grids de 3 cards.
- Evitar longos blocos textuais. Informação detalhada deve aparecer mediante intenção explícita do visitante.

## Recomendações concretas de UI
- **Tabs** acessíveis para cenários (`role=tablist/tab/tabpanel`, `aria-selected`, navegação por teclado). `lucide-react` apenas como suporte semântico, nunca como único rótulo.
- **ActivityPreview** usa três estados `Desafio`, `Atividade`, `Evidência` e deixa explícito que é ilustrativo.
- **ArtifactWorkspace** com lista/tabs de artefatos + preview: uma única área de leitura para não criar seis seções repetitivas.
- **LayerMap** com conexões ilustrativas (não fingir causalidade comprovada) e descrição textual equivalente.
- **Comparator** por situação, com affordance clara para alternar.
- **PricingPreview** com estado “em definição” e CTA real.
- **FAQ** com HTML nativo `<details>` ou accordion acessível; controle claro de expansão.
- **Header** compartilhado, com item “Soluções” e indicação de página corrente. Breadcrumb discreto `Soluções / Experience Intelligence` pode ajudar, mas não é obrigatório no hero.

## Mobile-first
- Considerar larguras 320, 360, 390, 430, 768, 1024 e desktop.
- Hero em coluna: título e CTA antes da prévia; não esconder a prova visual abaixo de conteúdo interminável.
- Interações exploráveis por **toque**, sem dependência de hover; tabs horizontal scroll acessível, sem scroll-jacking.
- Mapas complexos com alternativa em lista sem perda de informação; não reduzir texto para caber em minidiagramas.
- CTAs de pelo menos 44 × 44 CSS px quando possível; labels reais; foco visível; não bloquear zoom.
- Contraste de cores e tipografia conforme WCAG 2.2 AA; `prefers-reduced-motion` respeitado; evitar movimento constante e animações que atrapalhem leitura.
- Nada de headers duplos entre site e produto; login deve continuar em rota separada.

## Performance e custo
- Simulador da página pública **100% estático e local**: nenhum token Gemini/OpenAI/Anthropic.
- Preferir SVG, CSS e componentes React leves; não depender de vídeo pesado ou renderização 3D em tempo real para comunicar valor.
- JS apenas nas interações genuínas; progressive enhancement onde possível.
- Lazy-load de previews abaixo da dobra; evitar layout shift e fontes desnecessárias.

## Honestidade do produto
- Conteúdos da página de produto descrevem a **visão**, e previews demonstram a lógica. Não apresentar simulações como resultados reais.
- Discovery adaptativo completo, RAG e mensuração podem estar em construção. Sinalização editorial sucinta de “plataforma em evolução / acesso por convite”, sem afirmar disponibilidade atual desses recursos.
- Não usar depoimentos ou logotipos de clientes do produto sem autorização nem copiar recomendações da consultoria como provas de desempenho do SaaS.

## Governança de implementação
- Antes de alterar código: mapa de rotas, componentes reaproveitados, componentes novos, bibliotecas adicionais e impacto do bundle.
- Não inserir HTML exportado do Stitch diretamente no app nem duplicar CSS global.
- Não alterar conteúdo da Home/“Soluções” além da adição do link e eventual chamada previamente aprovada.
- Propor componentes com nomes focados em função (`ChallengePreview`, `ScenarioExplorer`, `ActivityLens`, `EvidenceWorkspace`, `OperationsMap`, `SupportComparator`, `PlanPreview`).
- Testes: mobile, teclado, leitor de tela ao menos manual/semântico, reduced motion, links, CTAs, responsividade, zero chamadas de IA.
