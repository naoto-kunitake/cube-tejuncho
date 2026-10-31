import { err, ok, type Result } from '@/lib/result';

export type StorageError = { kind: 'quotaExceeded' } | { kind: 'unavailable' };

export type KeyValueStorage = {
  // falseならlocalStorageが使えず、メモリで動いている (閉じると消える)
  isPersistent: boolean;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => Result<undefined, StorageError>;
  removeItem: (key: string) => void;
};

const PROBE_KEY = 'cube-tejuncho:probe';

function findLocalStorage(): Storage | null {
  try {
    const nativeStorage = globalThis.localStorage;
    // プライベートモードなどでは存在しても書けないことがあるので、実際に書いて確かめる
    nativeStorage.setItem(PROBE_KEY, '1');
    nativeStorage.removeItem(PROBE_KEY);
    return nativeStorage;
  } catch {
    return null;
  }
}

function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22);
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    isPersistent: false,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
      return ok(undefined);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

export function createStorage(): KeyValueStorage {
  const nativeStorage = findLocalStorage();
  if (nativeStorage === null) {
    return createMemoryStorage();
  }
  return {
    isPersistent: true,
    getItem: (key) => nativeStorage.getItem(key),
    setItem: (key, value) => {
      try {
        nativeStorage.setItem(key, value);
        return ok(undefined);
      } catch (error: unknown) {
        return err(isQuotaExceeded(error) ? { kind: 'quotaExceeded' } : { kind: 'unavailable' });
      }
    },
    removeItem: (key) => {
      nativeStorage.removeItem(key);
    },
  };
}
