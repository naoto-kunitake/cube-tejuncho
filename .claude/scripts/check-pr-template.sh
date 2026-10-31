#!/bin/bash
# PreToolUse (Bash) フック。`gh pr create`の本文が雛形の必須の見出し (目的・変更) を持つかを確かめ、
# なければexit 2で止める。本文は`--body-file - <<'EOF'`のHEREDOCからだけ読む。それ以外の渡し方は止める。
set -euo pipefail

RAW=$(cat)
grep -q 'gh' <<< "$RAW" || exit 0
command -v jq >/dev/null || { echo "[check-pr-template] jqがない。brew install jqを手で実行する。" >&2; exit 2; }

CMD=$(jq -r '.tool_input.command // empty' <<< "$RAW")

STRIPPED=$(awk '
  !f && match($0, /<<-?["'"'"']?[A-Za-z_]+/) { tag = substr($0, RSTART, RLENGTH); sub(/^<<-?["'"'"']?/, "", tag); f = 1; print; next }
  f && $0 ~ ("^[[:space:]]*" tag "[[:space:]]*$") { f = 0; next }
  !f { print }
' <<< "$CMD")

if ! grep -qE '(^|&&|;|\|\|)[[:space:]]*gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)' <<< "$STRIPPED"; then
  exit 0
fi

BODY=""
if grep -qE -- "--body-file[[:space:]]+-[[:space:]]+<<-?'?EOF'?" <<< "$CMD"; then
  BODY=$(awk "
    /<<-?'?EOF'?/ { flag = 1; next }
    /^[[:space:]]*EOF[[:space:]]*\$/ { flag = 0; next }
    flag { print }
  " <<< "$CMD")
fi

if [[ -z "$BODY" ]]; then
  echo "[check-pr-template] PR本文を読み取れない。gh pr create --title ... --body-file - <<'EOF' ... EOFの形で渡す。" >&2
  exit 2
fi

MISSING=()
# チェックリストはオーナーが実機で確かめることがあるときだけ (なければ見出しごと省く)
for section in "目的" "変更"; do
  if ! grep -qE "^##[[:space:]]+${section}[[:space:]]*$" <<< "$BODY"; then
    MISSING+=("## ${section}")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "[check-pr-template] 必須の見出しがない: ${MISSING[*]}。.github/pull_request_template.mdの形に合わせる。" >&2
  exit 2
fi

if grep -qE '^##[[:space:]]+(Summary|Test plan)' <<< "$BODY"; then
  echo "[check-pr-template] 既定の見出し (Summary / Test plan) は使わない。雛形の見出しだけにする。" >&2
  exit 2
fi

exit 0
