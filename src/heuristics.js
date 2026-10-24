// Transparent, rule-based scam indicators for job ads.
// Works offline in English, Sinhala, Tamil and common "Singlish" phrasing.
// Every flag returns the exact snippet that triggered it so users can see WHY.

import { extractIdentifiers } from './identifiers.js';

const FREE_EMAIL = /@(gmail|yahoo|ymail|hotmail|outlook|live|proton(mail)?|icloud|aol)\./i;
const CUR = '(?:rs\\.?|lkr|usd|aed|sar|qar|kwd|රු\\.?|ரூ\\.?|\\$|£|€)';

const NO_FEE =
  /\bno\s+(?:\w+\s+)?(?:fees?|charges?|payments?)\b|free of charge|without (?:any )?(?:fee|charge)|fees? (?:is|are) not (?:charged|required)|ගාස්තු\s*අය\s*නොකරයි|ගාස්තු\s*නැත|கட்டணம்\s*இல்லை|கட்டணம்\s*வசூலிக்கப்படாது/i;

const snippet = (m) => (m ? m[0].replace(/\s+/g, ' ').trim().slice(0, 80) : null);
const first = (t, patterns) => {
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return snippet(m);
  }
  return null;
};

// Approximate conversion to LKR, used ONLY for "is this pay suspiciously high" checks.
const TO_LKR = { usd: 320, $: 320, aed: 85, sar: 85, qar: 88, kwd: 1000, '£': 400, '€': 340 };

function salaryCheck(t) {
  const re = new RegExp(`(${CUR})\\s*([\\d][\\d,]*(?:\\.\\d+)?)\\s*(k\\b)?|([\\d][\\d,]*(?:\\.\\d+)?)\\s*(k\\b)?\\s*(usd|dollars?|aed|lkr|rs\\.?|රුපියල්|ரூபாய்)`, 'gi');
  const noExp = /no\s+(experience|qualifications?)|without\s+(experience|qualifications?)|පළපුරුද්ද\s*අවශ්‍ය\s*නැහැ|அனுபவம்\s*தேவையில்லை|any(one| person)\b/i.test(t);
  let m;
  while ((m = re.exec(t))) {
    const cur = (m[1] || m[6] || 'lkr').toLowerCase().replace('.', '');
    const numStr = (m[2] || m[4] || '').replace(/,/g, '');
    let amount = parseFloat(numStr);
    if (!isFinite(amount)) continue;
    if (m[3] || m[5]) amount *= 1000;
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 45).toLowerCase();
    const before = t.slice(Math.max(0, m.index - 35), m.index).toLowerCase();
    const isPay = /salary|income|earn|wage|pay\b|per\s|daily|monthly|වැටුප|ආදායම|சம்பளம்|வருமானம்/.test(before + after);
    if (!isPay || /fee|registration|deposit|charge|ගාස්තු|கட்டணம்/.test(after.slice(0, 20))) continue;
    const lkr = amount * (TO_LKR[cur] || 1);
    let monthly = lkr;
    if (/day|daily|දිනකට|නිතර|ஒரு நாளைக்கு|தினசரி/.test(after)) monthly = lkr * 26;
    else if (/week/.test(after)) monthly = lkr * 4;
    else if (/hour/.test(after)) monthly = lkr * 200;
    if (monthly >= 500000 || (monthly >= 300000 && noExp) || (monthly >= 180000 && /day|daily/.test(after) && noExp)) {
      return snippet({ 0: (before.slice(-12) + m[0] + after.slice(0, 20)) });
    }
  }
  return null;
}

