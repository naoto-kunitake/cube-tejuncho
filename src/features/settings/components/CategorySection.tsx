import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { useDocumentStore } from '@/data/store';

import { CategoryRows } from './CategoryRows';
import { CategorySheet } from './CategorySheet';
import { ROW_BUTTON_CLASS } from './SettingRow';

type SheetState = { kind: 'add' } | { kind: 'edit'; id: string };
type Deleting = { id: string; name: string; patternCount: number };

// 設定のカテゴリの区画。タブの並び順で全カテゴリを行に出し、末尾に「カテゴリを追加」。
// 自作の行を押すと同じシートが編集 (名前の変更 + 削除) で開く
export function CategorySection() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const addCategory = useDocumentStore((state) => state.addCategory);
  const renameCategory = useDocumentStore((state) => state.renameCategory);
  const removeCategory = useDocumentStore((state) => state.removeCategory);
  const moveCategory = useDocumentStore((state) => state.moveCategory);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const showToast = useToastStore((state) => state.show);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const categories = categoryEntriesOf(document).map((category) => ({
    ...category,
    label: category.kind === 'preset' ? copy.list.categories[category.id] : category.name,
  }));
  const editing = sheet?.kind === 'edit' ? categories.find((category) => category.id === sheet.id) : undefined;
  const closeSheet = () => {
    setSheet(null);
  };

  // 削除は中のパターンごと消すので確認を出し、閉じた後に「元に戻す」で文書を丸ごと戻せるようにする
  const deleteCategory = () => {
    if (deleting === null) {
      return;
    }
    const before = useDocumentStore.getState().document;
    removeCategory(deleting.id);
    setDeleting(null);
    setSheet(null);
    showToast(copy.settings.deletedCategory(deleting.name), {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{copy.settings.categories}</SectionHeading>
      <CategoryRows
        categories={categories.map((category) => ({
          id: category.id,
          kind: category.kind,
          label: category.label,
          detail: category.kind === 'preset' ? copy.settings.preset : copy.settings.patternCount(category.patternCount),
        }))}
        onMove={moveCategory}
        onOpen={(id) => {
          setSheet({ kind: 'edit', id });
        }}
      >
        <button
          type="button"
          className={ROW_BUTTON_CLASS}
          onClick={() => {
            setSheet({ kind: 'add' });
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Plus size={20} strokeWidth={2} aria-hidden="true" />
            {copy.settings.addCategory}
          </span>
        </button>
      </CategoryRows>
      {sheet?.kind === 'add' && (
        <CategorySheet
          existingNames={categories.map((category) => category.label)}
          onSubmit={(name) => {
            const id = addCategory(name);
            closeSheet();
            // 足したカテゴリの一覧へ (空のタブに「パターンを追加」が出る)
            void navigate(`/?category=${id}`);
          }}
          onClose={closeSheet}
        />
      )}
      {editing?.kind === 'custom' && (
        <CategorySheet
          existingNames={categories.filter((category) => category.id !== editing.id).map((category) => category.label)}
          editing={{
            name: editing.name,
            onDelete: () => {
              setDeleting({ id: editing.id, name: editing.name, patternCount: editing.patternCount });
            },
          }}
          onSubmit={(name) => {
            renameCategory(editing.id, name);
            closeSheet();
          }}
          onClose={closeSheet}
        />
      )}
      {deleting !== null && (
        <ConfirmDialog
          title={copy.settings.deleteCategoryTitle(deleting.name)}
          body={deleting.patternCount > 0 ? copy.settings.deleteCategoryBody(deleting.patternCount) : undefined}
          actionLabel={copy.settings.deleteCategoryAction}
          onConfirm={deleteCategory}
          onCancel={() => {
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}
