import type { Alg } from 'cubing/alg';

import type { TopView } from '@/lib/figure/view';

import { applyAlg, type CubeState, solvedState } from './kpuzzle';
import { setupAlgFor } from './setup';
import { faceletsOf } from './stickers';

// 手順の適用前の状態 (= パターン)。基本手順は図の枠 (黄上・緑前) で書かれているので、
// 再生の開始姿勢と同じ手順 (z2 で持ち替えてから逆手順) を揃った状態に掛ける
const FIGURE_FRAME = { topColor: 'yellow', frontColor: 'green' } as const;

export async function caseStartState(alg: Alg): Promise<CubeState> {
  return applyAlg(await solvedState(), setupAlgFor(alg, FIGURE_FRAME));
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
