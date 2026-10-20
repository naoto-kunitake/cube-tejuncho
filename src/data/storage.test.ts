import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMemoryStorage, createStorage } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('createStorage', () => {
  it('localStorage が使えるときは書いた値が残る', () => {
    const storage = createStorage();
    storage.setItem('cube-tejuncho:test', 'a');
    expect(storage.isPersistent).toBe(true);
    expect(localStorage.getItem('cube-tejuncho:test')).toBe('a');
  });

  it('localStorage に書けないときはメモリで動く', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const storage = createStorage();
    expect(storage.isPersistent).toBe(false);
    expect(storage.setItem('k', 'v').ok).toBe(true);
    expect(storage.getItem('k')).toBe('v');
  });

  it('容量超過を知らせる', () => {
    const storage = createStorage();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(storage.setItem('k', 'v')).toEqual({ ok: false, error: { kind: 'quotaExceeded' } });
  });
});

describe('createMemoryStorage', () => {
  it('消した値は読めない', () => {
    const storage = createMemoryStorage();
    storage.setItem('k', 'v');
    storage.removeItem('k');
    expect(storage.getItem('k')).toBeNull();
  });
});
