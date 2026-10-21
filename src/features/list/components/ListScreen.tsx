import { Settings } from 'lucide-react';

import { IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { PLL_PRESETS } from '@/data/presets/pll';
import { useDocumentStore } from '@/data/store';
import { recolorView } from '@/lib/figure/view';

import { useCategory } from '../hooks/useCategory';
import { groupByShape } from '../lib/group-by-shape';
import { CategoryTabs } from './CategoryTabs';
import { PatternTile } from './PatternTile';

// プリセットがあるカテゴリだけタブに出す (OLL と F2L はまだない)
const CATEGORIES = [{ id: 'pll', label: copy.list.categories.pll }] as const;

export function ListScreen() {
  const settings = useDocumentStore((state) => state.document.settings);
  const registrations = useDocumentStore((state) => state.document.registrations);
  const { categoryId, selectCategory } = useCategory(CATEGORIES.map((category) => category.id));
  const sections = groupByShape(PLL_PRESETS, settings.sortOrder.pll);
  const registeredIds = new Set(registrations.map((registration) => registration.patternId));
  const registeredCount = PLL_PRESETS.filter((preset) => registeredIds.has(preset.id)).length;

  return (
    <section aria-label={copy.a11y.list} className="mx-auto flex w-full max-w-186 flex-col">
      <TopBar>
        <h1 className="flex-1 text-title font-bold tracking-title text-balance text-ink-strong">{copy.list.title}</h1>
        <IconLink to="/settings" label={copy.a11y.openSettings}>
          <Settings size={22} strokeWidth={1.8} aria-hidden="true" />
        </IconLink>
      </TopBar>
      <CategoryTabs categories={CATEGORIES} selectedId={categoryId} onSelect={selectCategory} />
      <div className="flex flex-col gap-4 px-4 pb-6">
        <p
          className="mt-1 text-right text-label tracking-count whitespace-nowrap text-muted tabular-nums"
          aria-live="polite"
        >
          {copy.list.registeredCount(registeredCount, PLL_PRESETS.length)}
        </p>
        {/* 群の間は 24 (設定の区画と同じ)。見出しとタイルの間は 8 */}
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.label} className="flex flex-col gap-2">
              <SectionHeading
                trailing={<span className="font-normal tracking-normal tabular-nums">{section.presets.length}</span>}
              >
                {section.label}
              </SectionHeading>
              <div className="grid grid-tiles gap-2">
                {section.presets.map((preset) => (
                  <PatternTile
                    key={preset.id}
                    patternId={preset.id}
                    categoryLabel={copy.list.categories.pll}
                    name={preset.name}
                    view={recolorView(preset.view, settings)}
                    isRegistered={registeredIds.has(preset.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
