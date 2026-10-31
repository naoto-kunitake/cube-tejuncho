import { cleanAlgText, type Move, parseAlg } from './parse';

export const WIDE_STYLES = ['r', 'Rw'] as const;
export type WideStyle = (typeof WIDE_STYLES)[number];

export function formatMove(move: Move, wideStyle: WideStyle): string {
  if (!move.isWide) {
    return move.base + move.suffix;
  }
  const wide = wideStyle === 'r' ? move.base.toLowerCase() : `${move.base}w`;
  return wide + move.suffix;
}

// 表示用の整形。揺れを吸収し、空白を補い、2層回しを設定の表記に揃える。
// 読めない手順は手を加えずに返す (登録前の検証はparseAlgの責務)
export function formatAlg(raw: string, wideStyle: WideStyle): string {
  const parsed = parseAlg(raw);
  if (!parsed.ok) {
    return cleanAlgText(raw);
  }
  return parsed.value
    .map((item) => {
      if (item.kind === 'move') {
        return formatMove(item, wideStyle);
      }
      const inner = item.moves.map((move) => formatMove(move, wideStyle)).join(' ');
      return `(${inner})${item.suffix}`;
    })
    .join(' ');
}
