import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { orientationView, pairView, recolorCubeView, recolorView } from '@/lib/figure/view';

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

// プリセットの図1枚。上面・前面の色の設定で色を付け替える。入れ替えの矢印はPLLだけ。
// OLLは上面の色の位置で見分けるので、上面の色だけ残して他は灰。F2Lは3面の図で、右前スロットのペアと中心だけ色
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
  const view = recolorView(preset.view, settings);
  if (preset.category === 'oll') {
    return <TopFigure view={orientationView(view, settings.topColor)} label={label} className={className} />;
  }
  const arrows = canShowArrows && settings.showArrows ? preset.arrows : [];
  return <TopFigure view={view} arrows={arrows} label={label} className={className} />;
}
