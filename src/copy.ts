import type { CreditId } from '@/data/credits';
import type { Settings } from '@/data/document';
import type { NotationRowId, NotationSectionId } from '@/data/notation';
import type { PresetCategoryId } from '@/data/presets/catalog';
import type { F2lShape } from '@/data/presets/f2l';
import type { OllShape } from '@/data/presets/oll';
import type { PllShape } from '@/data/presets/pll';
import type { WideStyle } from '@/lib/alg/format';
import type { AlgError } from '@/lib/alg/parse';
import type { SideName, SideRun } from '@/lib/figure/describe';
import type { F2lDescription, WhiteFacing } from '@/lib/figure/describe-f2l';
import type { FrontColor, TopColor } from '@/lib/figure/view';
import type { Appearance } from '@/lib/theme/color';
import type { ThemePresetId } from '@/lib/theme/palette';

// 回転記号の行: 主 (説明) + 副 (小さい行)。satisfies で絞られた型を画面で広げ直すために公開する
export type NotationRowText = { description: string; sub?: string };

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
    pinned: string;
    others: string;
    emptyTitle: string;
    emptyHint: string;
    registerAll: string;
    registeredAll: (count: number) => string;
    dismissBanner: string;
    homeScreenTitle: string;
    homeScreenHint: string;
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
    editCategoryTitle: string;
    categoryName: string;
    categoryNamePlaceholder: string;
    duplicateCategory: string;
    add: string;
    save: string;
    deleteCategory: string;
    deleteCategoryTitle: (name: string) => string;
    deleteCategoryBody: (count: number) => string;
    deleteCategoryAction: string;
    deletedCategory: (name: string) => string;
    list: string;
    sortOrderOf: (category: string) => string;
    byShape: string;
    figure: string;
    topColor: string;
    topColors: Record<TopColor, string>;
    frontColor: string;
    frontColors: Record<FrontColor, string>;
    showArrows: string;
    showCueFigure: string;
    playback: string;
    playbackSpeed: string;
    playbackSpeeds: Record<Settings['playbackSpeed'], string>;
    greyUnrelated: string;
    notation: string;
    wideStyle: string;
    appearance: string;
    themeColor: string;
    openNotation: string;
    themeColors: Record<ThemePresetId, string>;
    customColor: string;
    appearanceMode: string;
    appearances: Record<Appearance, string>;
    data: string;
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
    registerAll: string;
    unregisteredCount: (count: number) => string;
    register: string;
    registeredAll: (count: number) => string;
    clearRegistrations: string;
    registeredCount: (count: number) => string;
    // 「登録 N件」(プリセット) と並べるので、区画の patternCount (「N件」だけ) とは別に接頭の語を付ける
    patternCountWithLabel: (count: number) => string;
    clear: string;
    clearTitle: (names: readonly string[]) => string;
    clearBody: (count: number) => string;
    cleared: (count: number) => string;
    reset: string;
    resetBody: string;
    resetAction: string;
    resetDone: string;
  };
  about: {
    title: string;
    version: string;
    licenses: string;
    privacy: string;
    credits: Record<CreditId, string>;
    // 問い合わせの節だけ、文中に外部リンクを持つ段落がある
    privacySections: readonly {
      title: string;
      body: readonly string[];
      linkParagraph?: { before: string; label: string; href: string; after: string };
    }[];
    privacyUpdated: string;
  };
  notation: {
    title: string;
    sections: Record<NotationSectionId, string>;
    // 区画の説明 (ない区画は空)。2 層回しはもう一方の書き方を併記する
    leads: Record<NotationSectionId, (otherWideStyle: WideStyle) => string>;
    rows: Record<NotationRowId, NotationRowText>;
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
    firstRun: string;
    homeScreenHint: string;
    openSettings: string;
    switchToList: string;
    switchToGrid: string;
    backToList: string;
    back: string;
    edit: string;
    editPattern: (name: string) => string;
    pin: string;
    closeEdit: string;
    keypad: string;
    categorySheet: string;
    reorderHandle: (name: string) => string;
    reorderHint: string;
    reorderMoved: (name: string, position: number, count: number) => string;
    importSheet: string;
    importMode: string;
    registerAllSheet: string;
    clearSheet: string;
    pickCategories: string;
    tile: (category: string, name: string, isRegistered: boolean) => string;
    cueFigure: (name: string) => string;
    playerSheet: string;
    closeSheet: string;
    playMove: (symbol: string) => string;
    moveFigure: (symbol: string) => string;
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
    pinned: 'ピン留め',
    others: 'その他',
    emptyTitle: '登録された手順はありません',
    emptyHint: 'パターンを開くと登録できます',
    registerAll: '基本手順を一括登録',
    registeredAll: (count) => `${count}件を登録しました`,
    dismissBanner: '閉じる',
    // iOS の Safari は 7 日間使われないサイトのデータを消すことがある。ホーム画面に追加すれば対象外
    homeScreenTitle: 'ホーム画面に追加しておくとデータが消えません',
    homeScreenHint: '共有ボタンから「ホーム画面に追加」を選ぶ',
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
    title: (name) => `${name}を編集`,
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
    deleteAltAlgTitle: (number) => `手順 ${number}を削除`,
    deletedAlg: '手順を削除しました',
    discardTitle: '変更を破棄',
    discard: '破棄',
    restoredDraft: '書きかけを復元しました',
    removedRegistration: (name) => `${name}の登録を消しました`,
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
    editCategoryTitle: 'カテゴリを編集',
    categoryName: '名前',
    categoryNamePlaceholder: '例: F2L、COLL、練習中',
    duplicateCategory: '同じ名前のカテゴリがあります',
    add: '追加',
    save: '保存',
    deleteCategory: 'このカテゴリを削除',
    deleteCategoryTitle: (name) => `「${name}」を削除`,
    // 中身が消える事実は自明でないので、件数つきの本文を出す
    deleteCategoryBody: (count) => `中のパターン${count}件も削除されます。`,
    deleteCategoryAction: '削除',
    deletedCategory: (name) => `「${name}」を削除しました`,
    list: '一覧',
    sortOrderOf: (category) => `${category}の並び順`,
    byShape: '種類ごと',
    figure: '図',
    topColor: '上面の色',
    topColors: { yellow: '黄', white: '白' },
    frontColor: '前面の色',
    frontColors: { green: '緑', red: '赤', blue: '青', orange: '橙' },
    showArrows: '入れ替えの矢印',
    showCueFigure: '判断の手がかり',
    playback: '再生',
    playbackSpeed: '速度',
    playbackSpeeds: { slow: '遅い', normal: '標準', fast: '速い' },
    greyUnrelated: '関係ないパーツを灰色に',
    notation: '表記',
    wideStyle: '2層回しの表記',
    appearance: '外観',
    themeColor: 'テーマ色',
    openNotation: '回転記号',
    themeColors: {
      ink: '墨',
      red: '赤',
      orange: '橙',
      yellow: '黄',
      green: '緑',
      teal: '青緑',
      blue: '青',
      purple: '紫',
      pink: '桃',
    },
    customColor: '自分で選ぶ',
    // iOS の設定と同じ語。「自動」は端末のダークモードに追従する意味 (「システム」は 360 幅で収まらない)
    appearanceMode: '外観モード',
    appearances: { auto: '自動', light: 'ライト', dark: 'ダーク' },
    data: 'データ',
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
    registerAll: '基本手順を一括登録',
    unregisteredCount: (count) => `未登録 ${count}件`,
    register: '登録',
    registeredAll: (count) => `${count}件を登録しました`,
    clearRegistrations: '登録を消す',
    registeredCount: (count) => `登録 ${count}件`,
    patternCountWithLabel: (count) => `パターン ${count}件`,
    clear: '消す',
    clearTitle: (names) => `${names.join('・')}の登録を消す`,
    // 「手順・判断・メモ」は登録の内訳で自明なので数だけ
    clearBody: (count) => `${count}件を消します。`,
    cleared: (count) => `${count}件を消しました`,
    reset: '初期状態に戻す',
    resetBody: '登録、自作のパターンとカテゴリ、設定をすべて消します。',
    resetAction: '消す',
    resetDone: '初期状態に戻しました',
  },
  about: {
    title: 'このアプリについて',
    version: 'バージョン',
    licenses: 'ライセンス',
    privacy: 'プライバシーポリシー',
    credits: { cubing: 'cubing.js', jetbrainsMono: 'JetBrains Mono' },
    // 文書なので句点あり。一般公開の版を最小の形で書き、事実 (計測・問い合わせ先・配信元) が変わったときだけ改定する
    privacySections: [
      { title: '運営者', body: ['naoto-kunitake'] },
      {
        title: '集める情報',
        body: [
          'このアプリは、利用者の個人情報を集めません。アクセス解析や広告の仕組み、Cookieは使いません。',
          '登録した手順などのデータは、お使いの端末のブラウザの中にだけ保存され、外部には送信されません。設定からいつでも消せます。',
        ],
      },
      { title: '通信', body: ['アプリを配信するサーバーが、接続の記録 (IPアドレスなど) を残すことがあります。'] },
      {
        title: '問い合わせ',
        body: [],
        linkParagraph: {
          before: 'GitHubのリポジトリの',
          label: 'Issues',
          href: 'https://github.com/naoto-kunitake/cube-tejuncho/issues',
          after: 'で受け付けます。',
        },
      },
      { title: '変更', body: ['この方針を変えるときは、この画面で知らせます。'] },
    ],
    privacyUpdated: '2026年10月28日 制定',
  },
  notation: {
    title: '回転記号',
    sections: {
      face: '面の回転',
      direction: '向きと回数',
      slice: '中層',
      wide: '2層回し',
      rotation: '持ち替え',
      group: '括弧',
    },
    leads: {
      // 向きの誤解が最も多いので「正面から見て」を必ず添える
      face: () => 'その面を正面から見て時計回りに90°',
      direction: () => '',
      slice: () => '',
      wide: (otherWideStyle) => `面と隣の層を一緒に回す (${otherWideStyle}とも書く)`,
      rotation: () => 'キューブ全体を回す',
      group: () => '',
    },
    // 2 つの情報は句点で繋がず、主 (説明) + 副 (小さい行) に分ける
    rows: {
      R: { description: '右面' },
      L: { description: '左面' },
      U: { description: '上面' },
      D: { description: '下面' },
      F: { description: '前面' },
      B: { description: '後面' },
      prime: { description: '反時計回りに90°' },
      double: { description: '180°' },
      M: { description: '左右の間', sub: 'Lと同じ向き' },
      E: { description: '上下の間', sub: 'Dと同じ向き' },
      S: { description: '前後の間', sub: 'Fと同じ向き' },
      wideR: { description: 'Rと隣の層' },
      wideL: { description: 'Lと隣の層' },
      wideU: { description: 'Uと隣の層' },
      wideD: { description: 'Dと隣の層' },
      wideF: { description: 'Fと隣の層' },
      wideB: { description: 'Bと隣の層' },
      x: { description: 'Rと同じ向き' },
      y: { description: 'Uと同じ向き' },
      z: { description: 'Fと同じ向き' },
      group: { description: '区切り', sub: '回し方は変わらない' },
    },
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
    firstRun: '案内',
    homeScreenHint: 'ホーム画面の案内',
    openSettings: '設定',
    switchToList: 'リスト表示にする',
    switchToGrid: 'グリッド表示にする',
    backToList: '一覧へ戻る',
    back: '戻る',
    edit: '編集',
    editPattern: (name) => `${name}を編集`,
    pin: 'ピン留め',
    closeEdit: '閉じる',
    keypad: '手順キーパッド',
    categorySheet: 'カテゴリ',
    reorderHandle: (name) => `${name}を並べ替え`,
    reorderHint: '上下の矢印キーで動かす',
    reorderMoved: (name, position, count) => `${name}は${position}/${count}番目`,
    importSheet: '読み込む',
    importMode: '読み込み方',
    registerAllSheet: '基本手順を一括登録',
    clearSheet: '登録を消す',
    pickCategories: 'カテゴリ',
    tile: (category, name, isRegistered) => `${category} ${name}${isRegistered ? '' : '、未登録'}`,
    cueFigure: (name) => `${name}の判断の手がかり`,
    playerSheet: '手順の再生',
    closeSheet: '閉じる',
    playMove: (symbol) => `${symbol}を再生`,
    moveFigure: (symbol) => `${symbol}で動く層`,
    play: '再生',
    pause: '一時停止',
    toStart: '最初へ',
    stepBack: '1手戻る',
    stepForward: '1手進む',
    toEnd: '最後へ',
  },
} satisfies Copy;
