import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CategoryPickSheet } from './CategoryPickSheet';

const OPTIONS = [
  { id: 'pll', label: 'PLL', detail: '未登録 21件', isDisabled: false },
  { id: 'oll', label: 'OLL', detail: '未登録 0件', isDisabled: true },
  { id: 'f2l', label: 'F2L', detail: '未登録 41件', isDisabled: false },
];

function renderSheet(onSubmit: (ids: string[]) => void = () => undefined) {
  return render(
    <CategoryPickSheet
      label="一括登録"
      title="一括登録"
      options={OPTIONS}
      initialSelectedIds={['pll']}
      actionLabel="登録"
      actionVariant="primary"
      onSubmit={onSubmit}
      onClose={() => undefined}
    />,
  );
}

describe('CategoryPickSheet', () => {
  it('最初に選んでおいた行がチェックされ、0 件の行は選べない', () => {
    renderSheet();
    expect(screen.getByRole('checkbox', { name: /^PLL/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /^OLL/ })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /^F2L/ })).not.toBeChecked();
  });

  it('チェックを足して確定すると、選んだ id だけ渡す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderSheet(onSubmit);
    await user.click(screen.getByRole('checkbox', { name: /^F2L/ }));
    await user.click(screen.getByRole('button', { name: '登録' }));
    expect(onSubmit).toHaveBeenCalledWith(['pll', 'f2l']);
  });

  it('1 つも選んでいなければ確定できない', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('checkbox', { name: /^PLL/ }));
    expect(screen.getByRole('button', { name: '登録' })).toBeDisabled();
  });
});
