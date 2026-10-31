import type { Alg } from 'cubing/alg';

import {
  type CubeView,
  mapFace,
  type PairMask,
  type StickerColor,
  type TopView,
  type ViewSettings,
} from '@/lib/figure/view';

import { applyAlg, type CubeState, solvedState } from './kpuzzle';
import { setupAlgFor } from './setup';
import { type Facelets, faceletsOf, pieceFaceOf, pieceOfColors } from './stickers';

// 手順の適用前の状態 (= パターン)。基本手順は図の枠 (黄上・緑前) で書かれているので、
// 再生の開始姿勢と同じ手順 (z2で持ち替えてから逆手順) を揃った状態に掛ける
const FIGURE_FRAME = { topColor: 'yellow', frontColor: 'green' } as const;

// 再生の開始状態 (手順の適用前)
export async function startStateOf(alg: Alg, settings: ViewSettings): Promise<CubeState> {
  return applyAlg(await solvedState(), setupAlgFor(alg, settings));
}

export async function caseStartState(alg: Alg): Promise<CubeState> {
  return startStateOf(alg, FIGURE_FRAME);
}

// 開始状態で正面に来ている中心の色。手順の中の持ち替え (y、d) の分だけ設定の前面の色からずれる
export function frontCenterOf(state: CubeState): StickerColor {
  return faceletsOf(state).F[4];
}

// 開始状態で上面に来ている中心の色。設定の上面の色と違えば、y以外の持ち替え (x、z) が残っている
export function topCenterOf(state: CubeState): StickerColor {
  return faceletsOf(state).U[4];
}

// 図の枠 (黄上・緑前) に持ち替え済みの状態から上面図を読む。側面は上から見て左から右の順 (後面と右面は正面から見た順の逆)
export function topViewOf(state: CubeState): TopView {
  const facelets = faceletsOf(state);
  const [u0, u1, u2, u3, u4, u5, u6, u7, u8] = facelets.U;
  const [f0, f1, f2] = facelets.F;
  const [r0, r1, r2] = facelets.R;
  const [b0, b1, b2] = facelets.B;
  const [l0, l1, l2] = facelets.L;
  return {
    u: [u0, u1, u2, u3, u4, u5, u6, u7, u8],
    f: [f0, f1, f2],
    r: [r2, r1, r0],
    b: [b2, b1, b0],
    l: [l0, l1, l2],
  };
}

// 黄上の側面の色の並び (前 → 右 → 後 → 左)
const SIDE_SEQUENCE: readonly [StickerColor, StickerColor, StickerColor, StickerColor] = ['G', 'O', 'B', 'R'];

function sideColorAt(index: number): StickerColor {
  const color = SIDE_SEQUENCE[((index % SIDE_SEQUENCE.length) + SIDE_SEQUENCE.length) % SIDE_SEQUENCE.length];
  if (color === undefined) {
    throw new Error(`side index out of range: ${index}`);
  }
  return color;
}

// F2Lの手順はy回転を含むことがあり、逆手順の終わりに全体が回った姿勢になる。
// 全体のy回転は側面の色の巡回と同じなので、前の中心が何番目の色かを「ずれ」として持ち、図とペアの判定で同じずれを使う
function sideShiftOf(state: CubeState): { facelets: Facelets; shift: number } {
  const facelets = faceletsOf(state);
  const shift = SIDE_SEQUENCE.indexOf(facelets.F[4]);
  if (shift < 0) {
    throw new Error(`front center is not a side color: ${facelets.F[4]}`);
  }
  return { facelets, shift };
}

// 図の枠に持ち替え済みの状態から3面 (上・前・右) を読む。前の中心が緑になるよう側面の色を付け替える
export function cubeViewOf(state: CubeState): CubeView {
  const { facelets, shift } = sideShiftOf(state);
  const recolor = (color: StickerColor): StickerColor => {
    const index = SIDE_SEQUENCE.indexOf(color);
    return index < 0 ? color : sideColorAt(index - shift);
  };
  return { u: mapFace(facelets.U, recolor), f: mapFace(facelets.F, recolor), r: mapFace(facelets.R, recolor) };
}

// 右前スロットのペア: 色を付け替える前の「前」と「右」の色と白のコーナー、「前」と「右」のエッジ
export function pairMaskOf(state: CubeState): PairMask {
  const { shift } = sideShiftOf(state);
  const front = sideColorAt(shift);
  const right = sideColorAt(shift + 1);
  const pair = new Set([pieceOfColors(['W', front, right]), pieceOfColors([front, right])]);
  const mask = (face: 'U' | 'F' | 'R') => mapFace(pieceFaceOf(state, face), (piece) => pair.has(piece));
  return { u: mask('U'), f: mask('F'), r: mask('R') };
}
