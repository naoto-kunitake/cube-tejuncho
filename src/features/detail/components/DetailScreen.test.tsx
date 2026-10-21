import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { DetailScreen } from './DetailScreen';

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
  });

  it('知らない id なら見つからないと出す', () => {
    renderDetail('/p/unknown');
    expect(screen.getByRole('heading', { level: 1, name: copy.detail.notFound })).toBeInTheDocument();
  });
});
