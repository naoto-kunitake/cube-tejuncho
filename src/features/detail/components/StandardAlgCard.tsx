import { Link } from 'react-router';

import { AlgText } from '@/components/AlgText';
import { SECTION_LABEL_CLASS } from '@/components/SectionHeading';
import { PILL_TAP_AREA_CLASS, TEXT_PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { copy } from '@/copy';
import type { WideStyle } from '@/lib/alg/format';
import { cn } from '@/lib/utils';

import { PlayPill } from './PlayPill';

type StandardAlgCardProps = {
  alg: string;
  wideStyle: WideStyle;
  editPath: string;
  onUse: () => void;
  onPlay: () => void;
};

// 未登録のときだけ出す基本手順の提案。まだ自分のものではない手順なので薄い文字と破線
export function StandardAlgCard({ alg, wideStyle, editPath, onUse, onPlay }: StandardAlgCardProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-line-state bg-surface p-4">
      <p className={SECTION_LABEL_CLASS}>{copy.detail.standardAlg}</p>
      <AlgText
        text={alg}
        wideStyle={wideStyle}
        className="w-full min-w-0 text-title leading-alg font-medium tracking-title text-muted"
      />
      <PlayPill onClick={onPlay} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUse}
          className={cn(
            PILL_TAP_AREA_CLASS,
            'inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-accent bg-accent px-4 text-body font-bold whitespace-nowrap text-on-accent pressable hover:bg-accent-hover active:scale-98 active:bg-accent-press',
          )}
        >
          {copy.detail.useThisAlg}
        </button>
        <Link
          to={editPath}
          className={cn(
            TEXT_PILL_TAP_AREA_CLASS,
            'inline-flex min-h-9 items-center rounded-full px-3 text-small font-medium whitespace-nowrap text-accent pressable hover:bg-accent-tint-hover active:bg-accent-tint-press',
          )}
        >
          {copy.detail.registerMyself}
        </Link>
      </div>
    </div>
  );
}
