import { X } from 'lucide-react';
import { useRef } from 'react';

import { AlgText } from '@/components/AlgText';
import { IconButton } from '@/components/IconButton';
import { Sheet } from '@/components/Sheet';
import { PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import type { StickeringCategory } from '@/lib/cube/stickering';
import { cn } from '@/lib/utils';

import { PlayerControls } from './PlayerControls';
import { usePlayer } from './usePlayer';

type PlayerSheetProps = {
  algText: string;
  category: StickeringCategory | undefined;
  settings: Pick<Settings, 'topColor' | 'frontColor' | 'playbackSpeed' | 'greyUnrelated' | 'wideStyle'>;
  onClose: () => void;
};

// × / 3Dの舞台 / 手順の文字 (今の手を強調) / 操作列 の順に縦に並べる (音楽アプリの再生中画面と同じ)
export function PlayerSheet({ algText, category, settings, onClose }: PlayerSheetProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const player = usePlayer({ algText, category, settings, stageRef });

  return (
    <Sheet label={copy.a11y.playerSheet} onClose={onClose}>
      <div className="flex items-center justify-end">
        <IconButton label={copy.a11y.closeSheet} className="-mr-1.75" onClick={onClose}>
          <X size={22} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-70 overflow-hidden rounded-lg bg-surface-2">
        <div ref={stageRef} className="size-full" />
        {player.status !== 'ready' && (
          <div className="absolute inset-0 grid place-items-center p-3 text-center text-label leading-normal text-muted">
            {player.status === 'loading' ? (
              <p aria-live="polite">{copy.player.loading}</p>
            ) : (
              <div role="alert" className="flex flex-col items-center gap-2.5">
                <p>
                  {copy.player.failed}
                  <br />
                  {copy.player.failedHint}
                </p>
                <button
                  type="button"
                  onClick={player.retry}
                  className={cn(
                    PILL_TAP_AREA_CLASS,
                    'inline-flex min-h-9 items-center justify-center rounded-full border border-ink px-4 text-body font-bold text-ink pressable hover:bg-hover active:scale-98 active:bg-press',
                  )}
                >
                  {copy.player.retry}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 手順の枠は2行ぶんの高さを確保し、短くても長くても操作列を動かさない */}
      <AlgText
        text={algText}
        wideStyle={settings.wideStyle}
        currentIndex={player.currentIndex}
        className="min-h-12 justify-center px-1 text-center text-alg-compact leading-snug font-medium text-ink-strong"
      />
      <PlayerControls
        isPlaying={player.isPlaying}
        onTogglePlay={player.togglePlay}
        onJumpToStart={player.jumpToStart}
        onJumpToEnd={player.jumpToEnd}
        onStep={player.step}
      />
    </Sheet>
  );
}
