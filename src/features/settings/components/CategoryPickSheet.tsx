import { useState } from 'react';

import { Button } from '@/components/Button';
import { Sheet, SheetHeader } from '@/components/Sheet';
import { copy } from '@/copy';

export type CategoryPickOption = { id: string; label: string; detail: string; isDisabled: boolean };

type CategoryPickSheetProps = {
  label: string;
  title: string;
  options: readonly CategoryPickOption[];
  initialSelectedIds: readonly string[];
  actionLabel: string;
  actionVariant: 'primary' | 'danger';
  onSubmit: (ids: string[]) => void;
  onClose: () => void;
};

// カテゴリをチェックで選んで1つの操作を確定する小さなシート (一括登録 / 登録を消す)
export function CategoryPickSheet({
  label,
  title,
  options,
  initialSelectedIds,
  actionLabel,
  actionVariant,
  onSubmit,
  onClose,
}: CategoryPickSheetProps) {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>(initialSelectedIds);
  const toggle = (id: string, isChecked: boolean) => {
    setSelectedIds(isChecked ? [...selectedIds, id] : selectedIds.filter((entry) => entry !== id));
  };

  return (
    <Sheet label={label} onClose={onClose}>
      <SheetHeader title={title} onClose={onClose} />
      <fieldset className="overflow-hidden rounded-md border border-line bg-surface">
        <legend className="sr-only">{copy.a11y.pickCategories}</legend>
        {options.map((option) => (
          <label
            key={option.id}
            className="flex min-h-13 items-center gap-3 border-t border-line px-4 py-2 first:border-t-0 has-enabled:cursor-pointer has-enabled:hover:bg-hover has-disabled:text-disabled"
          >
            <input
              type="checkbox"
              value={option.id}
              checked={selectedIds.includes(option.id)}
              disabled={option.isDisabled}
              className="size-5 shrink-0 accent-accent"
              onChange={(event) => {
                toggle(option.id, event.target.checked);
              }}
            />
            <span className="min-w-0 flex-1 truncate text-body">{option.label}</span>
            <span className="text-label whitespace-nowrap text-muted tabular-nums">{option.detail}</span>
          </label>
        ))}
      </fieldset>
      <div className="flex justify-end">
        <Button
          variant={actionVariant}
          disabled={selectedIds.length === 0}
          onClick={() => {
            onSubmit([...selectedIds]);
          }}
        >
          {actionLabel}
        </Button>
      </div>
    </Sheet>
  );
}
