import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import {
  type AlgEntry,
  createEmptyDocument,
  type Document,
  DOCUMENT_VERSION,
  DocumentSchema,
  type RegistrationData,
} from './document';
import { migrateDocument } from './migrate';
import { createStorage, type KeyValueStorage } from './storage';

export const DOCUMENT_KEY = 'cube-tejuncho:doc';
const PREVIOUS_KEY = `${DOCUMENT_KEY}.prev`;
const BROKEN_KEY = `${DOCUMENT_KEY}.broken`;

export type LoadIssue = 'brokenDocument' | 'storageUnavailable' | 'quotaExceeded';

type PersistedShape = { state: { document: Document }; version: number };

type DocumentStorage = StateStorage & { takeIssue: () => LoadIssue | null };

// persist に渡す包み。読み込みで migrate → Zod を通し、壊れた文書は退避して空で始める。保存は前の文書を 1 世代残す
function createDocumentStorage(storage: KeyValueStorage): DocumentStorage {
  let issue: LoadIssue | null = storage.isPersistent ? null : 'storageUnavailable';
  let hasRequestedPersistence = false;

  const readDocument = (raw: string): Document | null => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
        return null;
      }
      const state: unknown = parsed.state;
      if (typeof state !== 'object' || state === null || !('document' in state)) {
        return null;
      }
      const result = DocumentSchema.safeParse(migrateDocument(state.document));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  };

  return {
    takeIssue: () => {
      const current = issue;
      issue = null;
      return current;
    },
    getItem: (key) => {
      const raw = storage.getItem(key);
      if (raw === null) {
        return null;
      }
      const document = readDocument(raw);
      if (document === null) {
        const backup = storage.setItem(BROKEN_KEY, raw);
        if (!backup.ok) {
          console.error('broken document backup failed', backup.error);
        }
        storage.removeItem(key);
        issue = 'brokenDocument';
        return null;
      }
      const persisted: PersistedShape = { state: { document }, version: document.version };
      return JSON.stringify(persisted);
    },
    setItem: (key, value) => {
      const previous = storage.getItem(key);
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

export type DocumentStore = {
  document: Document;
  loadIssue: LoadIssue | null;
  addRegistration: (patternId: string, mainAlg: AlgEntry) => void;
  saveRegistration: (patternId: string, data: RegistrationData) => void;
  removeRegistration: (patternId: string) => void;
  setLastTab: (categoryId: string) => void;
  dismissLoadIssue: () => void;
};

export function createDocumentStore(storage: KeyValueStorage) {
  const documentStorage = createDocumentStorage(storage);
  // persist の読み込みより先に自分で読んで、読み込みの問題を確定させる (読むだけなので保存は起きない)
  void documentStorage.getItem(DOCUMENT_KEY);
  const initialLoadIssue = documentStorage.takeIssue();

  const store = create<DocumentStore>()(
    persist(
      (set) => {
        // 保存は set のたびに起きるので、その直後に問題を拾って知らせる
        const reportStorageIssue = () => {
          const issue = documentStorage.takeIssue();
          if (issue !== null) {
            set({ loadIssue: issue });
          }
        };
        return {
          document: createEmptyDocument(),
          loadIssue: initialLoadIssue,
          addRegistration: (patternId, mainAlg) => {
            set((state) => {
              const now = new Date().toISOString();
              const existing = state.document.registrations.find((entry) => entry.patternId === patternId);
              // 登録し直しはメイン手順だけを替え、判断とほかの手順は残す
              const registration =
                existing === undefined
                  ? { patternId, recognition: '', mainAlg, altAlgs: [], createdAt: now, updatedAt: now }
                  : { ...existing, mainAlg, updatedAt: now };
              const others = state.document.registrations.filter((entry) => entry.patternId !== patternId);
              return { document: { ...state.document, registrations: [...others, registration] } };
            });
            reportStorageIssue();
          },
          saveRegistration: (patternId, data) => {
            set((state) => {
              const now = new Date().toISOString();
              const existing = state.document.registrations.find((entry) => entry.patternId === patternId);
              const registration = { patternId, ...data, createdAt: existing?.createdAt ?? now, updatedAt: now };
              const others = state.document.registrations.filter((entry) => entry.patternId !== patternId);
              return { document: { ...state.document, registrations: [...others, registration] } };
            });
            reportStorageIssue();
          },
          removeRegistration: (patternId) => {
            set((state) => ({
              document: {
                ...state.document,
                registrations: state.document.registrations.filter((entry) => entry.patternId !== patternId),
              },
            }));
            reportStorageIssue();
          },
          setLastTab: (categoryId) => {
            set((state) => ({
              document: { ...state.document, settings: { ...state.document.settings, lastTab: categoryId } },
            }));
            reportStorageIssue();
          },
          dismissLoadIssue: () => {
            set({ loadIssue: null });
          },
        };
      },
      {
        name: DOCUMENT_KEY,
        // persist は保存した版と比べて違えば読み込みを飛ばす。版の移行は包みの側で済ませている
        version: DOCUMENT_VERSION,
        storage: createJSONStorage(() => documentStorage),
        partialize: (state) => ({ document: state.document }),
      },
    ),
  );
  return store;
}

export const useDocumentStore = createDocumentStore(createStorage());
