// 見た目 36px のピル型を疑似要素で 44px 以上のタップ領域に広げる。
// 枠線つきのピル (タブ、ボタン) は上下 5px・左右 1px、文字だけのピル (文字ボタン) は上下 4px
export const PILL_TAP_AREA_CLASS =
  'relative before:absolute before:-inset-x-px before:-inset-y-1.25 before:rounded-full';
export const TEXT_PILL_TAP_AREA_CLASS =
  'relative before:absolute before:inset-x-0 before:-inset-y-1 before:rounded-full';
