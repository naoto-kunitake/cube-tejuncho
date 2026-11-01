import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { cueView, recolorView } from '@/lib/figure/view';

import { type FigureSettings, PresetFigure } from './PresetFigure';
import { TopFigure } from './TopFigure';

type PatternFiguresProps = {
  preset: Preset;
  settings: FigureSettings & Pick<Settings, 'showCueFigure'>;
};

// パターンの図。PLLで手がかりの図を出す設定なら、全色の図と手がかりの図を横に2枚並べる。
// SVGはviewBox 86のうち外側4 (4.65%) が空くので、負の余白で打ち消して外周を呼び出し側の余白に揃える。
// 2枚: ステッカー幅138 × 2 + 間24 = 内側300 → SVG幅152、負の余白7。1枚: 240 → 11。
// 手がかりの図はPLLだけ (OLLは上面の向き、F2Lは3面の図で見分ける)
export function PatternFigures({ preset, settings }: PatternFiguresProps) {
  if (preset.category === 'pll' && settings.showCueFigure) {
    return (
      <div className="flex w-full justify-center gap-6">
        <div className="-m-1.75 w-38 flex-none">
          <PresetFigure preset={preset} settings={settings} canShowArrows />
        </div>
        <div className="-m-1.75 w-38 flex-none">
          <TopFigure view={cueView(recolorView(preset.view, settings))} label={copy.a11y.cueFigure(preset.name)} />
        </div>
      </div>
    );
  }
  return (
    <div className="-my-2.75 w-full max-w-60">
      <PresetFigure preset={preset} settings={settings} canShowArrows />
    </div>
  );
}
