export type SlideDirection = 'forward' | 'backward';

// タブの並びで右のタブへ移れば新しい中身は右から入り (forward)、左へ移れば左から入る (backward)。
// 向きが決まらないとき (起動時、並びにないタブ、同じタブ) は動かさない
export function slideDirectionOf(ids: readonly string[], from: string, to: string): SlideDirection | null {
  const fromIndex = ids.indexOf(from);
  const toIndex = ids.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return null;
  }
  return toIndex > fromIndex ? 'forward' : 'backward';
}
