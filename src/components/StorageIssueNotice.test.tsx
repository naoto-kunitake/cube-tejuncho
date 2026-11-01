import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { StorageIssueNotice } from './StorageIssueNotice';

beforeEach(() => {
  useDocumentStore.setState({ storageIssue: null });
});

describe('StorageIssueNotice', () => {
  it('問題がなければ何も出さない', () => {
    render(<StorageIssueNotice />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('壊れた文書を読んだときは退避したことを知らせる', () => {
    useDocumentStore.setState({ storageIssue: 'brokenDocument' });
    render(<StorageIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.brokenDocument.title);
  });

  it('保存が容量超過で失敗したときは知らせる', () => {
    useDocumentStore.setState({ storageIssue: 'quotaExceeded' });
    render(<StorageIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.quotaExceeded.title);
  });

  it('localStorage が使えないときは知らせる', () => {
    useDocumentStore.setState({ storageIssue: 'storageUnavailable' });
    render(<StorageIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.storageUnavailable.title);
  });

  it('閉じると消える', async () => {
    useDocumentStore.setState({ storageIssue: 'brokenDocument' });
    render(<StorageIssueNotice />);
    await userEvent.click(screen.getByRole('button', { name: copy.dialog.close }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
