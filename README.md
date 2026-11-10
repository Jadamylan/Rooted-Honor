# Rooted Honor — The Day We Honor
Demo Video: https://youtube.com/shorts/2_OXw068_fs?si=_lxvHkHBB2xQ8ZZR

A remembrance-day landing page MVP. *“Honor your elders. Keep them in the room.”*
The featured example is **Watermelon Patch Day** — held **every August 3, in honor of Grandpa**.
Sample offerings and event logistics on this page are **illustrative demo content**, not family history.

## What it does

- **Digital Ofrenda** — keepsake cards (Memory, Photo, Recipe, Song, Flower, Planting). Visitors add offerings; reactions (flower / heart) included. Stored in the browser only.
- **RSVP + Calendar** — name + optional guests, demo RSVP count, “Add to Google Calendar” link and a downloadable `.ics` invite (annual, every August 3 — the next upcoming Aug 3 is used automatically).
- **Invite others** — native share sheet with copy-link fallback.
- **Support the Gathering** — demo pledge only ($10/$25/$50 or custom). No payments collected or transferred.
- **Create a Remembrance Day** — compact form (elder, tradition, annual date, details) → preview card with calendar reminder + share. Previews are **not published**.
- **Patch Dispatch** — sends the offerings currently on the page to **Muse Ember via OpenRouter** and returns a short annual remembrance recap (2–3 sentences, no invented details). If the server is not configured, a clearly labeled sample dispatch is shown instead — the page never pretends the model was called.
- **Languages: English / Español / Français** — instant toggle, no reload. Visitor-entered text is preserved exactly; only fixed interface strings change.

## Run it

Requires Node.js 18+ (uses built-in `fetch`; zero dependencies, nothing to install).

```bash
npm start            # or: node server.js
# → http://localhost:3000
```

2. Restart the server. The model identifier is one clearly labeled server-side constant, `MUSE_EMBER_MODEL`, in `server.js`. Override it via `OPENROUTER_MODEL` only if your OpenRouter configuration uses a different exact slug — do not guess slugs.

Without a key, the Dispatch feature shows setup help plus a labeled sample (this is intentional, so the demo never fakes a model call).

## How to edit

| Edit | Where |
| --- | --- |
| Site name (“Rooted Honor”) | `appName` in `config.js` — one place |
| Annual date, time, RSVP base, pledge amounts | `config.js` |
| Organizer note, location/time demo text | `translations.js` (key `supportNote`, `locationValue`, `timeValue`) |
| All UI text (EN/ES/FR) | `translations.js` — 110 keys, one file |
| OpenRouter key / model | `.env` + `MUSE_EMBER_MODEL` in `server.js` (server-only) |

## Files

- `index.html` — page structure (server-rendered markup + `data-i18n` hooks)
- `styles.css` — watermelon-ofrenda palette; vine dividers; reduced-motion support
- `app.js` — interactions (ofrenda, RSVP, calendar, pledge, preview, dispatch client)
- `translations.js` — EN/ES/FR dictionary
- `config.js` — editable project config (client-safe)
- `server.js` — zero-dependency static server + `POST /api/patch-dispatch` proxy

## Privacy notes

Offerings, RSVPs, and pledges are stored only in **local browser storage** on this demo. No accounts, no analytics, no payment provider. Push freely to GitHub — `.env` is gitignored.
