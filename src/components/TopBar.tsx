import type { ReactNode } from 'react';

type TopBarProps = {
  children: ReactNode;
};

// 画面の題と操作を 1 行に。上 16、下 8 (見出し → 内容)。右端は 9 で、36px の丸ボタンの中の 22px の記号が端から 16 に揃う
export function TopBar({ children }: TopBarProps) {
  return <div className="flex min-h-16 items-center gap-1.5 pt-bar pr-2.25 pb-2 pl-4">{children}</div>;
}
