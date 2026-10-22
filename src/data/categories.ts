import type { Document } from './document';
import { PRESET_CATEGORY_ID } from './patterns';

// タブに出すカテゴリ。プリセットの表示名は文言 (copy) にあるので画面側が付け、ここでは null
export type CategoryEntry = { id: string; name: string | null; isPreset: boolean; patternCount: number };

// タブの並び順でカテゴリを返す。プリセットは PLL だけ (OLL と F2L はまだない)。利用者のカテゴリは文書から
export function categoryEntriesOf(document: Pick<Document, 'categories' | 'patterns' | 'settings'>): CategoryEntry[] {
  return document.settings.tabOrder.flatMap((id): CategoryEntry[] => {
    if (id === PRESET_CATEGORY_ID) {
      return [{ id, name: null, isPreset: true, patternCount: 0 }];
    }
    const category = document.categories.find((entry) => entry.id === id);
    if (category === undefined) {
      return [];
    }
    const patternCount = document.patterns.filter((pattern) => pattern.categoryId === id).length;
    return [{ id, name: category.name, isPreset: false, patternCount }];
  });
}
