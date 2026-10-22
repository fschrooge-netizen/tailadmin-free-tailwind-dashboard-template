import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const base = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(base, 'browser/s2-admin.js'), 'utf8');
const css = await readFile(resolve(base, 'browser/s2-admin.css'), 'utf8');
function load() {
  const listeners = new Map();
  const document = {
    readyState: 'loading',
    addEventListener(name, fn) { listeners.set(name, fn); },
    querySelector() { return null; },
    body: { querySelector() { return null; } }
  };
  const context = {
    window: { document, location: { pathname: '/dashboard' }, localStorage: {
      setItem() {}, getItem() { return null; }
    } }
  };
  vm.runInNewContext(source, context, { filename: 's2-admin.js' });
  return { api: context.window.S2Admin, listeners };
}
test('shared S2 Admin exports a reusable API without loading an app demo', () => {
  const { api, listeners } = load();
  assert.equal(api.version, '0.1.0');
  assert.equal(typeof api.mount, 'function');
  assert.equal(typeof api.setTheme, 'function');
  assert.equal(typeof api.components.card, 'function');
  assert.equal(typeof listeners.get('DOMContentLoaded'), 'function');
  assert.equal(api.mount({id:'sample',navigation:[]}), false);
  assert.throws(() => api.mount({}), /project id/);
});
test('shared package separates design tokens from CI tenant navigation and auth', () => {
  assert.match(css, /--s2a-sidebar-width/);
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.doesNotMatch(source, /faizel@s2tech|su@s2tech|CI_OBLITERATUS_UPSTREAM/);
  assert.doesNotMatch(source, /eCommerce Dashboard/);
});
test('shared browser module supports immersive and specialist-layout adapters', () => {
  assert.match(source, /function mountImmersive\(/);
  assert.match(source, /function adaptLayout\(/);
  assert.match(source, /config\.navigation/);
  assert.match(source, /\blegacyControls\b/);
});
