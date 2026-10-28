import { ExternalLink } from 'lucide-react';

import { copy } from '@/copy';
import { CREDITS } from '@/data/credits';

import { AboutLayout } from './AboutLayout';

type LicenseRowProps = {
  name: string;
  license: string;
  href: string;
};

// 行 = 名前 + ライセンス名。押すとライセンスの原文 (外部) を新しいタブで開く。
// 著作権表示は原文の冒頭にあるので、行には出さない
function LicenseRow({ name, license, href }: LicenseRowProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-13 items-center justify-between gap-3 border-t border-line px-4 py-3 text-ink pressable first:border-t-0 hover:bg-hover active:bg-press"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-body">{name}</span>
        <span className="mt-0.5 block text-label text-muted">{license}</span>
      </span>
      <ExternalLink size={18} strokeWidth={1.8} aria-hidden="true" className="flex-none text-muted" />
    </a>
  );
}

// 配信物に含まれるソフトウェアのライセンス。cubing.js (MPL-2.0) はソースの入手先を示す義務、
// JetBrains Mono (OFL) はライセンス文を添える義務があるので、原文へ飛べる一覧にする。
// 説明文は置かない (題と外部リンクの記号で足りる)。自分のコードのライセンスは未定なので、決まるまで行を出さない
export function LicensesScreen() {
  return (
    <AboutLayout title={copy.about.licenses}>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        {CREDITS.map((credit) => (
          <LicenseRow
            key={credit.id}
            name={copy.about.credits[credit.id]}
            license={credit.license}
            href={credit.licenseUrl}
          />
        ))}
      </div>
    </AboutLayout>
  );
}
