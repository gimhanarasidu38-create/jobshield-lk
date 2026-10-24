import { UI } from './ui.js';
import { SAMPLES } from './samples.js';

const $ = (id) => document.getElementById(id);
const state = { lang: 'en', image: null, last: null, health: null };

try { state.lang = localStorage.getItem('lang') || (navigator.language || '').slice(0, 2) || 'en'; } catch { /* ignore */ }
if (!UI[state.lang]) state.lang = 'en';
const t = () => UI[state.lang];

// UI-only feedback: character count is not sent to the server.
function updateCharacterCount() {
  $('charCount').textContent = `${$('adText').value.length} / 6000`;
}

// ---------- helpers (DOM only; never innerHTML with data) ----------
function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}

function showError(msg) {
  const p = $('error');
  p.textContent = msg || '';
  p.hidden = !msg;
}

// ---------- i18n ----------
function applyLang() {
  const s = t();
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((n) => { if (s[n.dataset.i18n] != null) n.textContent = s[n.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = s[n.dataset.i18nPh]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((n) => { if (s[n.dataset.i18nAria]) n.setAttribute('aria-label', s[n.dataset.i18nAria]); });
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  $('previewImg').alt = s.previewAlt;
  renderAiBadge();
  loadStats();
  // Re-run analysis in the new language so server-side text matches
  if (state.last && !$('analyze').disabled) analyze(true);
}

function renderAiBadge() {
  const h = state.health;
  $('aiBadge').textContent = h ? (h.ai ? `${t().aiOn}: ${h.ai.provider}` : t().aiOff) : '';
}

// ---------- image handling ----------
function setImage(file) {
  if (!file) return;
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return showError(t().errImage);
  showError('');
  downscale(file).then((blob) => {
    state.image = blob;
    $('previewImg').src = URL.createObjectURL(blob);
    $('preview').hidden = false;
  });
}

// Shrink big phone screenshots client-side: faster upload, faster AI, same readability.
function downscale(file, maxSide = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      if (scale === 1 && file.size < 1.5 * 1024 * 1024) { URL.revokeObjectURL(url); return resolve(file); }
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => { URL.revokeObjectURL(url); resolve(b || file); }, 'image/jpeg', 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function clearImage() {
  state.image = null;
  $('file').value = '';
  $('preview').hidden = true;
  $('previewImg').removeAttribute('src');
}

// ---------- analysis ----------
async function analyze(silent = false) {
  const text = $('adText').value.trim();
  if (!text && !state.image) return showError(t().errNeedInput);
  showError('');
  const btn = $('analyze');
  btn.disabled = true;
  if (!silent) btn.textContent = t().analyzing;
  try {
    const fd = new FormData();
    fd.append('lang', state.lang);
    fd.append('text', text);
    if (state.image) fd.append('image', state.image, 'ad.jpg');
    const res = await fetch('/api/analyze', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const map = { need_input: t().errNeedInput, bad_image: t().errImage, image_too_large: t().errTooLarge, unreadable_image: t().errUnreadable, rate_limited: t().errRate };
      return showError(map[data.error] || t().errGeneric);
    }
    state.last = data;
    renderResult(data);
  } catch {
    showError(t().errGeneric);
  } finally {
    btn.disabled = false;
    btn.textContent = t().analyze;
  }
}

function section(title, ...kids) {
  return el('div', { class: 'sec' }, el('h3', { text: title }), ...kids);
}

function renderResult(d) {
  const s = t();
  const out = $('out');
  out.replaceChildren();

  const bar = el('div', { class: 'bar' }, el('i'));
  bar.firstChild.style.setProperty('--w', '0%');
  const icon = { low: '✔', medium: '⚠', high: '✖' }[d.level];
  out.append(el('div', { class: `verdict ${d.level}` },
    el('div', { class: 'score' }, String(d.score), el('small', { text: s.scoreLabel })),
    el('div', {}, el('div', { class: 'vlabel', text: `${icon} ${d.levelLabel}` }), bar),
  ));
  requestAnimationFrame(() => bar.firstChild.style.setProperty('--w', `${d.score}%`));

  // AI explanation
  if (d.ai.used) {
    out.append(el('div', { class: 'sec ai' },
      el('h3', {}, s.aiSummary, el('span', { class: 'badge', text: s.aiOn })),
      el('p', { text: d.ai.summary || '' }),
    ));
  } else {
    out.append(el('p', { class: 'fine', text: d.ai.failed ? s.aiFailedNote : s.aiOffNote }));
  }

  // Red flags
  out.append(section(s.redFlags, d.flags.length
    ? el('ul', { class: 'flags' }, d.flags.map((f) =>
      el('li', { class: f.severity },
        el('span', { class: 'sev', text: s.sev[f.severity] }),
        el('div', { text: f.title }),
        f.evidence ? el('q', { text: f.evidence }) : null)))
    : el('p', { class: 'muted', text: s.noFlags })));

  if (d.ai.used && d.ai.extraFlags?.length) {
    out.append(section(s.aiNoticed, el('ul', { class: 'flags' }, d.ai.extraFlags.map((f) =>
      el('li', { class: 'low' }, el('strong', { text: f.title }), f.detail ? el('div', { text: f.detail }) : null)))));
  }

  if (d.greens.length) out.append(section(s.greenFlags, el('ul', { class: 'greens' }, d.greens.map((g) => el('li', { text: `✔ ${g.title}` })))));

  // Detected contact details -> quick report
  if (d.found.length) {
    out.append(section(s.found,
      el('div', { class: 'found' }, d.found.map((f) =>
        el('button', { type: 'button', class: 'chip', onclick: () => prefillReport(f) },
          f.value, f.reports ? el('small', { text: s.reportedTimes(f.reports) }) : null))),
      el('p', { class: 'fine', text: s.tapToReport })));
    renderDetected(d.found);
  } else {
    renderDetected([]);
  }

  if (d.extractedText) out.append(section(`${s.extracted} ${d.ocrUsed ? s.ocr : ''}`, el('pre', { class: 'ocr', text: d.extractedText })));

  out.append(section(s.nextSteps, el('ol', { class: 'steps' }, d.nextSteps.map((x) => el('li', { text: x })))));
  out.append(el('p', { class: 'disc', text: d.disclaimer }));

  $('placeholder').hidden = true;
  out.hidden = false;
  if (matchMedia('(max-width: 899px)').matches) $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- reporting ----------
const TYPE_BY_KIND = { phone: 'phone', email: 'email', url: 'url', name: 'name' };

function renderDetected(found) {
  const box = $('detected');
  box.replaceChildren();
  box.hidden = !found.length;
  if (!found.length) return;
  box.append(el('strong', { text: t().found + ': ' }),
    ...found.map((f) => el('button', { type: 'button', class: 'chip', onclick: () => prefillReport(f), text: f.value })));
}

function prefillReport(f) {
  $('rType').value = TYPE_BY_KIND[f.type] || 'name';
  $('rValue').value = f.value;
  $('reportCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('rValue').focus({ preventScroll: true });
}

async function submitReport(e) {
  e.preventDefault();
  const msg = $('rMsg');
  const btn = e.submitter || e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  msg.textContent = t().sending;
  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: $('rType').value, value: $('rValue').value, category: $('rCat').value, note: $('rNote').value }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      msg.textContent = j.duplicate ? t().reportDup : t().reportThanks;
      if (!j.duplicate) { $('rValue').value = ''; $('rNote').value = ''; }
      loadStats();
      if (state.last) analyze(true); // refresh score with the new community signal
    } else {
      msg.textContent = j.error === 'rate_limited' ? t().errRate : (j.error || '').startsWith('bad_') ? t().reportBad : t().errGeneric;
    }
  } catch {
    msg.textContent = t().errGeneric;
  } finally {
    btn.disabled = false;
  }
}

async function loadStats() {
  try {
    const s = await (await fetch('/api/stats')).json();
    const ul = $('top');
    ul.replaceChildren();
    if (!s.top.length) { ul.append(el('li', { class: 'muted', text: t().communityEmpty })); return; }
    for (const r of s.top) ul.append(el('li', {}, el('span', { text: `${r.display}  ·  ${t().cat[r.category] || r.category}` }), el('strong', { text: t().reportedTimes(r.count) })));
  } catch { /* offline */ }
}

// ---------- wire up ----------
document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => {
  state.lang = b.dataset.lang;
  try { localStorage.setItem('lang', state.lang); } catch { /* ignore */ }
  applyLang();
}));

$('bigText').addEventListener('click', (e) => {
  const on = document.documentElement.classList.toggle('big');
  e.currentTarget.setAttribute('aria-pressed', String(on));
});

const drop = $('drop');
drop.addEventListener('click', () => $('file').click());
drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
$('adText').addEventListener('input', updateCharacterCount);
$('file').addEventListener('change', (e) => setImage(e.target.files[0]));
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => setImage(e.dataTransfer.files[0]));
document.addEventListener('paste', (e) => {
  const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/'));
  if (f) { e.preventDefault(); setImage(f); }
});
$('removeImg').addEventListener('click', clearImage);

document.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', () => {
  $('adText').value = SAMPLES[b.dataset.sample];
  updateCharacterCount();
  clearImage();
  analyze();
}));

$('analyze').addEventListener('click', () => analyze());
$('reportForm').addEventListener('submit', submitReport);

fetch('/api/health').then((r) => r.json()).then((h) => { state.health = h; renderAiBadge(); }).catch(() => {});
updateCharacterCount();
applyLang();
