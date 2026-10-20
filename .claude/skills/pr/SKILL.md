---
name: pr
description: ブランチ全体を code-reviewer で点検し、Critical / Major を直してから、持ち主の OK を得て push し、雛形どおりの本文で PR を作る。チェックリストは持ち主にしか確かめられないことだけにする。
---

## 状況

- ブランチ: !`git branch --show-current`
- 状態: !`git status --short`
- main に入っていないコミット: !`git log --oneline main..HEAD`
- 変更したファイル (分岐点からの差): !`git diff --stat main...HEAD`
- push の状況: !`git rev-parse --verify -q "origin/$(git branch --show-current)" >/dev/null && echo "push 済み (origin にある)" || echo "未 push"`
- 雛形: @.github/pull_request_template.md

## 手順

1. ブランチが `main` なら止める。未コミットの変更や未追跡のファイルがあれば止めて `/commit` を促す
2. ブランチ全体のレビュー: Agent ツールで `code-reviewer` を実行する。対象は、未 push なら `git diff main...HEAD`。push 済みで、かつ前回の push から main が動いていない (`git merge-base main HEAD` が `git merge-base main origin/<ブランチ>` と同じ) なら、前回の push 以降 `git diff origin/<ブランチ>...HEAD` だけでよい。main が動いていれば全体 `git diff main...HEAD` を見る (印は常に全体のハッシュなので、増分で済ませられる条件を満たさないなら全体に戻す)。各コミットは `/commit` で点検済みなので、指示は「コミットをまたぐ整合」(設定どうし、設定と実装の前提、文書と実態の一致) に絞る。設定や文書だけの差分でも省略しない
3. Critical と Major を直す。未 push なら該当コミットに吸収する (`git commit --fixup=<sha>` のあと `git rebase --autosquash main`。最後のコミットなら `--amend`)。push 済みなら `/commit` で新しいコミットを積む。どちらも `.ts` `.tsx` `.css` を含むなら先に `bash .claude/scripts/review-stamp.sh write` を書く (コミット前のフックが照合する)。Minor は持ち主に伝えるだけ。再レビューはしない
4. 印を書く: `bash .claude/scripts/review-stamp.sh write-branch` (フックが push の前に照合する。印の書き込みと push は別のコマンドにする)
5. レビューの結果と直した内容を持ち主に報告し、push の OK を待つ。push は外に出る操作なので、持ち主が差分を見てから出す
6. `git push -u origin <ブランチ>` で push する
7. 本文を書き、`gh pr create --title "..." --body-file - <<'EOF' ... EOF` の形で 1 回実行する (フックはこの形からだけ本文を読む。終端語は EOF。`$(cat ...)` のコマンド置換は使わない)
8. 作った PR の URL を示す

## 題

コミットの要約と同じ規則 (`/commit` を参照)。PR の主な目的の型を選ぶ。

## 本文

雛形の 5 項目のうち、目的・変更・チェックリストは必須。実装の要点とスクリーンショットは要るときだけ残し、使わなければ見出しごと消す。

- 目的: なぜこの PR か。困りごとや仕事を利用者の言葉で
- 変更: 利用者から見て何が変わるか。箇条書き。変わらなければ「見た目・挙動の変更なし」
- 実装の要点: 差分の読み方の案内 (一見おかしく見える意図、どこから読むか)。Claude が手元で確かめたこと (コマンドの通過、URL で画面が出る、テストの結果) はここに「確認済み」として書く
- チェックリスト: 持ち主にしか確かめられないことだけを `- [ ]` で列挙する。実機の見た目や操作感、iPhone の Safari、本人の判断が要る点、データの安全。Claude が自分で確かめたことは書かない。項目は変更から導き、「画面: 操作 → 期待する結果」の形で具体的に書く。目安は 2〜5 項目。次の観点の抜けを確かめる: 狭い幅 (320)、ダーク、戻る操作、保存して読み直す、オフライン。10 項目を超えたら PR が大きすぎる
- スクリーンショット: UI が変わるときだけ。前後を並べる

書かないもの: 差分の説明、コミットの一覧、理由の再掲 (コミット本文にある)、挨拶、持ち主のいない TODO。相談が残っていれば末尾に書く。

```
gh pr create --title "feat: 一覧にグリッドとリストの表示切り替えを追加" --body-file - <<'EOF'
## 目的

...

## 変更

- ...

## チェックリスト

- [ ] 一覧 (iPhone): 右上のボタンを押す → リスト表示に切り替わり、もう一度押すとグリッドに戻る
- [ ] 一覧 (320 幅): リスト表示で手順が折り返し、横スクロールが出ない
EOF
```
