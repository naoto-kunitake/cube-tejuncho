import { useLocation, useParams } from 'react-router';

import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { findRegistration } from '@/data/document';
import { PLL_PRESETS } from '@/data/presets/pll';
import { useDocumentStore } from '@/data/store';

import { EditForm, type FocusTarget } from './EditForm';

// 詳細の空枠 (判断を書く / 自分で登録) から来たときは、その欄に焦点を当てる。履歴の state で受け取り URL には持たない
function focusTargetOf(state: unknown): FocusTarget | null {
  if (typeof state !== 'object' || state === null || !('focus' in state)) {
    return null;
  }
  if (state.focus === 'recognition') {
    return { kind: 'recognition' };
  }
  if (state.focus === 'alg') {
    return { kind: 'alg', index: 0 };
  }
  return null;
}

export function EditScreen() {
  const { id = '' } = useParams();
  const location = useLocation();
  const preset = PLL_PRESETS.find((entry) => entry.id === id);
  const settings = useDocumentStore((state) => state.document.settings);
  const registrations = useDocumentStore((state) => state.document.registrations);

  return (
    <section aria-label={copy.a11y.edit} className="mx-auto flex w-full max-w-140 flex-col">
      {preset === undefined ? (
        <TopBar>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {copy.detail.notFound}
          </h1>
        </TopBar>
      ) : (
        <EditForm
          key={preset.id}
          preset={preset}
          registration={findRegistration(registrations, preset.id)}
          settings={settings}
          initialFocus={focusTargetOf(location.state)}
        />
      )}
    </section>
  );
}
