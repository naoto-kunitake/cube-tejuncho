import { copy } from '@/copy';
import type { Preset } from '@/data/presets/catalog';

// 一覧のタイルは番号だけ (「OLL 21」→「21」)。タブと群の見出しが文脈を示すので接頭辞を繰り返さない。
// 詳細の見出しや再生シートのように単独で出る場所は正式名のまま
export function tileNameOf(preset: Preset): string {
  const prefix = `${copy.list.categories[preset.category]} `;
  return preset.name.startsWith(prefix) ? preset.name.slice(prefix.length) : preset.name;
}
