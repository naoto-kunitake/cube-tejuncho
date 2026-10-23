import type { CubeView, PairMask } from '@/lib/figure/view';

// 一覧の「種類ごと」の並び。パーツの位置 (両方上面 → 片方スロット → 両方スロット) が最上位で、両方上面の中は色の一致と白の向き
export const F2L_SHAPE_ORDER = [
  'bothUpSameColor',
  'bothUpDifferentColor',
  'bothUpWhiteUp',
  'cornerInSlot',
  'edgeInSlot',
  'bothInSlot',
] as const;
export type F2lShape = (typeof F2L_SHAPE_ORDER)[number];

export type F2lPreset = {
  id: string;
  name: string;
  shape: F2lShape;
  standardAlg: string;
  // 3 面の図の定義。黄上・緑前で、右前のスロットが崩れている
  view: CubeView;
  pair: PairMask;
};

// 番号順 (speedsolving wiki の 42 項目から「揃った状態」を除いて 1〜41 に振り直したもの)。基本手順は wiki の各項目の先頭の手順
export const F2L_PRESETS: readonly F2lPreset[] = [
  {
    id: 'f2l-1',
    name: 'F2L 1',
    shape: 'bothUpSameColor',
    standardAlg: "U (R U' R')",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'G', 'Y', 'Y', 'G'],
      f: ['G', 'G', 'W', 'G', 'G', 'Y', 'G', 'G', 'G'],
      r: ['O', 'O', 'Y', 'B', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-2',
    name: 'F2L 2',
    shape: 'bothUpSameColor',
    standardAlg: "F R' F' R",
    view: {
      u: ['Y', 'Y', 'G', 'Y', 'Y', 'G', 'B', 'O', 'O'],
      f: ['O', 'G', 'G', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['W', 'Y', 'Y', 'O', 'O', 'O', 'O', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-3',
    name: 'F2L 3',
    shape: 'bothUpDifferentColor',
    standardAlg: "F' U' F",
    view: {
      u: ['O', 'Y', 'Y', 'O', 'Y', 'Y', 'Y', 'Y', 'G'],
      f: ['G', 'G', 'W', 'G', 'G', 'O', 'G', 'G', 'O'],
      r: ['O', 'B', 'B', 'Y', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-4',
    name: 'F2L 4',
    shape: 'bothUpDifferentColor',
    standardAlg: "(R U R')",
    view: {
      u: ['G', 'G', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'O'],
      f: ['R', 'R', 'G', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['W', 'O', 'O', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-5',
    name: 'F2L 5',
    shape: 'bothUpSameColor',
    standardAlg: "(U' R U R') U2 (R U' R')",
    view: {
      u: ['R', 'G', 'R', 'Y', 'Y', 'Y', 'Y', 'Y', 'G'],
      f: ['O', 'G', 'W', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['O', 'B', 'G', 'R', 'O', 'O', 'B', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-6',
    name: 'F2L 6',
    shape: 'bothUpSameColor',
    standardAlg: "U' r U' R' U R U r'",
    view: {
      u: ['Y', 'G', 'G', 'O', 'Y', 'Y', 'B', 'Y', 'O'],
      f: ['O', 'R', 'G', 'G', 'G', 'Y', 'G', 'G', 'B'],
      r: ['W', 'B', 'O', 'O', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-7',
    name: 'F2L 7',
    shape: 'bothUpSameColor',
    standardAlg: "U' (R U2' R') U2 (R U' R')",
    view: {
      u: ['R', 'Y', 'G', 'G', 'Y', 'Y', 'B', 'Y', 'G'],
      f: ['O', 'G', 'W', 'G', 'G', 'Y', 'G', 'G', 'R'],
      r: ['O', 'R', 'O', 'O', 'O', 'O', 'B', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-8',
    name: 'F2L 8',
    shape: 'bothUpSameColor',
    standardAlg: "r' U2 R2 U R2 U r",
    view: {
      u: ['Y', 'O', 'O', 'B', 'Y', 'Y', 'B', 'Y', 'O'],
      f: ['O', 'G', 'G', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['W', 'O', 'Y', 'R', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-9',
    name: 'F2L 9',
    shape: 'bothUpDifferentColor',
    standardAlg: "U' R U' R' U F' U' F",
    view: {
      u: ['O', 'O', 'O', 'O', 'Y', 'Y', 'R', 'Y', 'G'],
      f: ['B', 'G', 'W', 'G', 'G', 'Y', 'G', 'G', 'R'],
      r: ['O', 'R', 'Y', 'B', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-10',
    name: 'F2L 10',
    shape: 'bothUpDifferentColor',
    standardAlg: "U' (R U R' U)(R U R')",
    view: {
      u: ['Y', 'Y', 'B', 'G', 'Y', 'Y', 'G', 'Y', 'O'],
      f: ['R', 'R', 'G', 'G', 'G', 'Y', 'G', 'G', 'G'],
      r: ['W', 'G', 'R', 'B', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-11',
    name: 'F2L 11',
    shape: 'bothUpDifferentColor',
    standardAlg: "U' (R U2' R') d (R' U' R)",
    view: {
      u: ['R', 'O', 'O', 'Y', 'Y', 'O', 'G', 'Y', 'G'],
      f: ['Y', 'G', 'W', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['O', 'G', 'B', 'R', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-12',
    name: 'F2L 12',
    shape: 'bothUpDifferentColor',
    standardAlg: "R U' R' U R U' R' U2 R U' R'",
    view: {
      u: ['Y', 'Y', 'B', 'Y', 'Y', 'Y', 'R', 'G', 'O'],
      f: ['Y', 'O', 'G', 'G', 'G', 'Y', 'G', 'G', 'O'],
      r: ['W', 'B', 'R', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-13',
    name: 'F2L 13',
    shape: 'bothUpDifferentColor',
    standardAlg: "d (R' U R U') (R' U' R)",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'O', 'O', 'G'],
      f: ['G', 'G', 'W', 'G', 'G', 'G', 'G', 'G', 'Y'],
      r: ['O', 'B', 'G', 'Y', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-14',
    name: 'F2L 14',
    shape: 'bothUpDifferentColor',
    standardAlg: "U' (R U' R' U) (R U R')",
    view: {
      u: ['Y', 'Y', 'G', 'Y', 'Y', 'G', 'B', 'Y', 'O'],
      f: ['O', 'R', 'G', 'G', 'G', 'Y', 'G', 'G', 'B'],
      r: ['W', 'O', 'O', 'O', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-15',
    name: 'F2L 15',
    shape: 'bothUpSameColor',
    standardAlg: "R' D' R U' R' D R U (R U' R')",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'G', 'G'],
      f: ['O', 'O', 'W', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['O', 'O', 'O', 'B', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-16',
    name: 'F2L 16',
    shape: 'bothUpSameColor',
    standardAlg: "(R U' R' U) d (R' U' R)",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'O'],
      f: ['Y', 'Y', 'G', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['W', 'G', 'R', 'G', 'O', 'O', 'O', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-17',
    name: 'F2L 17',
    shape: 'bothUpWhiteUp',
    standardAlg: "(R U2 R') U' (R U R')",
    view: {
      u: ['Y', 'Y', 'G', 'Y', 'Y', 'G', 'O', 'Y', 'W'],
      f: ['Y', 'B', 'O', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['G', 'O', 'O', 'R', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-18',
    name: 'F2L 18',
    shape: 'bothUpWhiteUp',
    standardAlg: "y' (R' U2 R) U (R' U' R)",
    view: {
      u: ['Y', 'Y', 'G', 'Y', 'Y', 'Y', 'O', 'O', 'W'],
      f: ['G', 'G', 'O', 'G', 'G', 'B', 'G', 'G', 'B'],
      r: ['G', 'R', 'Y', 'Y', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-19',
    name: 'F2L 19',
    shape: 'bothUpWhiteUp',
    standardAlg: "U (R U2 R') U (R U' R')",
    view: {
      u: ['R', 'G', 'G', 'Y', 'Y', 'Y', 'G', 'Y', 'W'],
      f: ['Y', 'B', 'O', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['G', 'O', 'Y', 'R', 'O', 'O', 'B', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-20',
    name: 'F2L 20',
    shape: 'bothUpWhiteUp',
    standardAlg: "y' U' (R' U2 R) U' (R' U R)",
    view: {
      u: ['B', 'Y', 'O', 'O', 'Y', 'Y', 'O', 'Y', 'W'],
      f: ['Y', 'G', 'O', 'G', 'G', 'B', 'G', 'G', 'R'],
      r: ['G', 'R', 'Y', 'Y', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-21',
    name: 'F2L 21',
    shape: 'bothUpWhiteUp',
    standardAlg: "U2 R U R' U R U' R'",
    view: {
      u: ['Y', 'Y', 'Y', 'G', 'Y', 'Y', 'R', 'Y', 'W'],
      f: ['B', 'B', 'O', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['G', 'O', 'O', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, true, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-22',
    name: 'F2L 22',
    shape: 'bothUpWhiteUp',
    standardAlg: "r U' r' U2 r U r'",
    view: {
      u: ['Y', 'O', 'Y', 'Y', 'Y', 'G', 'Y', 'O', 'W'],
      f: ['G', 'Y', 'O', 'G', 'G', 'B', 'G', 'G', 'O'],
      r: ['G', 'Y', 'B', 'Y', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, true, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-23',
    name: 'F2L 23',
    shape: 'bothUpWhiteUp',
    standardAlg: "U R U' R' U' R U' R' U R U' R'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'G', 'W'],
      f: ['O', 'O', 'O', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['G', 'O', 'G', 'G', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, true],
      f: [false, true, true, false, false, false, false, false, false],
      r: [true, false, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-24',
    name: 'F2L 24',
    shape: 'bothUpWhiteUp',
    standardAlg: "(R U R') d (R' U R U') (R' U R)",
    view: {
      u: ['R', 'G', 'R', 'Y', 'Y', 'O', 'O', 'Y', 'W'],
      f: ['G', 'O', 'O', 'G', 'G', 'Y', 'G', 'G', 'Y'],
      r: ['G', 'G', 'G', 'B', 'O', 'O', 'B', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, true],
      f: [false, false, true, false, false, false, false, false, false],
      r: [true, true, false, false, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-25',
    name: 'F2L 25',
    shape: 'cornerInSlot',
    standardAlg: "U' (R' F R F') (R U R')",
    view: {
      u: ['O', 'Y', 'G', 'O', 'Y', 'G', 'Y', 'Y', 'B'],
      f: ['G', 'G', 'R', 'G', 'G', 'R', 'G', 'G', 'G'],
      r: ['Y', 'O', 'O', 'Y', 'O', 'O', 'O', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, false],
      f: [false, false, false, false, false, false, false, false, true],
      r: [false, true, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-26',
    name: 'F2L 26',
    shape: 'cornerInSlot',
    standardAlg: "y' R U R U R U' R' U' R'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'O', 'Y'],
      f: ['R', 'G', 'R', 'G', 'G', 'B', 'G', 'G', 'G'],
      r: ['G', 'G', 'G', 'Y', 'O', 'O', 'O', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, false],
      f: [false, true, false, false, false, false, false, false, true],
      r: [false, false, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-27',
    name: 'F2L 27',
    shape: 'cornerInSlot',
    standardAlg: "(R U' R' U)(R U' R')",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'G', 'G', 'Y', 'B'],
      f: ['Y', 'B', 'Y', 'G', 'G', 'Y', 'G', 'G', 'W'],
      r: ['O', 'O', 'Y', 'O', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, false],
      f: [false, false, false, false, false, false, false, false, true],
      r: [false, true, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-28',
    name: 'F2L 28',
    shape: 'cornerInSlot',
    standardAlg: "(R U R' U') F R' F' R",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'O', 'O'],
      f: ['O', 'G', 'Y', 'G', 'G', 'G', 'G', 'G', 'O'],
      r: ['G', 'B', 'B', 'Y', 'O', 'O', 'W', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, false],
      f: [false, true, false, false, false, false, false, false, true],
      r: [false, false, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-29',
    name: 'F2L 29',
    shape: 'cornerInSlot',
    standardAlg: "R' F R F' U R U' R'",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'Y', 'O', 'G'],
      f: ['R', 'G', 'O', 'G', 'G', 'G', 'G', 'G', 'W'],
      r: ['Y', 'B', 'G', 'Y', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, true, false],
      f: [false, true, false, false, false, false, false, false, true],
      r: [false, false, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-30',
    name: 'F2L 30',
    shape: 'cornerInSlot',
    standardAlg: "(R U R' U')(R U R')",
    view: {
      u: ['O', 'Y', 'G', 'Y', 'Y', 'G', 'Y', 'Y', 'G'],
      f: ['R', 'R', 'Y', 'G', 'G', 'Y', 'G', 'G', 'O'],
      r: ['R', 'O', 'O', 'O', 'O', 'O', 'W', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, true, false, false, false],
      f: [false, false, false, false, false, false, false, false, true],
      r: [false, true, false, false, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-31',
    name: 'F2L 31',
    shape: 'edgeInSlot',
    standardAlg: "U' R' F R F' R U' R'",
    view: {
      u: ['O', 'Y', 'Y', 'O', 'Y', 'Y', 'G', 'Y', 'W'],
      f: ['Y', 'B', 'O', 'G', 'G', 'O', 'G', 'G', 'Y'],
      r: ['G', 'R', 'R', 'G', 'O', 'O', 'R', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-32',
    name: 'F2L 32',
    shape: 'edgeInSlot',
    standardAlg: "U R U' R' U R U' R' U R U' R'",
    view: {
      u: ['B', 'Y', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'W'],
      f: ['G', 'G', 'O', 'G', 'G', 'G', 'G', 'G', 'O'],
      r: ['G', 'O', 'R', 'O', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-33',
    name: 'F2L 33',
    shape: 'edgeInSlot',
    standardAlg: "U' (R U' R') U2' (R U' R')",
    view: {
      u: ['G', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'Y', 'G'],
      f: ['Y', 'G', 'W', 'G', 'G', 'G', 'G', 'G', 'R'],
      r: ['O', 'O', 'O', 'O', 'O', 'O', 'Y', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-34',
    name: 'F2L 34',
    shape: 'edgeInSlot',
    standardAlg: "U (F' U F) U2 (F' U F)",
    view: {
      u: ['O', 'Y', 'R', 'Y', 'Y', 'Y', 'Y', 'Y', 'O'],
      f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'Y'],
      r: ['W', 'O', 'Y', 'O', 'O', 'O', 'B', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-35',
    name: 'F2L 35',
    shape: 'edgeInSlot',
    standardAlg: "U' R U R' U (F' U' F)",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'O', 'Y', 'Y', 'G'],
      f: ['B', 'G', 'W', 'G', 'G', 'O', 'G', 'G', 'O'],
      r: ['O', 'Y', 'G', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-36',
    name: 'F2L 36',
    shape: 'edgeInSlot',
    standardAlg: "U F' U' F U' (R U R')",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'G', 'O'],
      f: ['O', 'Y', 'G', 'G', 'G', 'O', 'G', 'G', 'O'],
      r: ['W', 'O', 'R', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, true],
      f: [false, false, true, false, false, true, false, false, false],
      r: [true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'f2l-37',
    name: 'F2L 37',
    shape: 'bothInSlot',
    standardAlg: "(R' F R F') (R U' R' U) (R U' R' U2) (R U' R')",
    view: {
      u: ['Y', 'Y', 'G', 'Y', 'Y', 'Y', 'R', 'B', 'O'],
      f: ['B', 'Y', 'Y', 'G', 'G', 'O', 'G', 'G', 'G'],
      r: ['G', 'G', 'Y', 'G', 'O', 'O', 'O', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, false],
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-38',
    name: 'F2L 38',
    shape: 'bothInSlot',
    standardAlg: "(R U' R') U' (R U R') U2 (R U' R')",
    view: {
      u: ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'Y', 'Y', 'B'],
      f: ['B', 'R', 'R', 'G', 'G', 'G', 'G', 'G', 'W'],
      r: ['Y', 'B', 'G', 'O', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, false],
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-39',
    name: 'F2L 39',
    shape: 'bothInSlot',
    standardAlg: "(R U' R' U)(R U2' R') U (R U' R')",
    view: {
      u: ['G', 'Y', 'G', 'Y', 'Y', 'Y', 'Y', 'Y', 'B'],
      f: ['B', 'R', 'R', 'G', 'G', 'G', 'G', 'G', 'O'],
      r: ['Y', 'O', 'Y', 'O', 'O', 'O', 'W', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, false],
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-40',
    name: 'F2L 40',
    shape: 'bothInSlot',
    standardAlg: "(r U' r') U2 (r U r') (R U R')",
    view: {
      u: ['Y', 'G', 'G', 'Y', 'Y', 'R', 'Y', 'O', 'R'],
      f: ['R', 'Y', 'G', 'G', 'G', 'O', 'G', 'G', 'W'],
      r: ['Y', 'Y', 'O', 'G', 'O', 'O', 'G', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, false],
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    },
  },
  {
    id: 'f2l-41',
    name: 'F2L 41',
    shape: 'bothInSlot',
    standardAlg: "(R U' R') (r U' r') U2 (r U r')",
    view: {
      u: ['Y', 'Y', 'Y', 'O', 'Y', 'G', 'O', 'B', 'B'],
      f: ['G', 'Y', 'Y', 'G', 'G', 'O', 'G', 'G', 'O'],
      r: ['O', 'Y', 'B', 'G', 'O', 'O', 'W', 'O', 'O'],
    },
    pair: {
      u: [false, false, false, false, false, false, false, false, false],
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    },
  },
];
