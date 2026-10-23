import { cn } from '@/lib/utils';

// 錠剤は溝 (36) の内側で 32。押せる範囲は疑似要素で上下 6 ずつ広げて 44 にする (ピルの ±5 では 42 で足りない)
const SEGMENT_TAP_AREA_CLASS = 'relative before:absolute before:inset-x-0 before:-inset-y-1.5 before:rounded-full';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  // 色の選択肢 (上面・前面の色) に添える点。図の色のクラス (STICKER_DOT_CLASS) を渡す
  dotClassName?: string;
};

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // 4 択 (前面の色) は錠剤の余白を詰めて 1 行に収める
  isCompact?: boolean;
};

// 2〜4 個の排他的な選択肢を常に見せる部品 (iOS の UISegmentedControl の形)。選ばれた錠剤は白 + 薄い影。
// 錠剤の間に 2px の溝を置き、選択の影と隣の hover が触れないようにする
export function Segmented<T extends string>({ label, options, value, onChange, isCompact = false }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-9 flex-none gap-0.5 rounded-full bg-segment-track p-0.5"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              SEGMENT_TAP_AREA_CLASS,
              // 「r」のような短い選択肢でも押せる幅 44 を確保する (疑似要素は上下にしか広げない)
              'inline-flex min-w-11 items-center justify-center rounded-full text-small text-ink pressable',
              isCompact ? 'gap-1.25 pr-2.5 pl-2' : 'gap-1.5 pr-3.5 pl-3',
              isSelected
                ? 'bg-segment-selected font-semibold shadow-segment'
                : 'font-medium hover:bg-segment-hover active:bg-press',
            )}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.dotClassName !== undefined && (
              <span aria-hidden="true" className={cn('size-3.5 rounded-full shadow-dot', option.dotClassName)} />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
