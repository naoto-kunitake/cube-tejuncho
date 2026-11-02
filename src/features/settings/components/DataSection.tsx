import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NoticeDialog } from '@/components/NoticeDialog';
import { ROW_CARD_CLASS } from '@/components/row-card';
import { Section } from '@/components/Section';
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
import { ROW_BUTTON_CLASS } from './SettingRow';

const DANGER_ROW_CLASS = cn(ROW_BUTTON_CLASS, 'text-danger');

// 読み込めなかった理由。新しい版のファイルだけ文言を分ける (壊れたファイルとは直し方が違う)
type ImportFailure = 'invalid' | 'newerVersion';

type Clearing = { ids: string[]; names: string[]; count: number };

// 同時に1つしか開かないシートと確認。開いていないときはnull
type Overlay =
  | { kind: 'import' }
  | { kind: 'importFailed'; failure: ImportFailure }
  | { kind: 'registerAll' }
  | { kind: 'pickToClear' }
  | { kind: 'confirmClear'; clearing: Clearing }
  | { kind: 'reset' };

// 設定のデータの区画。安全な操作 (書き出す / 読み込む / 基本手順を一括登録) と、
// 赤字の破壊的な操作 (登録を消す / 初期状態に戻す) は別のカードに分ける (iOSの設定と同じ置き方)
export function DataSection() {
  const navigate = useNavigate();
  const document = useDocumentStore((state) => state.document);
  const importDocument = useDocumentStore((state) => state.importDocument);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const registerStandardAlgs = useDocumentStore((state) => state.registerStandardAlgs);
  const clearRegistrations = useDocumentStore((state) => state.clearRegistrations);
  const resetDocument = useDocumentStore((state) => state.resetDocument);
  const showToast = useToastStore((state) => state.show);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const registeredIds = new Set(document.registrations.map((entry) => entry.patternId));
  const unregisteredCounts = PRESET_CATEGORY_IDS.map((category) => ({
    category,
    count: presetsOf(category).filter((preset) => !registeredIds.has(preset.id)).length,
  }));

  const closeOverlay = () => {
    setOverlay(null);
  };

  const exportDocument = async () => {
    const file = createExportFile(document, copy.settings.exportFileName(exportDateOf(new Date())));
    const isSaved = await saveFile(file);
    if (isSaved) {
      showToast(copy.settings.exported(document.registrations.length, file.name));
    }
  };

  // 読み込みは文書を丸ごと書き換えるので、確認の代わりに「元に戻す」を出す
  const importFile = async (file: File, mode: ImportMode) => {
    closeOverlay();
    const before = useDocumentStore.getState().document;
    try {
      const result = importData(await file.text());
      if (!result.ok) {
        console.error('import failed', result.error);
        setOverlay({
          kind: 'importFailed',
          failure: result.error.kind === 'newerVersion' ? 'newerVersion' : 'invalid',
        });
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
      setOverlay({ kind: 'importFailed', failure: 'invalid' });
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

  // 一括登録は取り消せるので確認は出さない。選んだカテゴリ全部を1回の「元に戻す」で戻す
  const registerAll = (categoryIds: string[]) => {
    closeOverlay();
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
    const chosen = clearOptions.filter((option) => categoryIds.includes(option.id));
    setOverlay({
      kind: 'confirmClear',
      clearing: {
        ids: chosen.map((option) => option.id),
        names: chosen.map((option) => option.label),
        count: chosen.reduce((total, option) => total + option.count, 0),
      },
    });
  };
  const clearChosen = (clearing: Clearing) => {
    const before = useDocumentStore.getState().document;
    const count = clearRegistrations(clearing.ids);
    closeOverlay();
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
    closeOverlay();
    void navigate('/');
    showToast(copy.settings.resetDone, {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };

  return (
    <Section title={copy.settings.data}>
      <div className={ROW_CARD_CLASS}>
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
            setOverlay({ kind: 'import' });
          }}
        >
          {copy.settings.importData}
        </button>
        <button
          type="button"
          className={ROW_BUTTON_CLASS}
          onClick={() => {
            setOverlay({ kind: 'registerAll' });
          }}
        >
          {copy.settings.registerAll}
        </button>
      </div>
      {/* 破壊的な操作のカードは、区画の間隔8にカード間の12を足して離す */}
      <div className={cn(ROW_CARD_CLASS, 'mt-3')}>
        <button
          type="button"
          className={DANGER_ROW_CLASS}
          onClick={() => {
            setOverlay({ kind: 'pickToClear' });
          }}
        >
          {copy.settings.clearRegistrations}
        </button>
        <button
          type="button"
          className={DANGER_ROW_CLASS}
          onClick={() => {
            setOverlay({ kind: 'reset' });
          }}
        >
          {copy.settings.reset}
        </button>
      </div>
      {overlay?.kind === 'registerAll' && (
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
          onClose={closeOverlay}
        />
      )}
      {overlay?.kind === 'import' && (
        <ImportSheet
          onChoose={(file, mode) => {
            void importFile(file, mode);
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay?.kind === 'pickToClear' && (
        <CategoryPickSheet
          label={copy.a11y.clearSheet}
          title={copy.settings.clearRegistrations}
          options={clearOptions.map((option) => ({ ...option, isDisabled: option.count === 0 }))}
          // 破壊的な操作なので何もチェックしない
          initialSelectedIds={[]}
          actionLabel={copy.settings.clear}
          actionVariant="danger"
          onSubmit={askToClear}
          onClose={closeOverlay}
        />
      )}
      {overlay?.kind === 'confirmClear' && (
        <ConfirmDialog
          title={copy.settings.clearTitle(overlay.clearing.names)}
          body={copy.settings.clearBody(overlay.clearing.count)}
          actionLabel={copy.settings.clear}
          onConfirm={() => {
            clearChosen(overlay.clearing);
          }}
          onCancel={closeOverlay}
        />
      )}
      {overlay?.kind === 'reset' && (
        <ConfirmDialog
          title={copy.settings.reset}
          body={copy.settings.resetBody}
          actionLabel={copy.settings.resetAction}
          onConfirm={reset}
          onCancel={closeOverlay}
        />
      )}
      {overlay?.kind === 'importFailed' && (
        <NoticeDialog
          title={copy.settings.importFailedTitle}
          body={
            overlay.failure === 'newerVersion' ? copy.settings.importFailedNewerBody : copy.settings.importFailedBody
          }
          onClose={closeOverlay}
        />
      )}
    </Section>
  );
}
