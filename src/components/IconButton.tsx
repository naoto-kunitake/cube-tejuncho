import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/utils';

// 36pxの丸の形と、疑似要素で広げた44pxの押せる範囲。色と押下の演出は使う側で決める
// (並べ替えのハンドルは押すとドラッグに変わるので、縮む演出を付けない)
export const ICON_BUTTON_BASE_CLASS =
  'pressable relative inline-grid size-9 flex-none place-items-center rounded-full before:absolute before:-inset-1 before:rounded-full';

// 置く面でhover / 押下の濃さが変わる。地の上 (トップバー) は1段濃く、白い面の上 (行、シート) は薄く。
// 既定はトップバーの地の上なので、白い面に置くときはon="surface"を渡す
const iconButtonVariants = cva(cn(ICON_BUTTON_BASE_CLASS, 'text-ink active:scale-96'), {
  variants: {
    on: {
      ground: 'hover:bg-hover-ground active:bg-press-ground',
      surface: 'hover:bg-hover active:bg-press',
    },
  },
  defaultVariants: { on: 'ground' },
});

type IconButtonProps = ComponentProps<'button'> &
  VariantProps<typeof iconButtonVariants> & {
    label: string;
  };

export function IconButton({ label, on, className, children, ...props }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} className={cn(iconButtonVariants({ on }), className)} {...props}>
      {children}
    </button>
  );
}

type IconLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof iconButtonVariants> & {
    label: string;
  };

export function IconLink({ label, on, className, children, ...props }: IconLinkProps) {
  return (
    <Link aria-label={label} className={cn(iconButtonVariants({ on }), className)} {...props}>
      {children}
    </Link>
  );
}
