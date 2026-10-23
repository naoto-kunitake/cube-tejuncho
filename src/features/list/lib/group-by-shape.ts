import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import type { Preset, PresetCategoryId } from '@/data/presets/catalog';
import { F2L_SHAPE_ORDER } from '@/data/presets/f2l';
import { OLL_SHAPE_ORDER } from '@/data/presets/oll';
import { PLL_SHAPE_ORDER } from '@/data/presets/pll';
import type { TopColor } from '@/lib/figure/view';

export type ShapeSection = { label: string; presets: readonly Preset[] };

type ShapeHeading = { shape: string; label: string };

// 形の見出しの並びと名前。形の鍵はカテゴリごとに別の型なので、ここで文字列に落として突き合わせる。
// F2L の「白」はクロスの色なので、上面の色の設定で言い換える
function shapeHeadingsOf(category: PresetCategoryId, topColor: TopColor): readonly ShapeHeading[] {
  switch (category) {
    case 'pll':
      return PLL_SHAPE_ORDER.map((shape) => ({ shape, label: copy.list.pllShapes[shape] }));
    case 'oll':
      return OLL_SHAPE_ORDER.map((shape) => ({ shape, label: copy.list.ollShapes[shape] }));
    case 'f2l': {
      const cross = copy.list.crossColor[topColor];
      return F2L_SHAPE_ORDER.map((shape) => ({ shape, label: copy.list.f2lShapes[shape](cross) }));
    }
  }
}

export type GroupingOptions = {
  category: PresetCategoryId;
  sortOrder: Settings['sortOrder'][PresetCategoryId];
  topColor: TopColor;
};

export function groupByShape(presets: readonly Preset[], options: GroupingOptions): ShapeSection[] {
  const { category, sortOrder, topColor } = options;
  if (sortOrder === 'standard') {
    return [{ label: copy.list.standardOrder[category], presets }];
  }
  return shapeHeadingsOf(category, topColor)
    .map((heading) => ({
      label: heading.label,
      presets: presets.filter((preset) => 'shape' in preset && preset.shape === heading.shape),
    }))
    .filter((section) => section.presets.length > 0);
}
