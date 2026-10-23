import { describe, expect, it } from 'vitest';

import { describeF2l } from './describe-f2l';
import type { CubeView, PairMask } from './view';

const Y9 = ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'] as const;
const G9 = ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'] as const;
const O9 = ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'] as const;
const NONE = [false, false, false, false, false, false, false, false, false] as const;

function maskWith(indexes: readonly number[]): PairMask['u'] {
  const at = (index: number) => indexes.includes(index);
  return [at(0), at(1), at(2), at(3), at(4), at(5), at(6), at(7), at(8)];
}

const SOLVED: CubeView = { u: Y9, f: G9, r: O9 };

describe('describeF2l', () => {
  it('コーナーもエッジもスロットにあれば両方スロットで、白が下', () => {
    const pair: PairMask = { u: NONE, f: maskWith([5, 8]), r: maskWith([3, 6]) };
    expect(describeF2l(SOLVED, pair)).toEqual({ kind: 'bothInSlot', whiteFacing: 'down' });
  });

  it('スロットのコーナーの白が前面に見えれば白は前', () => {
    const view: CubeView = { ...SOLVED, f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W'] };
    const pair: PairMask = { u: maskWith([8]), f: maskWith([8]), r: maskWith([6]) };
    expect(describeF2l(view, pair)).toEqual({ kind: 'cornerInSlot', whiteFacing: 'front' });
  });

  it('エッジだけスロットで、上面のコーナーの白が上を向いていれば白は上', () => {
    const view: CubeView = { ...SOLVED, u: ['Y', 'Y', 'W', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'] };
    const pair: PairMask = { u: maskWith([2]), f: maskWith([5]), r: maskWith([3]) };
    expect(describeF2l(view, pair)).toEqual({ kind: 'edgeInSlot', isWhiteUp: true });
  });

  it('スロットのコーナーの白が右面に見えれば白は右', () => {
    const view: CubeView = { ...SOLVED, r: ['O', 'O', 'O', 'O', 'O', 'O', 'W', 'O', 'O'] };
    const pair: PairMask = { u: NONE, f: maskWith([8]), r: maskWith([6]) };
    expect(describeF2l(view, pair)).toEqual({ kind: 'cornerInSlot', whiteFacing: 'right' });
  });

  it('エッジだけスロットで、上面のコーナーの白が上を向いていなければ白は横', () => {
    const pair: PairMask = { u: maskWith([2]), f: maskWith([5]), r: maskWith([3]) };
    expect(describeF2l(SOLVED, pair)).toEqual({ kind: 'edgeInSlot', isWhiteUp: false });
  });

  it('両方上面なら位置だけ', () => {
    const pair: PairMask = { u: maskWith([2, 5]), f: maskWith([2]), r: maskWith([0]) };
    expect(describeF2l(SOLVED, pair)).toEqual({ kind: 'bothUp' });
  });
});
