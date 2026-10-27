import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { SectionHeading } from '@/components/SectionHeading';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { useDocumentStore } from '@/data/store';

import { CategoryRows } from './CategoryRows';
import { CategorySheet } from './CategorySheet';
import { ROW_BUTTON_CLASS } from './SettingRow';

// 設定のカテゴリの区画。タブの並び順で全カテゴリを行に出し、末尾に「カテゴリを追加」
export function CategorySection() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const addCategory = useDocumentStore((state) => state.addCategory);
  const moveCategory = useDocumentStore((state) => state.moveCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const categories = categoryEntriesOf(document).map((category) => ({
    ...category,
    label: category.kind === 'preset' ? copy.list.categories[category.id] : category.name,
  }));

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{copy.settings.categories}</SectionHeading>
      <CategoryRows
        categories={categories.map((category) => ({
          id: category.id,
          label: category.label,
          detail: category.kind === 'preset' ? copy.settings.preset : copy.settings.patternCount(category.patternCount),
        }))}
        onMove={moveCategory}
      >
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
      </CategoryRows>
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
