import { describe, expect, it } from 'vitest';

import { arrowPaths } from './arrows';

describe('arrowPaths', () => {
  it('3 巡は 3 本の矢印になる', () => {
    expect(
      arrowPaths([
        [3, 7],
        [5, 3],
        [7, 5],
      ]),
    ).toHaveLength(3);
  });

  it('両向きの入れ替えは 1 本にまとめる', () => {
    expect(
      arrowPaths([
        [2, 8],
        [3, 5],
        [5, 3],
        [8, 2],
      ]),
    ).toHaveLength(2);
  });

  it('閉じた多角形の path を返す', () => {
    const [path] = arrowPaths([[3, 7]]);
    expect(path?.startsWith('M')).toBe(true);
    expect(path?.endsWith('Z')).toBe(true);
  });

  it('矢印がなければ何も返さない', () => {
    expect(arrowPaths([])).toEqual([]);
  });
});
