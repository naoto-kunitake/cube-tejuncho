import type { ThemeColor } from './palette';

// #rrggbb (大文字小文字は問わない)
export type HexColor = `#${string}`;
type Rgb = readonly [number, number, number];

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string): value is HexColor {
  return HEX_COLOR_PATTERN.test(value);
}

const INK: HexColor = '#1a1a1a';
const WHITE: HexColor = '#ffffff';
const BLACK: HexColor = '#000000';
// ダークでは墨のテーマ色を白 (文字50) に置き換える
const INK_ON_DARK: HexColor = '#f2f2f2';

function rgbOf(hex: HexColor): Rgb {
  const byteAt = (offset: number) => parseInt(hex.slice(offset, offset + 2), 16);
  return [byteAt(1), byteAt(3), byteAt(5)];
}

function hexOf(rgb: Rgb): HexColor {
  return `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function linearize(byte: number): number {
  const value = byte / 255;
  // sRGB → 線形 (WCAG 2の相対輝度の定義)
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

// #rrggbbの相対輝度 (0 = 黒、1 = 白)
export function relativeLuminance(hex: HexColor): number {
  const [red, green, blue] = rgbOf(hex);
  return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
}

function contrastRatio(a: number, b: number): number {
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

// テーマ色の上に載せる文字色。墨と白のうち対比が高い方 (Material Youのon-primaryと同じ考え)
export function onColorOf(hex: HexColor): HexColor {
  const luminance = relativeLuminance(hex);
  const inkContrast = contrastRatio(luminance, relativeLuminance(INK));
  const whiteContrast = contrastRatio(luminance, 1);
  return inkContrast >= whiteContrast ? INK : WHITE;
}

export const APPEARANCES = ['auto', 'light', 'dark'] as const;
export type Appearance = (typeof APPEARANCES)[number];
export type ResolvedAppearance = 'light' | 'dark';

// 文字が載る地と面の色。ブラウザの枠の色と文字の対比の計算で要る。CSSの変数は読めないのでここに持つ
// (tokens.cssの--ground / --surfaceと同じ値かはtokens.test.tsが見る)
export const GROUND_HEX: Record<ResolvedAppearance, HexColor> = { light: '#f2f0ea', dark: '#1a1a1a' };
export const SURFACE_HEX: Record<ResolvedAppearance, HexColor> = { light: '#ffffff', dark: '#333333' };

// 自動は端末のダークモードに追従する
export function resolveAppearance(appearance: Appearance, prefersDark: boolean): ResolvedAppearance {
  if (appearance === 'auto') {
    return prefersDark ? 'dark' : 'light';
  }
  return appearance;
}

// 実際に塗るテーマ色。墨は既定なので、ライトは墨、ダークは白。
// 保存文書のZodが#rrggbbを検証済みなので、形が違う値は呼び出し側のバグ
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

// 通常の文字の対比の下限 (WCAG 1.4.3)
const TEXT_CONTRAST_MIN = 4.5;

function mixedWith(hex: HexColor, toward: HexColor, percent: number): HexColor {
  const [red, green, blue] = rgbOf(hex);
  const [towardRed, towardGreen, towardBlue] = rgbOf(toward);
  const mixed = (from: number, to: number) => Math.round(from + (to - from) * (percent / 100));
  return hexOf([mixed(red, towardRed), mixed(green, towardGreen), mixed(blue, towardBlue)]);
}

function worstContrastOn(hex: HexColor, backgrounds: readonly HexColor[]): number {
  const luminance = relativeLuminance(hex);
  return Math.min(...backgrounds.map((background) => contrastRatio(luminance, relativeLuminance(background))));
}

// 文字と記号に使うテーマ色。選んだ色のままでは面と地で4.5:1に届かないことがある (黄は白い面で1.4)。
// 届くまでライトは黒、ダークは白と1%ずつ混ぜる。R:G:Bの比は変わらないので色味は保つ。
// 塗りの上の文字はonColorOfが守るので、こちらは文字そのものの色
export function accentInkOf(accent: HexColor, appearance: ResolvedAppearance): HexColor {
  const backgrounds = [SURFACE_HEX[appearance], GROUND_HEX[appearance]];
  const toward = appearance === 'dark' ? WHITE : BLACK;
  for (let percent = 0; percent < 100; percent += 1) {
    const candidate = mixedWith(accent, toward, percent);
    if (worstContrastOn(candidate, backgrounds) >= TEXT_CONTRAST_MIN) {
      return candidate;
    }
  }
  return toward;
}
