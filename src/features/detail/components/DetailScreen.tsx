import { Pencil, Pin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PatternFigures } from '@/components/figures/PatternFigures';
import { BAR_ICON_PROPS } from '@/components/icon';
import { IconButton, IconLink } from '@/components/IconButton';
import { PlayerSheet } from '@/components/player/PlayerSheet';
import { BackLink, Screen, ScreenBody, ScreenHeader } from '@/components/Screen';
import { Section } from '@/components/Section';
import { copy } from '@/copy';
import type { AlgEntry, CustomPattern, Registration, Settings } from '@/data/document';
import { findRegistration } from '@/data/document';
import { findPattern, patternName } from '@/data/patterns';
import type { Preset } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { formatAlg } from '@/lib/alg/format';
import { cn } from '@/lib/utils';

import { AlgCard } from './AlgCard';
import { StandardAlgCard } from './StandardAlgCard';

// 判断や手順が空のときの空枠 (判断を書く / 手順を登録)。押すと編集のその欄へ
const EMPTY_SLOT_CLASS =
  'w-full rounded-md border border-dashed border-line-state px-3 py-2.75 text-center text-body leading-normal text-muted pressable hover:border-line-strong hover:bg-hover-ground';

type RecognitionProps = {
  recognition: string;
  editPath: string;
};

// 判断が空なら、登録済みでも自作でも「判断を書く」の空枠を出す (あとから書き足す入口を同じ場所に置く)
function Recognition({ recognition, editPath }: RecognitionProps) {
  if (recognition !== '') {
    // 見出しは読み上げだけに出す。図の次に文章が始まるのが音声では分からない (位置で分かる画面には出さない)
    return (
      <>
        <h2 className="sr-only">{copy.a11y.recognition}</h2>
        <p className="w-full text-body leading-normal">{recognition}</p>
      </>
    );
  }
  return (
    <Link to={editPath} state={{ focus: 'recognition' }} className={EMPTY_SLOT_CLASS}>
      {copy.detail.writeRecognition}
    </Link>
  );
}

type AltAlgsSectionProps = {
  altAlgs: readonly AlgEntry[];
  wideStyle: Settings['wideStyle'];
  editPath: string;
  onPlay: (algText: string) => void;
};

// ほかの手順。1つもなければ見出しも出さない。通し番号はメイン手順の次から
function AltAlgsSection({ altAlgs, wideStyle, editPath, onPlay }: AltAlgsSectionProps) {
  if (altAlgs.length === 0) {
    return null;
  }
  return (
    <Section title={copy.detail.altAlgs}>
      {altAlgs.map((alg, index) => (
        <AlgCard
          key={index}
          alg={alg}
          wideStyle={wideStyle}
          index={index + 1}
          editPath={editPath}
          onPlay={() => {
            onPlay(alg.text);
          }}
        />
      ))}
    </Section>
  );
}

type PresetDetailProps = {
  preset: Preset;
  registration: Registration | undefined;
  settings: Settings;
  onPlay: (algText: string) => void;
};

function PresetDetail({ preset, registration, settings, onPlay }: PresetDetailProps) {
  const addRegistration = useDocumentStore((state) => state.addRegistration);
  const editPath = `/p/${preset.id}/edit`;

  return (
    <ScreenBody>
      {/* 大きな図 = パターンそのもの (全色 + 矢印)、隣の灰色の図 = 何を見るか。ラベルは付けない (並べば自明) */}
      <div className="flex flex-col items-center gap-6 rounded-md border border-line bg-surface p-4">
        <PatternFigures preset={preset} settings={settings} />
        <Recognition recognition={registration?.recognition ?? ''} editPath={editPath} />
      </div>
      <Section title={copy.detail.alg}>
        {registration === undefined ? (
          <StandardAlgCard
            alg={preset.standardAlg}
            wideStyle={settings.wideStyle}
            editPath={editPath}
            onUse={() => {
              addRegistration(preset.id, { text: preset.standardAlg, mnemonic: '', fingering: '' });
            }}
            onPlay={() => {
              onPlay(preset.standardAlg);
            }}
          />
        ) : (
          <AlgCard
            alg={registration.mainAlg}
            wideStyle={settings.wideStyle}
            index={0}
            editPath={editPath}
            onPlay={() => {
              onPlay(registration.mainAlg.text);
            }}
          />
        )}
      </Section>
      <AltAlgsSection
        altAlgs={registration?.altAlgs ?? []}
        wideStyle={settings.wideStyle}
        editPath={editPath}
        onPlay={onPlay}
      />
    </ScreenBody>
  );
}

