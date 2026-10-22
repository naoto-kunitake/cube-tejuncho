import { ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { CategorySheet } from './CategorySheet';

const ROW_CLASS =
  'flex min-h-13 w-full items-center justify-between gap-3 border-t border-line px-4 text-left text-body text-ink first:border-t-0';

export function SettingsScreen() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const addCategory = useDocumentStore((state) => state.addCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const categories = categoryEntriesOf(document).map((category) => ({
    ...category,
    label: category.name ?? copy.list.categories.pll,
  }));

  return (
    <section aria-label={copy.a11y.openSettings} className="mx-auto flex w-full max-w-140 flex-col">
      <TopBar>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconLink to="/" label={copy.a11y.backToList} className="-ml-1.75">
            <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconLink>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {copy.settings.title}
          </h1>
        </div>
      </TopBar>
      <div className="flex flex-col gap-6 px-4 pt-2 pb-6">
        <section className="flex flex-col gap-2">
          <SectionHeading>{copy.settings.categories}</SectionHeading>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            {categories.map((category) => (
              <div key={category.id} className={ROW_CLASS}>
                <span className="min-w-0 truncate">{category.label}</span>
                <span className="text-label whitespace-nowrap text-muted tabular-nums">
                  {category.isPreset ? copy.settings.preset : copy.settings.patternCount(category.patternCount)}
                </span>
              </div>
            ))}
            <button
              type="button"
              className={cn(ROW_CLASS, 'pressable hover:bg-hover active:bg-press')}
              onClick={() => {
                setIsAddingCategory(true);
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={20} strokeWidth={2} aria-hidden="true" />
                {copy.settings.addCategory}
              </span>
            </button>
          </div>
        </section>
      </div>
      {isAddingCategory && (
        <CategorySheet
          existingNames={categories.map((category) => category.label)}
          onAdd={(name) => {
            const id = addCategory(name);
            setIsAddingCategory(false);
            // 足したカテゴリの一覧へ (空のタブに「パターンを追加」が出る)
            void navigate(`/?category=${id}`);
          }}
          onClose={() => {
            setIsAddingCategory(false);
          }}
        />
      )}
    </section>
  );
}
