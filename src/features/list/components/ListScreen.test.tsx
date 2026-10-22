import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { ListScreen } from './ListScreen';

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
});

afterEach(cleanup);

function withCustomCategory() {
  const document = createEmptyDocument();
  document.categories = [{ id: 'c1', name: 'COLL' }];
  document.settings.tabOrder = ['pll', 'c1'];
  document.patterns = [{ id: 'p1', categoryId: 'c1', name: 'Sune', createdAt: '', updatedAt: '' }];
  document.registrations = [
    {
      patternId: 'p1',
      recognition: '',
      mainAlg: { text: "R U R' U R U2 R'", mnemonic: '', fingering: '' },
      altAlgs: [],
      createdAt: '',
      updatedAt: '',
    },
  ];
  useDocumentStore.setState({ document });
}

describe('ListScreen', () => {
  it('PLL 21 種のタイルを描く', () => {
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: copy.list.title })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /未登録$/ })).toHaveLength(21);
  });

  it('OLL のタブには 57 種のタイルが 15 の形の見出しで並ぶ', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: copy.list.categories.oll }));
    expect(screen.getAllByRole('link', { name: /未登録$/ })).toHaveLength(57);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(15);
    expect(screen.getByText(copy.list.registeredCount(0, 57))).toBeInTheDocument();
  });

  it('OLL のタイルの見出しは番号だけで、読み上げ名にはカテゴリが付く', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: copy.list.categories.oll }));
    const tile = screen.getByRole('link', { name: copy.a11y.tile(copy.list.categories.oll, '21', false) });
    expect(tile).toHaveAttribute('href', '/p/oll-21');
    expect(tile).toHaveTextContent(/^21$/);
  });

  it('利用者のカテゴリのタブには自作のタイルと追加のタイルが並ぶ', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: 'COLL' }));
    expect(screen.getByRole('link', { name: 'Sune' })).toHaveAttribute('href', '/p/p1');
    expect(screen.getByText("R U R' U R U2 R'")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.list.addPattern })).toHaveAttribute('href', '/p/new?category=c1');
    expect(screen.queryByText(/登録済み/)).not.toBeInTheDocument();
  });
});
