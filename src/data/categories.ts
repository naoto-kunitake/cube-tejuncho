import type { Document } from './document';
import { hasPresets, type PresetCategoryId } from './presets/catalog';

// タブに出すカテゴリ。プリセットの表示名は文言 (copy) にあるので画面側が付ける
export type CategoryEntry =
  { kind: 'preset'; id: PresetCategoryId } | { kind: 'custom'; id: string; name: string; patternCount: number };

// タブの並び順でカテゴリを返す。プリセットはデータがあるものだけ。利用者のカテゴリは文書から
export function categoryEntriesOf(document: Pick<Document, 'categories' | 'patterns' | 'settings'>): CategoryEntry[] {
  return document.settings.tabOrder.flatMap((id): CategoryEntry[] => {
    if (hasPresets(id)) {
      return [{ kind: 'preset', id }];
    }
    const category = document.categories.find((entry) => entry.id === id);
    if (category === undefined) {
      return [];
    }
    const patternCount = document.patterns.filter((pattern) => pattern.categoryId === id).length;
    return [{ kind: 'custom', id, name: category.name, patternCount }];
  });
}

// 同じ名前のカテゴリを作らせない (大文字小文字と前後の空白は同じ扱い)
export function hasCategoryNamed(names: readonly string[], name: string): boolean {
  const target = name.trim().toLowerCase();
  return names.some((entry) => entry.trim().toLowerCase() === target);
}
