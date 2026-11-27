#!/usr/bin/env bash
# Copia para o site os arquivos listados em design-system/arquivos.txt,
# na versão mais recente do Design System Dani Moscatelli (ou em DS_REF, se informado).
#
# Cada linha da lista pode ser (mesma regra do produto FindLook):
#   <arquivo no design system>  <arquivo no site>   um arquivo;
#   <pasta no design system>/   <pasta no site>/    a pasta inteira (todos os arquivos, inclusive novos);
#   excluir <arquivo no design system>              um arquivo de pasta inteira que o site não copia.
#
# Pasta inteira: a pasta do site passa a ser só do design system. Um arquivo que o design system
# apagou (ou que entrou na lista de exclusões) é apagado também no site.
# Falha sem alterar nada se algum arquivo ou pasta da lista não existir mais no design system.
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

# 1) Lê a lista e confere tudo antes de copiar qualquer arquivo.
declare -A EXCLUIDO=()
ARQUIVOS=()  # pares "origem destino"
PASTAS=()    # pares "origem/ destino/"
faltando=0
while read -r origem destino _; do
  [[ -z "${origem:-}" || "$origem" == \#* ]] && continue
  if [[ "$origem" == "excluir" ]]; then
    if [[ -z "${destino:-}" ]]; then echo "Linha 'excluir' sem caminho." >&2; faltando=1; continue; fi
    EXCLUIDO["$destino"]=1
    [[ -f "$TMP/ds/$destino" ]] || echo "Aviso: a exclusão $destino não existe mais no design system; pode sair da lista." >&2
    continue
  fi
  if [[ -z "${destino:-}" ]]; then echo "Linha sem destino: $origem" >&2; faltando=1; continue; fi
  if [[ "$origem" == */ ]]; then
    if [[ "$destino" != */ ]]; then echo "Pasta inteira: o destino também termina com /: $origem $destino" >&2; faltando=1; continue; fi
    if [[ ! -d "$TMP/ds/$origem" ]]; then echo "Pasta não existe mais no design system: $origem" >&2; faltando=1; continue; fi
    PASTAS+=("$origem $destino")
  else
    if [[ ! -f "$TMP/ds/$origem" ]]; then echo "Não existe mais no design system: $origem" >&2; faltando=1; continue; fi
    ARQUIVOS+=("$origem $destino")
  fi
done < "$LISTA"
if [[ "$faltando" -ne 0 ]]; then
  echo "Sincronização interrompida: ajuste design-system/arquivos.txt." >&2
  exit 1
fi

# 2) Copia os arquivos avulsos.
for par in "${ARQUIVOS[@]}"; do
  read -r origem destino <<< "$par"
  mkdir -p "$(dirname "$RAIZ/$destino")"
  cp "$TMP/ds/$origem" "$RAIZ/$destino"
done

# 3) Copia as pastas inteiras (menos as exclusões) e apaga no site o que saiu do design system.
for par in "${PASTAS[@]+"${PASTAS[@]}"}"; do
  read -r origem destino <<< "$par"
  declare -A NA_ORIGEM=()
  mkdir -p "$RAIZ/$destino"
  while IFS= read -r -d '' arquivo; do
    rel="${arquivo#"$TMP/ds/$origem"}"
    [[ -n "${EXCLUIDO["$origem$rel"]:-}" ]] && continue
    NA_ORIGEM["$rel"]=1
    mkdir -p "$(dirname "$RAIZ/$destino$rel")"
    cp "$arquivo" "$RAIZ/$destino$rel"
  done < <(find "$TMP/ds/$origem" -type f -print0 | sort -z)
  while IFS= read -r -d '' arquivo; do
    rel="${arquivo#"$RAIZ/$destino"}"
    if [[ -z "${NA_ORIGEM["$rel"]:-}" ]]; then
      rm "$arquivo"
      echo "Apagado no site (saiu do design system ou está nas exclusões): $destino$rel"
    fi
  done < <(find "$RAIZ/$destino" -type f -print0 | sort -z)
  echo "Pasta $origem: ${#NA_ORIGEM[@]} arquivos sincronizados em $destino"
  unset NA_ORIGEM
done

# 4) Registra a versão e o histórico desde a versão anterior (usado na descrição do pull request).
ANTERIOR="$(cat "$RAIZ/design-system/versao.txt" 2>/dev/null || true)"
echo "$VERSAO" > "$RAIZ/design-system/versao.txt"
if [[ -n "$ANTERIOR" && "$ANTERIOR" != "$VERSAO" ]] && git -C "$TMP/ds" cat-file -e "$ANTERIOR^{commit}" 2>/dev/null; then
  git -C "$TMP/ds" log --format='- %s (%h)' "$ANTERIOR..$VERSAO" > "$RAIZ/design-system/.ultimas-mudancas.txt"
else
  git -C "$TMP/ds" log -1 --format='- %s (%h)' "$VERSAO" > "$RAIZ/design-system/.ultimas-mudancas.txt"
fi
echo "Design system sincronizado na versão $VERSAO"
