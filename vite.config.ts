import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  // GitHub Pages のプロジェクトサイト (https://naoto-kunitake.github.io/cube-tejuncho/) に合わせる。開発サーバーも同じパスで開く
  base: '/cube-tejuncho/',
  plugins: [react({ compiler: true }), tailwindcss()],
  // 設定の「バージョン」に出す値。package.json の version を正にする (リリースのタグと同じ値を 1 か所で持つ)
  define: { __APP_VERSION__: JSON.stringify(packageJson.version) },
  build: {
    // 同梱するライブラリの著作権表示 (MITなどが配布の条件にしている) を圧縮で落とさない
    rolldownOptions: { output: { comments: { legal: true } } },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
