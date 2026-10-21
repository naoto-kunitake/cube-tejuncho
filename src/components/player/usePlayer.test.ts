import { describe, expect, it } from 'vitest';

import type { CurrentMoveInfo } from './twisty';
import { currentIndexOf } from './usePlayer';

function infoOf(partial: Partial<CurrentMoveInfo>): CurrentMoveInfo {
  return { patternIndex: 0, currentMoves: [], movesFinishing: [], movesStarting: [], ...partial };
}

describe('currentIndexOf', () => {
  it('動いている手があればその番号', () => {
    expect(currentIndexOf(infoOf({ patternIndex: 2, currentMoves: [{}] }))).toBe(2);
  });

  it('止まった直後の手があればその番号', () => {
    expect(currentIndexOf(infoOf({ patternIndex: 2, movesFinishing: [{}] }))).toBe(2);
  });

  it('次の手が始まる直前は 1 つ前の番号', () => {
    expect(currentIndexOf(infoOf({ patternIndex: 1, movesStarting: [{}] }))).toBe(0);
  });

  it('先頭で何も動いていなければ強調しない', () => {
    expect(currentIndexOf(infoOf({ patternIndex: 0, movesStarting: [{}] }))).toBeNull();
  });

  it('何も動いていなければ強調しない', () => {
    expect(currentIndexOf(infoOf({}))).toBeNull();
  });
});
