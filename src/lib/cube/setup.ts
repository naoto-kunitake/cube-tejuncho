import type { Alg } from 'cubing/alg';

import { frontColorTurns, type ViewSettings } from '@/lib/figure/view';

import { invertAlg } from './alg';

const Y_TURNS = ['', 'y', 'y2', "y'"] as const;

// 再生の開始姿勢: cubing.js の既定 (白上・緑前) から、上面の設定 (黄上なら z2)、前面の色 (y を k 回)、手順の逆の順。
// z2 のあとは右が橙になり、黄上の側面の並び (緑→橙→青→赤) と一致する
export function setupAlgFor(alg: Alg, settings: ViewSettings): string {
  const turns = frontColorTurns(settings);
  const yTurn = Y_TURNS[turns];
  if (yTurn === undefined) {
    throw new Error(`frontColorTurns out of range: ${turns}`);
  }
  const parts: string[] = [settings.topColor === 'yellow' ? 'z2' : '', yTurn, invertAlg(alg).toString()];
  return parts.filter((part) => part !== '').join(' ');
}
