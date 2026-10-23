import { describe, expect, it } from 'vitest';

import { cueView, orientationView, pairView, recolorCubeView, recolorView, type TopView } from './view';

const UA: TopView = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'O', 'G'],
  r: ['O', 'R', 'O'],
  b: ['B', 'B', 'B'],
  l: ['R', 'G', 'R'],
};

describe('recolorView', () => {
  it('黄上で前面が緑なら色を変えない', () => {
    expect(recolorView(UA, { topColor: 'yellow', frontColor: 'green' })).toEqual(UA);
  });

  it('白上では黄と白、赤と橙を入れ替える', () => {
    const view = recolorView(UA, { topColor: 'white', frontColor: 'green' });
    expect(view.u[0]).toBe('W');
    expect(view.f).toEqual(['G', 'R', 'G']);
    expect(view.l).toEqual(['O', 'G', 'O']);
  });

  it('前面を赤にすると側面の色が巡回する', () => {
    const view = recolorView(UA, { topColor: 'yellow', frontColor: 'red' });
    expect(view.b).toEqual(['O', 'O', 'O']);
    expect(view.f).toEqual(['R', 'G', 'R']);
  });

  it('前面を青や橙にしても側面の色が巡回する', () => {
    expect(recolorView(UA, { topColor: 'yellow', frontColor: 'blue' }).f).toEqual(['B', 'R', 'B']);
    expect(recolorView(UA, { topColor: 'yellow', frontColor: 'orange' }).f).toEqual(['O', 'B', 'O']);
  });

  it('白上で前面を橙にすると赤と橙の入れ替えのあとに巡回する', () => {
    expect(recolorView(UA, { topColor: 'white', frontColor: 'orange' }).f).toEqual(['O', 'G', 'O']);
  });

  it('白上で前面を赤にしても前面の色は赤になる', () => {
    const view = recolorView({ ...UA, f: ['G', 'G', 'G'] }, { topColor: 'white', frontColor: 'red' });
    expect(view.f).toEqual(['R', 'R', 'R']);
  });
});

describe('cueView', () => {
  it('ヘッドライトと 2 連と 3 連だけを残し、ほかは灰にする', () => {
    const view = cueView({
      u: UA.u,
      f: ['G', 'G', 'O'],
      r: ['G', 'R', 'B'],
      b: ['B', 'B', 'O'],
      l: ['R', 'O', 'R'],
    });
    expect(view.f).toEqual(['G', 'G', 'N']);
    expect(view.r).toEqual(['N', 'N', 'N']);
    expect(view.b).toEqual(['B', 'B', 'N']);
    expect(view.l).toEqual(['R', 'N', 'R']);
  });

  it('3 連はそのまま残す', () => {
    expect(cueView(UA).b).toEqual(['B', 'B', 'B']);
  });

  it('上面には手を加えない', () => {
    expect(cueView(UA).u).toEqual(UA.u);
  });
});

describe('recolorCubeView', () => {
  const view = {
    u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'R'],
    f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W'],
    r: ['O', 'O', 'O', 'O', 'O', 'O', 'Y', 'O', 'O'],
  } as const;

  it('白上では黄↔白と赤↔橙を入れ替える', () => {
    const recolored = recolorCubeView(view, { topColor: 'white', frontColor: 'green' });
    expect(recolored.u[0]).toBe('W');
    expect(recolored.u[8]).toBe('O');
    expect(recolored.f[8]).toBe('Y');
    expect(recolored.r[0]).toBe('R');
  });

  it('前面を赤にすると側面の色が 1 つ巡回する', () => {
    const recolored = recolorCubeView(view, { topColor: 'yellow', frontColor: 'red' });
    expect(recolored.f[0]).toBe('R');
    expect(recolored.r[0]).toBe('G');
  });
});

describe('pairView', () => {
  it('ペアのステッカーと中心だけ色を残し、他は灰', () => {
    const view = {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'R'],
      f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W'],
      r: ['O', 'O', 'O', 'O', 'O', 'O', 'Y', 'O', 'O'],
    } as const;
    const none = [false, false, false, false, false, false, false, false, false] as const;
    const last = [false, false, false, false, false, false, false, false, true] as const;
    const figure = pairView(view, { u: last, f: last, r: none });
    expect(figure.u).toEqual(['N', 'N', 'N', 'N', 'Y', 'N', 'N', 'N', 'R']);
    expect(figure.f).toEqual(['N', 'N', 'N', 'N', 'G', 'N', 'N', 'N', 'W']);
    expect(figure.r).toEqual(['N', 'N', 'N', 'N', 'O', 'N', 'N', 'N', 'N']);
  });
});

describe('orientationView', () => {
  const OLL_27: TopView = {
    u: ['Y', 'Y', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'G'],
    f: ['Y', 'G', 'O'],
    r: ['Y', 'O', 'B'],
    b: ['Y', 'B', 'R'],
    l: ['R', 'R', 'G'],
  };

  it('黄上では黄のステッカーだけ残し、他は灰', () => {
    const figure = orientationView(OLL_27, 'yellow');
    expect(figure.u).toEqual(['Y', 'Y', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'N']);
    expect(figure.f).toEqual(['Y', 'N', 'N']);
    expect(figure.l).toEqual(['N', 'N', 'N']);
  });

  it('白上では白のステッカーだけ残す', () => {
    const recolored = recolorView(OLL_27, { topColor: 'white', frontColor: 'green' });
    const figure = orientationView(recolored, 'white');
    expect(figure.u.filter((color) => color === 'W')).toHaveLength(7);
    expect(figure.u.filter((color) => color === 'N')).toHaveLength(2);
  });
});
