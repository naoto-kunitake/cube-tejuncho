import { describe, expect, it } from 'vitest';

import { createEmptyDocument, type Document } from './document';
import { createDocumentStorage, DOCUMENT_KEY } from './document-storage';
import { createMemoryStorage, type KeyValueStorage } from './storage';

const PREVIOUS_KEY = `${DOCUMENT_KEY}.prev`;
const BROKEN_KEY = `${DOCUMENT_KEY}.broken`;

function persistedStorage(): KeyValueStorage {
  return { ...createMemoryStorage(), isPersistent: true };
}

// persistがやり取りする包み。読み込みは同じ形を返し、保存はこの文字列をそのまま預かる
function envelopeOf(document: Document): string {
  return JSON.stringify({ state: { document }, version: document.version });
}

// 読める版より新しい文書 (版は型にないので手で組む)
function newerEnvelope(): string {
  return JSON.stringify({ state: { document: { ...createEmptyDocument(), version: 2 } }, version: 2 });
}

function parsedEnvelope(raw: string | null): unknown {
  const value: unknown = JSON.parse(raw ?? 'null');
  return value;
}

describe('createDocumentStorage の読み込み', () => {
  it('読める文書はpersistの形で返す', () => {
    const storage = persistedStorage();
    const document = createEmptyDocument();
    storage.setItem(DOCUMENT_KEY, envelopeOf(document));
    const documentStorage = createDocumentStorage(storage);
    expect(parsedEnvelope(documentStorage.getItem(DOCUMENT_KEY))).toEqual({ state: { document }, version: 1 });
    expect(documentStorage.takeIssue()).toBeNull();
  });

  it('同じidが2つある文書は読み込みでそろえる', () => {
    const storage = persistedStorage();
    const document = { ...createEmptyDocument(), pinned: ['pll-ua', 'pll-ua'] };
    storage.setItem(DOCUMENT_KEY, envelopeOf(document));
    const documentStorage = createDocumentStorage(storage);
    expect(parsedEnvelope(documentStorage.getItem(DOCUMENT_KEY))).toEqual({
      state: { document: { ...document, pinned: ['pll-ua'] } },
      version: 1,
    });
  });

  it('何も保存されていなければnullを返す', () => {
    const documentStorage = createDocumentStorage(persistedStorage());
    expect(documentStorage.getItem(DOCUMENT_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBeNull();
  });

  it('壊れた文書は退避して本体を消し、知らせる', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, '{not json');
    const documentStorage = createDocumentStorage(storage);
    expect(documentStorage.getItem(DOCUMENT_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBe('brokenDocument');
    expect(storage.getItem(BROKEN_KEY)).toBe('{not json');
    expect(storage.getItem(DOCUMENT_KEY)).toBeNull();
  });

  it('形の合わない文書も壊れたものとして扱う', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, JSON.stringify({ state: { document: { version: 1 } }, version: 1 }));
    const documentStorage = createDocumentStorage(storage);
    expect(documentStorage.getItem(DOCUMENT_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBe('brokenDocument');
  });

  it('退避に失敗したときは壊れた文書を消さない', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, '{not json');
    const write = storage.setItem;
    storage.setItem = (key, value) =>
      key === BROKEN_KEY ? { ok: false, error: { kind: 'quotaExceeded' } } : write(key, value);
    const documentStorage = createDocumentStorage(storage);
    expect(documentStorage.getItem(DOCUMENT_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBe('brokenDocument');
    expect(storage.getItem(DOCUMENT_KEY)).toBe('{not json');
  });

  it('自分より新しい版の文書は退避も削除もせずに知らせる', () => {
    const storage = persistedStorage();
    const raw = newerEnvelope();
    storage.setItem(DOCUMENT_KEY, raw);
    const documentStorage = createDocumentStorage(storage);
    expect(documentStorage.getItem(DOCUMENT_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBe('newerDocument');
    expect(storage.getItem(DOCUMENT_KEY)).toBe(raw);
    expect(storage.getItem(BROKEN_KEY)).toBeNull();
  });

  it('知らせは1回取ると消える', () => {
    const storage = persistedStorage();
    storage.setItem(DOCUMENT_KEY, '{not json');
    const documentStorage = createDocumentStorage(storage);
    documentStorage.getItem(DOCUMENT_KEY);
    expect(documentStorage.takeIssue()).toBe('brokenDocument');
    expect(documentStorage.takeIssue()).toBeNull();
  });

  it('localStorageが使えないときは最初から知らせる', () => {
    const documentStorage = createDocumentStorage(createMemoryStorage());
    expect(documentStorage.takeIssue()).toBe('storageUnavailable');
  });
});

describe('createDocumentStorage の保存', () => {
  const FIRST = envelopeOf(createEmptyDocument());
  const SECOND = envelopeOf({ ...createEmptyDocument(), pinned: ['pll-ua'] });

  it('保存の前の文書を1世代残す', () => {
    const storage = persistedStorage();
    const documentStorage = createDocumentStorage(storage);
    documentStorage.setItem(DOCUMENT_KEY, FIRST);
    documentStorage.setItem(DOCUMENT_KEY, SECOND);
    expect(storage.getItem(DOCUMENT_KEY)).toBe(SECOND);
    expect(storage.getItem(PREVIOUS_KEY)).toBe(FIRST);
  });

  it('最初の保存では控えを作らない', () => {
    const storage = persistedStorage();
    createDocumentStorage(storage).setItem(DOCUMENT_KEY, FIRST);
    expect(storage.getItem(PREVIOUS_KEY)).toBeNull();
  });

  it('容量超過は知らせる', () => {
    const storage = persistedStorage();
    const documentStorage = createDocumentStorage(storage);
    storage.setItem = () => ({ ok: false, error: { kind: 'quotaExceeded' } });
    documentStorage.setItem(DOCUMENT_KEY, FIRST);
    expect(documentStorage.takeIssue()).toBe('quotaExceeded');
  });

  it('自分より新しい版の文書があるときは保存せずに知らせ直す', () => {
    const storage = persistedStorage();
    const raw = newerEnvelope();
    storage.setItem(DOCUMENT_KEY, raw);
    const documentStorage = createDocumentStorage(storage);
    documentStorage.getItem(DOCUMENT_KEY);
    documentStorage.takeIssue();
    documentStorage.setItem(DOCUMENT_KEY, FIRST);
    expect(storage.getItem(DOCUMENT_KEY)).toBe(raw);
    expect(storage.getItem(PREVIOUS_KEY)).toBeNull();
    expect(documentStorage.takeIssue()).toBe('newerDocument');
    expect(documentStorage.isSaveBlocked()).toBe(true);
  });
});
