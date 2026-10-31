import { DOCUMENT_VERSION } from './document';

type Migration = (document: Record<string, unknown>) => Record<string, unknown>;

// 版nの文書をn + 1に上げる関数をnに対応づける。版を上げるときにここへ足す
const MIGRATIONS: Record<number, Migration> = {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// このアプリが読める版より新しい文書か。壊れた文書と区別して扱う (退避も削除もせず、そのまま残す)
export function isNewerDocument(raw: unknown): boolean {
  return isRecord(raw) && typeof raw.version === 'number' && raw.version > DOCUMENT_VERSION;
}

// 古い版の文書を最新の版の形に直す。検証 (Zod) は呼び出し側が行う
export function migrateDocument(raw: unknown): unknown {
  if (!isRecord(raw) || typeof raw.version !== 'number') {
    return raw;
  }
  let document = raw;
  for (let version = raw.version; version < DOCUMENT_VERSION; version += 1) {
    const migration = MIGRATIONS[version];
    if (migration === undefined) {
      return raw;
    }
    document = { ...migration(document), version: version + 1 };
  }
  return document;
}
