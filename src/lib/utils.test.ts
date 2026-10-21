import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('型スケールと文字色を並べても両方残す', () => {
    expect(cn('text-label text-muted')).toBe('text-label text-muted');
  });

  it('型スケール同士は後のものが勝つ', () => {
    expect(cn('text-label', 'text-title')).toBe('text-title');
  });

  it('字間と行間の自作クラスも同士なら後のものが勝つ', () => {
    expect(cn('tracking-title', 'tracking-count')).toBe('tracking-count');
    expect(cn('leading-alg', 'leading-screen')).toBe('leading-screen');
  });

  it('同じ性質の既定のクラスは後のものが勝つ', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
