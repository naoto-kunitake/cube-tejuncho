import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ROW_BUTTON_CLASS } from './SettingRow';

type SettingLinkProps = {
  to: string;
  state?: { from: string };
  children: ReactNode;
};

// 別画面へ進む行。山形はこの行だけに付ける (シートや即時の操作の行には付けない)
export function SettingLink({ to, state, children }: SettingLinkProps) {
  return (
    <Link to={to} state={state} className={ROW_BUTTON_CLASS}>
      <span>{children}</span>
      <ChevronRight size={20} strokeWidth={1.8} aria-hidden="true" className="-mr-0.5 text-muted" />
    </Link>
  );
}
