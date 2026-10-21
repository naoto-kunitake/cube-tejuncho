import { frontColorTurns, type ViewSettings } from '@/lib/figure/view';

import type { Face } from './stickers';

export type StickeringCategory = 'pll' | 'oll' | 'f2l';

const EDGE_POSITIONS = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'] as const;
const CORNER_POSITIONS = ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'] as const;
const CENTER_POSITIONS = ['U', 'L', 'F', 'R', 'B', 'D'] as const;

// y を k 回したあとの「図の枠の面」が、持ち替える前の cubing.js のどの面か
const Y_TURNED: readonly Record<'F' | 'R' | 'B' | 'L', Face>[] = [
  { F: 'F', R: 'R', B: 'B', L: 'L' },
  { F: 'R', R: 'B', B: 'L', L: 'F' },
  { F: 'B', R: 'L', B: 'F', L: 'R' },
  { F: 'L', R: 'F', B: 'R', L: 'B' },
];
const Z2: Record<Face, Face> = { U: 'D', D: 'U', F: 'F', B: 'B', R: 'L', L: 'R' };

// 図の枠 (上面と前面の設定で持ち替えたあと) の面が、cubing.js の枠のどの面に当たるか。
// cubing.js のパーツの番号は白上・緑前の枠で付くので、開始姿勢の持ち替え (z2、y^k) を逆にたどる
function toCubingFace(settings: ViewSettings): (face: Face) => Face {
  const turned = Y_TURNED[frontColorTurns(settings)] ?? Y_TURNED[0];
  const flip = settings.topColor === 'yellow';
  return (face) => {
    const side = face === 'U' || face === 'D' ? face : (turned?.[face] ?? face);
    return flip ? Z2[side] : side;
  };
}

function hasFaces(position: string, faces: readonly Face[]): boolean {
  return faces.every((face) => position.includes(face));
}

// 関係ないパーツを灰にする指定 (cubing.js の experimentalStickeringMaskOrbits)。
// 文字: "-" 通常、"I" 灰、"O" 主ステッカー (上面側) 以外を灰 (OLL 用)。"D" (薄い色) は見分けがつきにくいので使わない。
// PLL = 上層のパーツは通常・他は灰・センターは下以外通常。OLL = 上層のパーツは O・他は灰・センターは上だけ通常。
// F2L = ペアのコーナー (下・前・右) とエッジ (前・右) だけ通常・センターは全部通常・他は灰
export function stickeringMaskFor(category: StickeringCategory, settings: ViewSettings): string {
  const toCubing = toCubingFace(settings);
  const top = toCubing('U');
  const bottom = toCubing('D');
  const front = toCubing('F');
  const right = toCubing('R');
  let edges: string[];
  let corners: string[];
  let centers: string[];
  if (category === 'f2l') {
    edges = EDGE_POSITIONS.map((position) => (hasFaces(position, [front, right]) ? '-' : 'I'));
    corners = CORNER_POSITIONS.map((position) => (hasFaces(position, [bottom, front, right]) ? '-' : 'I'));
    centers = CENTER_POSITIONS.map(() => '-');
  } else {
    const lastLayer = category === 'pll' ? '-' : 'O';
    edges = EDGE_POSITIONS.map((position) => (position.includes(top) ? lastLayer : 'I'));
    corners = CORNER_POSITIONS.map((position) => (position.includes(top) ? lastLayer : 'I'));
    centers = CENTER_POSITIONS.map((position) => {
      if (position === top) {
        return '-';
      }
      return category === 'pll' && position !== bottom ? '-' : 'I';
    });
  }
  return `EDGES:${edges.join('')},CORNERS:${corners.join('')},CENTERS:${centers.join('')}`;
}
