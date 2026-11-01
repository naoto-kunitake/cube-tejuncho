import { ChevronLeft, Pencil, Pin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PatternFigures } from '@/components/figures/PatternFigures';
import { IconButton, IconLink } from '@/components/IconButton';
import { PlayerSheet } from '@/components/player/PlayerSheet';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import type { AlgEntry, CustomPattern, Registration, Settings } from '@/data/document';
import { findRegistration } from '@/data/document';
import { findPattern, patternName } from '@/data/patterns';
import type { Preset } from '@/data/presets/catalog';
import { useDocumentStore } from '@/data/store';
import { cn } from '@/lib/utils';

import { AlgCard } from './AlgCard';
import { StandardAlgCard } from './StandardAlgCard';

// 未登録のときの空枠 (判断を書く / 手順を登録)。押すと編集のその欄へ
const EMPTY_SLOT_CLASS =
  'w-full rounded-md border border-dashed border-line-state px-3 py-2.75 text-center text-body leading-normal text-muted pressable hover:border-line-strong hover:bg-hover-ground';

type RecognitionProps = {
  recognition: string;
  editPath: string;
  // 判断が空のときに「判断を書く」の空枠を出すか。プリセットは未登録のときだけ、自作は常に出す
  showsEmptySlot: boolean;
};

function Recognition({ recognition, editPath, showsEmptySlot }: RecognitionProps) {
  if (recognition !== '') {
    return <p className="w-full text-body leading-normal">{recognition}</p>;
  }
  if (!showsEmptySlot) {
    return null;
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
  onPlay: (algText: string) => void;
};

// ほかの手順。1つもなければ見出しも出さない
function AltAlgsSection({ altAlgs, wideStyle, onPlay }: AltAlgsSectionProps) {
  if (altAlgs.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>{copy.detail.altAlgs}</SectionHeading>
      {altAlgs.map((alg, index) => (
        <AlgCard
          key={index}
          alg={alg}
          wideStyle={wideStyle}
          isMain={false}
          onPlay={() => {
            onPlay(alg.text);
          }}
        />
      ))}
    </section>
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
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* 大きな図 = パターンそのもの (全色 + 矢印)、隣の灰色の図 = 何を見るか。ラベルは付けない (並べば自明) */}
      <div className="flex flex-col items-center gap-6 rounded-md border border-line bg-surface p-4">
        <PatternFigures preset={preset} settings={settings} />
        <Recognition
          recognition={registration?.recognition ?? ''}
          editPath={editPath}
          showsEmptySlot={registration === undefined}
        />
      </div>
      <section className="flex flex-col gap-2">
        <SectionHeading>{copy.detail.alg}</SectionHeading>
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
            isMain
            onPlay={() => {
              onPlay(registration.mainAlg.text);
            }}
          />
        )}
      </section>
      <AltAlgsSection altAlgs={registration?.altAlgs ?? []} wideStyle={settings.wideStyle} onPlay={onPlay} />
    </div>
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
    <div className="flex flex-col gap-4 px-4 pb-6">
      <div className="flex flex-col items-center gap-6 rounded-md border border-line bg-surface p-4">
        {mainAlg !== '' && (
          <p className="w-full text-center font-mono text-title leading-normal break-words text-ink">{mainAlg}</p>
        )}
        <Recognition recognition={registration?.recognition ?? ''} editPath={editPath} showsEmptySlot />
      </div>
      <section className="flex flex-col gap-2">
        <SectionHeading>{copy.detail.alg}</SectionHeading>
        {registration === undefined || mainAlg === '' ? (
          <Link to={editPath} state={{ focus: 'alg' }} className={EMPTY_SLOT_CLASS}>
            {copy.detail.registerAlg}
          </Link>
        ) : (
          <AlgCard
            alg={registration.mainAlg}
            wideStyle={settings.wideStyle}
            isMain
            onPlay={() => {
              onPlay(mainAlg);
            }}
          />
        )}
      </section>
      <AltAlgsSection altAlgs={registration?.altAlgs ?? []} wideStyle={settings.wideStyle} onPlay={onPlay} />
    </div>
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
    <section aria-label={copy.a11y.detail} className="mx-auto flex w-full max-w-140 flex-col">
      <TopBar>
        {/* 戻るの記号を左端16に揃えるため7引く。戻ると題の間は10 */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconLink to="/" label={copy.a11y.backToList} className="-ml-1.75">
            <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconLink>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {ref === undefined ? copy.detail.notFound : patternName(ref)}
          </h1>
        </div>
        {ref !== undefined && (
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
              <Pin size={22} strokeWidth={1.8} fill={isPinned ? 'currentColor' : 'none'} aria-hidden="true" />
            </IconButton>
            <IconLink to={`/p/${id}/edit`} label={copy.a11y.editPattern(patternName(ref))}>
              <Pencil size={22} strokeWidth={1.8} aria-hidden="true" />
            </IconLink>
          </>
        )}
      </TopBar>
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
    </section>
  );
}
