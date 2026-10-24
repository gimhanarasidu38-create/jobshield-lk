// JobShield LK: zero-dependency HTTP server (Node 20+). No `npm install` required.
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Minimal .env loader
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch { /* ignore */ }

const { analyzeText, scoreFlags } = await import('./heuristics.js');
const { extractIdentifiers } = await import('./identifiers.js');
const { aiConfig, analyzeWithAI } = await import('./ai.js');
const { ocrImage } = await import('./ocr.js');
const store = await import('./store.js');
const i18n = await import('./i18n.js');
const { createLimiter } = await import('./rateLimit.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const MAX_BODY = 9 * 1024 * 1024; // 9 MB (image limit is 8 MB)
const MAX_IMAGE = 8 * 1024 * 1024;

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
};

const analyzeLimit = createLimiter({ windowMs: 60_000, max: 20 });
const reportLimit = createLimiter({ windowMs: 3_600_000, max: 15 });

const clientIp = (req) =>
  (process.env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
  req.socket.remoteAddress || 'unknown';

const L = (v) => (i18n.LANGS.includes(v) ? v : 'en');

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
  res.end(body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('too_large'), { code: 'too_large' })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(buf, boundary) {
  const delim = Buffer.from('--' + boundary);
  const fields = {};
  let file = null;
  let pos = buf.indexOf(delim);
  while (pos !== -1) {
    const next = buf.indexOf(delim, pos + delim.length);
    if (next === -1) break;
    let chunk = buf.subarray(pos + delim.length, next);
    if (chunk.subarray(0, 2).toString() === '\r\n') chunk = chunk.subarray(2);
    if (chunk.subarray(-2).toString() === '\r\n') chunk = chunk.subarray(0, -2);
    const hEnd = chunk.indexOf('\r\n\r\n');
    if (hEnd >= 0) {
      const head = chunk.subarray(0, hEnd).toString('utf8');
      const body = chunk.subarray(hEnd + 4);
      const name = /name="([^"]*)"/.exec(head)?.[1];
      const filename = /filename="([^"]*)"/.exec(head)?.[1];
      if (name && filename !== undefined) { if (name === 'image' && body.length) file = { buffer: Buffer.from(body) }; }
      else if (name) fields[name] = body.toString('utf8');
    }
    pos = next;
  }
  return { fields, file };
}

function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

