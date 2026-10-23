import { cleanup, render, screen, within } from '@testing-library/react';
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

  it('F2L のタブには 41 種の 3 面の図が 6 の群で並び、見出しは「白」で書かれる', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: copy.list.categories.f2l }));
    expect(screen.getAllByRole('link', { name: /未登録$/ })).toHaveLength(41);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6);
    expect(screen.getByRole('heading', { level: 2, name: /両方上面・白が上/ })).toBeInTheDocument();
    expect(screen.getByText(copy.list.registeredCount(0, 41))).toBeInTheDocument();
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
    expect(within(tile).getByRole('img', { name: '21' })).toBeInTheDocument();
  });

  it('右上のボタンでリスト表示に切り替わり、登録済みの行にだけ手順が出る', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', { text: "M2 U M U2 M' U M2", mnemonic: '', fingering: '' });
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: copy.a11y.switchToList }));
    expect(useDocumentStore.getState().document.settings.listView).toBe('list');
    const row = screen.getByRole('link', { name: copy.a11y.tile(copy.list.categories.pll, 'Ua', true) });
    expect(within(row).getByText('U2')).toBeInTheDocument();
    const unregistered = screen.getByRole('link', { name: copy.a11y.tile(copy.list.categories.pll, 'Ub', false) });
    expect(within(unregistered).queryByText('U2')).not.toBeInTheDocument();
  });

  it('リスト表示でもう一度押すとグリッドに戻る', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().setListView('list');
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: copy.a11y.switchToGrid }));
    expect(useDocumentStore.getState().document.settings.listView).toBe('grid');
    expect(screen.getByRole('button', { name: copy.a11y.switchToList })).toBeInTheDocument();
  });

  it('登録済みでも手順が空の行は「手順なし」と出す', () => {
    useDocumentStore.getState().saveRegistration('pll-ua', {
      recognition: '前に3連',
      mainAlg: { text: '', mnemonic: '', fingering: '' },
      altAlgs: [],
    });
    useDocumentStore.getState().setListView('list');
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    const row = screen.getByRole('link', { name: copy.a11y.tile(copy.list.categories.pll, 'Ua', true) });
    expect(within(row).getByText(copy.list.noAlg)).toBeInTheDocument();
  });

  it('利用者のカテゴリのリスト表示は名前と手順の行で、追加の行が末尾にある', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    useDocumentStore.getState().setListView('list');
    render(
      <MemoryRouter>
        <ListScreen />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: 'COLL' }));
    const row = screen.getByRole('link', { name: 'Sune' });
    expect(within(row).getByText('U2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.list.addPattern })).toBeInTheDocument();
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
