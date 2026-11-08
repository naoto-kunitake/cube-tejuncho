export type SwipeDirection = 'left' | 'right';

// タップのぶれ (数px) では切り替わらず、画面の端から始めても届く長さ
export const SWIPE_MIN_DISTANCE = 48;

// 指が動いた向き。横に十分動き、縦より横が長いときだけスワイプとみなす (斜めに流したスクロールでは切り替えない)
export function swipeDirectionOf(deltaX: number, deltaY: number): SwipeDirection | null {
  if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY)) {
    return null;
  }
  return deltaX < 0 ? 'left' : 'right';
}

// スワイプで移る隣。左に流すと右隣 (中身が左へ退く向き)。端では止まる (矢印キーのように回り込むと、指の向きと食い違う)
export function neighborOf<T>(items: readonly T[], current: T, direction: SwipeDirection): T | null {
  const index = items.indexOf(current);
  if (index < 0) {
    return null;
  }
  return items[direction === 'left' ? index + 1 : index - 1] ?? null;
}
