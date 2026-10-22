import { useState } from 'react';

import { Button } from '@/components/Button';
import { Field, INPUT_CLASS } from '@/components/Field';
import { Sheet, SheetHeader } from '@/components/Sheet';
import { copy } from '@/copy';
import { hasCategoryNamed } from '@/data/patterns';
import { cn } from '@/lib/utils';

const NAME_MAX_LENGTH = 20;

type CategorySheetProps = {
  existingNames: readonly string[];
  onAdd: (name: string) => void;
  onClose: () => void;
};

// 新しいカテゴリの名前を 1 つ聞く小さなシート。同じ名前があれば赤い 1 行で知らせ、追加できない
export function CategorySheet({ existingNames, onAdd, onClose }: CategorySheetProps) {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const isDuplicate = hasCategoryNamed(existingNames, trimmed);
  const canAdd = trimmed !== '' && !isDuplicate;

  return (
    <Sheet label={copy.a11y.categorySheet} onClose={onClose}>
      <SheetHeader title={copy.settings.newCategoryTitle} onClose={onClose} />
      <Field id="category-name" label={copy.settings.categoryName}>
        <input
          id="category-name"
          value={name}
          placeholder={copy.settings.categoryNamePlaceholder}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
          aria-invalid={isDuplicate}
          aria-describedby="category-name-hint"
          className={cn(INPUT_CLASS, 'h-11 px-3')}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </Field>
      <p id="category-name-hint" className="min-h-4 text-label leading-tight text-danger" aria-live="polite">
        {isDuplicate ? copy.settings.duplicateCategory : ''}
      </p>
      <div className="flex justify-end">
        <Button
          variant="primary"
          disabled={!canAdd}
          onClick={() => {
            onAdd(trimmed);
          }}
        >
          {copy.settings.add}
        </Button>
      </div>
    </Sheet>
  );
}
