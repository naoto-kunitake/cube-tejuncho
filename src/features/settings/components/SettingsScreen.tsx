import { ChevronLeft } from 'lucide-react';

import { IconLink } from '@/components/IconButton';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { CategorySection } from './CategorySection';
import { DataSection } from './DataSection';
import { OptionSections } from './OptionSections';

export function SettingsScreen() {
  const document = useDocumentStore((state) => state.document);
  const updateSettings = useDocumentStore((state) => state.updateSettings);

  return (
    <section aria-label={copy.a11y.openSettings} className="mx-auto flex w-full max-w-140 flex-col">
      <TopBar>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconLink to="/" label={copy.a11y.backToList} className="-ml-1.75">
            <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconLink>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {copy.settings.title}
          </h1>
        </div>
      </TopBar>
      <div className="flex flex-col gap-6 px-4 pt-2 pb-6">
        <CategorySection />
        <OptionSections settings={document.settings} onChange={updateSettings} />
        <DataSection />
      </div>
    </section>
  );
}
