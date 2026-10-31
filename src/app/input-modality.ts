export type InputModality = 'keyboard' | 'pointer';

const ATTRIBUTE = 'data-input-modality';

// 直前の操作がキーボードかポインタ (マウス・タッチ) かをhtmlに印として持つ。
// 文字入力欄はクリックで入っても:focus-visibleになるので、輪の見た目をこの印で分ける (CSS側で参照)
export function trackInputModality(target: Document): () => void {
  const root = target.documentElement;
  const setModality = (modality: InputModality) => {
    root.setAttribute(ATTRIBUTE, modality);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    // 文字の打鍵は欄の中の操作なので、移動の鍵だけをキーボード操作とみなす
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
      setModality('keyboard');
    }
  };
  const onPointerDown = () => {
    setModality('pointer');
  };
  target.addEventListener('keydown', onKeyDown, true);
  target.addEventListener('pointerdown', onPointerDown, true);
  return () => {
    target.removeEventListener('keydown', onKeyDown, true);
    target.removeEventListener('pointerdown', onPointerDown, true);
    root.removeAttribute(ATTRIBUTE);
  };
}
