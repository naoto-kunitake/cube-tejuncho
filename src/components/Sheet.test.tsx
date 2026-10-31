import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('開いたときの焦点は中の最初の押せる要素ではなく器に置く', () => {
    render(
      <Sheet label="テスト" onClose={vi.fn()}>
        <button type="button">中の押せる要素</button>
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'テスト' })).toHaveFocus();
  });

  it('器は Tab の順に入らない', () => {
    render(
      <Sheet label="テスト" onClose={vi.fn()}>
        <button type="button">中の押せる要素</button>
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'テスト' })).toHaveAttribute('tabindex', '-1');
  });

  it('暗幕を押すと閉じる', async () => {
    const onClose = vi.fn();
    render(
      <Sheet label="テスト" onClose={onClose}>
        <button type="button">中の押せる要素</button>
      </Sheet>,
    );
    await userEvent.click(screen.getByRole('dialog', { name: 'テスト' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
