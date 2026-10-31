import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Field, INPUT_CLASS, TextArea } from '@/components/Field';
import { PresetFigure } from '@/components/figures/PresetFigure';
import { TopFigure } from '@/components/figures/TopFigure';
import { IconButton } from '@/components/IconButton';
import { useToastStore } from '@/components/toast/toast-store';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import type { AlgEntry, Category, Registration, Settings } from '@/data/document';
import { type DraftStore, draftStore as defaultDraftStore } from '@/data/draft';
import type { PatternRef } from '@/data/patterns';
import type { Preset } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { describeSides } from '@/lib/figure/describe';
import { describeF2l } from '@/lib/figure/describe-f2l';
import { cueView, recolorView } from '@/lib/figure/view';
import { cn } from '@/lib/utils';

import {
  type EditCard,
  type EditForm as EditFormValue,
  EMPTY_CARD,
  entriesOf,
  formFrom,
  formFromEntries,
  formSnapshot,
  hasInvalidCard,
  insertCard,
  isCardEmpty,
  moveCardToFront,
  newCard,
  registrationDataFrom,
  removeCard,
  standardAlgToAdd,
} from '../edit-state';
import { applyEdit, clearingFor, deletionFor, insertionFor, type KeypadKey, type TextEdit } from '../keypad';
import { AlgEditCard } from './AlgEditCard';
import { AlgKeypad } from './AlgKeypad';

// 入力のたびに書く下書きは300msまとめる (打鍵ごとにlocalStorageへ書かない)
const DRAFT_DEBOUNCE_MS = 300;
// 新規の下書きはパターンのidがまだないので固定の鍵
const NEW_DRAFT_ID = 'new';

export type FocusTarget = { kind: 'recognition' } | { kind: 'alg'; index: number };
// 編集の対象: プリセット (名前とカテゴリは固定) / 自作 (名前とカテゴリも編集、削除あり) / 新規の自作
export type EditTarget = PatternRef | { kind: 'new'; categoryId: string };

type EditFormProps = {
  target: EditTarget;
  registration: Registration | undefined;
  categories: readonly Category[];
  settings: Settings;
  initialFocus: FocusTarget | null;
  draftStore?: DraftStore;
};

type PendingDelete = { index: number; card: EditCard };

const ADD_ROW_CLASS =
  'flex min-h-11 w-full items-center gap-2 rounded-md border border-dashed border-line-state bg-surface px-3.5 text-left text-body font-medium text-muted pressable hover:border-line-strong hover:bg-hover';

function fieldsOf(target: EditTarget) {
  switch (target.kind) {
    case 'preset':
      return { name: '', categoryId: '' };
    case 'custom':
      return { name: target.pattern.name, categoryId: target.pattern.categoryId };
    case 'new':
      return { name: '', categoryId: target.categoryId };
  }
}

function draftIdOf(target: EditTarget): string {
  switch (target.kind) {
    case 'preset':
      return target.preset.id;
    case 'custom':
      return target.pattern.id;
    case 'new':
      return NEW_DRAFT_ID;
  }
}

type EditFigureProps = {
  preset: Preset;
  settings: Settings;
};

