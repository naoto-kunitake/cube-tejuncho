import { describe, expect, it } from 'vitest';

import { createDraftStore, draftKey } from './draft';
import { createMemoryStorage } from './storage';

const DATA = {
  name: '',
  categoryId: '',
  recognition: '前にヘッドライト',
  cards: [{ text: 'R U', mnemonic: '', fingering: '' }],
};

describe('createDraftStore', () => {
  it('書いた下書きを同じ鍵で読み戻す', () => {
    const store = createDraftStore(createMemoryStorage());
    store.write('pll-ua', DATA);
    expect(store.read('pll-ua')).toEqual(DATA);
    expect(store.read('pll-h')).toBeNull();
  });

  it('消したら読めない', () => {
    const store = createDraftStore(createMemoryStorage());
    store.write('pll-ua', DATA);
    store.remove('pll-ua');
    expect(store.read('pll-ua')).toBeNull();
  });

  it('渡したパターンの下書きだけまとめて消す', () => {
    const store = createDraftStore(createMemoryStorage());
    store.write('pll-ua', DATA);
    store.write('pll-ub', DATA);
    store.write('oll-21', DATA);
    store.removeMany(['pll-ua', 'pll-ub']);
    expect(store.read('pll-ua')).toBeNull();
    expect(store.read('pll-ub')).toBeNull();
    expect(store.read('oll-21')).toEqual(DATA);
  });

  it('すべて消すと文書の鍵は残る', () => {
    const storage = createMemoryStorage();
    const store = createDraftStore(storage);
    store.write('pll-ua', DATA);
    storage.setItem('cube-tejuncho:doc', 'x');
    store.removeAll();
    expect(store.read('pll-ua')).toBeNull();
    expect(storage.getItem('cube-tejuncho:doc')).toBe('x');
  });

  it('壊れた下書きと版の違う下書きは捨てる', () => {
    const storage = createMemoryStorage();
    const store = createDraftStore(storage);
    storage.setItem(draftKey('pll-ua'), '{');
    expect(store.read('pll-ua')).toBeNull();
    storage.setItem(draftKey('pll-ua'), JSON.stringify({ version: 99, ...DATA }));
    expect(store.read('pll-ua')).toBeNull();
  });

  it('名前とカテゴリのない古い下書きは空で補う', () => {
    const storage = createMemoryStorage();
    const store = createDraftStore(storage);
    storage.setItem(draftKey('pll-ua'), JSON.stringify({ version: 1, recognition: 'r', cards: [] }));
    expect(store.read('pll-ua')).toEqual({ name: '', categoryId: '', recognition: 'r', cards: [] });
  });
});
