import { describe, expect, it } from 'vitest';

import { cueView, recolorView, type TopView } from './view';

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