async function handleAnalyze(req, res) {
  if (!analyzeLimit(clientIp(req))) return send(res, 429, { error: 'rate_limited' });
  let fields = {}; let file = null;
  try {
    const ct = req.headers['content-type'] || '';
    const raw = await readBody(req, MAX_BODY);
    if (ct.startsWith('multipart/form-data')) {
      const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(ct);
      if (!boundary) return send(res, 400, { error: 'bad_request' });
      ({ fields, file } = parseMultipart(raw, boundary[1] || boundary[2]));
    } else {
      fields = JSON.parse(raw.toString('utf8') || '{}');
    }
  } catch (e) {
    return send(res, e.code === 'too_large' ? 413 : 400, { error: e.code === 'too_large' ? 'image_too_large' : 'bad_request' });
  }

  const lang = L(fields.lang);
  const text = String(fields.text || '').slice(0, 6000);
  let image = null;
  if (file) {
    if (file.buffer.length > MAX_IMAGE) return send(res, 413, { error: 'image_too_large' });
    const mimetype = sniffImage(file.buffer);
    if (!mimetype) return send(res, 400, { error: 'bad_image' });
    image = { buffer: file.buffer, mimetype };
  }
  if (!text.trim() && !image) return send(res, 400, { error: 'need_input' });

  try {
    // 1) AI (vision + explanation) when a key is configured; graceful fallback otherwise
    const cfg = aiConfig();
    let ai = null; let aiError = false;
    if (cfg.enabled) {
      try { ai = await analyzeWithAI({ text, image, lang }); }
      catch (e) { aiError = true; console.warn('[ai] failed:', e.message); }
    }

    // 2) Text: pasted + AI-read + OCR fallback
    let combined = [text, ai?.extractedText].filter(Boolean).join('\n').trim();
    let ocrUsed = false;
    if (image && !combined) { combined = await ocrImage(image.buffer); ocrUsed = !!combined; }
    if (!combined) return send(res, 422, { error: 'unreadable_image' });

    // 3) Transparent rule engine
    const h = analyzeText(combined);
    const flags = [...h.flags];

    // 4) Contact details + community reports
    const aiPub = ai?.publisher || { names: [], phones: [], emails: [], urls: [] };
    const aiIds = extractIdentifiers([...aiPub.phones, ...aiPub.emails, ...aiPub.urls].join('\n'));
    const phones = [...new Set([...h.ids.phones, ...aiIds.phones])].slice(0, 5);
    const emails = [...new Set([...h.ids.emails, ...aiIds.emails])].slice(0, 5);
    const urls = [...new Set([...h.ids.urls, ...aiIds.urls])].slice(0, 5);
    const names = aiPub.names.slice(0, 3);
    const found = [
      ...phones.map((value) => ({ type: 'phone', value })),
      ...emails.map((value) => ({ type: 'email', value })),
      ...urls.map((value) => ({ type: 'url', value })),
      ...names.map((value) => ({ type: 'name', value })),
    ].map((i) => ({ ...i, reports: store.countFor(i.type, i.value) }));

    const maxReports = Math.max(0, ...found.map((i) => i.reports));
    if (maxReports > 0) flags.push({ id: 'reported_publisher', weight: Math.min(50, 30 + 10 * (maxReports - 1)), severity: 'high', evidence: '' });

    let { score, level } = scoreFlags(flags, h.greens);
    if (ai && ai.score !== null) {
      score = Math.min(100, Math.max(score, Math.round((score + ai.score) / 2)));
      level = score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low';
    }

    send(res, 200, {
      lang, score, level,
      levelLabel: i18n.pick(i18n.LEVELS[level], lang),
      flags: flags.sort((a, b) => b.weight - a.weight).map((f) => ({
        id: f.id, severity: f.severity, title: i18n.pick(i18n.FLAGS[f.id], lang), evidence: f.evidence,
      })),
      greens: h.greens.map((g) => ({ id: g, title: i18n.pick(i18n.GREENS[g], lang) })),
      ai: ai ? { used: true, provider: ai.provider, summary: ai.summary, extraFlags: ai.extraFlags } : { used: false, failed: aiError },
      found,
      extractedText: image ? combined.slice(0, 2000) : '',
      ocrUsed,
      nextSteps: i18n.NEXT_STEPS[level][lang] || i18n.NEXT_STEPS[level].en,
      disclaimer: i18n.pick(i18n.DISCLAIMER, lang),
    });
  } catch (e) {
    console.error('[analyze]', e);
    send(res, 500, { error: 'server_error' });
  }
}

async function handleReport(req, res) {
  const ip = clientIp(req);
  if (!reportLimit(ip)) return send(res, 429, { error: 'rate_limited' });
  let body;
  try { body = JSON.parse((await readBody(req, 20_000)).toString('utf8') || '{}'); }
  catch { return send(res, 400, { error: 'bad_request' }); }
  const r = store.addReport({ type: body.type, value: body.value, category: body.category, note: body.note, reporterIp: ip });
  if (r.error) return send(res, 400, { error: r.error });
  send(res, 200, { ok: !!r.ok, duplicate: !!r.duplicate, count: r.count });
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...SECURITY_HEADERS,
    });
    res.end(data);
  });
}

export const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/api/health' && req.method === 'GET') {
      const ai = aiConfig();
      return send(res, 200, { ok: true, ai: ai.enabled ? { provider: ai.provider, model: ai.model } : null });
    }
    if (pathname === '/api/analyze' && req.method === 'POST') return await handleAnalyze(req, res);
    if (pathname === '/api/report' && req.method === 'POST') return await handleReport(req, res);
    if (pathname === '/api/stats' && req.method === 'GET') return send(res, 200, store.stats());
    if (pathname.startsWith('/api/')) return send(res, 404, { error: 'not_found' });
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res, pathname);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'server_error' });
  }
});

// Start only when run directly (so tests can import `server`)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    const ai = aiConfig();
    console.log(`\n  JobShield LK running at http://localhost:${PORT}`);
    console.log(ai.enabled
      ? `  AI: ${ai.provider} (${ai.model})\n`
      : '  AI: off (rule-based mode). Add GEMINI_API_KEY or ANTHROPIC_API_KEY to .env to enable.\n');
  });
}
