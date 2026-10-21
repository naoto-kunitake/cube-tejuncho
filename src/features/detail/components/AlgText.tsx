import { formatMove, type WideStyle } from '@/lib/alg/format';
import { parseAlg } from '@/lib/alg/parse';
import { cn } from '@/lib/utils';

type AlgTextProps = {
  text: string;
  wideStyle: WideStyle;
  isMain?: boolean;
  className?: string;
};

// 1 動き (M2、U') を 1 語として折り返す。括弧の塊は中も同じ間隔で、括弧だけ薄く
export function AlgText({ text, wideStyle, isMain = false, className }: AlgTextProps) {
  const parsed = parseAlg(text);
  if (!parsed.ok) {
    return <span className={className}>{text}</span>;
  }
  return (
    <span className={cn('alg-wrap font-mono', isMain && 'alg-wrap-main', className)}>
      {parsed.value.map((item, index) => {
        if (item.kind === 'move') {
          return (
            <span key={index} className="whitespace-nowrap">
              {formatMove(item, wideStyle)}
            </span>
          );
        }
        const last = item.moves.length - 1;
        return (
          <span key={index} className="alg-chunk">
            {item.moves.map((move, moveIndex) => (
              <span key={moveIndex} className="whitespace-nowrap">
                {moveIndex === 0 && <span className="font-normal text-muted">(</span>}
                {formatMove(move, wideStyle)}
                {moveIndex === last && <span className="font-normal text-muted">{`)${item.suffix}`}</span>}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
