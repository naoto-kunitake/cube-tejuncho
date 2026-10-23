import { describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import type { Preset } from '@/data/presets/catalog';
import type { F2lShape } from '@/data/presets/f2l';
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

const CUBE_VIEW = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  r: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
} as const;
const NO_PAIR = [false, false, false, false, false, false, false, false, false] as const;

function f2lPresetOf(number: string, shape: F2lShape): Preset {
  return {
    category: 'f2l',
    id: `f2l-${number}`,
    name: `F2L ${number}`,
    shape,
    standardAlg: 'R U',
    view: CUBE_VIEW,
    pair: { u: NO_PAIR, f: NO_PAIR, r: NO_PAIR },
  };
}

const PRESETS = [presetOf('T', 'headlights1'), presetOf('H', 'headlights4'), presetOf('Aa', 'headlights1')];
const NONE_PINNED: ReadonlySet<string> = new Set();

describe('groupByShape', () => {
  it('種類ごとでは形の並び順に見出しを作り、その中は元の順を保つ', () => {
    const sections = groupByShape(PRESETS, {
      category: 'pll',
      sortOrder: 'shape',
      topColor: 'yellow',
      pinnedIds: NONE_PINNED,
    });
    expect(sections.map((section) => section.presets.map((preset) => preset.name))).toEqual([['H'], ['T', 'Aa']]);
  });

  it('該当するパターンがない形の見出しは出さない', () => {
    expect(
      groupByShape(PRESETS, { category: 'pll', sortOrder: 'shape', topColor: 'yellow', pinnedIds: NONE_PINNED }),
    ).toHaveLength(2);
  });

  it('標準順では 1 つの見出しにまとまる', () => {
    const sections = groupByShape(PRESETS, {
      category: 'pll',
      sortOrder: 'standard',
      topColor: 'yellow',
      pinnedIds: NONE_PINNED,
    });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.presets).toEqual(PRESETS);
  });

  it('OLL は OLL の形の表で分ける', () => {
    const presets = [ollPresetOf('1', 'dot'), ollPresetOf('21', 'cross')];
    expect(
      groupByShape(presets, { category: 'oll', sortOrder: 'shape', topColor: 'yellow', pinnedIds: NONE_PINNED }).map(
        (section) => section.label,
      ),
    ).toEqual([copy.list.ollShapes.cross, copy.list.ollShapes.dot]);
  });

  it('OLL の種類ごとでない見出しは番号順', () => {
    const presets = [ollPresetOf('1', 'dot'), ollPresetOf('21', 'cross')];
    expect(
      groupByShape(presets, { category: 'oll', sortOrder: 'standard', topColor: 'yellow', pinnedIds: NONE_PINNED })[0]
        ?.label,
    ).toBe(copy.list.standardOrder.oll);
  });

  it('F2L の「白が上」の見出しは、上面が白の設定では「黄が上」になる', () => {
    const presets = [f2lPresetOf('17', 'bothUpWhiteUp')];
    expect(
      groupByShape(presets, { category: 'f2l', sortOrder: 'shape', topColor: 'yellow', pinnedIds: NONE_PINNED })[0]
        ?.label,
    ).toBe('両方上面・白が上');
    expect(
      groupByShape(presets, { category: 'f2l', sortOrder: 'shape', topColor: 'white', pinnedIds: NONE_PINNED })[0]
        ?.label,
    ).toBe('両方上面・黄が上');
  });

  it('ピン留めは種類ごとでも先頭の見出しにまとまり、元の群からは外れる', () => {
    const sections = groupByShape(PRESETS, {
      category: 'pll',
      sortOrder: 'shape',
      topColor: 'yellow',
      pinnedIds: new Set(['pll-aa']),
    });
    expect(sections.map((section) => [section.label, section.presets.map((preset) => preset.name)])).toEqual([
      [copy.list.pinned, ['Aa']],
      [copy.list.pllShapes.headlights4, ['H']],
      [copy.list.pllShapes.headlights1, ['T']],
    ]);
  });

  it('標準順ではピン留めの見出しの後に標準順の見出しが続き、ピン留めの中は元の並びを保つ', () => {
    const sections = groupByShape(PRESETS, {
      category: 'pll',
      sortOrder: 'standard',
      topColor: 'yellow',
      pinnedIds: new Set(['pll-aa', 'pll-t']),
    });
    expect(sections.map((section) => [section.label, section.presets.map((preset) => preset.name)])).toEqual([
      [copy.list.pinned, ['T', 'Aa']],
      [copy.list.standardOrder.pll, ['H']],
    ]);
  });

  it('全部ピン留めしても標準順の見出しは残る', () => {
    const sections = groupByShape(PRESETS, {
      category: 'pll',
      sortOrder: 'standard',
      topColor: 'yellow',
      pinnedIds: new Set(PRESETS.map((preset) => preset.id)),
    });
    expect(sections.map((section) => [section.label, section.presets.length])).toEqual([
      [copy.list.pinned, PRESETS.length],
      [copy.list.standardOrder.pll, 0],
    ]);
  });
});
