import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { NoticeDialog } from './NoticeDialog';

// 文書の読み込みと保存の問題を知らせる。黙って空で始まると利用者は気づけず、書き出しの機会も失う
export function StorageIssueNotice() {
  const storageIssue = useDocumentStore((state) => state.storageIssue);
  const dismissStorageIssue = useDocumentStore((state) => state.dismissStorageIssue);
  if (storageIssue === null) {
    return null;
  }
  const notice = copy.notice[storageIssue];
  return <NoticeDialog title={notice.title} body={notice.body} onClose={dismissStorageIssue} />;
}
