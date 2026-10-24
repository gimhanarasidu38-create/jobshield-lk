import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, BadgeCheck, Bot, Check, CheckCircle2, Clipboard,
  FileWarning, Globe2, Headphones, LockKeyhole, MessageCircle, Radio, Send,
  Shield, ShieldAlert, ShieldCheck, Sparkles, Volume2, X,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'si', label: 'සිංහල' },
  { id: 'ta', label: 'தமிழ்' },
];

const UI = {
  en: {
    tagline: 'Safer job searches, built for Sri Lanka.',
    analyzer: 'AI Scam Analyzer', quiz: 'Spot the Scam Quiz', radar: 'Live SL Scam Radar',
    title: 'Check the offer before you trust it.', subtitle: 'Paste a job message. See the signals, protect your information, and choose a safer next step.',
    paste: 'Paste the job message or advertisement', analyze: 'Analyze this job ad', analyzing: 'Checking safely…',
    privacy: 'Privacy Shield Active', privacyText: 'NIC, bank account and phone patterns are detected locally and redacted before analysis. Submitted ads are not retained.',
    listen: 'Listen to Audio Advice', flags: 'Why this needs a closer look', checks: 'Sri Lanka verification matrix', steps: 'What to do next',
    complaint: 'Generate official complaint', copy: 'Copy to clipboard', close: 'Close', safe: 'LOW RISK', medium: 'CHECK CAREFULLY', high: 'HIGH RISK',
    recent: 'Recent anonymized signals', botTitle: 'WhatsApp bot preview', botDesc: 'Simulate forwarding a job message and getting a plain-language response. This demo does not send a WhatsApp message.',
    send: 'Preview bot reply', noFlags: 'No specific warning patterns were found. This is not proof that an offer is genuine.',
  },
  si: {
    tagline: 'ශ්‍රී ලංකාව සඳහා වඩාත් ආරක්ෂිත රැකියා සෙවීමක්.',
    analyzer: 'AI වංචා පරීක්ෂාව', quiz: 'වංචාව හඳුනාගන්න', radar: 'සජීවී වංචා රේඩාරය',
    title: 'විශ්වාස කිරීමට පෙර රැකියා යෝජනාව පරීක්ෂා කරන්න.', subtitle: 'පණිවිඩය අලවන්න. අවදානම් ලකුණු බලන්න, ඔබේ තොරතුරු ආරක්ෂා කරගන්න.',
    paste: 'රැකියා පණිවිඩය හෝ දැන්වීම අලවන්න', analyze: 'පරීක්ෂා කරන්න', analyzing: 'ආරක්ෂිතව පරීක්ෂා කරමින්…',
    privacy: 'පෞද්ගලිකත්ව ආරක්ෂාව ක්‍රියාත්මකයි', privacyText: 'NIC, බැංකු ගිණුම් සහ දුරකථන අංක හඳුනාගෙන විශ්ලේෂණයට පෙර සඟවයි. දැන්වීම් ගබඩා නොකරයි.',
    listen: 'හඬ උපදෙස් අසන්න', flags: 'සැලකිලිමත් විය යුතු කරුණු', checks: 'ශ්‍රී ලංකා තහවුරු කිරීමේ ලැයිස්තුව', steps: 'ඊළඟට කළ යුතු දේ',
    complaint: 'නිල පැමිණිල්ලක් සකස් කරන්න', copy: 'පිටපත් කරන්න', close: 'වසන්න', safe: 'අඩු අවදානම', medium: 'සැලකිල්ලෙන් බලන්න', high: 'ඉහළ අවදානම',
    recent: 'මෑත නිර්නාමික සංඥා', botTitle: 'WhatsApp බොට් පෙරදසුන', botDesc: 'රැකියා පණිවිඩයක් යොමු කළ විට ලැබෙන පිළිතුර අනුකරණය කරන්න. මෙය සැබෑ WhatsApp පණිවිඩයක් නොවේ.',
    send: 'පිළිතුර පෙරදසුන් කරන්න', noFlags: 'විශේෂ අනතුරු රටා හමු නොවීය. එයින් රැකියාව සැබෑ බව තහවුරු නොවේ.',
  },
  ta: {
    tagline: 'இலங்கைக்கான பாதுகாப்பான வேலை தேடல்.',
    analyzer: 'AI மோசடி பரிசோதனை', quiz: 'மோசடியைக் கண்டறி', radar: 'நேரடி மோசடி கண்காணிப்பு',
    title: 'நம்புவதற்கு முன் வேலை வாய்ப்பைச் சரிபார்க்கவும்.', subtitle: 'வேலைச் செய்தியை ஒட்டவும். எச்சரிக்கை அறிகுறிகளைப் பார்த்து உங்கள் தகவலைப் பாதுகாக்கவும்.',
    paste: 'வேலைச் செய்தி அல்லது விளம்பரத்தை ஒட்டவும்', analyze: 'பரிசோதிக்கவும்', analyzing: 'பாதுகாப்பாகச் சரிபார்க்கிறது…',
    privacy: 'தனியுரிமைக் கவசம் செயல்பாட்டில்', privacyText: 'NIC, வங்கி கணக்கு மற்றும் தொலைபேசி எண்கள் உள்ளூரில் கண்டறியப்பட்டு பகுப்பாய்வுக்கு முன் மறைக்கப்படும். விளம்பரங்கள் சேமிக்கப்படாது.',
    listen: 'குரல் ஆலோசனையைக் கேளுங்கள்', flags: 'கவனிக்க வேண்டிய அறிகுறிகள்', checks: 'இலங்கை சரிபார்ப்பு அட்டவணை', steps: 'அடுத்ததாகச் செய்ய வேண்டியது',
    complaint: 'அதிகாரப்பூர்வ புகார் தயாரிக்கவும்', copy: 'நகலெடுக்கவும்', close: 'மூடு', safe: 'குறைந்த ஆபத்து', medium: 'கவனமாகச் சரிபார்க்கவும்', high: 'அதிக ஆபத்து',
    recent: 'சமீபத்திய அநாமதேய அறிகுறிகள்', botTitle: 'WhatsApp பாட் முன்னோட்டம்', botDesc: 'வேலைச் செய்தியை அனுப்பினால் கிடைக்கும் பதிலை உருவகப்படுத்தவும். இது உண்மையான WhatsApp செய்தியை அனுப்பாது.',
    send: 'பதிலை முன்னோட்டமிடு', noFlags: 'குறிப்பிட்ட எச்சரிக்கை முறைகள் கண்டறியப்படவில்லை. இது வேலை உண்மையானது என்பதற்கான ஆதாரம் அல்ல.',
  },
};

