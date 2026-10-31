import { err, ok, type Result } from '@/lib/result';

import { type Category, type Document, DocumentSchema, normalizeDocument } from './document';
import { isNewerDocument, migrateDocument } from './migrate';
import { hasCategoryNamed } from './patterns';

export type ImportMode = 'add' | 'replace';
export type ImportError =
  { kind: 'invalidJson' } | { kind: 'newerVersion' } | { kind: 'invalidDocument'; message: string };

// 書き出したファイルの中身を文書に戻す。保存文書と同じ移行と検証を通すので、別アプリや壊れたファイルはここで止まる
export function importData(text: string): Result<Document, ImportError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return err({ kind: 'invalidJson' });
  }
  // 新しい版のファイルは壊れているわけではないので、文言を分けてアプリの更新を促す
  if (isNewerDocument(parsed)) {
    return err({ kind: 'newerVersion' });
  }
  const result = DocumentSchema.safeParse(migrateDocument(parsed));
  if (!result.success) {
    return err({ kind: 'invalidDocument', message: result.error.message });
  }
  return ok(normalizeDocument(result.data));
}

type Dated = { updatedAt: string };

// 同時刻は読み込む側 (利用者が今選んだファイル) を取る
function newerOf<T extends Dated>(current: T, imported: T): T {
  return imported.updatedAt >= current.updatedAt ? imported : current;
}

function mergeById<T>(
  current: readonly T[],
  imported: readonly T[],
  idOf: (entry: T) => string,
  pick: (current: T, imported: T) => T,
): T[] {
  const merged = new Map(current.map((entry) => [idOf(entry), entry]));
  for (const entry of imported) {
    const existing = merged.get(idOf(entry));
    merged.set(idOf(entry), existing === undefined ? entry : pick(existing, entry));
  }
  return [...merged.values()];
}

function unionOf(current: readonly string[], imported: readonly string[]): string[] {
  return [...new Set([...current, ...imported])];
}

// 同じ名前のカテゴリは別の端末で別のidになる。名前で同じものとみなし、読み込む側のidを今のidに寄せる
function categoryIdMapOf(current: readonly Category[], imported: readonly Category[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const category of imported) {
    const same = current.find((entry) => hasCategoryNamed([entry.name], category.name));
    if (same !== undefined) {
      map.set(category.id, same.id);
    }
  }
  return map;
}

// 追加: 同じパターンは新しい方を残し、カテゴリ・タブ順・ピン留めは合算する。設定は今のまま。
// どちらもnormalizeDocumentを通った文書を受け取るので、カテゴリはタブ順に含まれている
export function mergeDocuments(current: Document, imported: Document): Document {
  const idMap = categoryIdMapOf(current.categories, imported.categories);
  const categoryIdOf = (id: string) => idMap.get(id) ?? id;
  const importedCategories = imported.categories.filter((category) => !idMap.has(category.id));
  const importedPatterns = imported.patterns.map((pattern) => ({
    ...pattern,
    categoryId: categoryIdOf(pattern.categoryId),
  }));
  const importedTabOrder = imported.settings.tabOrder.map(categoryIdOf);
  return {
    ...current,
    categories: mergeById(
      current.categories,
      importedCategories,
      (category) => category.id,
      (existing) => existing,
    ),
    patterns: mergeById(current.patterns, importedPatterns, (pattern) => pattern.id, newerOf),
    registrations: mergeById(current.registrations, imported.registrations, (entry) => entry.patternId, newerOf),
    pinned: unionOf(current.pinned, imported.pinned),
    settings: { ...current.settings, tabOrder: unionOf(current.settings.tabOrder, importedTabOrder) },
  };
}

export function applyImport(current: Document, imported: Document, mode: ImportMode): Document {
  return mode === 'replace' ? imported : mergeDocuments(current, imported);
}
