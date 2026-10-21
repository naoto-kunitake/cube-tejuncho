import type { ReactNode } from 'react';

import { formatMove, type WideStyle } from '@/lib/alg/format';
import { type AlgItem, type Move, parseAlg } from '@/lib/alg/parse';
import { cn } from '@/lib/utils';

type AlgTextProps = {
  text: string;
  wideStyle: WideStyle;
  isMain?: boolean;
  // 再生中の手 (手順を展開したときの通し番号)。null なら強調しない
  currentIndex?: number | null;
  className?: string;
};

type NumberedItem = { item: AlgItem; startIndex: number };

// 各項目の先頭の手が、手順全体で何番目か
export function numberItems(items: readonly AlgItem[]): NumberedItem[] {
  let count = 0;
  return items.map((item) => {
    const numbered = { item, startIndex: count };
    count += item.kind === 'move' ? 1 : item.moves.length;
    return numbered;
  });
}

// 括弧の繰り返しや逆手順があると、展開後の手の数と文字の数が合わないので強調しない
export function canHighlight(items: readonly AlgItem[]): boolean {
  return items.every((item) => item.kind === 'move' || item.suffix === '');
}

const CURRENT_CLASS = 'font-bold text-accent underline decoration-2 underline-offset-4';

type MoveSpanProps = {
  move: Move;
  wideStyle: WideStyle;
  isCurrent: boolean;
  before?: ReactNode;
  after?: ReactNode;
};

function MoveSpan({ move, wideStyle, isCurrent, before, after }: MoveSpanProps) {
  return (
    <span className={cn('whitespace-nowrap', isCurrent && CURRENT_CLASS)}>
      {before}
      {formatMove(move, wideStyle)}
      {after}
    </span>
  );
}

// 1 動き (M2、U') を 1 語として折り返す。括弧の塊は中も同じ間隔で、括弧だけ薄く
export function AlgText({ text, wideStyle, isMain = false, currentIndex = null, className }: AlgTextProps) {
  const parsed = parseAlg(text);
  if (!parsed.ok) {
    return <span className={className}>{text}</span>;
  }
  const highlightAt = canHighlight(parsed.value) ? currentIndex : null;
  return (
    <span className={cn('alg-wrap font-mono', isMain && 'alg-wrap-main', className)}>
      {numberItems(parsed.value).map(({ item, startIndex }, index) => {
        if (item.kind === 'move') {
          return <MoveSpan key={index} move={item} wideStyle={wideStyle} isCurrent={startIndex === highlightAt} />;
        }
        const last = item.moves.length - 1;
        return (
          <span key={index} className="alg-chunk">
            {item.moves.map((move, moveAt) => (
              <MoveSpan
                key={moveAt}
                move={move}
                wideStyle={wideStyle}
                isCurrent={startIndex + moveAt === highlightAt}
                before={moveAt === 0 ? <span className="font-normal text-muted">(</span> : undefined}
                after={
                  moveAt === last ? <span className="font-normal text-muted">{`)${item.suffix}`}</span> : undefined
                }
              />
            ))}
          </span>
        );
      })}
    </span>
  );
}
