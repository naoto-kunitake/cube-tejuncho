import type { ComponentProps } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/utils';

// 見た目 36px、押せる範囲は疑似要素で 44px。地の上 (トップバー) に置くので hover / 押下は 1 段濃い色
const ICON_BUTTON_CLASS =
  'pressable relative inline-grid size-9 flex-none place-items-center rounded-full text-ink before:absolute before:-inset-1 before:rounded-full hover:bg-hover-ground active:scale-96 active:bg-press-ground';

type IconButtonProps = ComponentProps<'button'> & {
  label: string;
};

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} className={cn(ICON_BUTTON_CLASS, className)} {...props}>
      {children}
    </button>
  );
}

type IconLinkProps = ComponentProps<typeof Link> & {
  label: string;
};

export function IconLink({ label, className, children, ...props }: IconLinkProps) {
  return (
    <Link aria-label={label} className={cn(ICON_BUTTON_CLASS, className)} {...props}>
      {children}
    </Link>
  );
}
