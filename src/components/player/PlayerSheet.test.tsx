import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { copy } from '@/copy';

import { PlayerSheet } from './PlayerSheet';
import type * as TwistyExports from './twisty';
import { loadTwisty, type PlayerLike, type TwistyModule } from './twisty';

vi.mock('./twisty', async (importOriginal) => {
  const original = await importOriginal<typeof TwistyExports>();
  return { ...original, loadTwisty: vi.fn() };
});

// 3Dはjsdomで動かないので、再生シートが使う範囲 (PlayerLike) だけ真似た要素を返す
function fakePlayer(): PlayerLike {
  const listener = { addFreshListener: vi.fn() };
  return Object.assign(document.createElement('div'), {
    play: vi.fn(),
    pause: vi.fn(),
    jumpToStart: vi.fn(),
    jumpToEnd: vi.fn(),
    controller: { animationController: { play: vi.fn() } },
    experimentalModel: { playingInfo: listener, detailedTimelineInfo: listener, currentMoveInfo: listener },
  });
}

function fakeTwistyModule(): TwistyModule {
  return { TwistyPlayer: vi.fn(fakePlayer) };
}

const SETTINGS = {
  topColor: 'yellow',
  frontColor: 'green',
  playbackSpeed: 'normal',
  greyUnrelated: true,
  wideStyle: 'r',
} as const;

const UA = { category: 'pll', standardAlg: "M2 U M U2 M' U M2" } as const;
const T_PERM = "R U R' U' R' F R2 U' R' U' R U R' F'";

function renderSheet(algText = "R U R' U'", caseCheck?: typeof UA) {
  const onClose = vi.fn();
  render(<PlayerSheet algText={algText} caseCheck={caseCheck} settings={SETTINGS} onClose={onClose} />);
  return onClose;
}

function setupAlgOf(twisty: TwistyModule): string | undefined {
  return vi.mocked(twisty.TwistyPlayer).mock.calls[0]?.[0].experimentalSetupAlg?.toString();
}

beforeEach(() => {
  vi.mocked(loadTwisty).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PlayerSheet', () => {
  it('読み込めたら操作列が出る', async () => {
    vi.mocked(loadTwisty).mockResolvedValue(fakeTwistyModule());
    renderSheet();
    expect(screen.getByRole('dialog', { name: copy.a11y.playerSheet })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: copy.a11y.play })).toBeInTheDocument();
    expect(screen.queryByText(copy.player.loading)).not.toBeInTheDocument();
  });

  it('読み込みに失敗したら知らせて再試行を出し、再試行で復帰する', async () => {
    vi.mocked(loadTwisty).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(fakeTwistyModule());
    renderSheet();
    const retry = await screen.findByRole('button', { name: copy.player.retry });
    expect(screen.getByRole('alert')).toHaveTextContent(copy.player.failed);
    await userEvent.click(retry);
    expect(await screen.findByRole('button', { name: copy.a11y.play })).toBeInTheDocument();
  });

  it('10 秒たっても読み込めなければ失敗扱いにする', async () => {
    vi.useFakeTimers();
    vi.mocked(loadTwisty).mockReturnValue(new Promise(() => undefined));
    renderSheet();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(screen.getByRole('button', { name: copy.player.retry })).toBeInTheDocument();
  });

  it('揃わない手順は図の状態 (基本手順の逆) から始める', async () => {
    const twisty = fakeTwistyModule();
    vi.mocked(loadTwisty).mockResolvedValue(twisty);
    renderSheet(T_PERM, UA);
    await screen.findByRole('button', { name: copy.a11y.play });
    expect(setupAlgOf(twisty)).toBe("z2 M2' U' M U2' M' U' M2'");
  });

  it('揃う手順は手順の逆から始める', async () => {
    const twisty = fakeTwistyModule();
    vi.mocked(loadTwisty).mockResolvedValue(twisty);
    renderSheet("R U' R U R U R U' R' U' R2", UA);
    await screen.findByRole('button', { name: copy.a11y.play });
    expect(setupAlgOf(twisty)).toBe("z2 R2' U R U R' U' R' U' R' U R'");
  });

  it('× で閉じる', async () => {
    vi.mocked(loadTwisty).mockResolvedValue(fakeTwistyModule());
    const onClose = renderSheet();
    await userEvent.click(screen.getByRole('button', { name: copy.a11y.closeSheet }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
