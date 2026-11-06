import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ScreenHeader } from './Screen';

afterEach(cleanup);

describe('ScreenHeader', () => {
  it('固定している間はhtmlにscroll-pt-barが付き、外れると消える', () => {
    const { unmount } = render(<ScreenHeader title="編集" isSticky />);
    expect(document.documentElement.classList.contains('scroll-pt-bar')).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains('scroll-pt-bar')).toBe(false);
  });

  it('固定しなければscroll-pt-barを付けない', () => {
    render(<ScreenHeader title="詳細" />);
    expect(document.documentElement.classList.contains('scroll-pt-bar')).toBe(false);
  });
});
