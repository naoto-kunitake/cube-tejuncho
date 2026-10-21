import { Alg } from 'cubing/alg';

import { formatAlg } from '@/lib/alg/format';
import { type AlgError, parseAlg } from '@/lib/alg/parse';
import { err, ok, type Result } from '@/lib/result';

// 自分の字句分解で検証してから cubing.js に渡す。cubing.js は全角や空白なしを読めないので、整形した文字列を渡す
export function toCubingAlg(text: string): Result<Alg, AlgError> {
  const parsed = parseAlg(text);
  if (!parsed.ok) {
    return err(parsed.error);
  }
  return ok(new Alg(formatAlg(text, 'r')));
}

export function invertAlg(alg: Alg): Alg {
  return alg.invert();
}
