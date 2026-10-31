import { Play } from 'lucide-react';

import { TEXT_PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { copy } from '@/copy';
import { cn } from '@/lib/utils';

type PlayPillProps = {
  onClick: () => void;
};

// 手順カードの「▶ 再生」。見た目36のピル、押せる範囲は44
export function PlayPill({ onClick }: PlayPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        TEXT_PILL_TAP_AREA_CLASS,
        'inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong pr-3.5 pl-2.5 text-small font-medium text-ink pressable hover:bg-hover active:scale-96 active:bg-press',
      )}
    >
      <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      {copy.detail.play}
    </button>
  );
}
