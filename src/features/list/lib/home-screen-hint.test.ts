import { describe, expect, it } from 'vitest';

import { type HomeScreenEnvironment, isHomeScreenHintNeeded } from './home-screen-hint';

const IPHONE_SAFARI: HomeScreenEnvironment = {
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  platform: 'iPhone',
  maxTouchPoints: 5,
  isStandalone: false,
};
const IPAD_DESKTOP_UA: HomeScreenEnvironment = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  platform: 'MacIntel',
  maxTouchPoints: 5,
  isStandalone: false,
};
const MAC_CHROME: HomeScreenEnvironment = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  platform: 'MacIntel',
  maxTouchPoints: 0,
  isStandalone: false,
};

describe('isHomeScreenHintNeeded', () => {
  it('iPhone のブラウザで開いたときは案内する', () => {
    expect(isHomeScreenHintNeeded(IPHONE_SAFARI)).toBe(true);
  });

  it('Macintosh を名乗る iPad も、タッチ点数で見分けて案内する', () => {
    expect(isHomeScreenHintNeeded(IPAD_DESKTOP_UA)).toBe(true);
  });

  it('Mac のブラウザでは案内しない', () => {
    expect(isHomeScreenHintNeeded(MAC_CHROME)).toBe(false);
  });

  it('ホーム画面から開いているときは案内しない', () => {
    expect(isHomeScreenHintNeeded({ ...IPHONE_SAFARI, isStandalone: true })).toBe(false);
  });
});
