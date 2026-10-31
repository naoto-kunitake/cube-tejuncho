import { LayoutGrid, List, Settings as SettingsIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { IconButton, IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { useToastStore } from '@/components/toast/toast-store';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { categoryEntriesOf } from '@/data/categories';
import { type CustomPattern, findRegistration, type Registration, type Settings } from '@/data/document';
import { type PresetCategoryId, presetsOf } from '@/data/presets/catalog';
import { HOME_SCREEN_BANNER, useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { useCategory } from '../hooks/useCategory';
import { groupByShape } from '../lib/group-by-shape';
import { homeScreenEnvironmentOf, isHomeScreenHintNeeded } from '../lib/home-screen-hint';
import { tileNameOf } from '../lib/tile-name';
import { CATEGORY_PANEL_ID, categoryTabId, CategoryTabs } from './CategoryTabs';
import { AddPatternTile, CustomTile } from './CustomTile';
import { FirstRunBanner } from './FirstRunBanner';
import { HomeScreenBanner } from './HomeScreenBanner';
import { PresetTile } from './PresetTile';

type TileSectionProps = {
  label: string;
  count: number;
  listView: Settings['listView'];
  children: ReactNode;
};

// 見出し + 格子。群の間は24 (設定の区画と同じ)、見出しとタイルの間は8
function TileSection({ label, count, listView, children }: TileSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading trailing={<span className="font-normal tracking-normal tabular-nums">{count}</span>}>
        {label}
      </SectionHeading>
      <div className={cn('grid gap-2', listView === 'list' ? 'grid-list-rows' : 'grid-tiles')}>{children}</div>
    </section>
  );
}

type PresetListProps = {
  category: PresetCategoryId;
  settings: Settings;
  registrations: readonly Registration[];
  pinnedIds: ReadonlySet<string>;
};

function PresetList({ category, settings, registrations, pinnedIds }: PresetListProps) {
  const registerStandardAlgs = useDocumentStore((state) => state.registerStandardAlgs);
  const dismissBanner = useDocumentStore((state) => state.dismissBanner);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const showToast = useToastStore((state) => state.show);
  const presets = presetsOf(category);
  const sections = groupByShape(presets, {
    category,
    sortOrder: settings.sortOrder[category],
    topColor: settings.topColor,
    pinnedIds,
  });
  const registeredIds = new Set(registrations.map((registration) => registration.patternId));
  const registeredCount = presets.filter((preset) => registeredIds.has(preset.id)).length;
  // 案内はタブごとに閉じる (行動 = そのタブの一括登録なので、文脈ごと)。1件でも登録があれば出さない
  const showsBanner = registeredCount === 0 && !settings.dismissedBanners.includes(category);
  // 一括登録は取り消せるので確認は出さない
  const registerAll = () => {
    const before = useDocumentStore.getState().document;
    const count = registerStandardAlgs(category);
    showToast(copy.list.registeredAll(count), {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };
  return (
    <>
      <p
        className="mt-1 text-right text-label tracking-count whitespace-nowrap text-muted tabular-nums"
        aria-live="polite"
      >
        {copy.list.registeredCount(registeredCount, presets.length)}
      </p>
      {showsBanner && (
        <FirstRunBanner
          onDismiss={() => {
            dismissBanner(category);
          }}
          onRegisterAll={registerAll}
        />
      )}
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <TileSection
            key={section.label}
            label={section.label}
            count={section.presets.length}
            listView={settings.listView}
          >
            {section.presets.map((preset) => (
              <PresetTile
                key={preset.id}
                preset={preset}
                settings={settings}
                categoryLabel={copy.list.categories[category]}
                name={tileNameOf(preset)}
                isRegistered={registeredIds.has(preset.id)}
                mainAlg={findRegistration(registrations, preset.id)?.mainAlg.text ?? ''}
              />
            ))}
          </TileSection>
        ))}
      </div>
    </>
  );
}

type CustomListProps = {
  categoryId: string;
  settings: Settings;
  registrations: readonly Registration[];
  pinnedIds: ReadonlySet<string>;
};

// 利用者のカテゴリ: 登録の進み具合も群分けもなく、自作のタイルを作った順に並べ、末尾に追加のタイル。
// 並び方の概念がないので、ピン留めがあるときだけ「ピン留め」と「その他」で区切る (Keepと同じ)
function CustomList({ categoryId, settings, registrations, pinnedIds }: CustomListProps) {
  const patterns = useDocumentStore((state) => state.document.patterns);
  const custom = patterns.filter((pattern) => pattern.categoryId === categoryId);
  const pinned = custom.filter((pattern) => pinnedIds.has(pattern.id));
  const rest = custom.filter((pattern) => !pinnedIds.has(pattern.id));
  const tileOf = (pattern: CustomPattern) => (
    <CustomTile
      key={pattern.id}
      patternId={pattern.id}
      name={pattern.name}
      mainAlg={findRegistration(registrations, pattern.id)?.mainAlg.text ?? ''}
      settings={settings}
    />
  );
  const addTile = <AddPatternTile categoryId={categoryId} listView={settings.listView} />;
  if (pinned.length === 0) {
    return (
      <div className={cn('mt-1 grid gap-2', settings.listView === 'list' ? 'grid-list-rows' : 'grid-tiles')}>
        {rest.map(tileOf)}
        {addTile}
      </div>
    );
  }
  return (
    <div className="mt-1 flex flex-col gap-6">
      <TileSection label={copy.list.pinned} count={pinned.length} listView={settings.listView}>
        {pinned.map(tileOf)}
        {rest.length === 0 && addTile}
      </TileSection>
      {rest.length > 0 && (
        <TileSection label={copy.list.others} count={rest.length} listView={settings.listView}>
          {rest.map(tileOf)}
          {addTile}
        </TileSection>
      )}
    </div>
  );
}

export function ListScreen() {
  const document = useDocumentStore((state) => state.document);
  const pinnedIds = new Set(document.pinned);
  const setListView = useDocumentStore((state) => state.setListView);
  const dismissBanner = useDocumentStore((state) => state.dismissBanner);
  const isList = document.settings.listView === 'list';
  // iOSでまだホーム画面に追加していないときに一度だけ出す案内 (閉じると設定に残る)。
  // 守るデータがないうちは出さない (初回は登録の案内だけが出て、2枚の案内が重ならない)
  const showsHomeScreenBanner =
    document.registrations.length > 0 &&
    isHomeScreenHintNeeded(homeScreenEnvironmentOf(window)) &&
    !document.settings.dismissedBanners.includes(HOME_SCREEN_BANNER);
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
        {/* 押すたびに交互。記号と名前は切り替え先 (ドライブ・Keepと同じ)。全体で1つの設定で、設定画面には置かない */}
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
      <div
        id={CATEGORY_PANEL_ID}
        role="tabpanel"
        aria-labelledby={categoryTabId(categoryId)}
        className="flex flex-col gap-4 px-4 pb-6"
      >
        {showsHomeScreenBanner && (
          <HomeScreenBanner
            onDismiss={() => {
              dismissBanner(HOME_SCREEN_BANNER);
            }}
          />
        )}
        {selected?.kind === 'custom' ? (
          <CustomList
            categoryId={selected.id}
            settings={document.settings}
            registrations={document.registrations}
            pinnedIds={pinnedIds}
          />
        ) : (
          <PresetList
            category={selected?.kind === 'preset' ? selected.id : 'pll'}
            settings={document.settings}
            registrations={document.registrations}
            pinnedIds={pinnedIds}
          />
        )}
      </div>
    </section>
  );
}
