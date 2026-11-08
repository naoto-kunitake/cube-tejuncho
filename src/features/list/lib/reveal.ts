type Span = { left: number; right: number };

// 器の中で対象が見えるようになる最小の横のずれ。左にはみ出せば負、右にはみ出せば正、収まっていれば0
export function revealShiftOf(container: Span, target: Span): number {
  if (target.left < container.left) {
    return target.left - container.left;
  }
  if (target.right > container.right) {
    return target.right - container.right;
  }
  return 0;
}
