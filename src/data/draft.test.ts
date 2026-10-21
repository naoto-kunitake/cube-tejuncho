import { describe, expect, it } from 'vitest';

import { createDraftStore, draftKey } from './draft';
import { createMemoryStorage } from './storage';

const DATA = { recognition: '前にヘッドライト', cards: [{ text: 'R U', mnemonic: '', fingering: '' }] };

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

  it('壊れた下書きと版の違う下書きは捨てる', () => {
    const storage = createMemoryStorage();
    const store = createDraftStore(storage);
    storage.setItem(draftKey('pll-ua'), '{');
    expect(store.read('pll-ua')).toBeNull();
    storage.setItem(draftKey('pll-ua'), JSON.stringify({ version: 99, ...DATA }));
    expect(store.read('pll-ua')).toBeNull();
  });
});
