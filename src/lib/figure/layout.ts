// 標準形の寸法 (viewBox は 7 7 86 86)。モックで決めた値をそのまま使う
export const FIGURE_LAYOUT = {
  viewBox: '7 7 86 86',
  cell: 18,
  gap: 1.6,
  origin: 22,
  sideThickness: 8,
  sideOffset: 3,
  cornerRadius: 1.6,
} as const;

const { cell, gap, origin, sideThickness, sideOffset } = FIGURE_LAYOUT;

export function cellPosition(index: number): number {
  return origin + index * (cell + gap);
}

export function cellCenter(index: number): number {
  return cellPosition(index) + cell / 2;
}

export const SIDE_NEAR = origin - sideOffset - sideThickness;
export const SIDE_FAR = origin + 3 * cell + 2 * gap + sideOffset;
