# CLAUDE.md

キューブ手順帳 (3x3 のスピードキューブの手順を、自分の判断と覚え方ごと図で残す手順帳) の作業規則。
規約の本文は `.claude/skills/` に置き、ここには要点と参照だけを書く。同じ規則を 2 か所に書かない。
用語表と文言の規則だけは、特定のファイルに紐づかず常に要るのでここに置く。

## 原則

- 推測ではなく根拠で動く。分からないことは調べるか聞く
- 読んでいないファイルは編集しない
- 正確さを速さより優先する。警告を抑える前に自分の入力を疑う
- 同意ではなく対話を選ぶ。提案に異論があれば理由つきで言う
- 秘密情報 (トークン、鍵) をコードにも設定にも書かない

## 製品の要点

- 利用者は 3x3 を練習する人。最優先の場面は参照 (「あれどう回すんだっけ」を 3 秒で解く)
- プリセットは PLL 21 / OLL 57 / F2L 41 とその基本手順。利用者は手順・判断・覚え方・指使いを登録する
- 保存は端末内 (localStorage の 1 文書 + 編集中の下書き) と JSON の書き出し / 読み込み。ログインも計測もない
- 見た目の正はトークン (`src/app/tokens.css`) と既存の画面。色・文字の大きさ・余白を新しく決めず、既存に揃える

## 作業の流れ

- GitHub flow。`main` は常に配信できる状態。1 タスク = 1 ブランチ = 1 PR
- ブランチ名は `feat/` `fix/` `chore/` + 短い英語の要約 (kebab-case)。要約のない `feat` のような名前は作らない (`feat/xxx` と共存できない)
- コミットは `/commit` で作る (レビューとメッセージの規則はそこにある)。`git commit` を直接打たない
- push と PR 作成は `/pr` で行う (ブランチ全体のレビューと本文の規則はそこにある)。push は持ち主の OK を得てから
- マージは持ち主が行う。CI が通り、チェックリストを実機で確認してからマージされる

## PR を開く前に満たすこと

- CI が通る (型、lint、整形、テスト、ビルド)
- ブランチ全体を code-reviewer で点検し、Critical / Major を直してある (コミット単位のレビューでは、コミットをまたぐ整合が見えない)
- `coding-style` のテストの規則と、`frontend-patterns` の文言とアクセシビリティの規則を満たしている
- 設計の方針を変えたら README の該当行を直してある

## コードの約束

本文は次のスキルが正。該当するファイルを触ると自動で読まれる。

- `coding-style`: TypeScript の書き方、コメント、関数設計、エラーの扱い
- `frontend-patterns`: React、状態 (Zustand)、スタイル (Tailwind v4 + トークン + shadcn)、文言、アクセシビリティ
- `project-structure`: ディレクトリ構成と依存の向き、命名、barrel の扱い

## 用語の対応表

画面の日本語とコードの英語は 1 対 1 にする。同じ概念に別の英語を使わない。

| 日本語 | 英語 | 備考 |
|---|---|---|
| パターン | pattern | 型は `Pattern`。cubing.js の「状態」は `cubeState` (`project-structure` を参照) |
| 手順 | alg | 記録は `AlgEntry { text, mnemonic, fingering }`。保存は原文だけ |
| メイン手順 / ほかの手順 | mainAlg / altAlgs | |
| 判断 | recognition | |
| 覚え方 | mnemonic | |
| 指使い | fingering | |
| カテゴリ | category | プリセットの id は `pll` `oll` `f2l`、自作は UUID |
| 登録 | registration | 登録済みは `isRegistered` |
| 基本手順 | standardAlg | |
| 自作 | custom | `isCustom` |
| ピン留め | pinned | |
| 回転記号 (画面) | notation | 記法の処理は `lib/alg` |
| 2 層回し | wideMove | 表記は `wideStyle: 'r' \| 'Rw'` |
| 持ち替え | rotation | x y z |
| 上面 / 前面の色 | topColor / frontColor | |
| 判断の手がかり (図) | cueFigure | |
| 入れ替えの矢印 | arrows | |
| 図 | figure | `TopFigure` `CubeFigure` `MoveFigure` |
| 再生シート | PlayerSheet | |
| 書き出す / 読み込む | exportData / importData | |
| 外観モード | appearance | `'auto' \| 'light' \| 'dark'` |
| 一覧の表示 | listView | `'grid' \| 'list'` |
| 並び順 | sortOrder | `'shape' \| 'standard'` |

## 文言の規則

- 画面の文は短く、句読点を付けない (確認ダイアログの本文だけ文として句点あり)
- 数と助数詞は詰める (2件、11/21、4つ)。名前 + 番号は空白 (OLL 21、手順 2)
- ボタンは動詞 (削除 / 消す / 閉じる / 破棄 / 登録 / 保存)。「削除」は個々のもの、「消す」は登録データ
- 使わない語: ケース、分類、駒、おすすめ
