import { describe, expect, it } from 'vitest';

import type { Preset } from '@/data/presets/catalog';

import { tileNameOf } from './tile-name';

const SOLVED_VIEW = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'G', 'G'],
  r: ['O', 'O', 'O'],
  b: ['B', 'B', 'B'],
  l: ['R', 'R', 'R'],
} as const;

function ollPresetOf(number: string): Preset {
  return {
    category: 'oll',
    id: `oll-${number}`,
    name: `OLL ${number}`,
    shape: 'dot',
    standardAlg: 'R U',
    view: SOLVED_VIEW,
  };
}

const CUBE_VIEW = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  r: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
} as const;
const NO_PAIR = [false, false, false, false, false, false, false, false, false] as const;

function f2lPresetOf(number: string): Preset {
  return {
    category: 'f2l',
    id: `f2l-${number}`,
    name: `F2L ${number}`,
    shape: 'bothUpSameColor',
    standardAlg: 'R U',
    view: CUBE_VIEW,
    pair: { u: NO_PAIR, f: NO_PAIR, r: NO_PAIR },
  };
}

function pllPresetOf(name: string): Preset {
  return {
    category: 'pll',
    id: `pll-${name}`,
    name,
    shape: 'headlights1',
    standardAlg: 'R U',
    view: SOLVED_VIEW,
    arrows: [],
  };
}

describe('tileNameOf', () => {
  it('OLL は接頭辞を落として番号だけ', () => {
    expect(tileNameOf(ollPresetOf('21'))).toBe('21');
  });

  it('F2L も接頭辞を落として番号だけ', () => {
    expect(tileNameOf(f2lPresetOf('17'))).toBe('17');
  });

  it('PLL は名前のまま', () => {
    expect(tileNameOf(pllPresetOf('T'))).toBe('T');
  });
});
