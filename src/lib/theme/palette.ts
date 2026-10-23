import type { HexColor } from './color';

// 保存文書の Settings.themeColor と同じ形。墨は 'ink' (ダークでは白に置き換えるため色では持たない)、他は #rrggbb
export type ThemeColor = 'ink' | HexColor;

// テーマ色のパレット。墨 + Material Design 2 の 8 色 (塗りの上の文字が 4.5:1 以上になる段階) + 自分で選ぶ
export const THEME_PRESET_IDS = ['ink', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export const THEME_PRESET_HEX: Record<Exclude<ThemePresetId, 'ink'>, HexColor> = {
  red: '#d32f2f',
  orange: '#f57c00',
  yellow: '#fdd835',
  green: '#43a047',
  teal: '#00796b',
  blue: '#1976d2',
  purple: '#8e24aa',
  pink: '#d81b60',
};

// 「自分で選ぶ」を初めて開いたときの色
export const CUSTOM_COLOR_DEFAULT: HexColor = THEME_PRESET_HEX.blue;

// 保存されている値がどの見本か。8 色は同じ hex、それ以外は自分で選んだ色 (null)
export function presetOf(themeColor: ThemeColor): ThemePresetId | null {
  if (themeColor === 'ink') {
    return 'ink';
  }
  const lower = themeColor.toLowerCase();
  const found = THEME_PRESET_IDS.find((id) => id !== 'ink' && THEME_PRESET_HEX[id] === lower);
  return found ?? null;
}
