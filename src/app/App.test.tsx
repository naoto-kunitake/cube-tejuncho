import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { App } from './App';

beforeEach(() => {
  localStorage.clear();
  useDocumentStore.setState({ document: createEmptyDocument() });
});

describe('App', () => {
  it('画面は main の中に出る', () => {
    render(<App />);
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }));
  });
});
