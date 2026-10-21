import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { DOCUMENT_KEY, useDocumentStore } from '@/data/store';

import { AppRoutes } from './AppRoutes';

beforeEach(() => {
  localStorage.clear();
  useDocumentStore.setState({ document: createEmptyDocument() });
});

describe('一覧から詳細で登録する流れ', () => {
  it('タイルを開いて「この手順を使う」と、一覧の件数が増えて保存される', async () => {
    render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('link', { name: copy.a11y.tile('PLL', 'Ua', false) }));
    await userEvent.click(screen.getByRole('button', { name: copy.detail.useThisAlg }));
    await userEvent.click(screen.getByRole('link', { name: copy.a11y.backToList }));
    expect(screen.getByText(copy.list.registeredCount(1, 21))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.a11y.tile('PLL', 'Ua', true) })).toBeInTheDocument();
    expect(localStorage.getItem(DOCUMENT_KEY)).toContain('pll-ua');
  });
});
