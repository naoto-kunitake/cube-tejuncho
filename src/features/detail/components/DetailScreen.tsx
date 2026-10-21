import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { TopFigure } from '@/components/figures/TopFigure';
import { IconLink } from '@/components/IconButton';
import { SectionHeading } from '@/components/SectionHeading';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/copy';
import { findRegistration } from '@/data/document';
import { PLL_PRESETS, type PllPreset } from '@/data/presets/pll';
import { useDocumentStore } from '@/data/store';
import { cueView, recolorView } from '@/lib/figure/view';

import { AlgCard } from './AlgCard';
import { StandardAlgCard } from './StandardAlgCard';

type PatternDetailProps = {
  preset: PllPreset;
};

function PatternDetail({ preset }: PatternDetailProps) {
  const settings = useDocumentStore((state) => state.document.settings);
  const registrations = useDocumentStore((state) => state.document.registrations);
  const addRegistration = useDocumentStore((state) => state.addRegistration);
  const registration = findRegistration(registrations, preset.id);
  const view = recolorView(preset.view, settings);
  const editPath = `/p/${preset.id}/edit`;

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* 大きな図 = パターンそのもの (全色 + 矢印)、隣の灰色の図 = 何を見るか。ラベルは付けない (並べば自明) */}
      <div className="flex flex-col items-center gap-6 rounded-md border border-line bg-surface p-4">
        {/* SVG は viewBox 86 のうち外側 4 (4.65%) が空き。負の余白で打ち消し、ステッカーの外周をカードの余白 16 に揃える。
            2 枚: ステッカー幅 138 × 2 + 間 24 = カード内側 300 → SVG 幅 152、負の余白 7。1 枚: 240 → 11 */}
        {settings.showCueFigure ? (
          <div className="flex w-full justify-center gap-6">
            <div className="-m-1.75 w-38 flex-none">
              <TopFigure view={view} arrows={settings.showArrows ? preset.arrows : []} label={preset.name} />
            </div>
            <div className="-m-1.75 w-38 flex-none">
              <TopFigure view={cueView(view)} label={copy.a11y.cueFigure(preset.name)} />
            </div>
          </div>
        ) : (
          <div className="-my-2.75 w-full max-w-60">
            <TopFigure view={view} arrows={settings.showArrows ? preset.arrows : []} label={preset.name} />
          </div>
        )}
        {registration !== undefined && registration.recognition !== '' && (
          <p className="w-full text-body leading-normal">{registration.recognition}</p>
        )}
        {registration === undefined && (
          <Link
            to={editPath}
            className="w-full rounded-md border border-dashed border-line-state px-3 py-2.75 text-center text-body leading-normal text-muted pressable hover:border-line-strong hover:bg-hover-ground"
          >
            {copy.detail.writeRecognition}
          </Link>
        )}
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
          />
        ) : (
          <AlgCard alg={registration.mainAlg} wideStyle={settings.wideStyle} isMain />
        )}
      </section>
      {registration !== undefined && registration.altAlgs.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionHeading>{copy.detail.altAlgs}</SectionHeading>
          {registration.altAlgs.map((alg, index) => (
            <AlgCard key={index} alg={alg} wideStyle={settings.wideStyle} isMain={false} />
          ))}
        </section>
      )}
    </div>
  );
}

export function DetailScreen() {
  const { id = '' } = useParams();
  const preset = PLL_PRESETS.find((entry) => entry.id === id);

  return (
    <section aria-label={copy.a11y.detail} className="mx-auto flex w-full max-w-140 flex-col">
      <TopBar>
        {/* 戻るの記号を左端 16 に揃えるため 7 引く。戻ると題の間は 10 */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <IconLink to="/" label={copy.a11y.backToList} className="-ml-1.75">
            <ChevronLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </IconLink>
          <h1 className="min-w-0 flex-1 truncate text-title font-bold tracking-title text-ink-strong">
            {preset === undefined ? copy.detail.notFound : preset.name}
          </h1>
        </div>
      </TopBar>
      {preset !== undefined && <PatternDetail preset={preset} />}
    </section>
  );
}
