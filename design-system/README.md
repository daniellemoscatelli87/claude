# Design System Dani Moscatelli no site

A área restrita do site (`public/admin/` e, em migração, `apps/area-restrita/`) e o app DM | Experience Intelligence (`apps/experience-intelligence/`) usam cópias de arquivos do Design System Dani Moscatelli (decisões da dona do produto, 23/11/2026: "tudo deve consumir o Design System" e "app EI consome tokens e componentes do DS Dani Moscatelli, com atualização diária", D-047):

- Repositório: https://github.com/daniellemoscatelli87/DaniMoscatelli-DesignSystem
- Publicado: https://designsystem.danimoscatelli.com.br
- Versão copiada: o commit registrado em `versao.txt`
- Arquivos copiados: a lista em `arquivos.txt`

## Como a área restrita usa

As páginas de `public/admin/` são HTML e JavaScript puros, sem Tailwind. Cada página carrega `/design-system/theme.css` (cópia do `src/styles/theme.css` do DS) antes de `/admin/admin.css`. O navegador lê as variáveis de `:root` (cores, sombras, raio, movimento, gráficos) e ignora os blocos do Tailwind (`@custom-variant`, `@theme inline` e o `@apply` da camada base). `admin.css` e os estilos das páginas usam só esses tokens: não há paleta própria.

A fonte (Plus Jakarta Sans) já vem do Google Fonts em cada página, por isso o `fonts.css` do DS não é copiado.

## Como a área restrita em React usa (D-051)

O app `apps/area-restrita/` (Vite, React 18.3 e Tailwind 4.1.12, as versões do DS) recebe os quatro arquivos de estilo do DS e **a pasta `src/app/components/ui/` inteira** (`apps/area-restrita/src/components/ui/`): componente novo no DS chega sozinho, e o que sair do DS é apagado ali. `npm run conformidade` (no app) confere que o código do app não tem nada fora do DS (base em zero). Plano e regras em `docs/engineering/ADMIN_REACT.md`.

O app `apps/site/` (site público em React, D-053) recebe os mesmos arquivos de estilo e a mesma pasta `ui` inteira (`apps/site/src/components/ui/`), com a mesma conferência (`npm run conformidade`, base em zero). As fontes entram por `<link>` na cabeça de cada página, com o endereço lido do `fonts.css` sincronizado. Plano e regras em `docs/engineering/SITE_REACT.md`.

## Como o app Experience Intelligence usa

O app (Next.js) usa Tailwind v4 com os arquivos do DS, como mandam as páginas Integração e Desenvolvimento do DS:

- `apps/experience-intelligence/src/styles/`: `index.css` (ponto de entrada, importado no `layout.tsx`), `fonts.css`, `tailwind.css` e `theme.css` (tokens e mapeamento `@theme inline`). Temas claro e escuro vêm dos tokens (o escuro é a classe `.dark` no `<html>`; o app ainda não tem troca de tema).
- `apps/experience-intelligence/src/components/ui/`: os componentes do DS que as telas usam, com o `utils.ts` (`cn`).
- O Next descarta o `@import url(...)` externo do `fonts.css`; por isso o `layout.tsx` lê o endereço das fontes do próprio `fonts.css` copiado e carrega por `<link>`. Muda junto com a sincronização.
- `src/design-system/campos.tsx` (do app) junta os componentes do DS com a lógica dos formulários (`padroes.ts`); não tem cor nem componente visual próprio.
- Nenhum componente copiado importa algo exclusivo do site do DS (como o `i18n`). Se um componente novo importar, a solução é um módulo do app no caminho que o componente espera, nunca editar a cópia.

## Sincronização com aprovação

A rotina `.github/workflows/sincronizar-design-system.yml` roda todos os dias e também pode ser disparada pelo botão "Run workflow" na aba Actions do GitHub. Ela:

1. copia a versão mais recente dos arquivos listados em `arquivos.txt` (script `scripts/sincronizar-design-system.sh`; uma linha pode ser um arquivo, uma pasta inteira terminada em `/` ou `excluir <arquivo>`, como no produto FindLook);
2. se algo mudou, testa a área restrita em React (tipos, testes, conformidade e build em `apps/area-restrita`), o site (build) e o app Experience Intelligence (`npm ci`, tipos, lint, testes e build em `apps/experience-intelligence`);
3. com o teste aprovado, abre ou atualiza um pull request "Sincroniza o design system Dani Moscatelli", com a lista de mudanças do design system;
4. se um arquivo da lista não existir mais ou o teste falhar, não aplica nada e abre uma issue avisando.

O site só muda quando a dona do produto aprova o pull request.

Para rodar à mão, na raiz do repositório: `bash scripts/sincronizar-design-system.sh` (ou `DS_REF=<commit> bash scripts/...` para uma versão específica).

## Regras

- Nunca edite no site os arquivos da lista: a próxima sincronização sobrescreve. Mudanças são feitas no design system.
- Ao passar a usar outro arquivo do DS, acrescente-o em `arquivos.txt`.
- Ao mudar a versão copiada, troque o `?v=` do `theme.css` nas páginas de `public/admin/`, para o navegador não usar a cópia antiga.
- Ao usar no app um componente novo de `ui/`, acrescente-o em `arquivos.txt` (e as dependências dele no `package.json` do app), senão ele não será sincronizado.
- O teste automático pega erros de tipos, testes e build, não problemas visuais. Confira a área restrita e as telas do app antes de aprovar quando a mudança for visual.
