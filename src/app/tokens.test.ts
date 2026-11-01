import { describe, expect, it } from 'vitest';

import { GROUND_HEX, SURFACE_HEX } from '@/lib/theme/color';
import { THEME_PRESET_HEX, THEME_PRESET_IDS } from '@/lib/theme/palette';

import tokensCss from './tokens.css?raw';

describe('tokens.css のテーマ色', () => {
  // 見本の見た目 (--color-theme-*) と保存する色 (lib/theme/palette.ts) は別の経路なので、ずれたらここで落ちる
  it('見本の 8 色は保存する色と同じ値', () => {
    for (const id of THEME_PRESET_IDS) {
      if (id === 'ink') {
        continue;
      }
      const match = new RegExp(`--color-theme-${id}:\\s*(#[0-9a-f]{6});`, 'i').exec(tokensCss);
      expect(match?.[1]?.toLowerCase()).toBe(THEME_PRESET_HEX[id]);
    }
  });
});

describe('tokens.css のダークの差し替え', () => {
  const blockOf = (selector: string) => new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(tokensCss)?.[1] ?? '';

  // ライトだけに書いてダークを忘れると、ダークでライトの値がそのまま出る (部品側にdark:を書かない方針なので気づきにくい)
  it('部品ごとの色はライトとダークの両方で定義される', () => {
    const light = blockOf(':root');
    const dark = blockOf('\\.dark');
    for (const name of [
      '--key-character',
      '--key-character-hover',
      '--key-action',
      '--key-action-hover',
      '--switch-knob-on',
    ]) {
      expect(light).toContain(`${name}:`);
      expect(dark).toContain(`${name}:`);
    }
  });
});

describe('tokens.css の面と地の色', () => {
  const colorOf = (selector: string, name: string) =>
    new RegExp(`${selector}\\s*\\{[^}]*${name}:\\s*(#[0-9a-f]{6});`).exec(tokensCss)?.[1];

  // ブラウザの枠の色と文字の対比の計算はlib/theme/colorの値で行うので、トークンとずれたらここで落ちる
  it('ライトの面と地は JS が持つ値と同じ', () => {
    expect(colorOf(':root', '--surface')).toBe(SURFACE_HEX.light);
    expect(colorOf(':root', '--ground')).toBe(GROUND_HEX.light);
  });

  it('ダークの面と地は JS が持つ値と同じ', () => {
    expect(colorOf('\\.dark', '--surface')).toBe(SURFACE_HEX.dark);
    expect(colorOf('\\.dark', '--ground')).toBe(GROUND_HEX.dark);
  });
});
