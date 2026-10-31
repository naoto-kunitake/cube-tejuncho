import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// 自作の型スケール (text-titleなど) と字間・行間をtailwind-mergeに教える。知らないとtext-* の色と同じ群に見なして
// `text-label text-muted`のtext-labelを捨て、文字の大きさが基本の15pxに戻ってしまう
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['title', 'alg', 'alg-compact', 'input', 'body', 'small', 'label', 'caption'] }],
      tracking: [{ tracking: ['title', 'count'] }],
      leading: [{ leading: ['name', 'alg', 'screen'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
