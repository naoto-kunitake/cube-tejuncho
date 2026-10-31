import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Link, MemoryRouter, NavigationType, Route, Routes, useNavigate, useSearchParams } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScrollToTop, shouldScrollToTop } from './ScrollToTop';

describe('shouldScrollToTop', () => {
  it('別の画面へ進むと先頭に戻す', () => {
    expect(
      shouldScrollToTop({ previousPathname: '/', pathname: '/settings', navigationType: NavigationType.Push }),
    ).toBe(true);
  });

  it('別の画面に置き換えても先頭に戻す', () => {
    expect(
      shouldScrollToTop({ previousPathname: '/p/new', pathname: '/p/x', navigationType: NavigationType.Replace }),
    ).toBe(true);
  });

  it('同じ画面での置き換え (タブ切り替え) では動かさない', () => {
    expect(shouldScrollToTop({ previousPathname: '/', pathname: '/', navigationType: NavigationType.Replace })).toBe(
      false,
    );
  });

  it('戻るときはブラウザの復元に任せて動かさない', () => {
    expect(
      shouldScrollToTop({ previousPathname: '/settings', pathname: '/', navigationType: NavigationType.Pop }),
    ).toBe(false);
  });
});

function HomeScreen() {
  const [, setSearchParams] = useSearchParams();
  return (
    <>
      <Link to="/next">next</Link>
      <button type="button" onClick={() => setSearchParams({ category: 'oll' }, { replace: true })}>
        tab
      </button>
    </>
  );
}

function BackButton() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => void navigate(-1)}>
      back
    </button>
  );
}

function renderApp() {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  render(
    <MemoryRouter initialEntries={['/']}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/next" element={<BackButton />} />
      </Routes>
    </MemoryRouter>,
  );
  scrollTo.mockClear();
  return scrollTo;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ScrollToTop', () => {
  it('リンクで進むと先頭にスクロールする', async () => {
    const scrollTo = renderApp();
    await userEvent.click(screen.getByRole('link', { name: 'next' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('タブの切り替えではスクロールしない', async () => {
    const scrollTo = renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'tab' }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('戻るときはスクロールしない', async () => {
    const scrollTo = renderApp();
    await userEvent.click(screen.getByRole('link', { name: 'next' }));
    scrollTo.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
