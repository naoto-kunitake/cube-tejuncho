import type { WideStyle } from '@/lib/alg/format';

// 手順入力の専用キーパッド。文字キーは記号を入れ、操作キーは 削除 / 全消去 / キーボード (普通のキーボードに切り替え) /
// 完了 (欄を離れて閉じる。ほかの場所を押しても閉じるが、iOSのキーボードと同じく終え方を見せる)。
// 空白のキーは置かない (文字キーが空白を自動で補い、解析器も空白を読み飛ばす)
// 6個ずつ3段: 面 / 接尾辞と括弧 / 中層と持ち替え
export const CHARACTER_KEYS = [
  'R',
  'U',
  'F',
  'L',
  'D',
  'B',
  "'",
  '2',
  '3',
  'w',
  '(',
  ')',
  'M',
  'E',
  'S',
  'x',
  'y',
  'z',
] as const;
const FACE_KEYS = ['R', 'U', 'F', 'L', 'D', 'B'] as const;
// 並びは面の段と同じ (Rと同じ列にr)
const WIDE_KEYS = {
  r: ['r', 'u', 'f', 'l', 'd', 'b'],
  Rw: ['Rw', 'Uw', 'Fw', 'Lw', 'Dw', 'Bw'],
} as const satisfies Record<WideStyle, readonly string[]>;
const SUFFIX_KEYS = ["'", '2', '3', '(', ')'] as const;
const SLICE_AND_ROTATION_KEYS = ['M', 'E', 'S', 'x', 'y', 'z'] as const;
export type CharacterKey = (typeof CHARACTER_KEYS)[number] | (typeof WIDE_KEYS)[WideStyle][number];
export const ACTION_KEYS = ['backspace', 'clear', 'keyboard', 'done'] as const;
export type ActionKey = (typeof ACTION_KEYS)[number];
export type KeypadKey = CharacterKey | ActionKey;

// 6個ずつ4段 (面 / 接尾辞と括弧と削除 / 2層回し / 中層と持ち替え) と、最下段の操作キー3つ。
// 接尾辞の段は面の段の真下に置く (基本手順119件の押下の94%がこの2段で、間に別の段を挟むとRから'までが1段遠くなる)。
// 2層回しの段は設定の表記で出し、その文字のまま入れる
export function keypadKeysOf(wideStyle: WideStyle): readonly KeypadKey[] {
  return [
    ...FACE_KEYS,
    ...SUFFIX_KEYS,
    'backspace',
    ...WIDE_KEYS[wideStyle],
    ...SLICE_AND_ROTATION_KEYS,
    'clear',
    'keyboard',
    'done',
  ];
}

export type TextEdit = { start: number; end: number; insert: string };

// 前の手にくっつくキー (wは2層回しの接尾辞。x y zは持ち替えで独立した手なので入れない)
const ATTACHED_KEYS: ReadonlySet<CharacterKey> = new Set(["'", '2', '3', 'w', ')']);

// 記号を入れるとき、直前が空白でも括弧でもなければ空白を補う (Rの後にUを押せばR Uになる)。くっつくキーは補わない
export function insertionFor(value: string, start: number, end: number, key: CharacterKey): TextEdit {
  const before = value.slice(0, start);
  const needsSpace = !ATTACHED_KEYS.has(key) && before !== '' && !/[\s(]$/.test(before);
  return { start, end, insert: needsSpace ? ` ${key}` : key };
}

// 削除は選択範囲、なければ直前の1文字
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
