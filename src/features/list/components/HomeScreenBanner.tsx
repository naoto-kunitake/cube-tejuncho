import { Button } from '@/components/Button';
import { copy } from '@/copy';

type HomeScreenBannerProps = {
  onDismiss: () => void;
};

// iOSでまだホーム画面に追加していないときに一度だけ出す案内 (初回の案内と同じバナーの型)。
// 追加の操作は共有シートから行うので、ここには行動のボタンを置かず閉じるだけ
export function HomeScreenBanner({ onDismiss }: HomeScreenBannerProps) {
  return (
    <section
      aria-label={copy.a11y.homeScreenHint}
      className="flex flex-col gap-2 rounded-md border border-line bg-surface pt-3 pr-2 pb-2 pl-4"
    >
      <p className="text-small leading-normal text-ink">
        {copy.list.homeScreenTitle}
        <br />
        <span className="text-muted">{copy.list.homeScreenHint}</span>
      </p>
      <div className="flex justify-end">
        <Button variant="textMuted" onClick={onDismiss}>
          {copy.list.dismissBanner}
        </Button>
      </div>
    </section>
  );
}
