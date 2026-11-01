import { err, ok, type Result } from '@/lib/result';

import { type Document, DocumentSchema, normalizeDocument } from './document';
import { isNewerDocument, migrateDocument } from './migrate';
import type { KeyValueStorage } from './storage';

export const DOCUMENT_KEY = 'cube-tejuncho:doc';
const PREVIOUS_KEY = `${DOCUMENT_KEY}.prev`;
const BROKEN_KEY = `${DOCUMENT_KEY}.broken`;

export type StorageIssue = 'brokenDocument' | 'newerDocument' | 'storageUnavailable' | 'quotaExceeded';

type PersistedShape = { state: { document: Document }; version: number };

// 読み込めなかった理由。壊れた文書は退避するが、新しい版の文書は動かさない
type ReadFailure = 'brokenDocument' | 'newerDocument';

// persistが使う3つの操作に、読み込みと保存の問題を外へ出す2つを足したもの。
// zustandのStateStorageは非同期も許すが、この包みはlocalStorageなので同期で書く (呼ぶ側がawaitを考えなくてよい)
type DocumentStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  takeIssue: () => StorageIssue | null;
  // 新しい版の文書があるときは書き込みを止めている。下書きの消去も同じ判断に揃えるために外から問える
  isSaveBlocked: () => boolean;
};

// persistに渡す包み。読み込みでmigrate → Zodを通し、壊れた文書は退避して空で始める。保存は前の文書を1世代残す
export function createDocumentStorage(storage: KeyValueStorage): DocumentStorage {
  let issue: StorageIssue | null = storage.isPersistent ? null : 'storageUnavailable';
  let hasRequestedPersistence = false;
  // issueは1回で消えるので、保存を止め続ける印は別に持つ
  let hasNewerDocument = false;

  const readDocument = (raw: string): Result<Document, ReadFailure> => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
        return err('brokenDocument');
      }
      const state: unknown = parsed.state;
      if (typeof state !== 'object' || state === null || !('document' in state)) {
        return err('brokenDocument');
      }
      if (isNewerDocument(state.document)) {
        return err('newerDocument');
      }
      const result = DocumentSchema.safeParse(migrateDocument(state.document));
      return result.success ? ok(normalizeDocument(result.data)) : err('brokenDocument');
    } catch {
      return err('brokenDocument');
    }
  };

  return {
    takeIssue: () => {
      const current = issue;
      issue = null;
      return current;
    },
    isSaveBlocked: () => hasNewerDocument,
    getItem: (key) => {
      const raw = storage.getItem(key);
      if (raw === null) {
        return null;
      }
      const result = readDocument(raw);
      if (result.ok) {
        const document = result.value;
        const persisted: PersistedShape = { state: { document }, version: document.version };
        return JSON.stringify(persisted);
      }
      // 自分より新しい版の文書は壊れていない。アプリを更新すれば読めるので、動かさずに知らせるだけ
      if (result.error === 'newerDocument') {
        hasNewerDocument = true;
        issue = 'newerDocument';
        return null;
      }
      // 退避できないまま消すと控えが1つも残らないので、退避できたときだけ本体を消す
      const backup = storage.setItem(BROKEN_KEY, raw);
      if (backup.ok) {
        storage.removeItem(key);
      } else {
        console.error('broken document backup failed', backup.error);
      }
      issue = 'brokenDocument';
      return null;
    },
    setItem: (key, value) => {
      // 上書きすると新しい版の文書は.prevに移るだけで、戻す画面がないので実質失われる。
      // アプリを更新するまで保存せず、操作のたびに知らせ直す
      if (hasNewerDocument) {
        issue = 'newerDocument';
        return;
      }
      const previous = storage.getItem(key);
      // 同じ内容の保存は捨てる。書いても控えが現在の文書で流れるだけで、1世代前が失われる。
      // storeのupdateDocumentは文書を変えないactionを止めるが、文書に触れずにsetする知らせの更新はここでしか止まらない
      if (previous === value) {
        return;
      }
      if (previous !== null) {
        const backup = storage.setItem(PREVIOUS_KEY, previous);
        if (!backup.ok) {
          console.error('previous document backup failed', backup.error);
        }
      }
      const result = storage.setItem(key, value);
      if (!result.ok) {
        issue = result.error.kind === 'quotaExceeded' ? 'quotaExceeded' : 'storageUnavailable';
        console.error('document save failed', result.error);
        return;
      }
      if (!hasRequestedPersistence && typeof navigator !== 'undefined' && navigator.storage !== undefined) {
        hasRequestedPersistence = true;
        void navigator.storage.persist();
      }
    },
    removeItem: (key) => {
      storage.removeItem(key);
    },
  };
}
