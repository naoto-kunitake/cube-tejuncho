import type { ReactNode } from 'react';

type TopBarProps = {
  children: ReactNode;
};

// 画面の題と操作を1行に。高さと上の余白は端末で変える (スマホ・タブレットは52 / 4、PCは64 / 16。pt-barを参照)。
// 下8 (見出し → 内容)。右端は9で、36pxの丸ボタンの中の22pxの記号が端から16に揃う
export function TopBar({ children }: TopBarProps) {
  return (
    <div className="flex min-h-13 items-center gap-1.5 pt-bar pr-2.25 pb-2 pl-4 pointer-fine:min-h-16">{children}</div>
  );
}
