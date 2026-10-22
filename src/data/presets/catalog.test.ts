import { describe, expect, it } from 'vitest';

import { ALL_PRESETS, hasPresets, presetsOf } from './catalog';

describe('hasPresets', () => {
  it('データがあるプリセットのカテゴリだけ true', () => {
    expect(hasPresets('pll')).toBe(true);
    expect(hasPresets('oll')).toBe(false);
    expect(hasPresets('f2l')).toBe(false);
  });

  it('利用者のカテゴリの id は false', () => {
    expect(hasPresets('c1')).toBe(false);
  });
});

describe('presetsOf', () => {
  it('そのカテゴリの印が付いたプリセットを返す', () => {
    const presets = presetsOf('pll');
    expect(presets.length).toBeGreaterThan(0);
    expect(presets.every((preset) => preset.category === 'pll')).toBe(true);
  });
});

describe('ALL_PRESETS', () => {
  it('全カテゴリの合計で、id が重複しない', () => {
    const total = presetsOf('pll').length + presetsOf('oll').length + presetsOf('f2l').length;
    expect(ALL_PRESETS).toHaveLength(total);
    expect(new Set(ALL_PRESETS.map((preset) => preset.id)).size).toBe(total);
  });
});
