import { ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { createExportFile, exportDateOf, saveFile } from '@/data/export-data';
import { importData, type ImportMode } from '@/data/import-data';
import { useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { CategorySheet } from './CategorySheet';
import { ImportSheet } from './ImportSheet';
import { NoticeDialog } from './NoticeDialog';

const ROW_CLASS =
  'flex min-h-13 w-full items-center justify-between gap-3 border-t border-line px-4 text-left text-body text-ink first:border-t-0';
const ROW_BUTTON_CLASS = cn(ROW_CLASS, 'pressable hover:bg-hover active:bg-press');

export function SettingsScreen() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const addCategory = useDocumentStore((state) => state.addCategory);
  const importDocument = useDocumentStore((state) => state.importDocument);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const showToast = useToastStore((state) => state.show);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImportFailed, setHasImportFailed] = useState(false);
  const categories = categoryEntriesOf(document).map((category) => ({
    ...category,
    label: category.name ?? copy.list.categories.pll,
  }));

  const exportDocument = async () => {
    const file = createExportFile(document, copy.settings.exportFileName(exportDateOf(new Date())));
    const isSaved = await saveFile(file);
    if (isSaved) {
      showToast(copy.settings.exported(document.registrations.length, file.name));
    }
  };

  // 読み込みは文書を丸ごと書き換えるので、確認の代わりに「元に戻す」を出す
  const importFile = async (file: File, mode: ImportMode) => {
    setIsImporting(false);
    const before = useDocumentStore.getState().document;
    try {
      const result = importData(await file.text());
      if (!result.ok) {
        console.error('import failed', result.error);
        setHasImportFailed(true);
        return;
      }
      importDocument(result.value, mode);
      showToast(copy.settings.imported(result.value.registrations.length), {
        label: copy.toast.undo,
        run: () => {
          replaceDocument(before);
        },
      });
    } catch (error: unknown) {
      console.error('import file read failed', error);
      setHasImportFailed(true);
    }
  };

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
        </section>
        <section className="flex flex-col gap-2">
          <SectionHeading>{copy.settings.data}</SectionHeading>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <button
              type="button"
              className={ROW_BUTTON_CLASS}
              onClick={() => {
                void exportDocument();
              }}
            >
              {copy.settings.exportData}
            </button>
            <button
              type="button"
              className={ROW_BUTTON_CLASS}
              onClick={() => {
                setIsImporting(true);
              }}
            >
              {copy.settings.importData}
            </button>
          </div>
          <p className="text-label text-muted">{copy.settings.dataHint}</p>
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
      {isImporting && (
        <ImportSheet
          onChoose={(file, mode) => {
            void importFile(file, mode);
          }}
          onClose={() => {
            setIsImporting(false);
          }}
        />
      )}
      {hasImportFailed && (
        <NoticeDialog
          title={copy.settings.importFailedTitle}
          body={copy.settings.importFailedBody}
          onClose={() => {
            setHasImportFailed(false);
          }}
        />
      )}
    </section>
  );
}
