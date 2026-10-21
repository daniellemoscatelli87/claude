# Revisão de UI/UX da landing comercial (skill ui-ux-pro-max)

**Data:** 21/10/2026 · **Escopo:** `src/components/Landing.tsx`, `src/components/landing/*`, estilos `.lp-*`. Só revisão: nada foi alterado.

**Método:** checklist das 10 categorias da skill (`references/quick-reference.md`), buscas na base local da skill (`--domain ux`, `--domain landing`) e medições automáticas na página gerada (celular 375 px): contraste das cores, tamanho das áreas de toque, tamanhos de fonte, ordem dos títulos, foco pelo teclado sob o cabeçalho fixo e abas cortadas.

## O que já está de acordo

- Um único H1, títulos em ordem (H1 → H2 → H3 → H4, sem pulos), idioma `pt-BR`, sem imagens sem texto alternativo, `<main>` presente.
- Sem rolagem lateral (320 a 1280 px); viewport sem bloqueio de zoom.
- Foco do teclado visível e nunca escondido pelo cabeçalho fixo (testado em 60 passos de Tab).
- Abas com setas do teclado, FAQ com `aria-expanded`, filtros com `role="radio"`, resultado anunciado com `aria-live`.
- Movimento reduzido respeitado; sem carrossel automático; ícones SVG (Lucide), sem emoji.
- Um botão principal por dobra; sem scripts de terceiros antes do consentimento.

## Pontos encontrados (por prioridade da skill)

| # | Prioridade | Regra da skill | O que foi medido | Sugestão |
|---|---|---|---|---|
| 1 | Acessibilidade (crítica) | `color-contrast` (4,5:1 para texto normal) | Botão principal: branco sobre `--red` #d44d4d = **4,23:1**. Links em `--red` sobre branco (ex.: "Ver exemplo", "Ver fonte") = **4,23:1**. Texto `--muted` sobre `--bg` (cards em seções claras) = **4,45:1** | Usar `--red-dark` #b83a3a (já existe no app; 5,67:1) para links e texto vermelho pequeno. Para o botão: decisão de marca (mantém `--red` ou passa a `--red-dark`). Texto cinza nos cards sobre `--bg`: usar fundo branco ou `--text`. **Mexe nas cores: precisa da sua decisão** |
| 2 | Acessibilidade | `skip-links` | Não há link "Pular para o conteúdo" | Link oculto que aparece no primeiro Tab, indo para o início do conteúdo |
| 3 | Layout (alta) | `chip-collection-reflow` | No celular, 3 grupos de abas ficam cortados à direita (ciclo do hero, sintomas, demonstração), sem sinal de que há mais opções | Sintomas (4 nomes curtos): quebrar em linhas. Ciclo e demonstração (a especificação pede faixa rolável): manter a rolagem e mostrar um indício visual (sombra na borda ou "1 de 5") |
| 4 | Tipografia | `readable-font-size` (16 px no corpo, no celular) | Textos dos cards em 15 px e 14 px; rótulos e etiquetas em 12 px (28 ocorrências); notas em 13 px | Textos dos cards em 16 px no celular; manter 12 a 13 px só em rótulos e notas curtas |
| 5 | Toque (crítica) | `touch-target-size` (44 px) | "Sobre a pesquisa" 32 px, "Ver exemplo" 34 px, "Entrar" no cabeçalho 40 px, marca 23 px de altura. Todos passam no mínimo do WCAG (24 px), menos a marca | Aumentar a área de toque desses itens para 44 px, sem mudar o visual |
| 6 | Acessibilidade | (observação do Claude; a busca da skill não trouxe regra específica) | Os 3 cards de pilares recebem foco do teclado (para realçar o diagrama), mas não fazem nada ao apertar Enter | Tirar o foco dos cards e deixar o realce só ao passar o mouse, ou transformar o realce em botão |
| 7 | Formulários e feedback | `toast-accessibility` / anúncios | O painel do entregável anuncia a mudança (`aria-live`) e também recebe o foco: leitores de tela podem repetir o texto | Manter só um dos dois (o foco) |

## Observações da base de padrões (para conhecimento)

- Padrão "Pricing-Focused Landing" da skill sugere destacar o plano mais indicado e botão em cada card. Não se aplica agora: os planos estão "em definição" e os botões de interesse ficaram fora por decisão da dona do produto.
- A busca por "landing B2B SaaS consultoria" não teve correspondência na base da skill; nenhuma recomendação de estrutura foi inventada.

## Próximo passo

Nada foi alterado. A dona do produto escolhe quais pontos aplicar; o item 1 mexe nas cores e precisa de decisão explícita.
