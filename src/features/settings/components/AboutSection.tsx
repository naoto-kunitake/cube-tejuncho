import { SectionHeading } from '@/components/SectionHeading';
import { copy } from '@/copy';
import { APP_VERSION } from '@/lib/app-version';

import { SettingLink } from './SettingLink';
import { SETTING_ROW_CLASS } from './SettingRow';

// バージョンは不具合の報告に添える値なので、読めればよく押せない行にする
export function AboutSection() {
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{copy.about.title}</SectionHeading>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        <div className={SETTING_ROW_CLASS}>
          <span>{copy.about.version}</span>
          <span className="text-label whitespace-nowrap text-muted tabular-nums">{APP_VERSION}</span>
        </div>
        <SettingLink to="/licenses">{copy.about.licenses}</SettingLink>
        <SettingLink to="/privacy">{copy.about.privacy}</SettingLink>
      </div>
    </section>
  );
}
