import { useState } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { createExportFile, exportDateOf, saveFile } from '@/data/export-data';
import { importData, type ImportMode } from '@/data/import-data';
import { hasPresets, PRESET_CATEGORY_IDS, presetsOf } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';

import { CategoryPickSheet } from './CategoryPickSheet';
import { ImportSheet } from './ImportSheet';
import { NoticeDialog } from './NoticeDialog';
import { ROW_BUTTON_CLASS } from './SettingRow';

// 設定のデータの区画。書き出す / 読み込む / 基本手順を一括登録
export function DataSection() {
  const document = useDocumentStore((state) => state.document);
  const importDocument = useDocumentStore((state) => state.importDocument);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const registerStandardAlgs = useDocumentStore((state) => state.registerStandardAlgs);
  const showToast = useToastStore((state) => state.show);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImportFailed, setHasImportFailed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const registeredIds = new Set(document.registrations.map((entry) => entry.patternId));
  const unregisteredCounts = PRESET_CATEGORY_IDS.map((category) => ({
    category,
    count: presetsOf(category).filter((preset) => !registeredIds.has(preset.id)).length,
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

  // 一括登録は取り消せるので確認は出さない。選んだカテゴリ全部を 1 回の「元に戻す」で戻す
  const registerAll = (categoryIds: string[]) => {
    setIsRegistering(false);
    const before = useDocumentStore.getState().document;
    const count = categoryIds.filter(hasPresets).reduce((total, category) => total + registerStandardAlgs(category), 0);
    showToast(copy.settings.registeredAll(count), {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };

  return (
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
        <button
          type="button"
          className={ROW_BUTTON_CLASS}
          onClick={() => {
            setIsRegistering(true);
          }}
        >
          {copy.settings.registerAll}
        </button>
      </div>
      {isRegistering && (
        <CategoryPickSheet
          label={copy.a11y.registerAllSheet}
          title={copy.settings.registerAll}
          options={unregisteredCounts.map(({ category, count }) => ({
            id: category,
            label: copy.list.categories[category],
            detail: copy.settings.unregisteredCount(count),
            isDisabled: count === 0,
          }))}
          // 一括の既定は全選択 (外すのは利用者。取り消しもできる)
          initialSelectedIds={unregisteredCounts.filter(({ count }) => count > 0).map(({ category }) => category)}
          actionLabel={copy.settings.register}
          actionVariant="primary"
          onSubmit={registerAll}
          onClose={() => {
            setIsRegistering(false);
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
