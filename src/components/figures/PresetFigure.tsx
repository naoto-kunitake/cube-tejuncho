import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { pairView, recolorCubeView, recolorView } from '@/lib/figure/view';

import { CubeFigure } from './CubeFigure';
import { TopFigure } from './TopFigure';

export type FigureSettings = Pick<Settings, 'topColor' | 'frontColor' | 'showArrows'>;

type PresetFigureProps = {
  preset: Preset;
  settings: FigureSettings;
  // 読み上げ名。一覧のタイルのように短い名前 (番号だけ) にする場所だけ渡す
  label?: string;
  // 入れ替えの矢印は詳細と編集の大きい図だけ (一覧の小さい図では読めないので省く)
  canShowArrows?: boolean;
  className?: string;
};

// プリセットの図 1 枚。上面・前面の色の設定で色を付け替える。入れ替えの矢印は PLL だけ (OLL は上面の向きで見分ける)。
// F2L は 3 面の図で、右前スロットのペアと中心だけ色
export function PresetFigure({
  preset,
  settings,
  label = preset.name,
  canShowArrows = false,
  className,
}: PresetFigureProps) {
  if (preset.category === 'f2l') {
    const view = pairView(recolorCubeView(preset.view, settings), preset.pair);
    return <CubeFigure view={view} label={label} className={className} />;
  }
  const arrows = canShowArrows && preset.category === 'pll' && settings.showArrows ? preset.arrows : [];
  return <TopFigure view={recolorView(preset.view, settings)} arrows={arrows} label={label} className={className} />;
}
