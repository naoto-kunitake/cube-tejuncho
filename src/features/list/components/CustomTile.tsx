import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { copy } from '@/copy';
import { cn } from '@/lib/utils';

type CustomTileProps = {
  patternId: string;
  name: string;
  mainAlg: string;
};

// 自作は図がないので、図の位置にメイン手順の文字を出す (長い手順は 4 行で省略。全文は詳細)
export function CustomTile({ patternId, name, mainAlg }: CustomTileProps) {
  return (
    <Link
      to={`/p/${patternId}`}
      aria-label={name}
      className="flex min-w-0 flex-col rounded-md border border-line bg-surface p-2 text-center pressable hover:-translate-y-px hover:border-line-strong hover:shadow-1 active:scale-98 active:shadow-none"
    >
      <span
        className={cn(
          'flex aspect-square w-full items-center justify-center overflow-hidden px-0.5 py-1.5 leading-normal',
          mainAlg === '' ? 'text-label text-muted' : 'font-mono text-caption text-ink',
        )}
      >
        <span className="line-clamp-4 break-words">{mainAlg === '' ? copy.list.noAlg : mainAlg}</span>
      </span>
      <span className="truncate pt-1 text-label leading-name font-bold text-ink">{name}</span>
    </Link>
  );
}

type AddPatternTileProps = {
  categoryId: string;
};

// 追加のタイルは末尾 (先頭に置くと毎回目に入って邪魔になる。空のカテゴリではタイルがこれだけになる)
export function AddPatternTile({ categoryId }: AddPatternTileProps) {
  return (
    <Link
      to={`/p/new?category=${categoryId}`}
      className="flex min-h-26.5 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line-state text-muted pressable hover:border-muted hover:bg-hover-ground"
    >
      <Plus size={26} strokeWidth={1.8} aria-hidden="true" />
      <span className="text-label leading-name font-medium">{copy.list.addPattern}</span>
    </Link>
  );
}
