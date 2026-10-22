# Design system "Graphite + Crimson" (DS2): cópia de referência

- **Origem:** https://danimoscatellivendas-alt.github.io/DS2/ · repositório `danimoscatellivendas-alt/ds2`, commit `66e050d` (02/08/2026). Exportação do Figma Make ("Design System for SaaS App", arquivo Figma `91iVAHixAJKWaw3H6qIUxV`).
- **Copiado em 22/10/2026**, a pedido da dona do produto, **sem alteração** (sem `.git` e sem o fluxo de publicação do GitHub). Inclui componentes do shadcn/ui (licença MIT, ver `ATTRIBUTIONS.md`).
- **Conteúdo:** tokens em `src/styles/theme.css` (escalas graphite e crimson, tokens semânticos claro e escuro, sombras, raio 0,75 rem, Plus Jakarta Sans), componentes em `src/app/components/ui/` (shadcn/ui + Radix) e páginas de demonstração em `src/app/components/showcase/`.
- **Tecnologia:** React + Vite + Tailwind CSS v4 + shadcn/ui, Radix UI e MUI. O app DM | Experience Intelligence usa Next.js com CSS próprio (sem Tailwind); o site do estúdio usa Vite e páginas estáticas.
- **Situação:** só referência. Nada foi ligado ao app nem ao site; a forma de adoção depende de decisão da dona do produto.
- **Atenção de acessibilidade:** o botão primário do DS2 usa branco sobre `#D44D4D` (4,23:1), abaixo do mínimo de 4,5:1 para texto normal.
