// 鍵の形を型にしておき、英語版を足すときは同じ Copy を満たす別ファイルを置く
type Copy = {
  list: {
    title: string;
  };
  detail: {
    title: string;
  };
  edit: {
    title: string;
  };
  settings: {
    title: string;
  };
  notation: {
    title: string;
  };
};

export const copy = {
  list: {
    title: 'キューブ手順帳',
  },
  detail: {
    title: '詳細',
  },
  edit: {
    title: '編集',
  },
  settings: {
    title: '設定',
  },
  notation: {
    title: '回転記号',
  },
} satisfies Copy;
