import { type PointerEvent, useRef } from 'react';

import { neighborOf, swipeDirectionOf } from '../lib/swipe';

type SwipeStart = { pointerId: number; x: number; y: number };

// 一覧の中身を横に流すと隣のタブへ移る。始点だけ覚え、離した位置との差で決める (途中は何も描かないのでrefでよい)。
// 器にはtouch-action: pan-yが要る。縦のスクロールが始まるとブラウザがpointercancelを送るので、その流れでは切り替わらない。
// 捕捉 (setPointerCapture) はしない。器で捕捉するとclickの標的が器に変わり、タイルのタップが効かなくなる
export function useSwipeTabs(ids: readonly string[], selectedId: string, onSelect: (id: string) => void) {
  const startRef = useRef<SwipeStart | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    // マウスのドラッグは文字の選択なので対象外。2本目の指も見ない
    if (event.pointerType === 'mouse' || !event.isPrimary) {
      return;
    }
    startRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };
  // 2本目の指のup / cancelで1本目の追跡が消えないよう、始めた指と同じときだけ扱う
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = startRef.current;
    if (start?.pointerId !== event.pointerId) {
      return;
    }
    startRef.current = null;
    const direction = swipeDirectionOf(event.clientX - start.x, event.clientY - start.y);
    if (direction === null) {
      return;
    }
    const next = neighborOf(ids, selectedId, direction);
    if (next !== null) {
      onSelect(next);
    }
  };
  const onPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (startRef.current?.pointerId === event.pointerId) {
      startRef.current = null;
    }
  };

  return { onPointerDown, onPointerUp, onPointerCancel };
}
