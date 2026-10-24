// Community reports of ad publishers.
// Privacy: identifiers are stored as HMAC hashes + a masked display string; reporters
// are stored only as an HMAC of their IP. Free-text notes are kept but never shown publicly.
// This is a hackathon-scale JSON file store; swap for SQLite/Postgres in production.

import fs from 'node:fs';
import path from 'node:path';
import { hmac, normalizeIdentifier, maskIdentifier } from './identifiers.js';

const DIR = process.env.DATA_DIR || path.resolve('data');
const FILE = path.join(DIR, 'reports.json');

export const CATEGORIES = ['fee', 'fake', 'docs', 'task', 'other'];
export const TYPES = ['phone', 'email', 'url', 'name'];

let db = { reports: [] };

function load() {
  try {
    db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(db.reports)) db = { reports: [] };
  } catch {
    db = { reports: [] };
  }
}

function save() {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, FILE);
}

load();

const keyFor = (type, normalized) => hmac(`${type}:${normalized}`);

export function addReport({ type, value, category, note, reporterIp }) {
  if (!TYPES.includes(type)) return { error: 'bad_type' };
  if (!CATEGORIES.includes(category)) return { error: 'bad_category' };
  const normalized = normalizeIdentifier(type, value);
  if (!normalized) return { error: 'bad_value' };
  const key = keyFor(type, normalized);
  const reporter = hmac(`ip:${reporterIp}`);
  if (db.reports.some((r) => r.key === key && r.reporter === reporter)) {
    return { duplicate: true, count: countFor(type, value) };
  }
  db.reports.push({
    key, type, display: maskIdentifier(type, normalized), category,
    note: String(note || '').slice(0, 280), reporter, ts: Date.now(),
  });
  save();
  return { ok: true, count: countFor(type, value) };
}

/** Number of distinct reporters for an identifier. */
export function countFor(type, value) {
  const normalized = normalizeIdentifier(type, value);
  if (!normalized) return 0;
  const key = keyFor(type, normalized);
  return new Set(db.reports.filter((r) => r.key === key).map((r) => r.reporter)).size;
}

export function stats() {
  const byKey = new Map();
  for (const r of db.reports) {
    const e = byKey.get(r.key) || { display: r.display, type: r.type, reporters: new Set(), cats: {} };
    e.reporters.add(r.reporter);
    e.cats[r.category] = (e.cats[r.category] || 0) + 1;
    byKey.set(r.key, e);
  }
  const top = [...byKey.values()]
    .filter((e) => e.reporters.size >= 2) // only show identifiers corroborated by 2+ people
    .map((e) => ({
      display: e.display, type: e.type, count: e.reporters.size,
      category: Object.entries(e.cats).sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return { total: db.reports.length, top };
}
