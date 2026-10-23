import type { ReactNode } from 'react';

import { STICKER_DOT_CLASS } from '@/components/figures/sticker-color';
import { SectionHeading } from '@/components/SectionHeading';
import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import { PRESET_CATEGORY_IDS } from '@/data/presets/catalog';
import { WIDE_STYLES } from '@/lib/alg/format';
import { FRONT_COLOR_LETTER, FRONT_COLORS, TOP_COLORS, TOP_LETTER } from '@/lib/figure/view';

import { Segmented } from './Segmented';
import { SettingRow } from './SettingRow';
import { Switch } from './Switch';

const PLAYBACK_SPEEDS = ['slow', 'normal', 'fast'] as const;

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

// 区画 = 見出し + 白いカード (行の列)。区画の間は 24、見出しとカードの間は 8
function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{title}</SectionHeading>
      <div className="overflow-hidden rounded-md border border-line bg-surface">{children}</div>
    </section>
  );
}

type OptionSectionsProps = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

// 一覧の並び順 / 図 / 再生 / 表記 の 4 区画。選択肢はセグメント、on / off はスイッチ
export function OptionSections({ settings, onChange }: OptionSectionsProps) {
  return (
    <>
      <SettingsSection title={copy.settings.list}>
        {PRESET_CATEGORY_IDS.map((category) => (
          <SettingRow key={category} label={copy.settings.sortOrderOf(copy.list.categories[category])} wrapsOnNarrow>
            <Segmented
              label={copy.settings.sortOrderOf(copy.list.categories[category])}
              options={[
                { value: 'shape', label: copy.settings.byShape },
                { value: 'standard', label: copy.list.standardOrder[category] },
              ]}
              value={settings.sortOrder[category]}
              onChange={(value) => {
                onChange({ sortOrder: { ...settings.sortOrder, [category]: value } });
              }}
            />
          </SettingRow>
        ))}
      </SettingsSection>
      <SettingsSection title={copy.settings.figure}>
        <SettingRow label={copy.settings.topColor} wrapsOnNarrow>
          <Segmented
            label={copy.settings.topColor}
            options={TOP_COLORS.map((color) => ({
              value: color,
              label: copy.settings.topColors[color],
              dotClassName: STICKER_DOT_CLASS[TOP_LETTER[color]],
            }))}
            value={settings.topColor}
            onChange={(topColor) => {
              onChange({ topColor });
            }}
          />
        </SettingRow>
        <SettingRow label={copy.settings.frontColor} wrapsOnNarrow>
          <Segmented
            label={copy.settings.frontColor}
            isCompact
            options={FRONT_COLORS.map((color) => ({
              value: color,
              label: copy.settings.frontColors[color],
              dotClassName: STICKER_DOT_CLASS[FRONT_COLOR_LETTER[color]],
            }))}
            value={settings.frontColor}
            onChange={(frontColor) => {
              onChange({ frontColor });
            }}
          />
        </SettingRow>
        <SettingRow label={copy.settings.showArrows}>
          <Switch
            label={copy.settings.showArrows}
            checked={settings.showArrows}
            onChange={(showArrows) => {
              onChange({ showArrows });
            }}
          />
        </SettingRow>
        <SettingRow label={copy.settings.showCueFigure}>
          <Switch
            label={copy.settings.showCueFigure}
            checked={settings.showCueFigure}
            onChange={(showCueFigure) => {
              onChange({ showCueFigure });
            }}
          />
        </SettingRow>
      </SettingsSection>
      <SettingsSection title={copy.settings.playback}>
        <SettingRow label={copy.settings.playbackSpeed} wrapsOnNarrow>
          <Segmented
            label={copy.settings.playbackSpeed}
            options={PLAYBACK_SPEEDS.map((speed) => ({ value: speed, label: copy.settings.playbackSpeeds[speed] }))}
            value={settings.playbackSpeed}
            onChange={(playbackSpeed) => {
              onChange({ playbackSpeed });
            }}
          />
        </SettingRow>
        <SettingRow label={copy.settings.greyUnrelated}>
          <Switch
            label={copy.settings.greyUnrelated}
            checked={settings.greyUnrelated}
            onChange={(greyUnrelated) => {
              onChange({ greyUnrelated });
            }}
          />
        </SettingRow>
      </SettingsSection>
      <SettingsSection title={copy.settings.notation}>
        <SettingRow label={copy.settings.wideStyle} wrapsOnNarrow>
          <Segmented
            label={copy.settings.wideStyle}
            options={WIDE_STYLES.map((style) => ({ value: style, label: style }))}
            value={settings.wideStyle}
            onChange={(wideStyle) => {
              onChange({ wideStyle });
            }}
          />
        </SettingRow>
      </SettingsSection>
    </>
  );
}
