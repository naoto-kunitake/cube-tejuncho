import { useEffect, useState } from 'react';

import type { Preset } from '@/data/presets/catalog';
import { toCubingAlg } from '@/lib/cube/alg';
import type { StickeringCategory } from '@/lib/cube/stickering';
import { solvesCase } from '@/lib/cube/verify';

// 判定に使うプリセットの情報。自作パターンは比べる状態がないのでundefined
export type CaseCheck = { category: StickeringCategory; standardAlg: string };
export type CaseVerdict = 'solves' | 'fails';

export function caseCheckOf(preset: Preset): CaseCheck {
  return { category: preset.category, standardAlg: preset.standardAlg };
}

// 判定の結果に付ける入力の鍵。判定しないときはnull
function caseVerdictKeyOf(
  category: StickeringCategory | undefined,
  standardAlg: string | undefined,
  text: string,
): string | null {
  return category === undefined || standardAlg === undefined ? null : `${category}\n${standardAlg}\n${text}`;
}

type Result = { key: string; verdict: CaseVerdict };

// 手順がそのパターンを揃えるか。判定しない (自作、読めない手順) ときと判定が終わるまではnull。
// 判定は保存の条件にしない (知らせるだけ)。結果は入力の鍵と一緒に持ち、入力が変わった瞬間に古い結果を出さない
export function useCaseVerdict(text: string, check: CaseCheck | undefined): CaseVerdict | null {
  const category = check?.category;
  const standardAlg = check?.standardAlg;
  const key = caseVerdictKeyOf(category, standardAlg, text);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (key === null || category === undefined || standardAlg === undefined) {
      return;
    }
    const standard = toCubingAlg(standardAlg);
    const alg = toCubingAlg(text);
    if (!standard.ok || !alg.ok) {
      return;
    }
    let isActive = true;
    solvesCase(category, standard.value, alg.value)
      .then((solves) => {
        if (isActive) {
          setResult({ key, verdict: solves ? 'solves' : 'fails' });
        }
      })
      .catch((error: unknown) => {
        // 判定できなければ知らせを出さない (保存も再生も止めない)
        console.error('case verdict failed', error);
      });
    return () => {
      isActive = false;
    };
  }, [key, category, standardAlg, text]);

  return result !== null && result.key === key ? result.verdict : null;
}
