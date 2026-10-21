import { AlgText } from '@/components/AlgText';
import { copy } from '@/copy';
import type { AlgEntry } from '@/data/document';
import type { WideStyle } from '@/lib/alg/format';
import { cn } from '@/lib/utils';

import { PlayPill } from './PlayPill';

type AlgCardProps = {
  alg: AlgEntry;
  wideStyle: WideStyle;
  isMain: boolean;
  onPlay: () => void;
};

// 手順 → 覚え方・指使い の縦積み。手順の文字を全幅に出すため横に何も置かない
export function AlgCard({ alg, wideStyle, isMain, onPlay }: AlgCardProps) {
  const hasNotes = alg.mnemonic !== '' || alg.fingering !== '';
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
      <PlayPill onClick={onPlay} />
      {hasNotes && (
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
