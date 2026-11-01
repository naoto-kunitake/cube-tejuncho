import { useEffect, useRef, useState } from 'react';

import type { ToastAction } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import type { DraftData, DraftStore } from '@/data/draft';

import { type EditForm, entriesOf, formSnapshot } from '../edit-state';

// 入力のたびに書く下書きは300msまとめる (打鍵ごとにlocalStorageへ書かない)
const DRAFT_DEBOUNCE_MS = 300;

type UseFormDraftArgs = {
  draftStore: DraftStore;
  // 下書きの鍵 (パターンごと)
  draftId: string;
  // 保存済みの内容から作ったフォーム。下書きがないときの初期値で、変更の有無もこれと比べる
  savedForm: EditForm;
  // 下書きから初期値を組む (名前とカテゴリの扱いが自作かどうかで変わる)
  formFromDraft: (draft: DraftData) => EditForm;
  showOwnToast: (text: string, action?: ToastAction) => void;
};

// 編集中のフォームと、その書きかけの保存。開いた時点の下書きを復元して知らせ、変更を間引いて書き、変更がなければ消す
export function useFormDraft({ draftStore, draftId, savedForm, formFromDraft, showOwnToast }: UseFormDraftArgs) {
  // 開いた時点の下書きと保存済みの内容だけを見る。描画ごとに作り直される値を知らせの中で使わないよう、
  // 「破棄」で戻す先もここに閉じ込める
  const [initial] = useState(() => {
    const draft = draftStore.read(draftId);
    return { form: draft === null ? savedForm : formFromDraft(draft), savedForm, isRestored: draft !== null };
  });
  const [form, setForm] = useState<EditForm>(initial.form);
  const hasShownRestoreRef = useRef(false);
  const isDirty = formSnapshot(form) !== formSnapshot(savedForm);

  useEffect(() => {
    // 復元したことは黙らせない。知らせは開いたときの1回だけで、依存の値が作り直されても出し直さない
    if (!initial.isRestored || hasShownRestoreRef.current) {
      return;
    }
    hasShownRestoreRef.current = true;
    showOwnToast(copy.edit.restoredDraft, {
      label: copy.edit.discard,
      run: () => {
        draftStore.remove(draftId);
        setForm(initial.savedForm);
      },
    });
  }, [initial, showOwnToast, draftStore, draftId]);

  useEffect(() => {
    if (!isDirty) {
      draftStore.remove(draftId);
      return;
    }
    const timer = setTimeout(() => {
      draftStore.write(draftId, {
        name: form.name,
        categoryId: form.categoryId,
        recognition: form.recognition,
        cards: entriesOf(form.cards),
      });
    }, DRAFT_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [form, isDirty, draftId, draftStore]);

  return {
    form,
    setForm,
    isDirty,
    // 保存と破棄のあとに消す
    remove: () => {
      draftStore.remove(draftId);
    },
  };
}
