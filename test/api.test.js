import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolate: temp data dir, no AI, deterministic hashing
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'jobshield-'));
process.env.HASH_SALT = 'test-salt';
delete process.env.GEMINI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;

const { server } = await import('../src/server.js');
const { SAMPLES } = await import('../public/samples.js');
let base;

before(async () => {
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (p, body) =>
  fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('serves the UI and health', async () => {
  const html = await (await fetch(base + '/')).text();
  assert.match(html, /JobShield/);
  const h = await (await fetch(base + '/api/health')).json();
  assert.equal(h.ok, true);
});

test('blocks path traversal', async () => {
  const r = await fetch(base + '/..%2f..%2fpackage.json');
  assert.ok([403, 404].includes(r.status));
});

test('analyze text returns localized result (si)', async () => {
  const r = await post('/api/analyze', { text: SAMPLES.fake, lang: 'si' });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.level, 'high');
  assert.match(j.flags[0].title, /[඀-෿]/, 'flag titles are Sinhala');
  assert.ok(j.found.some((f) => f.type === 'phone' && f.value === '0771234567'));
  assert.equal(j.ai.used, false);
});

test('rejects empty input and non-images', async () => {
  assert.equal((await post('/api/analyze', { text: '  ' })).status, 400);
  const fd = new FormData();
  fd.append('lang', 'en');
  fd.append('image', new Blob([Buffer.from('this is not an image at all')], { type: 'image/png' }), 'x.png');
  const r = await fetch(base + '/api/analyze', { method: 'POST', body: fd });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'bad_image');
});

test('multipart: pasted text + valid PNG header is accepted', async () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
  const fd = new FormData();
  fd.append('lang', 'en');
  fd.append('text', SAMPLES.vague);
  fd.append('image', new Blob([png], { type: 'image/png' }), 'ad.png');
  const r = await fetch(base + '/api/analyze', { method: 'POST', body: fd });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).level, 'medium');
});

test('reporting a publisher: validation, dedupe, counts, and score impact', async () => {
  assert.equal((await post('/api/report', { type: 'phone', value: 'abc', category: 'fee' })).status, 400);
  assert.equal((await post('/api/report', { type: 'phone', value: '0711112222', category: 'nope' })).status, 400);

  const a = await (await post('/api/report', { type: 'phone', value: '071 111 2222', category: 'fee', note: 'asked for 10k' })).json();
  assert.equal(a.ok, true);
  assert.equal(a.count, 1);
  const dup = await (await post('/api/report', { type: 'phone', value: '0711112222', category: 'fee' })).json();
  assert.equal(dup.duplicate, true);

  // A previously "medium" ad now gets the community-report flag and goes high
  const j = await (await post('/api/analyze', { text: 'Hiring staff, good salary. Call 071 111 2222', lang: 'en' })).json();
  assert.ok(j.flags.some((f) => f.id === 'reported_publisher'));
  assert.equal(j.level, 'high');
  assert.equal(j.found.find((f) => f.type === 'phone').reports, 1);
});

test('stats only expose identifiers reported by 2+ distinct people and only masked', async () => {
  const s = await (await fetch(base + '/api/stats')).json();
  assert.equal(s.top.length, 0, 'single-reporter identifiers stay hidden');
  assert.ok(s.total >= 1);
  assert.ok(!JSON.stringify(s).includes('0711112222'));
});
