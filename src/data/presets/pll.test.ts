import { describe, expect, it } from 'vitest';

import { parseAlg } from '@/lib/alg/parse';
import { arrowPaths } from '@/lib/figure/arrows';

import { PLL_PRESETS, PLL_SHAPE_ORDER } from './pll';

// ノートの AUF 正規化で確定した置換の型 (位置: 0 UBL 1 UB 2 UBR / 3 UL 4 中央 5 UR / 6 UFL 7 UF 8 UFR)
const EXPECTED_ARROWS: Record<string, [number, number][]> = {
  Ua: [
    [3, 7],
    [7, 5],
    [5, 3],
  ],
  Ub: [
    [3, 5],
    [5, 7],
    [7, 3],
  ],
  H: [
    [1, 7],
    [7, 1],
    [3, 5],
    [5, 3],
  ],
  Z: [
    [1, 3],
    [3, 1],
    [5, 7],
    [7, 5],
  ],
  Aa: [
    [0, 2],
    [2, 8],
    [8, 0],
  ],
  Ab: [
    [0, 8],
    [8, 2],
    [2, 0],
  ],
  E: [
    [0, 6],
    [6, 0],
    [2, 8],
    [8, 2],
  ],
  T: [
    [2, 8],
    [8, 2],
    [3, 5],
    [5, 3],
  ],
  F: [
    [1, 7],
    [7, 1],
    [2, 8],
    [8, 2],
  ],
  Ja: [
    [1, 5],
    [5, 1],
    [2, 8],
    [8, 2],
  ],
  Jb: [
    [3, 7],
    [7, 3],
    [6, 8],
    [8, 6],
  ],
  Ra: [
    [1, 5],
    [5, 1],
    [6, 8],
    [8, 6],
  ],
  Rb: [
    [2, 8],
    [8, 2],
    [3, 7],
    [7, 3],
  ],
  Y: [
    [0, 8],
    [8, 0],
    [1, 3],
    [3, 1],
  ],
  V: [
    [2, 6],
    [6, 2],
    [5, 7],
    [7, 5],
  ],
  Na: [
    [2, 6],
    [6, 2],
    [3, 5],
    [5, 3],
  ],
  Nb: [
    [0, 8],
    [8, 0],
    [3, 5],
    [5, 3],
  ],
  Ga: [
    [0, 6],
    [6, 2],
    [2, 0],
    [3, 5],
    [5, 7],
    [7, 3],
  ],
  Gb: [
    [0, 6],
    [6, 2],
    [2, 0],
    [1, 5],
    [5, 3],
    [3, 1],
  ],
  Gc: [
    [0, 6],
    [6, 2],
    [2, 0],
    [1, 7],
    [7, 3],
    [3, 1],
  ],
  Gd: [
    [0, 6],
    [6, 2],
    [2, 0],
    [1, 5],
    [5, 7],
    [7, 1],
  ],
};

function sortedArrows(arrows: readonly (readonly [number, number])[]): string[] {
  return arrows.map(([from, to]) => `${from}>${to}`).sort();
}

describe('PLL_PRESETS', () => {
  it('21 種ある', () => {
    expect(PLL_PRESETS).toHaveLength(21);
  });

  it('id と名前が重複しない', () => {
    expect(new Set(PLL_PRESETS.map((preset) => preset.id)).size).toBe(21);
    expect(new Set(PLL_PRESETS.map((preset) => preset.name)).size).toBe(21);
  });

  it.each(PLL_PRESETS.map((preset) => [preset.name, preset] as const))('%s の基本手順が読める', (_, preset) => {
    expect(parseAlg(preset.standardAlg).ok).toBe(true);
  });

  it.each(PLL_PRESETS.map((preset) => [preset.name, preset] as const))(
    '%s の矢印が確定した置換の型と一致する',
    (name, preset) => {
      expect(sortedArrows(preset.arrows)).toEqual(sortedArrows(EXPECTED_ARROWS[name] ?? []));
    },
  );

  it.each(PLL_PRESETS.map((preset) => [preset.name, preset] as const))('%s の図は上面 9 と側面 3 ずつ', (_, preset) => {
    expect(preset.view.u).toHaveLength(9);
    for (const side of [preset.view.f, preset.view.r, preset.view.b, preset.view.l]) {
      expect(side).toHaveLength(3);
    }
  });

  it.each(PLL_PRESETS.map((preset) => [preset.name, preset] as const))('%s の矢印は図として描ける', (_, preset) => {
    const paths = arrowPaths(preset.arrows);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((d) => !d.includes('NaN'))).toBe(true);
  });

  it('上面はすべて黄で揃っている', () => {
    for (const preset of PLL_PRESETS) {
      expect(preset.view.u.every((color) => color === 'Y')).toBe(true);
    }
  });

  it('形の分類は並び順の表にあるものだけ', () => {
    for (const preset of PLL_PRESETS) {
      expect(PLL_SHAPE_ORDER).toContain(preset.shape);
    }
  });
});
