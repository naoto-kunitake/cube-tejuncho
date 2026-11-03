import { useEffect } from 'react';

import { GROUND_HEX, type ResolvedAppearance, SURFACE_HEX } from '@/lib/theme/color';

const SHEET_OPEN_ATTRIBUTE = 'data-sheet-open';

// ブラウザの枠 (iOS Safariの下のタブバー、ホーム画面から開いたときの上部) の色。
// ふだんは地の色だが、シートが開いている間は画面の底に接するのがシートの面なので面の色にする
// (地のままだと、ダークでシートの下に黒い帯が残る)。外観はhtmlの.darkから読み、呼び出し側が結果を渡さなくてよいようにする
export function syncFrameColor(root: HTMLElement): void {
  const appearance: ResolvedAppearance = root.classList.contains('dark') ? 'dark' : 'light';
  const hex = root.hasAttribute(SHEET_OPEN_ATTRIBUTE) ? SURFACE_HEX[appearance] : GROUND_HEX[appearance];
  root.ownerDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content', hex);
}

// シートが開いている間だけ印を付け、枠の色を面に合わせる。シートは同時に1つしか開かない
export function useSheetFrameColor(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(SHEET_OPEN_ATTRIBUTE, '');
    syncFrameColor(root);
    return () => {
      root.removeAttribute(SHEET_OPEN_ATTRIBUTE);
      syncFrameColor(root);
    };
  }, []);
}
