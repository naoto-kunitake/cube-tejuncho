import { describe, expect, it } from 'vitest';

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
