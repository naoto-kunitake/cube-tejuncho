import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const SETTING_ROW_CLASS =
  'flex min-h-13 w-full items-center justify-between gap-3 border-t border-line px-4 text-left text-body text-ink first:border-t-0';
// 押せる行 (書き出す / 読み込む / カテゴリを追加)
export const ROW_BUTTON_CLASS = cn(SETTING_ROW_CLASS, 'pressable hover:bg-hover active:bg-press');

type SettingRowProps = {
  label: string;
  // 選択肢が長い行 (セグメント) は、狭い幅で選択肢を下の行に右寄せで落とす
  wrapsOnNarrow?: boolean;
  children: ReactNode;
};

// 見出し + 操作部品 (セグメント / スイッチ) の1行。行の高さ52、折り返す行は上下12
export function SettingRow({ label, wrapsOnNarrow = false, children }: SettingRowProps) {
  return (
    <div className={cn(SETTING_ROW_CLASS, wrapsOnNarrow && 'max-xs:flex-wrap max-xs:py-3')}>
      {/* 操作部品 (セグメント / スイッチ) が同じ文言を読み上げ名に持つので、見出しは見た目だけにして二重に読ませない */}
      <span aria-hidden="true" className="flex-none whitespace-nowrap">
        {label}
      </span>
      <span className="ml-auto inline-flex">{children}</span>
    </div>
  );
}
