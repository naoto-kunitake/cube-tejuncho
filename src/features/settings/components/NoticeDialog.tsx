import { useEffect, useRef } from 'react';

import { Button } from '@/components/Button';
import { DIALOG_BODY_CLASS, DIALOG_CLASS, DIALOG_TITLE_CLASS } from '@/components/ConfirmDialog';
import { copy } from '@/copy';

type NoticeDialogProps = {
  title: string;
  body: string;
  onClose: () => void;
};

// 知らせるだけの確認 (閉じる1つ)。選ぶことがないので、焦点は閉じるに置く
export function NoticeDialog({ title, body, onClose }: NoticeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="notice-title"
      aria-describedby="notice-body"
      onClose={onClose}
      className={DIALOG_CLASS}
    >
      <h2 id="notice-title" className={DIALOG_TITLE_CLASS}>
        {title}
      </h2>
      <p id="notice-body" className={DIALOG_BODY_CLASS}>
        {body}
      </p>
      <div className="mt-2 flex justify-end">
        <Button ref={closeRef} variant="primary" onClick={onClose}>
          {copy.dialog.close}
        </Button>
      </div>
    </dialog>
  );
}
