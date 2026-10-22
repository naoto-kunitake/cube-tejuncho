import { describe, expect, it } from 'vitest';

import { applyEdit, clearingFor, deletionFor, insertionFor } from './keypad';

function typed(value: string, caret: number, key: Parameters<typeof insertionFor>[3]) {
  return applyEdit(value, insertionFor(value, caret, caret, key));
}

describe('insertionFor', () => {
  it('手の後に手を押すと空白を補う', () => {
    expect(typed('R', 1, 'U')).toEqual({ value: 'R U', caret: 3 });
  });

  it("' と 2 は前の手にくっつく", () => {
    expect(typed('R', 1, "'")).toEqual({ value: "R'", caret: 2 });
    expect(typed('R', 1, '2')).toEqual({ value: 'R2', caret: 2 });
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
