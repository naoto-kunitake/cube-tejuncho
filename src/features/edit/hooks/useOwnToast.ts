import { useEffect, useRef } from 'react';

import { type ToastAction, useToastStore } from '@/components/toast/toast-store';

// この画面が出した知らせを、画面を離れたときに消す (取り消しの先がもうない)。
// 画面を離れた先で読ませたい知らせ (登録を消した、パターンを消した) はストアのshowを直に使う
export function useOwnToast() {
  const show = useToastStore((state) => state.show);
  const dismiss = useToastStore((state) => state.dismiss);
  const ownIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (ownIdRef.current !== null && useToastStore.getState().toast?.id === ownIdRef.current) {
        dismiss();
      }
    };
  }, [dismiss]);

  return (text: string, action?: ToastAction) => {
    ownIdRef.current = show(text, action);
  };
}
