import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Segmented } from './Segmented';

const OPTIONS = [
  { value: 'slow', label: 'A' },
  { value: 'normal', label: 'B' },
  { value: 'fast', label: 'C' },
] as const;

describe('Segmented', () => {
  it('選ばれている選択肢だけ押された状態になる', () => {
    render(<Segmented label="speed" options={OPTIONS} value="normal" onChange={() => undefined} />);
    expect(screen.getByRole('group', { name: 'speed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('選択肢を押すとその値で知らせる', async () => {
    const onChange = vi.fn();
    render(<Segmented label="speed" options={OPTIONS} value="normal" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'C' }));
    expect(onChange).toHaveBeenCalledWith('fast');
  });
});
