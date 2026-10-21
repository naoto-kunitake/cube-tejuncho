import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toast } from '@/components/toast/Toast';
import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import type * as DraftExports from '@/data/draft';
import { draftStore } from '@/data/draft';
import { useDocumentStore } from '@/data/store';

import { EditScreen } from './EditScreen';

// 下書きは本物の localStorage ではなくメモリに置く (テスト間で残らない)
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

function renderEdit(path = '/p/pll-ua/edit', state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/p/:id" element={<p>detail</p>} />
        <Route path="/p/:id/edit" element={<EditScreen />} />
      </Routes>
      <Toast />
    </MemoryRouter>,
  );
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

  it('読めない記法は欄を離れたときに赤く示し、保存できない', async () => {
    const user = userEvent.setup();
    renderEdit();
    const input = screen.getByLabelText(copy.edit.mainAlg);
    await user.type(input, 'R Q');
    expect(screen.queryByText(/読めない記号/)).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByText(/読めない記号/)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: copy.edit.save })).toBeDisabled();
    await user.type(input, '{backspace}');
    expect(screen.queryByText(/読めない記号/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.edit.save })).toBeEnabled();
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

  it('中身のある手順の削除は確認し、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.setState({ document: { ...createEmptyDocument(), registrations: [REGISTRATION] } });
    renderEdit();
    const altCard = screen.getByLabelText(copy.edit.altAlg(2)).closest<HTMLElement>('div.rounded-md');
    if (altCard === null) {
      throw new Error('alt card not found');
    }
    await user.click(within(altCard).getByRole('button', { name: copy.edit.deleteAlg }));
    await user.click(
      within(screen.getByRole('alertdialog', { name: copy.edit.deleteAltAlgTitle(2) })).getByRole('button', {
        name: copy.edit.deleteAlg,
      }),
    );
    expect(screen.queryByLabelText(copy.edit.altAlg(2))).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.toast.undo }));
    expect(screen.getByLabelText(copy.edit.altAlg(2))).toHaveValue(REGISTRATION.altAlgs[0]?.text);
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
    expect(screen.getByRole('button', { name: copy.edit.save })).toBeDisabled();
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
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: copy.edit.deleteAlg }));
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

  it('知らない id なら見つからないと出す', () => {
    renderEdit('/p/nope/edit');
    expect(screen.getByRole('heading', { level: 1, name: copy.detail.notFound })).toBeInTheDocument();
  });
});
