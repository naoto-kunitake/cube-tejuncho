import type { MoveBase } from '@/lib/alg/parse';

import type { CubeFace } from './isometric';
import { type CubeFigureView, mapFace, recolorCubeView, type TopFace, type ViewSettings } from './view';

type LayerMask = Partial<Record<CubeFace, readonly number[] | 'all'>>;

type FaceOrSlice = Exclude<MoveBase, 'x' | 'y' | 'z'>;

// 各記号で動く層のステッカー。添字は等角投影の図と同じ
// (上面: 後→前の行・左→右の列 / 前面: 上→下・左→右 / 右面: 上→下・前→後)
const MOVING_LAYERS: Record<FaceOrSlice, LayerMask> = {
  R: { u: [2, 5, 8], f: [2, 5, 8], r: 'all' },
  L: { u: [0, 3, 6], f: [0, 3, 6] },
  U: { u: 'all', f: [0, 1, 2], r: [0, 1, 2] },
  D: { f: [6, 7, 8], r: [6, 7, 8] },
  F: { u: [6, 7, 8], f: 'all', r: [0, 3, 6] },
  B: { u: [0, 1, 2], r: [2, 5, 8] },
  M: { u: [1, 4, 7], f: [1, 4, 7] },
  E: { f: [3, 4, 5], r: [3, 4, 5] },
  S: { u: [3, 4, 5], r: [1, 4, 7] },
};

// 2 層回しは面と、その隣の中層
const WIDE_SLICE: Record<FaceOrSlice, FaceOrSlice> = {
  R: 'M',
  L: 'M',
  U: 'E',
  D: 'E',
  F: 'S',
  B: 'S',
  M: 'M',
  E: 'E',
  S: 'S',
};

const ALL_INDICES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function isRotation(base: MoveBase): base is 'x' | 'y' | 'z' {
  return base === 'x' || base === 'y' || base === 'z';
}

function layersOf(base: MoveBase, isWide: boolean): LayerMask[] {
  if (isRotation(base)) {
    return [{ u: 'all', f: 'all', r: 'all' }];
  }
  const layers = [MOVING_LAYERS[base]];
  if (isWide) {
    layers.push(MOVING_LAYERS[WIDE_SLICE[base]]);
  }
  return layers;
}

function movingIndicesOf(layers: readonly LayerMask[], face: CubeFace): ReadonlySet<number> {
  return new Set(
    layers.flatMap((layer) => {
      const mask = layer[face];
      if (mask === undefined) {
        return [];
      }
      return mask === 'all' ? ALL_INDICES : mask;
    }),
  );
}

export type MoveFigureMove = { base: MoveBase; isWide: boolean };

// 記号の説明に添える図: 動く層だけ色、ほかは灰。色の基準は 上 Y・前 G・右 O で、上面・前面の色の設定に合わせて置き換える
export function moveFigureView(move: MoveFigureMove, settings: ViewSettings): CubeFigureView {
  const solved: TopFace<'Y'> = ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'];
  const colored = recolorCubeView(
    { u: solved, f: mapFace(solved, () => 'G'), r: mapFace(solved, () => 'O') },
    settings,
  );
  const layers = layersOf(move.base, move.isWide);
  const keep = (face: CubeFace) => {
    const moving = movingIndicesOf(layers, face);
    return mapFace(colored[face], (color, index) => (moving.has(index) ? color : 'N'));
  };
  return { u: keep('u'), f: keep('f'), r: keep('r') };
}
