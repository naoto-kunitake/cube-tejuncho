import { useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Sheet, SheetHeader } from '@/components/Sheet';
import { copy } from '@/copy';
import type { ImportMode } from '@/data/import-data';

const IMPORT_MODES: { mode: ImportMode; label: string; hint: string }[] = [
  { mode: 'add', label: copy.settings.importAdd, hint: copy.settings.importAddHint },
  { mode: 'replace', label: copy.settings.importReplace, hint: copy.settings.importReplaceHint },
];

type ImportSheetProps = {
  onChoose: (file: File, mode: ImportMode) => void;
  onClose: () => void;
};

// 読み込み方 (追加 / 置き換え) を選んでからファイルを選ぶ小さなシート。
// ファイルの入力欄は隠し、見えるボタンから開く (入力欄そのものは見た目を揃えられない)
export function ImportSheet({ onChoose, onClose }: ImportSheetProps) {
  const [mode, setMode] = useState<ImportMode>('add');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Sheet label={copy.a11y.importSheet} onClose={onClose}>
      <SheetHeader title={copy.settings.importData} onClose={onClose} />
      <fieldset className="overflow-hidden rounded-md border border-line bg-surface">
        <legend className="sr-only">{copy.a11y.importMode}</legend>
        {IMPORT_MODES.map((entry) => (
          <label
            key={entry.mode}
            className="flex min-h-13 cursor-pointer items-center gap-3 border-t border-line px-4 py-2 first:border-t-0 hover:bg-hover"
          >
            <input
              type="radio"
              name="import-mode"
              value={entry.mode}
              checked={mode === entry.mode}
              className="size-5 shrink-0 accent-accent"
              onChange={() => {
                setMode(entry.mode);
              }}
            />
            <span className="min-w-0 text-body text-ink">
              {entry.label}
              <span className="block text-label text-muted">{entry.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file !== undefined) {
            onChoose(file, mode);
          }
          // 同じファイルをもう一度選んでもchangeが起きるように空にする
          event.target.value = '';
        }}
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          {copy.settings.chooseFile}
        </Button>
      </div>
    </Sheet>
  );
}
