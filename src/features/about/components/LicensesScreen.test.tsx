import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { CREDITS } from '@/data/credits';

import { LicensesScreen } from './LicensesScreen';

describe('LicensesScreen', () => {
  it('使っているものの行がライセンスの原文へのリンクになっている', () => {
    render(
      <MemoryRouter>
        <LicensesScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: copy.about.licenses })).toBeInTheDocument();
    for (const credit of CREDITS) {
      expect(screen.getByRole('link', { name: new RegExp(copy.about.credits[credit.id]) })).toHaveAttribute(
        'href',
        credit.licenseUrl,
      );
    }
    expect(screen.getByRole('link', { name: copy.a11y.back })).toHaveAttribute('href', '/settings');
  });
});
