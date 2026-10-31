import { describe, expect, it } from 'vitest';

import { cubingAlgOrThrow } from '@/lib/cube/alg.fixtures';

import { playerConfigFor, TEMPO_SCALE } from './twisty';

const SETTINGS = { topColor: 'yellow', frontColor: 'green', playbackSpeed: 'normal', greyUnrelated: true } as const;

describe('playerConfigFor', () => {
  it('自前の操作列なので cubing.js の操作列と背景は出さない', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow("R U R'"), SETTINGS, 'pll');
    expect(config.controlPanel).toBe('none');
    expect(config.background).toBe('none');
    expect(config.hintFacelets).toBe('none');
  });

  it('開始姿勢は持ち替えと逆手順', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow("R U R'"), SETTINGS, 'pll');
    expect(config.experimentalSetupAlg).toBe("z2 R U' R'");
  });

  it('速さの設定を tempoScale にする', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow('R'), { ...SETTINGS, playbackSpeed: 'fast' });
    expect(config.tempoScale).toBe(TEMPO_SCALE.fast);
  });

  it('灰の設定が入でカテゴリがあればマスクを付ける', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow('R'), SETTINGS, 'pll');
    expect(config.experimentalStickeringMaskOrbits).toContain('EDGES:');
  });

  it('灰の設定が切なら全色', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow('R'), { ...SETTINGS, greyUnrelated: false }, 'pll');
    expect(config.experimentalStickeringMaskOrbits).toBeUndefined();
  });

  it('カテゴリがなければ全色', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow('R'), SETTINGS);
    expect(config.experimentalStickeringMaskOrbits).toBeUndefined();
  });

  it('持ち替えで始まる F2L の手順は回った先のペアを残す', async () => {
    const config = await playerConfigFor(cubingAlgOrThrow("y' R' U' R"), SETTINGS, 'f2l');
    expect(config.experimentalStickeringMaskOrbits).toBe('EDGES:IIIIIIIIIII-,CORNERS:II-IIIII,CENTERS:------');
  });
});
