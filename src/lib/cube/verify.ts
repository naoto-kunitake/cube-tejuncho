import { Alg } from 'cubing/alg';

import { applyAlg, type CubeState, isSolved, solvedState } from './kpuzzle';
import type { StickeringCategory } from './stickering';
import { faceletsOf } from './stickers';

// 手順の前の状態 (= パターン)。基本手順の逆を揃った状態に掛ける。比べるだけなので枠はcubing.jsの既定のまま持ち替えない
async function caseStateOf(standardAlg: Alg): Promise<CubeState> {
  return applyAlg(await solvedState(), standardAlg.invert());
}

const AUF = ['', 'U', 'U2', "U'"] as const;
const Y_TURNS = ['', 'y', 'y2', "y'"] as const;
// 全体の向き24通り (上に来る面6通り × y)
const ROTATIONS = ['', 'x', "x'", 'x2', 'z', "z'"].flatMap((tilt) => Y_TURNS.map((turn) => `${tilt} ${turn}`.trim()));

function hasCentersInPlace(state: CubeState): boolean {
  const centers = state.patternData.CENTERS;
  if (centers === undefined) {
    throw new Error('CENTERS orbit is missing');
  }
  return centers.pieces.every((piece, index) => piece === index);
}

// 手順の中の持ち替え (x y z) を打ち消して、中心が既定の位置に来る向きに戻す。
// 全体の回転は中心の並びに1対1で効くので、24通りのうち必ず1つが当たる
function uprightOf(state: CubeState): CubeState {
  const upright = ROTATIONS.map((rotation) => applyAlg(state, rotation)).find(hasCentersInPlace);
  if (upright === undefined) {
    throw new Error('no rotation brings centers home');
  }
  return upright;
}

// OLLは上面の向きだけを揃える手順で、上層の並びは問わない。上面と下面が1色で、側面の下2段が中心と同じ色なら揃っている
function isOllSolved(state: CubeState): boolean {
  const facelets = faceletsOf(uprightOf(state));
  const isUniform = (face: readonly string[]) => face.every((color) => color === face[4]);
  const sides = ['F', 'B', 'R', 'L'] as const;
  // 側面の9枚は上段 (0〜2)・中段・下段の順 (stickers.tsのFACELET_ORDER) なので、3枚目からが下2段
  return (
    isUniform(facelets.U) &&
    isUniform(facelets.D) &&
    sides.every((side) => facelets[side].slice(3).every((color) => color === facelets[side][4]))
  );
}

function isCaseSolved(category: StickeringCategory, state: CubeState): boolean {
  return category === 'oll' ? isOllSolved(state) : isSolved(state);
}

// 手順がそのパターンを揃えるか。手順の前後の上面の回し (AUF) と持ち替え (y) の違いは同じ手順と見なす
// (図と違う角度で覚えた手順や、AUFを省いた手順を弾かないため)。64通りの総当たりでも119件で数十ms
export async function solvesCase(category: StickeringCategory, standardAlg: Alg, alg: Alg): Promise<boolean> {
  const start = await caseStateOf(standardAlg);
  const moves = alg.toString();
  return Y_TURNS.some((turn) =>
    AUF.some((before) =>
      AUF.some((after) => isCaseSolved(category, applyAlg(start, new Alg(`${turn} ${before} ${moves} ${after}`)))),
    ),
  );
}
