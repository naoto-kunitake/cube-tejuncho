import { z } from 'zod';

import { AlgEntrySchema } from './document';
import { createStorage, type KeyValueStorage } from './storage';

const DRAFT_VERSION = 1;

const DraftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  recognition: z.string(),
  cards: z.array(AlgEntrySchema),
});
export type Draft = z.infer<typeof DraftSchema>;
export type DraftData = Omit<Draft, 'version'>;

export function draftKey(patternId: string): string {
  return `cube-tejuncho:draft:${patternId}`;
}

// 編集の書きかけ。文書とは別の鍵に置き、保存か破棄で消す。読めない下書きは黙って捨てる (書きかけなので退避しない)
export function createDraftStore(storage: KeyValueStorage) {
  return {
    read: (patternId: string): DraftData | null => {
      const raw = storage.getItem(draftKey(patternId));
      if (raw === null) {
        return null;
      }
      try {
        const result = DraftSchema.safeParse(JSON.parse(raw));
        if (!result.success) {
          return null;
        }
        const { version: _version, ...data } = result.data;
        return data;
      } catch {
        return null;
      }
    },
    write: (patternId: string, data: DraftData): void => {
      const draft: Draft = { version: DRAFT_VERSION, ...data };
      const result = storage.setItem(draftKey(patternId), JSON.stringify(draft));
      if (!result.ok) {
        console.error('draft save failed', result.error);
      }
    },
    remove: (patternId: string): void => {
      storage.removeItem(draftKey(patternId));
    },
  };
}

export type DraftStore = ReturnType<typeof createDraftStore>;

export const draftStore = createDraftStore(createStorage());
