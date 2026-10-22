import { describe, expect, it } from 'vitest';

import { createEmptyDocument, type Document } from './document';
import { applyImport, importData, mergeDocuments } from './import-data';

const UA_ALG = { text: "M2 U M U2 M' U M2", mnemonic: '', fingering: '' };

function registrationOf(patternId: string, updatedAt: string, recognition = '') {
  return { patternId, recognition, mainAlg: UA_ALG, altAlgs: [], createdAt: updatedAt, updatedAt };
}

function documentWith(overrides: Partial<Document>): Document {
  return { ...createEmptyDocument(), ...overrides };
}

describe('importData', () => {
  it('書き出した文書をそのまま読み戻せる', () => {
    const document = documentWith({ registrations: [registrationOf('pll-ua', '2026-10-01T00:00:00.000Z')] });
    const result = importData(JSON.stringify(document));
    expect(result).toEqual({ ok: true, value: document });
  });

  it('JSON でない文字列は読み込めない', () => {
    expect(importData('{').ok).toBe(false);
  });

  it('形の違う JSON は読み込めない', () => {
    expect(importData(JSON.stringify({ version: 1, registrations: 'x' })).ok).toBe(false);
  });

  it('知らない項目は落として読み込む', () => {
    const result = importData(JSON.stringify({ ...createEmptyDocument(), exportedAt: 'x' }));
    expect(result).toEqual({ ok: true, value: createEmptyDocument() });
  });
});

describe('mergeDocuments', () => {
  it('同じパターンの登録は新しい方が残る', () => {
    const current = documentWith({ registrations: [registrationOf('pll-ua', '2026-10-01T00:00:00.000Z', '古い')] });
    const imported = documentWith({ registrations: [registrationOf('pll-ua', '2026-10-02T00:00:00.000Z', '新しい')] });
    expect(mergeDocuments(current, imported).registrations).toMatchObject([{ recognition: '新しい' }]);
    expect(mergeDocuments(imported, current).registrations).toMatchObject([{ recognition: '新しい' }]);
  });

  it('片方にしかない登録は両方残る', () => {
    const current = documentWith({ registrations: [registrationOf('pll-ua', '2026-10-01T00:00:00.000Z')] });
    const imported = documentWith({ registrations: [registrationOf('pll-ub', '2026-10-01T00:00:00.000Z')] });
    expect(mergeDocuments(current, imported).registrations.map((entry) => entry.patternId)).toEqual([
      'pll-ua',
      'pll-ub',
    ]);
  });

  it('カテゴリとタブ順とピン留めは合算する', () => {
    const current = documentWith({
      categories: [{ id: 'c1', name: 'COLL' }],
      pinned: ['pll-ua'],
      settings: { ...createEmptyDocument().settings, tabOrder: ['pll', 'c1'] },
    });
    const imported = documentWith({
      categories: [{ id: 'c2', name: 'ZBLL' }],
      pinned: ['pll-ua', 'pll-ub'],
      settings: { ...createEmptyDocument().settings, tabOrder: ['c2', 'pll'] },
    });
    const merged = mergeDocuments(current, imported);
    expect(merged.categories).toEqual([
      { id: 'c1', name: 'COLL' },
      { id: 'c2', name: 'ZBLL' },
    ]);
    expect(merged.settings.tabOrder).toEqual(['pll', 'c1', 'c2']);
    expect(merged.pinned).toEqual(['pll-ua', 'pll-ub']);
  });

  it('同じ名前のカテゴリは 1 つにまとめ、そのパターンは今のカテゴリに入る', () => {
    const now = '2026-10-01T00:00:00.000Z';
    const current = documentWith({
      categories: [{ id: 'c1', name: 'COLL' }],
      settings: { ...createEmptyDocument().settings, tabOrder: ['pll', 'c1'] },
    });
    const imported = documentWith({
      categories: [{ id: 'c9', name: 'coll' }],
      patterns: [{ id: 'p1', categoryId: 'c9', name: 'Pi', createdAt: now, updatedAt: now }],
      settings: { ...createEmptyDocument().settings, tabOrder: ['pll', 'c9'] },
    });
    const merged = mergeDocuments(current, imported);
    expect(merged.categories).toEqual([{ id: 'c1', name: 'COLL' }]);
    expect(merged.patterns).toMatchObject([{ id: 'p1', categoryId: 'c1' }]);
    expect(merged.settings.tabOrder).toEqual(['pll', 'c1']);
  });

  it('設定は今のまま残る', () => {
    const current = documentWith({ settings: { ...createEmptyDocument().settings, topColor: 'white' } });
    const imported = documentWith({ settings: { ...createEmptyDocument().settings, topColor: 'yellow' } });
    expect(mergeDocuments(current, imported).settings.topColor).toBe('white');
  });
});

describe('applyImport', () => {
  it('置き換えは読み込んだ文書そのものになる', () => {
    const current = documentWith({ registrations: [registrationOf('pll-ua', '2026-10-01T00:00:00.000Z')] });
    const imported = documentWith({ categories: [{ id: 'c2', name: 'ZBLL' }] });
    expect(applyImport(current, imported, 'replace')).toEqual(imported);
  });
});
