import { Check, Plus } from 'lucide-react';
import { useRef } from 'react';

import { copy } from '@/copy';
import { isHexColor, onColorOf } from '@/lib/theme/color';
import {
  CUSTOM_COLOR_DEFAULT,
  presetOf,
  THEME_PRESET_HEX,
  THEME_PRESET_IDS,
  type ThemeColor,
  type ThemePresetId,
} from '@/lib/theme/palette';
import { cn } from '@/lib/utils';

// 見本の塗りと選択の輪。墨は反転色 (ライトは墨、ダークは白) なのでinverseのトークン。
// チェックの色は自分で選ぶと同じくonColorOfで導く (手書きの表にするとpaletteと食い違う)
const SWATCH_CLASS: Record<ThemePresetId, { fill: string; ring: string }> = {
  ink: { fill: 'bg-inverse', ring: 'ring-inverse' },
  red: { fill: 'bg-theme-red', ring: 'ring-theme-red' },
  orange: { fill: 'bg-theme-orange', ring: 'ring-theme-orange' },
  yellow: { fill: 'bg-theme-yellow', ring: 'ring-theme-yellow' },
  green: { fill: 'bg-theme-green', ring: 'ring-theme-green' },
  teal: { fill: 'bg-theme-teal', ring: 'ring-theme-teal' },
  blue: { fill: 'bg-theme-blue', ring: 'ring-theme-blue' },
  purple: { fill: 'bg-theme-purple', ring: 'ring-theme-purple' },
  pink: { fill: 'bg-theme-pink', ring: 'ring-theme-pink' },
};

// 丸40、押せる範囲は疑似要素で44。選択は面の色で2px空けた同色の輪 + チェック (色だけに頼らない)
const SWATCH_CLASS_BASE =
  'relative grid size-10 place-items-center rounded-full pressable before:absolute before:-inset-0.5 before:rounded-full active:scale-96';
const SELECTED_RING_CLASS = 'ring-2 ring-offset-2 ring-offset-surface';
const HOVER_RING_CLASS = 'hover:ring-2 hover:ring-line-strong hover:ring-offset-2 hover:ring-offset-surface';

type ThemeColorPickerProps = {
  value: ThemeColor;
  onChange: (themeColor: ThemeColor) => void;
};

// テーマ色の見本 (墨 + 8色 + 自分で選ぶ)。自分で選ぶは端末のカラーピッカー (input type="color") を開く
export function ThemeColorPicker({ value, onChange }: ThemeColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preset = presetOf(value);
  const isCustom = preset === null;
  const customHex = isCustom && value !== 'ink' ? value : CUSTOM_COLOR_DEFAULT;
  return (
    <div
      role="radiogroup"
      aria-label={copy.settings.themeColor}
      className="grid grid-cols-5 justify-items-center gap-3"
    >
      {THEME_PRESET_IDS.map((id) => {
        const isSelected = preset === id;
        const checkColor = id === 'ink' ? undefined : onColorOf(THEME_PRESET_HEX[id]);
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={copy.settings.themeColors[id]}
            style={checkColor === undefined ? undefined : { color: checkColor }}
            className={cn(
              SWATCH_CLASS_BASE,
              SWATCH_CLASS[id].fill,
              id === 'ink' && 'text-on-inverse',
              isSelected ? cn(SELECTED_RING_CLASS, SWATCH_CLASS[id].ring) : HOVER_RING_CLASS,
            )}
            onClick={() => {
              onChange(id === 'ink' ? 'ink' : THEME_PRESET_HEX[id]);
            }}
          >
            <Check size={20} strokeWidth={2.4} aria-hidden="true" className={cn(!isSelected && 'opacity-0')} />
          </button>
        );
      })}
      <button
        type="button"
        role="radio"
        aria-checked={isCustom}
        aria-label={copy.settings.customColor}
        className={cn(
          SWATCH_CLASS_BASE,
          'bg-rainbow',
          isCustom ? cn(SELECTED_RING_CLASS, 'ring-accent') : HOVER_RING_CLASS,
        )}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {/* 選んだ色は利用者の任意の値なのでトークンにできず、ここだけインラインのstyle */}
        <span
          className="grid size-8 place-items-center rounded-full ring-2 ring-surface"
          style={isCustom ? { backgroundColor: customHex, color: onColorOf(customHex) } : undefined}
        >
          {isCustom ? (
            <Check size={20} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Plus size={20} strokeWidth={2.2} aria-hidden="true" className="text-white drop-shadow-sm" />
          )}
        </span>
      </button>
      {/* 端末のカラーピッカーを開くためだけの入力。選ぶ操作は上のradioが担うので読み上げからは外す */}
      <input
        ref={inputRef}
        type="color"
        value={customHex}
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute size-px opacity-0"
        onChange={(event) => {
          // type="color"の値は常に#rrggbbだが、型のために確かめる
          const hex = event.target.value;
          if (isHexColor(hex)) {
            onChange(hex);
          }
        }}
      />
    </div>
  );
}
