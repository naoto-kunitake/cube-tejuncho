import { describe, expect, it } from 'vitest';

import { frontColorTurns, type ViewSettings } from '@/lib/figure/view';

import { invertAlg, toCubingAlg } from './alg';
import { cubingAlgOrThrow } from './alg.fixtures';
import { applyAlg, solvedState } from './kpuzzle';
import { setupAlgFor } from './setup';
import { type StickeringCategory, stickeringMaskFor, stickeringMaskOf } from './stickering';
import { faceletsOf } from './stickers';
import { topViewOf } from './view';

describe('toCubingAlg', () => {
  it('全角や空白なしの揺れを直してから渡す', () => {
    expect(cubingAlgOrThrow("ＲＵＲ'").toString()).toBe("R U R'");
  });

  it('読めない手順はそのまま知らせる', () => {
    expect(toCubingAlg('R Q').ok).toBe(false);
  });
});

describe('invertAlg', () => {
  it('逆手順は順と記号を反転する', () => {
    expect(invertAlg(cubingAlgOrThrow("R U R' U'")).toString()).toBe("U R U' R'");
  });
});

describe('faceletsOf', () => {
  it('揃った状態は各面が 1 色', async () => {
    const facelets = faceletsOf(await solvedState());
    expect(facelets.U.every((color) => color === 'W')).toBe(true);
    expect(facelets.F.every((color) => color === 'G')).toBe(true);
  });

  it('F を回すと上面の手前の行に左面の色が来る', async () => {
    const facelets = faceletsOf(applyAlg(await solvedState(), 'F'));
    expect(facelets.U.slice(6)).toEqual(['O', 'O', 'O']);
    expect(facelets.R.filter((_, index) => index % 3 === 0)).toEqual(['W', 'W', 'W']);
  });
});

describe('topViewOf', () => {
  it('持ち替え済みの揃った状態は黄上・緑前の上面図になる', async () => {
    const view = topViewOf(applyAlg(await solvedState(), 'z2'));
    expect(view.u.every((color) => color === 'Y')).toBe(true);
    expect(view.f).toEqual(['G', 'G', 'G']);
    expect(view.r).toEqual(['O', 'O', 'O']);
    expect(view.b).toEqual(['B', 'B', 'B']);
    expect(view.l).toEqual(['R', 'R', 'R']);
  });

  it('側面は上から見て左から右の順で読む', async () => {
    // 黄上でFを回すと、上面の手前の行に赤 (左面)、右面の手前に黄 (上面)、左面の手前に白 (下面) が来る
    const view = topViewOf(applyAlg(await solvedState(), 'z2 F'));
    expect(view.u.slice(6)).toEqual(['R', 'R', 'R']);
    expect(view.r).toEqual(['O', 'O', 'Y']);
    expect(view.l).toEqual(['R', 'R', 'W']);
  });
});

describe('setupAlgFor', () => {
  it('黄上・緑前は z2 のあとに逆手順', () => {
    expect(setupAlgFor(cubingAlgOrThrow("R U R'"), { topColor: 'yellow', frontColor: 'green' })).toBe("z2 R U' R'");
  });

  it('白上・赤前は y だけ', () => {
    expect(setupAlgFor(cubingAlgOrThrow('R'), { topColor: 'white', frontColor: 'red' })).toBe("y R'");
  });

  it('黄上・橙前は z2 と y', () => {
    expect(setupAlgFor(cubingAlgOrThrow('R'), { topColor: 'yellow', frontColor: 'orange' })).toBe("z2 y R'");
  });
});

describe('stickeringMaskFor', () => {
  // 設定から回転数を決める経路 (持ち替えを含まない手順と同じ)
  const maskFor = (category: StickeringCategory, settings: ViewSettings) =>
    stickeringMaskFor(category, settings, frontColorTurns(settings));

  it('黄上・緑前の PLL は下層 (cubing.js の D 層) だけ通常で、センターは上 (白) だけ灰', () => {
    expect(maskFor('pll', { topColor: 'yellow', frontColor: 'green' })).toBe(
      'EDGES:IIII----IIII,CORNERS:IIII----,CENTERS:I-----',
    );
  });

  it('黄上・緑前の F2L はエッジ FL とコーナー ULF だけ通常', () => {
    expect(maskFor('f2l', { topColor: 'yellow', frontColor: 'green' })).toBe(
      'EDGES:IIIIIIIII-II,CORNERS:III-IIII,CENTERS:------',
    );
  });

  it('黄上・橙前の F2L はエッジ BL とコーナー UBL', () => {
    expect(maskFor('f2l', { topColor: 'yellow', frontColor: 'orange' })).toBe(
      'EDGES:IIIIIIIIIII-,CORNERS:II-IIIII,CENTERS:------',
    );
  });

  it('白上・緑前の F2L は U 層・FR・DRF', () => {
    expect(maskFor('f2l', { topColor: 'white', frontColor: 'green' })).toBe(
      'EDGES:IIIIIIII-III,CORNERS:IIII-III,CENTERS:------',
    );
  });

  it('OLL は上層が O でセンターは上だけ通常', () => {
    expect(maskFor('oll', { topColor: 'white', frontColor: 'green' })).toBe(
      'EDGES:OOOOIIIIIIII,CORNERS:OOOOIIII,CENTERS:-IIIII',
    );
  });
});

describe('stickeringMaskOf', () => {
  const FRAME = { topColor: 'yellow', frontColor: 'green' } as const;

  it('持ち替えのない F2L の手順は設定どおりのペアを残す', async () => {
    await expect(stickeringMaskOf('f2l', FRAME, cubingAlgOrThrow("R U R'"))).resolves.toBe(
      'EDGES:IIIIIIIII-II,CORNERS:III-IIII,CENTERS:------',
    );
  });

  it("y' で始まる F2L の手順は回った先のペアを残す", async () => {
    await expect(stickeringMaskOf('f2l', FRAME, cubingAlgOrThrow("y' R U R'"))).resolves.toBe(
      'EDGES:IIIIIIIIIII-,CORNERS:II-IIIII,CENTERS:------',
    );
  });

  it('d を含む F2L の手順も回った先のペアを残す', async () => {
    await expect(stickeringMaskOf('f2l', FRAME, cubingAlgOrThrow("d R U R'"))).resolves.toBe(
      'EDGES:IIIIIIIIIII-,CORNERS:II-IIIII,CENTERS:------',
    );
  });

  it('PLL は手順の持ち替えに影響されない', async () => {
    await expect(stickeringMaskOf('pll', FRAME, cubingAlgOrThrow("y R U R'"))).resolves.toBe(
      stickeringMaskFor('pll', FRAME, frontColorTurns(FRAME)),
    );
  });

  it('x が残る手順は側面の並びに載らないので灰にしない', async () => {
    await expect(stickeringMaskOf('f2l', FRAME, cubingAlgOrThrow("x R U R'"))).resolves.toBeNull();
  });

  it('z が残る手順は正面の色が変わらないので、上面の色で見分けて灰にしない', async () => {
    await expect(stickeringMaskOf('f2l', FRAME, cubingAlgOrThrow("z R U R'"))).resolves.toBeNull();
  });
});
