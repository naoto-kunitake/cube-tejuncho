import { describe, expect, it } from 'vitest';

import { formatAlg } from './format';

describe('formatAlg', () => {
  it('空白を補って 1 手ずつ並べる', () => {
    expect(formatAlg("RUR'U'", 'r')).toBe("R U R' U'");
  });

  it('2 層回しを r の表記に揃える', () => {
    expect(formatAlg("Rw U Rw'", 'r')).toBe("r U r'");
  });

  it('2 層回しを Rw の表記に揃える', () => {
    expect(formatAlg("r U r'", 'Rw')).toBe("Rw U Rw'");
  });

  it('括弧の塊と繰り返しを残す', () => {
    expect(formatAlg("(R U R' U')2 F", 'r')).toBe("(R U R' U')2 F");
  });

  it('全角と曲がった引用符を直す', () => {
    expect(formatAlg('Ｒ　Ｕ　Ｒ’', 'r')).toBe("R U R'");
  });

  it('読めない手順は揺れだけ直して返す', () => {
    expect(formatAlg('Ｒ U Q', 'r')).toBe('R U Q');
  });
});
