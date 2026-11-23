# Design System Dani Moscatelli no site

A área restrita do site (`public/admin/`) usa cópias de arquivos do Design System Dani Moscatelli (decisão da dona do produto, 23/11/2026: "tudo deve consumir o Design System"):

- Repositório: https://github.com/daniellemoscatelli87/DaniMoscatelli-DesignSystem
- Publicado: https://designsystem.danimoscatelli.com.br
- Versão copiada: o commit registrado em `versao.txt`
- Arquivos copiados: a lista em `arquivos.txt`

## Como a área restrita usa

As páginas de `public/admin/` são HTML e JavaScript puros, sem Tailwind. Cada página carrega `/design-system/theme.css` (cópia do `src/styles/theme.css` do DS) antes de `/admin/admin.css`. O navegador lê as variáveis de `:root` (cores, sombras, raio, movimento, gráficos) e ignora os blocos do Tailwind (`@custom-variant`, `@theme inline` e o `@apply` da camada base). `admin.css` e os estilos das páginas usam só esses tokens: não há paleta própria.

A fonte (Plus Jakarta Sans) já vem do Google Fonts em cada página, por isso o `fonts.css` do DS não é copiado.

## Sincronização com aprovação

A rotina `.github/workflows/sincronizar-design-system.yml` roda todos os dias e também pode ser disparada pelo botão "Run workflow" na aba Actions do GitHub. Ela:

1. copia a versão mais recente dos arquivos listados em `arquivos.txt` (script `scripts/sincronizar-design-system.sh`);
2. se algo mudou, testa o site (build);
3. com o teste aprovado, abre ou atualiza um pull request "Sincroniza o design system Dani Moscatelli", com a lista de mudanças do design system;
4. se um arquivo da lista não existir mais ou o teste falhar, não aplica nada e abre uma issue avisando.

O site só muda quando a dona do produto aprova o pull request.

Para rodar à mão, na raiz do repositório: `bash scripts/sincronizar-design-system.sh` (ou `DS_REF=<commit> bash scripts/...` para uma versão específica).

## Regras

- Nunca edite no site os arquivos da lista: a próxima sincronização sobrescreve. Mudanças são feitas no design system.
- Ao passar a usar outro arquivo do DS, acrescente-o em `arquivos.txt`.
- Ao mudar a versão copiada, troque o `?v=` do `theme.css` nas páginas de `public/admin/`, para o navegador não usar a cópia antiga.
- O teste automático pega erros de build, não problemas visuais. Confira a área restrita antes de aprovar quando a mudança for visual.
