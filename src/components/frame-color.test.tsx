import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GROUND_HEX, SURFACE_HEX } from '@/lib/theme/color';

import { syncFrameColor } from './frame-color';
import { Sheet } from './Sheet';

const meta = document.createElement('meta');
meta.name = 'theme-color';

beforeEach(() => {
  document.head.append(meta);
});

afterEach(() => {
  meta.remove();
  document.documentElement.classList.remove('dark');
});

describe('syncFrameColor', () => {
  it('ライトでシートが閉じていれば地の色', () => {
    syncFrameColor(document.createElement('html'));
    expect(meta.content).toBe(GROUND_HEX.light);
  });

  it('ライトでシートが開いていれば面の色', () => {
    const root = document.createElement('html');
    root.setAttribute('data-sheet-open', '');
    syncFrameColor(root);
    expect(meta.content).toBe(SURFACE_HEX.light);
  });

  it('ダークでシートが閉じていれば地の色', () => {
    const root = document.createElement('html');
    root.classList.add('dark');
    syncFrameColor(root);
    expect(meta.content).toBe(GROUND_HEX.dark);
  });

  it('ダークでシートが開いていれば面の色', () => {
    const root = document.createElement('html');
    root.classList.add('dark');
    root.setAttribute('data-sheet-open', '');
    syncFrameColor(root);
    expect(meta.content).toBe(SURFACE_HEX.dark);
  });
});

describe('Sheet', () => {
  it('開いている間はブラウザの枠が面の色になる', () => {
    render(
      <Sheet label="テスト" onClose={vi.fn()}>
        <p>中身</p>
      </Sheet>,
    );
    expect(meta.content).toBe(SURFACE_HEX.light);
  });

  it('閉じるとブラウザの枠が地の色に戻る', () => {
    const { unmount } = render(
      <Sheet label="テスト" onClose={vi.fn()}>
        <p>中身</p>
      </Sheet>,
    );
    unmount();
    expect(meta.content).toBe(GROUND_HEX.light);
  });

  it('ダークで開いている間はダークの面の色になる', () => {
    document.documentElement.classList.add('dark');
    render(
      <Sheet label="テスト" onClose={vi.fn()}>
        <p>中身</p>
      </Sheet>,
    );
    expect(meta.content).toBe(SURFACE_HEX.dark);
  });
});
