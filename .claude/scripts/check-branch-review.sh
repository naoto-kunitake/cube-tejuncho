#!/bin/bash
# PreToolUse (Bash) フック。`git push`の前に、ブランチ全体 (mainとの差分) がcode-reviewerを通っているかを確かめる。
# /prがレビュー後に書く印 (review-stamp.sh write-branch) と今の差分の印を照合し、違えばexit 2で止める。
# コミット単位のレビューはコミットをまたぐ整合を見られないので、pushの直前に全体を1回見る。
set -euo pipefail

RAW=$(cat)
# 無関係なコマンドはjqを使う前に通す (jqがない端末で全部が止まらないように)
grep -q 'git' <<< "$RAW" || exit 0
command -v jq >/dev/null || { echo "[check-branch-review] jqがない。brew install jqを手で実行する。" >&2; exit 2; }

CMD=$(jq -r '.tool_input.command // empty' <<< "$RAW")

# HEREDOCの本文を落としてから判定する (PR本文の中の「git push」で誤って止めない)
STRIPPED=$(awk '
  !f && match($0, /<<-?["'"'"']?[A-Za-z_]+/) { tag = substr($0, RSTART, RLENGTH); sub(/^<<-?["'"'"']?/, "", tag); f = 1; print; next }
  f && $0 ~ ("^[[:space:]]*" tag "[[:space:]]*$") { f = 0; next }
  !f { print }
' <<< "$CMD")

# `git -C dir push`、`git -c key=value push` (値に空白があればkey="値" の形)、`FOO=bar git push`の環境変数つきも拾う
GIT_OPTION="(-[C][[:space:]]+[^[:space:]]+|-c[[:space:]]+('[^']*'|\"[^\"]*\"|[^[:space:]=]+(=([^[:space:]]*|'[^']*'|\"[^\"]*\"))?))"
ENV_ASSIGNMENT="([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*"
GIT_PUSH="(^|&&|;|\|\|)[[:space:]]*${ENV_ASSIGNMENT}(command[[:space:]]+)?git([[:space:]]+${GIT_OPTION})*[[:space:]]+push([[:space:]]|$)"
PUSH_LINES=$(grep -E "$GIT_PUSH" <<< "$STRIPPED" || true)
if [[ -z "$PUSH_LINES" ]]; then
  exit 0
fi

# リモートのブランチの削除は差分を出さない
if grep -qE '(^|[[:space:]])(--delete|-d)([[:space:]]|$)' <<< "$PUSH_LINES"; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel)
BRANCH=$(git -C "$ROOT" branch --show-current)

# mainへの直接pushはGitHubの保護ルールが止める。ここでは作業ブランチだけを見る
if [[ -z "$BRANCH" || "$BRANCH" == "main" ]]; then
  exit 0
fi

STAMP_SCRIPT="$ROOT/.claude/scripts/review-stamp.sh"

# 基準 (main) が解決できないときは通さない。差分の取得に失敗して「差分なし」と誤認するのを防ぐ
if ! CHANGED=$(bash "$STAMP_SCRIPT" files-branch); then
  echo "[check-branch-review] mainとの差分を取れない。main (またはorigin/main) があるか確かめる。" >&2
  exit 2
fi
if [[ -z "$CHANGED" ]]; then
  exit 0
fi

if [[ "$(bash "$STAMP_SCRIPT" hash-branch)" != "$(bash "$STAMP_SCRIPT" read-branch)" ]]; then
  cat <<'MSG' >&2
[check-branch-review] ブランチ全体の差分がcode-reviewerを通っていない (印がないか、レビュー後に差分が変わった)。
/prを使う: mainとの差分全体をcode-reviewerで点検し、Critical / Majorを直してから印を書き、オーナーのOKを得てpushする。
MSG
  exit 2
fi

exit 0
