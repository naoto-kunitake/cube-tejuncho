import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { SECTION_LABEL_CLASS } from './SectionHeading';

// 入力欄の共通の見た目。文字は16 (それ未満だとiOS Safariがフォーカス時に画面を拡大する)。フォーカスの輪は全体の規則が付ける
export const INPUT_CLASS =
  'w-full rounded-md border border-line-strong bg-surface text-input text-ink placeholder:text-placeholder hover:border-line-hover';

type FieldProps = {
  id: string;
  label: string;
  children: ComponentProps<'div'>['children'];
};

// ラベル + 入力欄の縦積み (間8)。入力欄は子として渡し、idでラベルと結ぶ
export function Field({ id, label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={SECTION_LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
}

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'className'>;

export function TextArea(props: TextAreaProps) {
  return <textarea className={cn(INPUT_CLASS, 'min-h-17 resize-y px-3 py-2.5')} {...props} />;
}
