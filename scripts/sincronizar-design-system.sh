#!/usr/bin/env bash
# Copia para o site os arquivos listados em design-system/arquivos.txt,
# na versão mais recente do Design System Dani Moscatelli (ou em DS_REF, se informado).
# Falha sem alterar nada se algum arquivo da lista não existir mais no design system.
set -euo pipefail

DS_REPO="${DS_REPO:-https://github.com/daniellemoscatelli87/DaniMoscatelli-DesignSystem.git}"
DS_REF="${DS_REF:-main}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
LISTA="$RAIZ/design-system/arquivos.txt"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet "$DS_REPO" "$TMP/ds"
git -C "$TMP/ds" checkout --quiet "$DS_REF"
VERSAO="$(git -C "$TMP/ds" rev-parse HEAD)"

# 1) Confere a lista inteira antes de copiar qualquer arquivo.
faltando=0
while read -r origem destino _; do
  [[ -z "${origem:-}" || "$origem" == \#* ]] && continue
  if [[ -z "${destino:-}" ]]; then echo "Linha sem destino: $origem" >&2; faltando=1; continue; fi
  if [[ ! -f "$TMP/ds/$origem" ]]; then echo "Não existe mais no design system: $origem" >&2; faltando=1; fi
done < "$LISTA"
if [[ "$faltando" -ne 0 ]]; then
  echo "Sincronização interrompida: ajuste design-system/arquivos.txt." >&2
  exit 1
fi

# 2) Copia.
while read -r origem destino _; do
  [[ -z "${origem:-}" || "$origem" == \#* ]] && continue
  mkdir -p "$(dirname "$RAIZ/$destino")"
  cp "$TMP/ds/$origem" "$RAIZ/$destino"
done < "$LISTA"

# 3) Registra a versão e o histórico desde a versão anterior (usado na descrição do pull request).
ANTERIOR="$(cat "$RAIZ/design-system/versao.txt" 2>/dev/null || true)"
echo "$VERSAO" > "$RAIZ/design-system/versao.txt"
if [[ -n "$ANTERIOR" && "$ANTERIOR" != "$VERSAO" ]] && git -C "$TMP/ds" cat-file -e "$ANTERIOR^{commit}" 2>/dev/null; then
  git -C "$TMP/ds" log --format='- %s (%h)' "$ANTERIOR..$VERSAO" > "$RAIZ/design-system/.ultimas-mudancas.txt"
else
  git -C "$TMP/ds" log -1 --format='- %s (%h)' "$VERSAO" > "$RAIZ/design-system/.ultimas-mudancas.txt"
fi
echo "Design system sincronizado na versão $VERSAO"
