import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Arrow } from '@/lib/figure/arrows';
import type { FigureView } from '@/lib/figure/view';

import { TopFigure } from './TopFigure';

const VIEW: FigureView = {
  u: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  f: ['G', 'N', 'G'],
  r: ['N', 'N', 'N'],
  b: ['B', 'B', 'B'],
  l: ['R', 'N', 'R'],
};
const ARROWS: readonly Arrow[] = [
  [3, 7],
  [5, 3],
  [7, 5],
];

describe('TopFigure', () => {
  it('名前つきの図として描画される', () => {
    render(<TopFigure view={VIEW} label="Ua" />);
    expect(screen.getByRole('img', { name: 'Ua' })).toBeInTheDocument();
  });

  it('上面 9 と側面 12 のマスを描く', () => {
    const { container } = render(<TopFigure view={VIEW} label="Ua" />);
    expect(container.querySelectorAll('rect')).toHaveLength(21);
  });

  it('矢印を渡すとその数だけ描く', () => {
    const { container } = render(<TopFigure view={VIEW} arrows={ARROWS} label="Ua" />);
    expect(container.querySelectorAll('path')).toHaveLength(3);
  });
});
