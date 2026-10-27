import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { IconLink } from '@/components/IconButton';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';

const SETTINGS_PATH = '/settings';

type AboutLayoutProps = {
  title: string;
  children: ReactNode;
};

// 設定から開く読み物の画面 (ライセンス / プライバシーポリシー)。戻るは設定へ
export function AboutLayout({ title, children }: AboutLayoutProps) {
  return (
    <section aria-label={title} className="mx-auto flex w-full max-w-140 flex-col">
      <TopBar>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconLink to={SETTINGS_PATH} label={copy.a11y.back} className="-ml-1.75">
            <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconLink>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">{title}</h1>
        </div>
      </TopBar>
      <div className="flex flex-col gap-6 px-4 pt-2 pb-6">{children}</div>
    </section>
  );
}
