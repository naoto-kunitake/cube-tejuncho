import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToastStore } from '@/components/toast/toast-store';
import { copy } from '@/copy';
import { createEmptyDocument } from '@/data/document';
import { useDocumentStore } from '@/data/store';

import { SettingsScreen } from './SettingsScreen';

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/" element={<p>list</p>} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

const UA_ALG = { text: "M2 U M U2 M' U M2", mnemonic: '', fingering: '' };

function fileOf(content: string): File {
  return new File([content], 'a.json', { type: 'application/json' });
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('file input not found');
  }
  return input;
}

async function openImportSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: copy.settings.importData }));
}

beforeEach(() => {
  useDocumentStore.setState({ document: createEmptyDocument() });
  useToastStore.getState().dismiss();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SettingsScreen', () => {
  it('カテゴリの区画にプリセットの行と追加の行がある', () => {
    renderSettings();
    expect(screen.getByText(copy.list.categories.pll)).toBeInTheDocument();
    expect(screen.getByText(copy.list.categories.oll)).toBeInTheDocument();
    expect(screen.getByText(copy.list.categories.f2l)).toBeInTheDocument();
    expect(screen.getAllByText(copy.settings.preset)).toHaveLength(3);
    expect(screen.getByRole('button', { name: copy.settings.addCategory })).toBeInTheDocument();
  });

  it('並び順のセグメントを押すと、そのカテゴリの並び順だけ変わる', async () => {
    const user = userEvent.setup();
    renderSettings();
    const group = screen.getByRole('group', { name: copy.settings.sortOrderOf(copy.list.categories.pll) });
    await user.click(within(group).getByRole('button', { name: copy.list.standardOrder.pll }));
    const { sortOrder } = useDocumentStore.getState().document.settings;
    expect(sortOrder).toEqual({ pll: 'standard', oll: 'shape', f2l: 'shape' });
  });

  it('上面の色を白にすると設定が変わる', async () => {
    const user = userEvent.setup();
    renderSettings();
    const group = screen.getByRole('group', { name: copy.settings.topColor });
    await user.click(within(group).getByRole('button', { name: copy.settings.topColors.white }));
    expect(useDocumentStore.getState().document.settings.topColor).toBe('white');
  });

  it('スイッチで入れ替えの矢印をオフにできる', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('switch', { name: copy.settings.showArrows }));
    expect(useDocumentStore.getState().document.settings.showArrows).toBe(false);
  });

  it('テーマ色の見本を選ぶと設定に色が入り、墨に戻せる', async () => {
    const user = userEvent.setup();
    renderSettings();
    const group = screen.getByRole('radiogroup', { name: copy.settings.themeColor });
    await user.click(within(group).getByRole('radio', { name: copy.settings.themeColors.red }));
    expect(useDocumentStore.getState().document.settings.themeColor).toBe('#d32f2f');
    expect(within(group).getByRole('radio', { name: copy.settings.themeColors.red })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(within(group).getByRole('radio', { name: copy.settings.themeColors.ink }));
    expect(useDocumentStore.getState().document.settings.themeColor).toBe('ink');
  });

  it('自分で選んだ色は見本にない色として設定に入る', () => {
    renderSettings();
    const input = document.querySelector('input[type="color"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('color input not found');
    }
    fireEvent.change(input, { target: { value: '#123456' } });
    expect(useDocumentStore.getState().document.settings.themeColor).toBe('#123456');
    expect(screen.getByRole('radio', { name: copy.settings.customColor })).toHaveAttribute('aria-checked', 'true');
  });

  it('外観モードをダークにすると設定が変わる', async () => {
    const user = userEvent.setup();
    renderSettings();
    const group = screen.getByRole('group', { name: copy.settings.appearanceMode });
    await user.click(within(group).getByRole('button', { name: copy.settings.appearances.dark }));
    expect(useDocumentStore.getState().document.settings.appearance).toBe('dark');
  });

  it('カテゴリを追加すると文書に入り、そのカテゴリの一覧へ移る', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.addCategory }));
    const add = screen.getByRole('button', { name: copy.settings.add });
    expect(add).toBeDisabled();
    await user.type(screen.getByLabelText(copy.settings.categoryName), 'COLL');
    expect(add).toBeEnabled();
    await user.click(add);
    const { categories, settings } = useDocumentStore.getState().document;
    expect(categories).toMatchObject([{ name: 'COLL' }]);
    expect(settings.tabOrder.at(-1)).toBe(categories[0]?.id);
    expect(screen.getByText('list')).toBeInTheDocument();
  });

  it('同じ名前のカテゴリは追加できない', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.addCategory }));
    await user.type(screen.getByLabelText(copy.settings.categoryName), 'pll');
    expect(screen.getByText(copy.settings.duplicateCategory)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.settings.add })).toBeDisabled();
  });

  it('自作のカテゴリの行を押すとシートが開き、名前を変えて保存できる', async () => {
    const user = userEvent.setup();
    const id = useDocumentStore.getState().addCategory('COLL');
    renderSettings();
    await user.click(screen.getByRole('button', { name: `COLL ${copy.settings.patternCount(0)}` }));
    const input = screen.getByLabelText(copy.settings.categoryName);
    expect(input).toHaveValue('COLL');
    const save = screen.getByRole('button', { name: copy.settings.save });
    expect(save).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'ZBLL');
    await user.click(save);
    expect(useDocumentStore.getState().document.categories).toEqual([{ id, name: 'ZBLL' }]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('プリセットの行は押せない', () => {
    renderSettings();
    expect(screen.queryByRole('button', { name: `${copy.list.categories.pll} ${copy.settings.preset}` })).toBeNull();
  });

  it('カテゴリの削除は件数つきで確認し、中のパターンごと消え、元に戻せる', async () => {
    const user = userEvent.setup();
    const categoryId = useDocumentStore.getState().addCategory('COLL');
    useDocumentStore.getState().addCustomPattern({ name: 'a', categoryId }, null);
    const before = useDocumentStore.getState().document;
    renderSettings();
    await user.click(screen.getByRole('button', { name: `COLL ${copy.settings.patternCount(1)}` }));
    await user.click(screen.getByRole('button', { name: copy.settings.deleteCategory }));
    const dialog = screen.getByRole('alertdialog', { name: copy.settings.deleteCategoryTitle('COLL') });
    expect(within(dialog).getByText(copy.settings.deleteCategoryBody(1))).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: copy.settings.deleteCategoryAction }));
    const { categories, patterns, settings } = useDocumentStore.getState().document;
    expect(categories).toEqual([]);
    expect(patterns).toEqual([]);
    expect(settings.tabOrder).toEqual(['pll', 'oll', 'f2l']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useToastStore.getState().toast?.text).toBe(copy.settings.deletedCategory('COLL'));
    useToastStore.getState().toast?.action?.run();
    expect(useDocumentStore.getState().document).toEqual(before);
  });

  it('パターンが0件のカテゴリの削除は本文なしで確認する', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addCategory('COLL');
    renderSettings();
    await user.click(screen.getByRole('button', { name: `COLL ${copy.settings.patternCount(0)}` }));
    await user.click(screen.getByRole('button', { name: copy.settings.deleteCategory }));
    const dialog = screen.getByRole('alertdialog', { name: copy.settings.deleteCategoryTitle('COLL') });
    expect(within(dialog).queryByText(copy.settings.deleteCategoryBody(0))).not.toBeInTheDocument();
  });

  it('ハンドルで上キーを押すと、そのカテゴリが 1 つ上に動く', async () => {
    const user = userEvent.setup();
    renderSettings();
    screen.getByRole('button', { name: copy.a11y.reorderHandle(copy.list.categories.f2l) }).focus();
    await user.keyboard('{ArrowUp}');
    expect(useDocumentStore.getState().document.settings.tabOrder).toEqual(['pll', 'f2l', 'oll']);
  });

  it('ハンドルをドラッグして離すと、動かした先の位置にカテゴリが入る', () => {
    // jsdom は大きさを持たないので、行の高さ 52 を足す
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(52);
    renderSettings();
    const handle = screen.getByRole('button', { name: copy.a11y.reorderHandle(copy.list.categories.pll) });
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 110, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 110, pointerId: 1 });
    expect(useDocumentStore.getState().document.settings.tabOrder).toEqual(['oll', 'f2l', 'pll']);
    expect(screen.getByText(copy.a11y.reorderMoved(copy.list.categories.pll, 3, 3))).toBeInTheDocument();
  });

  it('ドラッグが中断されたら並びは変わらない', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(52);
    renderSettings();
    const handle = screen.getByRole('button', { name: copy.a11y.reorderHandle(copy.list.categories.pll) });
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 110, pointerId: 1 });
    fireEvent.pointerCancel(handle, { clientY: 110, pointerId: 1 });
    expect(useDocumentStore.getState().document.settings.tabOrder).toEqual(['pll', 'oll', 'f2l']);
  });

  it('表記の区画に回転記号の画面へのリンクがある', () => {
    renderSettings();
    expect(screen.getByRole('link', { name: copy.settings.openNotation })).toHaveAttribute('href', '/notation');
  });

  it('データの区画に書き出すと読み込むの行がある', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: copy.settings.exportData })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.settings.importData })).toBeInTheDocument();
  });

  it('一括登録のシートは未登録のあるカテゴリが最初から全部チェックされ、登録すると基本手順が入り、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().registerStandardAlgs('oll');
    const before = useDocumentStore.getState().document;
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.registerAll }));
    const pll = screen.getByRole('checkbox', { name: new RegExp(`^${copy.list.categories.pll}`) });
    const oll = screen.getByRole('checkbox', { name: new RegExp(`^${copy.list.categories.oll}`) });
    expect(pll).toBeChecked();
    expect(oll).toBeDisabled();
    expect(oll).not.toBeChecked();
    expect(screen.getByText(copy.settings.unregisteredCount(21))).toBeInTheDocument();
    expect(screen.getByText(copy.settings.unregisteredCount(0))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.settings.register }));
    expect(useDocumentStore.getState().document.registrations).toHaveLength(57 + 21 + 41);
    expect(useToastStore.getState().toast?.text).toBe(copy.settings.registeredAll(21 + 41));
    useToastStore.getState().toast?.action?.run();
    expect(useDocumentStore.getState().document).toEqual(before);
  });

  it('登録を消すはカテゴリを選び、件数つきで確認してから消え、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    const categoryId = useDocumentStore.getState().addCategory('COLL');
    useDocumentStore.getState().addCustomPattern({ name: 'a', categoryId }, null);
    const before = useDocumentStore.getState().document;
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.clearRegistrations }));
    expect(screen.getByRole('checkbox', { name: new RegExp(`^${copy.list.categories.oll}`) })).toBeDisabled();
    expect(screen.getByText(copy.settings.registeredCount(1))).toBeInTheDocument();
    expect(screen.getByText(copy.settings.patternCountWithLabel(1))).toBeInTheDocument();
    const clear = screen.getByRole('button', { name: copy.settings.clear });
    expect(clear).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: new RegExp(`^${copy.list.categories.pll}`) }));
    await user.click(screen.getByRole('checkbox', { name: /^COLL/ }));
    await user.click(clear);
    const dialog = screen.getByRole('alertdialog', {
      name: copy.settings.clearTitle([copy.list.categories.pll, 'COLL']),
    });
    expect(within(dialog).getByText(copy.settings.clearBody(2))).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: copy.settings.clear }));
    const { registrations, patterns, categories } = useDocumentStore.getState().document;
    expect(registrations).toEqual([]);
    expect(patterns).toEqual([]);
    expect(categories).toHaveLength(1);
    expect(useToastStore.getState().toast?.text).toBe(copy.settings.cleared(2));
    useToastStore.getState().toast?.action?.run();
    expect(useDocumentStore.getState().document).toEqual(before);
  });

  it('初期状態に戻すは確認のうえ空の文書にして一覧へ戻り、元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    useDocumentStore.getState().updateSettings({ topColor: 'white' });
    const before = useDocumentStore.getState().document;
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.reset }));
    const dialog = screen.getByRole('alertdialog', { name: copy.settings.reset });
    expect(within(dialog).getByText(copy.settings.resetBody)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: copy.settings.resetAction }));
    expect(useDocumentStore.getState().document).toEqual(createEmptyDocument());
    expect(screen.getByText('list')).toBeInTheDocument();
    expect(useToastStore.getState().toast?.text).toBe(copy.settings.resetDone);
    useToastStore.getState().toast?.action?.run();
    expect(useDocumentStore.getState().document).toEqual(before);
  });

  it('書き出すと文書そのものの JSON がファイルになり、件数とファイル名を知らせる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    let saved: Blob | null = null;
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: (blob: Blob) => {
        saved = blob;
        return 'blob:test';
      },
      revokeObjectURL: () => undefined,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderSettings();
    await user.click(screen.getByRole('button', { name: copy.settings.exportData }));
    await vi.waitFor(() => {
      expect(useToastStore.getState().toast?.text).toMatch(
        /^1件を書き出しました \(キューブ手順帳-\d{4}-\d{2}-\d{2}\.json\)$/,
      );
    });
    expect(saved).not.toBeNull();
    expect(JSON.parse(await (saved ?? fileOf('')).text())).toEqual(useDocumentStore.getState().document);
  });

  it('置き換えで読み込むと今の登録が消え、ファイルの中身になる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    const imported = { ...createEmptyDocument(), categories: [{ id: 'c1', name: 'ZBLL' }] };
    renderSettings();
    await openImportSheet(user);
    await user.click(screen.getByRole('radio', { name: new RegExp(copy.settings.importReplace) }));
    await user.upload(fileInput(), fileOf(JSON.stringify(imported)));
    await vi.waitFor(() => {
      expect(useDocumentStore.getState().document).toEqual(imported);
    });
  });

  it('読み込みは元に戻せる', async () => {
    const user = userEvent.setup();
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    const before = useDocumentStore.getState().document;
    renderSettings();
    await openImportSheet(user);
    await user.click(screen.getByRole('radio', { name: new RegExp(copy.settings.importReplace) }));
    await user.upload(fileInput(), fileOf(JSON.stringify(createEmptyDocument())));
    await vi.waitFor(() => {
      expect(useDocumentStore.getState().document.registrations).toHaveLength(0);
    });
    useToastStore.getState().toast?.action?.run();
    expect(useDocumentStore.getState().document).toEqual(before);
  });

  it('読めないファイルは知らせるだけで、文書は変わらない', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    useDocumentStore.getState().addRegistration('pll-ua', UA_ALG);
    const before = useDocumentStore.getState().document;
    renderSettings();
    await openImportSheet(user);
    await user.upload(fileInput(), fileOf('{ not json'));
    expect(await screen.findByRole('alertdialog', { name: copy.settings.importFailedTitle })).toBeInTheDocument();
    expect(useDocumentStore.getState().document).toEqual(before);
    await user.click(screen.getByRole('button', { name: copy.dialog.close }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
