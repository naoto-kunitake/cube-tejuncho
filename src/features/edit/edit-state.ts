import type { AlgEntry, Registration, RegistrationData } from '@/data/document';
import { type AlgError, cleanAlgText, parseAlg } from '@/lib/alg/parse';

// 編集中の手順カード。メイン手順も 1 枚目のカードとして同じ形で扱う。
// id は並べ替えや削除の取り消しで React が同じカードを追えるようにする印で、保存しない
export type EditCard = AlgEntry & { id: number };
export type EditForm = {
  recognition: string;
  cards: EditCard[];
};

export const EMPTY_CARD: AlgEntry = { text: '', mnemonic: '', fingering: '' };

let nextCardId = 0;
export function newCard(entry: AlgEntry = EMPTY_CARD): EditCard {
  nextCardId += 1;
  return { ...entry, id: nextCardId };
}

export function isCardEmpty(card: AlgEntry): boolean {
  return card.text.trim() === '' && card.mnemonic.trim() === '' && card.fingering.trim() === '';
}

function trimCard(card: AlgEntry): AlgEntry {
  return { text: card.text.trim(), mnemonic: card.mnemonic.trim(), fingering: card.fingering.trim() };
}

export function formFrom(registration: Registration | undefined): EditForm {
  if (registration === undefined) {
    return { recognition: '', cards: [newCard()] };
  }
  return { recognition: registration.recognition, cards: [registration.mainAlg, ...registration.altAlgs].map(newCard) };
}

export function formFromEntries(recognition: string, entries: readonly AlgEntry[]): EditForm {
  return { recognition, cards: entries.map(newCard) };
}

export function entriesOf(cards: readonly EditCard[]): AlgEntry[] {
  return cards.map(({ id: _id, ...entry }) => entry);
}

// 変更の有無を比べるための文字列。空のカードを足しただけなら変更とみなさない (保存しても何も残らない)
export function formSnapshot(form: EditForm): string {
  return JSON.stringify({
    recognition: form.recognition.trim(),
    cards: form.cards.filter((card) => !isCardEmpty(card)).map(trimCard),
  });
}

// 保存する形。手順の空いたカードは覚え方だけ書いてあっても残さない。何も残らなければ null (登録を消す)
export function registrationDataFrom(form: EditForm): RegistrationData | null {
  const [mainAlg, ...altAlgs] = form.cards.map(trimCard).filter((card) => card.text !== '');
  const recognition = form.recognition.trim();
  if (mainAlg === undefined && recognition === '') {
    return null;
  }
  return { recognition, mainAlg: mainAlg ?? EMPTY_CARD, altAlgs };
}

// 空は手順なしとして許す (カードごと捨てる)。それ以外の読めない記法だけが誤り
export function algErrorOf(text: string): AlgError | null {
  const result = parseAlg(text);
  if (result.ok || result.error.kind === 'empty') {
    return null;
  }
  return result.error;
}

export function hasInvalidCard(form: EditForm): boolean {
  return form.cards.some((card) => algErrorOf(card.text) !== null);
}

// 基本手順をあとから足す導線に出す手順。すでに同じ手順のカードがあれば null (もう足せる物がない)
export function standardAlgToAdd(form: EditForm, standardAlg: string): string | null {
  const target = cleanAlgText(standardAlg);
  return form.cards.some((card) => cleanAlgText(card.text) === target) ? null : standardAlg;
}

export function moveCardToFront(cards: readonly EditCard[], index: number): EditCard[] {
  const card = cards[index];
  if (card === undefined) {
    return [...cards];
  }
  return [card, ...cards.filter((_, i) => i !== index)];
}

// 最後の 1 枚を消しても空のカードを 1 枚残す (手順の欄が消えると書く場所がなくなる)
export function removeCard(cards: readonly EditCard[], index: number): EditCard[] {
  const rest = cards.filter((_, i) => i !== index);
  return rest.length === 0 ? [newCard()] : rest;
}

export function insertCard(cards: readonly EditCard[], index: number, card: EditCard): EditCard[] {
  // 消した直後の「元に戻す」。残っていたのが空の 1 枚だけなら、それは削除で補った物なので置き換える
  const base = cards.length === 1 && cards[0] !== undefined && isCardEmpty(cards[0]) ? [] : [...cards];
  const at = Math.min(index, base.length);
  return [...base.slice(0, at), card, ...base.slice(at)];
}
