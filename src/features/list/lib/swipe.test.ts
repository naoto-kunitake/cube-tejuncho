import { describe, expect, it } from 'vitest';

import { neighborOf, SWIPE_MIN_DISTANCE, swipeDirectionOf } from './swipe';

describe('swipeDirectionOf', () => {
  it('左に十分動けばleft', () => {
    expect(swipeDirectionOf(-SWIPE_MIN_DISTANCE, 0)).toBe('left');
  });

  it('右に十分動けばright', () => {
    expect(swipeDirectionOf(SWIPE_MIN_DISTANCE, 10)).toBe('right');
  });

  it('横の動きが足りなければスワイプではない', () => {
    expect(swipeDirectionOf(SWIPE_MIN_DISTANCE - 1, 0)).toBeNull();
  });

  it('横と縦の動きが同じ長さならスワイプではない', () => {
    expect(swipeDirectionOf(SWIPE_MIN_DISTANCE, SWIPE_MIN_DISTANCE)).toBeNull();
  });

  it('縦の動きの方が長ければスワイプではない', () => {
    expect(swipeDirectionOf(-60, 80)).toBeNull();
  });
});

describe('neighborOf', () => {
  const tabs = ['pll', 'oll', 'f2l'];

  it('左に流すと右隣へ移る', () => {
    expect(neighborOf(tabs, 'pll', 'left')).toBe('oll');
  });

  it('右に流すと左隣へ移る', () => {
    expect(neighborOf(tabs, 'f2l', 'right')).toBe('oll');
  });

  it('右端から左へは回り込まず止まる', () => {
    expect(neighborOf(tabs, 'f2l', 'left')).toBeNull();
  });

  it('左端から右へは回り込まず止まる', () => {
    expect(neighborOf(tabs, 'pll', 'right')).toBeNull();
  });

  it('現在のタブが一覧になければ移らない', () => {
    expect(neighborOf(tabs, 'coll', 'left')).toBeNull();
  });
});
