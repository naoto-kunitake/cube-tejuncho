import { describe, expect, it } from 'vitest';

import { cubingAlgOrThrow } from '@/lib/cube/alg.fixtures';
import { caseStartState, cubeViewOf, pairMaskOf } from '@/lib/cube/view';

import { F2L_PRESETS, F2L_SHAPE_ORDER } from './f2l';
import { expectStandardAlgReadable, expectStandardAlgSolves } from './preset.fixtures';

const cases = F2L_PRESETS.map((preset) => [preset.name, preset] as const);

describe('F2L_PRESETS', () => {
  it('41 種が番号順にある', () => {
    expect(F2L_PRESETS.map((preset) => preset.name)).toEqual(
      Array.from({ length: 41 }, (_, index) => `F2L ${index + 1}`),
    );
  });

  it('id が重複しない', () => {
    expect(new Set(F2L_PRESETS.map((preset) => preset.id)).size).toBe(41);
  });

  it.each(cases)('%s の基本手順が読める', (_, preset) => {
    expectStandardAlgReadable(preset.standardAlg);
  });

  it('形の群は 8 / 8 / 8 / 6 / 6 / 5', () => {
    const counts = F2L_SHAPE_ORDER.map((shape) => F2L_PRESETS.filter((preset) => preset.shape === shape).length);
    expect(counts).toEqual([8, 8, 8, 6, 6, 5]);
  });

  it.each(cases)('%s のペアはコーナー 3 枚とエッジ 2 枚のうち見える分だけ', (_, preset) => {
    const count = [...preset.pair.u, ...preset.pair.f, ...preset.pair.r].filter(Boolean).length;
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(5);
  });
});

describe('F2L のプリセット', () => {
  it.each(cases)('%s の基本手順を開始状態に回すと揃う', async (_, preset) => {
    await expectStandardAlgSolves(preset.standardAlg);
  });

  it.each(cases)('%s の 3 面の図は手順から計算した状態と一致する', async (_, preset) => {
    const start = await caseStartState(cubingAlgOrThrow(preset.standardAlg));
    expect(cubeViewOf(start)).toEqual(preset.view);
  });

  it.each(cases)('%s のペアの位置は手順から計算した状態と一致する', async (_, preset) => {
    const start = await caseStartState(cubingAlgOrThrow(preset.standardAlg));
    expect(pairMaskOf(start)).toEqual(preset.pair);
  });
});
