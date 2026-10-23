import { cn } from '@/lib/utils';

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

// 即時に効く on / off (44 × 24、押せる範囲は疑似要素で上下に広げて 44)。オンはテーマ色、オフは gray-420 のトラック。
// ツマミはダークでオンのときだけ on-accent にする (白いテーマ色に沈まないように。モックで決めた)
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'relative h-6 w-11 flex-none rounded-full pressable before:absolute before:inset-x-0 before:-inset-y-2.5 before:rounded-full',
        checked ? 'bg-accent' : 'bg-switch-track',
      )}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-1 transition-transform duration-150 motion-reduce:transition-none',
          checked && 'translate-x-5 dark:bg-on-accent',
        )}
      />
    </button>
  );
}
