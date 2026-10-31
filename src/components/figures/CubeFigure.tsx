import { type CubeFace, ISOMETRIC_STICKERS, ISOMETRIC_VIEW_BOX } from '@/lib/figure/isometric';
import type { CubeFigureView, FigureColor } from '@/lib/figure/view';
import { cn } from '@/lib/utils';

import { STICKER_COLOR_VARIABLE } from './sticker-color';

// 添字は等角投影の表が0〜8しか出さないので、外れていたら表のバグ
function colorOf(view: CubeFigureView, face: CubeFace, index: number): FigureColor {
  const color = view[face][index];
  if (color === undefined) {
    throw new Error(`invalid sticker: ${face}${index}`);
  }
  return color;
}

type CubeFigureProps = {
  view: CubeFigureView;
  label: string;
  className?: string;
};

// 3面 (上・前・右) の等角投影の図。F2Lの右前スロットの様子を見せる。
// 白は真っ白にして縁取りだけ濃くする (上面図と同じ)
export function CubeFigure({ view, label, className }: CubeFigureProps) {
  return (
    <svg
      viewBox={ISOMETRIC_VIEW_BOX}
      role="img"
      aria-label={label}
      className={cn('block aspect-square h-auto w-full', className)}
    >
      {ISOMETRIC_STICKERS.map(({ face, index, points }) => {
        const color = colorOf(view, face, index);
        const isWhite = color === 'W';
        return (
          <polygon
            key={`${face}${index}`}
            points={points}
            strokeLinejoin="round"
            style={{
              fill: STICKER_COLOR_VARIABLE[color],
              stroke: 'var(--sticker-edge)',
              strokeOpacity: isWhite ? 0.6 : 0.35,
              strokeWidth: isWhite ? 0.45 : 0.3,
            }}
          />
        );
      })}
    </svg>
  );
}
