import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toast } from '@/components/toast/Toast';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import type * as DraftExports from '@/data/draft';
import { draftStore } from '@/data/draft';
import { useDocumentStore } from '@/data/store';

import { EditScreen } from './EditScreen';

// 下書きは本物のlocalStorageではなくメモリに置く (テスト間で残らない)
vi.mock('@/data/draft', async (importOriginal) => {
  const original = await importOriginal<typeof DraftExports>();
  const storage = await import('@/data/storage');
  return { ...original, draftStore: original.createDraftStore(storage.createMemoryStorage()) };
});

const REGISTRATION = {
  patternId: 'pll-ua',
  recognition: '前に3連',
  mainAlg: { text: "M2 U M U2 M' U M2", mnemonic: '', fingering: '' },
  altAlgs: [{ text: "R U' R U R U R U' R' U' R2", mnemonic: 'alt', fingering: '' }],
  createdAt: '2026-10-22T00:00:00.000Z',
  updatedAt: '2026-10-22T00:00:00.000Z',
};

// 回転記号の画面は別のfeatureなので、受け取るstateだけを映す探針を置く
function LocationStateProbe() {
  const location = useLocation();
  return <p>{JSON.stringify(location.state)}</p>;
}

function renderEdit(path = '/p/pll-ua/edit', state?: unknown) {
  const url = new URL(path, 'http://localhost');
  return render(
    <MemoryRouter initialEntries={[{ pathname: url.pathname, search: url.search, state }]}>
      <Routes>
        <Route path="/" element={<p>list</p>} />
        <Route path="/p/new" element={<EditScreen />} />
        <Route path="/p/:id" element={<p>detail</p>} />
        <Route path="/p/:id/edit" element={<EditScreen />} />
        <Route path="/notation" element={<LocationStateProbe />} />
      </Routes>
      <Toast />
    </MemoryRouter>,
  );
}

function withCustomCategory() {
  const document = createEmptyDocument();
  document.categories = [{ id: 'c1', name: 'COLL' }];
  document.settings.tabOrder = ['pll', 'c1'];
  document.patterns = [{ id: 'p1', categoryId: 'c1', name: 'Sune', createdAt: '', updatedAt: '' }];
  useDocumentStore.setState({ document });
}

function registrationOf(patternId: string) {
  return useDocumentStore.getState().document.registrations.find((entry) => entry.patternId === patternId);
}

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
  useToastStore.getState().dismiss();
});

afterEach(cleanup);

