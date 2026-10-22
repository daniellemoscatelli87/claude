# Design system oficial Dani Moscatelli: cópia de referência

- **Origem oficial (indicada pela dona do produto em 22/10/2026):** https://daniellemoscatelli87.github.io/DaniMoscatelli-DesignSystem/ · repositório `daniellemoscatelli87/DaniMoscatelli-DesignSystem`, commit `21f89da` (22/10/2026).
- **Substitui** a cópia do DS2 (`danimoscatellivendas-alt/ds2`), que era uma versão anterior.
- **Copiado sem alteração** (sem `.git` e sem o fluxo de publicação do GitHub). Inclui componentes do shadcn/ui (licença MIT, ver `ATTRIBUTIONS.md`).
- **Conteúdo:**
  - tokens em `src/styles/theme.css`: escalas graphite e crimson, tokens semânticos claro e escuro (classe `.dark`), sombras, raio 0,75 rem;
  - tipografia: Plus Jakarta Sans (principal), Space Grotesk (destaque) e Fraunces (acento), regras em `src/imports/pasted_text/design-system-typography.md`;
  - marca: logotipos e símbolo em PNG e SVG (`src/imports/`, `src/imports/svg/`);
  - componentes em `src/app/components/ui/` (shadcn/ui + Radix) e demonstrações em `src/app/components/showcase/` (inclui guia de integração em `IntegrationShowcase.tsx`).
- **Integração indicada pelo próprio design system:** Tailwind CSS v4, `theme.css` em `src/styles/`, mapeamento `@theme inline`, tema escuro pela classe `.dark` no `<html>`, cores sempre por token (sem hexadecimal solto).
- **Situação:** referência. A forma e o lugar de adoção dependem de decisão da dona do produto.
- **Atenção de acessibilidade:** o botão primário usa branco sobre `#D44D4D` (4,23:1), abaixo do mínimo de 4,5:1 para texto normal.
