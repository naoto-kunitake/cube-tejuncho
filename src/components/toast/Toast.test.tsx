import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { copy } from '@/copy';

import { Toast } from './Toast';
import { TOAST_DURATION_MS, useToastStore } from './toast-store';

const TEXT = '手順を削除しました';

// Reactのonmouseenter / onmouseleaveはover / outから作られるので、その2つを起こす
function showToast() {
  useToastStore.getState().show(TEXT, { label: copy.toast.undo, run: vi.fn() });
  render(<Toast />);
  return screen.getByText(TEXT);
}

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.getState().dismiss();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('ポインタが乗っている間は消えない', () => {
    const text = showToast();
    fireEvent.mouseOver(text);
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('ポインタが離れると消える', () => {
    const text = showToast();
    fireEvent.mouseOver(text);
    fireEvent.mouseOut(text);
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument();
  });

  it('マウスが離れても焦点が中にあれば消えない', () => {
    const text = showToast();
    fireEvent.mouseOver(text);
    act(() => {
      screen.getByRole('button', { name: copy.toast.undo }).focus();
    });
    fireEvent.mouseOut(text);
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });
});
