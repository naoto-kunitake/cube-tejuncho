// ライセンス画面に列挙する、配信物に含まれるソフトウェア。名前は文言 (copy.about.credits) にある。
// 参考にしただけのもの (デザインシステムの色など) は配布物に含まれないので載せない
export const CREDIT_IDS = ['cubing', 'jetbrainsMono'] as const;
export type CreditId = (typeof CREDIT_IDS)[number];

export type Credit = {
  id: CreditId;
  license: string;
  licenseUrl: string;
};

// idごとの表をRecordにして、idを増やしたときの書き忘れを型で止める。
// 原文のURLはブランチではなくタグを指す (改名や削除で404にならない。ライセンス文は版が変わっても同じ)
const CREDIT_INFO: Record<CreditId, Omit<Credit, 'id'>> = {
  // MPL-2.0とGPL-3.0のデュアル。MPL-2.0を選ぶとアプリ側のコードに伝播しない
  cubing: { license: 'MPL-2.0', licenseUrl: 'https://github.com/cubing/cubing.js/blob/v0.66.1/LICENSE-MPL.md' },
  jetbrainsMono: {
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://github.com/JetBrains/JetBrainsMono/blob/v2.304/OFL.txt',
  },
};

export const CREDITS: readonly Credit[] = CREDIT_IDS.map((id) => ({ id, ...CREDIT_INFO[id] }));
