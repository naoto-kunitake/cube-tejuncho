import { Link } from 'react-router';

import { type FigureSettings, PresetFigure } from '@/components/figures/PresetFigure';
import { copy } from '@/copy';
import type { Preset } from '@/data/presets/catalog';
import { cn } from '@/lib/utils';

type PatternTileProps = {
  preset: Preset;
  settings: FigureSettings;
  categoryLabel: string;
  // 一覧の中では短い名前 (番号だけ) にすることがあるので、プリセットの名前とは別に受け取る
  name: string;
  isRegistered: boolean;
};

export function PatternTile({ preset, settings, categoryLabel, name, isRegistered }: PatternTileProps) {
  return (
    <Link
      to={`/p/${preset.id}`}
      aria-label={copy.a11y.tile(categoryLabel, name, isRegistered)}
      className={cn(
        'flex min-w-0 flex-col rounded-md border p-2 text-center pressable hover:border-line-strong active:scale-98 active:shadow-none',
        // 未登録 (点線) は浮かせず、枠を濃くするだけ
        isRegistered
          ? 'border-line bg-surface hover:-translate-y-px hover:shadow-1'
          : 'border-dashed border-line-state bg-transparent hover:bg-surface',
      )}
    >
      <PresetFigure preset={preset} settings={settings} label={name} className="aspect-square w-full" />
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