type CustomDetailProps = {
  pattern: CustomPattern;
  registration: Registration | undefined;
  settings: Settings;
  onPlay: (algText: string) => void;
};

// 自作は図がないので、図の位置にメイン手順の文字。基本手順の提案もない
function CustomDetail({ pattern, registration, settings, onPlay }: CustomDetailProps) {
  const editPath = `/p/${pattern.id}/edit`;
  const mainAlg = registration?.mainAlg.text ?? '';

  return (
    <ScreenBody>
      <div className="flex flex-col items-center gap-6 rounded-md border border-line bg-surface p-4">
        {mainAlg !== '' && (
          <p className="w-full text-center font-mono text-title leading-normal break-words text-ink">
            {formatAlg(mainAlg, settings.wideStyle)}
          </p>
        )}
        <Recognition recognition={registration?.recognition ?? ''} editPath={editPath} />
      </div>
      <Section title={copy.detail.alg}>
        {registration === undefined || mainAlg === '' ? (
          <Link to={editPath} state={{ focus: 'alg' }} className={EMPTY_SLOT_CLASS}>
            {copy.detail.registerAlg}
          </Link>
        ) : (
          <AlgCard
            alg={registration.mainAlg}
            wideStyle={settings.wideStyle}
            index={0}
            editPath={editPath}
            onPlay={() => {
              onPlay(mainAlg);
            }}
          />
        )}
      </Section>
      <AltAlgsSection
        altAlgs={registration?.altAlgs ?? []}
        wideStyle={settings.wideStyle}
        editPath={editPath}
        onPlay={onPlay}
      />
    </ScreenBody>
  );
}

export function DetailScreen() {
  const { id = '' } = useParams();
  const patterns = useDocumentStore((state) => state.document.patterns);
  const settings = useDocumentStore((state) => state.document.settings);
  const registrations = useDocumentStore((state) => state.document.registrations);
  const pinned = useDocumentStore((state) => state.document.pinned);
  const togglePin = useDocumentStore((state) => state.togglePin);
  const ref = findPattern({ patterns }, id);
  const isPinned = pinned.includes(id);
  // 再生シートで開いている手順。開いているシートは文書に入れない (一時的な状態)
  const [playingAlg, setPlayingAlg] = useState<string | null>(null);

  return (
    <Screen label={copy.a11y.detail}>
      <ScreenHeader
        title={ref === undefined ? copy.detail.notFound : patternName(ref)}
        leading={<BackLink to="/" label={copy.a11y.backToList} />}
        trailing={
          ref !== undefined && (
            <>
              {/* aria-pressedのあるトグルなので、名前は状態の名詞「ピン留め」で固定し、押された状態はaria-pressedが伝える */}
              <IconButton
                label={copy.a11y.pin}
                aria-pressed={isPinned}
                className={cn(isPinned && 'text-accent-ink')}
                onClick={() => {
                  togglePin(id);
                }}
              >
                <Pin {...BAR_ICON_PROPS} fill={isPinned ? 'currentColor' : 'none'} />
              </IconButton>
              <IconLink to={`/p/${id}/edit`} label={copy.a11y.editPattern(patternName(ref))}>
                <Pencil {...BAR_ICON_PROPS} />
              </IconLink>
            </>
          )
        }
      />
      {ref?.kind === 'preset' && (
        <PresetDetail
          preset={ref.preset}
          registration={findRegistration(registrations, ref.preset.id)}
          settings={settings}
          onPlay={setPlayingAlg}
        />
      )}
      {ref?.kind === 'custom' && (
        <CustomDetail
          pattern={ref.pattern}
          registration={findRegistration(registrations, ref.pattern.id)}
          settings={settings}
          onPlay={setPlayingAlg}
        />
      )}
      {/* 灰にする指定はプリセットのカテゴリごと。自作は図がないので全色で出す */}
      {playingAlg !== null && (
        <PlayerSheet
          algText={playingAlg}
          category={ref?.kind === 'preset' ? ref.preset.category : undefined}
          settings={settings}
          onClose={() => {
            setPlayingAlg(null);
          }}
        />
      )}
    </Screen>
  );
}
