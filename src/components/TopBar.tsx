import type { ReactNode } from 'react';

type TopBarProps = {
  children: ReactNode;
};

// 画面の題と操作を 1 行に。高さ 52。右端は 9 で、36px の丸ボタンの中の 22px の記号が端から 16 に揃う
export function TopBar({ children }: TopBarProps) {
  return <div className="flex min-h-13 items-center gap-1.5 pt-1 pr-2.25 pb-2 pl-4">{children}</div>;
}
