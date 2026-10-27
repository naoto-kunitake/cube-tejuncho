import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { createExportFile, exportDateOf, saveFile } from '@/data/export-data';
import { importData, type ImportMode } from '@/data/import-data';
import { hasPresets, PRESET_CATEGORY_IDS, presetsOf } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { CategoryPickSheet } from './CategoryPickSheet';
import { ImportSheet } from './ImportSheet';
import { NoticeDialog } from './NoticeDialog';
import { ROW_BUTTON_CLASS } from './SettingRow';

const DANGER_ROW_CLASS = cn(ROW_BUTTON_CLASS, 'text-danger');

type Clearing = { ids: string[]; names: string[]; count: number };

// 設定のデータの区画。安全な操作 (書き出す / 読み込む / 基本手順を一括登録) と、
// 赤字の破壊的な操作 (登録を消す / 初期状態に戻す) は別のカードに分ける (iOS の設定と同じ置き方)
export function DataSection() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const importDocument = useDocumentStore((state) => state.importDocument);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const registerStandardAlgs = useDocumentStore((state) => state.registerStandardAlgs);
  const clearRegistrations = useDocumentStore((state) => state.clearRegistrations);
  const resetDocument = useDocumentStore((state) => state.resetDocument);
  const showToast = useToastStore((state) => state.show);
  const [isImporting, setIsImporting] = useState(false);
  const [hasImportFailed, setHasImportFailed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearing, setClearing] = useState<Clearing | null>(null);
  const [isResetting, setIsResetting] = useState(false);
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

  // 消す対象の行。プリセットは登録の数、自作は中のパターンの数 (登録がなくてもパターンごと消える)
  const clearOptions = categoryEntriesOf(document).map((category) => {
    const count =
      category.kind === 'preset'
        ? presetsOf(category.id).filter((preset) => registeredIds.has(preset.id)).length
        : category.patternCount;
    return {
      id: category.id,
      label: category.kind === 'preset' ? copy.list.categories[category.id] : category.name,
      count,
      detail:
        category.kind === 'preset' ? copy.settings.registeredCount(count) : copy.settings.patternCountWithLabel(count),
    };
  });

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

  // 消すのは中のパターンまで及ぶので件数つきで確認し、閉じた後に「元に戻す」で文書を丸ごと戻せるようにする
  const askToClear = (categoryIds: string[]) => {
    setIsClearing(false);
    const chosen = clearOptions.filter((option) => categoryIds.includes(option.id));
    setClearing({
      ids: chosen.map((option) => option.id),
      names: chosen.map((option) => option.label),
      count: chosen.reduce((total, option) => total + option.count, 0),
    });
  };
  const clearChosen = () => {
    if (clearing === null) {
      return;
    }
    const before = useDocumentStore.getState().document;
    const count = clearRegistrations(clearing.ids);
    setClearing(null);
    showToast(copy.settings.cleared(count), {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };

  // 初期状態に戻したら一覧 (先頭のタブ) へ。設定画面は既定の値で描き直すより、戻った先で初回の案内が見える方が分かりやすい
  const reset = () => {
    const before = useDocumentStore.getState().document;
    resetDocument();
    setIsResetting(false);
    void navigate('/');
    showToast(copy.settings.resetDone, {
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
      {/* 破壊的な操作のカードは、区画の間隔 8 に 12 を足して離す (モックの決定: カード間 12 + 区画内の間隔) */}
      <div className="mt-3 overflow-hidden rounded-md border border-line bg-surface">
        <button
          type="button"
          className={DANGER_ROW_CLASS}
          onClick={() => {
            setIsClearing(true);
          }}
        >
          {copy.settings.clearRegistrations}
        </button>
        <button
          type="button"
          className={DANGER_ROW_CLASS}
          onClick={() => {
            setIsResetting(true);
          }}
        >
          {copy.settings.reset}
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
      {isClearing && (
        <CategoryPickSheet
          label={copy.a11y.clearSheet}
          title={copy.settings.clearRegistrations}
          options={clearOptions.map((option) => ({ ...option, isDisabled: option.count === 0 }))}
          // 破壊的な操作なので何もチェックしない
          initialSelectedIds={[]}
          actionLabel={copy.settings.clear}
          actionVariant="danger"
          onSubmit={askToClear}
          onClose={() => {
            setIsClearing(false);
          }}
        />
      )}
      {clearing !== null && (
        <ConfirmDialog
          title={copy.settings.clearTitle(clearing.names)}
          body={copy.settings.clearBody(clearing.count)}
          actionLabel={copy.settings.clear}
          onConfirm={clearChosen}
          onCancel={() => {
            setClearing(null);
          }}
        />
      )}
      {isResetting && (
        <ConfirmDialog
          title={copy.settings.reset}
          body={copy.settings.resetBody}
          actionLabel={copy.settings.resetAction}
          onConfirm={reset}
          onCancel={() => {
            setIsResetting(false);
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
