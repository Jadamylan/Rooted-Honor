# The Day We Honor — 60-second silent demo video package

## ⚠️ Deliverable statement (read first)

**No MP4 was exported from this environment.** This sandbox has no browser,
no `ffmpeg`, no X display, and no working package network (`apt` returns 520),
so a genuine screen recording of the live app could not be captured here —
and I will not fake one.

Instead, this folder contains the closest useful deliverable: a **ready-to-record
package** so the real app can be captured in one pass on any machine with a
browser, then exported as a silent 1080p MP4 for your voice-over.

| File | What it is |
| --- | --- |
| `SHOT_LIST.md` | Precise timed 60-second shot list: framing, cursor moves, clicks, scrolls, captions, transitions. |
| `captions.srt` | Importable caption track timed to the shot list (or burn the same text in your editor). |
| `playwright-record.mjs` | Automated recording script — drives the *real* app in Chromium and records it (WebM), performing every shot/interaction. |
| `recordings/` | Empty output folder for the Playwright script (`.gitignore`d). |

## What was verified before writing this (in this environment)

- App runs with `node server.js` (default port 3000; verified on a free port
  here because 3000 is occupied in this sandbox). Model: `meta/muse-ember`,
  server reports the API key as configured.
- A 40-check DOM interaction harness passes 40/40: seed offerings render,
  adding an offering works and preserves the note exactly, reactions work,
  RSVP updates the count and reveals the calendar buttons, the demo pledge
  shows “Demo pledge recorded in this browser. No payment collected.”, the
  create-a-day preview renders with “Preview only — not published”, the
  invite copy fallback works, and EN → ES → FR → EN switching preserves
  visitor-entered text.
- Every click/scroll in the shot list targets a real, verified element
  (`#offeringForm`, `#rsvpForm`, `#pledgeForm`, `#createForm`, …).

## What is intentionally NOT in the video

- **Patch Dispatch / the AI call** — the suggested story omits it, and a live
  model call is too slow/unpredictable for a calm 60-second silent cut.
  Do not film it; mention it in voice-over if you wish.
- The **Google Calendar link itself** — hover/show it, do not click through
  (it would navigate away and could create a real calendar event).
- The **.ics download** — show the button; do not trigger a download dialog.
- Any terminal, `.env`, browser devtools, bookmarks, or private data.

## Security note

Do not film a terminal or `.env` file. If an API key was ever pasted into a
chat or transcript, treat it as exposed: revoke/regenerate it on OpenRouter
and update `.env` before pushing to GitHub or presenting.
