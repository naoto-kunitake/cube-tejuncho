import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { ListScreen } from './ListScreen';

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
});

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
});
