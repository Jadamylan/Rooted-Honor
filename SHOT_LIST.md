# The Day We Honor — Timed 60-Second Shot List (silent)

**Format:** 16:9, 1920×1080, 30 fps, H.264 MP4. **Audio:** fully silent track
(record narration separately and lay it over in your editor).
**Pacing:** gentle fades (6–10 frames) between shots, no flashy effects.
**Cursor:** slow, deliberate moves; pause ½ second before each click.
**Captions:** lower-third, centered, white text on a semi-transparent dark pill,
36–42 px at 1080p, never covering the hero headline or form buttons.
(Use `captions.srt` or burn in the text below — identical wording.)

**Recording setup (do this once):** fresh/incognito browser profile, window
maximized at 1080p, zoom 100%, hide bookmarks bar and extensions, close all
other tabs, clear site storage for the app (fresh demo state), EN language,
mouse cursor large enough to read at 1080p. Start the app: `npm start` →
`http://localhost:3000`. Never show a terminal, `.env`, or devtools.

| # | Time | On screen (real app) | Cursor / action | Caption | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | 0:00–0:07 | Hero, top of page: “The Day We Honor”, “Honor your elders. Keep them in the room.”, watermelon SVG art, both CTAs visible | Slow drift from headline → featured **Watermelon Patch Day** card. No click. | A day to remember. A tradition to keep. | Hold the hero still for the first 2 seconds so the title reads. Keep “Demo site” note visible if in frame. |
| 2 | 0:07–0:16 | Featured card: “Watermelon Patch Day”, “August 3 · In honor of Grandpa”, invite line (“Gather, share watermelon, tell stories…”) | Slow push-in/hover over the card; gentle scroll so the date line is centered. No click. | For Grandpa · Every August 3 | Do not add any facts about Grandpa beyond what the page already says. |
| 3 | 0:16–0:27 | Digital Ofrenda (`#ofrenda`): seed keepsake cards with “Illustrative demo offering” badges and “Give them their flowers” | Scroll card row into view. Add ONE offering: type **Recipe**, note exactly: `Demo offering: a favorite summer recipe to share.` → click **Add offering**. Pause on the 🌸 confirmation, then hover a flower reaction. | Memories become part of the gathering. | The note is labelled demo in its own text; seeds stay labelled “Illustrative demo offering”. Never present demo content as family history. |
| 4 | 0:27–0:37 | RSVP (`#rsvp`): details card (“Demo details”, Aug 3, demo time/place), form, RSVP count | Fill name `Demo Guest`, guests `2`, click **Confirm attendance**. Scroll slightly to reveal “Add to Google Calendar” + “Download calendar invite”. Hover each button — **do not click either**. | RSVP. Invite others. Keep the date. | Success line shows the demo name. Privacy note (“recorded only in this demo browser”) should be readable. Fictional name only. |
| 5 | 0:37–0:46 | Support the Gathering (`#support`): “Allow others to support.”, organizer demo note, $10/$25/$50 | Keep $25 selected. Click **Record demo pledge**. Hold 3 seconds on the result. | Support the gathering — no payment collected in this demo. | The on-screen result must read: “Demo pledge recorded in this browser. No payment collected.” Do not claim any payment was processed. |
| 6 | 0:46–0:54 | Create a Remembrance Day (`#create`): “Plan an event to honor your elders.” + preview card | Fill fictional sample: Elder `Sample Elder`, Tradition `Planting tomatoes together`, Date = next August 3, Details `A sample day to gather.` → click **Preview my remembrance day**. Pause on the preview card. | Create a day for someone you love. | The preview badge must read “Preview only — this has not been published online.” Do not click Share. Fictional details only. |
| 7 | 0:54–0:58 | Fade back to hero (top of page) | Smooth scroll to top; cursor rests off the headline. | The Day We Honor | — |
| 8 | 0:58–1:00 | Final still frame: hero held, no movement | Freeze for a full 2 seconds. | Give them their flowers. | Export ends on this still frame. Sub-caption sits under the title. |

## Exact selectors (for the automation script)

- Hero: `#top`, featured card `.featured-card`, CTAs `a[href="#ofrenda"]` / `a[href="#create"]`
- Ofrenda: `#ofrenda`, `#offeringGrid`, `#offeringForm`, `#offeringType`, `#offeringNote`, `.react-btn`
- RSVP: `#rsvp`, `#rsvpForm`, `#rsvpName`, `#rsvpGuests`, `#rsvpCount`, `#googleCalLink`, `#icsBtn`, `#inviteBtn`
- Support: `#support`, `#pledgeForm`, `#pledgeCustom`, `#pledgeStatus`
- Create: `#create`, `#createForm`, `#createElder`, `#createTradition`, `#createDate`, `#createDetails`, `#preview`

## Retake / quality checklist

- [ ] No terminal, `.env`, keys, devtools, bookmarks, or personal data in any frame
- [ ] “Demo” / “Illustrative demo offering” labels visible in shots 3–6
- [ ] “No payment collected” message fully readable in shot 5
- [ ] “Preview only — not published” badge readable in shot 6
- [ ] No Google Calendar navigation, no `.ics` download dialog, no share sheet
- [ ] Captions never cover the headline or a button being clicked
- [ ] Final frame held ≥ 2 seconds; total runtime ≤ 60 seconds; audio track silent
- [ ] Export check: MP4, H.264, 1920×1080, 16:9 — play it once end-to-end before sharing

## Two ways to capture it

**A) Automated (recommended):** run `node demo-video/playwright-record.mjs`
with Playwright installed (`npm i -D playwright && npx playwright install chromium`),
server running first. It drives the real app through all 8 shots and saves a
WebM to `demo-video/recordings/`. Convert: `ffmpeg -i recordings/*.webm -c:v libx264 -pix_fmt yuv420p -r 30 -s 1920x1080 demo.mp4`.

**B) Manual screen recording:** OBS (preferred) / QuickTime / Screen Studio —
record at 1080p while performing the cursor/action column above, then edit
to the timings in the table, add captions, and export MP4/H.264.
