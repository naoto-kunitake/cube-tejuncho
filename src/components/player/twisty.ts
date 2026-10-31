import type { Alg } from 'cubing/alg';
import type { TwistyPlayerConfig } from 'cubing/twisty';

import type { Settings } from '@/data/document';
import { setupAlgFor } from '@/lib/cube/setup';
import { type StickeringCategory, stickeringMaskFor } from '@/lib/cube/stickering';

type Listenable<T> = { addFreshListener: (listener: (value: T) => void) => void };

export type CurrentMoveInfo = {
  patternIndex: number;
  currentMoves: readonly unknown[];
  movesFinishing: readonly unknown[];
  movesStarting: readonly unknown[];
};

// 再生シートが使うTwistyPlayerの範囲。テストでは3Dを動かせないので、この形を満たす偽の部品で代える
export type PlayerLike = HTMLElement & {
  play: () => void;
  pause: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  controller: { animationController: { play: (options: { direction: StepDirection; untilBoundary: string }) => void } };
  experimentalModel: {
    playingInfo: Listenable<{ playing: boolean }>;
    detailedTimelineInfo: Listenable<{ atEnd: boolean }>;
    currentMoveInfo: Listenable<CurrentMoveInfo>;
  };
};

export type TwistyModule = { TwistyPlayer: new (config: TwistyPlayerConfig) => PlayerLike };

// 3D (three.jsを含む約1MB) は再生ボタンを押したときだけ読む。失敗したら次の再試行でもう一度読みに行く
let twistyPromise: Promise<TwistyModule> | null = null;

export function loadTwisty(): Promise<TwistyModule> {
  twistyPromise ??= import('cubing/twisty').catch((error: unknown) => {
    twistyPromise = null;
    throw error;
  });
  return twistyPromise;
}

export type StepDirection = 1 | -1;

export const TEMPO_SCALE: Record<Settings['playbackSpeed'], number> = { slow: 0.5, normal: 1, fast: 2 };

export type PlayerSettings = Pick<Settings, 'topColor' | 'frontColor' | 'playbackSpeed' | 'greyUnrelated'>;

// 操作列は自前 (controlPanel: none)、背景なし、面の名前のヒントなし
export function playerConfigFor(alg: Alg, settings: PlayerSettings, category?: StickeringCategory): TwistyPlayerConfig {
  const config: TwistyPlayerConfig = {
    puzzle: '3x3x3',
    alg,
    experimentalSetupAlg: setupAlgFor(alg, settings),
    controlPanel: 'none',
    background: 'none',
    hintFacelets: 'none',
    tempoScale: TEMPO_SCALE[settings.playbackSpeed],
  };
  if (settings.greyUnrelated && category !== undefined) {
    config.experimentalStickeringMaskOrbits = stickeringMaskFor(category, settings);
  }
  return config;
}

// 1手だけ動かす。標準の操作列と矢印キーが使う仕組みで、cubing.jsの版が変わって失敗したら何もしない
export function stepPlayer(player: PlayerLike, direction: StepDirection): boolean {
  try {
    player.controller.animationController.play({ direction, untilBoundary: 'move' });
    return true;
  } catch (error: unknown) {
    console.error('step failed', error);
    return false;
  }
}
