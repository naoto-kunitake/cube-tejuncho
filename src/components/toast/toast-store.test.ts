import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TOAST_DURATION_MS, useToastStore } from './toast-store';

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.getState().dismiss();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useToastStore', () => {
  it('出した知らせは 6 秒で消える', () => {
    useToastStore.getState().show('a');
    expect(useToastStore.getState().toast?.text).toBe('a');
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
    expect(useToastStore.getState().toast).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('続けて出すと新しい方だけが残り、時間は測り直す', () => {
    useToastStore.getState().show('a');
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
    useToastStore.getState().show('b');
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
    expect(useToastStore.getState().toast?.text).toBe('b');
  });
});
