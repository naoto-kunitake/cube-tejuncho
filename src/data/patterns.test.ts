import { describe, expect, it } from 'vitest';

import { createEmptyDocument } from './document';
import { findPattern, hasCategoryNamed, patternName } from './patterns';
import { PLL_PRESETS } from './presets/pll';

const CUSTOM = { id: 'c1', categoryId: 'cat1', name: 'My Alg', createdAt: '', updatedAt: '' };

describe('findPattern', () => {
  it('プリセットの id ならプリセット', () => {
    // 個々のプリセットの名前に依存しないよう、先頭の1件をそのまま使う
    const [first] = PLL_PRESETS;
    if (first === undefined) {
      throw new Error('no presets');
    }
    const ref = findPattern(createEmptyDocument(), first.id);
    expect(ref?.kind).toBe('preset');
    expect(ref === undefined ? '' : patternName(ref)).toBe(first.name);
  });

  it('自作の id なら文書の中から探す', () => {
    const ref = findPattern({ patterns: [CUSTOM] }, 'c1');
    expect(ref).toEqual({ kind: 'custom', pattern: CUSTOM });
    expect(ref === undefined ? '' : patternName(ref)).toBe('My Alg');
  });

  it('知らない id なら undefined', () => {
    expect(findPattern({ patterns: [CUSTOM] }, 'nope')).toBeUndefined();
  });
});

describe('hasCategoryNamed', () => {
  it('大文字小文字と前後の空白の違いは同じ名前', () => {
    expect(hasCategoryNamed(['COLL', 'PLL'], ' coll ')).toBe(true);
    expect(hasCategoryNamed(['COLL'], 'OLL')).toBe(false);
  });
});
