---
name: commit
description: ステージ済みの変更をcode-reviewerで点検し、Critical / Majorを直してから、規則どおりのメッセージで1コミットを作る。
---

## 状況

- ブランチ: !`git branch --show-current`
- 状態: !`git status --short`
- ステージ済みの差分: !`git diff --cached --stat`
- 直近のコミット: !`git log --oneline -5`

## 手順

1. ブランチが`main`なら止め、作業ブランチを切るよう伝える
2. ステージが空なら、変更の中から1つの意味のまとまりだけを`git add`する。`git add -A`と`git commit -a`は使わない
3. ステージ済みに`.ts` `.tsx` `.css`が含まれるなら、Agentツールで`code-reviewer`を実行する (対象はステージ済みの差分)。CriticalとMajorを直して再ステージし、Minorはオーナーに伝えるだけにする。再レビューはしない (指摘と修正の往復を1回で終える)。含まれないなら省略する。次も省略してよい: 直前の`code-reviewer`の指摘に対して、提示された直したコードを変更を加えずに適用するだけの差分、識別子の変更やimportの並び替えだけで処理や公開する型を変えない機械的な小修正。挙動が変わる直しは省略しない
4. 3でレビューしたなら印を書く: `bash .claude/scripts/review-stamp.sh write` (フックがコミット前に照合する)。3を省略したなら4も省略する
5. 次の規則でメッセージを作り、`git commit --trailer "Co-Authored-By: Claude <noreply@anthropic.com>" -F - <<'EOF'`の形で1回だけコミットする (`$(cat ...)`のコマンド置換は使わない。許可の自動判定から外れる)。印の書き込みとコミットは別のコマンドで実行する (フックはコマンドの実行前に照合するので、同じコマンドに入れると止まる)。直前のコミットの直し忘れは、push前なら`--amend`で足してよい (push後はフックが止める)

## メッセージの規則

- 1行目: `型: 要約`。型はfeat / fix / refactor / test / docs / style / chore / ci。範囲は付けない (画面ごとの機能なので要約が対象を含む)
- 要約: 対象 + 変化を1つだけ。日本語の言い切り (追加 / 変更 / 修正 / 外す / 揃える)、句点なし、全角50字以内。対象から書き始める。「修正」「調整」「対応」だけの要約、英語の動詞、WIPは書かない
- 本文: 「なぜ」だけ。退けた案とその理由、参照した基準、計測値。挙動が変わるなら1行、制約があれば1行。1文1行、2〜5行。差分の説明 (ファイル名・関数名の列挙)、経緯、感想、将来のTODOは書かない。理由が自明なら本文なし (feat / fixは原則あり)
- フッターにIssueを書かない。Co-Authored-Byは`--trailer`で付ける (settingsのattributionは`-F -`の形では効かない)

```
git commit --trailer "Co-Authored-By: Claude <noreply@anthropic.com>" -F - <<'EOF'
feat: 一覧にグリッドとリストの表示切り替えを追加

識別したいときはグリッド、読み返したいときはリストと練習中に行き来するので、
設定ではなく一覧の右上に置く (ドライブ・Keepと同じ)。
列数は幅から決め、設定にしない。
EOF
```

6. `git log --oneline -1`で作ったコミットを示す
