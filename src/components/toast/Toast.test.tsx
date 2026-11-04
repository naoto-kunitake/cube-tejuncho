import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { copy } from '@/copy';

import { Toast } from './Toast';
import { TOAST_DURATION_MS, useToastStore } from './toast-store';

const TEXT = '手順を削除しました';

// ReactのonPointerEnter / onPointerLeaveはover / outから作られるので、その2つを起こす
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
  it('マウスが乗っている間は消えない', () => {
    const text = showToast();
    fireEvent.pointerOver(text, { pointerType: 'mouse' });
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('マウスが離れると消える', () => {
    const text = showToast();
    fireEvent.pointerOver(text, { pointerType: 'mouse' });
    fireEvent.pointerOut(text, { pointerType: 'mouse' });
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument();
  });

  it('指で触れても止まらず、時間が来れば消える', () => {
    const text = showToast();
    fireEvent.pointerOver(text, { pointerType: 'touch' });
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS);
    });
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument();
  });

  it('マウスが乗っている間は指の離れが来ても消えない', () => {
    const text = showToast();
    fireEvent.pointerOver(text, { pointerType: 'mouse' });
    fireEvent.pointerOut(text, { pointerType: 'touch' });
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('マウスが離れても焦点が中にあれば消えない', () => {
    const text = showToast();
    fireEvent.pointerOver(text, { pointerType: 'mouse' });
    act(() => {
      screen.getByRole('button', { name: copy.toast.undo }).focus();
    });
    fireEvent.pointerOut(text, { pointerType: 'mouse' });
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 2);
    });
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });
});
