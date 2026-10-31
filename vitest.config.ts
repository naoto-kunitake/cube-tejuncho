import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  // vite.configはcommandでbaseを切り替える関数なので、ここで解決してから混ぜる (テストはbaseを見ない)
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      // tokens.cssは?rawで文字列として読むテストがある (既定ではCSSを空にする)
      css: { include: [/tokens\.css/] },
    },
  }),
);
