import { formatMove, type WideStyle } from '@/lib/alg/format';
import { type MoveBase, parseAlg } from '@/lib/alg/parse';
import type { MoveFigureMove } from '@/lib/figure/move';

export const NOTATION_SECTION_IDS = ['face', 'direction', 'slice', 'wide', 'rotation', 'group'] as const;
export type NotationSectionId = (typeof NOTATION_SECTION_IDS)[number];

const FACES = ['R', 'L', 'U', 'D', 'F', 'B'] as const;
const DIRECTIONS = ['prime', 'double'] as const;
const SLICES = ['M', 'E', 'S'] as const;
const ROTATIONS = ['x', 'y', 'z'] as const;

// 行の id は文言の鍵でもあるので、取りうる値をここで尽くす
export type NotationRowId =
  | (typeof FACES)[number]
  | (typeof DIRECTIONS)[number]
  | (typeof SLICES)[number]
  | `wide${(typeof FACES)[number]}`
  | (typeof ROTATIONS)[number]
  | 'group';

export type NotationRow = {
  id: NotationRowId;
  symbol: string;
  // 再生する 1 手。括弧の行は再生も図もない
  move: (MoveFigureMove & { alg: string }) | null;
};
export type NotationSection = { id: NotationSectionId; rows: readonly NotationRow[] };

function rowOf(id: NotationRowId, alg: string, wideStyle: WideStyle): NotationRow {
  const parsed = parseAlg(alg);
  const first = parsed.ok ? parsed.value[0] : undefined;
  if (first?.kind !== 'move') {
    throw new Error(`invalid notation row: ${alg}`);
  }
  const symbol = formatMove(first, wideStyle);
  return { id, symbol, move: { base: first.base, isWide: first.isWide, alg: symbol } };
}

// 回転記号の画面の 6 区画 21 行 (WCA の記法の構成)。2 層回しの記号は設定の表記 (r / Rw) に揃える
export function notationSectionsOf(wideStyle: WideStyle): NotationSection[] {
  const faceRow = (face: MoveBase) => rowOf(face, face, wideStyle);
  return [
    { id: 'face', rows: FACES.map(faceRow) },
    { id: 'direction', rows: [rowOf(DIRECTIONS[0], "R'", wideStyle), rowOf(DIRECTIONS[1], 'R2', wideStyle)] },
    { id: 'slice', rows: SLICES.map(faceRow) },
    { id: 'wide', rows: FACES.map((face) => rowOf(`wide${face}`, face.toLowerCase(), wideStyle)) },
    { id: 'rotation', rows: ROTATIONS.map(faceRow) },
    { id: 'group', rows: [{ id: 'group', symbol: '( )', move: null }] },
  ];
}
