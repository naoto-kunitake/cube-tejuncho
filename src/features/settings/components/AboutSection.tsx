import { copy } from '@/copy';
import { APP_VERSION } from '@/lib/app-version';

import { SettingLink } from './SettingLink';
import { SETTING_ROW_CLASS } from './SettingRow';
import { SettingsSection } from './SettingsSection';

// バージョンは不具合の報告に添える値なので、読めればよく押せない行にする
export function AboutSection() {
  return (
    <SettingsSection title={copy.about.title}>
      <div className={SETTING_ROW_CLASS}>
        <span>{copy.about.version}</span>
        <span className="text-label whitespace-nowrap text-muted tabular-nums">{APP_VERSION}</span>
      </div>
      <SettingLink to="/licenses">{copy.about.licenses}</SettingLink>
      <SettingLink to="/privacy">{copy.about.privacy}</SettingLink>
    </SettingsSection>
  );
}
