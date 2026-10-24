# Design System: JobShield LK — Trust-first Safety Studio

## 1. Visual Theme & Atmosphere
A calm, confident digital public service designed for jobseekers checking risky job adverts. The feeling is a thoughtful editorial product crossed with a reassuring civic-tech utility. Airy but task-focused: density 5/10, asymmetric variance 7/10, motion 4/10. Prioritise immediate access to the analysis form, legible explanations, and a clear path to anonymous reporting. Never make a warning feel like a conviction.

## 2. Color Palette & Roles
Only **one brand accent** is allowed; risk state colors are semantic exceptions and MUST NOT be used as decorative accents.
- **Porcelain** `#F5F7F3` — primary page canvas; slightly warm off-white.
- **Pure Paper** `#FFFFFF` — content panels and input surfaces.
- **Pine Ink** `#142D27` — heading and primary body text.
- **Slate Pine** `#61716B` — labels, descriptions, hints.
- **Line Fog** `#DEE6DF` — structural 1px borders.
- **Forest Accent** `#257965` — single interactive accent for buttons, focus indicators, selected language, and links.
- **Deep Pine** `#153E34` — dark brand feature surface, text reversed to `#F7FAF6`.
- **Risk-high** `#A73636` / `#FBECE9` — only high-risk feedback.
- **Risk-medium** `#95601D` / `#FBF1DC` — only medium-risk feedback.
- **Risk-low** `#286D4F` / `#E7F3EB` — only low-risk feedback.
No purple, neon or other decorative accent hues. No pure black.

## 3. Typography Rules
- **Display:** `Outfit`, followed by appropriate local modern sans; heading weight 600–750, tracking -0.04em, 1.05–1.13 line-height, fluid sizing with `clamp`.
- **Body:** `Outfit` or a Sinhala/Tamil-capable local sans fallback; base at least 16px, 1.6 line-height, copy constrained to ~65 characters.
- **Mono:** `JetBrains Mono` or local monospace for step numerals and risk scores; numbers use tabular alignment.
- **Translation:** text expands for Sinhala and Tamil without clipping. Keep sentence lengths reasonable in button labels.
- No Inter or generic serif typography.

## 4. Component Stylings
- **Header:** compact bright surface with a crisp wordmark, small navigational anchors, visible language segmented control and large-type accessibility toggle.
- **Hero:** left-aligned editorial heading, eyebrow and supporting copy; right-hand dark pine demonstration panel with explicit sample-only label. No invented statistics or real verdicts.
- **Process rail:** numbered, separated three-step horizontal flow, not three identical elevated cards.
- **Analysis workspace:** input and results as a practical asymmetric split; 55/45 on large screens, single column on mobile. Buttons >=44px, outlined chips for example ads.
- **Screenshot drop:** generous dashed frame and an SVG upload mark; text always gives accessible keyboard option and paste hint.
- **Results:** meaningful empty composition, bold risk meter, color + icon + text for all verdicts, evidence statements and numbered next steps.
- **Report module:** quieter bottom section with clear privacy framing, consistent labels, roomy form, visible status and community signals only at the existing visibility threshold.
- **Shadows:** soft diffusion when distinguishing paper from canvas; never neon glows.
- **Errors:** inline red-tinted fields/status, role alert/role status, no generic popup.

## 5. Layout Principles
- Content maximum width 1240px with comfortable edge padding (20–48px).
- CSS Grid for section splits; no percentage-calc flex tricks.
- Desktop hero uses 1.05fr / .95fr layout; editorial copy left, demonstration right.
- Workbench split is 1.12fr / .88fr. Both align to their top edges.
- At 900px and below hero, process rail, workbench and report sections gracefully collapse.
- At 768px and below navigation becomes compact; all functional surfaces are single column, with no horizontal overflow.
- Distinct vertical rhythm uses spacing increments based on 4/8px; long content may naturally grow without clipping.

## 6. Motion & Interaction
- Hover affordances transform at most 2px, gentle 180–240ms easing; push feedback translates -1px on active.
- Result meter animates only when motion is allowed; reduced-motion setting disables movement.
- A very subtle opacity/transform entrance for hero and sections. Never distract users analysing possible fraud; never perpetually pulse risk warnings.
- Avoid layout-shifting animations, forced scroll on desktop, and inaccessible hover-only information.
- Focus outlines stay visible in all supported modes.

## 7. Anti-Patterns (Banned)
No emoji-only UI, Inter, generic serif fonts, pure black, neon glows, vibrant purple/blue gradient, overlapping words or visuals, fake statistics, three equal feature cards, fictitious promises of guaranteed scam detection, fake testimonials, custom cursors, bouncing arrows, filler copy, decorative photo stock, or insecure remote image dependencies. No text hidden from screen readers for essential meanings. Do not change the existing backend API, privacy model, or risk determination logic as part of a purely visual redesign.

## 8. Screen and Behavior Checklist
- Root `/` renders: header, multilingual hero, check input, image upload, sample examples, dynamic results, report publisher form, community list.
- All existing IDs and `data-i18n` targets remain wired to `public/app.js`.
- Desktop and 375px mobile are usable, with no horizontal scrolling and >=44px action controls.
- The same `/api/analyze`, `/api/report`, `/api/stats`, and `/api/health` calls function without any API contract changes.
- All three UI languages remain available; risk remains described as signals rather than a legal verdict.
