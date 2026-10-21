import { Link } from 'react-router';

import { AlgText } from '@/components/AlgText';
import { Button, buttonVariants } from '@/components/Button';
import { SECTION_LABEL_CLASS } from '@/components/SectionHeading';
import { copy } from '@/copy';
import type { WideStyle } from '@/lib/alg/format';

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
        <Button variant="primary" onClick={onUse}>
          {copy.detail.useThisAlg}
        </Button>
        <Link to={editPath} state={{ focus: 'alg' }} className={buttonVariants({ variant: 'text' })}>
          {copy.detail.registerMyself}
        </Link>
      </div>
    </div>
  );
}
