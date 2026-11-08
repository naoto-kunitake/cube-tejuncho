import { useState } from 'react';

import { type SlideDirection, slideDirectionOf } from '../lib/slide';

const SLIDE_CLASS: Record<SlideDirection, string> = {
  forward: 'animate-slide-in-forward',
  backward: 'animate-slide-in-backward',
};

// 選択の経路 (タップ・矢印キー・スワイプ) を1つに束ね、移った向きを持つ。
// 向きはタブの並びから決める (スワイプの向きと一致し、タップでも方向の手がかりになる)。起動時は動かさない
export function useTabSlide(ids: readonly string[], selectedId: string, onSelect: (id: string) => void) {
  const [slide, setSlide] = useState<{ id: string; direction: SlideDirection } | null>(null);
  const select = (next: string) => {
    const direction = slideDirectionOf(ids, selectedId, next);
    setSlide(direction === null ? null : { id: next, direction });
    onSelect(next);
  };
  const slideClass = slide?.id === selectedId ? SLIDE_CLASS[slide.direction] : undefined;
  return { select, slideClass };
}
