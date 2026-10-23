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
  pinnedIds: ReadonlySet<string>;
};

// ピン留めは並び方によらず先頭の「ピン留め」の見出しにまとめ、元の群からは外す (Keep / Apple メモと同じ。タイルにピンの記号は出さない)。
// ピン留めの中は元の並びを保つ。残りの見出しは標準順でも常に出し、見出しが今の並び方を示す
export function groupByShape(presets: readonly Preset[], options: GroupingOptions): ShapeSection[] {
  const { category, sortOrder, topColor, pinnedIds } = options;
  const pinned = presets.filter((preset) => pinnedIds.has(preset.id));
  const rest = presets.filter((preset) => !pinnedIds.has(preset.id));
  const pinnedSections: ShapeSection[] = pinned.length > 0 ? [{ label: copy.list.pinned, presets: pinned }] : [];
  if (sortOrder === 'standard') {
    // ピン留め以外が 0 件でも標準順の見出しは出す (形の見出しの「空なら隠す」とは別の決定)
    return [...pinnedSections, { label: copy.list.standardOrder[category], presets: rest }];
  }
  const shapeSections = shapeHeadingsOf(category, topColor)
    .map((heading) => ({
      label: heading.label,
      presets: rest.filter((preset) => 'shape' in preset && preset.shape === heading.shape),
    }))
    .filter((section) => section.presets.length > 0);
  return [...pinnedSections, ...shapeSections];
}