const SAMPLES = [
  {
    label: '🚨 Telegram Data Entry Scam (Sinhala/Singlish + eZ Cash)',
    text: 'දවසට Rs. 8,000 data entry job! No experience. Slots left - urgent. Registration fee Rs. 2,500 via eZ Cash, pay today. WhatsApp only: wa.me/94771234567',
  },
  {
    label: '✈️ Fake Romania Work Visa (SLBFE Warning)',
    text: 'Romania factory worker vacancies. 100% visa guaranteed, no interview. Medical advance Rs. 45,000 today to reserve your place. Contact Telegram t.me/fastjobs',
  },
  {
    label: '✅ Legitimate Colombo Software Engineer Job (Safe)',
    text: 'Colombo software company hiring a Software Engineer. 3 years experience with React and Python required. Apply through the company careers page and attend two interviews. No application or recruitment fees are charged.',
  },
];

const QUIZ = [
  {
    snippet: '“Pay Rs. 15,000 activation fee by eZ Cash today to unlock your overseas job.”',
    scam: true,
    why: 'An advance fee, mobile-money transfer and pressure to act quickly are strong warning signs. Verify the recruiter with SLBFE before paying.',
  },
  {
    snippet: '“A Colombo employer lists a role, required qualifications, interview steps and a company-domain application email. No fees are charged.”',
    scam: false,
    why: 'These details are more consistent with a transparent hiring process. Still verify the employer independently; scammers can copy real company details.',
  },
  {
    snippet: '“No experience needed! Earn Rs. 20,000 daily by liking videos. Join our Telegram and pay a small deposit to withdraw.”',
    scam: true,
    why: 'Unrealistic earnings, task-based work, Telegram-only contact and a deposit-to-withdraw request are common scam patterns.',
  },
];

const flagLabel = {
  UPFRONT_FEE: 'Upfront fee / payment',
  UNREALISTIC_PAY: 'Unrealistic promise or pay',
  UNOFFICIAL_CONTACT: 'Unofficial contact channel',
  SLBFE_UNVERIFIED: 'Overseas job not verified',
  PSYCHOLOGICAL_URGENCY: 'Pressure or urgency',
};

