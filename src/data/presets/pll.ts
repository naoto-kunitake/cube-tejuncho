import type { Arrow } from '@/lib/figure/arrows';
import type { TopView } from '@/lib/figure/view';

export type PllShape = 'headlights4' | 'barAndHeadlights3' | 'headlights1' | 'bar1' | 'none';

// 一覧の「種類ごと」の並び (モックで決めた順)
export const PLL_SHAPE_ORDER: readonly PllShape[] = ['headlights4', 'barAndHeadlights3', 'headlights1', 'bar1', 'none'];

export type PllPreset = {
  id: string;
  name: string;
  shape: PllShape;
  standardAlg: string;
  // 図の定義。手順にAUFが含まれても向きが変わらないよう、置換の型が定義と一致する向きで持つ (ノートのAUF正規化)
  view: TopView;
  // 上面9マスの位置 (0 = 左上、4 = 中央) で、[出発, 行き先]
  arrows: readonly Arrow[];
};

// 標準順 (speedsolving wikiの並び)。基本手順はwiki・J Perm・SpeedCubeDB・だーおかの多数決
export const PLL_PRESETS: readonly PllPreset[] = [
  {
    id: 'pll-ua',
    name: 'Ua',
    shape: 'barAndHeadlights3',
    standardAlg: "M2 U M U2 M' U M2",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'O', 'G'],
      r: ['O', 'R', 'O'],
      b: ['B', 'B', 'B'],
      l: ['R', 'G', 'R'],
    },
    arrows: [
      [3, 7],
      [5, 3],
      [7, 5],
    ],
  },
  {
    id: 'pll-ub',
    name: 'Ub',
    shape: 'barAndHeadlights3',
    standardAlg: "M2 U' M U2 M' U' M2",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'R', 'G'],
      r: ['O', 'G', 'O'],
      b: ['B', 'B', 'B'],
      l: ['R', 'O', 'R'],
    },
    arrows: [
      [3, 5],
      [5, 7],
      [7, 3],
    ],
  },
  {
    id: 'pll-h',
    name: 'H',
    shape: 'headlights4',
    standardAlg: 'M2 U M2 U2 M2 U M2',
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'B', 'G'],
      r: ['O', 'R', 'O'],
      b: ['B', 'G', 'B'],
      l: ['R', 'O', 'R'],
    },
    arrows: [
      [1, 7],
      [3, 5],
      [5, 3],
      [7, 1],
    ],
  },
  {
    id: 'pll-z',
    name: 'Z',
    shape: 'headlights4',
    standardAlg: "M' U M2 U M2 U M' U2 M2",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'O', 'G'],
      r: ['O', 'G', 'O'],
      b: ['B', 'R', 'B'],
      l: ['R', 'B', 'R'],
    },
    arrows: [
      [1, 3],
      [3, 1],
      [5, 7],
      [7, 5],
    ],
  },
  {
    id: 'pll-aa',
    name: 'Aa',
    shape: 'headlights1',
    standardAlg: "x R' U R' D2 R U' R' D2 R2 x'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'B'],
      r: ['G', 'O', 'R'],
      b: ['O', 'B', 'O'],
      l: ['B', 'R', 'R'],
    },
    arrows: [
      [0, 2],
      [2, 8],
      [8, 0],
    ],
  },
  {
    id: 'pll-ab',
    name: 'Ab',
    shape: 'headlights1',
    standardAlg: "x R2 D2 R U R' D2 R U' R x'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'O'],
      r: ['B', 'O', 'B'],
      b: ['G', 'B', 'R'],
      l: ['O', 'R', 'R'],
    },
    arrows: [
      [0, 8],
      [2, 0],
      [8, 2],
    ],
  },
  {
    id: 'pll-e',
    name: 'E',
    shape: 'none',
    standardAlg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['R', 'G', 'O'],
      r: ['G', 'O', 'B'],
      b: ['R', 'B', 'O'],
      l: ['G', 'R', 'B'],
    },
    arrows: [
      [0, 6],
      [2, 8],
      [6, 0],
      [8, 2],
    ],
  },
  {
    id: 'pll-t',
    name: 'T',
    shape: 'headlights1',
    standardAlg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'O'],
      r: ['G', 'R', 'B'],
      b: ['B', 'B', 'O'],
      l: ['R', 'O', 'R'],
    },
    arrows: [
      [2, 8],
      [3, 5],
      [5, 3],
      [8, 2],
    ],
  },
  {
    id: 'pll-f',
    name: 'F',
    shape: 'bar1',
    standardAlg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'B', 'O'],
      r: ['G', 'O', 'B'],
      b: ['B', 'G', 'O'],
      l: ['R', 'R', 'R'],
    },
    arrows: [
      [1, 7],
      [2, 8],
      [7, 1],
      [8, 2],
    ],
  },
  {
    id: 'pll-ja',
    name: 'Ja',
    shape: 'bar1',
    standardAlg: "y2 x R2 F R F' R U2 r' U r U2 x'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'O'],
      r: ['G', 'B', 'B'],
      b: ['B', 'O', 'O'],
      l: ['R', 'R', 'R'],
    },
    arrows: [
      [1, 5],
      [2, 8],
      [5, 1],
      [8, 2],
    ],
  },
  {
    id: 'pll-jb',
    name: 'Jb',
    shape: 'bar1',
    standardAlg: "R U R' F' R U R' U' R' F R2 U' R'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['O', 'R', 'R'],
      r: ['O', 'O', 'G'],
      b: ['B', 'B', 'B'],
      l: ['R', 'G', 'G'],
    },
    arrows: [
      [3, 7],
      [6, 8],
      [7, 3],
      [8, 6],
    ],
  },
  {
    id: 'pll-ra',
    name: 'Ra',
    shape: 'headlights1',
    standardAlg: "R U' R' U' R U R D R' U' R D' R' U2 R'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['O', 'G', 'R'],
      r: ['O', 'B', 'G'],
      b: ['B', 'O', 'B'],
      l: ['R', 'R', 'G'],
    },
    arrows: [
      [1, 5],
      [5, 1],
      [6, 8],
      [8, 6],
    ],
  },
  {
    id: 'pll-rb',
    name: 'Rb',
    shape: 'headlights1',
    standardAlg: "R' U2 R U2 R' F R U R' U' R' F' R2",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'R', 'O'],
      r: ['G', 'O', 'B'],
      b: ['B', 'B', 'O'],
      l: ['R', 'G', 'R'],
    },
    arrows: [
      [2, 8],
      [3, 7],
      [7, 3],
      [8, 2],
    ],
  },
  {
    id: 'pll-y',
    name: 'Y',
    shape: 'none',
    standardAlg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'B'],
      r: ['O', 'O', 'R'],
      b: ['G', 'R', 'B'],
      l: ['O', 'B', 'R'],
    },
    arrows: [
      [0, 8],
      [1, 3],
      [3, 1],
      [8, 0],
    ],
  },
  {
    id: 'pll-v',
    name: 'V',
    shape: 'none',
    standardAlg: "R' U R' U' y R' F' R2 U' R' U R' F R F",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'O', 'G'],
      r: ['R', 'G', 'O'],
      b: ['B', 'B', 'G'],
      l: ['R', 'R', 'O'],
    },
    arrows: [
      [2, 6],
      [5, 7],
      [6, 2],
      [7, 5],
    ],
  },
  {
    id: 'pll-na',
    name: 'Na',
    shape: 'none',
    standardAlg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'G', 'G'],
      r: ['R', 'R', 'O'],
      b: ['B', 'B', 'G'],
      l: ['R', 'O', 'O'],
    },
    arrows: [
      [2, 6],
      [3, 5],
      [5, 3],
      [6, 2],
    ],
  },
  {
    id: 'pll-nb',
    name: 'Nb',
    shape: 'none',
    standardAlg: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'B'],
      r: ['O', 'R', 'R'],
      b: ['G', 'B', 'B'],
      l: ['O', 'O', 'R'],
    },
    arrows: [
      [0, 8],
      [3, 5],
      [5, 3],
      [8, 0],
    ],
  },
  {
    id: 'pll-ga',
    name: 'Ga',
    shape: 'headlights1',
    standardAlg: "y R2 U R' U R' U' R U' R2 D U' R' U R D'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'R', 'G'],
      r: ['B', 'G', 'O'],
      b: ['R', 'B', 'R'],
      l: ['G', 'O', 'O'],
    },
    arrows: [
      [0, 6],
      [2, 0],
      [3, 5],
      [5, 7],
      [6, 2],
      [7, 3],
    ],
  },
  {
    id: 'pll-gb',
    name: 'Gb',
    shape: 'headlights1',
    standardAlg: "R' U' R U D' R2 U R' U R U' R U' R2 D",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'G', 'G'],
      r: ['B', 'R', 'O'],
      b: ['R', 'O', 'R'],
      l: ['G', 'B', 'O'],
    },
    arrows: [
      [0, 6],
      [1, 5],
      [2, 0],
      [3, 1],
      [5, 3],
      [6, 2],
    ],
  },
  {
    id: 'pll-gc',
    name: 'Gc',
    shape: 'headlights1',
    standardAlg: "y R2 U' R U' R U R' U R2 D' U R U' R' D",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'R', 'G'],
      r: ['B', 'O', 'O'],
      b: ['R', 'G', 'R'],
      l: ['G', 'B', 'O'],
    },
    arrows: [
      [0, 6],
      [1, 7],
      [2, 0],
      [3, 1],
      [6, 2],
      [7, 3],
    ],
  },
  {
    id: 'pll-gd',
    name: 'Gd',
    shape: 'headlights1',
    standardAlg: "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['B', 'B', 'G'],
      r: ['B', 'G', 'O'],
      b: ['R', 'O', 'R'],
      l: ['G', 'R', 'O'],
    },
    arrows: [
      [0, 6],
      [1, 5],
      [2, 0],
      [5, 7],
      [6, 2],
      [7, 1],
    ],
  },
];
