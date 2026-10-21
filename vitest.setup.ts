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
