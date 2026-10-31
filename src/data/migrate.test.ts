import { describe, expect, it } from 'vitest';

import { createEmptyDocument } from './document';
import { isNewerDocument, migrateDocument } from './migrate';

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

describe('isNewerDocument', () => {
  it('読める版より大きい版は新しい文書', () => {
    expect(isNewerDocument({ version: 2 })).toBe(true);
  });

  it('同じ版と古い版は新しい文書ではない', () => {
    expect(isNewerDocument(createEmptyDocument())).toBe(false);
    expect(isNewerDocument({ version: 0 })).toBe(false);
  });

  it('版が数でない値は新しい文書ではない', () => {
    expect(isNewerDocument({ version: '2' })).toBe(false);
    expect(isNewerDocument('broken')).toBe(false);
  });
});
