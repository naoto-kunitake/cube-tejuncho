import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { copy } from '@/copy';

import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('開いたときの焦点は安全なキャンセルに置く', () => {
    render(<ConfirmDialog title="テストを削除" actionLabel="削除" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: copy.dialog.cancel })).toHaveFocus();
  });
});
