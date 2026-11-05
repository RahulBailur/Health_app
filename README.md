# Ahaara

Plain-language food & health answers with honest verdicts — a mobile-first web app
(installable on Android as a PWA).

**Design idea — "read it through the thali":** an illustrated thali turns slowly under
every page. Glass panels lift the dark veil over it (blur + saturation + brightness in
`backdrop-filter`), so each panel is a lens onto the food below. Verdicts are inspector's
stamps; numbers are set like a nutrition label.

## Screens
Home · Product verdict · Label scanner · Explain-simply articles (with "Didn't get it?"
ladder) · Myth buster (swipe & flip cards, WhatsApp-forward check) · Compare · My
condition · Meal plan · Saved · Profile · Emergency & supplement-interaction states ·
Component kit at `/kit`. Dark ("evening") and light ("daylight") themes; desktop layout
with a glass sidebar at ≥1024px.

All products are generic and every number is illustrative.

## AI (Claude, ChatGPT, Gemini, Hugging Face)

Ahaara answers anything its built-in library doesn't cover by asking an AI. It works with
**any one** of these — add more and it switches automatically if one fails:

| Engine | Key name | Get a key |
|---|---|---|
| Claude | `ANTHROPIC_API_KEY` | console.anthropic.com |
| ChatGPT | `OPENAI_API_KEY` | platform.openai.com/api-keys |
| Gemini | `GEMINI_API_KEY` | aistudio.google.com/apikey |
| Hugging Face | `HF_TOKEN` | huggingface.co/settings/tokens |

**What uses AI:** the Ask screen (live answer + "Full verdict" + "Explain it differently"),
the label scanner (reads your photo), WhatsApp-forward checks, "Compare anything", and
personalised meal plans. Without a key, every screen still works from the built-in library
and the scanner runs in demo mode.

**Keys stay secret:** they are read only by the server code in `/api` and never sent to the
browser. Emergencies (chest pain, stroke signs…) are detected before any AI call and always
show the call-for-help banner immediately.

### Add your keys — on your computer
1. Copy `.env.example` to `.env.local` (this file is git-ignored).
2. Paste in the key(s) you have and save.
3. `npm run dev` — the `/api` routes run inside the dev server, no extra tools needed.

### Add your keys — on Vercel
1. Vercel → your project → **Settings → Environment Variables**.
2. Add the same names as in `.env.example` (only the ones you use).
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the new keys are picked up.

### Choosing and protecting
- `AI_PROVIDER` (`auto` by default) and `AI_FALLBACK_ORDER` set which engine goes first.
  People using the app can also pick an engine in **Profile → AI engine**.
- Model names can be changed with `ANTHROPIC_MODEL`, `OPENAI_MODEL`, `GEMINI_MODEL`, `HF_MODEL`
  (set `HF_VISION_MODEL` to let Hugging Face read photos).
- `APP_ACCESS_CODE` — if set, only people who enter this code in Profile can use the AI.
- `RATE_LIMIT_PER_MINUTE` (default 10) limits questions per visitor.
- Every AI answer is labelled with the engine that wrote it and a "check your label" note.

### Code
- `api/ai.ts` — the one AI endpoint (`POST /api/ai`), `api/providers.ts` — which engines are set up
- `api/_lib/providers/*` — one small adapter per AI company, all with the same shape
- `api/_lib/prompts.ts` — Ahaara's voice and safety rules, shared by every engine
- `shared/schemas.ts` — the exact shape each answer must have (checked before the app sees it)
- `src/lib/ai.ts` — the browser side (calls `/api`, never holds keys)

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this repo to GitHub (already done).
2. On vercel.com → **Add New… → Project** → import `Health_app`.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. Deploy. `vercel.json` already sends app routes to `index.html` and keeps `/api` for the AI.
5. Add your AI key(s) under Settings → Environment Variables, then redeploy (see above).

## Use it on your phone
Open the Vercel URL in Chrome on Android → ⋮ menu → **Add to Home screen**. It opens
full-screen like an app. The scanner uses the phone camera (label reading is simulated in
this preview).

## Code map
- `src/styles.css` — design tokens, glass system, stamps, motion
- `src/components/Art.tsx` — thali and packaging illustrations
- `src/components/kit.tsx` — reusable components (VerdictBadge, ScorecardRow, RangeBar…)
- `src/screens/*` — one file per screen
- `src/data/*` — content (products, myths, articles, conditions, meal plans)
