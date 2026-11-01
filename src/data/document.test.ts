import { describe, expect, it } from 'vitest';

import {
  createEmptyDocument,
  createRegistration,
  DocumentSchema,
  findRegistration,
  normalizeDocument,
  withRegistration,
} from './document';

describe('DocumentSchema', () => {
  it('空の文書は検証を通る', () => {
    expect(DocumentSchema.safeParse(createEmptyDocument()).success).toBe(true);
  });

  it('版が違う文書は通らない', () => {
    expect(DocumentSchema.safeParse({ ...createEmptyDocument(), version: 2 }).success).toBe(false);
  });

  it('登録の手順が欠けた文書は通らない', () => {
    const document = createEmptyDocument();
    const broken = { ...document, registrations: [{ patternId: 'pll-ua', recognition: '' }] };
    expect(DocumentSchema.safeParse(broken).success).toBe(false);
  });

  it('テーマ色は ink か #RRGGBB だけ通る', () => {
    const document = createEmptyDocument();
    expect(
      DocumentSchema.safeParse({ ...document, settings: { ...document.settings, themeColor: '#1976D2' } }).success,
    ).toBe(true);
    expect(
      DocumentSchema.safeParse({ ...document, settings: { ...document.settings, themeColor: 'red' } }).success,
    ).toBe(false);
  });

  it('知らない設定値は通らない', () => {
    const document = createEmptyDocument();
    const broken = { ...document, settings: { ...document.settings, topColor: 'red' } };
    expect(DocumentSchema.safeParse(broken).success).toBe(false);
  });
});

describe('createEmptyDocument', () => {
  it('既定の設定はノートの表のとおり', () => {
    expect(createEmptyDocument().settings).toEqual({
      topColor: 'yellow',
      frontColor: 'green',
      showArrows: true,
      showCueFigure: true,
      greyUnrelated: true,
      playbackSpeed: 'normal',
      wideStyle: 'r',
      themeColor: 'ink',
      appearance: 'auto',
      sortOrder: { pll: 'shape', oll: 'shape', f2l: 'shape' },
      listView: 'grid',
      tabOrder: ['pll', 'oll', 'f2l'],
      dismissedBanners: [],
      lastTab: 'pll',
    });
  });
});

describe('findRegistration', () => {
  const registration = {
    patternId: 'pll-ua',
    recognition: '',
    mainAlg: { text: 'R U', mnemonic: '', fingering: '' },
    altAlgs: [],
    createdAt: '',
    updatedAt: '',
  };

  it('patternId が一致する登録を返す', () => {
    expect(findRegistration([registration], 'pll-ua')).toBe(registration);
  });

  it('見つからないときは undefined', () => {
    expect(findRegistration([registration], 'pll-ub')).toBeUndefined();
  });
});

describe('createRegistration', () => {
  const DATA = { recognition: 'r', mainAlg: { text: 'R U', mnemonic: '', fingering: '' }, altAlgs: [] };
  const NOW = '2026-11-01T00:00:00.000Z';

  it('新しい登録は作成日時と更新日時が同じ', () => {
    expect(createRegistration('pll-ua', DATA, NOW)).toEqual({
      patternId: 'pll-ua',
      ...DATA,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('既にある登録を渡すと作成日時を引き継ぐ', () => {
    const existing = { patternId: 'pll-ua', ...DATA, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: NOW };
    const registration = createRegistration('pll-ua', DATA, NOW, existing);
    expect(registration.createdAt).toBe('2026-10-01T00:00:00.000Z');
    expect(registration.updatedAt).toBe(NOW);
  });
});

describe('withRegistration', () => {
  const ENTRY_A = {
    patternId: 'pll-ua',
    recognition: '',
    mainAlg: { text: 'R U', mnemonic: '', fingering: '' },
    altAlgs: [],
    createdAt: '',
    updatedAt: '',
  };
  const ENTRY_B = { ...ENTRY_A, patternId: 'pll-ub' };

  it('同じパターンの登録を置き換える', () => {
    const replaced = { ...ENTRY_A, recognition: '前に3連' };
    expect(withRegistration([ENTRY_A, ENTRY_B], replaced)).toEqual([ENTRY_B, replaced]);
  });

  it('同じパターンの登録がなければ末尾に足す', () => {
    expect(withRegistration([ENTRY_A], ENTRY_B)).toEqual([ENTRY_A, ENTRY_B]);
  });
});

describe('normalizeDocument', () => {
  const ALG = { text: 'R U', mnemonic: '', fingering: '' };

  it('同じ id のカテゴリは先に出てきた方だけ残る', () => {
    const document = {
      ...createEmptyDocument(),
      categories: [
        { id: 'c1', name: 'COLL' },
        { id: 'c1', name: '別の名前' },
      ],
    };
    expect(normalizeDocument(document).categories).toEqual([{ id: 'c1', name: 'COLL' }]);
  });

  it('同じ patternId の登録は先に出てきた方だけ残る', () => {
    const entry = { patternId: 'pll-ua', recognition: '', mainAlg: ALG, altAlgs: [], createdAt: '', updatedAt: '' };
    const document = {
      ...createEmptyDocument(),
      registrations: [entry, { ...entry, recognition: '後の方' }],
    };
    expect(normalizeDocument(document).registrations).toEqual([entry]);
  });

  it('ピン留めの重複を落とす', () => {
    const document = { ...createEmptyDocument(), pinned: ['pll-ua', 'pll-ua'] };
    expect(normalizeDocument(document).pinned).toEqual(['pll-ua']);
  });

  it('タブ順の重複を落とす', () => {
    const document = createEmptyDocument();
    const normalized = normalizeDocument({
      ...document,
      settings: { ...document.settings, tabOrder: ['pll', 'oll', 'pll'] },
    });
    expect(normalized.settings.tabOrder).toEqual(['pll', 'oll']);
  });

  it('タブ順にないカテゴリを末尾に足す', () => {
    const document = { ...createEmptyDocument(), categories: [{ id: 'c1', name: 'COLL' }] };
    expect(normalizeDocument(document).settings.tabOrder).toEqual(['pll', 'oll', 'f2l', 'c1']);
  });

  it('存在しないパターンへの登録は残す', () => {
    const entry = { patternId: 'gone', recognition: '', mainAlg: ALG, altAlgs: [], createdAt: '', updatedAt: '' };
    const document = { ...createEmptyDocument(), registrations: [entry] };
    expect(normalizeDocument(document).registrations).toEqual([entry]);
  });
});
