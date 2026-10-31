import { type RefObject, useEffect, useRef, useState } from 'react';

import { toCubingAlg } from '@/lib/cube/alg';
import type { StickeringCategory } from '@/lib/cube/stickering';

import {
  type CurrentMoveInfo,
  loadTwisty,
  playerConfigFor,
  type PlayerLike,
  type PlayerSettings,
  type StepDirection,
  stepPlayer,
  type TwistyModule,
} from './twisty';

export type PlayerStatus = 'loading' | 'ready' | 'failed';

// 初回は約1MBの読み込み。10秒で失敗扱いにして再試行を出す。開いたら0.4秒後に自動で再生する
const LOAD_TIMEOUT_MS = 10_000;
const AUTOPLAY_DELAY_MS = 400;

type UsePlayerArgs = {
  algText: string;
  category: StickeringCategory | undefined;
  settings: PlayerSettings;
  stageRef: RefObject<HTMLDivElement | null>;
};

// 動いている手、または止まった直後の手 (1手進んだ後もどの手だったか読める)。先頭に戻ったら強調なし
export function currentIndexOf(info: CurrentMoveInfo): number | null {
  if (info.currentMoves.length > 0 || info.movesFinishing.length > 0) {
    return info.patternIndex;
  }
  if (info.movesStarting.length > 0 && info.patternIndex > 0) {
    return info.patternIndex - 1;
  }
  return null;
}

function createPlayer(Player: TwistyModule['TwistyPlayer'], config: ReturnType<typeof playerConfigFor>): PlayerLike {
  try {
    return new Player(config);
  } catch (error: unknown) {
    // 灰の指定が通らなければ全色で出す
    console.error('stickering failed, fallback to full color', error);
    const { experimentalStickeringMaskOrbits: _ignored, ...rest } = config;
    return new Player(rest);
  }
}

export function usePlayer({ algText, category, settings, stageRef }: UsePlayerArgs) {
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const playerRef = useRef<PlayerLike | null>(null);
  const { topColor, frontColor, playbackSpeed, greyUnrelated } = settings;

  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) {
      return;
    }
    let isActive = true;
    let autoplay: ReturnType<typeof setTimeout> | undefined;
    const timeout = setTimeout(() => {
      isActive = false;
      setStatus('failed');
    }, LOAD_TIMEOUT_MS);
    const fail = (error: unknown) => {
      if (!isActive) {
        return;
      }
      isActive = false;
      clearTimeout(timeout);
      console.error('player load failed', error);
      setStatus('failed');
    };
    loadTwisty()
      .then(({ TwistyPlayer }) => {
        if (!isActive) {
          return;
        }
        clearTimeout(timeout);
        const parsed = toCubingAlg(algText);
        if (!parsed.ok) {
          fail(parsed.error);
          return;
        }
        const player = createPlayer(
          TwistyPlayer,
          playerConfigFor(parsed.value, { topColor, frontColor, playbackSpeed, greyUnrelated }, category),
        );
        player.style.width = '100%';
        player.style.height = '100%';
        const model = player.experimentalModel;
        model.playingInfo.addFreshListener((info) => {
          setIsPlaying(info.playing);
        });
        model.detailedTimelineInfo.addFreshListener((info) => {
          setIsAtEnd(info.atEnd);
        });
        model.currentMoveInfo.addFreshListener((info) => {
          setCurrentIndex(currentIndexOf(info));
        });
        stage.replaceChildren(player);
        playerRef.current = player;
        setStatus('ready');
        autoplay = setTimeout(() => {
          player.play();
        }, AUTOPLAY_DELAY_MS);
      })
      .catch(fail);
    return () => {
      isActive = false;
      clearTimeout(timeout);
      clearTimeout(autoplay);
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, [algText, category, topColor, frontColor, playbackSpeed, greyUnrelated, attempt, stageRef]);

  const withPlayer = (action: (player: PlayerLike) => void) => {
    const player = playerRef.current;
    if (player !== null) {
      action(player);
    }
  };

  return {
    status,
    isPlaying,
    currentIndex,
    retry: () => {
      setStatus('loading');
      setAttempt((count) => count + 1);
    },
    // 終わったら最後の状態で止まり、再生でまた最初から (繰り返しはしない)
    togglePlay: () => {
      withPlayer((player) => {
        if (isPlaying) {
          player.pause();
          return;
        }
        if (isAtEnd) {
          player.jumpToStart();
        }
        player.play();
      });
    },
    jumpToStart: () => {
      withPlayer((player) => {
        player.pause();
        player.jumpToStart();
      });
    },
    jumpToEnd: () => {
      withPlayer((player) => {
        player.pause();
        player.jumpToEnd();
      });
    },
    step: (direction: StepDirection) => {
      withPlayer((player) => {
        stepPlayer(player, direction);
      });
    },
  };
}
