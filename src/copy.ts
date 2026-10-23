import type { PresetCategoryId } from '@/data/presets/catalog';
import type { F2lShape } from '@/data/presets/f2l';
import type { OllShape } from '@/data/presets/oll';
import type { PllShape } from '@/data/presets/pll';
import type { AlgError } from '@/lib/alg/parse';
import type { SideName, SideRun } from '@/lib/figure/describe';
import type { F2lDescription, WhiteFacing } from '@/lib/figure/describe-f2l';
import type { TopColor } from '@/lib/figure/view';

// 鍵の形を型にしておき、英語版を足すときは同じ Copy を満たす別ファイルを置く
type Copy = {
  list: {
    title: string;
    categories: Record<PresetCategoryId, string>;
    registeredCount: (registered: number, total: number) => string;
    pllShapes: Record<PllShape, string>;
    ollShapes: Record<OllShape, string>;
    // F2L の「白」はクロスの色。上面が白の設定ではクロスが黄になるので、表示のときに置き換える
    crossColor: Record<TopColor, string>;
    f2lShapes: Record<F2lShape, (cross: string) => string>;
    // 種類ごとでないときの見出し (PLL は標準順、OLL / F2L は番号順)
    standardOrder: Record<PresetCategoryId, string>;
    addPattern: string;
    noAlg: string;
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
    registerAlg: string;
    mnemonic: string;
    fingering: string;
  };
  edit: {
    title: (name: string) => string;
    newTitle: string;
    save: string;
    name: string;
    category: string;
    deletePattern: string;
    deletePatternTitle: (name: string) => string;
    deletePatternAction: string;
    deletedPattern: (name: string) => string;
    recognition: string;
    recognitionHint: (runs: string[]) => string;
    sideRun: (side: SideName, run: SideRun) => string;
    noRuns: string;
    f2lRecognition: (description: F2lDescription, cross: string, shapeLabel: string) => string;
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
    close: string;
  };
  toast: {
    undo: string;
  };
  settings: {
    title: string;
    categories: string;
    preset: string;
    patternCount: (count: number) => string;
    addCategory: string;
    newCategoryTitle: string;
    categoryName: string;
    categoryNamePlaceholder: string;
    duplicateCategory: string;
    add: string;
    data: string;
    dataHint: string;
    exportData: string;
    importData: string;
    importAdd: string;
    importAddHint: string;
    importReplace: string;
    importReplaceHint: string;
    chooseFile: string;
    exportFileName: (date: string) => string;
    exported: (count: number, fileName: string) => string;
    imported: (count: number) => string;
    importFailedTitle: string;
    importFailedBody: string;
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
    categorySheet: string;
    importSheet: string;
    importMode: string;
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
const WHITE_FACING_LABEL: Record<WhiteFacing, string> = { down: '下', front: '前', right: '右' };

export const copy = {
  list: {
    title: 'キューブ手順帳',
    categories: { pll: 'PLL', oll: 'OLL', f2l: 'F2L' },
    registeredCount: (registered, total) => `登録済み ${registered}/${total}`,
    pllShapes: {
      headlights4: 'ヘッドライト4つ',
      barAndHeadlights3: '3連とヘッドライト3つ',
      headlights1: 'ヘッドライト1つ',
      bar1: '3連1つ',
      none: 'ヘッドライト・3連なし',
    },
    // OLL の呼び名は日本語圏で複数の出典がある語を優先し (だーおか・cubequest)、定訳のない群は説明的な語
    ollShapes: {
      cross: '十字',
      cornersOriented: 'コーナー揃い',
      t: 'T型',
      line: 'I型',
      c: 'C型',
      z: 'Z型',
      bigL: 'L字型',
      p: 'P型',
      square: 'スクエア',
      lightning: 'サンダー',
      fish: 'フィッシュ',
      w: 'W型',
      smallL: '小L型',
      other: 'その他',
      dot: 'ドット',
    },
    crossColor: { yellow: '白', white: '黄' },
    // 群はパーツの位置が最上位 (両方上面 → 片方スロット → 両方スロット)。用語は界隈のカタカナ語 (コーナー / エッジ / スロット)
    f2lShapes: {
      bothUpSameColor: () => '両方上面・色が同じ',
      bothUpDifferentColor: () => '両方上面・色が違う',
      bothUpWhiteUp: (cross) => `両方上面・${cross}が上`,
      cornerInSlot: () => 'コーナーがスロット',
      edgeInSlot: () => 'エッジがスロット',
      bothInSlot: () => '両方スロット',
    },
    standardOrder: { pll: '標準順', oll: '番号順', f2l: '番号順' },
    addPattern: 'パターンを追加',
    noAlg: '手順なし',
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
    registerAlg: '手順を登録',
    mnemonic: '覚え方',
    fingering: '指使い',
  },
  edit: {
    title: (name) => `${name} を編集`,
    newTitle: '新しいパターン',
    save: '保存',
    name: '名前',
    category: 'カテゴリ',
    deletePattern: 'このパターンを削除',
    deletePatternTitle: (name) => `「${name}」を削除`,
    deletePatternAction: '削除',
    deletedPattern: (name) => `「${name}」を削除しました`,
    recognition: '判断',
    recognitionHint: (runs) => `例: ${runs.join('、')}`,
    sideRun: (side, run) => `${SIDE_NAMES[side]}に${SIDE_RUNS[run]}`,
    noRuns: '揃った塊なし',
    f2lRecognition: (description, cross, shapeLabel) => {
      switch (description.kind) {
        case 'bothUp':
          return shapeLabel;
        case 'cornerInSlot':
          return `コーナーがスロット、${cross}が${WHITE_FACING_LABEL[description.whiteFacing]}、エッジは上面`;
        case 'edgeInSlot':
          return `エッジがスロット、コーナーの${cross}が${description.isWhiteUp ? '上' : '横'}`;
        case 'bothInSlot':
          return `両方スロット、コーナーの${cross}が${WHITE_FACING_LABEL[description.whiteFacing]}`;
      }
    },
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
    close: '閉じる',
  },
  toast: {
    undo: '元に戻す',
  },
  settings: {
    title: '設定',
    categories: 'カテゴリ',
    preset: 'プリセット',
    patternCount: (count) => `${count}件`,
    addCategory: 'カテゴリを追加',
    newCategoryTitle: '新しいカテゴリ',
    categoryName: '名前',
    categoryNamePlaceholder: '例: F2L、COLL、練習中',
    duplicateCategory: '同じ名前のカテゴリがあります',
    add: '追加',
    data: 'データ',
    dataHint: '書き出したファイルがバックアップになります',
    exportData: '書き出す',
    importData: '読み込む',
    importAdd: '追加',
    importAddHint: '同じパターンは新しい方を残す',
    importReplace: '置き換え',
    importReplaceHint: '今のデータを消してから入れる',
    chooseFile: 'ファイルを選ぶ',
    exportFileName: (date) => `キューブ手順帳-${date}.json`,
    exported: (count, fileName) => `${count}件を書き出しました (${fileName})`,
    imported: (count) => `${count}件を読み込みました`,
    importFailedTitle: '読み込めませんでした',
    importFailedBody: 'このアプリで書き出したファイルを選んでください。',
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
    categorySheet: 'カテゴリ',
    importSheet: '読み込む',
    importMode: '読み込み方',
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
