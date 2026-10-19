#!/bin/bash
# PreToolUse (Bash) フック。`git commit` の前に、ステージ済みの差分が code-reviewer を通っているかを確かめる。
# /commit がレビュー後に書く印 (review-stamp.sh write) と今の差分の印を照合し、違えば exit 2 で止める。
# ステージ済みが設定・文書だけなら通す。
set -euo pipefail

RAW=$(cat)
# 無関係なコマンドは jq を使う前に通す (jq がない端末で全部が止まらないように)
grep -q 'git' <<< "$RAW" || exit 0
command -v jq >/dev/null || { echo "[check-self-review] jq がない。brew install jq を手で実行する。" >&2; exit 2; }

CMD=$(jq -r '.tool_input.command // empty' <<< "$RAW")

# HEREDOC の本文を落としてから判定する (本文中の「git commit」や「-a」で誤って止めない)
STRIPPED=$(awk '
  !f && match($0, /<<-?["'"'"']?[A-Za-z_]+/) { tag = substr($0, RSTART, RLENGTH); sub(/^<<-?["'"'"']?/, "", tag); f = 1; print; next }
  f && $0 ~ ("^[[:space:]]*" tag "[[:space:]]*$") { f = 0; next }
  !f { print }
' <<< "$CMD")

GIT_COMMIT='(^|&&|;|\|\|)[[:space:]]*(command[[:space:]]+)?git([[:space:]]+-[Cc][[:space:]]+[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)'
COMMIT_LINES=$(grep -E "$GIT_COMMIT" <<< "$STRIPPED" || true)
if [[ -z "$COMMIT_LINES" ]]; then
  exit 0
fi

if grep -qE '(^|[[:space:]])(-a|--all|-am)([[:space:]]|$)' <<< "$COMMIT_LINES"; then
  echo "[check-self-review] git commit -a は使えない。レビューの対象を確定するため git add でステージしてから /commit を使う。" >&2
  exit 2
fi

ROOT=$(git rev-parse --show-toplevel)

# push 済みのコミットの amend は履歴が食い違い force push が要るので止める。push 前なら許す
if grep -qE '(^|[[:space:]])--amend([[:space:]=]|$)' <<< "$COMMIT_LINES"; then
  if [[ -n "$(git -C "$ROOT" branch -r --contains HEAD 2>/dev/null)" ]]; then
    echo "[check-self-review] push 済みのコミットは amend しない。新しいコミットを積む。" >&2
    exit 2
  fi
fi

STAGED=$(git -C "$ROOT" diff --cached --name-only)
if [[ -z "$STAGED" ]]; then
  exit 0
fi

NEEDS_REVIEW=0
while IFS= read -r f; do
  case "$f" in
    *.ts|*.tsx|*.css) NEEDS_REVIEW=1 ;;
  esac
done <<< "$STAGED"
if [[ "$NEEDS_REVIEW" -eq 0 ]]; then
  exit 0
fi

STAMP_SCRIPT="$ROOT/.claude/scripts/review-stamp.sh"
if [[ "$(bash "$STAMP_SCRIPT" hash)" != "$(bash "$STAMP_SCRIPT" read)" ]]; then
  cat <<'MSG' >&2
[check-self-review] ステージ済みの差分が code-reviewer を通っていない (印がないか、レビュー後に差分が変わった)。
/commit を使う: code-reviewer で点検し、Critical / Major を直してから印を書き、コミットする。
MSG
  exit 2
fi

exit 0
