import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { applyAppearance, useAppearance } from './appearance';

describe('applyAppearance', () => {
  it('ダークのときだけ dark クラスが付く', () => {
    const root = document.createElement('div');
    applyAppearance(root, { appearance: 'dark', themeColor: 'ink' }, false);
    expect(root.classList.contains('dark')).toBe(true);
    applyAppearance(root, { appearance: 'light', themeColor: 'ink' }, true);
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('自動は端末の設定に従う', () => {
    const root = document.createElement('div');
    applyAppearance(root, { appearance: 'auto', themeColor: 'ink' }, true);
    expect(root.classList.contains('dark')).toBe(true);
  });

  it('墨はテーマ色の変数を置かず、選んだ色は --accent と --on-accent を置く', () => {
    const root = document.createElement('div');
    applyAppearance(root, { appearance: 'light', themeColor: '#fdd835' }, false);
    expect(root.style.getPropertyValue('--accent')).toBe('#fdd835');
    expect(root.style.getPropertyValue('--on-accent')).toBe('#1a1a1a');
    applyAppearance(root, { appearance: 'light', themeColor: 'ink' }, false);
    expect(root.style.getPropertyValue('--accent')).toBe('');
  });
});

function Probe() {
  useAppearance();
  return null;
}

// 端末のダークモードの設定を模す。changeToでOS側の切り替えを起こす
function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let onChange: (() => void) | null = null;
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return matches;
    },
    addEventListener: (_type: string, listener: () => void) => {
      onChange = listener;
    },
    removeEventListener: () => {
      onChange = null;
    },
  }));
  return {
    changeTo: (next: boolean) => {
      matches = next;
      onChange?.();
    },
  };
}

describe('useAppearance', () => {
  beforeEach(() => {
    useDocumentStore.setState({ document: createEmptyDocument() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.removeProperty('--accent');
  });

  it('既定 (自動) で端末がダークなら html に dark が付き、設定をライトにすると外れる', () => {
    stubMatchMedia(true);
    render(<Probe />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    act(() => {
      useDocumentStore.getState().updateSettings({ appearance: 'light' });
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('自動のまま端末がダークに変わると html に dark が付く', () => {
    const media = stubMatchMedia(false);
    render(<Probe />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    act(() => {
      media.changeTo(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ダークに固定していれば端末がライトに変わっても dark は外れない', () => {
    const media = stubMatchMedia(true);
    useDocumentStore.getState().updateSettings({ appearance: 'dark' });
    render(<Probe />);
    act(() => {
      media.changeTo(false);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
