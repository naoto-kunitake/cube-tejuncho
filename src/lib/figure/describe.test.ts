import { describe, expect, it } from 'vitest';

import { describeSides } from './describe';
import type { Side, StickerColor, TopView } from './view';

const U: TopView['u'] = ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'];
function viewOf(sides: Record<'f' | 'r' | 'b' | 'l', Side<StickerColor>>): TopView {
  return { u: U, ...sides };
}

describe('describeSides', () => {
  const view = viewOf({ f: ['G', 'G', 'G'], r: ['R', 'G', 'R'], b: ['B', 'B', 'O'], l: ['O', 'R', 'B'] });

  it('3連・ヘッドライト・2連を見分ける', () => {
    expect(describeSides(view).map((entry) => entry.run)).toEqual(['pair', 'bar', 'headlights']);
  });

  it('後ろ → 前 → 左 → 右の順に並べ、揃いのない面は飛ばす', () => {
    expect(describeSides(view).map((entry) => entry.side)).toEqual(['back', 'front', 'right']);
  });

  it('揃いがなければ空', () => {
    const side: Side<StickerColor> = ['R', 'G', 'B'];
    expect(describeSides(viewOf({ f: side, r: side, b: side, l: side }))).toEqual([]);
  });
});
