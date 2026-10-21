import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Field, TextArea } from '@/components/Field';
import { TopFigure } from '@/components/figures/TopFigure';
import { IconButton } from '@/components/IconButton';
import { useToastStore } from '@/components/toast/toast-store';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import type { AlgEntry, Registration, Settings } from '@/data/document';
import { type DraftStore, draftStore as defaultDraftStore } from '@/data/draft';
import type { PllPreset } from '@/data/presets/pll';
import { useDocumentStore } from '@/data/store';
import { describeSides } from '@/lib/figure/describe';
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
import { AlgEditCard } from './AlgEditCard';

// 入力のたびに書く下書きは 300ms まとめる (打鍵ごとに localStorage へ書かない)
const DRAFT_DEBOUNCE_MS = 300;

export type FocusTarget = { kind: 'recognition' } | { kind: 'alg'; index: number };

type EditFormProps = {
  preset: PllPreset;
  registration: Registration | undefined;
  settings: Settings;
  initialFocus: FocusTarget | null;
  draftStore?: DraftStore;
};

type PendingDelete = { index: number; card: EditCard };

const ADD_ROW_CLASS =
  'flex min-h-11 w-full items-center gap-2 rounded-md border border-dashed border-line-state bg-surface px-3.5 text-left text-body font-medium text-muted pressable hover:border-line-strong hover:bg-hover';

export function EditForm({
  preset,
  registration,
  settings,
  initialFocus,
  draftStore = defaultDraftStore,
}: EditFormProps) {
  const navigate = useNavigate();
  const saveRegistration = useDocumentStore((state) => state.saveRegistration);
  const removeRegistration = useDocumentStore((state) => state.removeRegistration);
  const showToast = useToastStore((state) => state.show);
  const dismissToast = useToastStore((state) => state.dismiss);
  const saved = formFrom(registration);
  const baseSnapshot = formSnapshot(saved);
  // 書きかけがあれば復元して知らせる (黙って上書きしない)
  const [initial] = useState(() => {
    const draft = draftStore.read(preset.id);
    return draft === null
      ? { form: saved, isRestored: false }
      : { form: formFromEntries(draft.recognition, draft.cards), isRestored: true };
  });
  const [form, setForm] = useState<EditFormValue>(initial.form);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(initialFocus);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const inputsRef = useRef(new Map<number, HTMLInputElement>());
  // この画面が出した知らせ (復元、手順の削除) は、画面を離れたら消す (取り消しの先がもうない)
  const ownToastRef = useRef<number | null>(null);
  const recognitionRef = useRef<HTMLTextAreaElement>(null);
  const isDirty = formSnapshot(form) !== baseSnapshot;
  const canSave = !hasInvalidCard(form);
  const standardAlg = standardAlgToAdd(form, preset.standardAlg);
  const view = recolorView(preset.view, settings);
  const runs = describeSides(preset.view).map((entry) => copy.edit.sideRun(entry.side, entry.run));
  const detailPath = `/p/${preset.id}`;

  useEffect(() => {
    if (!initial.isRestored) {
      return;
    }
    ownToastRef.current = showToast(copy.edit.restoredDraft, {
      label: copy.edit.discard,
      run: () => {
        draftStore.remove(preset.id);
        setForm(formFrom(registration));
      },
    });
  }, [initial.isRestored, showToast, draftStore, preset.id, registration]);

  useEffect(() => {
    return () => {
      if (ownToastRef.current !== null && useToastStore.getState().toast?.id === ownToastRef.current) {
        dismissToast();
      }
    };
  }, [dismissToast]);

  useEffect(() => {
    if (!isDirty) {
      draftStore.remove(preset.id);
      return;
    }
    const timer = setTimeout(() => {
      draftStore.write(preset.id, { recognition: form.recognition, cards: entriesOf(form.cards) });
    }, DRAFT_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [form, isDirty, preset.id, draftStore]);

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

  const close = () => {
    draftStore.remove(preset.id);
    void navigate(detailPath, { replace: true });
  };

  const save = () => {
    const data = registrationDataFrom(form);
    if (data !== null) {
      saveRegistration(preset.id, data);
      close();
      return;
    }
    // 全部消して保存 = 登録を消す。確認は挟まず、詳細に戻ってから取り消せるようにする
    removeRegistration(preset.id);
    close();
    if (registration !== undefined) {
      const { recognition, mainAlg, altAlgs } = registration;
      showToast(copy.edit.removedRegistration(preset.name), {
        label: copy.toast.undo,
        run: () => {
          saveRegistration(preset.id, { recognition, mainAlg, altAlgs });
        },
      });
    }
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
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {copy.edit.title(preset.name)}
          </h1>
        </div>
        <Button variant="primary" className="mr-1.75 px-3.5" disabled={!canSave} onClick={save}>
          {copy.edit.save}
        </Button>
      </TopBar>
      <div className="flex flex-col gap-6 px-4 pt-2 pb-6">
        {/* 図は詳細と同じ大きさ・位置 (上端をカードの中の図に揃えて 17 下げる)。判断を書くときの参考に全色と手がかりを並べる */}
        {settings.showCueFigure ? (
          <div className="flex w-full justify-center gap-6 pt-4.25">
            <div className="-m-1.75 w-38 flex-none">
              <TopFigure view={view} arrows={settings.showArrows ? preset.arrows : []} label={preset.name} />
            </div>
            <div className="-m-1.75 w-38 flex-none">
              <TopFigure view={cueView(view)} label={copy.a11y.cueFigure(preset.name)} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center pt-4.25">
            <div className="-my-2.75 w-full max-w-60">
              <TopFigure view={view} arrows={settings.showArrows ? preset.arrows : []} label={preset.name} />
            </div>
          </div>
        )}
        <Field id="recognition" label={copy.edit.recognition}>
          <TextArea
            ref={recognitionRef}
            id="recognition"
            value={form.recognition}
            placeholder={copy.edit.recognitionHint(runs.length > 0 ? runs : [copy.edit.noRuns])}
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
              onChange={(next) => {
                updateCard(index, next);
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
      </div>
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
          onConfirm={close}
          onCancel={() => {
            setIsDiscarding(false);
          }}
        />
      )}
    </>
  );
}
