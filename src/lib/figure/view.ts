export type StickerColor = 'Y' | 'W' | 'G' | 'B' | 'R' | 'O';
// Nは関係ないパーツの灰
export type FigureColor = StickerColor | 'N';

export const TOP_COLORS = ['yellow', 'white'] as const;
export type TopColor = (typeof TOP_COLORS)[number];
export const FRONT_COLORS = ['green', 'red', 'blue', 'orange'] as const;
export type FrontColor = (typeof FRONT_COLORS)[number];

export type Side<T> = readonly [T, T, T];
export type TopFace<T> = readonly [T, T, T, T, T, T, T, T, T];

// 標準形: 上面9マス (左上から行ごと) + 側面の上段3マスずつ (左から)
export type TopView = {
  u: TopFace<StickerColor>;
  f: Side<StickerColor>;
  r: Side<StickerColor>;
  b: Side<StickerColor>;
  l: Side<StickerColor>;
};

export type FigureView = {
  u: TopFace<FigureColor>;
  f: Side<FigureColor>;
  r: Side<FigureColor>;
  b: Side<FigureColor>;
  l: Side<FigureColor>;
};

// 3面の図 (F2L): 上面・前面・右面の9マスずつ。各面を正面から見た向きで左上から行ごと (前面は上の行が上層、右面は左の列が前)
export type CubeView = {
  u: TopFace<StickerColor>;
  f: TopFace<StickerColor>;
  r: TopFace<StickerColor>;
};
// 右前スロットのペア (コーナーとエッジ) のステッカーの位置
export type PairMask = {
  u: TopFace<boolean>;
  f: TopFace<boolean>;
  r: TopFace<boolean>;
};
export type CubeFigureView = {
  u: TopFace<FigureColor>;
  f: TopFace<FigureColor>;
  r: TopFace<FigureColor>;
};

function mapSide<T, U>(side: Side<T>, convert: (value: T) => U): Side<U> {
  return [convert(side[0]), convert(side[1]), convert(side[2])];
}

export function mapFace<T, U>(face: TopFace<T>, convert: (value: T, index: number) => U): TopFace<U> {
  const [a, b, c, d, e, f, g, h, i] = face;
  return [
    convert(a, 0),
    convert(b, 1),
    convert(c, 2),
    convert(d, 3),
    convert(e, 4),
    convert(f, 5),
    convert(g, 6),
    convert(h, 7),
    convert(i, 8),
  ];
}

export type ViewSettings = {
  topColor: TopColor;
  frontColor: FrontColor;
};

export const FRONT_COLOR_LETTER: Record<FrontColor, StickerColor> = { green: 'G', red: 'R', blue: 'B', orange: 'O' };

// 白上はx2で持ち替えた状態。上面の対応 (黄↔白、赤↔橙) を先に当て、側面の並び (前→右→後→左) もそれに合わせる
const WHITE_TOP: Record<StickerColor, StickerColor> = { Y: 'W', W: 'Y', R: 'O', O: 'R', G: 'G', B: 'B' };
const SIDE_SEQUENCE: Record<TopColor, readonly StickerColor[]> = {
  yellow: ['G', 'O', 'B', 'R'],
  white: ['G', 'R', 'B', 'O'],
};

// 側面の色の並びの中で、その色が何番目か (0〜3)。上下の色なら-1
export function sideTurnsOf(topColor: TopColor, color: StickerColor): number {
  return SIDE_SEQUENCE[topColor].indexOf(color);
}

// 前面の色を正面に持ってくるのに要るy回転の回数 (0〜3)。側面の色の巡回と再生の開始姿勢が同じ値を使う
export function frontColorTurns(settings: ViewSettings): number {
  return Math.max(0, sideTurnsOf(settings.topColor, FRONT_COLOR_LETTER[settings.frontColor]));
}

function recolorerFor(settings: ViewSettings): (color: StickerColor) => StickerColor {
  const sequence = SIDE_SEQUENCE[settings.topColor];
  const shift = frontColorTurns(settings);
  return (color) => {
    const topped = settings.topColor === 'white' ? WHITE_TOP[color] : color;
    const index = sequence.indexOf(topped);
    if (index < 0) {
      return topped;
    }
    // 前面の色の変更は全体のy回転で、側面の色の巡回置換になる
    return sequence[(index + shift) % sequence.length] ?? topped;
  };
}

export function recolorView(view: TopView, settings: ViewSettings): TopView {
  const recolor = recolorerFor(settings);
  return {
    u: mapFace(view.u, recolor),
    f: mapSide(view.f, recolor),
    r: mapSide(view.r, recolor),
    b: mapSide(view.b, recolor),
    l: mapSide(view.l, recolor),
  };
}

export function recolorCubeView(view: CubeView, settings: ViewSettings): CubeView {
  const recolor = recolorerFor(settings);
  return { u: mapFace(view.u, recolor), f: mapFace(view.f, recolor), r: mapFace(view.r, recolor) };
}

const CENTER_INDEX = 4;

// F2Lの図: ペアのステッカーと中心3枚 (向きの手がかり) だけ色を残し、他は灰
export function pairView(view: CubeView, pair: PairMask): CubeFigureView {
  const keep = (face: TopFace<StickerColor>, mask: TopFace<boolean>): TopFace<FigureColor> =>
    mapFace(face, (color, index) => (mask[index] === true || index === CENTER_INDEX ? color : 'N'));
  return { u: keep(view.u, pair.u), f: keep(view.f, pair.f), r: keep(view.r, pair.r) };
}

export const TOP_LETTER: Record<TopColor, StickerColor> = { yellow: 'Y', white: 'W' };

// OLLの図: 上面の色 (黄、白上の設定なら白) のステッカーだけ色を残し、他は灰。見分けるのは「上面の色がどこにあるか」だけ
export function orientationView(view: TopView, topColor: TopColor): FigureView {
  const top = TOP_LETTER[topColor];
  const keep = (color: StickerColor): FigureColor => (color === top ? color : 'N');
  return {
    u: mapFace(view.u, keep),
    f: mapSide(view.f, keep),
    r: mapSide(view.r, keep),
    b: mapSide(view.b, keep),
    l: mapSide(view.l, keep),
  };
}

// 判断の手がかり: 側面の揃っている塊 (両端が同色 = ヘッドライト、隣り同士が同色 = 2連、3つ同色 = 3連) だけ色を残す
function keepBlocks(side: Side<StickerColor>): Side<FigureColor> {
  const [a, b, c] = side;
  const isHeadlight = a === c;
  return [isHeadlight || a === b ? a : 'N', a === b || b === c ? b : 'N', isHeadlight || b === c ? c : 'N'];
}

export function cueView(view: TopView): FigureView {
  return {
    u: view.u,
    f: keepBlocks(view.f),
    r: keepBlocks(view.r),
    b: keepBlocks(view.b),
    l: keepBlocks(view.l),
  };
}
