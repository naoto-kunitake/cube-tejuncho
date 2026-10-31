import { useEffect } from 'react';

import type { Settings } from '@/data/document';
import { useDocumentStore } from '@/data/store';
import { accentOf, onColorOf, resolveAppearance } from '@/lib/theme/color';

type AppearanceSettings = Pick<Settings, 'appearance' | 'themeColor'>;

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// 文書の設定をhtml要素に反映する。ダークは.dark (tokens.cssが変数を差し替える)、テーマ色は--accent / --on-accentの
// インラインの変数。墨は既定なので変数を消してトークンに任せる (ライトは墨、ダークは白)
export function applyAppearance(root: HTMLElement, settings: AppearanceSettings, prefersDark: boolean): void {
  const resolved = resolveAppearance(settings.appearance, prefersDark);
  root.classList.toggle('dark', resolved === 'dark');
  if (settings.themeColor === 'ink') {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--on-accent');
    return;
  }
  const accent = accentOf(settings.themeColor, resolved);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--on-accent', onColorOf(accent));
}

function findDarkMediaQuery(): MediaQueryList | null {
  // jsdomなどmatchMediaのない環境では端末の設定を読めないので、ライトとして扱う
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_MEDIA_QUERY) : null;
}

// 起動時・設定の変化・端末のダークモードの変化で反映し直す
export function useAppearance(): void {
  const appearance = useDocumentStore((state) => state.document.settings.appearance);
  const themeColor = useDocumentStore((state) => state.document.settings.themeColor);

  useEffect(() => {
    const media = findDarkMediaQuery();
    const apply = () => {
      applyAppearance(document.documentElement, { appearance, themeColor }, media?.matches ?? false);
    };
    apply();
    media?.addEventListener('change', apply);
    return () => {
      media?.removeEventListener('change', apply);
    };
  }, [appearance, themeColor]);
}
