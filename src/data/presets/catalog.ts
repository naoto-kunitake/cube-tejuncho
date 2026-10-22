import { PLL_PRESETS, type PllPreset } from './pll';

export const PRESET_CATEGORY_IDS = ['pll', 'oll', 'f2l'] as const;
export type PresetCategoryId = (typeof PRESET_CATEGORY_IDS)[number];

type PresetBase = Pick<PllPreset, 'id' | 'name' | 'standardAlg' | 'view'>;

// 画面が扱うプリセット。どのカテゴリのものかを持ち、矢印と手がかりの図は PLL だけ。
// OLL と F2L はデータがまだないので共通の部分だけ (足すときにそのカテゴリの型に置き換える)
export type Preset =
  (PllPreset & { category: 'pll' }) | (PresetBase & { category: 'oll' }) | (PresetBase & { category: 'f2l' });

function withCategory<T extends PresetBase, C extends PresetCategoryId>(
  presets: readonly T[],
  category: C,
): (T & { category: C })[] {
  return presets.map((preset) => ({ ...preset, category }));
}

// カテゴリごとのプリセット。OLL と F2L はまだない
const CATALOG: Record<PresetCategoryId, readonly Preset[]> = {
  pll: withCategory(PLL_PRESETS, 'pll'),
  oll: [],
  f2l: [],
};

export const ALL_PRESETS: readonly Preset[] = PRESET_CATEGORY_IDS.flatMap((category) => CATALOG[category]);

function isPresetCategoryId(id: string): id is PresetCategoryId {
  return PRESET_CATEGORY_IDS.some((entry) => entry === id);
}

// タブに出せるのは、プリセットがあるカテゴリだけ
export function hasPresets(id: string): id is PresetCategoryId {
  return isPresetCategoryId(id) && CATALOG[id].length > 0;
}

export function presetsOf(category: PresetCategoryId): readonly Preset[] {
  return CATALOG[category];
}
