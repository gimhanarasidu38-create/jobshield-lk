import crypto from 'node:crypto';

const SALT = process.env.HASH_SALT || 'jobshield-dev-salt';

export function hmac(value) {
  return crypto.createHmac('sha256', SALT).update(value).digest('hex');
}

/** Normalize a Sri Lankan phone number to 0XXXXXXXXX, or return null. */
export function normalizePhone(raw) {
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('0094')) d = d.slice(4);
  else if (d.startsWith('94') && d.length === 11) d = d.slice(2);
  if (d.length === 9) d = '0' + d;
  return d.length === 10 && d.startsWith('0') ? d : null;
}

const SHARED_HOSTS = new Set(['t.me', 'wa.me', 'chat.whatsapp.com', 'instagram.com', 'facebook.com', 'fb.com', 'tiktok.com', 'linktr.ee']);

/** Reduce a URL to host (or host/first-path-segment for social/chat platforms). */
export function normalizeUrl(raw) {
  try {
    let s = String(raw).trim().replace(/[),.;]+$/, '');
    if (!/^[a-z]+:\/\//i.test(s)) s = 'https://' + s;
    const u = new URL(s);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (SHARED_HOSTS.has(host)) {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return seg ? `${host}/${seg.toLowerCase()}` : host;
    }
    return host;
  } catch {
    return null;
  }
}

export function normalizeIdentifier(type, value) {
  const v = String(value || '').trim();
  if (!v) return null;
  switch (type) {
    case 'phone': return normalizePhone(v);
    case 'email': return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v.toLowerCase() : null;
    case 'url': return normalizeUrl(v);
    case 'name': {
      const n = v.toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
      return n.length >= 3 ? n : null;
    }
    default: return null;
  }
}

/** Privacy-preserving display string. */
export function maskIdentifier(type, normalized) {
  switch (type) {
    case 'phone': return normalized.slice(0, 3) + '••••' + normalized.slice(-3);
    case 'email': { const [u, d] = normalized.split('@'); return u[0] + '•••@' + d; }
    case 'url': return normalized;
    default: return normalized.slice(0, 2) + '•••';
  }
}

const PHONE_RE = /(?<![\d])(?:\+?\s?94|0094|0)[\s-]?\(?[1-9]\d\)?[\s-]?\d{3}[\s-]?\d{4}(?![\d])/g;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"')]+|\b(?:t\.me|wa\.me|bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|rb\.gy|chat\.whatsapp\.com|linktr\.ee|forms\.gle)\/[^\s<>"')]+|\b(?:[a-z0-9-]+\.)+(?:com|lk|net|org|xyz|top|click|work|icu|club|site|online|info|biz|shop)\b(?:\/[^\s<>"')]*)?/gi;

export function extractIdentifiers(text) {
  const t = String(text || '');
  const emails = [...new Set((t.match(EMAIL_RE) || []).map((e) => e.toLowerCase()))];
  const noEmails = t.replace(EMAIL_RE, ' ');
  const phones = [...new Set((noEmails.match(PHONE_RE) || []).map(normalizePhone).filter(Boolean))];
  const rawUrls = noEmails.match(URL_RE) || [];
  const urls = [...new Set(rawUrls.map(normalizeUrl).filter(Boolean))];
  return { phones: phones.slice(0, 5), emails: emails.slice(0, 5), urls: urls.slice(0, 5), rawUrls };
}
