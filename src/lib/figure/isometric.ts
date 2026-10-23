// 3 面の図 (F2L) の等角投影。x 右下・z 左下・y 上の軸で、上面・前面・右面の 27 枚を多角形にする。
// 立方体は幅 5.2s × 高さ 6s。上面図と同じく viewBox 86 のうち外側 4 を空けた 78 に収める → s = 13 (高さ 78、幅 67.6 を中央に)
const VIEW_SIZE = 86;
const SCALE = 13;
const CENTER = VIEW_SIZE / 2;
const STICKER_GAP = 0.06;
const COS_30 = 0.866;

export const ISOMETRIC_VIEW_BOX = `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`;

type Point = readonly [number, number];
type Point3 = readonly [number, number, number];

export type CubeFace = 'u' | 'f' | 'r';
export type IsometricSticker = { face: CubeFace; index: number; points: string };

function project([x, y, z]: Point3): Point {
  return [CENTER + (x - z) * COS_30 * SCALE, CENTER + (x + z) * 0.5 * SCALE - y * SCALE];
}

function polygon(corners: readonly Point3[]): string {
  return corners
    .map(project)
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
}

const COORDS = [-1, 0, 1] as const;
const HALF = 0.5 - STICKER_GAP;
const OUTER = 1.5;

function stickersOf(): IsometricSticker[] {
  const stickers: IsometricSticker[] = [];
  // 上面: 行は後 (z = -1) → 前、列は左 (x = -1) → 右
  for (const z of COORDS) {
    for (const x of COORDS) {
      const corners: Point3[] = [
        [x - HALF, OUTER, z - HALF],
        [x + HALF, OUTER, z - HALF],
        [x + HALF, OUTER, z + HALF],
        [x - HALF, OUTER, z + HALF],
      ];
      stickers.push({ face: 'u', index: (z + 1) * 3 + (x + 1), points: polygon(corners) });
    }
  }
  // 前面: 行は上 (y = 1) → 下、列は左 → 右
  for (const y of [1, 0, -1] as const) {
    for (const x of COORDS) {
      const corners: Point3[] = [
        [x - HALF, y + HALF, OUTER],
        [x + HALF, y + HALF, OUTER],
        [x + HALF, y - HALF, OUTER],
        [x - HALF, y - HALF, OUTER],
      ];
      stickers.push({ face: 'f', index: (1 - y) * 3 + (x + 1), points: polygon(corners) });
    }
  }
  // 右面: 行は上 → 下、列は前 (z = 1) → 後 (右面を正面から見た向きと同じ)
  for (const y of [1, 0, -1] as const) {
    for (const z of [1, 0, -1] as const) {
      const corners: Point3[] = [
        [OUTER, y + HALF, z + HALF],
        [OUTER, y + HALF, z - HALF],
        [OUTER, y - HALF, z - HALF],
        [OUTER, y - HALF, z + HALF],
      ];
      stickers.push({ face: 'r', index: (1 - y) * 3 + (1 - z), points: polygon(corners) });
    }
  }
  return stickers;
}

export const ISOMETRIC_STICKERS: readonly IsometricSticker[] = stickersOf();
