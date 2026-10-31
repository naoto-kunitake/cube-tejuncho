import { describe, expect, it } from 'vitest';

import { moveFigureView } from './move';
import type { CubeFigureView, ViewSettings } from './view';

const YELLOW_GREEN: ViewSettings = { topColor: 'yellow', frontColor: 'green' };

function coloredIndices(view: CubeFigureView): Record<'u' | 'f' | 'r', number[]> {
  const indicesOf = (face: readonly string[]) => face.flatMap((color, index) => (color === 'N' ? [] : [index]));
  return { u: indicesOf(view.u), f: indicesOf(view.f), r: indicesOf(view.r) };
}

describe('moveFigureView', () => {
  it('R は右面の全部と、上面・前面の右の列が動く', () => {
    expect(coloredIndices(moveFigureView({ base: 'R', isWide: false }, YELLOW_GREEN))).toEqual({
      u: [2, 5, 8],
      f: [2, 5, 8],
      r: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    });
  });

  it('F は前面の全部と、上面の前の行、右面の前の列が動く', () => {
    expect(coloredIndices(moveFigureView({ base: 'F', isWide: false }, YELLOW_GREEN))).toEqual({
      u: [6, 7, 8],
      f: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      r: [0, 3, 6],
    });
  });

  it('B は見えない面なので、上面の後ろの行と右面の後ろの列だけ動く', () => {
    expect(coloredIndices(moveFigureView({ base: 'B', isWide: false }, YELLOW_GREEN))).toEqual({
      u: [0, 1, 2],
      f: [],
      r: [2, 5, 8],
    });
  });

  it('r (2 層回し) は R に中層 M を足した層が動く', () => {
    expect(coloredIndices(moveFigureView({ base: 'R', isWide: true }, YELLOW_GREEN))).toEqual({
      u: [1, 2, 4, 5, 7, 8],
      f: [1, 2, 4, 5, 7, 8],
      r: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    });
  });

  it('持ち替え (x) は全部の面が動く', () => {
    const view = moveFigureView({ base: 'x', isWide: false }, YELLOW_GREEN);
    expect(view.u.every((color) => color === 'Y')).toBe(true);
    expect(view.f.every((color) => color === 'G')).toBe(true);
    expect(view.r.every((color) => color === 'O')).toBe(true);
  });

  it('上面と前面の色の設定に合わせて色が置き換わる', () => {
    const view = moveFigureView({ base: 'x', isWide: false }, { topColor: 'white', frontColor: 'red' });
    expect(view.u[0]).toBe('W');
    expect(view.f[0]).toBe('R');
    // 白上では側面の並びが 前G → 右R → 後B → 左Oなので、赤を前にすると右は青
    expect(view.r[0]).toBe('B');
  });
});
