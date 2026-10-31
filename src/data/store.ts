import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { err, ok, type Result } from '@/lib/result';

import {
  type AlgEntry,
  createEmptyDocument,
  type CustomPattern,
  type Document,
  DOCUMENT_VERSION,
  DocumentSchema,
  type RegistrationData,
  type Settings,
} from './document';
import { applyImport, type ImportMode } from './import-data';
import { isNewerDocument, migrateDocument } from './migrate';
import { hasPresets, type PresetCategoryId, presetsOf } from './presets/catalog';
import { createStorage, type KeyValueStorage } from './storage';

export const DOCUMENT_KEY = 'cube-tejuncho:doc';
const PREVIOUS_KEY = `${DOCUMENT_KEY}.prev`;
const BROKEN_KEY = `${DOCUMENT_KEY}.broken`;

export type LoadIssue = 'brokenDocument' | 'newerDocument' | 'storageUnavailable' | 'quotaExceeded';

type PersistedShape = { state: { document: Document }; version: number };

// 読み込めなかった理由。壊れた文書は退避するが、新しい版の文書は動かさない
type ReadFailure = 'brokenDocument' | 'newerDocument';

type DocumentStorage = StateStorage & { takeIssue: () => LoadIssue | null };

// persistに渡す包み。読み込みでmigrate → Zodを通し、壊れた文書は退避して空で始める。保存は前の文書を1世代残す
function createDocumentStorage(storage: KeyValueStorage): DocumentStorage {
  let issue: LoadIssue | null = storage.isPersistent ? null : 'storageUnavailable';
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
      return result.success ? ok(result.data) : err('brokenDocument');
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

export type CustomPatternFields = Pick<CustomPattern, 'name' | 'categoryId'>;

// 閉じた案内のid。プリセットのタブの初回の案内はカテゴリid、iOSの「ホーム画面に追加」の案内は固定のid
export const HOME_SCREEN_BANNER = 'homeScreen';
export type BannerId = PresetCategoryId | typeof HOME_SCREEN_BANNER;

export type DocumentStore = {
  document: Document;
  loadIssue: LoadIssue | null;
  addRegistration: (patternId: string, mainAlg: AlgEntry) => void;
  saveRegistration: (patternId: string, data: RegistrationData) => void;
  removeRegistration: (patternId: string) => void;
  // 返り値は新しいid
  addCategory: (name: string) => string;
  renameCategory: (categoryId: string, name: string) => void;
  // カテゴリと、その中の自作パターン (登録・ピン留めも) をまとめて消す
  removeCategory: (categoryId: string) => void;
  // タブの並びの中で、そのカテゴリをtoIndexの位置へ動かす (範囲外は端に収める)
  moveCategory: (categoryId: string, toIndex: number) => void;
  addCustomPattern: (fields: CustomPatternFields, data: RegistrationData | null) => string;
  updateCustomPattern: (patternId: string, fields: CustomPatternFields) => void;
  removeCustomPattern: (patternId: string) => void;
  importDocument: (imported: Document, mode: ImportMode) => void;
  // 破壊的な操作の「元に戻す」。控えておいた文書を丸ごと戻す
  replaceDocument: (document: Document) => void;
  setLastTab: (categoryId: string) => void;
  setListView: (listView: Settings['listView']) => void;
  // 設定画面の項目 (並び順・図・再生・表記・外観) の更新。渡した鍵だけ置き換える
  updateSettings: (patch: Partial<Settings>) => void;
  togglePin: (patternId: string) => void;
  // そのカテゴリの未登録のプリセット全部に基本手順をメイン手順として入れる。返り値は入れた件数
  registerStandardAlgs: (category: PresetCategoryId) => number;
  // カテゴリ単位で登録を消す。プリセットは登録とピン留め、自作は中のパターンごと (カテゴリ自体と設定は残す)。
  // 返り値は消した件数 (プリセットの登録 + 自作のパターン)
  clearRegistrations: (categoryIds: readonly string[]) => number;
  // 登録・自作・カテゴリ・設定をすべて既定に戻す
  resetDocument: () => void;
  dismissBanner: (banner: BannerId) => void;
  dismissLoadIssue: () => void;
};

export function createDocumentStore(storage: KeyValueStorage) {
  const documentStorage = createDocumentStorage(storage);
  // persistの読み込みより先に自分で読んで、読み込みの問題を確定させる (読むだけなので保存は起きない)
  void documentStorage.getItem(DOCUMENT_KEY);
  const initialLoadIssue = documentStorage.takeIssue();

  const store = create<DocumentStore>()(
    persist(
      (set) => {
        // 保存はsetのたびに起きるので、その直後に問題を拾って知らせる
        const reportStorageIssue = () => {
          const issue = documentStorage.takeIssue();
          if (issue !== null) {
            set({ loadIssue: issue });
          }
        };
        // 設定の差し替えは1か所に。名前のあるaction (setLastTabなど) はここに委ねる
        const updateSettings = (patch: Partial<Settings>) => {
          set((state) => ({ document: { ...state.document, settings: { ...state.document.settings, ...patch } } }));
          reportStorageIssue();
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
          addCategory: (name) => {
            const id = crypto.randomUUID();
            set((state) => ({
              document: {
                ...state.document,
                categories: [...state.document.categories, { id, name }],
                settings: { ...state.document.settings, tabOrder: [...state.document.settings.tabOrder, id] },
              },
            }));
            reportStorageIssue();
            return id;
          },
          renameCategory: (categoryId, name) => {
            set((state) => ({
              document: {
                ...state.document,
                categories: state.document.categories.map((category) =>
                  category.id === categoryId ? { ...category, name } : category,
                ),
              },
            }));
            reportStorageIssue();
          },
          removeCategory: (categoryId) => {
            set((state) => {
              const { document } = state;
              // プリセットのidもtabOrderに並ぶので、実在する自作カテゴリ以外では何も触らない
              if (!document.categories.some((category) => category.id === categoryId)) {
                return state;
              }
              const removedPatternIds = new Set(
                document.patterns.filter((pattern) => pattern.categoryId === categoryId).map((pattern) => pattern.id),
              );
              // lastTabは一覧側が無効な値を先頭のタブに読み替えるので、ここでは触らない
              return {
                document: {
                  ...document,
                  categories: document.categories.filter((category) => category.id !== categoryId),
                  patterns: document.patterns.filter((pattern) => !removedPatternIds.has(pattern.id)),
                  registrations: document.registrations.filter((entry) => !removedPatternIds.has(entry.patternId)),
                  pinned: document.pinned.filter((id) => !removedPatternIds.has(id)),
                  settings: {
                    ...document.settings,
                    tabOrder: document.settings.tabOrder.filter((id) => id !== categoryId),
                  },
                },
              };
            });
            reportStorageIssue();
          },
          moveCategory: (categoryId, toIndex) => {
            set((state) => {
              const { tabOrder } = state.document.settings;
              if (!tabOrder.includes(categoryId)) {
                return state;
              }
              const others = tabOrder.filter((id) => id !== categoryId);
              const index = Math.min(Math.max(toIndex, 0), others.length);
              const moved = [...others.slice(0, index), categoryId, ...others.slice(index)];
              return { document: { ...state.document, settings: { ...state.document.settings, tabOrder: moved } } };
            });
            reportStorageIssue();
          },
          addCustomPattern: (fields, data) => {
            const id = crypto.randomUUID();
            set((state) => {
              const now = new Date().toISOString();
              const registration = data === null ? [] : [{ patternId: id, ...data, createdAt: now, updatedAt: now }];
              return {
                document: {
                  ...state.document,
                  patterns: [...state.document.patterns, { id, ...fields, createdAt: now, updatedAt: now }],
                  registrations: [...state.document.registrations, ...registration],
                },
              };
            });
            reportStorageIssue();
            return id;
          },
          updateCustomPattern: (patternId, fields) => {
            set((state) => ({
              document: {
                ...state.document,
                patterns: state.document.patterns.map((pattern) =>
                  pattern.id === patternId ? { ...pattern, ...fields, updatedAt: new Date().toISOString() } : pattern,
                ),
              },
            }));
            reportStorageIssue();
          },
          removeCustomPattern: (patternId) => {
            set((state) => ({
              document: {
                ...state.document,
                patterns: state.document.patterns.filter((pattern) => pattern.id !== patternId),
                registrations: state.document.registrations.filter((entry) => entry.patternId !== patternId),
                pinned: state.document.pinned.filter((id) => id !== patternId),
              },
            }));
            reportStorageIssue();
          },
          importDocument: (imported, mode) => {
            set((state) => ({ document: applyImport(state.document, imported, mode) }));
            reportStorageIssue();
          },
          replaceDocument: (document) => {
            set({ document });
            reportStorageIssue();
          },
          setLastTab: (categoryId) => {
            updateSettings({ lastTab: categoryId });
          },
          togglePin: (patternId) => {
            set((state) => {
              const isPinned = state.document.pinned.includes(patternId);
              const pinned = isPinned
                ? state.document.pinned.filter((id) => id !== patternId)
                : [...state.document.pinned, patternId];
              return { document: { ...state.document, pinned } };
            });
            reportStorageIssue();
          },
          registerStandardAlgs: (category) => {
            const now = new Date().toISOString();
            let addedCount = 0;
            set((state) => {
              const registeredIds = new Set(state.document.registrations.map((entry) => entry.patternId));
              const added = presetsOf(category)
                .filter((preset) => !registeredIds.has(preset.id))
                .map((preset) => ({
                  patternId: preset.id,
                  recognition: '',
                  mainAlg: { text: preset.standardAlg, mnemonic: '', fingering: '' },
                  altAlgs: [],
                  createdAt: now,
                  updatedAt: now,
                }));
              addedCount = added.length;
              return { document: { ...state.document, registrations: [...state.document.registrations, ...added] } };
            });
            reportStorageIssue();
            return addedCount;
          },
          clearRegistrations: (categoryIds) => {
            let removedCount = 0;
            set((state) => {
              const { document } = state;
              const presetIds = new Set(
                categoryIds.filter(hasPresets).flatMap((category) => presetsOf(category).map((preset) => preset.id)),
              );
              const customIds = new Set(
                document.patterns
                  .filter((pattern) => categoryIds.includes(pattern.categoryId))
                  .map((pattern) => pattern.id),
              );
              const isRemoved = (patternId: string) => presetIds.has(patternId) || customIds.has(patternId);
              // 登録のない自作パターンも消えるので、自作はパターンの数で数える
              removedCount =
                document.registrations.filter((entry) => presetIds.has(entry.patternId)).length + customIds.size;
              return {
                document: {
                  ...document,
                  patterns: document.patterns.filter((pattern) => !customIds.has(pattern.id)),
                  registrations: document.registrations.filter((entry) => !isRemoved(entry.patternId)),
                  pinned: document.pinned.filter((id) => !isRemoved(id)),
                },
              };
            });
            reportStorageIssue();
            return removedCount;
          },
          resetDocument: () => {
            set({ document: createEmptyDocument() });
            reportStorageIssue();
          },
          dismissBanner: (banner) => {
            set((state) => {
              const { dismissedBanners } = state.document.settings;
              if (dismissedBanners.includes(banner)) {
                return state;
              }
              return {
                document: {
                  ...state.document,
                  settings: { ...state.document.settings, dismissedBanners: [...dismissedBanners, banner] },
                },
              };
            });
            reportStorageIssue();
          },
          updateSettings,
          setListView: (listView) => {
            updateSettings({ listView });
          },
          dismissLoadIssue: () => {
            set({ loadIssue: null });
          },
        };
      },
      {
        name: DOCUMENT_KEY,
        // persistは保存した版と比べて違えば読み込みを飛ばす。版の移行は包みの側で済ませている
        version: DOCUMENT_VERSION,
        storage: createJSONStorage(() => documentStorage),
        partialize: (state) => ({ document: state.document }),
      },
    ),
  );
  return store;
}

export const useDocumentStore = createDocumentStore(createStorage());
