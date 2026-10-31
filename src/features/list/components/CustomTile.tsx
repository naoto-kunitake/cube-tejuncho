import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { AlgText } from '@/components/AlgText';
import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import { cn } from '@/lib/utils';

type CustomTileProps = {
  patternId: string;
  name: string;
  mainAlg: string;
  settings: Pick<Settings, 'listView' | 'wideStyle'>;
};

// 自作は図がないので、グリッドでは図の位置にメイン手順の文字を出す (長い手順は4行で省略。全文は詳細)。
// リストでは名前と手順の行
export function CustomTile({ patternId, name, mainAlg, settings }: CustomTileProps) {
  const isList = settings.listView === 'list';
  return (
    <Link
      to={`/p/${patternId}`}
      aria-label={name}
      className={cn(
        'flex min-w-0 rounded-md border border-line bg-surface pressable hover:-translate-y-px hover:border-line-strong hover:shadow-1 active:scale-98 active:shadow-none',
        isList ? 'min-h-18 flex-col justify-center gap-0.5 px-4 py-2 text-left' : 'flex-col p-2 text-center',
      )}
    >
      {isList ? (
        <>
          <span className="truncate text-body leading-name font-bold text-ink">{name}</span>
          {mainAlg === '' ? (
            <span className="text-small text-muted">{copy.list.noAlg}</span>
          ) : (
            <AlgText text={mainAlg} wideStyle={settings.wideStyle} className="text-small text-ink" />
          )}
        </>
      ) : (
        <>
          <span
            className={cn(
              'flex aspect-square w-full items-center justify-center overflow-hidden px-0.5 py-1.5 leading-normal',
              mainAlg === '' ? 'text-label text-muted' : 'font-mono text-caption text-ink',
            )}
          >
            <span className="line-clamp-4 break-words">{mainAlg === '' ? copy.list.noAlg : mainAlg}</span>
          </span>
          <span className="truncate pt-1 text-label leading-name font-bold text-ink">{name}</span>
        </>
      )}
    </Link>
  );
}

type AddPatternTileProps = {
  categoryId: string;
  listView: Settings['listView'];
};

// 追加のタイルは末尾 (先頭に置くと毎回目に入って邪魔になる。空のカテゴリではタイルがこれだけになる)
export function AddPatternTile({ categoryId, listView }: AddPatternTileProps) {
  const isList = listView === 'list';
  return (
    <Link
      to={`/p/new?category=${categoryId}`}
      className={cn(
        'flex items-center rounded-md border border-dashed border-line-state text-muted pressable hover:border-muted hover:bg-hover-ground',
        isList ? 'min-h-14 flex-row gap-2 px-3.5' : 'min-h-26.5 flex-col justify-center gap-1',
      )}
    >
      <Plus size={isList ? 22 : 26} strokeWidth={1.8} aria-hidden="true" />
      <span className={cn('leading-name font-medium', isList ? 'text-body' : 'text-label')}>
        {copy.list.addPattern}
      </span>
    </Link>
  );
}
