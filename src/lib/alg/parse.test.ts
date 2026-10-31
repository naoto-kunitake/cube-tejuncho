import { describe, expect, it } from 'vitest';

import { cleanAlgText, parseAlg } from './parse';

function parseOrThrow(raw: string) {
  const result = parseAlg(raw);
  if (!result.ok) {
    throw new Error(`parse failed: ${result.error.kind}`);
  }
  return result.value;
}

describe('cleanAlgText', () => {
  it('全角の記号を半角に直す', () => {
    expect(cleanAlgText('Ｒ　Ｕ　Ｒ’')).toBe("R U R'");
  });

  it("Ri と R- を R' に直す", () => {
    expect(cleanAlgText('Ri U R-')).toBe("R' U R'");
  });

  it("'2 を 2' に直す", () => {
    expect(cleanAlgText("U'2")).toBe("U2'");
  });

  it("R3' を R に直す", () => {
    expect(cleanAlgText("R3' U")).toBe('R U');
  });

  it("R3 を R' に直す", () => {
    expect(cleanAlgText('R3 U')).toBe("R' U");
  });

  it('上付きの 2 を 2 に直す', () => {
    expect(cleanAlgText('R² U')).toBe('R2 U');
  });
});

describe('parseAlg', () => {
  it('空白のない手順を 1 手ずつに分ける', () => {
    expect(parseOrThrow("RUR'U'")).toHaveLength(4);
  });

  it('小文字と Rw を同じ 2 層回しとして読む', () => {
    const [lower, upper] = parseOrThrow('r Rw');
    expect(lower).toEqual({ kind: 'move', base: 'R', isWide: true, suffix: '' });
    expect(upper).toEqual({ kind: 'move', base: 'R', isWide: true, suffix: '' });
  });

  it('2Rw を Rw と同じに読む', () => {
    expect(parseOrThrow('2Rw')).toEqual([{ kind: 'move', base: 'R', isWide: true, suffix: '' }]);
  });

  it("2' の接尾を 1 つの手として読む", () => {
    expect(parseOrThrow("U2'")).toEqual([{ kind: 'move', base: 'U', isWide: false, suffix: "2'" }]);
  });

  it('括弧の塊を繰り返しの数ごと読む', () => {
    const [group] = parseOrThrow("(R U R' U')2 F");
    expect(group?.kind).toBe('group');
    if (group?.kind === 'group') {
      expect(group.moves).toHaveLength(4);
      expect(group.suffix).toBe('2');
    }
  });

  it('使えない記号を位置つきで知らせる', () => {
    expect(parseAlg('R U Q')).toEqual({ ok: false, error: { kind: 'unknownSymbol', symbol: 'Q', index: 4 } });
  });

  it('閉じていない括弧を知らせる', () => {
    expect(parseAlg('(R U')).toEqual({ ok: false, error: { kind: 'unbalancedParenthesis', index: 0 } });
  });

  it('開いていない括弧を知らせる', () => {
    expect(parseAlg('R U)')).toEqual({ ok: false, error: { kind: 'unbalancedParenthesis', index: 3 } });
  });

  it('入れ子の括弧を知らせる', () => {
    expect(parseAlg('((R U))')).toEqual({ ok: false, error: { kind: 'nestedParenthesis', index: 1 } });
  });

  it('空の括弧を知らせる', () => {
    expect(parseAlg('R ()2')).toEqual({ ok: false, error: { kind: 'emptyGroup', index: 2 } });
  });

  it("括弧の後ろの崩れた接尾 ('' など) を知らせる", () => {
    expect(parseAlg("(R U)''")).toEqual({ ok: false, error: { kind: 'unknownSymbol', symbol: "'", index: 6 } });
  });

  it('括弧の繰り返しに 0 を認めない (展開すると空になる)', () => {
    expect(parseAlg('(R U)0')).toEqual({ ok: false, error: { kind: 'unknownSymbol', symbol: '0', index: 5 } });
  });

  it("括弧の後ろの 2' を繰り返しと逆手順として読む", () => {
    const [group] = parseOrThrow("(R U)2'");
    expect(group?.kind === 'group' ? group.suffix : '').toBe("2'");
  });

  it('空の手順を知らせる', () => {
    expect(parseAlg('  ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });
});
