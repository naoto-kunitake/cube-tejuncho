import { useSearchParams } from 'react-router';

import { useDocumentStore } from '@/data/store';

const CATEGORY_PARAM = 'category';

// 一覧のカテゴリはURLの検索パラメータ。共有したURLでそのカテゴリが開き、戻る操作で履歴を増やさない
export function useCategory(available: readonly string[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const lastTab = useDocumentStore((state) => state.document.settings.lastTab);
  const setLastTab = useDocumentStore((state) => state.setLastTab);
  const requested = searchParams.get(CATEGORY_PARAM) ?? lastTab;
  // 無効な値は表示だけ既定に戻し、URLは書き換えない (描画中の副作用を避ける。次にタブを選べば正しい値に置き換わる)
  const categoryId = available.includes(requested) ? requested : (available[0] ?? requested);
  // 起動時の復元用に、最後に開いたタブも文書に残す
  const selectCategory = (next: string) => {
    setSearchParams({ [CATEGORY_PARAM]: next }, { replace: true });
    setLastTab(next);
    // 中身は1つの器で入れ替わるので、前のタブで下まで送った位置が次のタブに残る。
    // スワイプは下まで送った位置からでも起きるので、タブの列が見える先頭に戻す
    window.scrollTo(0, 0);
  };
  return { categoryId, selectCategory };
}
