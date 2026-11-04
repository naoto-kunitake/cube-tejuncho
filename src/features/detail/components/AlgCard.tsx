import { Pencil } from 'lucide-react';

import { algLabelOf } from '@/components/alg-label';
import { AlgText } from '@/components/AlgText';
import { IconLink } from '@/components/IconButton';
import { copy } from '@/copy';
import type { AlgEntry } from '@/data/document';
import type { WideStyle } from '@/lib/alg/format';
import { cn } from '@/lib/utils';

import { PlayPill } from './PlayPill';

type AlgCardProps = {
  alg: AlgEntry;
  wideStyle: WideStyle;
  // 登録の中の通し番号。0がメイン手順。編集に飛ぶときにその欄を指す
  index: number;
  editPath: string;
  onPlay: () => void;
};

// 手順 → 再生と編集 → 覚え方・指使い の縦積み。手順の文字を全幅に出すため横に何も置かない。
// 編集は再生と同じ行の右端に記号だけで置く (主操作は左、副操作は右端。回転記号の行の再生と同じ置き方)
export function AlgCard({ alg, wideStyle, index, editPath, onPlay }: AlgCardProps) {
  const isMain = index === 0;
  const hasMnemonicOrFingering = alg.mnemonic !== '' || alg.fingering !== '';
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-md border bg-surface p-4',
        isMain ? 'border-line-strong' : 'border-line',
      )}
    >
      <AlgText
        text={alg.text}
        wideStyle={wideStyle}
        isMain={isMain}
        className={cn(
          'w-full min-w-0',
          isMain ? 'text-alg leading-alg font-semibold tracking-title' : 'text-input leading-normal',
        )}
      />
      <div className="flex w-full items-center justify-between">
        <PlayPill onClick={onPlay} />
        {/* 36の丸の中の18の記号をカードの余白16に揃えるため9引く ((36 − 18) ÷ 2) */}
        <IconLink
          to={editPath}
          state={{ focus: 'alg', index }}
          label={copy.a11y.editAlg(algLabelOf(index))}
          on="surface"
          className="-mr-2.25 text-muted hover:text-ink"
        >
          <Pencil size={18} strokeWidth={1.8} aria-hidden="true" />
        </IconLink>
      </div>
      {hasMnemonicOrFingering && (
        <dl className="note-grid text-small">
          {alg.mnemonic !== '' && (
            <>
              <dt className="text-label text-muted">{copy.detail.mnemonic}</dt>
              <dd>{alg.mnemonic}</dd>
            </>
          )}
          {alg.fingering !== '' && (
            <>
              <dt className="text-label text-muted">{copy.detail.fingering}</dt>
              <dd>{alg.fingering}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
