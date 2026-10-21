import { create } from 'zustand';

export const TOAST_DURATION_MS = 6000;

export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; text: string; action: ToastAction | null };

type ToastStore = {
  toast: Toast | null;
  // 出した知らせの id を返す (出した側が自分の知らせだけを消せるように)
  show: (text: string, action?: ToastAction) => number;
  dismiss: () => void;
};

// 画面をまたいで出す知らせ (削除して一覧に戻った直後など)。文書には入れないので別の小さなストア。
// 同時に 1 つだけ。6 秒で消え、消えたら取り消せない
export const useToastStore = create<ToastStore>()((set, get) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let nextId = 0;
  return {
    toast: null,
    show: (text, action) => {
      clearTimeout(timer);
      nextId += 1;
      set({ toast: { id: nextId, text, action: action ?? null } });
      timer = setTimeout(() => {
        get().dismiss();
      }, TOAST_DURATION_MS);
      return nextId;
    },
    dismiss: () => {
      clearTimeout(timer);
      set({ toast: null });
    },
  };
});
