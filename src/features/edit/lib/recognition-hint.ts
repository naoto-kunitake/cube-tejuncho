import { copy } from '@/copy';
import type { Settings } from '@/data/document';
import type { Preset } from '@/data/presets/catalog';
import { describeSides } from '@/lib/figure/describe';
import { describeF2l } from '@/lib/figure/describe-f2l';

// PLLは側面の揃い方、F2Lはパーツの位置とクロスの色の向き。
// OLLは上面の向きだけで見分けるので例を出さない (文章にしても図の言い換えになる)
function examplesOf(preset: Preset, topColor: Settings['topColor']): string[] | null {
  switch (preset.category) {
    case 'pll': {
      const runs = describeSides(preset.view).map((entry) => copy.edit.sideRun(entry.side, entry.run));
      return runs.length > 0 ? runs : [copy.edit.noRuns];
    }
    case 'f2l': {
      const cross = copy.list.crossColor[topColor];
      const shapeLabel = copy.list.f2lShapes[preset.shape](cross);
      return [copy.edit.f2lRecognition(describeF2l(preset.view, preset.pair), cross, shapeLabel)];
    }
    case 'oll':
      return null;
  }
}

// 判断の欄のプレースホルダ。例を出さないカテゴリではundefined (欄を空のまま見せる)
export function recognitionHintOf(preset: Preset, topColor: Settings['topColor']): string | undefined {
  const examples = examplesOf(preset, topColor);
  return examples === null ? undefined : copy.edit.recognitionHint(examples);
}
