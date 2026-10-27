import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { PILL_TAP_AREA_CLASS, TEXT_PILL_TAP_AREA_CLASS } from './tap-area';

// ピル型のボタン。見た目 36、押せる範囲は疑似要素で 44。
// primary = 画面の主役 (保存、この手順を使う)、danger = 確認の実行、quiet = 枠だけ (メインにする)、
// text / textDanger / textMuted = 文字だけ (自分で登録、削除、案内の閉じる)
export const buttonVariants = cva(
  'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full pressable disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: cn(
          PILL_TAP_AREA_CLASS,
          'gap-2 border border-accent bg-accent px-4 text-body font-bold text-on-accent hover:bg-accent-hover active:scale-98 active:bg-accent-press disabled:border-disabled disabled:bg-disabled disabled:text-on-disabled disabled:opacity-45',
        ),
        danger: cn(
          PILL_TAP_AREA_CLASS,
          'gap-2 border border-danger bg-danger px-4 text-body font-bold text-on-danger hover:border-danger-hover hover:bg-danger-hover active:scale-98 active:border-danger-active active:bg-danger-active disabled:border-disabled disabled:bg-disabled disabled:text-on-disabled disabled:opacity-45',
        ),
        quiet: cn(
          PILL_TAP_AREA_CLASS,
          'border border-line-strong px-3.5 text-small font-medium text-ink hover:bg-hover active:scale-98 active:bg-press',
        ),
        text: cn(
          TEXT_PILL_TAP_AREA_CLASS,
          'px-3 text-small font-medium text-accent hover:bg-accent-tint-hover active:bg-accent-tint-press',
        ),
        textDanger: cn(
          TEXT_PILL_TAP_AREA_CLASS,
          'px-3 text-small font-medium text-danger hover:bg-danger-tint active:bg-danger-tint',
        ),
        textMuted: cn(
          TEXT_PILL_TAP_AREA_CLASS,
          'px-3 text-small font-medium text-muted hover:bg-hover active:bg-press',
        ),
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ variant, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
