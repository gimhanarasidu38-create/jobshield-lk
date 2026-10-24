# Submission pack (copy into the MLH Challenges page)

## Project name
JobShield LK

## Track
Hack for Humanity: Best Social Impact Web Platform

## One-line description
An AI web platform where Sri Lankan job seekers paste or screenshot a WhatsApp/Instagram job ad and instantly see why it looks like a scam, in Sinhala, Tamil or English, and can report scam publishers.

## Project story
**Goal.** Stop job-scam victims losing money, passports and personal data to fake foreign-employment and online-task offers that spread as forwarded screenshots.

**Unique value.** Existing options are either generic chatbots or English-only advice pages. JobShield LK works on the *screenshot itself*, explains each warning with the exact phrase that triggered it, answers in Sinhala/Tamil/English, and adds a community layer: reported phone numbers and emails raise the risk score of future ads. A transparent rule engine keeps the AI honest, and everything is framed as risk indicators, not accusations.

**After-event plan.** Persistent database and moderation for reports; SLBFE licence lookup; a WhatsApp/Telegram forwarding bot; native-speaker review of Sinhala/Tamil; pilot with a university career centre and community groups.

## Technologies
Node.js, vanilla JavaScript, HTML/CSS, Gemini / Claude API, tesseract.js (optional OCR)

## Team details checklist
- [ ] Team name (same as on Luma)
- [ ] All four names
- [ ] Contributor emails (the ones used for Luma/MLH registration)

## Before you hit submit
- [ ] Public GitHub repo, MIT license present, README renders, `.env` NOT committed
- [ ] Repo link added; demo URL tested in a private window (if deployed)
- [ ] AI tool disclosure in README edited to say what the team actually did
- [ ] Track selected: Hack for Humanity: Best Social Impact Web Platform
- [ ] Optional 60-90s demo video (tie-breaker)
- [ ] Submitted through the event's Challenges page on MLH (not email/WhatsApp)

---

# 3-minute demo script (pitch 3:00 + Q&A 2:00)

**0:00–0:30 Problem.** "Meet Nimali, 22, who gets a WhatsApp forward: *Dubai job, no experience, 350,000 rupees, pay 25,000 registration today.* Every year Sri Lankans lose money and passports to ads like this. The ad arrives as an image, often in Sinhala, and there is no fast way to check it."

**0:30–2:00 Live demo (one flow).**
1. Click **Fake job abroad** sample (or upload a real fictional screenshot). Point at the score, the red-flag list and the **exact phrase** shown under each flag.
2. Switch to **සිංහල**: same result, in Sinhala, instantly.
3. Show the **next steps** (don't pay, SLBFE check, evidence, report).
4. Click the detected phone number, **Report this publisher**, submit. Re-check the ad: score updates and shows "reported by 1 person".
5. Click **Genuine-looking ad**: low score, reassuring details, "not proof".

**2:00–2:30 Tech + AI.** "A vision-language model reads the screenshot and explains it in the user's language. A transparent rule engine for 12 scam patterns keeps the score honest. Prompt-injection safe, privacy-first: nothing stored, reports hashed."

**2:30–3:00 Impact + next.** "Anyone with a phone can protect themselves in seconds. Next: a WhatsApp bot, SLBFE licence lookup, and a moderated report database with partners."

## Likely judge questions
- **How is this different from ChatGPT?** Screenshot-first, trilingual, evidence per flag, community reports that change future scores, rule engine as a guardrail, privacy by design.
- **What if the AI is wrong?** Rules set a floor, output is "risk indicators", disclaimer + verification steps, reassuring signs labelled not proof.
- **Can reports be abused to defame a business?** Reports are unverified signals; public list needs 2+ distinct reporters and is masked; roadmap adds moderation.
- **How would it scale?** Stateless server, swap JSON store for Postgres, rate limiting is already in, cache AI results by ad hash.
- **What did you build vs. generate with AI?** (Answer honestly from your README disclosure.)
