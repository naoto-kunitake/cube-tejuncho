---
name: commit
description: ステージ済みの変更を code-reviewer で点検し、Critical / Major を直してから、規則どおりのメッセージで 1 コミットを作る。
---

## 状況

- ブランチ: !`git branch --show-current`
- 状態: !`git status --short`
- ステージ済みの差分: !`git diff --cached --stat`
- 直近のコミット: !`git log --oneline -5`

## 手順

1. ブランチが `main` なら止め、作業ブランチを切るよう伝える
2. ステージが空なら、変更の中から 1 つの意味のまとまりだけを `git add` する。`git add -A` と `git commit -a` は使わない
3. ステージ済みに `.ts` `.tsx` `.css` が含まれるなら、Agent ツールで `code-reviewer` を実行する (対象はステージ済みの差分)。Critical と Major を直して再ステージし、Minor は持ち主に伝えるだけにする。再レビューはしない (指摘と修正の往復を 1 回で終える)。含まれないなら省略する
4. 3 でレビューしたなら印を書く: `bash .claude/scripts/review-stamp.sh write` (フックがコミット前に照合する)。3 を省略したなら 4 も省略する
5. 次の規則でメッセージを作り、`git commit --trailer "Co-Authored-By: Claude <noreply@anthropic.com>" -F - <<'EOF'` の形で 1 回だけコミットする (`$(cat ...)` のコマンド置換は使わない。許可の自動判定から外れる)。印の書き込みとコミットは別のコマンドで実行する (フックはコマンドの実行前に照合するので、同じコマンドに入れると止まる)。直前のコミットの直し忘れは、push 前なら `--amend` で足してよい (push 後はフックが止める)

## メッセージの規則

- 1 行目: `型: 要約`。型は feat / fix / refactor / test / docs / style / chore / ci。範囲は付けない (画面ごとの機能なので要約が対象を含む)
- 要約: 対象 + 変化を 1 つだけ。日本語の言い切り (追加 / 変更 / 修正 / 外す / 揃える)、句点なし、全角 50 字以内。対象から書き始める。「修正」「調整」「対応」だけの要約、英語の動詞、WIP は書かない
- 本文: 「なぜ」だけ。退けた案とその理由、参照した基準、計測値。挙動が変わるなら 1 行、制約があれば 1 行。1 文 1 行、2〜5 行。差分の説明 (ファイル名・関数名の列挙)、経緯、感想、将来の TODO は書かない。理由が自明なら本文なし (feat / fix は原則あり)
- フッターに Issue を書かない。Co-Authored-By は `--trailer` で付ける (settings の attribution は `-F -` の形では効かない)

```
git commit --trailer "Co-Authored-By: Claude <noreply@anthropic.com>" -F - <<'EOF'
feat: 一覧にグリッドとリストの表示切り替えを追加

識別したいときはグリッド、読み返したいときはリストと練習中に行き来するので、
設定ではなく一覧の右上に置く (ドライブ・Keep と同じ)。
列数は幅から決め、設定にしない。
EOF
```

6. `git log --oneline -1` で作ったコミットを示す
