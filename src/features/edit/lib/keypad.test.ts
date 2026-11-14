import { describe, expect, it } from 'vitest';

import { applyEdit, clearingFor, deletionFor, insertionFor, keypadKeysOf } from './keypad';

function typed(value: string, caret: number, key: Parameters<typeof insertionFor>[3]) {
  return applyEdit(value, insertionFor(value, caret, caret, key));
}

describe('keypadKeysOf', () => {
  it('接尾辞の段は面の段の真下に並び、右端が削除', () => {
    expect(keypadKeysOf('r').slice(0, 12)).toEqual([
      'R',
      'U',
      'F',
      'L',
      'D',
      'B',
      "'",
      '2',
      '3',
      '(',
      ')',
      'backspace',
    ]);
  });

  it('2層回しの段は面と同じ並びで、設定の表記で出る', () => {
    expect(keypadKeysOf('r').slice(12, 18)).toEqual(['r', 'u', 'f', 'l', 'd', 'b']);
    expect(keypadKeysOf('Rw').slice(12, 18)).toEqual(['Rw', 'Uw', 'Fw', 'Lw', 'Dw', 'Bw']);
  });

  it('残りの操作キーは最後に並ぶ', () => {
    expect(keypadKeysOf('r').slice(24)).toEqual(['clear', 'keyboard', 'done']);
  });

  it('wのキーはない', () => {
    expect(keypadKeysOf('r')).not.toContain('w');
    expect(keypadKeysOf('Rw')).not.toContain('w');
  });
});

describe('insertionFor', () => {
  it('手の後に手を押すと空白を補う', () => {
    expect(typed('R', 1, 'U')).toEqual({ value: 'R U', caret: 3 });
  });

  it("' と 2 と 3 と w は前の手にくっつく", () => {
    expect(typed('R', 1, "'")).toEqual({ value: "R'", caret: 2 });
    expect(typed('R', 1, '2')).toEqual({ value: 'R2', caret: 2 });
    expect(typed('R', 1, '3')).toEqual({ value: 'R3', caret: 2 });
    expect(typed('R', 1, 'w')).toEqual({ value: 'Rw', caret: 2 });
  });

  it('2層回しは独立した手なので、どちらの表記でも空白を補う', () => {
    expect(typed('R', 1, 'r')).toEqual({ value: 'R r', caret: 3 });
    expect(typed('R', 1, 'Rw')).toEqual({ value: 'R Rw', caret: 4 });
  });

  it('x y z は持ち替えで独立した手なので空白を補う', () => {
    expect(typed('R', 1, 'x')).toEqual({ value: 'R x', caret: 3 });
    expect(typed('R', 1, 'y')).toEqual({ value: 'R y', caret: 3 });
    expect(typed('R', 1, 'z')).toEqual({ value: 'R z', caret: 3 });
  });

  it('先頭と空白・括弧の後には空白を補わない', () => {
    expect(typed('', 0, 'R')).toEqual({ value: 'R', caret: 1 });
    expect(typed('R ', 2, 'U')).toEqual({ value: 'R U', caret: 3 });
    expect(typed('(', 1, 'R')).toEqual({ value: '(R', caret: 2 });
  });

  it('括弧を開くときも空白を補い、閉じるときは補わない', () => {
    expect(typed('R', 1, '(')).toEqual({ value: 'R (', caret: 3 });
    expect(typed('(R U', 4, ')')).toEqual({ value: '(R U)', caret: 5 });
  });

  it('途中に入れると選択範囲を置き換える', () => {
    expect(applyEdit('R U', insertionFor('R U', 2, 3, 'F'))).toEqual({ value: 'R F', caret: 3 });
  });
});

describe('deletionFor', () => {
  it('選択がなければ直前の 1 文字を消す', () => {
    expect(applyEdit('R U', deletionFor(3, 3))).toEqual({ value: 'R ', caret: 2 });
  });

  it('選択があればその範囲を消す', () => {
    expect(applyEdit('R U F', deletionFor(2, 4))).toEqual({ value: 'R F', caret: 2 });
  });

  it('先頭では何も消さない', () => {
    expect(applyEdit('R', deletionFor(0, 0))).toEqual({ value: 'R', caret: 0 });
  });
});

describe('clearingFor', () => {
  it('全部消す', () => {
    expect(applyEdit("R U R' U'", clearingFor("R U R' U'"))).toEqual({ value: '', caret: 0 });
  });
});
