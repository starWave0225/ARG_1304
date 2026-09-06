const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { join } = require('node:path');

// Exercise the actual page setup without requiring a device or waiting 45 seconds.
function setup() {
  const page = readFileSync(join(__dirname, '../src/pages/index/index.vue'), 'utf8');
  const script = page.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '');
  const timers = new Map();
  const hooks = {};
  let timerId = 0;
  const api = runInNewContext(`${script}\n;({ status, attempt, retry })`, {
    __GAME_URL__: 'https://example.com/?platform=qiandao',
    ref: (value) => ({ value }), shallowRef: (value) => ({ value }),
    setTimeout: (fn, delay) => { assert.equal(delay, 45000); timers.set(++timerId, fn); return timerId; },
    clearTimeout: (id) => timers.delete(id),
    useDidHide: (fn) => { hooks.hide = fn; },
    useDidShow: (fn) => { hooks.show = fn; },
    onBeforeUnmount: (fn) => { hooks.unmount = fn; },
  });
  return { ...api, hooks, timers };
}
test('load, failure, retry and stale callbacks keep the current attempt isolated', () => {
  const page = setup();
  const first = page.attempt.value;
  assert.equal(page.status.value, 'loading');
  first.loaded();
  assert.equal(page.status.value, 'ready');
  assert.equal(page.timers.size, 0);
  first.failed();
  assert.equal(page.status.value, 'error');
  page.retry();
  first.failed();
  first.loaded();
  assert.equal(page.status.value, 'loading');
  page.attempt.value.loaded();
  assert.equal(page.status.value, 'ready');
});
test('timeout ignores late success and supports an explicit retry', () => {
  const page = setup();
  const first = page.attempt.value;
  page.timers.values().next().value();
  assert.equal(page.status.value, 'error');
  first.loaded();
  assert.equal(page.status.value, 'error');
  page.retry();
  assert.equal(page.timers.size, 1);
  page.attempt.value.loaded();
  assert.equal(page.status.value, 'ready');
});
test('hidden pages do not time out; show and unmount clean up correctly', () => {
  const page = setup();
  page.hooks.hide();
  assert.equal(page.timers.size, 0);
  page.hooks.show();
  assert.equal(page.timers.size, 1);
  page.hooks.unmount();
  assert.equal(page.timers.size, 0);
  page.attempt.value.failed();
  assert.equal(page.status.value, 'loading');
});
