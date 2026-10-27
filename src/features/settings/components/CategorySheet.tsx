import { useState } from 'react';

import { Button } from '@/components/Button';
import { Field, INPUT_CLASS } from '@/components/Field';
import { Sheet, SheetHeader } from '@/components/Sheet';
import { copy } from '@/copy';
import { hasCategoryNamed } from '@/data/patterns';
import { cn } from '@/lib/utils';

const NAME_MAX_LENGTH = 20;

type CategorySheetProps = {
  // 重複を見る相手の名前。編集のときは自分の名前を含めない
  existingNames: readonly string[];
  // 既存のカテゴリを開いたとき。追加のときは渡さない
  editing?: { name: string; onDelete: () => void };
  onSubmit: (name: string) => void;
  onClose: () => void;
};

// カテゴリの名前を 1 つ聞く小さなシート。追加と編集 (名前の変更 + 削除) の両方に使う。
// 同じ名前があれば赤い 1 行で知らせ、確定できない。編集では名前が変わっていなければ保存できない
export function CategorySheet({ existingNames, editing, onSubmit, onClose }: CategorySheetProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const trimmed = name.trim();
  const isDuplicate = hasCategoryNamed(existingNames, trimmed);
  const canSubmit = trimmed !== '' && !isDuplicate && trimmed !== editing?.name;

  return (
    <Sheet label={copy.a11y.categorySheet} onClose={onClose}>
      <SheetHeader
        title={editing === undefined ? copy.settings.newCategoryTitle : copy.settings.editCategoryTitle}
        onClose={onClose}
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) {
            onSubmit(trimmed);
          }
        }}
      >
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
        <div className="flex items-center justify-between gap-2">
          {editing !== undefined && (
            <Button variant="textDanger" className="-ml-3" onClick={editing.onDelete}>
              {copy.settings.deleteCategory}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!canSubmit} className="ml-auto">
            {editing === undefined ? copy.settings.add : copy.settings.save}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
