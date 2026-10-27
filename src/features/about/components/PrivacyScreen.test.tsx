import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { copy } from '@/copy';

import { PrivacyScreen } from './PrivacyScreen';

describe('PrivacyScreen', () => {
  it('方針の区画がすべて見出しつきで出る', () => {
    render(
      <MemoryRouter>
        <PrivacyScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: copy.about.privacy })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(copy.about.privacySections.length);
    expect(screen.getByText(copy.about.privacyUpdated)).toBeInTheDocument();
  });

  it('問い合わせの節に Issues への外部リンクがある', () => {
    render(
      <MemoryRouter>
        <PrivacyScreen />
      </MemoryRouter>,
    );
    const contact = copy.about.privacySections.find((section) => section.linkParagraph !== undefined);
    expect(contact?.linkParagraph).toBeDefined();
    expect(screen.getByRole('link', { name: contact?.linkParagraph?.label })).toHaveAttribute(
      'href',
      contact?.linkParagraph?.href,
    );
  });
});
