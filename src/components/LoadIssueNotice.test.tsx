import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { LoadIssueNotice } from './LoadIssueNotice';

beforeEach(() => {
  useDocumentStore.setState({ loadIssue: null });
});

describe('LoadIssueNotice', () => {
  it('問題がなければ何も出さない', () => {
    render(<LoadIssueNotice />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('壊れた文書を読んだときは退避したことを知らせる', () => {
    useDocumentStore.setState({ loadIssue: 'brokenDocument' });
    render(<LoadIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.brokenDocument.title);
  });

  it('保存が容量超過で失敗したときは知らせる', () => {
    useDocumentStore.setState({ loadIssue: 'quotaExceeded' });
    render(<LoadIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.quotaExceeded.title);
  });

  it('localStorage が使えないときは知らせる', () => {
    useDocumentStore.setState({ loadIssue: 'storageUnavailable' });
    render(<LoadIssueNotice />);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(copy.notice.storageUnavailable.title);
  });

  it('閉じると消える', async () => {
    useDocumentStore.setState({ loadIssue: 'brokenDocument' });
    render(<LoadIssueNotice />);
    await userEvent.click(screen.getByRole('button', { name: copy.dialog.close }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
