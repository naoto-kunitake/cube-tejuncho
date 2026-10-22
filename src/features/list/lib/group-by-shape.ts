import { copy } from '@/copy';
import type { Preset, PresetCategoryId } from '@/data/presets/catalog';
import { PLL_SHAPE_ORDER } from '@/data/presets/pll';

export type ShapeSection = { label: string; presets: readonly Preset[] };

type ShapeHeading = { shape: string; label: string };

// 形の見出しの並びと名前。形の鍵はカテゴリごとに別の型なので、ここで文字列に落として突き合わせる
function shapeHeadingsOf(category: PresetCategoryId): readonly ShapeHeading[] {
  switch (category) {
    case 'pll':
      return PLL_SHAPE_ORDER.map((shape) => ({ shape, label: copy.list.pllShapes[shape] }));
    case 'oll':
    case 'f2l':
      return [];
  }
}

export function groupByShape(
  category: PresetCategoryId,
  presets: readonly Preset[],
  sortOrder: 'shape' | 'standard',
): ShapeSection[] {
  if (sortOrder === 'standard') {
    return [{ label: copy.list.standardOrder, presets }];
  }
  return shapeHeadingsOf(category)
    .map((heading) => ({
      label: heading.label,
      presets: presets.filter((preset) => 'shape' in preset && preset.shape === heading.shape),
    }))
    .filter((section) => section.presets.length > 0);
}
