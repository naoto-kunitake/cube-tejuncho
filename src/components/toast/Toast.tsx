import { useRef } from 'react';

import { TEXT_PILL_TAP_AREA_CLASS } from '@/components/tap-area';
import { cn } from '@/lib/utils';

import { useToastStore } from './toast-store';

// 画面の下に出る知らせ。反転色の帯 + 右に取り消しの文字ボタン。読み上げはstatus (操作を遮らない)。
// 指や焦点が乗っている間は消えない (6秒では「元に戻す」に届かないことがある)
export function Toast() {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const pause = useToastStore((state) => state.pause);
  const resume = useToastStore((state) => state.resume);
  const action = toast?.action ?? null;
  // マウスと焦点は別々に出入りする。片方が残っている間に測り直さないよう、両方を覚えておく
  const isHovering = useRef(false);
  const isFocused = useRef(false);
  const resumeIfLeft = () => {
    if (!isHovering.current && !isFocused.current) {
      resume();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-safe-4 z-10 md:inset-x-0 md:mx-auto md:max-w-132"
    >
      {toast !== null && (
        <div
          className="flex items-center gap-2 rounded-lg bg-inverse py-2.5 pr-2 pl-4 text-small text-on-inverse shadow-4"
          onMouseEnter={() => {
            isHovering.current = true;
            pause();
          }}
          onMouseLeave={() => {
            isHovering.current = false;
            resumeIfLeft();
          }}
          onFocus={() => {
            isFocused.current = true;
            pause();
          }}
          onBlur={() => {
            isFocused.current = false;
            resumeIfLeft();
          }}
        >
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
