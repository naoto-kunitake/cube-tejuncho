// 標準形の寸法。viewBox 86のうち外側4を空け、中身 (側面の帯の外周) を78に収める (F2Lの等角投影と同じ規則)。
// 中身 = 帯8 × 2 + 空き3 × 2 + セル17.6 × 3 + 隙間1.6 × 2 = 78
export const FIGURE_LAYOUT = {
  viewBox: '7 7 86 86',
  cell: 17.6,
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
