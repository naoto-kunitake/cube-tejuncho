import type { MouseEvent } from 'react';

import { copy } from '@/copy';
import { cn } from '@/lib/utils';

import { ACTION_KEYS, type ActionKey, CHARACTER_KEYS, type KeypadKey } from '../keypad';

type AlgKeypadProps = {
  onKey: (key: KeypadKey) => void;
};

// キーの地色はトークン (文字キーと操作キーでライトとダークの段が違う。tokens.cssを参照)。
// 削除は文字の段の右端 (iOSのキーボードと同じ位置)、全消去とキーボードは最下段を半分ずつ
const KEY_CLASS =
  'h-11 rounded-sm border border-line font-mono text-alg-compact font-semibold text-ink pressable active:bg-press';
const CHARACTER_KEY_CLASS = cn(KEY_CLASS, 'bg-key-character hover:bg-key-character-hover');
const ACTION_KEY_CLASS = cn(KEY_CLASS, 'bg-key-action font-sans text-small font-medium hover:bg-key-action-hover');

const ACTION_LABELS: Record<ActionKey, string> = {
  backspace: copy.keypad.backspace,
  clear: copy.keypad.clear,
  keyboard: copy.keypad.keyboard,
};

// キーを押しても欄から焦点を奪わない (mousedownの既定の動きを止める)。欄の選択範囲にそのまま効く
function keepFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

// 手順の欄の下に出る専用キーパッド。Tabでは辿らない (キーボードを持つ人は普通に打てる)
export function AlgKeypad({ onKey }: AlgKeypadProps) {
  return (
    <div
      role="group"
      aria-label={copy.a11y.keypad}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface-2 px-4 pt-2 pb-4 shadow-4 md:inset-x-auto md:left-1/2 md:w-full md:max-w-140 md:-translate-x-1/2"
    >
      <div className="grid grid-cols-6 gap-2">
        {CHARACTER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            className={CHARACTER_KEY_CLASS}
            onClick={() => {
              onKey(key);
            }}
          >
            {key}
          </button>
        ))}
        {ACTION_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            tabIndex={-1}
            onMouseDown={keepFocus}
            className={cn(ACTION_KEY_CLASS, key === 'backspace' ? 'col-span-1' : 'col-span-3')}
            onClick={() => {
              onKey(key);
            }}
          >
            {ACTION_LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
