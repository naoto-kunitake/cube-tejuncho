import { describe, expect, it } from 'vitest';

import { OLL_PRESETS, OLL_SHAPE_ORDER } from './oll';
import {
  expectStandardAlgReadable,
  expectStandardAlgSolves,
  expectViewMatchesStandardAlg,
  expectViewShape,
} from './preset.fixtures';

const cases = OLL_PRESETS.map((preset) => [preset.name, preset] as const);

describe('OLL_PRESETS', () => {
  it('57 種が番号順にある', () => {
    expect(OLL_PRESETS.map((preset) => preset.name)).toEqual(
      Array.from({ length: 57 }, (_, index) => `OLL ${index + 1}`),
    );
  });

  it('id が重複しない', () => {
    expect(new Set(OLL_PRESETS.map((preset) => preset.id)).size).toBe(57);
  });

  it.each(cases)('%s の基本手順が読める', (_, preset) => {
    expectStandardAlgReadable(preset.standardAlg);
  });

  it.each(cases)('%s の図は上面 9 と側面 3 ずつ', (_, preset) => {
    expectViewShape(preset.view);
  });

  it.each(cases)('%s の最終層には黄のステッカーが 9 枚ある', (_, preset) => {
    const stickers = [...preset.view.u, ...preset.view.f, ...preset.view.r, ...preset.view.b, ...preset.view.l];
    expect(stickers.filter((color) => color === 'Y')).toHaveLength(9);
    expect(preset.view.u[4]).toBe('Y');
  });

  it('形の分類は並び順の表にあるものだけで、どの形にも 1 つはある', () => {
    const shapes = new Set(OLL_PRESETS.map((preset) => preset.shape));
    for (const shape of shapes) {
      expect(OLL_SHAPE_ORDER).toContain(shape);
    }
    expect(shapes.size).toBe(OLL_SHAPE_ORDER.length);
  });
});

describe('OLL のプリセット', () => {
  it.each(cases)('%s の基本手順を開始状態に回すと揃う', async (_, preset) => {
    await expectStandardAlgSolves(preset.standardAlg);
  });

  it.each(cases)('%s の図の配置は手順から計算した状態と一致する (上面の向きは 4 通りのどれか)', async (_, preset) => {
    await expectViewMatchesStandardAlg(preset.standardAlg, preset.view);
  });
});
