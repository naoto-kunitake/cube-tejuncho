import type { FigureColor } from '@/lib/figure/view';

// 図の色はトークンの変数で指定する (SVG の fill 属性に変数を書くと Safari で透明になるので style で)
export const STICKER_COLOR_VARIABLE: Record<FigureColor, string> = {
  Y: 'var(--sticker-yellow)',
  W: 'var(--sticker-white)',
  G: 'var(--sticker-green)',
  B: 'var(--sticker-blue)',
  R: 'var(--sticker-red)',
  O: 'var(--sticker-orange)',
  N: 'var(--sticker-none)',
};
