import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

import { copy } from '@/copy';
import { cn } from '@/lib/utils';

import type { StepDirection } from './twisty';

type PlayerControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onStep: (direction: StepDirection) => void;
};

// 副の操作は枠なしの記号 (音楽アプリの操作列と同じ)。再生だけ48の塗りで主役にする。タップ領域は44
const SUB_BUTTON_CLASS =
  'pressable inline-grid size-11 place-items-center rounded-full text-ink hover:bg-hover active:scale-96 active:bg-press';

export function PlayerControls({ isPlaying, onTogglePlay, onJumpToStart, onJumpToEnd, onStep }: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button type="button" aria-label={copy.a11y.toStart} className={SUB_BUTTON_CLASS} onClick={onJumpToStart}>
        <SkipBack size={22} strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={copy.a11y.stepBack}
        className={SUB_BUTTON_CLASS}
        onClick={() => {
          onStep(-1);
        }}
      >
        <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={isPlaying ? copy.a11y.pause : copy.a11y.play}
        className={cn(
          'inline-grid size-12 place-items-center rounded-full bg-accent text-on-accent pressable hover:bg-accent-hover active:scale-96 active:bg-accent-press',
        )}
        onClick={onTogglePlay}
      >
        {isPlaying ? (
          <Pause size={24} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        ) : (
          <Play size={24} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        aria-label={copy.a11y.stepForward}
        className={SUB_BUTTON_CLASS}
        onClick={() => {
          onStep(1);
        }}
      >
        <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
      </button>
      <button type="button" aria-label={copy.a11y.toEnd} className={SUB_BUTTON_CLASS} onClick={onJumpToEnd}>
        <SkipForward size={22} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
