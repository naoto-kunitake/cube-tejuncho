import { describe, expect, it } from 'vitest';

import { createEmptyDocument } from './document';
import { createMemoryStorage, type KeyValueStorage } from './storage';
import { createDocumentStore, DOCUMENT_KEY } from './store';

const UA_ALG = { text: "M2 U M U2 M' U M2", mnemonic: '', fingering: '' };

function persistedStorage(): KeyValueStorage {
  return { ...createMemoryStorage(), isPersistent: true };
}

describe('createDocumentStore', () => {
  it('登録すると文書に残る', () => {
    const store = createDocumentStore(persistedStorage());
    store.getState().addRegistration('pll-ua', UA_ALG);
    const [registration] = store.getState().document.registrations;
    expect(registration?.patternId).toBe('pll-ua');
    expect(registration?.mainAlg).toEqual(UA_ALG);
  });

  it('同じパターンに登録し直すと 1 件のまま置き換わる', () => {
    const store = createDocumentStore(persistedStorage());
    store.getState().addRegistration('pll-ua', UA_ALG);
    store.getState().addRegistration('pll-ua', { ...UA_ALG, text: "R2 U' S' U2 S U' R2" });
    expect(store.getState().document.registrations).toHaveLength(1);
    expect(store.getState().document.registrations[0]?.mainAlg.text).toBe("R2 U' S' U2 S U' R2");
  });

  it('登録し直しても判断とほかの手順は残る', () => {
    const store = createDocumentStore(persistedStorage());
    store.getState().addRegistration('pll-ua', UA_ALG);
    store.setState((state) => ({
      document: {
        ...state.document,
        registrations: state.document.registrations.map((entry) => ({ ...entry, recognition: '前面が 3 連' })),
      },
    }));
    store.getState().addRegistration('pll-ua', { ...UA_ALG, text: "R2 U' S' U2 S U' R2" });
    expect(store.getState().document.registrations[0]?.recognition).toBe('前面が 3 連');
  });

  it('起動しただけでは保存しない', () => {
    const storage = persistedStorage();
    createDocumentStore(storage).getState().addRegistration('pll-ua', UA_ALG);
    storage.removeItem(`${DOCUMENT_KEY}.prev`);
    createDocumentStore(storage);
    expect(storage.getItem(`${DOCUMENT_KEY}.prev`)).toBeNull();
  });

  it('起動後に保存が容量超過で失敗したら知らせる', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    storage.setItem = () => ({ ok: false, error: { kind: 'quotaExceeded' } });
    store.getState().addRegistration('pll-ua', UA_ALG);
    expect(store.getState().loadIssue).toBe('quotaExceeded');
    expect(store.getState().document.registrations).toHaveLength(1);
  });

  it('選んだタブは設定に残り、読み直しても残る', () => {
    const storage = persistedStorage();
    createDocumentStore(storage).getState().setLastTab('oll');
    expect(createDocumentStore(storage).getState().document.settings.lastTab).toBe('oll');
  });

  it('登録して保存した文書は読み直しても残る', () => {
    const storage = persistedStorage();
    createDocumentStore(storage).getState().addRegistration('pll-ua', UA_ALG);
    const reloaded = createDocumentStore(storage);
    expect(reloaded.getState().document.registrations[0]?.patternId).toBe('pll-ua');
    expect(reloaded.getState().loadIssue).toBeNull();
  });

  it('保存の前の文書を 1 世代残す', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().addRegistration('pll-ua', UA_ALG);
    store.getState().addRegistration('pll-ub', UA_ALG);
    const previous = storage.getItem(`${DOCUMENT_KEY}.prev`) ?? '';
    expect(previous).toContain('pll-ua');
    expect(previous).not.toContain('pll-ub');
  });

  it('壊れた文書は退避して空で始め、知らせる', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, '{not json');
    const store = createDocumentStore(storage);
    expect(store.getState().document).toEqual(createEmptyDocument());
    expect(store.getState().loadIssue).toBe('brokenDocument');
    expect(storage.getItem(`${DOCUMENT_KEY}.broken`)).toBe('{not json');
    expect(storage.getItem(DOCUMENT_KEY)).not.toBe('{not json');
  });

  it('形の合わない文書も壊れたものとして扱う', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, JSON.stringify({ state: { document: { version: 1 } }, version: 1 }));
    const store = createDocumentStore(storage);
    expect(store.getState().loadIssue).toBe('brokenDocument');
    expect(store.getState().document.registrations).toEqual([]);
  });

  it('localStorage が使えないときは知らせてメモリで動く', () => {
    const store = createDocumentStore(createMemoryStorage());
    expect(store.getState().loadIssue).toBe('storageUnavailable');
    store.getState().addRegistration('pll-ua', UA_ALG);
    expect(store.getState().document.registrations).toHaveLength(1);
  });

  it('知らせを閉じると消える', () => {
    const store = createDocumentStore(createMemoryStorage());
    store.getState().dismissLoadIssue();
    expect(store.getState().loadIssue).toBeNull();
  });
});

describe('saveRegistration / removeRegistration', () => {
  const DATA = { recognition: 'r', mainAlg: UA_ALG, altAlgs: [] };

  it('保存すると判断と手順が入る', () => {
    const store = createDocumentStore(createMemoryStorage());
    store.getState().saveRegistration('pll-ua', DATA);
    expect(store.getState().document.registrations).toMatchObject([{ patternId: 'pll-ua', ...DATA }]);
  });

  it('保存し直すと置き換わり、作成日時は変わらない', () => {
    const store = createDocumentStore(createMemoryStorage());
    store.getState().saveRegistration('pll-ua', DATA);
    const createdAt = store.getState().document.registrations[0]?.createdAt;
    store.getState().saveRegistration('pll-ua', { ...DATA, recognition: 'r2' });
    expect(store.getState().document.registrations).toHaveLength(1);
    expect(store.getState().document.registrations[0]).toMatchObject({ recognition: 'r2', createdAt });
  });

  it('消すと文書から消える', () => {
    const store = createDocumentStore(createMemoryStorage());
    store.getState().saveRegistration('pll-ua', DATA);
    store.getState().removeRegistration('pll-ua');
    expect(store.getState().document.registrations).toEqual([]);
  });
});
