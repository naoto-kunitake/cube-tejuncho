import { Alg } from 'cubing/alg';
import type { KPattern, KPuzzle } from 'cubing/kpuzzle';
import { cube3x3x3 } from 'cubing/puzzles';

// cubing.js の 3x3x3 の定義は非同期に読み込まれる。1 度だけ読み、以後は同じものを使う
let kpuzzlePromise: Promise<KPuzzle> | null = null;

export function loadKPuzzle(): Promise<KPuzzle> {
  kpuzzlePromise ??= cube3x3x3.kpuzzle();
  return kpuzzlePromise;
}

// cubing.js の「状態」(KPattern) はアプリの Pattern と衝突するので、外には cubeState の語で出す
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
