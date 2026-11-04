// タイルの上に出る文脈つきの案内の枠 (初回の登録の案内とホーム画面の案内で同じ)。
// 文字ボタンは36の中に14 × 1.55の行を中央に置くので、上下に約7の空きを持つ。
// その分を見込んで下と間を詰め、上14・下6 + 7・間6 + 7で文章とボタンの行の間隔を揃える
export const BANNER_CLASS = 'flex flex-col gap-1.5 rounded-md border border-line bg-surface pt-3.5 pr-2 pb-1.5 pl-4';
