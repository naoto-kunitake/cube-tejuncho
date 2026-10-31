import { Alg } from 'cubing/alg';
import type { KPattern, KPuzzle } from 'cubing/kpuzzle';
import { cube3x3x3 } from 'cubing/puzzles';

// cubing.jsの3x3x3の定義は非同期に読み込まれる。1度だけ読み、以後は同じものを使う
let kpuzzlePromise: Promise<KPuzzle> | null = null;

export function loadKPuzzle(): Promise<KPuzzle> {
  kpuzzlePromise ??= cube3x3x3.kpuzzle();
  return kpuzzlePromise;
}

// cubing.jsの「状態」(KPattern) はアプリのPatternと衝突するので、外にはcubeStateの語で出す
export type CubeState = KPattern;

export async function solvedState(): Promise<CubeState> {
  const kpuzzle = await loadKPuzzle();
  return kpuzzle.defaultPattern();
}

export function applyAlg(state: CubeState, alg: Alg | string): CubeState {
  return state.applyAlg(typeof alg === 'string' ? new Alg(alg) : alg);
}

export function isSolved(state: CubeState): boolean {
  return state.experimentalIsSolved({ ignorePuzzleOrientation: true, ignoreCenterOrientation: true });
}
