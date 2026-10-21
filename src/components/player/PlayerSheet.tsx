import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { AlgText } from '@/components/AlgText';
import { IconButton } from '@/components/IconButton';
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

// 下から出るシート。× / 3D の舞台 / 手順の文字 (今の手を強調) / 操作列 の順に縦に並べる (音楽アプリの再生中画面と同じ)。
// native の dialog を使い、Esc と背景の暗幕で閉じ、背後にフォーカスが行かないようにする
export function PlayerSheet({ algText, category, settings, onClose }: PlayerSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const player = usePlayer({ algText, category, settings, stageRef });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    // 暗幕 (dialog 自身) を押したら閉じる。中身の上では閉じない。Esc は dialog の close で拾う
    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };
    dialog.addEventListener('click', closeOnBackdrop);
    return () => {
      dialog.removeEventListener('click', closeOnBackdrop);
    };
  }, [onClose]);

  // 狭い幅は親指の届く底のシート。広い幅は窓が縦に長く、底に出すと押した場所から遠いので中央のカードにする
  return (
    <dialog
      ref={dialogRef}
      aria-label={copy.a11y.playerSheet}
      onClose={onClose}
      className="m-0 mt-auto mb-0 flex w-full max-w-140 flex-col gap-3 rounded-t-sheet border-t border-line bg-surface px-4 pt-3 pb-5 text-ink shadow-5 backdrop:bg-black/60 md:m-auto md:max-w-100 md:rounded-sheet md:border"
    >
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
      {/* 手順の枠は 2 行ぶんの高さを確保し、短くても長くても操作列を動かさない */}
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
    </dialog>
  );
}
