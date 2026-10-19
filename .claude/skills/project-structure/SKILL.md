---
name: project-structure
description: ディレクトリ構成、依存の向き、公開の境界 (barrel)、ファイルの置き場所の規約。ファイルを作る・移す・分けるときと、構造のレビューの判断基準。
when_to_use: src/ にファイルを作る・移す・名前を変えるとき。「どこに置くか」「共有に上げるか」「index.ts に何を出すか」のような判断が出たとき。
paths:
  - "src/**"
---

# project-structure

機能 (画面) で束ね、依存は共有 → 機能 → アプリの一方向にする。bulletproof-react の型を、この規模に合わせて層を最小にしたもの。

## 構成

```
src/
  app/          起動、ルーティング、providers、PWA の登録、tokens.css
  features/     画面ごと: list/ detail/ edit/ settings/ notation/
                各 feature は components/ hooks/ を持ち、外には index.ts だけを公開する
  components/   2 つ以上の画面が使う UI。ui/ (shadcn のコピー)、figures/ (図の SVG)、再生シート、確認ダイアログ、トースト
  lib/          純粋な TypeScript: alg/ (正規化・検証・逆手順)、cube/ (cubing.js の包み)、figure/ (色の決定)、sort/、result.ts
  data/         保存文書 (Zod)、storage、移行、書き出し / 読み込み、presets/ (PLL / OLL / F2L と基本手順)
  copy.ts       画面の文言
```

pages / widgets / entities のような層は作らない。必要になったときに足す。

## 依存の向き

- `lib` → `data` → `components` → `features` → `app` の鎖で、左は右を import しない。逆向きの import は ESLint が止める
- `lib` は React、DOM、localStorage、cubing.js の 3D に依存しない (cubing.js の計算は `lib/cube` だけが使う)
- feature 同士は import しない。両方が使うものは `components` か `lib` へ移す
- `app` は何でも使ってよいが、ロジックを持たない (配線だけ)

## 置き場所の判断

- 1 つの画面だけが使う部品や hook は、その feature の中に置く
- 2 つ以上の画面が使うようになった時点で `components` (UI) か `lib` (純粋なロジック) へ移す。先回りで移さない
- 再生シート、確認ダイアログ、トーストは最初から `components` (詳細と回転記号、全画面が使う)
- キーパッドは `features/edit` の中で始める。2 か所目が出たら移す
- cubing.js の「状態」(KPattern) を扱うコードは `lib/cube` の中に閉じ込め、外には `cubeState` の語で出す

## 公開の境界

- barrel (`index.ts`) は feature の境界だけ。`components` や `lib` の中には作らない
- feature の `index.ts` が公開するのは画面の部品 1 つと、app が配線に使う最小限。内部の部品や hook は出さない

## ファイル

- React の部品は `PascalCase.tsx`、それ以外は `kebab-case.ts`。テストは対象の隣に `*.test.ts`
- `components/ui/` は shadcn が生成した名前のまま
- 1 ファイル 1 つの主題。200〜400 行を目安にし、超えたら責務の境界で分ける
