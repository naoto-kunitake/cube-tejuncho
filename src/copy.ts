import type { PllShape } from '@/data/presets/pll';
import type { AlgError } from '@/lib/alg/parse';
import type { SideName, SideRun } from '@/lib/figure/describe';

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
    play: string;
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
    title: (name: string) => string;
    save: string;
    recognition: string;
    recognitionHint: (runs: string[]) => string;
    sideRun: (side: SideName, run: SideRun) => string;
    noRuns: string;
    mainAlg: string;
    altAlg: (number: number) => string;
    algPlaceholder: string;
    makeMain: string;
    deleteAlg: string;
    addAlg: string;
    addStandardAlg: string;
    algError: (error: AlgError) => string;
    seeNotation: string;
    deleteMainAlgTitle: string;
    deleteAltAlgTitle: (number: number) => string;
    deletedAlg: string;
    discardTitle: string;
    discard: string;
    restoredDraft: string;
    removedRegistration: (name: string) => string;
  };
  keypad: {
    backspace: string;
    clear: string;
    keyboard: string;
  };
  dialog: {
    cancel: string;
  };
  toast: {
    undo: string;
  };
  settings: {
    title: string;
  };
  notation: {
    title: string;
  };
  player: {
    loading: string;
    failed: string;
    failedHint: string;
    retry: string;
  };
  a11y: {
    list: string;
    detail: string;
    categoryTabs: string;
    openSettings: string;
    backToList: string;
    edit: string;
    editPattern: (name: string) => string;
    closeEdit: string;
    keypad: string;
    tile: (category: string, name: string, isRegistered: boolean) => string;
    cueFigure: (name: string) => string;
    playerSheet: string;
    closeSheet: string;
    play: string;
    pause: string;
    toStart: string;
    stepBack: string;
    stepForward: string;
    toEnd: string;
  };
};

const SIDE_NAMES: Record<SideName, string> = { back: '後ろ', front: '前', left: '左', right: '右' };
const SIDE_RUNS: Record<SideRun, string> = { bar: '3連', headlights: 'ヘッドライト', pair: '2連' };

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
    play: '再生',
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
    title: (name) => `${name} を編集`,
    save: '保存',
    recognition: '判断',
    recognitionHint: (runs) => `例: ${runs.join('、')}`,
    sideRun: (side, run) => `${SIDE_NAMES[side]}に${SIDE_RUNS[run]}`,
    noRuns: '揃った塊なし',
    mainAlg: 'メイン手順',
    altAlg: (number) => `手順 ${number}`,
    algPlaceholder: "例: R U R' U'",
    makeMain: 'メインにする',
    deleteAlg: '削除',
    addAlg: '手順を追加',
    addStandardAlg: '基本手順を追加',
    algError: (error) => {
      switch (error.kind) {
        case 'empty':
          return '';
        case 'unknownSymbol':
          return `読めない記号があります: ${error.symbol}`;
        case 'unbalancedParenthesis':
          return '括弧が閉じていません';
        case 'nestedParenthesis':
          return '括弧の中に括弧は書けません';
        case 'emptyGroup':
          return '空の括弧があります';
      }
    },
    seeNotation: '回転記号を見る',
    deleteMainAlgTitle: 'メイン手順を削除',
    deleteAltAlgTitle: (number) => `手順 ${number} を削除`,
    deletedAlg: '手順を削除しました',
    discardTitle: '変更を破棄',
    discard: '破棄',
    restoredDraft: '書きかけを復元しました',
    removedRegistration: (name) => `${name} の登録を消しました`,
  },
  keypad: {
    backspace: '削除',
    clear: '全消去',
    keyboard: 'キーボード',
  },
  dialog: {
    cancel: 'キャンセル',
  },
  toast: {
    undo: '元に戻す',
  },
  settings: {
    title: '設定',
  },
  notation: {
    title: '回転記号',
  },
  player: {
    loading: '読み込み中…',
    failed: '読み込めませんでした',
    failedHint: '通信を確認してもう一度お試しください',
    retry: '再試行',
  },
  a11y: {
    list: '一覧',
    detail: '詳細',
    categoryTabs: 'カテゴリ',
    openSettings: '設定',
    backToList: '一覧へ戻る',
    edit: '編集',
    editPattern: (name) => `${name} を編集`,
    closeEdit: '閉じる',
    keypad: '手順キーパッド',
    tile: (category, name, isRegistered) => `${category} ${name}${isRegistered ? '' : '、未登録'}`,
    cueFigure: (name) => `${name} の判断の手がかり`,
    playerSheet: '手順の再生',
    closeSheet: '閉じる',
    play: '再生',
    pause: '一時停止',
    toStart: '最初へ',
    stepBack: '1手戻る',
    stepForward: '1手進む',
    toEnd: '最後へ',
  },
} satisfies Copy;
