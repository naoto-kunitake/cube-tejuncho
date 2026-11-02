import type { ReactNode } from 'react';

import { BackLink, Screen, ScreenBody, ScreenHeader } from '@/components/Screen';
import { copy } from '@/copy';

const SETTINGS_PATH = '/settings';

type AboutLayoutProps = {
  title: string;
  children: ReactNode;
};

// 設定から開く読み物の画面 (ライセンス / プライバシーポリシー)。戻るは設定へ
export function AboutLayout({ title, children }: AboutLayoutProps) {
  return (
    <Screen label={title}>
      <ScreenHeader title={title} leading={<BackLink to={SETTINGS_PATH} label={copy.a11y.back} />} />
      <ScreenBody>{children}</ScreenBody>
    </Screen>
  );
}
