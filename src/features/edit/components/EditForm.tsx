import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Field, INPUT_CLASS, TextArea } from '@/components/Field';
import { PatternFigures } from '@/components/figures/PatternFigures';
import { IconButton } from '@/components/IconButton';
import { ScreenBody, ScreenHeader } from '@/components/Screen';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import type { AlgEntry, Category, Registration, Settings } from '@/data/document';
import { type DraftStore, draftStore as defaultDraftStore } from '@/data/draft';
import type { PatternRef } from '@/data/patterns';
import type { Preset } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { describeSides } from '@/lib/figure/describe';
import { describeF2l } from '@/lib/figure/describe-f2l';
import { cn } from '@/lib/utils';

import { useAlgKeypad } from '../hooks/useAlgKeypad';
import { useFormDraft } from '../hooks/useFormDraft';
import { useOwnToast } from '../hooks/useOwnToast';
import {
  type EditCard,
  EMPTY_CARD,
  formFrom,
  formFromEntries,
  hasInvalidCard,
  insertCard,
  isCardEmpty,
  moveCardToFront,
  newCard,
  registrationDataFrom,
  removeCard,
  standardAlgToAdd,
} from '../lib/edit-state';
import { AlgEditCard } from './AlgEditCard';
import { AlgKeypad } from './AlgKeypad';

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

// 同時に1つしか開かない確認。開いていないときはnull
type EditDialog = { kind: 'discard' } | { kind: 'deletePattern' };

const NAME_ERROR_ID = 'pattern-name-error';

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

// 図は詳細と同じ大きさ・位置 (上端をカードの中の図に揃えて17下げる)。判断を書くときの参考に出す
function EditFigure({ preset, settings }: EditFigureProps) {
  return (
    <div className="flex justify-center pt-4.25">
      <PatternFigures preset={preset} settings={settings} />
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
  // 画面を離れた先で読ませる知らせ (登録を消した、パターンを消した) はストアのshowを直に使う
  const showToast = useToastStore((state) => state.show);
  const showOwnToast = useOwnToast();
  const draftId = draftIdOf(target);
  const isCustom = target.kind !== 'preset';
  const fields = fieldsOf(target);
  const draft = useFormDraft({
    draftStore,
    draftId,
    savedForm: formFrom(registration, fields),
    formFromDraft: (entry) =>
      formFromEntries(
        isCustom ? { name: entry.name, categoryId: entry.categoryId || fields.categoryId } : fields,
        entry.recognition,
        entry.cards,
      ),
    showOwnToast,
  });
  const { form, setForm, isDirty } = draft;
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(initialFocus);
  // 名前の検証は欄を離れたときから (新規は空で始まるので、開いた直後には赤くしない)。
  // 保存済みの自作が名前なしで開かれたときは、読めない手順と同じく開いた時点で示す
  const [hasLeftName, setHasLeftName] = useState(target.kind === 'custom' && target.pattern.name.trim() === '');
  const [dialog, setDialog] = useState<EditDialog | null>(null);
  const inputsRef = useRef(new Map<number, HTMLInputElement>());
  const keypad = useAlgKeypad(inputsRef);
  const recognitionRef = useRef<HTMLTextAreaElement>(null);
  // 自作は名前が必須
  const isNameMissing = isCustom && form.name.trim() === '';
  const hasNameError = hasLeftName && isNameMissing;
  const canSave = !hasInvalidCard(form) && !isNameMissing;
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

  const closeDialog = () => {
    setDialog(null);
  };

  // 保存するまで文書は変わらず、消したあとも取り消せるので確認は出さない (一括登録や読み込みと同じ扱い)。
  // 空のカードは戻すものがないので知らせない
  const deleteCard = (index: number, card: EditCard) => {
    // 焦点の指定も外す (消えた欄に焦点を戻しに行かない)
    setFocusTarget(null);
    setForm((current) => ({ ...current, cards: removeCard(current.cards, index) }));
    if (isCardEmpty(card)) {
      return;
    }
    showOwnToast(copy.edit.deletedAlg, {
      label: copy.toast.undo,
      run: () => {
        setForm((current) => ({ ...current, cards: insertCard(current.cards, index, card) }));
      },
    });
  };

  const close = (path = backPath) => {
    draft.remove();
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
    closeDialog();
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
      <ScreenHeader
        title={title}
        leading={
          <IconButton
            label={copy.a11y.closeEdit}
            className="-ml-1.75"
            onClick={() => {
              if (isDirty) {
                setDialog({ kind: 'discard' });
              } else {
                close();
              }
            }}
          >
            <X size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
        }
        trailing={
          <Button variant="primary" className="mr-1.75 px-3.5" disabled={!canSave} onClick={save}>
            {copy.edit.save}
          </Button>
        }
      />
      {/* キーパッドが出ている間は、欄がその裏に隠れないよう下に余白を足す */}
      <ScreenBody className={cn(keypad.isOpen && 'pb-60')}>
        {target.kind === 'preset' && <EditFigure preset={target.preset} settings={settings} />}
        {/* 名前とカテゴリはプリセットでは図と結び付いた固定値なので自作のときだけ編集できる */}
        {isCustom && (
          <>
            <Field id="pattern-name" label={copy.edit.name}>
              <input
                id="pattern-name"
                value={form.name}
                autoComplete="off"
                aria-invalid={hasNameError}
                aria-describedby={hasNameError ? NAME_ERROR_ID : undefined}
                className={cn(INPUT_CLASS, 'h-11 px-3', hasNameError && 'border-danger hover:border-danger-hover')}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }));
                }}
                onBlur={() => {
                  setHasLeftName(true);
                }}
              />
              {hasNameError && (
                <p id={NAME_ERROR_ID} className="-mt-0.5 text-label leading-normal text-danger">
                  {copy.edit.nameRequired}
                </p>
              )}
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
              usesKeypad={keypad.usesKeypad}
              onChange={(next) => {
                updateCard(index, next);
              }}
              onFocus={() => {
                keypad.openAt(index);
              }}
              onBlur={keypad.closeOnBlur}
              onMakeMain={() => {
                setForm((current) => ({ ...current, cards: moveCardToFront(current.cards, index) }));
              }}
              onDelete={() => {
                deleteCard(index, card);
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
                setDialog({ kind: 'deletePattern' });
              }}
            >
              {copy.edit.deletePattern}
            </Button>
          </div>
        )}
      </ScreenBody>
      {keypad.isOpen && <AlgKeypad onKey={keypad.pressKey} />}
      {dialog?.kind === 'discard' && (
        <ConfirmDialog
          title={copy.edit.discardTitle}
          actionLabel={copy.edit.discard}
          onConfirm={() => {
            close();
          }}
          onCancel={closeDialog}
        />
      )}
      {dialog?.kind === 'deletePattern' && target.kind === 'custom' && (
        <ConfirmDialog
          title={copy.edit.deletePatternTitle(target.pattern.name)}
          actionLabel={copy.edit.deletePatternAction}
          onConfirm={deletePattern}
          onCancel={closeDialog}
        />
      )}
    </>
  );
}

function presetName(target: EditTarget): string {
  return target.kind === 'preset' ? target.preset.name : '';
}
