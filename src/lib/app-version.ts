// vite.config.tsのdefineがビルド時に文字列として埋める。exportを持つファイルなので、
// このdeclareはこのファイルのスコープに閉じ、ほかの層から直接は参照できない
declare const __APP_VERSION__: string;

// package.jsonのversion。画面はこの定数だけを見る
export const APP_VERSION = __APP_VERSION__;
