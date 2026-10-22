import { Settings as SettingsIcon } from 'lucide-react';

import { IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { findRegistration, type Registration, type Settings } from '@/data/document';
import { type PresetCategoryId, presetsOf } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { recolorView } from '@/lib/figure/view';

import { useCategory } from '../hooks/useCategory';
import { groupByShape } from '../lib/group-by-shape';
import { CategoryTabs } from './CategoryTabs';
import { AddPatternTile, CustomTile } from './CustomTile';
import { PatternTile } from './PatternTile';

type PresetListProps = {
  category: PresetCategoryId;
  settings: Settings;
  registrations: readonly Registration[];
};

function PresetList({ category, settings, registrations }: PresetListProps) {
  const presets = presetsOf(category);
  const sections = groupByShape(category, presets, settings.sortOrder[category]);
  const registeredIds = new Set(registrations.map((registration) => registration.patternId));
  const registeredCount = presets.filter((preset) => registeredIds.has(preset.id)).length;
  return (
    <>
      <p
        className="mt-1 text-right text-label tracking-count whitespace-nowrap text-muted tabular-nums"
        aria-live="polite"
      >
        {copy.list.registeredCount(registeredCount, presets.length)}
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
                  categoryLabel={copy.list.categories[category]}
                  name={preset.name}
                  view={recolorView(preset.view, settings)}
                  isRegistered={registeredIds.has(preset.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

type CustomListProps = {
  categoryId: string;
  registrations: readonly Registration[];
};

// 利用者のカテゴリ: 登録の進み具合も群分けもなく、自作のタイルを作った順に並べ、末尾に追加のタイル
function CustomList({ categoryId, registrations }: CustomListProps) {
  const patterns = useDocumentStore((state) => state.document.patterns);
  const own = patterns.filter((pattern) => pattern.categoryId === categoryId);
  return (
    <div className="mt-1 grid grid-tiles gap-2">
      {own.map((pattern) => (
        <CustomTile
          key={pattern.id}
          patternId={pattern.id}
          name={pattern.name}
          mainAlg={findRegistration(registrations, pattern.id)?.mainAlg.text ?? ''}
        />
      ))}
      <AddPatternTile categoryId={categoryId} />
    </div>
  );
}

export function ListScreen() {
  const document = useDocumentStore((state) => state.document);
  const entries = categoryEntriesOf(document);
  const categories = entries.map((entry) => ({
    id: entry.id,
    label: entry.kind === 'preset' ? copy.list.categories[entry.id] : entry.name,
  }));
  const { categoryId, selectCategory } = useCategory(categories.map((category) => category.id));
  const selected = entries.find((entry) => entry.id === categoryId);

  return (
    <section aria-label={copy.a11y.list} className="mx-auto flex w-full max-w-186 flex-col">
      <TopBar>
        <h1 className="flex-1 text-title font-bold tracking-title text-balance text-ink-strong">{copy.list.title}</h1>
        <IconLink to="/settings" label={copy.a11y.openSettings}>
          <SettingsIcon size={22} strokeWidth={1.8} aria-hidden="true" />
        </IconLink>
      </TopBar>
      <CategoryTabs categories={categories} selectedId={categoryId} onSelect={selectCategory} />
      <div className="flex flex-col gap-4 px-4 pb-6">
        {selected?.kind === 'custom' ? (
          <CustomList categoryId={selected.id} registrations={document.registrations} />
        ) : (
          <PresetList
            category={selected?.kind === 'preset' ? selected.id : 'pll'}
            settings={document.settings}
            registrations={document.registrations}
          />
        )}
      </div>
    </section>
  );
}
