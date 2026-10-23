import { describe, expect, it } from 'vitest';

import { applyAlg, solvedState } from './kpuzzle';
import { cubeViewOf, pairMaskOf } from './view';

const ALL_Y = ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'];
const ALL_G = ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'];
const ALL_O = ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'];

describe('cubeViewOf', () => {
  it('黄上に持ち替えた揃った状態は上が黄・前が緑・右が橙', async () => {
    const state = applyAlg(await solvedState(), 'z2');
    expect(cubeViewOf(state)).toEqual({ u: ALL_Y, f: ALL_G, r: ALL_O });
  });

  it('全体が y で回っていても、前の中心が緑になるよう色を付け替えて同じ図になる', async () => {
    const state = applyAlg(await solvedState(), 'z2');
    expect(cubeViewOf(applyAlg(state, 'y'))).toEqual(cubeViewOf(state));
    expect(cubeViewOf(applyAlg(state, "y'"))).toEqual(cubeViewOf(state));
  });

  it('右面は左の列が前 (R を回すと前面の右の列が上面の右の列へ移る)', async () => {
    const state = applyAlg(applyAlg(await solvedState(), 'z2'), 'R');
    const view = cubeViewOf(state);
    expect([view.u[2], view.u[5], view.u[8]]).toEqual(['G', 'G', 'G']);
    expect(view.r).toEqual(ALL_O);
  });
});

describe('pairMaskOf', () => {
  it('揃った状態では右前スロットのコーナー 3 枚とエッジ 2 枚のうち、前と右に見える 4 枚', async () => {
    const mask = pairMaskOf(applyAlg(await solvedState(), 'z2'));
    expect(mask.u).toEqual(Array<boolean>(9).fill(false));
    expect(mask.f).toEqual([false, false, false, false, false, true, false, false, true]);
    expect(mask.r).toEqual([false, false, false, true, false, false, true, false, false]);
  });

  it('全体が y で回っていても、色を付け替えた後の右前スロットのパーツを選ぶ', async () => {
    const state = applyAlg(await solvedState(), 'z2');
    expect(pairMaskOf(applyAlg(state, 'y'))).toEqual(pairMaskOf(state));
  });
});
