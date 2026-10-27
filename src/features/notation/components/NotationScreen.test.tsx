import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as TwistyExports from '@/components/player/twisty';
import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { NotationScreen } from './NotationScreen';

vi.mock('@/components/player/twisty', async (importOriginal) => {
  const original = await importOriginal<typeof TwistyExports>();
  return { ...original, loadTwisty: vi.fn(() => new Promise(() => undefined)) };
});

function renderNotation(state?: { from: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/notation', state }]}>
      <Routes>
        <Route path="/notation" element={<NotationScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
});

describe('NotationScreen', () => {
  it('6 区画の見出しと、括弧を除く 20 行の再生ボタンがある', () => {
    renderNotation();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6);
    expect(screen.getAllByRole('button', { name: /を再生$/ })).toHaveLength(20);
  });

  it('括弧の行は図も再生もなく、説明だけを示す', () => {
    renderNotation();
    expect(screen.getByText(copy.notation.rows.group.description)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: copy.a11y.moveFigure('( )') })).toBeNull();
    expect(screen.queryByRole('button', { name: copy.a11y.playMove('( )') })).toBeNull();
  });

  it('2 層回しの記号と区画の説明は設定の表記に連動する', () => {
    useDocumentStore.getState().updateSettings({ wideStyle: 'Rw' });
    renderNotation();
    expect(screen.getByRole('button', { name: copy.a11y.playMove('Rw') })).toBeInTheDocument();
    expect(screen.getByText(copy.notation.leads.wide('r'))).toBeInTheDocument();
  });

  it('再生を押すとシートが開く', async () => {
    const user = userEvent.setup();
    renderNotation();
    await user.click(screen.getByRole('button', { name: copy.a11y.playMove('M') }));
    expect(screen.getByRole('dialog', { name: copy.a11y.playerSheet })).toBeInTheDocument();
  });

  it('戻るは開いた元の画面へ、直接開いたときは設定へ', () => {
    const { unmount } = renderNotation({ from: '/p/pll-ua/edit' });
    expect(screen.getByRole('link', { name: copy.a11y.back })).toHaveAttribute('href', '/p/pll-ua/edit');
    unmount();
    renderNotation();
    expect(screen.getByRole('link', { name: copy.a11y.back })).toHaveAttribute('href', '/settings');
  });
});
