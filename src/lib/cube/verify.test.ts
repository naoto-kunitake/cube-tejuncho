import { describe, expect, it } from 'vitest';

import { cubingAlgOrThrow } from './alg.fixtures';
import { solvesCase } from './verify';

const UA = "M2 U M U2 M' U M2";
const T_PERM = "R U R' U' R' F R2 U' R' U' R U R' F'";
const SUNE = "R U R' U R U2 R'";
const F2L_1 = "U (R U' R')";

async function solves(category: 'pll' | 'oll' | 'f2l', standardAlg: string, alg: string) {
  return solvesCase(category, cubingAlgOrThrow(standardAlg), cubingAlgOrThrow(alg));
}

describe('solvesCase', () => {
  it('基本手順はそのパターンを揃える', async () => {
    expect(await solves('pll', UA, UA)).toBe(true);
  });

  it('別解も揃える (Ua を R と U で回す手順)', async () => {
    expect(await solves('pll', UA, "R U' R U R U R U' R' U' R2")).toBe(true);
  });

  it('末尾に AUF が付いていても揃える', async () => {
    expect(await solves('pll', UA, `${UA} U`)).toBe(true);
  });

  it('違うパターンの手順は揃えない (Ua に T perm)', async () => {
    expect(await solves('pll', UA, T_PERM)).toBe(false);
  });

  it("1 手でも違えば揃えない (T perm の末尾の ' 抜け)", async () => {
    expect(await solves('pll', T_PERM, T_PERM.slice(0, -1))).toBe(false);
  });

  it('OLL は別の角度の手順も揃える (Sune を左手で回す)', async () => {
    expect(await solves('oll', SUNE, "L U L' U L U2 L'")).toBe(true);
  });

  it('OLL は鏡写しの手順を揃えない (Sune に Anti-Sune)', async () => {
    expect(await solves('oll', SUNE, "R U2 R' U' R U' R'")).toBe(false);
  });

  it('OLL は上層の並びが崩れていても向きが揃えばよい', async () => {
    expect(await solves('oll', SUNE, `${SUNE} ${T_PERM}`)).toBe(true);
  });

  it('F2L は同じスロットの手順なら揃える', async () => {
    expect(await solves('f2l', F2L_1, F2L_1)).toBe(true);
  });

  it('F2L は鏡写しの手順を揃えない', async () => {
    expect(await solves('f2l', F2L_1, "y' U' L' U L")).toBe(false);
  });
});
