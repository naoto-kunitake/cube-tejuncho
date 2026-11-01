import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// 区画の見出しとラベルの見た目 (13、太字、字間広め、副の色)
export const SECTION_LABEL_CLASS = 'text-label font-bold tracking-widest text-muted';

type SectionHeadingProps = {
  children: ReactNode;
  trailing?: ReactNode;
};

function SectionHeading({ children, trailing }: SectionHeadingProps) {
  return (
    <h2 className={cn('flex items-baseline justify-between', SECTION_LABEL_CLASS)}>
      {children}
      {trailing}
    </h2>
  );
}

type SectionProps = {
  title: string;
  // 見出しの右端に添えるもの (一覧の件数)
  trailing?: ReactNode;
  children: ReactNode;
};

// 区画 = 見出し + 中身 (間8)。区画どうしの間隔は画面側が決める
export function Section({ title, trailing, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading trailing={trailing}>{title}</SectionHeading>
      {children}
    </section>
  );
}
