import type { ThemeColor } from './palette';

// #rrggbb (大文字小文字は問わない)
export type HexColor = `#${string}`;

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string): value is HexColor {
  return HEX_COLOR_PATTERN.test(value);
}

const INK: HexColor = '#1a1a1a';
const WHITE: HexColor = '#ffffff';
// ダークでは墨のテーマ色を白 (文字 50) に置き換える
const INK_ON_DARK: HexColor = '#f2f2f2';

function channel(hex: HexColor, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  // sRGB → 線形 (WCAG 2 の相対輝度の定義)
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

// #rrggbb の相対輝度 (0 = 黒、1 = 白)
export function relativeLuminance(hex: HexColor): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrastRatio(a: number, b: number): number {
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

// テーマ色の上に載せる文字色。墨と白のうち対比が高い方 (Material You の on-primary と同じ考え)
export function onColorOf(hex: HexColor): HexColor {
  const luminance = relativeLuminance(hex);
  const inkContrast = contrastRatio(luminance, relativeLuminance(INK));
  const whiteContrast = contrastRatio(luminance, 1);
  return inkContrast >= whiteContrast ? INK : WHITE;
}

export const APPEARANCES = ['auto', 'light', 'dark'] as const;
export type Appearance = (typeof APPEARANCES)[number];
export type ResolvedAppearance = 'light' | 'dark';

// 自動は端末のダークモードに追従する
export function resolveAppearance(appearance: Appearance, prefersDark: boolean): ResolvedAppearance {
  if (appearance === 'auto') {
    return prefersDark ? 'dark' : 'light';
  }
  return appearance;
}

// 実際に塗るテーマ色。墨は既定なので、ライトは墨、ダークは白。
// 保存文書の Zod が #rrggbb を検証済みなので、形が違う値は呼び出し側のバグ
export function accentOf(themeColor: ThemeColor, appearance: ResolvedAppearance): HexColor {
  if (themeColor === 'ink') {
    return appearance === 'dark' ? INK_ON_DARK : INK;
  }
  const lower = themeColor.toLowerCase();
  if (!isHexColor(lower)) {
    throw new Error(`invalid theme color: ${themeColor}`);
  }
  return lower;
}
