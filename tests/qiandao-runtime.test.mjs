import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { browserStorage, getStorageFailure, subscribeToStorageFailure } from '../app/browser-storage.ts';
import { bindBackgroundPause, isQiandaoMode } from '../app/qiandao-runtime.ts';

test('Qiandao mode is explicit and does not change ordinary web visits', () => {
  for (const query of ['', '?platform=other', '?qiandao=1', '?url=qiandao']) assert.equal(isQiandaoMode(query), false);
  assert.equal(isQiandaoMode('?platform=qiandao'), true);
  assert.equal(isQiandaoMode('?platform=qiandao&other=1'), true);
});

test('storage keeps existing serialization and reports rejected operations without throwing', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  globalThis.window = { localStorage: storage };
  let notices = 0;
  const unsubscribe = subscribeToStorageFailure(() => notices++);
  try {
    const key = 'chengjiang-search-arg-v1';
    assert.equal(browserStorage.setItem(key, '{"started":true}'), true);
    assert.equal(browserStorage.getItem(key), '{"started":true}');
    assert.equal(browserStorage.removeItem(key), true);
    assert.equal(browserStorage.getItem(key), null);

    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    assert.equal(browserStorage.getItem(key), null);
    assert.equal(browserStorage.setItem(key, '{}'), false);
    assert.equal(browserStorage.removeItem(key), false);
    assert.equal(getStorageFailure(), true);
    assert.equal(notices, 3);

    Object.defineProperty(window, 'localStorage', { value: { ...storage, setItem() { throw new Error('QuotaExceededError'); } } });
    assert.equal(browserStorage.getItem(key), null);
    assert.equal(browserStorage.setItem(key, '{}'), false);
    assert.equal(notices, 4);
    Object.defineProperty(window, 'localStorage', { value: storage });
    assert.equal(browserStorage.setItem(key, '{"restored":true}'), true);

    Object.defineProperty(window, 'localStorage', { get() { throw new Error('temporary read failure'); } });
    assert.equal(browserStorage.getItem(key), null);
    Object.defineProperty(window, 'localStorage', { value: storage });
    assert.equal(browserStorage.setItem(key, '{"newGame":true}'), false);
    assert.equal(values.get(key), '{"restored":true}');
    assert.equal(browserStorage.getItem(key), '{"restored":true}');
    assert.equal(browserStorage.setItem(key, '{"resumed":true}'), true);
  } finally { unsubscribe(); delete globalThis.window; }
});

test('background events pause media; foreground never automatically restarts evidence audio', () => {
  const doc = new EventTarget();
  const win = new EventTarget();
  let pauses = 0;
  const cleanup = bindBackgroundPause(doc, win, () => pauses++);
  doc.hidden = false;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(pauses, 0);
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(pauses, 1);
  win.dispatchEvent(new Event('pagehide'));
  assert.equal(pauses, 2);
  doc.hidden = false;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(pauses, 2);
  cleanup();
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  win.dispatchEvent(new Event('pagehide'));
  assert.equal(pauses, 2);
});

test('migration retains story timing and camera fallback integration', async () => {
  const source = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /LEGACY_READING_MIN_MS\s*=\s*45_?000/);
  assert.match(source, /const requestLegacyCamera = async \(\) => \{\s*if \(qiandaoMode\) \{\s*continueLegacyWithoutCamera\(\);\s*return;/);
  assert.match(source, /if \(!browserStorage.removeItem\(SAVE_KEY\)\) return;/);
  assert.doesNotMatch(source, /(?<!browserStorage\.)\blocalStorage\./);
});
