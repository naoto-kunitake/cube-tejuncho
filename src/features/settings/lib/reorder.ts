// 行の高さが揃った一覧のドラッグ並べ替え。持ち上げた行の中心が隣の行の中心を越えたら入れ替わるので、
// 移動量を行の高さで丸めた数だけ添字がずれる
export function targetIndexOf(startIndex: number, deltaY: number, rowHeight: number, count: number): number {
  const target = startIndex + Math.round(deltaY / rowHeight);
  return Math.min(Math.max(target, 0), count - 1);
}

// 持ち上げた行以外の行が、空いた隙間を埋めるためにずれる向き (-1は上へ1行、1は下へ1行)
export function shiftOf(index: number, startIndex: number, targetIndex: number): -1 | 0 | 1 {
  if (startIndex < index && index <= targetIndex) {
    return -1;
  }
  if (targetIndex <= index && index < startIndex) {
    return 1;
  }
  return 0;
}
