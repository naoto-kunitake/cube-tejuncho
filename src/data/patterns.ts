import type { CustomPattern, Document } from './document';
import { ALL_PRESETS, type Preset } from './presets/catalog';

// 画面が扱うパターンの参照。プリセットはコードに、自作は文書にある
export type PatternRef = { kind: 'preset'; preset: Preset } | { kind: 'custom'; pattern: CustomPattern };

export function findPattern(document: Pick<Document, 'patterns'>, id: string): PatternRef | undefined {
  const preset = ALL_PRESETS.find((entry) => entry.id === id);
  if (preset !== undefined) {
    return { kind: 'preset', preset };
  }
  const pattern = document.patterns.find((entry) => entry.id === id);
  return pattern === undefined ? undefined : { kind: 'custom', pattern };
}

export function patternName(ref: PatternRef): string {
  return ref.kind === 'preset' ? ref.preset.name : ref.pattern.name;
}

// 同じ名前のカテゴリを作らせない (大文字小文字は同じ扱い)
export function hasCategoryNamed(names: readonly string[], name: string): boolean {
  const target = name.trim().toLowerCase();
  return names.some((entry) => entry.trim().toLowerCase() === target);
}
