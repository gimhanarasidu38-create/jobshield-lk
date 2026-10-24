import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UI } from '../public/ui.js';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

test('all UI DOM hooks remain present and IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  const used = [...client.matchAll(/\$\('([^']+)'\)/g)].map((m) => m[1]);
  for (const id of used) assert.ok(ids.includes(id), `Missing DOM hook: #${id}`);
  for (const endpoint of ['/api/analyze', '/api/report', '/api/stats', '/api/health']) {
    assert.ok(client.includes(endpoint), `Missing public contract: ${endpoint}`);
  }
});

test('new page copy is translated in all three supported languages', () => {
  const keys = [...html.matchAll(/data-i18n(?:-ph|-aria)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 50);
  for (const lang of ['en', 'si', 'ta']) {
    for (const key of keys) {
      assert.equal(typeof UI[lang][key], 'string', `${lang} missing text key ${key}`);
      assert.ok(UI[lang][key].trim(), `${lang} has empty text key ${key}`);
    }
  }
});

test('mobile, dark mode, reduced-motion, and focus styles remain defined', () => {
  assert.match(css, /max-width:640px/);
  assert.match(css, /max-width:450px/);
  assert.match(css, /prefers-color-scheme:dark/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.ok(html.includes('class="mobile-nav"'));
});
