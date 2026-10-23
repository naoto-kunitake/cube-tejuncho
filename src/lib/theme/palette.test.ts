import { describe, expect, it } from 'vitest';

import { presetOf, THEME_PRESET_HEX } from './palette';

describe('presetOf', () => {
  it('墨と 8 色は見本の id、大文字の hex も同じ見本', () => {
    expect(presetOf('ink')).toBe('ink');
    expect(presetOf(THEME_PRESET_HEX.teal)).toBe('teal');
    expect(presetOf('#1976D2')).toBe('blue');
  });

  it('見本にない色は自分で選んだ色', () => {
    expect(presetOf('#123456')).toBeNull();
  });
});
