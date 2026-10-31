import { F2L_PRESETS, type F2lPreset } from './f2l';
import { OLL_PRESETS, type OllPreset } from './oll';
import { PLL_PRESETS, type PllPreset } from './pll';

export const PRESET_CATEGORY_IDS = ['pll', 'oll', 'f2l'] as const;
export type PresetCategoryId = (typeof PRESET_CATEGORY_IDS)[number];

// 画面が扱うプリセット。どのカテゴリのものかを持つ。矢印と手がかりの図はPLLだけ、3面の図はF2Lだけ
export type Preset =
  (PllPreset & { category: 'pll' }) | (OllPreset & { category: 'oll' }) | (F2lPreset & { category: 'f2l' });

function withCategory<T, C extends PresetCategoryId>(presets: readonly T[], category: C): (T & { category: C })[] {
  return presets.map((preset) => ({ ...preset, category }));
}

const CATALOG: Record<PresetCategoryId, readonly Preset[]> = {
  pll: withCategory(PLL_PRESETS, 'pll'),
  oll: withCategory(OLL_PRESETS, 'oll'),
  f2l: withCategory(F2L_PRESETS, 'f2l'),
};

export const ALL_PRESETS: readonly Preset[] = PRESET_CATEGORY_IDS.flatMap((category) => CATALOG[category]);

function isPresetCategoryId(id: string): id is PresetCategoryId {
  return PRESET_CATEGORY_IDS.some((entry) => entry === id);
}

// タブに出せるのは、プリセットがあるカテゴリだけ (利用者のカテゴリのidはfalse)
export function hasPresets(id: string): id is PresetCategoryId {
  return isPresetCategoryId(id) && CATALOG[id].length > 0;
}

export function presetsOf(category: PresetCategoryId): readonly Preset[] {
  return CATALOG[category];
}