describe('EditScreen', () => {
  it('F2L の編集画面は 3 面の図を出す', () => {
    renderEdit('/p/f2l-1/edit');
    expect(screen.getByRole('img', { name: 'F2L 1' })).toBeInTheDocument();
  });

  it('PLL の編集では全色の図と手がかりの図を2枚並べる', () => {
    renderEdit();
    expect(screen.getByRole('img', { name: 'Ua' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: copy.a11y.cueFigure('Ua') })).toBeInTheDocument();
  });

  it('判断と手順を書いて保存すると登録され、詳細に戻る', async () => {
    const user = userEvent.setup();
    renderEdit();
    expect(screen.getByRole('heading', { level: 1, name: copy.edit.title('Ua') })).toBeInTheDocument();
    await user.type(screen.getByLabelText(copy.edit.recognition), '前に3連');
    await user.type(screen.getByLabelText(copy.edit.mainAlg), 'R U');
    await user.click(screen.getByRole('button', { name: copy.edit.save }));
    expect(registrationOf('pll-ua')).toMatchObject({
      recognition: '前に3連',
      mainAlg: { text: 'R U', mnemonic: '', fingering: '' },
      altAlgs: [],
    });
    expect(screen.getByText('detail')).toBeInTheDocument();
  });

  it('読めない記法の「回転記号を見る」は、戻り先に編集画面を添えて開く', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.type(screen.getByLabelText(copy.edit.mainAlg), 'R Q');
    await user.tab();
    await user.click(screen.getByRole('link', { name: copy.edit.seeNotation }));
    expect(screen.getByText(JSON.stringify({ from: '/p/pll-ua/edit' }))).toBeInTheDocument();
  });

  it('読めない記法は欄を離れたときに赤く示し、直すと消える', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    await user.type(input, 'R Q');
    expect(screen.queryByText(/読めない記号/)).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByText(/読めない記号/)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await user.type(input, '{backspace}');
    expect(screen.queryByText(/読めない記号/)).not.toBeInTheDocument();
  });

  it('揃わない手順は欄を離れると知らせるが、保存はできる', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    await user.type(input, "R U R' U' R' F R2 U' R' U' R U R' F'");
    await user.tab();
    expect(await screen.findByText(copy.detail.algMismatch)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.edit.save }));
    expect(registrationOf('pll-ua')).toMatchObject({ mainAlg: { text: "R U R' U' R' F R2 U' R' U' R U R' F'" } });
  });

  it('揃う手順に直すと知らせが消える', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    // 先に知らせを出してから直す (最初から出ていない状態では、判定を待ったことにならない)
    await user.type(input, "R U R' U' R' F R2 U' R' U' R U R' F'");
    await user.tab();
    await screen.findByText(copy.detail.algMismatch);
    await user.clear(input);
    await user.type(input, "R U' R U R U R U' R' U' R2");
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText(copy.detail.algMismatch)).not.toBeInTheDocument();
    });
  });

  it('読めない記法のまま保存を押すと、保存せずに赤く示してその欄に焦点を移す', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByRole('button', { name: copy.edit.addAlg }));
    const altInput = screen.getByLabelText(copy.edit.altAlg(2));
    await user.type(altInput, 'R Q');
    // 欄を離れずに保存 (ボタンは焦点を奪わない)
    const save = screen.getByRole('button', { name: copy.edit.save });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(screen.getByText(/読めない記号/)).toBeInTheDocument();
    expect(altInput).toHaveFocus();
    expect(registrationOf('pll-ua')).toBeUndefined();
    expect(screen.queryByText('detail')).not.toBeInTheDocument();
  });

  it('変更があるときの × は確認し、破棄で詳細に戻る', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.type(screen.getByLabelText(copy.edit.recognition), 'x');
    await user.click(screen.getByRole('button', { name: copy.a11y.closeEdit }));
    const dialog = screen.getByRole('alertdialog', { name: copy.edit.discardTitle });
    await user.click(within(dialog).getByRole('button', { name: copy.dialog.cancel }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.a11y.closeEdit }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: copy.edit.discard }));
    expect(screen.getByText('detail')).toBeInTheDocument();
    expect(registrationOf('pll-ua')).toBeUndefined();
  });

  it('変更がなければ × でそのまま戻る', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByRole('button', { name: copy.edit.addAlg }));
    await user.click(screen.getByRole('button', { name: copy.a11y.closeEdit }));
    expect(screen.getByText('detail')).toBeInTheDocument();
  });

  it('中身のある手順も確認なしで消え、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    const altCard = screen.getByLabelText(copy.edit.altAlg(2)).closest<HTMLElement>('div.rounded-md');
    if (altCard === null) {
      throw new Error('alt card not found');
    }
    await user.click(within(altCard).getByRole('button', { name: copy.edit.deleteAlg }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(copy.edit.altAlg(2))).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.toast.undo }));
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveValue(REGISTRATION.altAlgs[0]?.text);
  });

  it('メイン手順も確認なしで消え、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    const mainCard = screen.getByLabelText(copy.edit.mainAlg).closest<HTMLElement>('div.rounded-md');
    if (mainCard === null) {
      throw new Error('main card not found');
    }
    await user.click(within(mainCard).getByRole('button', { name: copy.edit.deleteAlg }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveValue(REGISTRATION.altAlgs[0]?.text);
    await user.click(screen.getByRole('button', { name: copy.toast.undo }));
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveValue(REGISTRATION.mainAlg.text);
  });

  it('メインにすると先頭に来て、基本手順は 1 回だけ足せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    expect(screen.queryByRole('button', { name: new RegExp(copy.edit.addStandardAlg) })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.edit.makeMain }));
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveValue(REGISTRATION.altAlgs[0]?.text);
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveValue(REGISTRATION.mainAlg.text);
  });

  it('未登録なら基本手順を足す導線が出て、押すとカードが増える', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByRole('button', { name: new RegExp(copy.edit.addStandardAlg) }));
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveValue("M2 U M U2 M' U M2");
    expect(screen.queryByRole('button', { name: new RegExp(copy.edit.addStandardAlg) })).not.toBeInTheDocument();
  });

  it('読めない手順をメインにしても赤いまま', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    const alt = screen.getByLabelText(copy.edit.altAlg(2));
    await user.clear(alt);
    await user.type(alt, 'R Q');
    await user.tab();
    await user.click(screen.getByRole('button', { name: copy.edit.makeMain }));
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveAttribute('aria-invalid', 'true');
  });

  it('全部消して保存すると登録が消え、詳細で元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    await user.clear(screen.getByLabelText(copy.edit.recognition));
    await user.clear(screen.getByLabelText(copy.edit.mainAlg));
    await user.clear(screen.getByLabelText(copy.edit.altAlg(2)));
    await user.click(screen.getByRole('button', { name: copy.edit.save }));
    expect(screen.getByText('detail')).toBeInTheDocument();
    expect(registrationOf('pll-ua')).toBeUndefined();
    expect(screen.getByText(copy.edit.removedRegistration('Ua'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.toast.undo }));
    expect(registrationOf('pll-ua')).toMatchObject({
      recognition: REGISTRATION.recognition,
      mainAlg: REGISTRATION.mainAlg,
    });
  });

  it('手順の削除の知らせは画面を離れたら消える', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    const altCard = screen.getByLabelText(copy.edit.altAlg(2)).closest<HTMLElement>('div.rounded-md');
    if (altCard === null) {
      throw new Error('alt card not found');
    }
    await user.click(within(altCard).getByRole('button', { name: copy.edit.deleteAlg }));
    expect(screen.getByText(copy.edit.deletedAlg)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.edit.save }));
    expect(screen.getByText('detail')).toBeInTheDocument();
    expect(screen.queryByText(copy.edit.deletedAlg)).not.toBeInTheDocument();
  });

  it('詳細の空枠から来たらその欄に焦点がある', () => {
    renderEdit('/p/pll-ua/edit', { focus: 'recognition' });
    expect(screen.getByLabelText(copy.edit.recognition)).toHaveFocus();
  });

  it('書きかけは 300ms 後に保存され、開き直すと復元して知らせる', async () => {
    const user = userEvent.setup();
    const { unmount } = renderEdit();
    await user.type(screen.getByLabelText(copy.edit.recognition), 'かきかけ');
    await vi.waitFor(() => {
      expect(draftStore.read('pll-ua')?.recognition).toBe('かきかけ');
    });
    unmount();
    renderEdit();
    expect(screen.getByLabelText(copy.edit.recognition)).toHaveValue('かきかけ');
    expect(screen.getByText(copy.edit.restoredDraft)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.edit.discard }));
    expect(screen.getByLabelText(copy.edit.recognition)).toHaveValue('');
    expect(draftStore.read('pll-ua')).toBeNull();
  });

  it('書いた内容を消すと書きかけも消える', async () => {
    const user = userEvent.setup();
    renderEdit();
    const recognition = screen.getByLabelText(copy.edit.recognition);
    await user.type(recognition, 'かきかけ');
    await vi.waitFor(() => {
      expect(draftStore.read('pll-ua')?.recognition).toBe('かきかけ');
    });
    // 消す側は間引きを通らないので待たない (待つと、消すのを遅らせる変更に気づけない)
    await user.clear(recognition);
    expect(draftStore.read('pll-ua')).toBeNull();
  });

  it('手順の欄に入るとキーパッドが出て、キーで記号が入り、離れると閉じる', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    expect(screen.queryByRole('group', { name: copy.a11y.keypad })).not.toBeInTheDocument();
    await user.click(input);
    const keypad = screen.getByRole('group', { name: copy.a11y.keypad });
    await user.click(within(keypad).getByRole('button', { name: 'R' }));
    await user.click(within(keypad).getByRole('button', { name: 'U' }));
    await user.click(within(keypad).getByRole('button', { name: "'" }));
    expect(input).toHaveValue("R U'");
    expect(input).toHaveFocus();
    await user.click(within(keypad).getByRole('button', { name: copy.keypad.backspace }));
    expect(input).toHaveValue('R U');
    await user.click(within(keypad).getByRole('button', { name: copy.keypad.clear }));
    expect(input).toHaveValue('');
    await user.click(screen.getByLabelText(copy.edit.recognition));
    expect(screen.queryByRole('group', { name: copy.a11y.keypad })).not.toBeInTheDocument();
  });

  it('「キーボード」を押すとキーパッドが閉じて端末のキーボードで打てる', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    await user.click(input);
    expect(input).toHaveAttribute('inputmode', 'none');
    await user.click(screen.getByRole('button', { name: copy.keypad.keyboard }));
    expect(screen.queryByRole('group', { name: copy.a11y.keypad })).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('inputmode');
    expect(input).toHaveFocus();
  });

  // 欄が実際に見える位置に来るかはjsdomにレイアウトがないので測れない (実機で確かめる)
  it('手順を追加するとキーパッドが出て、新しい欄に焦点が入る', async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByRole('button', { name: copy.edit.addAlg }));
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveFocus();
    expect(screen.getByRole('group', { name: copy.a11y.keypad })).toBeInTheDocument();
  });

  it('「完了」を押すとキーパッドが閉じて欄の値はそのまま残る', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    await user.click(input);
    const keypad = screen.getByRole('group', { name: copy.a11y.keypad });
    await user.click(within(keypad).getByRole('button', { name: 'R' }));
    await user.click(within(keypad).getByRole('button', { name: copy.keypad.done }));
    expect(screen.queryByRole('group', { name: copy.a11y.keypad })).not.toBeInTheDocument();
    expect(input).toHaveValue('R');
    expect(input).not.toHaveFocus();
  });

  it('知らない id なら見つからないと出す', () => {
    renderEdit('/p/nope/edit');
    expect(screen.getByRole('heading', { level: 1, name: copy.detail.notFound })).toBeInTheDocument();
  });

  it('新規は名前が必須で、保存すると自作パターンが増えて詳細に移る', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    renderEdit('/p/new?category=c1');
    expect(screen.getByRole('heading', { level: 1, name: copy.edit.newTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(copy.edit.category)).toHaveValue('c1');
    const save = screen.getByRole('button', { name: copy.edit.save });
    await user.click(save);
    expect(screen.getByText(copy.edit.nameRequired)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.edit.name)).toHaveFocus();
    expect(useDocumentStore.getState().document.patterns).toHaveLength(1);
    await user.type(screen.getByLabelText(copy.edit.name), 'Anti-Sune');
    await user.type(screen.getByLabelText(copy.edit.mainAlg), "R U2 R' U' R U' R'");
    await user.click(save);
    const { patterns, registrations } = useDocumentStore.getState().document;
    expect(patterns).toHaveLength(2);
    expect(patterns[1]).toMatchObject({ name: 'Anti-Sune', categoryId: 'c1' });
    expect(registrations).toMatchObject([{ patternId: patterns[1]?.id, mainAlg: { text: "R U2 R' U' R U' R'" } }]);
    expect(screen.getByText('detail')).toBeInTheDocument();
  });

  it('名前のない自作を開いたときは最初から知らせる', () => {
    const document = createEmptyDocument();
    document.categories = [{ id: 'c1', name: 'COLL' }];
    document.patterns = [{ id: 'p1', categoryId: 'c1', name: '', createdAt: '', updatedAt: '' }];
    useDocumentStore.setState({ document });
    renderEdit('/p/p1/edit');
    expect(screen.getByText(copy.edit.nameRequired)).toBeInTheDocument();
  });

  it('名前を空のまま欄を離れると知らせ、入れ直すと消える', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    renderEdit('/p/p1/edit');
    const name = screen.getByLabelText(copy.edit.name);
    await user.clear(name);
    expect(screen.queryByText(copy.edit.nameRequired)).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByText(copy.edit.nameRequired)).toBeInTheDocument();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    await user.type(name, 'Sune');
    expect(screen.queryByText(copy.edit.nameRequired)).not.toBeInTheDocument();
  });

  it('自作は名前を変えて保存できる', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    renderEdit('/p/p1/edit');
    const name = screen.getByLabelText(copy.edit.name);
    expect(name).toHaveValue('Sune');
    await user.clear(name);
    await user.type(name, 'Sune 2');
    await user.click(screen.getByRole('button', { name: copy.edit.save }));
    expect(useDocumentStore.getState().document.patterns[0]?.name).toBe('Sune 2');
  });

  it('自作の削除は確認のうえ一覧に戻り、元に戻せる', async () => {
    const user = userEvent.setup();
    withCustomCategory();
    renderEdit('/p/p1/edit');
    await user.click(screen.getByRole('button', { name: copy.edit.deletePattern }));
    await user.click(
      within(screen.getByRole('alertdialog', { name: copy.edit.deletePatternTitle('Sune') })).getByRole('button', {
        name: copy.edit.deletePatternAction,
      }),
    );
    expect(screen.getByText('list')).toBeInTheDocument();
    expect(useDocumentStore.getState().document.patterns).toEqual([]);
    await user.click(screen.getByRole('button', { name: copy.toast.undo }));
    expect(useDocumentStore.getState().document.patterns).toMatchObject([{ id: 'p1', name: 'Sune' }]);
  });

  it('焦点の指定に番号があれば、その番号の手順の欄に焦点が入る', () => {
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit('/p/pll-ua/edit', { focus: 'alg', index: 1 });
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveFocus();
  });

  it('焦点の指定に番号がなければ、メイン手順の欄に焦点が入る', () => {
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit('/p/pll-ua/edit', { focus: 'alg' });
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveFocus();
  });

  // 履歴のstateは型を信用できないので、不正な番号は先頭の欄に戻す
  it.each([
    ['負数', -1],
    ['非整数', 1.5],
    ['文字列', '1'],
  ])('焦点の指定の番号が不正 (%s) なら、メイン手順の欄に焦点が入る', (_label, index) => {
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit('/p/pll-ua/edit', { focus: 'alg', index });
    expect(screen.getByLabelText(copy.edit.mainAlg)).toHaveFocus();
  });
});
