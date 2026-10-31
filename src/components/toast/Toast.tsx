import { TEXT_PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { cn } from '@/lib/utils';

import { useToastStore } from './toast-store';

// 画面の下に出る知らせ。反転色の帯 + 右に取り消しの文字ボタン。読み上げはstatus (操作を遮らない)
export function Toast() {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const action = toast?.action ?? null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-10 md:inset-x-0 md:mx-auto md:max-w-132"
    >
      {toast !== null && (
        <div className="flex items-center gap-2 rounded-lg bg-inverse py-2.5 pr-2 pl-4 text-small text-on-inverse shadow-4">
          <span className="min-w-0 flex-1 truncate">{toast.text}</span>
          {action !== null && (
            <button
              type="button"
              className={cn(
                TEXT_PILL_TAP_AREA_CLASS,
                'min-h-9 rounded-full px-3 font-bold pressable hover:bg-on-inverse/15',
              )}
              onClick={() => {
                dismiss();
                action.run();
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
