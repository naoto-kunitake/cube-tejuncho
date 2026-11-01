import { type RefObject, useEffect, useRef } from 'react';

// nativeのdialogをモーダルで開き、閉じたら開く前の要素へ焦点を戻す。
// × や中のボタンで閉じるときは親が器ごと外すだけでclose()を通らず、標準の「焦点を戻す」が働かない。
// 焦点がbodyに落ちると、キーボードと読み上げの利用者は画面の先頭からやり直しになる。
// focusRefは開いたときの焦点の行き先 (渡さなければ器。showModalは中の最初の押せる要素に移してしまう)
export function useModalDialog(focusRef?: RefObject<HTMLElement | null>): RefObject<HTMLDialogElement | null> {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    const opener = document.activeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
    // 焦点は開く条件の外で移す。開発のStrictModeはeffectを2回走らせ、2回目は既に開いているので、
    // 中に入れ直さないと1回目のcleanupで戻した開く前の要素に焦点が残る
    (focusRef?.current ?? dialog).focus();
    return () => {
      // 開いた元が消えているとき (削除したカードの中のボタン) は戻せないので何もしない
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [focusRef]);

  return dialogRef;
}
