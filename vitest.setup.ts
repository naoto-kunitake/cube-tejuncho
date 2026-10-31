import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Libraryの自動クリーンアップはglobalsのafterEachを前提にしている。globalsを使わないので自分で呼ぶ
afterEach(cleanup);

// jsdomはdialogのshowModal / closeを実装していない。開閉の状態だけ真似る
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};

// jsdomはポインタの捕捉も実装していない (ドラッグの部品がpointerdownで呼ぶ)
HTMLElement.prototype.setPointerCapture = () => undefined;

// jsdomはmatchMediaも実装していない (ホーム画面の案内がdisplay-modeを見る)。常に不一致を返す
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
