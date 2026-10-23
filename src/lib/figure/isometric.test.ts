import { describe, expect, it } from 'vitest';

import { ISOMETRIC_STICKERS } from './isometric';

function coordinates(points: string): number[] {
  return points.split(/[ ,]/).map(Number);
}

describe('ISOMETRIC_STICKERS', () => {
  it('3 面 × 9 枚で、面ごとの添字は 0〜8 が 1 回ずつ', () => {
    expect(ISOMETRIC_STICKERS).toHaveLength(27);
    for (const face of ['u', 'f', 'r'] as const) {
      const indexes = ISOMETRIC_STICKERS.filter((sticker) => sticker.face === face).map((sticker) => sticker.index);
      expect([...indexes].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    }
  });

  it('すべての頂点が viewBox 86 の外側 4 を空けた内側に収まる', () => {
    for (const sticker of ISOMETRIC_STICKERS) {
      for (const value of coordinates(sticker.points)) {
        expect(value).toBeGreaterThanOrEqual(4);
        expect(value).toBeLessThanOrEqual(82);
      }
    }
  });

  it('前面は中央より左、右面は中央より右に描かれる', () => {
    const xOf = (points: string) => coordinates(points).filter((_, index) => index % 2 === 0);
    for (const sticker of ISOMETRIC_STICKERS) {
      if (sticker.face === 'f') {
        expect(Math.max(...xOf(sticker.points))).toBeLessThanOrEqual(43);
      }
      if (sticker.face === 'r') {
        expect(Math.min(...xOf(sticker.points))).toBeGreaterThanOrEqual(43);
      }
    }
  });
});
