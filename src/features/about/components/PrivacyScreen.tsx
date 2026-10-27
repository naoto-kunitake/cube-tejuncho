import { ExternalLink } from 'lucide-react';

import { copy } from '@/copy';

import { AboutLayout } from './AboutLayout';

const PARAGRAPH_CLASS = 'text-small leading-relaxed text-ink';

// データを端末の外に送らないことを短く示す文書。読み物なので設定のカードには入れず、見出し + 段落の素の組みにする
// (Apple・Googleの法務ページ、iOS設定の「法律に基づく情報」と同じ型)。更新日は読む前に版が分かるよう題の直下。文章なので句点あり
export function PrivacyScreen() {
  return (
    <AboutLayout title={copy.about.privacy}>
      <p className="-mt-2 text-label text-muted">{copy.about.privacyUpdated}</p>
      {copy.about.privacySections.map((section) => (
        <section key={section.title} className="flex flex-col gap-1">
          <h2 className="text-body font-bold text-ink-strong">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className={PARAGRAPH_CLASS}>
              {paragraph}
            </p>
          ))}
          {section.linkParagraph !== undefined && (
            <p className={PARAGRAPH_CLASS}>
              {section.linkParagraph.before}
              <a
                href={section.linkParagraph.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-bold text-accent underline underline-offset-2"
              >
                {section.linkParagraph.label}
                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
              </a>
              {section.linkParagraph.after}
            </p>
          )}
        </section>
      ))}
    </AboutLayout>
  );
}
