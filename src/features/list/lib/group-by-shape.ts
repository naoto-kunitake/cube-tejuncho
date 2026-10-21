import { copy } from '@/copy';
import { PLL_SHAPE_ORDER, type PllPreset } from '@/data/presets/pll';

export type ShapeSection = { label: string; presets: readonly PllPreset[] };

export function groupByShape(presets: readonly PllPreset[], sortOrder: 'shape' | 'standard'): ShapeSection[] {
  if (sortOrder === 'standard') {
    return [{ label: copy.list.standardOrder, presets }];
  }
  return PLL_SHAPE_ORDER.map((shape) => ({
    label: copy.list.pllShapes[shape],
    presets: presets.filter((preset) => preset.shape === shape),
  })).filter((section) => section.presets.length > 0);
}
