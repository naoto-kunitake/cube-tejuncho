#!/bin/bash
# レビューを通った差分の印 (SHA-256)。計算を1か所にして、書く側と照合する側がずれて全部が止まる事故を防ぐ。
# - ステージ済みの差分: /commitが`write`で書き、check-self-review.shが`hash`で照合する
# - ブランチ全体の差分 (mainとの差): /prが`write-branch`で書き、check-branch-review.shが`hash-branch`で照合する
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
STAMP_FILE="$ROOT/.claude/review-stamp"
BRANCH_STAMP_FILE="$ROOT/.claude/review-stamp-branch"

hash_staged() {
  git -C "$ROOT" diff --cached | shasum -a 256 | awk '{print $1}'
}

# 比較の基準。ローカルのmainがなければorigin/main。どちらもなければ失敗させる (黙って「差分なし」にしない)
resolve_base() {
  git -C "$ROOT" rev-parse --verify -q main 2>/dev/null && return 0
  git -C "$ROOT" rev-parse --verify -q origin/main 2>/dev/null && return 0
  echo "review-stamp: mainもorigin/mainも見つからない" >&2
  return 1
}

hash_branch() {
  local base
  base=$(resolve_base)
  git -C "$ROOT" diff "$base...HEAD" | shasum -a 256 | awk '{print $1}'
}

files_branch() {
  local base
  base=$(resolve_base)
  git -C "$ROOT" diff "$base...HEAD" --name-only
}

case "${1:-}" in
  hash) hash_staged ;;
  write) hash_staged > "$STAMP_FILE" ;;
  read) cat "$STAMP_FILE" 2>/dev/null || true ;;
  hash-branch) hash_branch ;;
  write-branch) hash_branch > "$BRANCH_STAMP_FILE" ;;
  read-branch) cat "$BRANCH_STAMP_FILE" 2>/dev/null || true ;;
  files-branch) files_branch ;;
  *) echo "usage: review-stamp.sh hash|write|read|hash-branch|write-branch|read-branch|files-branch" >&2; exit 1 ;;
esac
