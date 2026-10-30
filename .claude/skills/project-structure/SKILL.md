---
name: project-structure
description: ディレクトリ構成、依存の向き、公開の境界 (barrel)、ファイルの置き場所の規約。ファイルを作る・移す・分けるときと、構造のレビューの判断基準。
when_to_use: src/にファイルを作る・移す・名前を変えるとき。「どこに置くか」「共有に上げるか」「index.tsに何を出すか」のような判断が出たとき。
paths:
  - "src/**"
---

# project-structure

機能 (画面) で束ね、依存は共有 → 機能 → アプリの一方向にする。bulletproof-reactの型を、この規模に合わせて層を最小にしたもの。

## 構成

```
src/
  app/          起動、ルーティング、providers、PWAの登録、tokens.css
  features/     画面ごと: list/ detail/ edit/ settings/ notation/
                各featureはcomponents/とhooks/を持ち、外にはindex.tsだけを公開する
  components/   2つ以上の画面が使うUI。ui/ (shadcnのコピー)、figures/ (図のSVG)、再生シート、確認ダイアログ、トースト
  lib/          純粋なTypeScript: alg/ (正規化・検証・逆手順)、cube/ (cubing.jsの包み)、figure/ (色の決定)、sort/、result.ts
  data/         保存文書 (Zod)、storage、移行、書き出し / 読み込み、presets/ (PLL / OLL / F2Lと基本手順)
  copy.ts       画面の文言
```

pages / widgets / entitiesのような層は作らない。必要になったときに足す。

## 依存の向き

- `lib` → `data` → `components` → `features` → `app`の鎖で、左は右をimportしない。逆向きのimportはESLintが止める
- `lib`はReact、DOM、localStorage、cubing.jsの3Dに依存しない (cubing.jsの計算は`lib/cube`だけが使う)
- feature同士はimportしない。両方が使うものは`components`か`lib`へ移す
- `app`は何でも使ってよいが、ロジックを持たない (配線だけ)

## 置き場所の判断

- 1つの画面だけが使う部品やhookは、そのfeatureの中に置く
- 2つ以上の画面が使うようになった時点で`components` (UI) か`lib` (純粋なロジック) へ移す。先回りで移さない
- 再生シート、確認ダイアログ、トーストは最初から`components` (詳細と回転記号、全画面が使う)
- キーパッドは`features/edit`の中で始める。2か所目が出たら移す
- cubing.jsの「状態」(KPattern) を扱うコードは`lib/cube`の中に閉じ込め、外には`cubeState`の語で出す

## 公開の境界

- barrel (`index.ts`) はfeatureの境界だけ。`components`や`lib`の中には作らない
- featureの`index.ts`が公開するのは画面の部品1つと、appが配線に使う最小限。内部の部品やhookは出さない

## ファイル

- Reactの部品は`PascalCase.tsx`、それ以外は`kebab-case.ts`。テストは対象の隣に`*.test.ts`
- `components/ui/`はshadcnが生成した名前のまま
- 1ファイル1つの主題。200〜400行を目安にし、超えたら責務の境界で分ける