// id, weight (0-100 contribution), severity, test(text, ctx) -> evidence string | null
export const RULES = [
  {
    id: 'upfront_fee', weight: 35, severity: 'high',
    test: (t, ctx) =>
      first(t, [
        new RegExp(`\\b(?:pay|send|deposit|transfer)\\b[^.\\n]{0,25}?${CUR}\\s*[\\d,]{3,}`, 'i'),
        new RegExp(`${CUR}\\s*[\\d,]{3,}[^.\\n]{0,30}\\b(?:fee|registration|deposit|advance|charge)`, 'i'),
        /advance\s+payment/i,
        /(?:ගාස්තු|ගෙවන්න)[^.\n]{0,30}(?:රු\.?|\d{3,})/,
        /(?:රු\.?\s*[\d,]{3,})[^.\n]{0,25}(?:ගාස්තු|ගෙවන්න)/,
        /(?:கட்டணம்|செலுத்த)[^.\n]{0,30}\d{3,}/,
        /(?:ரூ\.?\s*[\d,]{3,})[^.\n]{0,25}(?:கட்டணம்|செலுத்த)/,
        /salli\s+(?:gewanna|ganna)|gewanna\s+(?:one|oni)/i,
      ]) ||
      (!ctx.noFee &&
        first(t, [
          /(?:registration|processing|visa|training|medical|admission|security|joining|document|agent|service|application)\s+(?:fee|fees|charge|charges|payment)/i,
          /ගාස්තු/,
          /கட்டணம்/,
        ])),
  },
  {
    id: 'personal_docs', weight: 18, severity: 'high',
    test: (t) =>
      first(t, [
        /(?:send|share|submit|whatsapp|inbox|upload)\s+(?:us\s+|me\s+)?(?:your\s+)?(?:a\s+)?(?:copy\s+of\s+)?(?:passport|nic\b|national id|bank\s+(?:details|account)|atm|card|otp|password|selfie)/i,
        /passport\s+copy|nic\s+copy/i,
        /\botp\b/i,
        /ගමන්\s*බලපත්‍ර|හැඳුනුම්පත|බැංකු\s*ගිණුම/,
        /கடவுச்சீட்டு|அடையாள\s*அட்டை|வங்கி\s*கணக்கு/,
      ]),
  },
  {
    id: 'task_scam', weight: 30, severity: 'high',
    test: (t) =>
      first(t, [
        /(?:like|share|subscribe|follow|rate|review)\s+(?:youtube\s+)?(?:videos?|posts?|products?|pages?|reels?)/i,
        new RegExp(`(?:earn|income|make|get)\\s+(?:up to\\s+)?${CUR}?\\s*[\\d,]+\\s*(?:per|a|/)\\s*(?:day|daily|hour|week)`, 'i'),
        /\b(?:crypto|bitcoin|usdt|binance|forex)\b.{0,40}\b(?:job|work|earn|income|invest)/i,
        /task[\s-]*based|complete\s+(?:simple\s+)?tasks|recharge\s+to\s+(?:unlock|withdraw)/i,
        /ලයික්|රිවීව්|ඔන්ලයින්\s*රැකියා|ගෙදර\s*සිට\s*(?:ආදායම|මුදල්)/,
        /லைக்|விமர்சனம்\s*செய்து|ஆன்லைன்\s*வேலை|வீட்டிலிருந்து\s*(?:வருமானம்|பணம்)/,
      ]),
  },
  {
    id: 'unrealistic_salary', weight: 20, severity: 'medium',
    test: (t) => salaryCheck(t),
  },
  {
    id: 'guaranteed_job', weight: 15, severity: 'medium',
    test: (t) =>
      first(t, [
        /(?:guarantee[d]?|100\s?%)\s+(?:job|placement|visa|selection)|job\s+guarantee/i,
        /no\s+(?:experience|qualifications?|interview|exam|o\/?l|a\/?l)s?\s*(?:needed|required|necessary)?/i,
        /without\s+(?:experience|interview|qualifications?)/i,
        /සහතික/,
        /පළපුරුද්ද\s*අවශ්‍ය\s*නැහැ|සම්මුඛ\s*පරීක්ෂණයක්?\s*නැහැ|සුදුසුකම්\s*අවශ්‍ය\s*නැහැ/,
        /வேலை\s*உறுதி|அனுபவம்\s*தேவையில்லை|நேர்காணல்\s*இல்லை/,
      ]),
  },
  {
    id: 'urgency', weight: 10, severity: 'medium',
    test: (t) =>
      first(t, [
        /\b(?:urgent(?:ly)?|hurry|today only|apply\s+(?:now|today|immediately)|don'?t miss|immediate\s+joining|last\s+(?:few\s+)?(?:slots|seats|chance))\b/i,
        /\blimited\s+(?:slots|seats|vacancies|positions)\b|only\s+\d+\s+(?:slots|seats|vacancies)/i,
        /වහාම|අදම|ඉක්මනින්|සීමිත\s*(?:ඉඩ|පුරප්පාඩු)/,
        /உடனடியாக|இன்றே|இடங்கள்\s*குறைவு|வரையறுக்கப்பட்ட/,
      ]),
  },
  {
    id: 'whatsapp_only', weight: 15, severity: 'medium',
    test: (t, ctx) => {
      const app = first(t, [/whats\s?app|telegram|viber|\bimo\b|\bt\.me\b|\bwa\.me\b/i, /වට්සැප්/, /வாட்ஸ்அப்/]);
      return app && !ctx.hasCompanyEmail && !ctx.hasCompanySite ? app : null;
    },
  },
  {
    id: 'free_email', weight: 10, severity: 'low',
    test: (t, ctx) => ctx.ids.emails.find((e) => FREE_EMAIL.test(e)) || null,
  },
  {
    id: 'foreign_job_promise', weight: 10, severity: 'medium',
    test: (t) => {
      const si = first(t, [/විදේශ\s*රැකියා/, /வெளிநாட்டு\s*வேலை/]);
      if (si) return si;
      const dest = /dubai|qatar|kuwait|saudi|oman|bahrain|\buae\b|abu dhabi|malaysia|singapore|japan|korea|romania|poland|cyprus|maldives|italy|canada|australia|europe|overseas|abroad|foreign/i;
      const promise = /free\s+(?:visa|ticket|flight|accommodation)|visa\s+(?:provided|included|sponsor)|ticket\s+(?:provided|included)|visa\s*&\s*ticket/i;
      const d = t.match(dest);
      const p = t.match(promise);
      return d && p ? snippet(p) : null;
    },
  },
  {
    id: 'suspicious_link', weight: 10, severity: 'medium',
    test: (t, ctx) =>
      first(ctx.rawUrlsText, [
        /\b(?:bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|rb\.gy|shorturl\.\w+|forms\.gle|linktr\.ee)\b/i,
        /\.(?:xyz|top|click|icu|club|buzz|work)\b/i,
      ]),
  },
  {
    id: 'vague_company', weight: 10, severity: 'low',
    test: (t, ctx) => {
      const company = /\b(?:pvt|ltd|limited|plc|company|corporation|holdings|group|bank|university|ministry|hospital|college|institute|industries|textiles|exports|lanka)\b|\(pvt\)/i.test(t);
      const address = /\b(?:road|rd\.|street|lane|mawatha|avenue|colombo\s*\d+|address|floor)\b|ලිපිනය|முகவரி/i.test(t);
      if (t.trim().length < 15) return null;
      return !company && !address && !ctx.hasCompanySite ? 'no company name or address' : null;
    },
  },
];

export const GREEN_RULES = [
  { id: 'no_fee_statement', test: (t) => (NO_FEE.test(t) ? 'ok' : null) },
  { id: 'company_email', test: (t, ctx) => (ctx.hasCompanyEmail ? 'ok' : null) },
  { id: 'interview_process', test: (t) => (/interview|shortlisted|selection process|සම්මුඛ\s*පරීක්ෂණ|நேர்காணல்/i.test(t) && !/no\s+interview/i.test(t) ? 'ok' : null) },
  { id: 'named_company_address', test: (t) => (/\b(?:pvt|ltd|limited|plc)\b|\(pvt\)/i.test(t) && /\b(?:road|rd\.|street|lane|mawatha|colombo\s*\d*|biyagama|katunayake|kandy|galle)\b/i.test(t) ? 'ok' : null) },
];

const HARD_FLAGS = new Set(['upfront_fee', 'task_scam', 'reported_publisher']);

export function levelFor(score) {
  return score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low';
}

/** Combine flags + green flags into a 0-100 score and a level. */
export function scoreFlags(flags, greens = []) {
  let score = flags.reduce((s, f) => s + f.weight, 0);
  score -= Math.min(12, greens.length * 4);
  score = Math.max(0, Math.min(100, score));
  if (flags.some((f) => HARD_FLAGS.has(f.id))) score = Math.max(score, 60);
  return { score, level: levelFor(score) };
}

export function analyzeText(raw) {
  const text = String(raw || '').slice(0, 6000);
  const ids = extractIdentifiers(text);
  const ctx = {
    ids,
    rawUrlsText: ids.rawUrls.join(' '),
    noFee: NO_FEE.test(text),
    hasCompanyEmail: ids.emails.some((e) => !FREE_EMAIL.test(e)),
    hasCompanySite: ids.urls.some((u) => !/^(t\.me|wa\.me|chat\.whatsapp\.com|instagram\.com|facebook\.com|fb\.com|tiktok\.com|linktr\.ee|bit\.ly|tinyurl\.com)/.test(u)),
  };
  const flags = [];
  for (const r of RULES) {
    const evidence = r.test(text, ctx);
    if (evidence) flags.push({ id: r.id, weight: r.weight, severity: r.severity, evidence: String(evidence).slice(0, 90) });
  }
  const greens = [];
  for (const g of GREEN_RULES) if (g.test(text, ctx)) greens.push(g.id);
  return { flags, greens, ids, ...scoreFlags(flags, greens) };
}
