import { afterEach, describe, expect, it } from 'vitest';

import { trackInputModality } from './input-modality';

let stop: (() => void) | null = null;

afterEach(() => {
  stop?.();
  stop = null;
});

describe('trackInputModality', () => {
  it('Tab でキーボード、pointerdown でポインタになる', () => {
    stop = trackInputModality(document);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.documentElement.dataset.inputModality).toBe('keyboard');
    document.dispatchEvent(new Event('pointerdown'));
    expect(document.documentElement.dataset.inputModality).toBe('pointer');
  });

  it('文字の打鍵では変わらない', () => {
    stop = trackInputModality(document);
    document.dispatchEvent(new Event('pointerdown'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(document.documentElement.dataset.inputModality).toBe('pointer');
  });

  it('止めると印が消える', () => {
    const stopTracking = trackInputModality(document);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    stopTracking();
    expect(document.documentElement.dataset.inputModality).toBeUndefined();
  });
});
