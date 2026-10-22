import { useEffect, useRef } from 'react';

import { copy } from '@/copy';

import { Button } from './Button';

type ConfirmDialogProps = {
  title: string;
  body?: string;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// 確認と知らせの共通の見た目。枠線なしで、暗幕と影で浮かせる (シートと同じ)
export const DIALOG_CLASS =
  'inset-x-6 m-auto flex w-auto flex-col gap-2 rounded-xl bg-surface px-5 pt-5 pb-4 text-ink shadow-4 backdrop:bg-black/60 md:inset-x-0 md:w-full md:max-w-105';
export const DIALOG_TITLE_CLASS = 'text-input leading-snug font-bold text-balance text-ink-strong';
export const DIALOG_BODY_CLASS = 'text-small leading-normal text-muted';

// 破壊的な操作の確認。iOS のアラートと同じ構成: 見出し (何を) + 本文 (自明でない結果だけ) + キャンセル / 赤い動詞のボタン。
// Esc は取り消し。焦点は安全なキャンセルに置く
export function ConfirmDialog({ title, body, actionLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby={body === undefined ? undefined : 'confirm-body'}
      onClose={onCancel}
      className={DIALOG_CLASS}
    >
      <h2 id="confirm-title" className={DIALOG_TITLE_CLASS}>
        {title}
      </h2>
      {body !== undefined && (
        <p id="confirm-body" className={DIALOG_BODY_CLASS}>
          {body}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <Button ref={cancelRef} variant="text" onClick={onCancel}>
          {copy.dialog.cancel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {actionLabel}
        </Button>
      </div>
    </dialog>
  );
}
