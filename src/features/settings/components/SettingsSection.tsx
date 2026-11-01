import type { ReactNode } from 'react';

import { ROW_CARD_CLASS } from '@/components/row-card';
import { Section } from '@/components/Section';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

// 設定の区画 = 見出し + 行を並べたカード1枚。カードを2枚に分ける区画 (データ) はSectionを直に使う
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Section title={title}>
      <div className={ROW_CARD_CLASS}>{children}</div>
    </Section>
  );
}
