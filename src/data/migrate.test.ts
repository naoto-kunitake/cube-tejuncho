import { describe, expect, it } from 'vitest';

import { createEmptyDocument } from './document';
import { migrateDocument } from './migrate';

describe('migrateDocument', () => {
  it('最新の版の文書はそのまま返す', () => {
    const document = createEmptyDocument();
    expect(migrateDocument(document)).toEqual(document);
  });

  it('文書の形をしていない値はそのまま返す', () => {
    expect(migrateDocument('broken')).toBe('broken');
  });

  it('移行の手段がない古い版はそのまま返す', () => {
    const old = { version: 0 };
    expect(migrateDocument(old)).toEqual(old);
  });
});
