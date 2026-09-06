const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildGameUrl } = require('../config/game-url.cjs');

test('preserves the deployment base path and enables the Qiandao adapter', () => {
  assert.equal(buildGameUrl('https://example.com/ARG_1304/'), 'https://example.com/ARG_1304/?platform=qiandao');
  assert.equal(buildGameUrl('https://example.com/'), 'https://example.com/?platform=qiandao');
});
test('refuses missing, insecure, credential-bearing or ambiguous URLs', () => {
  for (const value of [undefined, '', 'bad', 'http://example.com/', 'javascript:alert(1)', 'https://user:secret@example.com/', 'https://example.com/game', 'https://example.com/#/legacy', 'https://example.com/?url=https://evil.example/']) {
    assert.throws(() => buildGameUrl(value));
  }
});
