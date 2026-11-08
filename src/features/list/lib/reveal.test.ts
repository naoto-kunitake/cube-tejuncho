import { describe, expect, it } from 'vitest';

import { revealShiftOf } from './reveal';

describe('revealShiftOf', () => {
  const container = { left: 16, right: 376 };

  it('収まっていれば動かさない', () => {
    expect(revealShiftOf(container, { left: 100, right: 180 })).toBe(0);
  });

  it('左にはみ出していれば左端に揃う負のずれ', () => {
    expect(revealShiftOf(container, { left: -40, right: 40 })).toBe(-56);
  });

  it('右にはみ出していれば右端に揃う正のずれ', () => {
    expect(revealShiftOf(container, { left: 320, right: 400 })).toBe(24);
  });
});
