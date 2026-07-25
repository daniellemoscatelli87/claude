# Métricas para Designers

Sistema para transformar o guia "Métricas de UX e Negócio para Designers" em uma
ferramenta de uso diário. Para cada projeto, o designer:

1. **Descreve o problema e a hipótese de design** (Passo 1 do framework).
2. **Marca as necessidades da etapa atual** ("preciso validar usabilidade", "preciso medir
   conversão", etc.) e o sistema recomenda automaticamente quais métricas coletar para cada uma,
   com dicas de como obter o dado (origem, ferramentas e quem envolver na empresa).
3. **Acompanha cada métrica**: define baseline e meta, e registra os valores coletados ao longo
   do tempo, com data, fonte e notas.
4. **Registra a decisão pós-lançamento** (manter & escalar, iterar & ajustar, ou pivotar/reverter).

Também inclui:

- **Catálogo de Métricas** — referência de todas as métricas de UX e negócio (TSR, TMT, SUS,
  CSAT, NPS, CR, Churn, LTV/CAC etc.), com descrição, origem do dado e como coletá-lo.
- **Guia Rápido** — FAQ sobre de onde vêm os dados, quem acionar (PM, Data Analyst, Tech Lead,
  UX Researcher, CS) e checklists interativos de autonomia em dados.

Todos os dados dos projetos ficam salvos no `localStorage` do navegador.

## Rodando localmente

```bash
npm install
npm run dev
```

## Stack

React + TypeScript + Vite + Tailwind CSS + React Router + Zustand.
