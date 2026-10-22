import { describe, expect, it } from 'vitest';

import {
  algErrorOf,
  EMPTY_CARD,
  entriesOf,
  formFrom,
  formSnapshot,
  hasInvalidCard,
  insertCard,
  moveCardToFront,
  newCard,
  registrationDataFrom,
  removeCard,
  standardAlgToAdd,
} from './edit-state';

const ENTRY_A = { text: 'R U', mnemonic: 'a', fingering: '' };
const ENTRY_B = { text: "R U'", mnemonic: '', fingering: 'b' };
const CARD_A = newCard(ENTRY_A);
const CARD_B = newCard(ENTRY_B);
const EMPTY = newCard();
const FIELDS = { name: '', categoryId: '' };

describe('formFrom', () => {
  it('未登録なら空のカード 1 枚', () => {
    const form = formFrom(undefined, FIELDS);
    expect(form.recognition).toBe('');
    expect(entriesOf(form.cards)).toEqual([EMPTY_CARD]);
  });

  it('登録済みならメイン手順を 1 枚目にして、カードごとに別の id を振る', () => {
    const registration = {
      patternId: 'pll-ua',
      recognition: 'r',
      mainAlg: ENTRY_A,
      altAlgs: [ENTRY_B],
      createdAt: '',
      updatedAt: '',
    };
    const form = formFrom(registration, FIELDS);
    expect(form.name).toBe('');
    expect(entriesOf(form.cards)).toEqual([ENTRY_A, ENTRY_B]);
    expect(new Set(form.cards.map((card) => card.id)).size).toBe(2);
  });
});

describe('formSnapshot', () => {
  const base = { ...FIELDS, recognition: 'r', cards: [CARD_A] };

  it('空のカードを足しただけなら同じ', () => {
    expect(formSnapshot({ ...base, cards: [CARD_A, EMPTY] })).toBe(formSnapshot(base));
  });

  it('前後の空白だけの違いは同じ', () => {
    expect(formSnapshot({ ...base, recognition: 'r ' })).toBe(formSnapshot(base));
  });

  it('id が違っても中身が同じなら同じ', () => {
    expect(formSnapshot({ ...base, cards: [newCard(ENTRY_A)] })).toBe(formSnapshot(base));
  });

  it('内容が違えば別', () => {
    expect(formSnapshot({ ...base, recognition: 'x' })).not.toBe(formSnapshot(base));
  });

  it('名前が違えば別', () => {
    expect(formSnapshot({ ...base, name: 'x' })).not.toBe(formSnapshot(base));
  });
});

describe('registrationDataFrom', () => {
  it('手順のあるカードの 1 枚目がメインで、残りがほかの手順', () => {
    const form = {
      ...FIELDS,
      recognition: ' r ',
      cards: [newCard({ ...EMPTY_CARD, mnemonic: 'memo' }), CARD_A, CARD_B],
    };
    expect(registrationDataFrom(form)).toEqual({ recognition: 'r', mainAlg: ENTRY_A, altAlgs: [ENTRY_B] });
  });

  it('判断だけでも残す', () => {
    expect(registrationDataFrom({ ...FIELDS, recognition: 'r', cards: [EMPTY] })).toEqual({
      recognition: 'r',
      mainAlg: EMPTY_CARD,
      altAlgs: [],
    });
  });

  it('何もなければ null', () => {
    expect(registrationDataFrom({ ...FIELDS, recognition: ' ', cards: [EMPTY] })).toBeNull();
  });
});

describe('algErrorOf', () => {
  it('空は誤りではない', () => {
    expect(algErrorOf('')).toBeNull();
    expect(algErrorOf('  ')).toBeNull();
  });

  it('読めない記号は誤り', () => {
    expect(algErrorOf('R Q')?.kind).toBe('unknownSymbol');
    expect(
      hasInvalidCard({ ...FIELDS, recognition: '', cards: [CARD_A, newCard({ ...EMPTY_CARD, text: '(R' })] }),
    ).toBe(true);
  });
});

describe('standardAlgToAdd', () => {
  it('表記の揺れがあっても同じ手順があれば出さない', () => {
    const form = { ...FIELDS, recognition: '', cards: [newCard({ ...EMPTY_CARD, text: "R　U　R'" })] };
    expect(standardAlgToAdd(form, "R U R'")).toBeNull();
    expect(standardAlgToAdd(form, "R U2 R'")).toBe("R U2 R'");
  });
});

describe('カードの並べ替えと増減', () => {
  it('メインにすると先頭に来る', () => {
    expect(moveCardToFront([CARD_A, CARD_B], 1)).toEqual([CARD_B, CARD_A]);
  });

  it('消すと残りが詰まる', () => {
    expect(removeCard([CARD_A, CARD_B], 0)).toEqual([CARD_B]);
  });

  it('最後の 1 枚を消しても空のカードが残る', () => {
    expect(entriesOf(removeCard([CARD_A], 0))).toEqual([EMPTY_CARD]);
  });

  it('元に戻すと元の位置に入る', () => {
    expect(insertCard([CARD_B], 0, CARD_A)).toEqual([CARD_A, CARD_B]);
  });

  it('元に戻すとき、補った空のカードは置き換わる', () => {
    expect(insertCard([EMPTY], 0, CARD_A)).toEqual([CARD_A]);
  });

  it('元の位置が末尾を越えていれば末尾に入る', () => {
    expect(insertCard([CARD_A], 5, CARD_B)).toEqual([CARD_A, CARD_B]);
  });
});
