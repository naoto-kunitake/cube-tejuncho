import { describe, expect, it } from 'vitest';

import { createEmptyDocument, DocumentSchema, findRegistration } from './document';

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
