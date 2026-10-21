import { describe, expect, it } from 'vitest';

import { cubingAlgOrThrow } from '@/lib/cube/alg.fixtures';

import { playerConfigFor, TEMPO_SCALE } from './twisty';

const SETTINGS = { topColor: 'yellow', frontColor: 'green', playbackSpeed: 'normal', greyUnrelated: true } as const;

describe('playerConfigFor', () => {
  it('自前の操作列なので cubing.js の操作列と背景は出さない', () => {
    const config = playerConfigFor(cubingAlgOrThrow("R U R'"), SETTINGS, 'pll');
    expect(config.controlPanel).toBe('none');
    expect(config.background).toBe('none');
    expect(config.hintFacelets).toBe('none');
  });

  it('開始姿勢は持ち替えと逆手順', () => {
    expect(playerConfigFor(cubingAlgOrThrow("R U R'"), SETTINGS, 'pll').experimentalSetupAlg).toBe("z2 R U' R'");
  });

  it('速さの設定を tempoScale にする', () => {
    expect(playerConfigFor(cubingAlgOrThrow('R'), { ...SETTINGS, playbackSpeed: 'fast' }).tempoScale).toBe(
      TEMPO_SCALE.fast,
    );
  });

  it('灰の設定が入でカテゴリがあればマスクを付ける', () => {
    expect(playerConfigFor(cubingAlgOrThrow('R'), SETTINGS, 'pll').experimentalStickeringMaskOrbits).toContain(
      'EDGES:',
    );
  });

  it('灰の設定が切なら全色', () => {
    expect(
      playerConfigFor(cubingAlgOrThrow('R'), { ...SETTINGS, greyUnrelated: false }, 'pll')
        .experimentalStickeringMaskOrbits,
    ).toBeUndefined();
  });

  it('カテゴリがなければ全色', () => {
    expect(playerConfigFor(cubingAlgOrThrow('R'), SETTINGS).experimentalStickeringMaskOrbits).toBeUndefined();
  });
});