// 図は詳細と同じ大きさ・位置 (上端をカードの中の図に揃えて17下げる)。判断を書くときの参考に全色と手がかりを並べる。
// 手がかりはPLLだけ
function EditFigure({ preset, settings }: EditFigureProps) {
  if (preset.category === 'pll' && settings.showCueFigure) {
    return (
      <div className="flex w-full justify-center gap-6 pt-4.25">
        <div className="-m-1.75 w-38 flex-none">
          <PresetFigure preset={preset} settings={settings} canShowArrows />
        </div>
        <div className="-m-1.75 w-38 flex-none">
          <TopFigure view={cueView(recolorView(preset.view, settings))} label={copy.a11y.cueFigure(preset.name)} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center pt-4.25">
      <div className="-my-2.75 w-full max-w-60">
        <PresetFigure preset={preset} settings={settings} canShowArrows />
      </div>
    </div>
  );
}

export function EditForm({
  target,
  registration,
  categories,
  settings,
  initialFocus,
  draftStore = defaultDraftStore,
}: EditFormProps) {
  const navigate = useNavigate();
  const saveRegistration = useDocumentStore((state) => state.saveRegistration);
  const removeRegistration = useDocumentStore((state) => state.removeRegistration);
  const addCustomPattern = useDocumentStore((state) => state.addCustomPattern);
  const updateCustomPattern = useDocumentStore((state) => state.updateCustomPattern);
  const removeCustomPattern = useDocumentStore((state) => state.removeCustomPattern);
  const replaceDocument = useDocumentStore((state) => state.replaceDocument);
  const showToast = useToastStore((state) => state.show);
  const dismissToast = useToastStore((state) => state.dismiss);
  const draftId = draftIdOf(target);
  const isCustom = target.kind !== 'preset';
  const fields = fieldsOf(target);
  const saved = formFrom(registration, fields);
  const baseSnapshot = formSnapshot(saved);
  // 書きかけがあれば復元して知らせる (黙って上書きしない)
  const [initial] = useState(() => {
    const draft = draftStore.read(draftId);
    return draft === null
      ? { form: saved, isRestored: false }
      : {
          form: formFromEntries(
            isCustom ? { name: draft.name, categoryId: draft.categoryId || fields.categoryId } : fields,
            draft.recognition,
            draft.cards,
          ),
          isRestored: true,
        };
  });
  const [form, setForm] = useState<EditFormValue>(initial.form);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(initialFocus);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDeletingPattern, setIsDeletingPattern] = useState(false);
  // キーパッドが効く手順の欄。欄を離れたら閉じる。「キーボード」で端末のキーボードに切り替えたら、その欄を離れるまで出さない
  const [keypadIndex, setKeypadIndex] = useState<number | null>(null);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);
  const isSwitchingKeyboardRef = useRef(false);
  const inputsRef = useRef(new Map<number, HTMLInputElement>());
  // この画面が出した知らせ (復元、手順の削除) は、画面を離れたら消す (取り消しの先がもうない)
  const ownToastRef = useRef<number | null>(null);
  const recognitionRef = useRef<HTMLTextAreaElement>(null);
  const isDirty = formSnapshot(form) !== baseSnapshot;
  // 自作は名前が必須
  const canSave = !hasInvalidCard(form) && (!isCustom || form.name.trim() !== '');
  const standardAlg = target.kind === 'preset' ? standardAlgToAdd(form, target.preset.standardAlg) : null;
  // 判断の文章の手がかり: PLLは側面の揃い方、F2Lはパーツの位置と白の向き (OLLは上面の向きで見分けるので出さない)
  const recognitionExamplesOf = (preset: Preset): string[] | null => {
    switch (preset.category) {
      case 'pll': {
        const runs = describeSides(preset.view).map((entry) => copy.edit.sideRun(entry.side, entry.run));
        return runs.length > 0 ? runs : [copy.edit.noRuns];
      }
      case 'f2l': {
        const cross = copy.list.crossColor[settings.topColor];
        const shapeLabel = copy.list.f2lShapes[preset.shape](cross);
        return [copy.edit.f2lRecognition(describeF2l(preset.view, preset.pair), cross, shapeLabel)];
      }
      case 'oll':
        return null;
    }
  };
  const recognitionExamples = target.kind === 'preset' ? recognitionExamplesOf(target.preset) : null;
  const recognitionHint = recognitionExamples === null ? undefined : copy.edit.recognitionHint(recognitionExamples);
  const title = target.kind === 'new' ? copy.edit.newTitle : copy.edit.title(fields.name || presetName(target));
  // 閉じた先: 既存は詳細、新規はそのカテゴリの一覧
  const backPath = target.kind === 'new' ? `/?category=${target.categoryId}` : `/p/${draftId}`;

  useEffect(() => {
    if (!initial.isRestored) {
      return;
    }
    ownToastRef.current = showToast(copy.edit.restoredDraft, {
      label: copy.edit.discard,
      run: () => {
        draftStore.remove(draftId);
        setForm(formFrom(registration, fields));
      },
    });
    // fieldsはtargetから毎回作られるので、targetを依存に置く
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.isRestored, showToast, draftStore, draftId, registration, target]);

  useEffect(() => {
    return () => {
      if (ownToastRef.current !== null && useToastStore.getState().toast?.id === ownToastRef.current) {
        dismissToast();
      }
    };
  }, [dismissToast]);

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

  useEffect(() => {
    if (focusTarget === null) {
      return;
    }
    const element =
      focusTarget.kind === 'recognition' ? recognitionRef.current : inputsRef.current.get(focusTarget.index);
    element?.focus();
  }, [focusTarget]);

  const updateCard = (index: number, card: EditCard) => {
    setForm((current) => ({ ...current, cards: current.cards.map((entry, i) => (i === index ? card : entry)) }));
  };

  const addCard = (entry: AlgEntry) => {
    setForm((current) => ({ ...current, cards: [...current.cards, newCard(entry)] }));
    setFocusTarget({ kind: 'alg', index: form.cards.length });
  };

  const deleteCard = (index: number, card: EditCard) => {
    setPendingDelete(null);
    setFocusTarget(null);
    setForm((current) => ({ ...current, cards: removeCard(current.cards, index) }));
    ownToastRef.current = showToast(copy.edit.deletedAlg, {
      label: copy.toast.undo,
      run: () => {
        setForm((current) => ({ ...current, cards: insertCard(current.cards, index, card) }));
      },
    });
  };

  // 欄の値と選択範囲を直接書き換えてinputイベントを投げる。Reactが値を入れ直さないので、カーソルの位置が保てる
  const editActiveInput = (edit: (value: string, start: number, end: number) => TextEdit) => {
    if (keypadIndex === null) {
      return;
    }
    const input = inputsRef.current.get(keypadIndex);
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

  const pressKey = (key: KeypadKey) => {
    if (key === 'keyboard') {
      const input = keypadIndex === null ? undefined : inputsRef.current.get(keypadIndex);
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
    } else if (key === 'backspace') {
      editActiveInput((_value, start, end) => deletionFor(start, end));
    } else if (key === 'clear') {
      editActiveInput((value) => clearingFor(value));
    } else {
      editActiveInput((value, start, end) => insertionFor(value, start, end, key));
    }
  };

  const close = (path = backPath) => {
    draftStore.remove(draftId);
    void navigate(path, { replace: true });
  };

  const save = () => {
    const data = registrationDataFrom(form);
    const patternFields = { name: form.name.trim(), categoryId: form.categoryId };
    if (target.kind === 'new') {
      const id = addCustomPattern(patternFields, data);
      close(`/p/${id}`);
      return;
    }
    if (target.kind === 'custom') {
      updateCustomPattern(target.pattern.id, patternFields);
    }
    if (data !== null) {
      saveRegistration(draftId, data);
      close();
      return;
    }
    removeRegistration(draftId);
    close();
    // プリセットで全部消して保存 = 登録を消す。確認は挟まず、詳細に戻ってから取り消せるようにする (自作はパターンが残るので知らせない)
    if (target.kind === 'preset' && registration !== undefined) {
      const { recognition, mainAlg, altAlgs } = registration;
      showToast(copy.edit.removedRegistration(target.preset.name), {
        label: copy.toast.undo,
        run: () => {
          saveRegistration(draftId, { recognition, mainAlg, altAlgs });
        },
      });
    }
  };

  // 自作の削除: 確認のうえ一覧に戻り、文書を丸ごと戻す「元に戻す」を出す
  const deletePattern = () => {
    if (target.kind !== 'custom') {
      return;
    }
    const before = useDocumentStore.getState().document;
    const { id, name, categoryId } = target.pattern;
    setIsDeletingPattern(false);
    removeCustomPattern(id);
    close(`/?category=${categoryId}`);
    showToast(copy.edit.deletedPattern(name), {
      label: copy.toast.undo,
      run: () => {
        replaceDocument(before);
      },
    });
  };

  return (
    <>
      <TopBar>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconButton
            label={copy.a11y.closeEdit}
            className="-ml-1.75"
            onClick={() => {
              if (isDirty) {
                setIsDiscarding(true);
              } else {
                close();
              }
            }}
          >
            <X size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">{title}</h1>
        </div>
        <Button variant="primary" className="mr-1.75 px-3.5" disabled={!canSave} onClick={save}>
          {copy.edit.save}
        </Button>
      </TopBar>
      {/* キーパッドが出ている間は、欄がその裏に隠れないよう下に余白を足す */}
      <div className={cn('flex flex-col gap-6 px-4 pt-2 pb-6', keypadIndex !== null && !usesNativeKeyboard && 'pb-60')}>
        {target.kind === 'preset' && <EditFigure preset={target.preset} settings={settings} />}
        {/* 名前とカテゴリはプリセットでは図と結び付いた固定値なので自作のときだけ編集できる */}
        {isCustom && (
          <>
            <Field id="pattern-name" label={copy.edit.name}>
              <input
                id="pattern-name"
                value={form.name}
                autoComplete="off"
                className={cn(INPUT_CLASS, 'h-11 px-3')}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }));
                }}
              />
            </Field>
            <Field id="pattern-category" label={copy.edit.category}>
              <select
                id="pattern-category"
                value={form.categoryId}
                className={cn(INPUT_CLASS, 'h-11 px-3')}
                onChange={(event) => {
                  setForm((current) => ({ ...current, categoryId: event.target.value }));
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <Field id="recognition" label={copy.edit.recognition}>
          <TextArea
            ref={recognitionRef}
            id="recognition"
            value={form.recognition}
            placeholder={recognitionHint}
            onChange={(event) => {
              setForm((current) => ({ ...current, recognition: event.target.value }));
            }}
          />
        </Field>
        <div className="flex flex-col gap-2">
          {form.cards.map((card, index) => (
            <AlgEditCard
              key={card.id}
              index={index}
              card={card}
              inputRef={(element) => {
                if (element === null) {
                  inputsRef.current.delete(index);
                } else {
                  inputsRef.current.set(index, element);
                }
              }}
              usesKeypad={!usesNativeKeyboard}
              onChange={(next) => {
                updateCard(index, next);
              }}
              onFocus={() => {
                setKeypadIndex(index);
              }}
              onBlur={() => {
                if (isSwitchingKeyboardRef.current) {
                  return false;
                }
                setKeypadIndex(null);
                setUsesNativeKeyboard(false);
                return true;
              }}
              onMakeMain={() => {
                setForm((current) => ({ ...current, cards: moveCardToFront(current.cards, index) }));
              }}
              onDelete={() => {
                // 空のカードはそのまま消す。中身があれば確認 + 取り消し
                if (isCardEmpty(card)) {
                  setForm((current) => ({ ...current, cards: removeCard(current.cards, index) }));
                } else {
                  setPendingDelete({ index, card });
                }
              }}
            />
          ))}
          <button
            type="button"
            className={ADD_ROW_CLASS}
            onClick={() => {
              addCard(EMPTY_CARD);
            }}
          >
            <Plus size={20} strokeWidth={1.8} aria-hidden="true" className="-ml-0.5 flex-none" />
            {copy.edit.addAlg}
          </button>
          {standardAlg !== null && (
            <button
              type="button"
              className={cn(ADD_ROW_CLASS, 'min-h-14 py-2')}
              onClick={() => {
                addCard({ ...EMPTY_CARD, text: standardAlg });
              }}
            >
              <Plus size={20} strokeWidth={1.8} aria-hidden="true" className="-ml-0.5 flex-none" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span>{copy.edit.addStandardAlg}</span>
                <span className="block truncate font-mono text-label font-normal text-muted">{standardAlg}</span>
              </span>
            </button>
          )}
        </div>
        {target.kind === 'custom' && (
          <div className="-ml-3 flex border-t border-line pt-2">
            <Button
              variant="textDanger"
              onClick={() => {
                setIsDeletingPattern(true);
              }}
            >
              {copy.edit.deletePattern}
            </Button>
          </div>
        )}
      </div>
      {keypadIndex !== null && !usesNativeKeyboard && <AlgKeypad onKey={pressKey} />}
      {pendingDelete !== null && (
        <ConfirmDialog
          title={
            pendingDelete.index === 0
              ? copy.edit.deleteMainAlgTitle
              : copy.edit.deleteAltAlgTitle(pendingDelete.index + 1)
          }
          actionLabel={copy.edit.deleteAlg}
          onConfirm={() => {
            deleteCard(pendingDelete.index, pendingDelete.card);
          }}
          onCancel={() => {
            setPendingDelete(null);
          }}
        />
      )}
      {isDiscarding && (
        <ConfirmDialog
          title={copy.edit.discardTitle}
          actionLabel={copy.edit.discard}
          onConfirm={() => {
            close();
          }}
          onCancel={() => {
            setIsDiscarding(false);
          }}
        />
      )}
      {isDeletingPattern && target.kind === 'custom' && (
        <ConfirmDialog
          title={copy.edit.deletePatternTitle(target.pattern.name)}
          actionLabel={copy.edit.deletePatternAction}
          onConfirm={deletePattern}
          onCancel={() => {
            setIsDeletingPattern(false);
          }}
        />
      )}
    </>
  );
}

function presetName(target: EditTarget): string {
  return target.kind === 'preset' ? target.preset.name : '';
}
