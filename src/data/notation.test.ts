import { describe, expect, it } from 'vitest';

import { notationSectionsOf } from './notation';

describe('notationSectionsOf', () => {
  it('6 区画 21 行になる', () => {
    const sections = notationSectionsOf('r');
    expect(sections.map((section) => section.id)).toEqual(['face', 'direction', 'slice', 'wide', 'rotation', 'group']);
    expect(sections.flatMap((section) => section.rows)).toHaveLength(21);
  });

  it('括弧の行だけ再生する手がない', () => {
    const rows = notationSectionsOf('r').flatMap((section) => section.rows);
    expect(rows.filter((row) => row.move === null).map((row) => row.id)).toEqual(['group']);
  });

  it('2 層回しの記号は設定の表記に揃う', () => {
    const wideOf = (style: 'r' | 'Rw') =>
      notationSectionsOf(style)
        .find((section) => section.id === 'wide')
        ?.rows.map((row) => row.symbol);
    expect(wideOf('r')).toEqual(['r', 'l', 'u', 'd', 'f', 'b']);
    expect(wideOf('Rw')).toEqual(['Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw']);
  });

  it("向きと回数の行は R' と R2 で、図は R と同じ層", () => {
    const rows = notationSectionsOf('r').find((section) => section.id === 'direction')?.rows ?? [];
    expect(rows.map((row) => row.symbol)).toEqual(["R'", 'R2']);
    expect(rows.map((row) => row.move?.base)).toEqual(['R', 'R']);
  });
});
