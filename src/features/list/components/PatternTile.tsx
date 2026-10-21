import { Link } from 'react-router';

import { TopFigure } from '@/components/figures/TopFigure';
import { copy } from '@/copy';
import type { FigureView } from '@/lib/figure/view';
import { cn } from '@/lib/utils';

type PatternTileProps = {
  patternId: string;
  categoryLabel: string;
  name: string;
  view: FigureView;
  isRegistered: boolean;
};

export function PatternTile({ patternId, categoryLabel, name, view, isRegistered }: PatternTileProps) {
  return (
    <Link
      to={`/p/${patternId}`}
      aria-label={copy.a11y.tile(categoryLabel, name, isRegistered)}
      className={cn(
        'flex min-w-0 flex-col rounded-md border p-2 text-center pressable hover:border-line-strong active:scale-98 active:shadow-none',
        // 未登録 (点線) は浮かせず、枠を濃くするだけ
        isRegistered
          ? 'border-line bg-surface hover:-translate-y-px hover:shadow-1'
          : 'border-dashed border-line-state bg-transparent hover:bg-surface',
      )}
    >
      <TopFigure view={view} label={name} className="aspect-square w-full" />
      <span
        className={cn(
          'truncate pt-1 text-label leading-name',
          isRegistered ? 'font-bold text-ink' : 'font-medium text-muted',
        )}
      >
        {name}
      </span>
    </Link>
  );
}
