import { describe, expect, it } from 'vitest';

import { slideDirectionOf } from './slide';

describe('slideDirectionOf', () => {
  const tabs = ['pll', 'oll', 'f2l'];

  it('右のタブへ移れば右から入る', () => {
    expect(slideDirectionOf(tabs, 'pll', 'f2l')).toBe('forward');
  });

  it('左のタブへ移れば左から入る', () => {
    expect(slideDirectionOf(tabs, 'oll', 'pll')).toBe('backward');
  });

  it('同じタブなら動かさない', () => {
    expect(slideDirectionOf(tabs, 'oll', 'oll')).toBeNull();
  });

  it('並びにないタブが絡めば動かさない', () => {
    expect(slideDirectionOf(tabs, 'coll', 'oll')).toBeNull();
  });
});
