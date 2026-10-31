import { Menu } from 'lucide-react';
import { type KeyboardEvent, type PointerEvent, type ReactNode, useState } from 'react';

import { copy } from '@/copy';
import type { CategoryEntry } from '@/data/categories';
import { cn } from '@/lib/utils';

import { shiftOf, targetIndexOf } from '../lib/reorder';
import { SETTING_ROW_CLASS } from './SettingRow';

const REORDER_HINT_ID = 'category-reorder-hint';

export type CategoryRow = { id: string; kind: CategoryEntry['kind']; label: string; detail: string };

type CategoryRowsProps = {
  categories: readonly CategoryRow[];
  onMove: (id: string, toIndex: number) => void;
  // 自作の行の本文を押したとき (プリセットの行は押せない)
  onOpen: (id: string) => void;
  // 並べ替えの対象にならない末尾の行 (カテゴリを追加)
  children: ReactNode;
};

type Drag = { index: number; startY: number; deltaY: number; rowHeight: number };

// 右端のハンドルを押して上下に動かすと行が入れ替わる (ハンドルは常時表示。項目が少ない設定画面では編集モードを挟まない)。
// 持ち上げた行は影 + 2% 拡大で浮かせ、ほかの行は空いた隙間へ滑る。離すとタブの順に反映する。キーボードはハンドルで上下キー
export function CategoryRows({ categories, onMove, onOpen, children }: CategoryRowsProps) {
  const [drag, setDrag] = useState<Drag | null>(null);
  // 動かした結果を読み上げる (フォーカスは同じハンドルに残るので、位置の変化が音声では伝わらない)
  const [announcement, setAnnouncement] = useState('');
  const targetIndex = drag === null ? null : targetIndexOf(drag.index, drag.deltaY, drag.rowHeight, categories.length);

  const move = (category: CategoryRow, toIndex: number) => {
    onMove(category.id, toIndex);
    setAnnouncement(copy.a11y.reorderMoved(category.label, toIndex + 1, categories.length));
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    // ハンドルは行のdivの直接の子 (入れ子を挟むと高さが0になり、ドラッグが始まらない)
    const rowHeight = event.currentTarget.parentElement?.offsetHeight ?? 0;
    if (rowHeight <= 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, startY: event.clientY, deltaY: 0, rowHeight });
  };
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null) {
      return;
    }
    setDrag({ ...drag, deltaY: event.clientY - drag.startY });
  };
  const endDrag = () => {
    if (drag === null || targetIndex === null) {
      return;
    }
    setDrag(null);
    const lifted = categories[drag.index];
    if (lifted !== undefined && targetIndex !== drag.index) {
      move(lifted, targetIndex);
    }
  };
  // ブラウザがジェスチャーを中断したとき (端のスワイプなど) は「やめた」なので、並びは変えない
  const cancelDrag = () => {
    setDrag(null);
  };
  const moveByArrow = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }
    event.preventDefault();
    const category = categories[index];
    const toIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
    if (category === undefined || toIndex < 0 || toIndex >= categories.length) {
      return;
    }
    move(category, toIndex);
  };

  return (
    <>
      {/* 角の丸みはoverflowで切るが、持ち上げた行の影と拡大は切らない */}
      <div className={cn('rounded-md border border-line bg-surface', drag === null && 'overflow-hidden')}>
        {categories.map((category, index) => {
          const isLifted = drag !== null && drag.index === index;
          const shift = drag === null || targetIndex === null ? 0 : shiftOf(index, drag.index, targetIndex);
          // 動かす量はポインタの位置と行の高さから決まるので、トークンではなくinlineのtransform
          const style = isLifted
            ? { transform: `translateY(${drag.deltaY}px) scale(1.02)` }
            : { transform: shift === 0 ? undefined : `translateY(${shift * (drag?.rowHeight ?? 0)}px)` };
          return (
            <div
              key={category.id}
              style={style}
              className={cn(
                SETTING_ROW_CLASS,
                // 押せるのは本文のボタンだが、hover / 押下の色は行全体に付ける (ハンドルの下まで続く。:activeは祖先にも効く)
                category.kind === 'custom' && 'pressable hover:bg-hover active:bg-press',
                isLifted && 'relative z-10 rounded-md border-t-transparent bg-surface shadow-3',
                drag !== null && !isLifted && 'transition-transform duration-150 motion-reduce:transition-none',
              )}
            >
              {category.kind === 'custom' ? (
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 self-stretch text-left"
                  onClick={() => {
                    onOpen(category.id);
                  }}
                >
                  <span className="min-w-0 truncate">{category.label}</span>
                  {/* 読み上げ名を「COLL 0件」と区切る空白 (flexの項目にはならない) */}{' '}
                  <span className="text-label whitespace-nowrap text-muted tabular-nums">{category.detail}</span>
                </button>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate">{category.label}</span>
                  <span className="text-label whitespace-nowrap text-muted tabular-nums">{category.detail}</span>
                </>
              )}
              <button
                type="button"
                aria-label={copy.a11y.reorderHandle(category.label)}
                aria-describedby={REORDER_HINT_ID}
                className={cn(
                  'relative -mr-2.5 inline-grid size-9 flex-none cursor-grab touch-none place-items-center rounded-full text-muted pressable before:absolute before:-inset-1 before:rounded-full hover:bg-hover hover:text-ink',
                  isLifted && 'cursor-grabbing',
                )}
                onPointerDown={(event) => {
                  startDrag(event, index);
                }}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={cancelDrag}
                onKeyDown={(event) => {
                  moveByArrow(event, index);
                }}
              >
                <Menu size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          );
        })}
        {children}
      </div>
      <p id={REORDER_HINT_ID} className="sr-only">
        {copy.a11y.reorderHint}
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
