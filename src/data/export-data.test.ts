import { describe, expect, it } from 'vitest';

import { createEmptyDocument } from './document';
import { createExportFile, exportDateOf } from './export-data';

describe('exportDateOf', () => {
  it('端末の日付を YYYY-MM-DD にする', () => {
    expect(exportDateOf(new Date(2026, 9, 3))).toBe('2026-10-03');
  });
});

describe('createExportFile', () => {
  it('中身は文書そのもの', async () => {
    const document = { ...createEmptyDocument(), pinned: ['pll-ua'] };
    const file = createExportFile(document, 'a.json');
    expect(JSON.parse(await file.text())).toEqual(document);
  });
});
