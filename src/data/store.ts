import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  type AlgEntry,
  createEmptyDocument,
  createRegistration,
  type CustomPattern,
  type Document,
  DOCUMENT_VERSION,
  findRegistration,
  type RegistrationData,
  type Settings,
  withRegistration,
} from './document';
import { createDocumentStorage, DOCUMENT_KEY, type LoadIssue } from './document-storage';
import { createDraftStore } from './draft';
import { applyImport, type ImportMode } from './import-data';
import { hasPresets, type PresetCategoryId, presetsOf } from './presets/catalog';
import { createStorage, type KeyValueStorage } from './storage';

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
  // 文書から消えたパターンの下書きも消す。残すとプリセットのidは固定なので、消したはずの書きかけが復元される。
  // ただし文書の保存が止まっているときは消さない。文書はリロードで戻るが、下書きには控えがなく取り戻せない
  const drafts = createDraftStore(storage);
  const removeDrafts = (patternIds: readonly string[]) => {
    if (!documentStorage.isSaveBlocked()) {
      drafts.removeMany(patternIds);
    }
  };
  const removeAllDrafts = () => {
    if (!documentStorage.isSaveBlocked()) {
      drafts.removeAll();
    }
  };
  // persistの読み込みより先に自分で読んで、読み込みの問題を確定させる (読むだけなので保存は起きない)
  void documentStorage.getItem(DOCUMENT_KEY);
  const initialLoadIssue = documentStorage.takeIssue();

  const store = create<DocumentStore>()(
    persist(
      (set, get) => {
        // 保存はsetのたびに起きるので、その直後に問題を拾って知らせる
        const reportStorageIssue = () => {
          const issue = documentStorage.takeIssue();
          if (issue !== null) {
            set({ loadIssue: issue });
          }
        };
        // 文書を書き換える唯一の道。保存と知らせがsetに付いて回るので、actionごとに書かずここへ集める。
        // 同じ文書を返したときは何もしない (persistはsetのたびに書き、1世代前の控えが現在の文書で流れてしまう)
        const updateDocument = (update: (document: Document) => Document) => {
          const current = get().document;
          const next = update(current);
          if (next === current) {
            return;
          }
          set({ document: next });
          reportStorageIssue();
        };
        // 設定の差し替えは1か所に。名前のあるaction (setLastTabなど) はここに委ねる
        const updateSettings = (patch: Partial<Settings>) => {
          updateDocument((document) => ({ ...document, settings: { ...document.settings, ...patch } }));
        };
        return {
          document: createEmptyDocument(),
          loadIssue: initialLoadIssue,
          addRegistration: (patternId, mainAlg) => {
            updateDocument((document) => {
              const existing = findRegistration(document.registrations, patternId);
              // 登録し直しはメイン手順だけを替え、判断とほかの手順は残す
              const data = { recognition: existing?.recognition ?? '', mainAlg, altAlgs: existing?.altAlgs ?? [] };
              const registration = createRegistration(patternId, data, new Date().toISOString(), existing);
              return { ...document, registrations: withRegistration(document.registrations, registration) };
            });
          },
          saveRegistration: (patternId, data) => {
            updateDocument((document) => {
              const existing = findRegistration(document.registrations, patternId);
              const registration = createRegistration(patternId, data, new Date().toISOString(), existing);
              return { ...document, registrations: withRegistration(document.registrations, registration) };
            });
          },
          removeRegistration: (patternId) => {
            updateDocument((document) => ({
              ...document,
              registrations: document.registrations.filter((entry) => entry.patternId !== patternId),
            }));
          },
          addCategory: (name) => {
            const id = crypto.randomUUID();
            updateDocument((document) => ({
              ...document,
              categories: [...document.categories, { id, name }],
              settings: { ...document.settings, tabOrder: [...document.settings.tabOrder, id] },
            }));
            return id;
          },
          renameCategory: (categoryId, name) => {
            updateDocument((document) => ({
              ...document,
              categories: document.categories.map((category) =>
                category.id === categoryId ? { ...category, name } : category,
              ),
            }));
          },
          removeCategory: (categoryId) => {
            const { categories, patterns } = get().document;
            // プリセットのidもtabOrderに並ぶので、実在する自作カテゴリ以外では何も触らない
            if (!categories.some((category) => category.id === categoryId)) {
              return;
            }
            const removed = new Set(
              patterns.filter((pattern) => pattern.categoryId === categoryId).map((pattern) => pattern.id),
            );
            // lastTabは一覧側が無効な値を先頭のタブに読み替えるので、ここでは触らない
            updateDocument((document) => ({
              ...document,
              categories: document.categories.filter((category) => category.id !== categoryId),
              patterns: document.patterns.filter((pattern) => !removed.has(pattern.id)),
              registrations: document.registrations.filter((entry) => !removed.has(entry.patternId)),
              pinned: document.pinned.filter((id) => !removed.has(id)),
              settings: {
                ...document.settings,
                tabOrder: document.settings.tabOrder.filter((id) => id !== categoryId),
              },
            }));
            removeDrafts([...removed]);
          },
          moveCategory: (categoryId, toIndex) => {
            updateDocument((document) => {
              const { tabOrder } = document.settings;
              if (!tabOrder.includes(categoryId)) {
                return document;
              }
              const others = tabOrder.filter((id) => id !== categoryId);
              const index = Math.min(Math.max(toIndex, 0), others.length);
              const moved = [...others.slice(0, index), categoryId, ...others.slice(index)];
              return { ...document, settings: { ...document.settings, tabOrder: moved } };
            });
          },
          addCustomPattern: (fields, data) => {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            updateDocument((document) => ({
              ...document,
              patterns: [...document.patterns, { id, ...fields, createdAt: now, updatedAt: now }],
              registrations:
                data === null ? document.registrations : [...document.registrations, createRegistration(id, data, now)],
            }));
            return id;
          },
          updateCustomPattern: (patternId, fields) => {
            updateDocument((document) => ({
              ...document,
              patterns: document.patterns.map((pattern) =>
                pattern.id === patternId ? { ...pattern, ...fields, updatedAt: new Date().toISOString() } : pattern,
              ),
            }));
          },
          removeCustomPattern: (patternId) => {
            removeDrafts([patternId]);
            updateDocument((document) => ({
              ...document,
              patterns: document.patterns.filter((pattern) => pattern.id !== patternId),
              registrations: document.registrations.filter((entry) => entry.patternId !== patternId),
              pinned: document.pinned.filter((id) => id !== patternId),
            }));
          },
          importDocument: (imported, mode) => {
            if (mode === 'replace') {
              removeAllDrafts();
            }
            updateDocument((document) => applyImport(document, imported, mode));
          },
          replaceDocument: (document) => {
            updateDocument(() => document);
          },
          setLastTab: (categoryId) => {
            updateSettings({ lastTab: categoryId });
          },
          togglePin: (patternId) => {
            updateDocument((document) => {
              const isPinned = document.pinned.includes(patternId);
              const pinned = isPinned
                ? document.pinned.filter((id) => id !== patternId)
                : [...document.pinned, patternId];
              return { ...document, pinned };
            });
          },
          registerStandardAlgs: (category) => {
            const now = new Date().toISOString();
            const registeredIds = new Set(get().document.registrations.map((entry) => entry.patternId));
            const added = presetsOf(category)
              .filter((preset) => !registeredIds.has(preset.id))
              .map((preset) =>
                createRegistration(
                  preset.id,
                  { recognition: '', mainAlg: { text: preset.standardAlg, mnemonic: '', fingering: '' }, altAlgs: [] },
                  now,
                ),
              );
            updateDocument((document) => ({ ...document, registrations: [...document.registrations, ...added] }));
            return added.length;
          },
          clearRegistrations: (categoryIds) => {
            const { patterns, registrations } = get().document;
            const presetIds = new Set(
              categoryIds.filter(hasPresets).flatMap((category) => presetsOf(category).map((preset) => preset.id)),
            );
            const customIds = new Set(
              patterns.filter((pattern) => categoryIds.includes(pattern.categoryId)).map((pattern) => pattern.id),
            );
            const isRemoved = (patternId: string) => presetIds.has(patternId) || customIds.has(patternId);
            // 登録のない自作パターンも消えるので、自作はパターンの数で数える
            const removedCount =
              registrations.filter((entry) => presetIds.has(entry.patternId)).length + customIds.size;
            updateDocument((document) => ({
              ...document,
              patterns: document.patterns.filter((pattern) => !customIds.has(pattern.id)),
              registrations: document.registrations.filter((entry) => !isRemoved(entry.patternId)),
              pinned: document.pinned.filter((id) => !isRemoved(id)),
            }));
            removeDrafts([...presetIds, ...customIds]);
            return removedCount;
          },
          resetDocument: () => {
            removeAllDrafts();
            updateDocument(() => createEmptyDocument());
          },
          dismissBanner: (banner) => {
            updateDocument((document) => {
              const { dismissedBanners } = document.settings;
              if (dismissedBanners.includes(banner)) {
                return document;
              }
              return {
                ...document,
                settings: { ...document.settings, dismissedBanners: [...dismissedBanners, banner] },
              };
            });
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
