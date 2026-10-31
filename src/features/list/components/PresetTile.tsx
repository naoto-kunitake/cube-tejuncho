import { Link } from 'react-router';

import { AlgText } from '@/components/AlgText';
import { type FigureSettings, PresetFigure } from '@/components/figures/PresetFigure';
import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { cn } from '@/lib/utils';

export type TileSettings = FigureSettings & Pick<Settings, 'listView' | 'wideStyle'>;

type PresetTileProps = {
  preset: Preset;
  settings: TileSettings;
  categoryLabel: string;
  // 一覧の中では短い名前 (番号だけ) にすることがあるので、プリセットの名前とは別に受け取る
  name: string;
  isRegistered: boolean;
  // メイン手順の原文。登録済みでも空のことがある (判断だけ記録した場合)
  mainAlg: string;
};

// グリッド = 図 + 名前のタイル (識別が主)。リスト = 図56 + 名前 + 手順の行 (手順をその場で読む)。
// どちらも1枚ずつのカードで、未登録は点線で浮かせない
export function PresetTile({ preset, settings, categoryLabel, name, isRegistered, mainAlg }: PresetTileProps) {
  const isList = settings.listView === 'list';
  return (
    <Link
      to={`/p/${preset.id}`}
      aria-label={copy.a11y.tile(categoryLabel, name, isRegistered)}
      className={cn(
        'flex min-w-0 rounded-md border pressable hover:border-line-strong active:scale-98 active:shadow-none',
        // 行の余白8/16/8/6: 図の見た目の左端と文字の右端が16に揃う (図のSVGは外側に空きがある)
        isList ? 'min-h-18 flex-row items-center gap-3 py-2 pr-4 pl-1.5 text-left' : 'flex-col p-2 text-center',
        isRegistered
          ? 'border-line bg-surface hover:-translate-y-px hover:shadow-1'
          : 'border-dashed border-line-state bg-transparent hover:bg-surface',
      )}
    >
      <PresetFigure
        preset={preset}
        settings={settings}
        label={name}
        className={isList ? 'w-14 flex-none' : 'aspect-square w-full'}
      />
      <span className={cn('flex min-w-0 flex-col', isList ? 'flex-1 gap-0.5' : 'pt-1')}>
        <span
          className={cn(
            'truncate leading-name',
            isList ? 'text-body' : 'text-label',
            isRegistered ? 'font-bold text-ink' : 'font-medium text-muted',
          )}
        >
          {name}
        </span>
        {isList && isRegistered && mainAlg === '' && <span className="text-small text-muted">{copy.list.noAlg}</span>}
        {isList && isRegistered && mainAlg !== '' && (
          <AlgText text={mainAlg} wideStyle={settings.wideStyle} className="text-small text-ink" />
        )}
      </span>
    </Link>
  );
}
