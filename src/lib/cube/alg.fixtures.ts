import type { Alg } from 'cubing/alg';

import { toCubingAlg } from './alg';

// 検証済みの手順をテストで使うための変換。失敗は書き手のテストデータの誤り
export function cubingAlgOrThrow(text: string): Alg {
  const result = toCubingAlg(text);
  if (!result.ok) {
    throw new Error(`parse failed: ${result.error.kind}`);
  }
  return result.value;
}
