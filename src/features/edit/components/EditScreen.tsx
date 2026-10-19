import { copy } from '@/copy';

export function EditScreen() {
  return (
    <main className="px-4 py-6">
      <h1 className="text-title font-bold text-ink-strong">{copy.edit.title}</h1>
    </main>
  );
}
