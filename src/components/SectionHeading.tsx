import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// 区画の見出しとラベルの見た目 (13、太字、字間広め、副の色)
export const SECTION_LABEL_CLASS = 'text-label font-bold tracking-widest text-muted';

type SectionHeadingProps = {
  children: ReactNode;
  trailing?: ReactNode;
};

export function SectionHeading({ children, trailing }: SectionHeadingProps) {
  return (
    <h2 className={cn('flex items-baseline justify-between', SECTION_LABEL_CLASS)}>
      {children}
      {trailing}
    </h2>
  );
}
