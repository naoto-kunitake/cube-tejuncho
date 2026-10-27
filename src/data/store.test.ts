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

  it('読み込んだ文書は追加なら今の登録と合わさり、保存される', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().addRegistration('pll-ua', UA_ALG);
    const now = new Date().toISOString();
    store.getState().importDocument(
      {
        ...createEmptyDocument(),
        registrations: [
          { patternId: 'pll-ub', recognition: '', mainAlg: UA_ALG, altAlgs: [], createdAt: now, updatedAt: now },
        ],
      },
      'add',
    );
    expect(store.getState().document.registrations.map((entry) => entry.patternId)).toEqual(['pll-ua', 'pll-ub']);
    expect(createDocumentStore(storage).getState().document.registrations).toHaveLength(2);
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

  it('一括登録は未登録のプリセットだけに基本手順を入れ、入れた件数を返す', () => {
    const store = createDocumentStore(persistedStorage());
    store.getState().addRegistration('pll-ua', UA_ALG);
    expect(store.getState().registerStandardAlgs('pll')).toBe(20);
    expect(store.getState().document.registrations).toHaveLength(21);
    expect(store.getState().document.registrations[0]?.mainAlg).toEqual(UA_ALG);
    expect(store.getState().registerStandardAlgs('pll')).toBe(0);
  });

  it('案内を閉じたタブは設定に残り、同じタブを 2 回閉じても 1 つ', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().dismissBanner('pll');
    store.getState().dismissBanner('pll');
    expect(createDocumentStore(storage).getState().document.settings.dismissedBanners).toEqual(['pll']);
  });

  it('カテゴリの名前を変えると、id はそのままで名前だけ替わる', () => {
    const store = createDocumentStore(persistedStorage());
    const id = store.getState().addCategory('COLL');
    store.getState().renameCategory(id, 'ZBLL');
    expect(store.getState().document.categories).toEqual([{ id, name: 'ZBLL' }]);
  });

  it('カテゴリを消すと、中の自作パターンとその登録・ピン留め・タブも消える', () => {
    const store = createDocumentStore(persistedStorage());
    const categoryId = store.getState().addCategory('COLL');
    const patternId = store
      .getState()
      .addCustomPattern({ name: 'a', categoryId }, { recognition: '', mainAlg: UA_ALG, altAlgs: [] });
    store.getState().togglePin(patternId);
    store.getState().addRegistration('pll-ua', UA_ALG);
    store.getState().removeCategory(categoryId);
    const { document } = store.getState();
    expect(document.categories).toEqual([]);
    expect(document.patterns).toEqual([]);
    expect(document.registrations.map((entry) => entry.patternId)).toEqual(['pll-ua']);
    expect(document.pinned).toEqual([]);
    expect(document.settings.tabOrder).toEqual(['pll', 'oll', 'f2l']);
  });

  it('ないカテゴリ (プリセットの id を含む) を消そうとしても何も変わらない', () => {
    const store = createDocumentStore(persistedStorage());
    const before = store.getState().document;
    store.getState().removeCategory('pll');
    store.getState().removeCategory('gone');
    expect(store.getState().document).toEqual(before);
  });

  it('カテゴリを動かすとタブの並びが変わり、読み直しても残る', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().moveCategory('f2l', 0);
    expect(store.getState().document.settings.tabOrder).toEqual(['f2l', 'pll', 'oll']);
    expect(createDocumentStore(storage).getState().document.settings.tabOrder).toEqual(['f2l', 'pll', 'oll']);
  });

  it('カテゴリを範囲の外へ動かすと端で止まり、並びにない id は何も変えない', () => {
    const store = createDocumentStore(persistedStorage());
    store.getState().moveCategory('pll', 10);
    expect(store.getState().document.settings.tabOrder).toEqual(['oll', 'f2l', 'pll']);
    store.getState().moveCategory('pll', -1);
    expect(store.getState().document.settings.tabOrder).toEqual(['pll', 'oll', 'f2l']);
    store.getState().moveCategory('gone', 1);
    expect(store.getState().document.settings.tabOrder).toEqual(['pll', 'oll', 'f2l']);
  });

  it('ピン留めは押すたびに付いたり外れたりし、読み直しても残る', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().togglePin('pll-ua');
    store.getState().togglePin('pll-h');
    store.getState().togglePin('pll-ua');
    expect(store.getState().document.pinned).toEqual(['pll-h']);
    expect(createDocumentStore(storage).getState().document.pinned).toEqual(['pll-h']);
  });

  it('設定の部分更新は渡した鍵だけ置き換え、読み直しても残る', () => {
    const storage = persistedStorage();
    const store = createDocumentStore(storage);
    store.getState().updateSettings({ topColor: 'white', playbackSpeed: 'fast' });
    const reloaded = createDocumentStore(storage).getState().document.settings;
    expect(reloaded.topColor).toBe('white');
    expect(reloaded.playbackSpeed).toBe('fast');
    expect(reloaded.frontColor).toBe('green');
  });

  it('一覧の表示を切り替えると設定に残り、読み直しても残る', () => {
    const storage = persistedStorage();
    createDocumentStore(storage).getState().setListView('list');
    expect(createDocumentStore(storage).getState().document.settings.listView).toBe('list');
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

describe('カテゴリと自作パターン', () => {
  const FIELDS = { name: 'My Alg', categoryId: 'cat1' };
  const DATA = { recognition: 'r', mainAlg: UA_ALG, altAlgs: [] };

  it('カテゴリを足すとタブの並びの末尾にも入る', () => {
    const store = createDocumentStore(createMemoryStorage());
    const id = store.getState().addCategory('COLL');
    expect(store.getState().document.categories).toEqual([{ id, name: 'COLL' }]);
    expect(store.getState().document.settings.tabOrder).toEqual(['pll', 'oll', 'f2l', id]);
  });

  it('自作パターンを登録つきで足すと両方が入る', () => {
    const store = createDocumentStore(createMemoryStorage());
    const id = store.getState().addCustomPattern(FIELDS, DATA);
    expect(store.getState().document.patterns).toMatchObject([{ id, ...FIELDS }]);
    expect(store.getState().document.registrations).toMatchObject([{ patternId: id, ...DATA }]);
  });

  it('登録なしで足すとパターンだけが入る', () => {
    const store = createDocumentStore(createMemoryStorage());
    store.getState().addCustomPattern(FIELDS, null);
    expect(store.getState().document.registrations).toEqual([]);
  });

  it('名前とカテゴリを変えられる', () => {
    const store = createDocumentStore(createMemoryStorage());
    const id = store.getState().addCustomPattern(FIELDS, null);
    store.getState().updateCustomPattern(id, { name: 'Renamed', categoryId: 'cat2' });
    expect(store.getState().document.patterns[0]).toMatchObject({ id, name: 'Renamed', categoryId: 'cat2' });
  });

  it('消すと登録とピン留めも消え、丸ごと戻せる', () => {
    const store = createDocumentStore(createMemoryStorage());
    const id = store.getState().addCustomPattern(FIELDS, DATA);
    store.setState((state) => ({ document: { ...state.document, pinned: [id] } }));
    const before = store.getState().document;
    store.getState().removeCustomPattern(id);
    expect(store.getState().document.patterns).toEqual([]);
    expect(store.getState().document.registrations).toEqual([]);
    expect(store.getState().document.pinned).toEqual([]);
    store.getState().replaceDocument(before);
    expect(store.getState().document).toEqual(before);
  });
});
