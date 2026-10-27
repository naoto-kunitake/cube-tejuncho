import { useState } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { createExportFile, exportDateOf, saveFile } from '@/data/export-data';
import { importData, type ImportMode } from '@/data/import-data';
import { useDocumentStore } from '@/data/store';

import { ImportSheet } from './ImportSheet';
import { NoticeDialog } from './NoticeDialog';
import { ROW_BUTTON_CLASS } from './SettingRow';

// 設定のデータの区画。書き出す / 読み込む
export function DataSection() {
  const document = useDocumentStore((state) => state.document);
  const importDocument = useDocumentStore((state) => state.importDocument);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const showToast = useToastStore((state) => state.show);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImportFailed, setHasImportFailed] = useState(false);

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
