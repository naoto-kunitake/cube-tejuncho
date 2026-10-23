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

  it('PLL の詳細の図には入れ替えの矢印を描く', () => {
    renderDetail('/p/pll-ua');
    expect(screen.getByRole('img', { name: 'Ua' }).querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('OLL の詳細には手がかりの図を出さない', () => {
    renderDetail('/p/oll-21');
    expect(screen.getByRole('heading', { level: 1, name: 'OLL 21' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'OLL 21' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: copy.a11y.cueFigure('OLL 21') })).not.toBeInTheDocument();
  });

  it('F2L の詳細は 3 面の図 1 枚で、手がかりの図を出さない', () => {
    renderDetail('/p/f2l-1');
    expect(screen.getByRole('heading', { level: 1, name: 'F2L 1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'F2L 1' }).querySelectorAll('polygon')).toHaveLength(27);
    expect(screen.queryByRole('img', { name: copy.a11y.cueFigure('F2L 1') })).not.toBeInTheDocument();
  });

  it('知らない id なら見つからないと出す', () => {
    renderDetail('/p/unknown');
    expect(screen.getByRole('heading', { level: 1, name: copy.detail.notFound })).toBeInTheDocument();
  });

  it('自作パターンは名前とメイン手順を出し、手順がなければ登録の空枠を出す', () => {
    const document = createEmptyDocument();
    document.categories = [{ id: 'c1', name: 'COLL' }];
    document.patterns = [
      { id: 'p1', categoryId: 'c1', name: 'Sune', createdAt: '', updatedAt: '' },
      { id: 'p2', categoryId: 'c1', name: 'Empty', createdAt: '', updatedAt: '' },
    ];
    document.registrations = [
      {
        patternId: 'p1',
        recognition: '',
        mainAlg: { text: "R U R' U R U2 R'", mnemonic: '', fingering: '' },
        altAlgs: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        patternId: 'p2',
        recognition: '判断だけ',
        mainAlg: { text: '', mnemonic: '', fingering: '' },
        altAlgs: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    useDocumentStore.setState({ document });
    const { unmount } = renderDetail('/p/p1');
    expect(screen.getByRole('heading', { level: 1, name: 'Sune' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: copy.detail.useThisAlg })).not.toBeInTheDocument();
    expect(screen.getAllByText("R U R' U R U2 R'").length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: copy.detail.writeRecognition })).toBeInTheDocument();
    unmount();
    renderDetail('/p/p2');
    expect(screen.getByText('判断だけ')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: copy.detail.writeRecognition })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.detail.registerAlg })).toHaveAttribute('href', '/p/p2/edit');
  });
});
