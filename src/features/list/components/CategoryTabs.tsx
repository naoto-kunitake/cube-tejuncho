import type { KeyboardEvent } from 'react';

import { PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { copy } from '@/copy';
import { cn } from '@/lib/utils';

type CategoryTabsProps = {
  categories: readonly { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  // 選ばれていないタブはtabIndex -1なので、矢印キーで隣へ移してフォーカスも動かす (WAI-ARIAのタブの型)
  const moveByArrow = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    const currentIndex = categories.findIndex((category) => category.id === selectedId);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + categories.length) % categories.length;
    const next = categories[nextIndex];
    if (next === undefined) {
      return;
    }
    onSelect(next.id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center px-4 pb-2">
      <div
        role="tablist"
        aria-label={copy.a11y.categoryTabs}
        className="scrollbar-none flex gap-2 overflow-x-auto py-1"
      >
        {categories.map(({ id, label }) => {
          const isSelected = id === selectedId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                onSelect(id);
              }}
              onKeyDown={moveByArrow}
              className={cn(
                PILL_TAP_AREA_CLASS,
                'inline-flex h-9 flex-none items-center rounded-full border px-4 text-body leading-none font-medium whitespace-nowrap pressable active:scale-98',
                isSelected
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line-muted bg-surface text-ink hover:bg-hover-ground active:bg-press-ground',
              )}
            >
              <span className="block max-w-35 truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
