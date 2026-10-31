import { expect } from 'vitest';

import { parseAlg } from '@/lib/alg/parse';
import { cubingAlgOrThrow } from '@/lib/cube/alg.fixtures';
import { applyAlg, isSolved } from '@/lib/cube/kpuzzle';
import { caseStartState, topViewOf } from '@/lib/cube/view';
import type { TopView } from '@/lib/figure/view';

// プリセット (PLL / OLL / F2L) が共通で満たすこと。テストの名前 (1テスト1事実) は呼ぶ側に置き、本体だけを共有する

export function expectStandardAlgReadable(standardAlg: string): void {
  expect(parseAlg(standardAlg).ok).toBe(true);
}

export function expectViewShape(view: TopView): void {
  expect(view.u).toHaveLength(9);
  for (const side of [view.f, view.r, view.b, view.l]) {
    expect(side).toHaveLength(3);
  }
}

export async function expectStandardAlgSolves(standardAlg: string): Promise<void> {
  const alg = cubingAlgOrThrow(standardAlg);
  expect(isSolved(applyAlg(await caseStartState(alg), alg))).toBe(true);
}

// 図はAUFを正規化した向きで持つので、上面を0〜3回まわしたどれかと一致すればよい
export async function expectViewMatchesStandardAlg(standardAlg: string, view: TopView): Promise<void> {
  const start = await caseStartState(cubingAlgOrThrow(standardAlg));
  const views = ['', 'U', 'U2', "U'"].map((turn) => topViewOf(applyAlg(start, turn)));
  expect(views).toContainEqual(view);
}
