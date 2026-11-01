import { describe, expect, it } from 'vitest';

import {
  accentInkOf,
  accentOf,
  GROUND_HEX,
  type HexColor,
  onColorOf,
  relativeLuminance,
  resolveAppearance,
  SURFACE_HEX,
} from './color';
import { THEME_PRESET_HEX, THEME_PRESET_IDS } from './palette';

describe('relativeLuminance', () => {
  it('黒は 0、白は 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('onColorOf', () => {
  it('黄や橙のような明るい色の上は墨', () => {
    expect(onColorOf(THEME_PRESET_HEX.yellow)).toBe('#1a1a1a');
    expect(onColorOf(THEME_PRESET_HEX.orange)).toBe('#1a1a1a');
    expect(onColorOf(THEME_PRESET_HEX.green)).toBe('#1a1a1a');
  });

  it('青や赤のような暗い色の上は白', () => {
    expect(onColorOf(THEME_PRESET_HEX.blue)).toBe('#ffffff');
    expect(onColorOf(THEME_PRESET_HEX.red)).toBe('#ffffff');
    expect(onColorOf('#1a1a1a')).toBe('#ffffff');
  });
});

describe('resolveAppearance', () => {
  it('自動は端末に追従し、ライト / ダークは固定', () => {
    expect(resolveAppearance('auto', true)).toBe('dark');
    expect(resolveAppearance('auto', false)).toBe('light');
    expect(resolveAppearance('light', true)).toBe('light');
    expect(resolveAppearance('dark', false)).toBe('dark');
  });
});

describe('accentOf', () => {
  it('墨はライトでは墨、ダークでは白', () => {
    expect(accentOf('ink', 'light')).toBe('#1a1a1a');
    expect(accentOf('ink', 'dark')).toBe('#f2f2f2');
  });

  it('選んだ色はどちらでもその色 (小文字に揃える)', () => {
    expect(accentOf('#1976D2', 'dark')).toBe('#1976d2');
  });

  it('#rrggbb の形でない値は例外 (保存文書の検証をすり抜けたバグ)', () => {
    expect(() => accentOf('#12', 'light')).toThrow();
  });
});

describe('accentInkOf', () => {
  const contrastOn = (hex: HexColor, background: HexColor) => {
    const a = relativeLuminance(hex);
    const b = relativeLuminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };

  it('面と地で 4.5:1 に届く色はそのまま', () => {
    expect(accentInkOf(THEME_PRESET_HEX.purple, 'light')).toBe('#8e24aa');
  });

  it('ライトで薄い色は黒と混ぜて濃くする', () => {
    expect(accentInkOf(THEME_PRESET_HEX.yellow, 'light')).toBe('#7f6c1b');
  });

  it('ダークで暗い色は白と混ぜて明るくする', () => {
    expect(accentInkOf(THEME_PRESET_HEX.purple, 'dark')).toBe('#c187d0');
  });

  it('ダークで明るい色はそのまま', () => {
    expect(accentInkOf(THEME_PRESET_HEX.yellow, 'dark')).toBe('#fdd835');
  });

  // 見本の8色はどれも文字に使えること (塗りの上の文字とは別の対比)
  it('どのテーマ色もライトとダークの面と地で 4.5:1 に届く', () => {
    for (const id of THEME_PRESET_IDS) {
      if (id === 'ink') {
        continue;
      }
      for (const appearance of ['light', 'dark'] as const) {
        const ink = accentInkOf(THEME_PRESET_HEX[id], appearance);
        expect(contrastOn(ink, SURFACE_HEX[appearance])).toBeGreaterThanOrEqual(4.5);
        expect(contrastOn(ink, GROUND_HEX[appearance])).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
