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

// jsdomはscrollIntoViewを実装しておらず、呼ぶと例外になる (手順の欄をキーパッドの上に寄せる)
Element.prototype.scrollIntoView = () => undefined;
// jsdomのscrollToは呼べるが「Not implemented」の警告を出す。警告を消し、テストのvi.spyOnの対象を揃える (タブを切り替えると先頭に戻す)
window.scrollTo = () => undefined;

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
