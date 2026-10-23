import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { recolorView } from '@/lib/figure/view';

import { TopFigure } from './TopFigure';

export type FigureSettings = Pick<Settings, 'topColor' | 'frontColor' | 'showArrows'>;

type PresetFigureProps = {
  preset: Preset;
  settings: FigureSettings;
  // 読み上げ名。一覧のタイルのように短い名前 (番号だけ) にする場所だけ渡す
  label?: string;
  className?: string;
};

// プリセットの図 1 枚。上面・前面の色の設定で色を付け替え、入れ替えの矢印は PLL だけ (OLL は上面の向きで見分ける)
export function PresetFigure({ preset, settings, label = preset.name, className }: PresetFigureProps) {
  const arrows = preset.category === 'pll' && settings.showArrows ? preset.arrows : [];
  return <TopFigure view={recolorView(preset.view, settings)} arrows={arrows} label={label} className={className} />;
}
