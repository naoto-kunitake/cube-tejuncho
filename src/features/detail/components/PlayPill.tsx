import { Play } from 'lucide-react';

import { Button } from '@/components/Button';
import { copy } from '@/copy';

type PlayPillProps = {
  onClick: () => void;
};

// 手順カードの「▶ 再生」。枠だけのボタンと同じ形で、記号のぶん左の余白を詰める
export function PlayPill({ onClick }: PlayPillProps) {
  return (
    <Button variant="quiet" className="gap-1.5 pr-3.5 pl-2.5" onClick={onClick}>
      <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      {copy.detail.play}
    </Button>
  );
}
