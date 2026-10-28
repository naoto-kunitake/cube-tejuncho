import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library の自動クリーンアップは globals の afterEach を前提にしている。globals を使わないので自分で呼ぶ
afterEach(cleanup);

// jsdom は dialog の showModal / close を実装していない。開閉の状態だけ真似る
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};

// jsdom はポインタの捕捉も実装していない (ドラッグの部品が pointerdown で呼ぶ)
HTMLElement.prototype.setPointerCapture = () => undefined;

// jsdom は matchMedia も実装していない (ホーム画面の案内が display-mode を見る)。常に不一致を返す
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
