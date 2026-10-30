---
name: frontend-patterns
description: Reactの部品、状態 (Zustand)、保存、スタイル (Tailwind v4 + トークン + shadcn)、文言、アクセシビリティの規約。画面や部品を作る・直す・レビューするときの判断基準。
when_to_use: .tsxを書く・編集する・レビューするとき。状態をどこに置くか、useMemoを書きたくなったとき、クラスに生の値を書きたくなったとき、日本語の文言を部品に書きたくなったとき、新しい操作部品を作るとき。
paths:
  - "src/**/*.tsx"
  - "src/app/**/*.css"
  - "src/copy.ts"
  - "src/data/**/*.ts"
---

# frontend-patterns

Reactと見た目の規約。コードの一般的な書き方は`coding-style`、ファイルの置き場所は`project-structure`を見る。

## React

- React Compilerが有効。`useMemo` `useCallback` `React.memo`を書かない。再描画の問題は状態の設計で直す
- 部品の中で部品を定義しない。Contextのvalueを描画ごとに作らない
- `useEffect`でstateを同期しない。派生値は描画の中で計算する
- 状態は必要な部品の近くに置く。複数の画面が使う状態だけストアに上げる
- 遅延読み込みは重い部品 (cubing.jsの3D) だけ。`React.lazy`はdefault exportを求めるので、`import('./PlayerSheet').then((m) => ({ default: m.PlayerSheet }))`の形で名前つきexportを包む

## 状態と保存

- 正本は1つの文書 (`Document`) で、Zustandの1ストア + persistに持つ。状態ライブラリはこれ以外に入れない
- 文書に入るもの: 登録、自作のパターン、カテゴリ、設定、一覧の表示、案内を閉じたタブ、最後に開いたタブ。入らないもの (開いているシート、再生の位置、スクロール位置) は`partialize`で除く
- 変更はストアのactionを通す。部品から文書を直接書き換えない。保存はactionごとに即時
- localStorageへのアクセスは`data/storage.ts`の包みだけが行い、persistには`createJSONStorage(() => storage)`でその包みを渡す。鍵は`cube-tejuncho:`で始める。利用できないときはメモリで動かし、1回だけ知らせる
- 読み込みは`migrate`の連鎖 → Zodの検証。壊れた文書は退避して空で起動する。保存前の文書を1世代残す
- 破壊的な操作は実行前の文書を控え、トーストの「元に戻す」で丸ごと戻す
- 編集の下書きはパターンごとの鍵に300msのdebounceで保存し、保存か破棄で消す
- 書き出すJSONは文書そのもの。読み込みは同じZodで検証してから「追加 / 置き換え」を適用する

## URL

- 詳細は`/p/:id`、編集は`/p/:id/edit`、新規は`/p/new`
- 一覧のカテゴリは`/?category=oll`の検索パラメータ。切り替えは`replace`で履歴を増やさない
- 下書きや開いているシートをURLに持たない

## スタイル

- トークンは`src/app/tokens.css`の`@theme`とCSS変数が正。ライトは`:root`、ダークは`.dark`
- 見た目はユーティリティクラスで書く。クラスの結合は`cn()`、見た目の種類 (大きさ・塗り) は`cva`
- 生の値 (`text-[13px]`、`#333`、`mt-[7px]`) を書かない。トークンにない値が要るときは、まずトークンを疑う
- 文字の大きさは型スケールのクラス (`text-title` 20 / `text-alg` 24 / `text-alg-compact` 17 / `text-input` 16 / `text-body` 15 / `text-small` 14 / `text-label` 13 / `text-caption` 12) だけを使う
- 余白は4の刻みで、基本は8の倍数 (区画の間24、バーの下16、見出し → 内容8、タイルの間8)。カードの中12と行の高さ52は決めた例外で、他に例外を増やさない
- hoverは`hover:` (v4ではhoverできる端末だけに効く)。focusは`focus-visible:`だけ
- CSS-in-JSと部品ごとのCSSファイルを作らない。図のSVGだけはインラインの`style`で色変数を参照する
- shadcnの部品はコピー後にトークンと型スケールに合わせて直し、以後はshadcnの更新で上書きしない

## 文言

- 画面に出る日本語はすべて`src/copy.ts`から取る。部品に日本語を直接書かない (ESLintが止める)
- 数や名前が入る文言は関数にする。語順を部品側で組み立てない
- 鍵は役割の名前 (`play`、`writeRecognition`)。文面を変えても鍵は変えない
- 文言の規則と用語はCLAUDE.mdが正 (ここには書かない)

## アクセシビリティ

- 操作できる要素は`button` / `a` / 入力部品で作る。`div`にonClickを付けない
- アイコンだけのボタンには読み上げ名を付ける (`copy.a11y`から)。切り替えボタンの名前は操作 (「リスト表示にする」)
- シートは`role="dialog"`、確認は`alertdialog`、スイッチは`role="switch"`、セグメントは`aria-pressed`。shadcn (Radix) の部品は内蔵しているので、自作の部品 (タブ、タイル、キーパッド、再生の操作列) にだけ自分で付ける
- タップ領域は44px以上。見た目36pxの部品は疑似要素で広げる
- フォーカスは`focus-visible`で見える (黒4px + 黄2px、ダークは白 + 黄)。見た目の値は変えない
- 図は`role="img"`と名前、装飾は`aria-hidden`。色だけで状態を伝えない
- 個別の判断が要る場面はオーナーに相談する
