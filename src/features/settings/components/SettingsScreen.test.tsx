import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { SettingsScreen } from './SettingsScreen';

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/" element={<p>list</p>} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
});

afterEach(cleanup);

describe('SettingsScreen', () => {
  it('カテゴリの区画にプリセットの行と追加の行がある', () => {
    renderSettings();
    expect(screen.getByText(copy.list.categories.pll)).toBeInTheDocument();
    expect(screen.getByText(copy.settings.preset)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.settings.addCategory })).toBeInTheDocument();
  });

  it('カテゴリを追加すると文書に入り、そのカテゴリの一覧へ移る', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.addCategory }));
    const add = screen.getByRole('button', { name: copy.settings.add });
    expect(add).toBeDisabled();
    await user.type(screen.getByLabelText(copy.settings.categoryName), 'COLL');
    expect(add).toBeEnabled();
    await user.click(add);
    const { categories, settings } = useDocumentStore.getState().document;
    expect(categories).toMatchObject([{ name: 'COLL' }]);
    expect(settings.tabOrder.at(-1)).toBe(categories[0]?.id);
    expect(screen.getByText('list')).toBeInTheDocument();
  });

  it('同じ名前のカテゴリは追加できない', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.addCategory }));
    await user.type(screen.getByLabelText(copy.settings.categoryName), 'pll');
    expect(screen.getByText(copy.settings.duplicateCategory)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.settings.add })).toBeDisabled();
  });
});
