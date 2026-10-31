import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { Button } from '@/components/Button';
import { Field, INPUT_CLASS, TextArea } from '@/components/Field';
import { SECTION_LABEL_CLASS } from '@/components/SectionHeading';
import { copy } from '@/copy';
import { cn } from '@/lib/utils';

import { algErrorOf, type EditCard } from '../edit-state';

type AlgEditCardProps = {
  index: number;
  card: EditCard;
  inputRef: (element: HTMLInputElement | null) => void;
  // 専用キーパッドで入力する間は端末のキーボードを出さない
  usesKeypad: boolean;
  onChange: (card: EditCard) => void;
  onFocus: () => void;
  // 欄を離れたときに呼ぶ。falseを返したら離れていない扱い (キーボードの切り替えで焦点を入れ直す間)
  onBlur: () => boolean;
  onMakeMain: () => void;
  onDelete: () => void;
};

// 手順1枚ぶんの編集 (メイン手順もほかの手順も同じ構造)。欄を全幅にするため縦積み
export function AlgEditCard({
  index,
  card,
  inputRef,
  usesKeypad,
  onChange,
  onFocus,
  onBlur,
  onMakeMain,
  onDelete,
}: AlgEditCardProps) {
  const location = useLocation();
  const isMain = index === 0;
  const error = algErrorOf(card.text);
  // 検証は欄を離れたときと保存時 (打鍵ごとに赤くしない)。保存済みの手順が読めないときは開いた時点で示す。直した瞬間に消す
  const [hasLeft, setHasLeft] = useState(error !== null);
  const shownError = hasLeft ? error : null;
  const algId = `alg-${index}`;
  const errorId = `alg-error-${index}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border bg-surface px-4 pt-2.5 pb-4',
        isMain ? 'border-line-strong' : 'border-line',
      )}
    >
      <div className="flex min-h-9 items-center justify-between gap-2">
        <label htmlFor={algId} className={SECTION_LABEL_CLASS}>
          {isMain ? copy.edit.mainAlg : copy.edit.altAlg(index + 1)}
        </label>
        <div className="flex items-center gap-2">
          {!isMain && (
            <Button variant="quiet" onClick={onMakeMain}>
              {copy.edit.makeMain}
            </Button>
          )}
          <Button variant="textDanger" onClick={onDelete}>
            {copy.edit.deleteAlg}
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        id={algId}
        value={card.text}
        placeholder={copy.edit.algPlaceholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        inputMode={usesKeypad ? 'none' : undefined}
        aria-invalid={shownError !== null}
        aria-describedby={shownError === null ? undefined : errorId}
        className={cn(
          INPUT_CLASS,
          'h-11 px-3 font-mono text-alg-compact',
          shownError !== null && 'border-danger hover:border-danger-hover',
        )}
        onChange={(event) => {
          onChange({ ...card, text: event.target.value });
        }}
        onFocus={onFocus}
        onBlur={() => {
          if (onBlur()) {
            setHasLeft(true);
          }
        }}
      />
      {shownError !== null && (
        <p id={errorId} className="-mt-1.5 text-label leading-normal text-danger">
          {copy.edit.algError(shownError)}{' '}
          <Link to="/notation" state={{ from: location.pathname }} className="font-bold underline underline-offset-2">
            {copy.edit.seeNotation}
          </Link>
        </p>
      )}
      <Field id={`mnemonic-${index}`} label={copy.detail.mnemonic}>
        <TextArea
          id={`mnemonic-${index}`}
          value={card.mnemonic}
          onChange={(event) => {
            onChange({ ...card, mnemonic: event.target.value });
          }}
        />
      </Field>
      <Field id={`fingering-${index}`} label={copy.detail.fingering}>
        <TextArea
          id={`fingering-${index}`}
          value={card.fingering}
          onChange={(event) => {
            onChange({ ...card, fingering: event.target.value });
          }}
        />
      </Field>
    </div>
  );
}
