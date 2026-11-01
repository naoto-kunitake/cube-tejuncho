import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { copy } from '@/copy';
import { cn } from '@/lib/utils';

import { IconButton } from './IconButton';
import { useModalDialog } from './useModalDialog';

type SheetProps = {
  label: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

// 下から出るシート。nativeのdialogを使い、Escと背景の暗幕で閉じ、背後にフォーカスが行かないようにする。
// 狭い幅は親指の届く底のシート。広い幅は窓が縦に長く、底に出すと押した場所から遠いので中央のカードにする。
// 横はmx-autoで中央に置く (dialogの既定のmargin:autoを消すと、幅の上限に達した画面で左端に寄る)
export function Sheet({ label, onClose, className, children }: SheetProps) {
  // 焦点の行き先を渡さないので器に移る。× に移ると押したように見え、読み上げも名前ではなく「閉じる」になる
  const dialogRef = useModalDialog();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    // 暗幕 (dialog自身) を押したら閉じる。中身の上では閉じない。Escはdialogのcloseで拾う
    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };
    dialog.addEventListener('click', closeOnBackdrop);
    return () => {
      dialog.removeEventListener('click', closeOnBackdrop);
    };
  }, [dialogRef, onClose]);

  return (
    <dialog
      ref={dialogRef}
      // 器に焦点を移すため。Tabの順には入らない (-1)
      tabIndex={-1}
      aria-label={label}
      onClose={onClose}
      className={cn(
        'mx-auto mt-auto mb-0 flex w-full max-w-140 flex-col gap-3 rounded-t-sheet border-t border-line bg-surface px-4 pt-3 pb-safe-5 text-ink shadow-5 backdrop:bg-black/60 md:m-auto md:max-w-100 md:rounded-sheet md:border',
        className,
      )}
    >
      {children}
    </dialog>
  );
}

type SheetHeaderProps = {
  title: string;
  onClose: () => void;
};

// 小さなシートの見出し。題は左、× は右
export function SheetHeader({ title, onClose }: SheetHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="min-w-0 flex-1 truncate text-input font-bold text-ink-strong">{title}</h2>
      <IconButton label={copy.a11y.closeSheet} className="-mr-1.75" onClick={onClose}>
        <X size={22} strokeWidth={1.8} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
