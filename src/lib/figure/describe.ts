import type { Side, StickerColor, TopView } from './view';

export const SIDE_NAMES = ['back', 'front', 'left', 'right'] as const;
export type SideName = (typeof SIDE_NAMES)[number];
// 側面 3 枚の並び方。3連 = 3 枚同じ、ヘッドライト = 両端が同じ、2連 = 隣り合う 2 枚が同じ
export type SideRun = 'bar' | 'headlights' | 'pair';
export type SideDescription = { side: SideName; run: SideRun };

const SIDE_KEYS: Record<SideName, keyof Omit<TopView, 'u'>> = { back: 'b', front: 'f', left: 'l', right: 'r' };

function runOf([a, b, c]: Side<StickerColor>): SideRun | null {
  if (a === b && b === c) {
    return 'bar';
  }
  if (a === c) {
    return 'headlights';
  }
  if (a === b || b === c) {
    return 'pair';
  }
  return null;
}

// 判断の文章の手がかりにする、側面の揃い方の一覧 (後ろ → 前 → 左 → 右)
export function describeSides(view: TopView): SideDescription[] {
  return SIDE_NAMES.flatMap((side) => {
    const run = runOf(view[SIDE_KEYS[side]]);
    return run === null ? [] : [{ side, run }];
  });
}
