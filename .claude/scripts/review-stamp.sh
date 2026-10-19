#!/bin/bash
# ステージ済みの差分の印 (SHA-256)。/commit が `write` で書き、check-self-review.sh が `hash` で照合する。
# 計算を 1 か所にして、2 つがずれて全コミットが止まる事故を防ぐ。
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
STAMP_FILE="$ROOT/.claude/review-stamp"

hash_staged() {
  git -C "$ROOT" diff --cached | shasum -a 256 | awk '{print $1}'
}

case "${1:-}" in
  hash) hash_staged ;;
  write) hash_staged > "$STAMP_FILE" ;;
  read) cat "$STAMP_FILE" 2>/dev/null || true ;;
  *) echo "usage: review-stamp.sh hash|write|read" >&2; exit 1 ;;
esac
