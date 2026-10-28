// vite.config.ts の define がビルド時に文字列として埋める。export を持つファイルなので、
// この declare はこのファイルのスコープに閉じ、ほかの層から直接は参照できない
declare const __APP_VERSION__: string;

// package.json の version。画面はこの定数だけを見る
export const APP_VERSION = __APP_VERSION__;
