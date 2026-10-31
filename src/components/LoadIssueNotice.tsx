import { copy } from '@/copy';
import { useDocumentStore } from '@/data/store';

import { NoticeDialog } from './NoticeDialog';

// 文書の読み込みと保存の問題を知らせる。黙って空で始まると利用者は気づけず、書き出しの機会も失う
export function LoadIssueNotice() {
  const loadIssue = useDocumentStore((state) => state.loadIssue);
  const dismissLoadIssue = useDocumentStore((state) => state.dismissLoadIssue);
  if (loadIssue === null) {
    return null;
  }
  const notice = copy.notice[loadIssue];
  return <NoticeDialog title={notice.title} body={notice.body} onClose={dismissLoadIssue} />;
}