const demoFlags = (result) => result?.red_flags?.map((flag) => flag.suspicious_phrase).filter(Boolean) || [];

function HighlightedText({ text, phrases }) {
  if (!text) return null;
  const alternatives = [...new Set(phrases)].sort((a, b) => b.length - a.length);
  if (!alternatives.length) return <p className="whitespace-pre-wrap leading-7">{text}</p>;
  const escaped = alternatives.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const expression = new RegExp(`(${escaped.join('|')})`, 'gi');
  return (
    <p className="whitespace-pre-wrap leading-7">
      {text.split(expression).map((part, index) =>
        alternatives.some((phrase) => phrase.toLowerCase() === part.toLowerCase())
          ? <mark key={index} className="rounded-md bg-amber-100 px-1 py-0.5 font-semibold text-amber-950">{part}</mark>
          : part)}
    </p>
  );
}

function App() {
  const [language, setLanguage] = useState('en');
  const [tab, setTab] = useState('analyzer');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComplaint, setShowComplaint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [scams, setScams] = useState([]);
  const [botText, setBotText] = useState('');
  const [botReply, setBotReply] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const t = UI[language];

  const localPii = useMemo(() => {
    const matches = [
      ...(text.match(/(?<!\d)(?:\d{9}[VXvx]|\d{12})(?!\d)/g) || []),
      ...(text.match(/(?<![\d+])(?:\+94[\s-]*7(?:[\s-]*\d){8}|94[\s-]*7(?:[\s-]*\d){8}|07(?:[\s-]*\d){8})(?!\d)/g) || []),
      ...(text.match(/(?<!\d)\d{8,16}(?!\d)/g) || []),
    ];
    return new Set(matches).size;
  }, [text]);

  useEffect(() => {
    if (tab !== 'radar') return;
    fetch(`${API_BASE}/api/recent-scams`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load community signals.');
        const data = await response.json();
        setScams(data.scams || []);
      })
      .catch(() => setError('Could not load the scam radar. Start the FastAPI service and try again.'));
  }, [tab]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  async function analyze(adText = text, outputLanguage = language) {
    if (!adText.trim()) {
      setError('Paste a job message or select one of the sample ads first.');
      return null;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: adText, language: outputLanguage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis could not be completed.');
      setText(adText);
      setResult(data);
      return data;
    } catch (err) {
      setError(`${err.message} Check that the FastAPI server is running at ${API_BASE}.`);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function copyComplaint() {
    try {
      await navigator.clipboard.writeText(result.official_complaint_draft.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access is unavailable. Select and copy the complaint text manually.');
    }
  }

  function listenToAdvice() {
    if (!result?.summary || !window.speechSynthesis) {
      setError('Audio advice is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const riskText = `${result.risk_level}: ${result.summary}`;
    const utterance = new SpeechSynthesisUtterance(riskText);
    utterance.lang = { en: 'en-LK', si: 'si-LK', ta: 'ta-LK' }[language];
    window.speechSynthesis.speak(utterance);
  }

  async function previewBotReply() {
    if (!botText.trim()) return;
    setBotLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: botText, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not analyze this message.');
      setBotReply(`${data.risk_level} advisory (${data.final_risk_score}/100): ${data.summary}`);
    } catch (err) {
      setError(`${err.message} Check the FastAPI service.`);
    } finally {
      setBotLoading(false);
    }
  }

  const riskTone = result?.risk_level === 'HIGH'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : result?.risk_level === 'MEDIUM'
      ? 'text-amber-800 bg-amber-50 border-amber-200'
      : 'text-teal-700 bg-teal-50 border-teal-200';
  const scoreColor = result?.risk_level === 'HIGH' ? '#e24646' : result?.risk_level === 'MEDIUM' ? '#e3a52b' : '#149576';

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white"><ShieldCheck size={25} /></span>
            <div>
              <div className="text-lg font-extrabold tracking-tight">JobShield AI</div>
              <div className="text-xs text-slate-500">Hack for Humanity SL — Open Source MVP</div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Globe2 size={17} aria-hidden="true" />
            <span className="sr-only">Select language</span>
            <select aria-label="Language" value={language} onChange={(event) => { const nextLanguage = event.target.value; setLanguage(nextLanguage); if (result && text.trim()) analyze(text, nextLanguage); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              {LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a3d36] via-[#0b6152] to-[#168a70] px-6 py-8 text-white shadow-card sm:px-10 sm:py-11">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide"><Sparkles size={14} /> {t.tagline}</div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-teal-50 sm:text-lg">{t.subtitle}</p>
            </div>
            <div className="hidden rounded-full border border-white/20 bg-white/10 p-7 md:block"><Shield size={66} strokeWidth={1.3} /></div>
          </div>
        </section>

        <nav aria-label="Main navigation" className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            ['analyzer', t.analyzer, ShieldAlert],
            ['quiz', t.quiz, BadgeCheck],
            ['radar', t.radar, Radio],
          ].map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => { setTab(id); setError(''); }} aria-current={tab === id ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </nav>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertTriangle size={19} className="mt-0.5 shrink-0" />{error}<button type="button" onClick={() => setError('')} className="ml-auto" aria-label="Dismiss error"><X size={18} /></button></div>}

        {tab === 'analyzer' && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><FileWarning size={21} /></div>
                <div><h2 className="font-extrabold">{t.paste}</h2><p className="text-sm text-slate-500">English · සිංහල · தமிழ்</p></div>
              </div>
              <label htmlFor="job-ad" className="sr-only">{t.paste}</label>
              <textarea id="job-ad" value={text} onChange={(event) => setText(event.target.value)} maxLength={12000} rows={9}
                placeholder="Paste the complete message here…"
                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white" />
              <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{text.length}/12000</span><span>Preview scans NIC, account and phone patterns locally.</span></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLES.map((sample) => <button key={sample.label} type="button" onClick={() => { setText(sample.text); setResult(null); setError(''); }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-teal-400 hover:bg-teal-50">{sample.label}</button>)}
              </div>
              <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4">
                <div className="flex items-center gap-2 font-bold text-teal-800"><LockKeyhole size={17} />{t.privacy}</div>
                <p className="mt-1 text-sm leading-6 text-teal-900">{t.privacyText}</p>
                <p className="mt-2 text-xs font-semibold text-teal-800" aria-live="polite">Potential personal identifiers in this text: {localPii}</p>
              </div>
              <button type="button" disabled={loading} onClick={() => analyze()} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60">
                {loading ? t.analyzing : <>{t.analyze}<ArrowRight size={18} /></>}
              </button>
            </section>

            <section aria-live="polite" className="space-y-5">
              {!result ? (
                <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
                  <div className="max-w-sm"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-700"><ShieldCheck size={34} /></div><h2 className="mt-4 text-xl font-extrabold">Your results will appear here</h2><p className="mt-2 text-sm leading-6 text-slate-600">Try one of the sample messages to see the explainable score, local privacy redaction and verification checklist.</p></div>
                </div>
              ) : (
                <>
                  <article className={`rounded-3xl border p-5 shadow-card sm:p-6 ${riskTone}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div><p className="text-xs font-bold uppercase tracking-[.15em]">Hybrid risk assessment</p><h2 className="mt-1 text-2xl font-black">{t[result.risk_level.toLowerCase()]}</h2><p className="mt-2 max-w-lg text-sm leading-6">{result.summary}</p></div>
                      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${scoreColor} ${result.final_risk_score * 3.6}deg, #e5e7eb 0deg)` }}>
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><strong className="text-2xl text-slate-900">{result.final_risk_score}</strong><span className="text-[10px] uppercase text-slate-500">/ 100</span></div>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white/80 p-3"><span className="block text-xs text-slate-500">Local Heuristic Engine</span><strong>{result.heuristic_score}/100</strong></div>
                      <div className="rounded-xl bg-white/80 p-3"><span className="block text-xs text-slate-500">LLM Semantic Score</span><strong>{result.llm_score}/100</strong></div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">Final score = 60% local heuristic + 40% LLM semantic score</p>
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/80 p-3 text-xs font-bold text-slate-700"><LockKeyhole size={15} />🔒 Privacy Shield: {result.pii_redacted_count} Personal Identifier(s) Masked</div>
                    <button type="button" onClick={listenToAdvice} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-current/20 bg-white/75 px-3 py-2 text-sm font-bold hover:bg-white"><Volume2 size={17} /> 🔊 {t.listen}</button>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
                    <h3 className="mb-3 flex items-center gap-2 font-extrabold"><AlertTriangle size={18} className="text-amber-600" />{t.flags}</h3>
                    <div className="rounded-xl bg-slate-50 p-4 text-sm"><HighlightedText text={result.sanitized_text} phrases={demoFlags(result)} /></div>
                    {result.red_flags.length ? <ul className="mt-4 space-y-3">{result.red_flags.map((flag, index) => <li key={`${flag.category}-${index}`} className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm"><span className="mt-0.5 rounded-md bg-amber-200 px-2 py-1 text-[10px] font-black text-amber-900">{flagLabel[flag.category]}</span><span className="leading-6 text-slate-700">{flag.flag}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">{t.noFlags}</p>}
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
                    <h3 className="mb-4 font-extrabold">{t.checks}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { title: 'SLBFE licence', warning: result.sri_lanka_checks.slbfe_warning, detail: result.sri_lanka_checks.slbfe_warning ? 'Overseas employment without a visible licence reference.' : 'Verify the recruiter in the official registry.', icon: Globe2 },
                        { title: 'Payment method', warning: result.sri_lanka_checks.unregulated_payment_detected, detail: result.sri_lanka_checks.unregulated_payment_detected ? 'Upfront fee or personal payment method flagged.' : 'Never pay recruitment fees to a personal account.', icon: LockKeyhole },
                        { title: 'Contact channel', warning: result.sri_lanka_checks.unofficial_channel_detected, detail: result.sri_lanka_checks.unofficial_channel_detected ? 'Messaging-only or personal email contact flagged.' : 'Confirm contact details on the official company site.', icon: MessageCircle },
                        { title: 'Passport rights', warning: result.sri_lanka_checks.passport_retention_warning, detail: result.sri_lanka_checks.passport_retention_warning ? 'The message suggests keeping or surrendering a passport.' : 'Retention of your original passport may violate your rights; verify with SLBFE and do not surrender it to an agent.', icon: ShieldAlert },
                      ].map(({ title, warning, detail, icon: Icon }) => <div key={title} className={`rounded-xl border p-4 ${warning ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center gap-2 text-sm font-bold"><Icon size={17} className={warning ? 'text-rose-600' : 'text-teal-700'} />{title}<span className="ml-auto">{warning ? <AlertTriangle size={16} className="text-rose-600" /> : <CheckCircle2 size={16} className="text-teal-600" />}</span></div><p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p>{title === 'SLBFE licence' && <a className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700 underline" href="https://www.slbfe.lk/" target="_blank" rel="noreferrer">Check slbfe.lk <ArrowRight size={13} /></a>}</div>)}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
                    <h3 className="mb-3 font-extrabold">{t.steps}</h3>
                    <ol className="space-y-3">{result.actionable_steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-black text-teal-800">{index + 1}</span>{step}</li>)}</ol>
                    <button type="button" onClick={() => setShowComplaint(true)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-teal-700 px-4 py-2.5 font-bold text-teal-800 hover:bg-teal-50"><FileWarning size={17} />{t.complaint}</button>
                  </article>
                </>
              )}
            </section>
          </div>
        )}

        {tab === 'quiz' && (
          <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-9">
            <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Test your scam IQ</p><h2 className="mt-1 text-2xl font-black">Can you spot the warning signs?</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{quizIndex + 1} / {QUIZ.length}</span></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-lg font-semibold leading-8">{QUIZ[quizIndex].snippet}</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setQuizAnswer(true)} className="min-h-12 rounded-xl border border-rose-200 bg-rose-50 font-bold text-rose-800 hover:bg-rose-100">🚨 SCAM</button>
              <button type="button" onClick={() => setQuizAnswer(false)} className="min-h-12 rounded-xl border border-teal-200 bg-teal-50 font-bold text-teal-800 hover:bg-teal-100">✅ SAFE</button>
            </div>
            {quizAnswer !== null && <div role="status" className={`mt-5 rounded-xl p-4 text-sm leading-6 ${quizAnswer === QUIZ[quizIndex].scam ? 'bg-teal-50 text-teal-900' : 'bg-amber-50 text-amber-950'}`}><strong>{quizAnswer === QUIZ[quizIndex].scam ? 'Correct — ' : 'Not quite — '}</strong>{QUIZ[quizIndex].why}<button type="button" onClick={() => { setQuizIndex((quizIndex + 1) % QUIZ.length); setQuizAnswer(null); }} className="mt-3 flex items-center gap-2 font-bold underline">Next flashcard <ArrowRight size={16} /></button></div>}
            <p className="mt-6 text-xs text-slate-500">These fictional teaching examples are simplified. Real offers require independent verification.</p>
          </section>
        )}

        {tab === 'radar' && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
              <div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><Radio size={20} /></div><div><h2 className="font-extrabold">{t.recent}</h2><p className="text-sm text-slate-500">Last five high-risk scans · no ad text or identifiers stored</p></div></div>
              <div className="space-y-3">{scams.length ? scams.map((scam, index) => <article key={`${scam.detected_at}-${index}`} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><strong className="text-sm">{scam.label}</strong><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-800">{scam.risk_score}/100</span></div><p className="mt-1 text-xs text-slate-500">{new Date(scam.detected_at).toLocaleString()}</p><div className="mt-3 flex flex-wrap gap-1.5">{scam.categories.map((category) => <span key={category} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{flagLabel[category] || category}</span>)}</div></article>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No signals loaded yet. Check that the FastAPI server is running.</p>}</div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Community signals are unverified patterns, not accusations. Reports are not published with message content or personal details.</p>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
              <div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Bot size={21} /></div><div><h2 className="font-extrabold">{t.botTitle}</h2><p className="text-sm text-slate-500">Forward a job message for a quick advisory check</p></div></div>
              <div className="rounded-2xl bg-[#e8f5ed] p-4">
                <div className="mb-3 max-w-[85%] rounded-xl rounded-tl-sm bg-white p-3 text-sm leading-6 shadow-sm"><strong className="mb-1 flex items-center gap-2 text-teal-800"><Bot size={15} /> JobShield Bot</strong>{t.botDesc}</div>
                {botReply && <div role="status" className="mb-3 ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-white p-3 text-sm leading-6 shadow-sm">{botReply}</div>}
                <textarea value={botText} onChange={(event) => setBotText(event.target.value)} rows={4} maxLength={12000} aria-label="Message to simulate forwarding" placeholder="Paste a message to preview a WhatsApp bot reply…" className="w-full rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-teal-500" />
                <button type="button" onClick={previewBotReply} disabled={botLoading || !botText.trim()} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 font-bold text-white hover:bg-teal-700 disabled:opacity-50"><Send size={16} />{botLoading ? 'Checking…' : t.send}</button>
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Headphones size={15} className="mt-0.5 shrink-0" />Bot integration is a prototype preview only; no WhatsApp number or external messaging service is connected.</div>
            </section>
          </div>
        )}

        <footer className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-6 text-slate-600">
          <div className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-teal-700" /><div><strong className="text-slate-800">Ethical AI & open source:</strong> AI indicators are advisory and not legal proof of fraud. Always verify via official SLBFE registries. JobShield combines a deterministic Sri Lanka-specific rule engine with optional LLM analysis; when no API key is configured, it runs locally with a transparent deterministic fallback. Privacy identifiers are scrubbed before any external model request.</div></div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1"><a className="font-bold text-teal-700 underline" href="https://www.slbfe.lk/" target="_blank" rel="noreferrer">SLBFE official website</a><a className="font-bold text-teal-700 underline" href="https://cert.gov.lk/" target="_blank" rel="noreferrer">Sri Lanka CERT</a><span>Hack for Humanity SL · Open-source MVP</span></div>
        </footer>
      </main>

      {showComplaint && result && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowComplaint(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="complaint-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Official report draft</p><h2 id="complaint-title" className="mt-1 text-xl font-black">{result.official_complaint_draft.subject}</h2></div><button type="button" onClick={() => setShowComplaint(false)} aria-label={t.close} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><strong>To:</strong> {result.official_complaint_draft.recipient}<p className="mt-1"><strong>Subject:</strong> {result.official_complaint_draft.subject}</p></div>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 p-4 font-sans text-sm leading-6 text-slate-700">{result.official_complaint_draft.body}</pre>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950"><strong>Before sending:</strong> review the draft and attach evidence yourself using an official secure channel. SLBFE hotline: <a className="font-black underline" href="tel:1989">1989</a> · Sri Lanka CERT: <a className="font-bold underline" href="tel:+94112691692">+94 11 269 1692</a> / <a className="font-bold underline" href="https://cert.gov.lk/report_incident" target="_blank" rel="noreferrer">incident report</a> · Police Computer Crime Investigation Division: <a className="font-bold underline" href="tel:+94112381045">+94 11 238 1045</a> · Police emergency: <a className="font-bold underline" href="tel:119">119</a>. Check official agency pages for current contacts.</div>
            <button type="button" onClick={copyComplaint} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 font-bold text-white hover:bg-teal-700">{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Copied' : t.copy}</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
