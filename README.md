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

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this repo to GitHub (already done).
2. On vercel.com → **Add New… → Project** → import `Health_app`.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. Deploy. `vercel.json` already rewrites all routes to `index.html`.

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
