import { Button } from '@/components/Button';
import { copy } from '@/copy';

type FirstRunBannerProps = {
  onDismiss: () => void;
  onRegisterAll: () => void;
};

// 登録が 0 件のプリセットのタブに出す案内 (Material のバナーの型: 本文 + 右下に文字ボタン 2 つ)。
// 画面全体が空なのではなくタイルの上に出る文脈つきの案内なので、中央に大きく置く空状態の型は使わない
export function FirstRunBanner({ onDismiss, onRegisterAll }: FirstRunBannerProps) {
  return (
    <section
      aria-label={copy.a11y.firstRun}
      className="flex flex-col gap-2 rounded-md border border-line bg-surface pt-3 pr-2 pb-2 pl-4"
    >
      <p className="text-small leading-normal text-ink">
        {copy.list.emptyTitle}
        <br />
        {copy.list.emptyHint}
      </p>
      <div className="flex justify-end gap-1">
        <Button variant="textMuted" onClick={onDismiss}>
          {copy.list.dismissBanner}
        </Button>
        <Button variant="text" className="font-bold" onClick={onRegisterAll}>
          {copy.list.registerAll}
        </Button>
      </div>
    </section>
  );
}
