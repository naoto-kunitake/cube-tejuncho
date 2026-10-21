import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as TwistyExports from '@/components/player/twisty';
import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { DetailScreen } from './DetailScreen';

vi.mock('@/components/player/twisty', async (importOriginal) => {
  const original = await importOriginal<typeof TwistyExports>();
  return { ...original, loadTwisty: vi.fn(() => new Promise(() => undefined)) };
});

function renderDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:id" element={<DetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
});

describe('DetailScreen', () => {
  it('パターンの名前を見出しに出し、未登録なら基本手順を提案する', () => {
    renderDetail('/p/pll-ua');
    expect(screen.getByRole('heading', { level: 1, name: 'Ua' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.detail.useThisAlg })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.a11y.editPattern('Ua') })).toHaveAttribute('href', '/p/pll-ua/edit');
  });

  it('基本手順の再生を押すとシートが開く', async () => {
    renderDetail('/p/pll-ua');
    await userEvent.click(screen.getByRole('button', { name: copy.detail.play }));
    expect(screen.getByRole('dialog', { name: copy.a11y.playerSheet })).toBeInTheDocument();
  });

  it('知らない id なら見つからないと出す', () => {
    renderDetail('/p/unknown');
    expect(screen.getByRole('heading', { level: 1, name: copy.detail.notFound })).toBeInTheDocument();
  });
});
