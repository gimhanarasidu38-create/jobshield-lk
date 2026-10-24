# JobShield AI

**Hackathon:** Hacktoberfest Hack Day Colombo — Hack for Humanity in Sri Lanka  
**Track:** Social impact / public-interest technology  
**License:** MIT

JobShield AI is an open-source, privacy-first MVP that helps Sri Lankan job seekers assess recruitment messages in English, Sinhala, and Tamil. It combines a transparent local rule engine with optional language-model analysis, redacts common personal identifiers before an external AI request, and points people toward independent verification and reporting.

> **Advisory only:** A risk score is not legal proof of fraud. JobShield does not verify employers or SLBFE licences against a live registry. Always confirm overseas recruiters through official SLBFE channels before paying or sharing documents.

## The problem and impact

Foreign-employment and online-job offers are frequently shared as forwarded messages, short links, and screenshots. That format can make it hard to distinguish legitimate recruitment from requests for advance fees, personal-account transfers, passport surrender, or sensitive identity information—especially for people who have limited access to digital-safety guidance in their preferred language.

The scale of overseas employment makes practical verification tools important. **The Sri Lanka Bureau of Foreign Employment (SLBFE) recorded 297,656 departures for foreign employment in 2023.** This is a migration-volume statistic, not a count of scams or victims. Refer to the SLBFE [official site and annual reports](https://www.slbfe.lk/) for the source series and current figures.

JobShield contributes by:

- Giving job seekers an immediate, multilingual second opinion on pasted recruitment messages.
- Explaining which phrases triggered each warning, rather than presenting an opaque verdict.
- Redacting NIC, phone, and likely bank-account numbers before an optional model request.
- Showing practical checks and complaint-draft text that people can review before sending.
- Demonstrating digital-literacy concepts with a quiz and anonymized community signal feed.

## Hybrid AI architecture

```text
React + Tailwind client
  ├── Local PII preview and sample ads
  ├── Analyzer / literacy quiz / community radar
  └── Complaint draft, copy-to-clipboard, browser speech
              │ JSON: { text, language }
              ▼
FastAPI: POST /api/analyze
  1. Privacy Shield
     NIC / phone / likely bank account → redacted placeholders
              │ sanitized text only
              ▼
  2. Deterministic Sri Lanka rule engine
     eZ Cash / fees / urgency / WhatsApp & Telegram /
     personal email / overseas job without visible licence
              │ transparent score + exact matched phrases
              ▼
  3. Optional semantic analysis
     Gemini or OpenAI via AI_API_KEY
     └── no key, malformed response, or provider failure → offline fallback
              │
              ▼
  60% local heuristic + 40% semantic score
  Explainable result + action steps + reviewed complaint draft
              │
              └── HIGH: save only score, generic label, time and categories
                  in an in-memory SQLite community feed (no ad text or PII)
```

## Core features

- **Three-stage analysis:** deterministic redaction, custom heuristics, and optional LLM score/summary fusion.
- **Strict response contract:** risk level and scores, redacted text, red flags, Sri Lanka checks, actionable steps, and complaint draft.
- **Offline judging mode:** no API key is necessary; the analyzer and feed work with deterministic logic.
- **Multilingual interface:** English, Sinhala, and Tamil selector; browser-native speech advisory.
- **Demo-ready UI:** three sample ads, scam-literacy flashcards, a community radar, and an explicitly simulated WhatsApp bot.
- **Privacy-conscious feed:** the API never stores submitted ad contents; high-risk entries retain only generic labels and signal categories in memory.
- **Honest demo data:** the three pre-seeded radar examples are marked as fictional demo entries, not verified community reports.
- **Accessibility:** keyboard-operable controls, semantic sections, visible focus, live status/error messages, and risk labels that do not rely on color alone.

## Run locally

Requirements: Python 3.10+ and Node.js 20+.

### 1. Start the FastAPI service

PowerShell:

```powershell
cd server
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`. Interactive API documentation is at `http://localhost:8000/docs`.

### 2. Start the React client

In a second terminal:

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend defaults to the local API at `http://localhost:8000`. To use another API host, set `VITE_API_BASE` before starting/building the client.

### Optional AI provider

The application works without an API key. To enable semantic analysis, configure the server environment:

```powershell
$env:AI_API_KEY = "your-provider-key"
$env:AI_PROVIDER = "gemini" # or "openai"
# Optional model override; defaults to gemini-1.5-flash or gpt-4o-mini.
$env:AI_MODEL = "gemini-1.5-flash"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Do not commit API keys. The server sends only the sanitized message to the selected provider. Provider errors are logged and fall back to deterministic analysis; raw ad text is not written to application logs or the community feed.

### Tests and production build

```powershell
cd server
py -m unittest -v test_main.py

cd ..\client
npm install
npm run build
```

For deployments, host the FastAPI API and built React assets separately or serve the client through a static host. Set `CORS_ORIGINS` on the API to the exact client origins; do not use wildcard origins for a public deployment.

## Privacy and ethical AI

- **Redaction happens before the model call.** NIC numbers, Sri Lankan mobile numbers, and contiguous 8–16 digit account-like values are replaced with explicit placeholders.
- The API returns the redacted version and count so the UI can show users what was masked.
- No full message, name, contact detail, or complaint is saved in the community feed. The feed is an in-memory SQLite store and resets when the API restarts.
- A phone number is retained only as an in-process boolean heuristic signal; the digits are not saved or sent to the model.
- LLM output is constrained to a score and summary; red-flag phrases and verification checks come from deterministic local rules.
- Results can be wrong or incomplete. False positives and missed scams are possible, and the project does not replace a qualified legal or government assessment.
- Complaint drafts are suggestions. Review them, add evidence only through official secure channels, and do not treat generated text as a filed complaint.
- The WhatsApp card is a simulator: it does not connect to WhatsApp or send messages.

## Official verification and reporting

- **SLBFE:** [slbfe.lk](https://www.slbfe.lk/) · hotline **1989**
- **Sri Lanka CERT:** [cert.gov.lk](https://cert.gov.lk/) · **+94 11 269 1692** · [incident reporting](https://cert.gov.lk/report_incident)
- **Police Computer Crime Investigation Division:** **+94 11 238 1045** · **119** for urgent police assistance.

Always check official agency contact pages for current reporting instructions and numbers.

## AI tool disclosure

This MVP uses an optional third-party generative AI provider (Google Gemini or OpenAI) for semantic risk scoring and localized summaries when configured by the operator. The main redaction and heuristic scoring stages are original deterministic code and remain usable offline. The code and interface are intended for open-source review and community adaptation; teams presenting this project should disclose the AI tools they used and describe their own testing, design, translations, and modifications accurately.

## Repository structure

```text
server/
  main.py             FastAPI endpoints, PII redaction, heuristics, provider fallback, feed
  requirements.txt    Python runtime dependencies
  test_main.py        Privacy and heuristic unit tests
client/
  src/App.jsx         React analyzer, quiz, radar, complaint and accessibility UI
  src/main.jsx        React entry point
  src/index.css       Tailwind layers and base accessibility styles
  package.json        Client scripts and dependencies
src/                  Existing zero-dependency Node prototype (kept intact)
public/               Existing prototype's static frontend
test/                 Existing Node prototype tests
```
