import { type RefObject, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { applyEdit, clearingFor, deletionFor, insertionFor, type KeypadKey, type TextEdit } from '../lib/keypad';

// 手順の欄のinput要素。焦点の制御も同じ表を見るので、画面側のrefを借りる
type AlgInputs = RefObject<Map<number, HTMLInputElement>>;

// 手順の入力に出す専用キーパッドの状態と操作
export function useAlgKeypad(inputsRef: AlgInputs) {
  // キーパッドが効く手順の欄。欄を離れたら閉じる。「キーボード」で端末のキーボードに切り替えたら、その欄を離れるまで出さない
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);
  const isSwitchingKeyboardRef = useRef(false);

  const activeInput = () => (activeIndex === null ? undefined : inputsRef.current.get(activeIndex));

  // 欄の値と選択範囲を直接書き換えてinputイベントを投げる。Reactが値を入れ直さないので、カーソルの位置が保てる
  const editActiveInput = (edit: (value: string, start: number, end: number) => TextEdit) => {
    const input = activeInput();
    if (input === undefined) {
      return;
    }
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = applyEdit(input.value, edit(input.value, start, end));
    input.setRangeText(next.value, 0, input.value.length, 'preserve');
    input.setSelectionRange(next.caret, next.caret);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const switchToNativeKeyboard = () => {
    const input = activeInput();
    if (input === undefined) {
      return;
    }
    // 焦点のある欄のinputModeを外しただけでは端末のキーボードは開かない。属性を先に反映させてから焦点を入れ直す。
    // iOSは利用者の操作の中でしかキーボードを開かないので、後回しにせず同じ押下の中で行う
    isSwitchingKeyboardRef.current = true;
    flushSync(() => {
      setUsesNativeKeyboard(true);
    });
    input.blur();
    input.focus();
    isSwitchingKeyboardRef.current = false;
  };

  const pressKey = (key: KeypadKey) => {
    if (key === 'keyboard') {
      switchToNativeKeyboard();
      return;
    }
    if (key === 'done') {
      // 欄を離れれば閉じる (閉じる処理はblurに一本化し、ここで状態を触らない)
      activeInput()?.blur();
      return;
    }
    if (key === 'backspace') {
      editActiveInput((_value, start, end) => deletionFor(start, end));
      return;
    }
    if (key === 'clear') {
      editActiveInput((value) => clearingFor(value));
      return;
    }
    editActiveInput((value, start, end) => insertionFor(value, start, end, key));
  };

  return {
    // キーパッドを出すか。端末のキーボードに切り替えている間は出さない
    isOpen: activeIndex !== null && !usesNativeKeyboard,
    activeIndex,
    // 手順の欄がキーパッドで打つ状態か (端末のキーボードを抑える)
    usesKeypad: !usesNativeKeyboard,
    pressKey,
    openAt: (index: number) => {
      setActiveIndex(index);
    },
    // 欄を離れたときに呼ぶ。falseを返したらキーボードの切り替えで焦点を入れ直す間なので、離れていない扱い
    closeOnBlur: () => {
      if (isSwitchingKeyboardRef.current) {
        return false;
      }
      setActiveIndex(null);
      setUsesNativeKeyboard(false);
      return true;
    },
  };
}
