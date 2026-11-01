import { create } from 'zustand';

export const TOAST_DURATION_MS = 6000;

export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; text: string; action: ToastAction | null };

type ToastStore = {
  toast: Toast | null;
  // 出した知らせのidを返す (出した側が自分の知らせだけを消せるように)
  show: (text: string, action?: ToastAction) => number;
  dismiss: () => void;
  // 読んでいる間と「元に戻す」に向かっている間は消さない
  pause: () => void;
  resume: () => void;
};

// 画面をまたいで出す知らせ (削除して一覧に戻った直後など)。文書には入れないので別の小さなストア。
// 同時に1つだけ。6秒で消え、消えたら取り消せない
export const useToastStore = create<ToastStore>()((set, get) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let nextId = 0;
  const startTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      get().dismiss();
    }, TOAST_DURATION_MS);
  };
  return {
    toast: null,
    show: (text, action) => {
      nextId += 1;
      set({ toast: { id: nextId, text, action: action ?? null } });
      startTimer();
      return nextId;
    },
    dismiss: () => {
      clearTimeout(timer);
      set({ toast: null });
    },
    // 指やポインタが乗っている間、焦点が中にある間は止める。「元に戻す」に手が届く前に消えないように
    pause: () => {
      clearTimeout(timer);
    },
    // 離れたら最初から測り直す (残り1秒で離れて即消えると、読み返す間がない)
    resume: () => {
      if (get().toast !== null) {
        startTimer();
      }
    },
  };
});
