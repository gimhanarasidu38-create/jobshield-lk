import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText } from '../src/heuristics.js';
import { extractIdentifiers, normalizePhone } from '../src/identifiers.js';
import { SAMPLES } from '../public/samples.js';

const ids = (r) => r.flags.map((f) => f.id);

test('fake foreign-job ad is high risk with the key flags', () => {
  const r = analyzeText(SAMPLES.fake);
  assert.equal(r.level, 'high');
  assert.ok(r.score >= 80, `score ${r.score}`);
  for (const id of ['upfront_fee', 'personal_docs', 'guaranteed_job', 'urgency', 'whatsapp_only', 'free_email', 'unrealistic_salary', 'foreign_job_promise']) {
    assert.ok(ids(r).includes(id), `missing ${id}; got ${ids(r)}`);
  }
});

test('genuine-looking ad is low risk and shows reassuring details', () => {
  const r = analyzeText(SAMPLES.genuine);
  assert.equal(r.level, 'low');
  assert.ok(!ids(r).includes('upfront_fee'), '"No fees are charged" must not trigger fee flag');
  assert.ok(r.greens.includes('no_fee_statement'));
  assert.ok(r.greens.includes('company_email'));
});

test('vague WhatsApp-only ad is medium risk', () => {
  const r = analyzeText(SAMPLES.vague);
  assert.equal(r.level, 'medium', `score ${r.score} flags ${ids(r)}`);
  assert.ok(ids(r).includes('whatsapp_only'));
  assert.ok(ids(r).includes('vague_company'));
});

test('Sinhala scam ad is detected', () => {
  const r = analyzeText(SAMPLES.sinhala);
  assert.equal(r.level, 'high');
  assert.ok(ids(r).includes('upfront_fee'));
  assert.ok(ids(r).includes('guaranteed_job'));
  assert.ok(ids(r).includes('urgency'));
});

test('Tamil fee request is detected', () => {
  const r = analyzeText('வெளிநாட்டு வேலை! உடனடியாக விசா கட்டணம் ரூ. 20,000 செலுத்த வேண்டும். வேலை உறுதி.');
  assert.ok(ids(r).includes('upfront_fee'));
  assert.equal(r.level, 'high');
});

test('online task scam is flagged', () => {
  const r = analyzeText('Work from home! Earn Rs. 5,000 per day by liking videos and writing reviews. Join our Telegram group t.me/easyjobs');
  assert.ok(ids(r).includes('task_scam'));
  assert.equal(r.level, 'high');
});

test('extracts and normalizes Sri Lankan phone numbers', () => {
  assert.equal(normalizePhone('+94 77 123 4567'), '0771234567');
  assert.equal(normalizePhone('077-123-4567'), '0771234567');
  const e = extractIdentifiers('Call 077 123 4567 or +94771234567, mail a.b@company.lk, see bit.ly/abc123');
  assert.deepEqual(e.phones, ['0771234567']);
  assert.deepEqual(e.emails, ['a.b@company.lk']);
  assert.ok(e.urls.includes('bit.ly'));
});

test('empty and junk input does not crash', () => {
  assert.equal(analyzeText('').score, 0);
  assert.equal(analyzeText('hello world').level, 'low');
});
