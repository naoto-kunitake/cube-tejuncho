import type { ReactNode } from 'react';

type TopBarProps = {
  children: ReactNode;
};

// 画面の題と操作を1行に。上16、下8 (見出し → 内容)。右端は9で、36pxの丸ボタンの中の22pxの記号が端から16に揃う
export function TopBar({ children }: TopBarProps) {
  return <div className="flex min-h-16 items-center gap-1.5 pt-bar pr-2.25 pb-2 pl-4">{children}</div>;
}
