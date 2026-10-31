import { err, ok, type Result } from '@/lib/result';

export type MoveBase = 'R' | 'L' | 'U' | 'D' | 'F' | 'B' | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
export type MoveSuffix = '' | "'" | '2' | "2'";

export type Move = {
  kind: 'move';
  base: MoveBase;
  isWide: boolean;
  suffix: MoveSuffix;
};

// (R U R' U')2のような塊。塊の後ろの数字や ' は繰り返しと逆手順の指定で、そのまま文字で持つ
export type MoveGroup = {
  kind: 'group';
  moves: Move[];
  suffix: string;
};

export type AlgItem = Move | MoveGroup;

export type AlgError =
  | { kind: 'empty' }
  | { kind: 'unknownSymbol'; symbol: string; index: number }
  | { kind: 'unbalancedParenthesis'; index: number }
  | { kind: 'nestedParenthesis'; index: number }
  | { kind: 'emptyGroup'; index: number };

const FACE_BASES = new Set(['R', 'L', 'U', 'D', 'F', 'B']);
const OTHER_BASES = new Set(['M', 'E', 'S', 'x', 'y', 'z']);
const WIDE_LOWER: Record<string, MoveBase> = { r: 'R', l: 'L', u: 'U', d: 'D', f: 'F', b: 'B' };

function isMoveBase(char: string): char is MoveBase {
  return FACE_BASES.has(char) || OTHER_BASES.has(char);
}

// 直せる揺れは黙って受け付ける。全角、曲がった引用符、上付きの2、Ri / R- / R3の逆手順、'2の順
export function cleanAlgText(raw: string): string {
  return raw
    .replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .replace(/[’‘′`´]/g, "'")
    .replace(/²/g, '2')
    .replace(/([RLUDFBMESxyzrludfb]w?)[i-](?![A-Za-z])/g, "$1'")
    .replace(/([RLUDFBMESxyzrludfb]w?)3(?![\d])/g, "$1'")
    .replace(/'2/g, "2'")
    .trim();
}

type Scan = { text: string; index: number };

function readSuffix(scan: Scan): MoveSuffix {
  const rest = scan.text.slice(scan.index);
  const matched = /^(2'|'|2)/.exec(rest);
  if (matched === null) {
    return '';
  }
  scan.index += matched[0].length;
  return matched[0] === "2'" ? "2'" : matched[0] === "'" ? "'" : '2';
}

function readMove(scan: Scan): Move | null {
  const { text } = scan;
  let index = scan.index;
  // WCAの2RwはRwと同じ
  if (text[index] === '2' && FACE_BASES.has(text[index + 1] ?? '') && text[index + 2] === 'w') {
    index += 1;
  }
  const char = text[index] ?? '';
  let base: MoveBase;
  let isWide = false;
  if (WIDE_LOWER[char] !== undefined) {
    base = WIDE_LOWER[char];
    isWide = true;
    index += 1;
  } else if (isMoveBase(char)) {
    base = char;
    index += 1;
    if (FACE_BASES.has(char) && text[index] === 'w') {
      isWide = true;
      index += 1;
    }
  } else {
    return null;
  }
  scan.index = index;
  const suffix = readSuffix(scan);
  return { kind: 'move', base, isWide, suffix };
}

export function parseAlg(raw: string): Result<AlgItem[], AlgError> {
  const text = cleanAlgText(raw);
  if (text === '') {
    return err({ kind: 'empty' });
  }
  const items: AlgItem[] = [];
  let group: MoveGroup | null = null;
  let groupStart = 0;
  const scan: Scan = { text, index: 0 };
  while (scan.index < text.length) {
    const char = text[scan.index] ?? '';
    if (char === ' ') {
      scan.index += 1;
      continue;
    }
    if (char === '(') {
      if (group !== null) {
        return err({ kind: 'nestedParenthesis', index: scan.index });
      }
      group = { kind: 'group', moves: [], suffix: '' };
      groupStart = scan.index;
      scan.index += 1;
      continue;
    }
    if (char === ')') {
      if (group === null) {
        return err({ kind: 'unbalancedParenthesis', index: scan.index });
      }
      if (group.moves.length === 0) {
        return err({ kind: 'emptyGroup', index: groupStart });
      }
      scan.index += 1;
      // 手と同じ並び (繰り返しの数 → 省略できる ') だけ認める。はみ出した文字は次の周でunknownSymbolになる
      const suffix = /^(\d+'?|')?/.exec(text.slice(scan.index))?.[0] ?? '';
      scan.index += suffix.length;
      items.push({ ...group, suffix });
      group = null;
      continue;
    }
    const move = readMove(scan);
    if (move === null) {
      return err({ kind: 'unknownSymbol', symbol: char, index: scan.index });
    }
    if (group === null) {
      items.push(move);
    } else {
      group.moves.push(move);
    }
  }
  if (group !== null) {
    return err({ kind: 'unbalancedParenthesis', index: groupStart });
  }
  return ok(items);
}
