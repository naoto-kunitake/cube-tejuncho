import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('スイッチとして読み上げられ、状態を持つ', () => {
    render(<Switch label="arrows" checked onChange={() => undefined} />);
    expect(screen.getByRole('switch', { name: 'arrows' })).toHaveAttribute('aria-checked', 'true');
  });

  it('押すと反対の状態で知らせる', async () => {
    const onChange = vi.fn();
    render(<Switch label="arrows" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch', { name: 'arrows' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
