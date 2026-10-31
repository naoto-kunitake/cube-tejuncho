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

  it('前置きで引いた鍵だけまとめて消す', () => {
    const storage = createStorage();
    storage.setItem('cube-tejuncho:draft:a', '1');
    storage.setItem('cube-tejuncho:draft:b', '2');
    storage.setItem('cube-tejuncho:doc', '3');
    storage.removeByPrefix('cube-tejuncho:draft:');
    expect(storage.getItem('cube-tejuncho:draft:a')).toBeNull();
    expect(storage.getItem('cube-tejuncho:draft:b')).toBeNull();
    expect(storage.getItem('cube-tejuncho:doc')).toBe('3');
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

  it('前置きで引いた鍵だけまとめて消す', () => {
    const storage = createMemoryStorage();
    storage.setItem('p:a', '1');
    storage.setItem('p:b', '2');
    storage.setItem('q:a', '3');
    storage.removeByPrefix('p:');
    expect(storage.getItem('p:a')).toBeNull();
    expect(storage.getItem('p:b')).toBeNull();
    expect(storage.getItem('q:a')).toBe('3');
  });
});
