import { describe, expect, it } from 'vitest';

import type { PllPreset } from '@/data/presets/pll';

import { groupByShape } from './group-by-shape';

function presetOf(name: string, shape: PllPreset['shape']): PllPreset {
  return {
    id: `pll-${name.toLowerCase()}`,
    name,
    shape,
    standardAlg: 'R U',
    view: {
      u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      f: ['G', 'G', 'G'],
      r: ['O', 'O', 'O'],
      b: ['B', 'B', 'B'],
      l: ['R', 'R', 'R'],
    },
    arrows: [],
  };
}

const PRESETS = [presetOf('T', 'headlights1'), presetOf('H', 'headlights4'), presetOf('Aa', 'headlights1')];

describe('groupByShape', () => {
  it('種類ごとでは形の並び順に見出しを作り、その中は元の順を保つ', () => {
    const sections = groupByShape(PRESETS, 'shape');
    expect(sections.map((section) => section.presets.map((preset) => preset.name))).toEqual([['H'], ['T', 'Aa']]);
  });

  it('該当するパターンがない形の見出しは出さない', () => {
    expect(groupByShape(PRESETS, 'shape')).toHaveLength(2);
  });

  it('標準順では 1 つの見出しにまとまる', () => {
    const sections = groupByShape(PRESETS, 'standard');
    expect(sections).toHaveLength(1);
    expect(sections[0]?.presets).toEqual(PRESETS);
  });
});
