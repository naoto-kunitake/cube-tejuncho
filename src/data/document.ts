import { z } from 'zod';

import { WIDE_STYLES } from '@/lib/alg/format';
import { FRONT_COLORS, TOP_COLORS } from '@/lib/figure/view';
import { APPEARANCES, type HexColor, isHexColor } from '@/lib/theme/color';

import { PRESET_CATEGORY_IDS } from './presets/catalog';

export const DOCUMENT_VERSION = 1;

export const AlgEntrySchema = z.object({
  text: z.string(),
  mnemonic: z.string(),
  fingering: z.string(),
});
export type AlgEntry = z.infer<typeof AlgEntrySchema>;

const RegistrationSchema = z.object({
  patternId: z.string(),
  recognition: z.string(),
  mainAlg: AlgEntrySchema,
  altAlgs: z.array(AlgEntrySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Registration = z.infer<typeof RegistrationSchema>;
// 編集画面が保存する部分 (id と日時は保存側が付ける)
export type RegistrationData = Pick<Registration, 'recognition' | 'mainAlg' | 'altAlgs'>;

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

// 自作のパターン。プリセットはコードに持つので文書には入れない
const CustomPatternSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CustomPattern = z.infer<typeof CustomPatternSchema>;

const SortOrderSchema = z.enum(['shape', 'standard']);
const SettingsSchema = z.object({
  topColor: z.enum(TOP_COLORS),
  frontColor: z.enum(FRONT_COLORS),
  showArrows: z.boolean(),
  showCueFigure: z.boolean(),
  greyUnrelated: z.boolean(),
  playbackSpeed: z.enum(['slow', 'normal', 'fast']),
  wideStyle: z.enum(WIDE_STYLES),
  // 'ink' は墨 (ダークでは白)。それ以外は #rrggbb (型は lib/theme の HexColor に揃える)
  themeColor: z.union([
    z.literal('ink'),
    z.custom<HexColor>((value) => typeof value === 'string' && isHexColor(value)),
  ]),
  appearance: z.enum(APPEARANCES),
  sortOrder: z.object({ pll: SortOrderSchema, oll: SortOrderSchema, f2l: SortOrderSchema }),
  listView: z.enum(['grid', 'list']),
  tabOrder: z.array(z.string()),
  dismissedBanners: z.array(z.string()),
  lastTab: z.string(),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DocumentSchema = z.object({
  version: z.literal(DOCUMENT_VERSION),
  categories: z.array(CategorySchema),
  patterns: z.array(CustomPatternSchema),
  registrations: z.array(RegistrationSchema),
  pinned: z.array(z.string()),
  settings: SettingsSchema,
});
export type Document = z.infer<typeof DocumentSchema>;

function createDefaultSettings(): Settings {
  return {
    topColor: 'yellow',
    frontColor: 'green',
    showArrows: true,
    showCueFigure: true,
    greyUnrelated: true,
    playbackSpeed: 'normal',
    wideStyle: 'r',
    themeColor: 'ink',
    appearance: 'auto',
    sortOrder: { pll: 'shape', oll: 'shape', f2l: 'shape' },
    listView: 'grid',
    tabOrder: [...PRESET_CATEGORY_IDS],
    dismissedBanners: [],
    lastTab: 'pll',
  };
}

export function createEmptyDocument(): Document {
  return {
    version: DOCUMENT_VERSION,
    categories: [],
    patterns: [],
    registrations: [],
    pinned: [],
    settings: createDefaultSettings(),
  };
}

export function findRegistration(registrations: readonly Registration[], patternId: string): Registration | undefined {
  return registrations.find((entry) => entry.patternId === patternId);
}
