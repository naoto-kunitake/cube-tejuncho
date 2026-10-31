import type { StickerColor, TopFace } from '@/lib/figure/view';

import type { CubeState } from './kpuzzle';

export type Face = 'U' | 'D' | 'F' | 'B' | 'R' | 'L';

// cubing.jsの3x3x3のパーツの並び (白が上・緑が前の枠で定義される)
const EDGE_POSITIONS = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'] as const;
const CORNER_POSITIONS = ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'] as const;
const CENTER_POSITIONS = ['U', 'L', 'F', 'R', 'B', 'D'] as const;

// cubing.jsの既定の配色 (白上・緑前)
const FACE_COLOR: Record<Face, StickerColor> = { U: 'W', D: 'Y', F: 'G', B: 'B', R: 'R', L: 'O' };
const FACES: readonly Face[] = CENTER_POSITIONS;

function facesOf(position: string): Face[] {
  return [...position].filter((char): char is Face => char in FACE_COLOR);
}

type EdgeColors = readonly [StickerColor, StickerColor];
type CornerColors = readonly [StickerColor, StickerColor, StickerColor];

// 色の組からパーツの名前 (白上・緑前の枠) を引く。例: [W, G, O] → ULF、[G, O] → FL
export function pieceOfColors(colors: EdgeColors | CornerColors): string {
  const faces = colors.map((color) => {
    const face = FACES.find((entry) => FACE_COLOR[entry] === color);
    if (face === undefined) {
      throw new Error(`unknown color ${color}`);
    }
    return face;
  });
  const positions: readonly string[] = colors.length === 2 ? EDGE_POSITIONS : CORNER_POSITIONS;
  const piece = positions.find((position) => faces.every((face) => position.includes(face)));
  if (piece === undefined) {
    throw new Error(`no piece with colors ${colors.join('')}`);
  }
  return piece;
}

// 面ごとの9枚 (左上から行ごと)。各面を正面から見た向きで、UはB側が上、DはF側が上
const FACELET_ORDER: Record<Face, TopFace<string>> = {
  U: ['UBL', 'UB', 'URB', 'UL', 'U', 'UR', 'ULF', 'UF', 'UFR'],
  D: ['DFL', 'DF', 'DRF', 'DL', 'D', 'DR', 'DLB', 'DB', 'DBR'],
  F: ['ULF', 'UF', 'UFR', 'FL', 'F', 'FR', 'DFL', 'DF', 'DRF'],
  B: ['URB', 'UB', 'UBL', 'BR', 'B', 'BL', 'DBR', 'DB', 'DLB'],
  R: ['UFR', 'UR', 'URB', 'FR', 'R', 'BR', 'DRF', 'DR', 'DBR'],
  L: ['UBL', 'UL', 'ULF', 'BL', 'L', 'FL', 'DLB', 'DL', 'DFL'],
};

export type Facelets = Record<Face, TopFace<StickerColor>>;

type PlacedPiece = { piece: string; orientation: number };

// 位置positionにあるパーツ (白上・緑前の枠での名前) とその向き
function placedPieceAt(state: CubeState, position: string): PlacedPiece {
  const orbitName = position.length === 1 ? 'CENTERS' : position.length === 2 ? 'EDGES' : 'CORNERS';
  const positions: readonly string[] =
    orbitName === 'CENTERS' ? CENTER_POSITIONS : orbitName === 'EDGES' ? EDGE_POSITIONS : CORNER_POSITIONS;
  const index = positions.indexOf(position);
  const orbit = state.patternData[orbitName];
  if (index < 0 || orbit === undefined) {
    throw new Error(`unknown position ${position}`);
  }
  const pieceIndex = orbit.pieces[index];
  const orientation = orbit.orientation[index];
  if (pieceIndex === undefined || orientation === undefined) {
    throw new Error(`corrupt pattern data at ${position}`);
  }
  const piece = positions[pieceIndex];
  if (piece === undefined) {
    throw new Error(`unknown piece index ${pieceIndex} at ${position}`);
  }
  return { piece, orientation };
}

// 位置positionの面faceに見えているステッカーの色。向きoは「位置の面iにパーツのステッカー (i + o) が来る」の規約
function stickerAt(state: CubeState, position: string, face: Face): StickerColor {
  const { piece, orientation } = placedPieceAt(state, position);
  const positionFaces = facesOf(position);
  const pieceFaces = facesOf(piece);
  const faceIndex = positionFaces.indexOf(face);
  const count = positionFaces.length;
  const pieceFace = pieceFaces[(faceIndex + orientation) % count];
  if (pieceFace === undefined) {
    throw new Error(`orientation out of range at ${position}`);
  }
  return FACE_COLOR[pieceFace];
}

function faceOf(state: CubeState, face: Face): TopFace<StickerColor> {
  const [a, b, c, d, e, f, g, h, i] = FACELET_ORDER[face];
  const at = (position: string) => stickerAt(state, position, face);
  return [at(a), at(b), at(c), at(d), at(e), at(f), at(g), at(h), at(i)];
}

export function faceletsOf(state: CubeState): Facelets {
  return {
    U: faceOf(state, 'U'),
    D: faceOf(state, 'D'),
    F: faceOf(state, 'F'),
    B: faceOf(state, 'B'),
    R: faceOf(state, 'R'),
    L: faceOf(state, 'L'),
  };
}

// 面ごとの9枚それぞれに、どのパーツが来ているか (パーツは白上・緑前の枠での名前。例: 白・緑・橙のコーナーはULF)
export function pieceFaceOf(state: CubeState, face: Face): TopFace<string> {
  const [a, b, c, d, e, f, g, h, i] = FACELET_ORDER[face];
  const at = (position: string) => placedPieceAt(state, position).piece;
  return [at(a), at(b), at(c), at(d), at(e), at(f), at(g), at(h), at(i)];
}
