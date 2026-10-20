import { copy } from '@/copy';

export function DetailScreen() {
  return (
    <main className="px-4 py-6">
      <h1 className="text-title font-bold text-ink-strong">{copy.detail.title}</h1>
    </main>
  );
}
