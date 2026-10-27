import { describe, expect, it } from 'vitest';

import { shiftOf, targetIndexOf } from './reorder';

describe('targetIndexOf', () => {
  it('半分の高さを越えるまでは元の位置のまま', () => {
    expect(targetIndexOf(1, 25, 52, 4)).toBe(1);
    expect(targetIndexOf(1, -25, 52, 4)).toBe(1);
  });

  it('行の高さの分だけ動かすと 1 つ隣になる', () => {
    expect(targetIndexOf(1, 52, 52, 4)).toBe(2);
    expect(targetIndexOf(1, -52, 52, 4)).toBe(0);
  });

  it('一覧の外へ動かしても端で止まる', () => {
    expect(targetIndexOf(3, 500, 52, 4)).toBe(3);
    expect(targetIndexOf(0, -500, 52, 4)).toBe(0);
  });
});

describe('shiftOf', () => {
  it('下へ動かすと、通り過ぎた行が上へずれる', () => {
    expect(shiftOf(1, 0, 2)).toBe(-1);
    expect(shiftOf(2, 0, 2)).toBe(-1);
    expect(shiftOf(3, 0, 2)).toBe(0);
  });

  it('上へ動かすと、通り過ぎた行が下へずれる', () => {
    expect(shiftOf(1, 3, 1)).toBe(1);
    expect(shiftOf(2, 3, 1)).toBe(1);
    expect(shiftOf(0, 3, 1)).toBe(0);
  });

  it('持ち上げた行自身と、動いていないときはずれない', () => {
    expect(shiftOf(2, 2, 2)).toBe(0);
    expect(shiftOf(1, 2, 2)).toBe(0);
  });
});
