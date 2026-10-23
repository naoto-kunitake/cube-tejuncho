import { describe, expect, it } from 'vitest';

import { categoryEntriesOf } from './categories';
import { createEmptyDocument } from './document';

describe('categoryEntriesOf', () => {
  it('タブの並び順で、プリセットと利用者のカテゴリを返し、文書にない id は飛ばす', () => {
    const document = createEmptyDocument();
    document.categories = [{ id: 'c1', name: 'COLL' }];
    document.settings.tabOrder = ['pll', 'oll', 'f2l', 'c1', 'gone'];
    document.patterns = [{ id: 'p1', categoryId: 'c1', name: 'a', createdAt: '', updatedAt: '' }];
    expect(categoryEntriesOf(document)).toEqual([
      { kind: 'preset', id: 'pll' },
      { kind: 'preset', id: 'oll' },
      { kind: 'preset', id: 'f2l' },
      { kind: 'custom', id: 'c1', name: 'COLL', patternCount: 1 },
    ]);
  });
});
