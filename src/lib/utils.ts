import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// 安全領域のユーティリティ (pb-safe-6など)。数は余白の刻み
function isSafeAreaSpacing(value: string): boolean {
  return /^safe-\d+$/.test(value);
}

// 自作の型スケール (text-titleなど) と字間・行間をtailwind-mergeに教える。知らないとtext-* の色と同じ群に見なして
// `text-label text-muted`のtext-labelを捨て、文字の大きさが基本の15pxに戻ってしまう。
// 安全領域のユーティリティも余白と同じ群に入れる。知らないと`pb-safe-6 pb-60`のように両方が残り、
// 生成の順で後にあるクラスが勝つ (キーパッドを避ける余白が効かなくなる)
const twMerge = extendTailwindMerge({
  extend: {
    // タブの中身の切り替えの動き。既定のanimate群はspin / ping / pulse / bounceだけなので、知らないと群に入らず、
    // 重ねたanimateのクラスが両方残る
    theme: {
      animate: ['slide-in-forward', 'slide-in-backward'],
    },
    classGroups: {
      'font-size': [{ text: ['title', 'alg', 'alg-compact', 'input', 'body', 'small', 'label', 'caption'] }],
      tracking: [{ tracking: ['title', 'count'] }],
      leading: [{ leading: ['name', 'alg', 'screen'] }],
      pt: [{ pt: ['bar'] }],
      pb: [{ pb: [isSafeAreaSpacing] }],
      bottom: [{ bottom: [isSafeAreaSpacing] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
