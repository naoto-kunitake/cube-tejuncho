import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { copy } from '@/copy';

import { NoticeDialog } from './NoticeDialog';

describe('NoticeDialog', () => {
  it('選ぶことがないので焦点は閉じるに置く', () => {
    render(<NoticeDialog title="保存できませんでした" body="本文" onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: copy.dialog.close })).toHaveFocus();
  });
});
