import { describe, expect, it } from 'vitest';

import { parseAlg } from '@/lib/alg/parse';

import { canHighlight, numberItems } from './AlgText';

function parseOrThrow(raw: string) {
  const result = parseAlg(raw);
  if (!result.ok) {
    throw new Error(`parse failed: ${result.error.kind}`);
  }
  return result.value;
}

describe('numberItems', () => {
  it('手ごとに 1 つずつ通し番号を振る', () => {
    expect(numberItems(parseOrThrow("R U R'")).map((n) => n.startIndex)).toEqual([0, 1, 2]);
  });

  it('括弧の塊は中の手の数だけ番号を進める', () => {
    expect(numberItems(parseOrThrow("(R U R' U') F")).map((n) => n.startIndex)).toEqual([0, 4]);
  });

  it('空の手順は空', () => {
    expect(numberItems([])).toEqual([]);
  });
});

describe('canHighlight', () => {
  it('括弧に繰り返しがあれば強調しない', () => {
    expect(canHighlight(parseOrThrow('(R U)2'))).toBe(false);
  });

  it("括弧に ' があれば強調しない", () => {
    expect(canHighlight(parseOrThrow("(R U)'"))).toBe(false);
  });

  it('括弧だけで繰り返しがなければ強調できる', () => {
    expect(canHighlight(parseOrThrow("(R U R' U') F2"))).toBe(true);
  });
});
