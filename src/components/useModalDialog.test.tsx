import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type ReactNode, StrictMode, useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { useModalDialog } from './useModalDialog';

type ProbeProps = { onClose: () => void };

// 焦点の行き先を渡す呼び出し元 (確認・知らせ) を模す
function Probe({ onClose }: ProbeProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useModalDialog(closeRef);
  return (
    <dialog ref={dialogRef} aria-label="テスト">
      <button ref={closeRef} type="button" onClick={onClose}>
        閉じる
      </button>
    </dialog>
  );
}

// 渡さない呼び出し元 (シート) を模す
function ContainerProbe({ onClose }: ProbeProps) {
  const dialogRef = useModalDialog();
  return (
    <dialog ref={dialogRef} tabIndex={-1} aria-label="器">
      <button type="button" onClick={onClose}>
        閉じる
      </button>
    </dialog>
  );
}

type HarnessProps = { children: (onClose: () => void) => ReactNode };

function Harness({ children }: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        開く
      </button>
      {isOpen &&
        children(() => {
          setIsOpen(false);
        })}
    </>
  );
}

describe('useModalDialog', () => {
  it('渡した要素に焦点を移す', async () => {
    render(<Harness>{(onClose) => <Probe onClose={onClose} />}</Harness>);
    await userEvent.click(screen.getByRole('button', { name: '開く' }));
    expect(screen.getByRole('button', { name: '閉じる' })).toHaveFocus();
  });

  it('行き先を渡さなければ器に移す', async () => {
    render(<Harness>{(onClose) => <ContainerProbe onClose={onClose} />}</Harness>);
    await userEvent.click(screen.getByRole('button', { name: '開く' }));
    expect(screen.getByRole('dialog', { name: '器' })).toHaveFocus();
  });

  it('閉じると開く前の要素へ焦点が戻る', async () => {
    render(<Harness>{(onClose) => <Probe onClose={onClose} />}</Harness>);
    const opener = screen.getByRole('button', { name: '開く' });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(opener).toHaveFocus();
  });

  // 開発のStrictModeはeffectを2回走らせる。2回目で焦点を入れ直さないと、開く前の要素に残る
  it('開発の二重実行でも焦点は中に入る', async () => {
    render(
      <StrictMode>
        <Harness>{(onClose) => <Probe onClose={onClose} />}</Harness>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: '開く' }));
    expect(screen.getByRole('button', { name: '閉じる' })).toHaveFocus();
  });
});
