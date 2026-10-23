import { LayoutGrid, List, Settings as SettingsIcon } from 'lucide-react';

import { IconButton, IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { findRegistration, type Registration, type Settings } from '@/data/document';
import { type PresetCategoryId, presetsOf } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { useCategory } from '../hooks/useCategory';
import { groupByShape } from '../lib/group-by-shape';
import { tileNameOf } from '../lib/tile-name';
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
  const sections = groupByShape(presets, {
    category,
    sortOrder: settings.sortOrder[category],
    topColor: settings.topColor,
  });
  const registeredIds = new Set(registrations.map((registration) => registration.patternId));
  const registeredCount = presets.filter((preset) => registeredIds.has(preset.id)).length;
  const gridClass = settings.listView === 'list' ? 'grid-list-rows' : 'grid-tiles';
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
            <div className={cn('grid gap-2', gridClass)}>
              {section.presets.map((preset) => (
                <PatternTile
                  key={preset.id}
                  preset={preset}
                  settings={settings}
                  categoryLabel={copy.list.categories[category]}
                  name={tileNameOf(preset)}
                  isRegistered={registeredIds.has(preset.id)}
                  mainAlg={findRegistration(registrations, preset.id)?.mainAlg.text ?? ''}
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
  settings: Settings;
  registrations: readonly Registration[];
};

// 利用者のカテゴリ: 登録の進み具合も群分けもなく、自作のタイルを作った順に並べ、末尾に追加のタイル
function CustomList({ categoryId, settings, registrations }: CustomListProps) {
  const patterns = useDocumentStore((state) => state.document.patterns);
  const own = patterns.filter((pattern) => pattern.categoryId === categoryId);
  return (
    <div className={cn('mt-1 grid gap-2', settings.listView === 'list' ? 'grid-list-rows' : 'grid-tiles')}>
      {own.map((pattern) => (
        <CustomTile
          key={pattern.id}
          patternId={pattern.id}
          name={pattern.name}
          mainAlg={findRegistration(registrations, pattern.id)?.mainAlg.text ?? ''}
          settings={settings}
        />
      ))}
      <AddPatternTile categoryId={categoryId} listView={settings.listView} />
    </div>
  );
}

export function ListScreen() {
  const document = useDocumentStore((state) => state.document);
  const setListView = useDocumentStore((state) => state.setListView);
  const isList = document.settings.listView === 'list';
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
        {/* 押すたびに交互。記号と名前は切り替え先 (ドライブ・Keep と同じ)。全体で 1 つの設定で、設定画面には置かない */}
        <IconButton
          label={isList ? copy.a11y.switchToGrid : copy.a11y.switchToList}
          onClick={() => {
            setListView(isList ? 'grid' : 'list');
          }}
        >
          {isList ? (
            <LayoutGrid size={22} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <List size={22} strokeWidth={1.8} aria-hidden="true" />
          )}
        </IconButton>
        <IconLink to="/settings" label={copy.a11y.openSettings}>
          <SettingsIcon size={22} strokeWidth={1.8} aria-hidden="true" />
        </IconLink>
      </TopBar>
      <CategoryTabs categories={categories} selectedId={categoryId} onSelect={selectCategory} />
      <div className="flex flex-col gap-4 px-4 pb-6">
        {selected?.kind === 'custom' ? (
          <CustomList categoryId={selected.id} settings={document.settings} registrations={document.registrations} />
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
