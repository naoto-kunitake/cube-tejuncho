import { useLocation, useParams, useSearchParams } from 'react-router';

import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { findRegistration } from '@/data/document';
import { findPattern } from '@/data/patterns';
import { useDocumentStore } from '@/data/store';

import { EditForm, type EditTarget, type FocusTarget } from './EditForm';

// 詳細の空枠 (判断を書く / 手順を登録) から来たときは、その欄に焦点を当てる。履歴のstateで受け取りURLには持たない
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
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const document = useDocumentStore((state) => state.document);
  const target = targetOf(id, searchParams.get('category'), document.patterns, document.categories);

  return (
    <section aria-label={copy.a11y.edit} className="mx-auto flex w-full max-w-140 flex-col">
      {target === undefined ? (
        <TopBar>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {copy.detail.notFound}
          </h1>
        </TopBar>
      ) : (
        <EditForm
          key={id ?? 'new'}
          target={target}
          registration={id === undefined ? undefined : findRegistration(document.registrations, id)}
          categories={document.categories}
          settings={document.settings}
          initialFocus={focusTargetOf(location.state)}
        />
      )}
    </section>
  );
}

// /p/newは新規 (カテゴリは検索パラメータ。なければ最初の利用者のカテゴリ)。それ以外はプリセットか自作の編集
function targetOf(
  id: string | undefined,
  categoryParam: string | null,
  patterns: Parameters<typeof findPattern>[0]['patterns'],
  categories: readonly { id: string }[],
): EditTarget | undefined {
  if (id === undefined) {
    const categoryId = categories.some((category) => category.id === categoryParam)
      ? categoryParam
      : (categories[0]?.id ?? null);
    return categoryId === null ? undefined : { kind: 'new', categoryId };
  }
  return findPattern({ patterns }, id);
}
