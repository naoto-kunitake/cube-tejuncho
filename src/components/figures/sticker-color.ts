import type { FigureColor } from '@/lib/figure/view';

// 図 (SVG) 以外で図の色を使うとき (設定の色の点) のクラス
export const STICKER_DOT_CLASS: Record<FigureColor, string> = {
  Y: 'bg-sticker-yellow',
  W: 'bg-sticker-white',
  G: 'bg-sticker-green',
  B: 'bg-sticker-blue',
  R: 'bg-sticker-red',
  O: 'bg-sticker-orange',
  N: 'bg-sticker-none',
};

// 図の色はトークンの変数で指定する (SVGのfill属性に変数を書くとSafariで透明になるのでstyleで)
export const STICKER_COLOR_VARIABLE: Record<FigureColor, string> = {
  Y: 'var(--sticker-yellow)',
  W: 'var(--sticker-white)',
  G: 'var(--sticker-green)',
  B: 'var(--sticker-blue)',
  R: 'var(--sticker-red)',
  O: 'var(--sticker-orange)',
  N: 'var(--sticker-none)',
};
