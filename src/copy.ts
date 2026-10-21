import type { PllShape } from '@/data/presets/pll';

// 鍵の形を型にしておき、英語版を足すときは同じ Copy を満たす別ファイルを置く
type Copy = {
  list: {
    title: string;
    categories: Record<'pll', string>;
    registeredCount: (registered: number, total: number) => string;
    pllShapes: Record<PllShape, string>;
    standardOrder: string;
  };
  detail: {
    notFound: string;
    alg: string;
    altAlgs: string;
    standardAlg: string;
    useThisAlg: string;
    registerMyself: string;
    writeRecognition: string;
    mnemonic: string;
    fingering: string;
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
  a11y: {
    list: string;
    detail: string;
    categoryTabs: string;
    openSettings: string;
    backToList: string;
    tile: (category: string, name: string, isRegistered: boolean) => string;
    cueFigure: (name: string) => string;
  };
};

export const copy = {
  list: {
    title: 'キューブ手順帳',
    categories: { pll: 'PLL' },
    registeredCount: (registered, total) => `登録済み ${registered}/${total}`,
    pllShapes: {
      headlights4: 'ヘッドライト4つ',
      barAndHeadlights3: '3連とヘッドライト3つ',
      headlights1: 'ヘッドライト1つ',
      bar1: '3連1つ',
      none: 'ヘッドライト・3連なし',
    },
    standardOrder: '標準順',
  },
  detail: {
    notFound: 'パターンが見つかりません',
    alg: '手順',
    altAlgs: 'ほかの手順',
    standardAlg: '基本手順',
    useThisAlg: 'この手順を使う',
    registerMyself: '自分で登録',
    writeRecognition: '判断を書く',
    mnemonic: '覚え方',
    fingering: '指使い',
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
  a11y: {
    list: '一覧',
    detail: '詳細',
    categoryTabs: 'カテゴリ',
    openSettings: '設定',
    backToList: '一覧へ戻る',
    tile: (category, name, isRegistered) => `${category} ${name}${isRegistered ? '' : '、未登録'}`,
    cueFigure: (name) => `${name} の判断の手がかり`,
  },
} satisfies Copy;
