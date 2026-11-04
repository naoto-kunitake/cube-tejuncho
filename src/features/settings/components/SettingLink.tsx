import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ROW_BUTTON_CLASS } from './SettingRow';

type SettingLinkProps = {
  to: string;
  state?: { from: string };
  children: ReactNode;
};

// 別画面へ進む行。山形はこの行だけに付ける (シートや即時の操作の行には付けない)。
// 山形は20の枠の中で線の右端に6.75の空きがあるので、2引いて線の右端を行の右端から約21に置く。
// 記号の縁を16に揃える7では細い線が端に寄りすぎる (iOSの開示インジケータも行の右端から約20)
export function SettingLink({ to, state, children }: SettingLinkProps) {
  return (
    <Link to={to} state={state} className={ROW_BUTTON_CLASS}>
      <span>{children}</span>
      <ChevronRight size={20} strokeWidth={1.8} aria-hidden="true" className="-mr-0.5 text-muted" />
    </Link>
  );
}
