import type { CubeView, PairMask } from './view';

// 右前スロットの位置 (3面の図の添字)。コーナーは前面の右下と右面の左下、エッジは前面の右中と右面の左中
const SLOT_CORNER_FRONT = 8;
const SLOT_CORNER_RIGHT = 6;
const SLOT_EDGE_FRONT = 5;
const TOP_CORNERS = [0, 2, 6, 8] as const;

export type WhiteFacing = 'down' | 'front' | 'right';
export type F2lDescription =
  | { kind: 'bothUp' }
  | { kind: 'cornerInSlot'; whiteFacing: WhiteFacing }
  | { kind: 'edgeInSlot'; isWhiteUp: boolean }
  | { kind: 'bothInSlot'; whiteFacing: WhiteFacing };

// 判断の文章の手がかり: パーツの位置と、コーナーの白 (クロスの色) の向き。両方上面のときは群の名前で足りるので位置だけ返す
export function describeF2l(view: CubeView, pair: PairMask): F2lDescription {
  const isCornerInSlot = pair.f[SLOT_CORNER_FRONT];
  const isEdgeInSlot = pair.f[SLOT_EDGE_FRONT];
  const whiteFacing = (): WhiteFacing => {
    if (view.f[SLOT_CORNER_FRONT] === 'W') {
      return 'front';
    }
    return view.r[SLOT_CORNER_RIGHT] === 'W' ? 'right' : 'down';
  };
  if (isCornerInSlot && isEdgeInSlot) {
    return { kind: 'bothInSlot', whiteFacing: whiteFacing() };
  }
  if (isCornerInSlot) {
    return { kind: 'cornerInSlot', whiteFacing: whiteFacing() };
  }
  if (isEdgeInSlot) {
    const isWhiteUp = TOP_CORNERS.some((index) => pair.u[index] && view.u[index] === 'W');
    return { kind: 'edgeInSlot', isWhiteUp };
  }
  return { kind: 'bothUp' };
}
