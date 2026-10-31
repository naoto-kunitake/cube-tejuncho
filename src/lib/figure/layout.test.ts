import { describe, expect, it } from 'vitest';

import { cellPosition, FIGURE_LAYOUT, SIDE_FAR, SIDE_NEAR } from './layout';

const [originX, originY, width, height] = FIGURE_LAYOUT.viewBox.split(' ').map(Number);
const contentStart = SIDE_NEAR;
const contentEnd = SIDE_FAR + FIGURE_LAYOUT.sideThickness;

describe('FIGURE_LAYOUT', () => {
  it('側面の帯の外周は viewBox 86 の外側 4 を空けた 78 に収まる', () => {
    expect(contentEnd - contentStart).toBeCloseTo(78);
    expect(contentStart - Number(originX)).toBeCloseTo(4);
    expect(Number(originX) + Number(width) - contentEnd).toBeCloseTo(4);
  });

  // 空きが左右で違うと、描く幅に応じて図が1pxほど寄って見える
  it('中身は viewBox の中央に来る', () => {
    expect(contentStart - Number(originX)).toBeCloseTo(Number(originX) + Number(width) - contentEnd);
    expect(contentStart - Number(originY)).toBeCloseTo(Number(originY) + Number(height) - contentEnd);
  });

  it('3 つのマスは帯との間を空き 3 で挟んで並ぶ', () => {
    expect(cellPosition(0) - (SIDE_NEAR + FIGURE_LAYOUT.sideThickness)).toBeCloseTo(FIGURE_LAYOUT.sideOffset);
    expect(SIDE_FAR - (cellPosition(2) + FIGURE_LAYOUT.cell)).toBeCloseTo(FIGURE_LAYOUT.sideOffset);
  });
});
