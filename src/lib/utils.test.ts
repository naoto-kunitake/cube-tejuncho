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

  // 安全領域のクラスを余白と別の群に見られると両方残り、生成の順で勝ち負けが決まってしまう
  it('安全領域の余白と既定の余白は後のものが勝つ', () => {
    expect(cn('pb-safe-6', 'pb-60')).toBe('pb-60');
    expect(cn('pb-6', 'pb-safe-6')).toBe('pb-safe-6');
    expect(cn('pt-bar', 'pt-4')).toBe('pt-4');
    expect(cn('bottom-safe-4', 'bottom-0')).toBe('bottom-0');
  });
});
