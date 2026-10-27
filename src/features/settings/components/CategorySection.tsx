import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { SectionHeading } from '@/components/SectionHeading';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { useDocumentStore } from '@/data/store';

import { CategorySheet } from './CategorySheet';
import { ROW_BUTTON_CLASS, SETTING_ROW_CLASS } from './SettingRow';

// 設定のカテゴリの区画。タブの並び順で全カテゴリを行に出し、末尾に「カテゴリを追加」
export function CategorySection() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const addCategory = useDocumentStore((state) => state.addCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const categories = categoryEntriesOf(document).map((category) => ({
    ...category,
    label: category.kind === 'preset' ? copy.list.categories[category.id] : category.name,
  }));

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{copy.settings.categories}</SectionHeading>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        {categories.map((category) => (
          <div key={category.id} className={SETTING_ROW_CLASS}>
            <span className="min-w-0 truncate">{category.label}</span>
            <span className="text-label whitespace-nowrap text-muted tabular-nums">
              {category.kind === 'preset' ? copy.settings.preset : copy.settings.patternCount(category.patternCount)}
            </span>
          </div>
        ))}
        <button
          type="button"
          className={ROW_BUTTON_CLASS}
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
