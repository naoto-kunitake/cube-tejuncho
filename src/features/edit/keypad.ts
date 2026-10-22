// 手順入力の専用キーパッド。文字キーは記号を入れ、操作キーは 削除 / 全消去 / キーボード (普通のキーボードに切り替え)。
// 空白のキーは置かない (文字キーが空白を自動で補い、解析器も空白を読み飛ばす)
export const CHARACTER_KEYS = [
  'R',
  'U',
  'F',
  'L',
  'D',
  'B',
  "'",
  '2',
  'w',
  'M',
  'E',
  'S',
  'x',
  'y',
  'z',
  '(',
  ')',
] as const;
export type CharacterKey = (typeof CHARACTER_KEYS)[number];
export const ACTION_KEYS = ['backspace', 'clear', 'keyboard'] as const;
export type ActionKey = (typeof ACTION_KEYS)[number];
export type KeypadKey = CharacterKey | ActionKey;

export type TextEdit = { start: number; end: number; insert: string };

// 記号を入れるとき、直前が空白でも括弧でもなければ空白を補う (R の後に U を押せば R U になる)。' と 2 と ) は前の手にくっつく
export function insertionFor(value: string, start: number, end: number, key: CharacterKey): TextEdit {
  const before = value.slice(0, start);
  const needsSpace = /^[A-Za-z(]$/.test(key) && before !== '' && !/[\s(]$/.test(before);
  return { start, end, insert: needsSpace ? ` ${key}` : key };
}

// 削除は選択範囲、なければ直前の 1 文字
export function deletionFor(start: number, end: number): TextEdit {
  const from = start === end ? Math.max(0, start - 1) : start;
  return { start: from, end, insert: '' };
}

export function clearingFor(value: string): TextEdit {
  return { start: 0, end: value.length, insert: '' };
}

export function applyEdit(value: string, edit: TextEdit): { value: string; caret: number } {
  return {
    value: value.slice(0, edit.start) + edit.insert + value.slice(edit.end),
    caret: edit.start + edit.insert.length,
  };
}
