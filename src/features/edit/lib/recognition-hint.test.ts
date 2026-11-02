import { describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import type { Preset } from '@/data/presets/catalog';
import type { CubeView, PairMask, Side, StickerColor, TopView } from '@/lib/figure/view';

import { recognitionHintOf } from './recognition-hint';

const U9: TopView['u'] = ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'];
const NONE: PairMask['u'] = [false, false, false, false, false, false, false, false, false];
const G9: CubeView['f'] = ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'];
const O9: CubeView['r'] = ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'];

function pllOf(sides: Record<'f' | 'r' | 'b' | 'l', Side<StickerColor>>): Preset {
  return {
    category: 'pll',
    id: 'pll-x',
    name: 'X',
    shape: 'none',
    standardAlg: 'R',
    view: { u: U9, ...sides },
    arrows: [],
  };
}

function f2lOf(pair: PairMask): Preset {
  return {
    category: 'f2l',
    id: 'f2l-x',
    name: 'F2L 1',
    shape: 'bothUpSameColor',
    standardAlg: 'R',
    view: { u: U9, f: G9, r: O9 },
    pair,
  };
}

const OLL: Preset = {
  category: 'oll',
  id: 'oll-x',
  name: 'OLL 1',
  shape: 'dot',
  standardAlg: 'R',
  view: { u: U9, f: ['G', 'G', 'G'], r: ['O', 'O', 'O'], b: ['B', 'B', 'B'], l: ['R', 'R', 'R'] },
};

describe('recognitionHintOf', () => {
  it('PLL は側面の揃い方を並べる', () => {
    const preset = pllOf({ f: ['G', 'G', 'G'], r: ['R', 'G', 'R'], b: ['B', 'B', 'O'], l: ['O', 'R', 'B'] });
    expect(recognitionHintOf(preset, 'yellow')).toBe(
      copy.edit.recognitionHint([
        copy.edit.sideRun('back', 'pair'),
        copy.edit.sideRun('front', 'bar'),
        copy.edit.sideRun('right', 'headlights'),
      ]),
    );
  });

  it('揃った塊のない PLL はそう伝える', () => {
    const side: Side<StickerColor> = ['R', 'G', 'B'];
    expect(recognitionHintOf(pllOf({ f: side, r: side, b: side, l: side }), 'yellow')).toBe(
      copy.edit.recognitionHint([copy.edit.noRuns]),
    );
  });

  it('F2L はパーツの位置と群の名前を1つの文にする', () => {
    const hint = recognitionHintOf(f2lOf({ u: NONE, f: NONE, r: NONE }), 'yellow');
    expect(hint).toBe(copy.edit.recognitionHint([copy.list.f2lShapes.bothUpSameColor()]));
  });

  it('F2L のクロスの色は上面の色の設定に従う', () => {
    const pair: PairMask = {
      u: NONE,
      f: [false, false, false, false, false, true, false, false, true],
      r: [false, false, false, true, false, false, true, false, false],
    };
    expect(recognitionHintOf(f2lOf(pair), 'white')).toContain('黄');
  });

  it('OLL は例を出さない', () => {
    expect(recognitionHintOf(OLL, 'yellow')).toBeUndefined();
  });
});
