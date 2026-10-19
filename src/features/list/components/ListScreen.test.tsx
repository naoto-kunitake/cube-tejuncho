import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ListScreen } from './ListScreen';

describe('ListScreen', () => {
  it('描画すると見出しが出る', () => {
    render(<ListScreen />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
