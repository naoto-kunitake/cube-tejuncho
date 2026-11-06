import { Play } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router';

import { CubeFigure } from '@/components/figures/CubeFigure';
import { IconButton } from '@/components/IconButton';
import { PlayerSheet } from '@/components/player/PlayerSheet';
import { ROW_CARD_CLASS } from '@/components/row-card';
import { BackLink, Screen, ScreenBody, ScreenHeader } from '@/components/Screen';
import { Section } from '@/components/Section';
import { copy, type NotationRowText } from '@/copy';
import { type NotationRow, notationSectionsOf } from '@/data/notation';
import { useDocumentStore } from '@/data/store';
import { WIDE_STYLES } from '@/lib/alg/format';
import { moveFigureView } from '@/lib/figure/move';

const SETTINGS_PATH = '/settings';

// 戻る先は開いた元の画面 (設定 / 詳細 / 編集)。リンクのstateで受け取り、直接開いたときは設定へ
function backPathOf(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from;
  }
  return SETTINGS_PATH;
}

type NotationRowProps = {
  row: NotationRow;
  onPlay: (alg: string) => void;
};

// 行 = 動く層だけ色の図48 + 記号 (等幅17) + 説明14 (副は13の小さい行) + 再生 (枠なし36)。行の左右は16。
// 行の高さは52で、図は上下-6・左-4の負マージンで収める (図の見た目の左端が文字の余白16に揃う)。
// 説明が2行になる行 (副あり、狭い幅の折り返し) は説明の上下12で伸びる
function NotationRowItem({ row, onPlay }: NotationRowProps) {
  const settings = useDocumentStore((state) => state.document.settings);
  const text: NotationRowText = copy.notation.rows[row.id];
  const { move } = row;
  return (
    <div className="flex min-h-13 items-center gap-3 border-t border-line px-4 text-ink first:border-t-0">
      {move === null ? (
        <span aria-hidden="true" className="-my-1.5 -ml-1 size-12 flex-none" />
      ) : (
        <CubeFigure
          view={moveFigureView(move, settings)}
          label={copy.a11y.moveFigure(row.symbol)}
          className="-my-1.5 -ml-1 size-12 flex-none"
        />
      )}
      <span className="w-11 flex-none font-mono text-alg-compact font-semibold">{row.symbol}</span>
      <span className="min-w-0 flex-1 py-3 text-small leading-snug">
        {text.description}
        {text.sub !== undefined && <span className="mt-0.5 block text-label text-muted">{text.sub}</span>}
      </span>
      {move !== null && (
        <IconButton
          label={copy.a11y.playMove(row.symbol)}
          on="surface"
          className="-mr-2"
          onClick={() => {
            onPlay(move.alg);
          }}
        >
          <Play size={16} strokeWidth={2} fill="currentColor" className="ml-0.5" aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}

// 回転記号の説明。WCAの記法の構成 (面の回転 / 向きと回数 / 中層 / 2層回し / 持ち替え / 括弧) で22行。
// 再生は既存の再生シートで1手だけ動かす
export function NotationScreen() {
  const location = useLocation();
  const settings = useDocumentStore((state) => state.document.settings);
  const [playingAlg, setPlayingAlg] = useState<string | null>(null);
  const otherWideStyle = WIDE_STYLES.find((style) => style !== settings.wideStyle) ?? settings.wideStyle;
  const sections = notationSectionsOf(settings.wideStyle);

  return (
    <Screen label={copy.notation.title}>
      <ScreenHeader
        title={copy.notation.title}
        leading={<BackLink to={backPathOf(location.state)} label={copy.a11y.back} />}
      />
      <ScreenBody>
        {sections.map((section) => {
          const lead = copy.notation.leads[section.id](otherWideStyle);
          return (
            <Section key={section.id} title={copy.notation.sections[section.id]}>
              {lead !== '' && <p className="text-label leading-relaxed text-muted">{lead}</p>}
              <div className={ROW_CARD_CLASS}>
                {section.rows.map((row) => (
                  <NotationRowItem key={row.id} row={row} onPlay={setPlayingAlg} />
                ))}
              </div>
            </Section>
          );
        })}
      </ScreenBody>
      {playingAlg !== null && (
        <PlayerSheet
          algText={playingAlg}
          category={undefined}
          settings={settings}
          onClose={() => {
            setPlayingAlg(null);
          }}
        />
      )}
    </Screen>
  );
}
