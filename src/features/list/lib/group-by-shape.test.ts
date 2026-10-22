import { describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import type { Preset } from '@/data/presets/catalog';
import type { OllShape } from '@/data/presets/oll';
import type { PllShape } from '@/data/presets/pll';

import { groupByShape } from './group-by-shape';

const SOLVED_VIEW = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'G', 'G'],
  r: ['O', 'O', 'O'],
  b: ['B', 'B', 'B'],
  l: ['R', 'R', 'R'],
} as const;

function presetOf(name: string, shape: PllShape): Preset {
  return {
    category: 'pll',
    id: `pll-${name.toLowerCase()}`,
    name,
    shape,
    standardAlg: 'R U',
    view: SOLVED_VIEW,
    arrows: [],
  };
}

function ollPresetOf(number: string, shape: OllShape): Preset {
  return { category: 'oll', id: `oll-${number}`, name: `OLL ${number}`, shape, standardAlg: 'R U', view: SOLVED_VIEW };
}

const PRESETS = [presetOf('T', 'headlights1'), presetOf('H', 'headlights4'), presetOf('Aa', 'headlights1')];

describe('groupByShape', () => {
  it('種類ごとでは形の並び順に見出しを作り、その中は元の順を保つ', () => {
    const sections = groupByShape('pll', PRESETS, 'shape');
    expect(sections.map((section) => section.presets.map((preset) => preset.name))).toEqual([['H'], ['T', 'Aa']]);
  });

  it('該当するパターンがない形の見出しは出さない', () => {
    expect(groupByShape('pll', PRESETS, 'shape')).toHaveLength(2);
  });

  it('標準順では 1 つの見出しにまとまる', () => {
    const sections = groupByShape('pll', PRESETS, 'standard');
    expect(sections).toHaveLength(1);
    expect(sections[0]?.presets).toEqual(PRESETS);
  });

  it('OLL は OLL の形の表で分ける', () => {
    const presets = [ollPresetOf('1', 'dot'), ollPresetOf('21', 'cross')];
    expect(groupByShape('oll', presets, 'shape').map((section) => section.label)).toEqual([
      copy.list.ollShapes.cross,
      copy.list.ollShapes.dot,
    ]);
  });

  it('OLL の種類ごとでない見出しは番号順', () => {
    const presets = [ollPresetOf('1', 'dot'), ollPresetOf('21', 'cross')];
    expect(groupByShape('oll', presets, 'standard')[0]?.label).toBe(copy.list.standardOrder.oll);
  });
});
