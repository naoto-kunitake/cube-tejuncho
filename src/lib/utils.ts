import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// 自作の型スケール (text-title など) と字間・行間を tailwind-merge に教える。知らないと text-* の色と同じ群に見なして
// `text-label text-muted` の text-label を捨て、文字の大きさが基本の 15px に戻ってしまう
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
