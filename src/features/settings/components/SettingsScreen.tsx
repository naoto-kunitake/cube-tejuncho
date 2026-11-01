import { BackLink, Screen, ScreenBody, ScreenHeader } from '@/components/Screen';
import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { AboutSection } from './AboutSection';
import { CategorySection } from './CategorySection';
import { DataSection } from './DataSection';
import { OptionSections } from './OptionSections';

export function SettingsScreen() {
  const document = useDocumentStore((state) => state.document);
  const updateSettings = useDocumentStore((state) => state.updateSettings);

  return (
    <Screen label={copy.a11y.settings}>
      <ScreenHeader title={copy.settings.title} leading={<BackLink to="/" label={copy.a11y.backToList} />} />
      <ScreenBody>
        <CategorySection />
        <OptionSections settings={document.settings} onChange={updateSettings} />
        <DataSection />
        <AboutSection />
      </ScreenBody>
    </Screen>
  );
}
