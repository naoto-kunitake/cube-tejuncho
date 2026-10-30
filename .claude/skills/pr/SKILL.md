---
name: pr
description: ブランチ全体をcode-reviewerで点検し、Critical / Majorを直してから、オーナーのOKを得てpushし、雛形どおりの本文でPRを作る。チェックリストはオーナーにしか確かめられないことだけにする。
---

## 状況

- ブランチ: !`git branch --show-current`
- 状態: !`git status --short`
- mainに入っていないコミット: !`git log --oneline main..HEAD`
- 変更したファイル (分岐点からの差): !`git diff --stat main...HEAD`
- pushの状況: !`git rev-parse --verify -q "origin/$(git branch --show-current)" >/dev/null && echo "push済み (originにある)" || echo "未push"`
- 雛形: @.github/pull_request_template.md

## 手順

1. ブランチが`main`なら止める。未コミットの変更や未追跡のファイルがあれば止めて`/commit`を促す
2. ブランチ全体のレビュー: Agentツールで`code-reviewer`を実行する。対象は、未pushなら`git diff main...HEAD`。push済みで、かつ前回のpushからmainが動いていない (`git merge-base main HEAD`が`git merge-base main origin/<ブランチ>`と同じ) なら、前回のpush以降`git diff origin/<ブランチ>...HEAD`だけでよい。mainが動いていれば全体`git diff main...HEAD`を見る (印は常に全体のハッシュなので、増分で済ませられる条件を満たさないなら全体に戻す)。各コミットは`/commit`で点検済みなので、指示は「コミットをまたぐ整合」(設定どうし、設定と実装の前提、文書と実態の一致) に絞る。設定や文書だけの差分でも省略しない
3. CriticalとMajorを直す。未pushなら該当コミットに吸収する (`git commit --fixup=<sha>`のあと`git rebase --autosquash main`。最後のコミットなら`--amend`)。push済みなら`/commit`で新しいコミットを積む。どちらも`.ts` `.tsx` `.css`を含むなら先に`bash .claude/scripts/review-stamp.sh write`を書く (コミット前のフックが照合する)。Minorはオーナーに伝えるだけ。再レビューはしない
4. 印を書く: `bash .claude/scripts/review-stamp.sh write-branch` (フックがpushの前に照合する。印の書き込みとpushは別のコマンドにする)
5. レビューの結果と直した内容をオーナーに報告し、pushのOKを待つ。pushは外に出る操作なので、オーナーが差分を見てから出す
6. `git push -u origin <ブランチ>`でpushする
7. 本文を書き、`gh pr create --title "..." --body-file - <<'EOF' ... EOF`の形で1回実行する (フックはこの形からだけ本文を読む。終端語はEOF。`$(cat ...)`のコマンド置換は使わない)
8. 作ったPRのURLを示す

## 題

コミットの要約と同じ規則 (`/commit`を参照)。PRの主な目的の型を選ぶ。

## 本文

雛形の5項目のうち、目的・変更は必須。実装の要点・チェックリスト・スクリーンショットは要るときだけ残し、使わなければ見出しごと消す。

- 目的: なぜこのPRか。困りごとや仕事を利用者の言葉で
- 変更: 利用者から見て何が変わるか。箇条書き。変わらなければ「見た目・挙動の変更なし」
- 実装の要点: 差分の読み方の案内 (一見おかしく見える意図、どこから読むか)。Claudeが手元で確かめたこと (コマンドの通過、URLで画面が出る、テストの結果) はここに「確認済み」として書く
- チェックリスト: このPRをマージする前に、オーナーにしか確かめられないことだけを`- [ ]`で列挙する。実機の見た目や操作感、iPhoneのSafari、オーナーの判断が要る点、データの安全。Claudeが自分で確かめたこと、マージ後や次のPRで分かることは書かない。1つもなければ見出しごと消す。項目は変更から導き、「画面: 操作 → 期待する結果」の形で具体的に書く。目安は2〜5項目。次の観点の抜けを確かめる: 狭い幅 (320)、ダーク、戻る操作、保存して読み直す、オフライン。10項目を超えたらPRが大きすぎる
- スクリーンショット: UIが変わるときだけ。前後を並べる

書かないもの: 差分の説明、コミットの一覧、理由の再掲 (コミット本文にある)、挨拶、担当のないTODO。相談が残っていれば末尾に書く。

```
gh pr create --title "feat: 一覧にグリッドとリストの表示切り替えを追加" --body-file - <<'EOF'
## 目的

...

## 変更

- ...

## チェックリスト

- [ ] 一覧 (iPhone): 右上のボタンを押す → リスト表示に切り替わり、もう一度押すとグリッドに戻る
- [ ] 一覧 (320幅): リスト表示で手順が折り返し、横スクロールが出ない
EOF
```
