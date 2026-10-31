import { type Arrow, arrowPaths } from '@/lib/figure/arrows';
import { cellPosition, FIGURE_LAYOUT, SIDE_FAR, SIDE_NEAR } from '@/lib/figure/layout';
import type { FigureColor, FigureView } from '@/lib/figure/view';
import { cn } from '@/lib/utils';

import { STICKER_COLOR_VARIABLE } from './sticker-color';

const { cell, sideThickness, cornerRadius, viewBox } = FIGURE_LAYOUT;

type StickerProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: FigureColor;
};

// 白は真っ白にして縁取りだけ濃くする (csTimer / cubing.js / speedsolving wikiと同じ「白 + 黒い輪郭」方式)
function Sticker({ x, y, width, height, color }: StickerProps) {
  const isWhite = color === 'W';
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={cornerRadius}
      style={{
        fill: STICKER_COLOR_VARIABLE[color],
        stroke: 'var(--sticker-edge)',
        strokeOpacity: isWhite ? 0.6 : 0.3,
        strokeWidth: isWhite ? 0.9 : 0.6,
      }}
    />
  );
}

type TopFigureProps = {
  view: FigureView;
  arrows?: readonly Arrow[];
  label: string;
  className?: string;
};

export function TopFigure({ view, arrows = [], label, className }: TopFigureProps) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={cn('block aspect-square h-auto w-full', className)}>
      {view.u.map((color, index) => (
        <Sticker
          key={`u${index}`}
          x={cellPosition(index % 3)}
          y={cellPosition(Math.floor(index / 3))}
          width={cell}
          height={cell}
          color={color}
        />
      ))}
      {view.b.map((color, index) => (
        <Sticker
          key={`b${index}`}
          x={cellPosition(index)}
          y={SIDE_NEAR}
          width={cell}
          height={sideThickness}
          color={color}
        />
      ))}
      {view.f.map((color, index) => (
        <Sticker
          key={`f${index}`}
          x={cellPosition(index)}
          y={SIDE_FAR}
          width={cell}
          height={sideThickness}
          color={color}
        />
      ))}
      {view.l.map((color, index) => (
        <Sticker
          key={`l${index}`}
          x={SIDE_NEAR}
          y={cellPosition(index)}
          width={sideThickness}
          height={cell}
          color={color}
        />
      ))}
      {view.r.map((color, index) => (
        <Sticker
          key={`r${index}`}
          x={SIDE_FAR}
          y={cellPosition(index)}
          width={sideThickness}
          height={cell}
          color={color}
        />
      ))}
      {arrowPaths(arrows).map((d) => (
        <path key={d} d={d} style={{ fill: 'var(--sticker-edge)', stroke: 'none' }} />
      ))}
    </svg>
  );
}
