import { copy } from '@/copy';

// 手順の通し番号 (0がメイン手順、1以降がほかの手順) から見出しの名前を決める。
// 詳細の手順カードの読み上げ名と、編集のカードの見出しで同じ名前にする
export function algLabelOf(index: number): string {
  return index === 0 ? copy.edit.mainAlg : copy.edit.altAlg(index + 1);
}
