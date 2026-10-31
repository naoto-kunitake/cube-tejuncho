import { useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router';

type Navigation = {
  previousPathname: string;
  pathname: string;
  navigationType: NavigationType;
};

// 別の画面へ進む / 置き換えるときだけ先頭に戻す。戻る (POP) はブラウザの復元に任せる。
// 一覧のタブ切り替えは検索パラメータの置き換えでpathnameが変わらないので、画面が変わったとは見なさない
export function shouldScrollToTop({ previousPathname, pathname, navigationType }: Navigation): boolean {
  return pathname !== previousPathname && navigationType !== NavigationType.Pop;
}

// SPAのpushStateはスクロール位置を動かさないので、前の画面の位置が次の画面に残る
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);
  useEffect(() => {
    const shouldScroll = shouldScrollToTop({ previousPathname: previousPathname.current, pathname, navigationType });
    previousPathname.current = pathname;
    if (shouldScroll) {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);
  return null;
}
