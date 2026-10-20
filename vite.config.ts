import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages のプロジェクトサイト (https://naoto-kunitake.github.io/cube-tejuncho/) に合わせる。開発サーバーも同じパスで開く
  base: '/cube-tejuncho/',
  plugins: [react({ compiler: true }), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
