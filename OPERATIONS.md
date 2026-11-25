# OPERATIONS.md — the content-farm state (read this first in any new session)

Last updated: 2026-11-24 (aggressive schedule live). The user (owner) runs this as a faceless-shorts business; Claude acts as CEO:
picks topics, builds, QA's, and pings the owner with finished videos to post manually.

## Channels

| Channel | Status | Look | Notes |
|---|---|---|---|
| **The Fine Print** | LIVE (YouTube + TikTok + IG) | dark UI + charts, teal/red | money math. 11 posted. Topic list in CHANNELS.md |
| **Feels Wrong** | BEING REPLACED | indigo/violet | paradox/math. 11 posted. Owner chose to replace it with a story channel |
| **Candlelit Tales** (backup name *Tales After Dark*) | PILOT, awaiting owner | shadow-puppet silhouettes, candlelight | dark folklore / Grimm / myths, public domain. 100% code-drawn, $0. Narrator: ElevenLabs "George" `JBFqnCBsd6RMkjVDRZzb` |
| GTA | parked | — | see CHANNELS.md "Channel D" |

Branding (names, handles, bios, logos): `BRANDING.md`, `branding/logos/`.

## Open decisions (waiting on the owner)
1. Candlelit Tales vs Tales After Dark — and rename the Feels Wrong account or open a new one.
2. ✅ Tales pilot approved and posted 2026-11-24 (owner: "Perfect. Posted").
3. Whether to post the last Feels Wrong video (`fw-012`, Benford's law) or drop it.
4. Plugins suggested for install (animation-studio, Remotion, watch-video) — check with ListPlugins.

## Aggressive schedule (owner asked 2026-11-24) — America/New_York
| Slot | The Fine Print | Candlelit Tales |
|---|---|---|
| 08:45 | ✅ | |
| 12:45 | ✅ | |
| 17:45 | ✅ | ✅ |
| 20:45 | | ✅ |
= 3/day Fine Print (21/wk), 2/day Tales (14/wk). Feels Wrong is retired (fw-012 held). Buffer targets: FP ≥ 6 ready, Tales ≥ 4.
Tales run 61–70s so TikTok cuts qualify for Creator Rewards (> 60s). Empty buffer → skip the slot, never filler.
Built FP: 13 BNPL late-fee APR, 14 credit utilization, 15 mortgage points, 16 lease money factor, 17 payday loan (first immersive one), 18 start early vs late. Next FP topics: emergency-fund months, CD vs HYSA, latte-factor honest math,
credit-card float, Roth vs traditional break-even, student-loan capitalized interest.
Built tales: 1 Godfather Death, 2 Monkey's Paw, 3 Bluebeard, 4 Pied Piper (Piper POV), 5 Robber Bridegroom (bride POV). Next tales: Anansi & the sky god's stories, The Juniper Tree,
The Three Army Surgeons, Baba Yaga.

## Story style (owner direction 2026-11-25) — applies to EVERY new video
Make it immersive: put the viewer INSIDE the scenario. More exciting, more creative.
- **Candlelit Tales:** tell it from the main character's point of view, FIRST PERSON, PRESENT TENSE
  ("I lift the pipe. Every rat in Hamelin follows me."). Sensory detail (sounds, smells, cold), short punchy
  sentences, the narrator's motive and feeling. Villain or victim POV both fine — pick whoever makes the
  twist hit hardest. Visuals: add POV shots (the narrator's hands, what they see over a table/through a door),
  closer framings, camera push-ins on the moment of dread. Still public-domain plots, still the real ending.
- **The Fine Print:** open IN a scene, second person ("You're at the dealership. The finance guy slides a
  paper over...", "You tap 'Pay in 4' at checkout..."). The viewer makes the choice, THEN the math reveals
  what it cost them. Visuals: the thing they'd see (the contract, the checkout screen, the statement) first,
  then the charts. Still: show the math, never advise.
- Pause-card question becomes the viewer's decision ("What do you sign?", "What would you play?").

## Context hygiene
- Owner wants the conversation compacted every other day or so. Only the owner can type `/compact`
  (it also auto-compacts when long). The 20:45 slot reminds them every 2 days.
- Last compact reminder: 2026-11-24 (owner asked; compacted same day)
- Keep THIS file current before ending any turn — it is what survives compaction.

## Owner rules (hard)
- **No cost.** No paid image/video generation (no fal, no OpenArt credits). ElevenLabs Creator plan is the only spend.
- Quality over volume: never send anything that hasn't passed QA. Never post filler.
- Work autonomously; only ping for posting slots or real decisions.

## Posting pipeline
- Queue: `posting/queue.json` (status: building → needs-voice → ready → sent; `review` = owner must approve first).
- Finished videos are committed in `posting/ready/<id>.mp4` (they carry paid voice — don't regenerate).
- Scheduled task "Shorts posting slot" (see Aggressive schedule above, trigger `trig_01FUkDcxeK3kPQMFu2QZaDQ5`)
  fires into the ORIGINAL session (`session_01RsWdropN7WuCajWdfSQNfT`). Each slot: send the oldest `ready` item per
  channel with SendUserFile + caption, mark `sent`, commit, push; if a channel has < 6 ready, build more.
  A new session must re-point or recreate this task (update_trigger can't change the session; create a new one
  bound to the new session and delete the old) and add Candlelit Tales to it once approved.
- Branch: `claude/wizardly-dirac-6z4kx5` (draft PR #1). Commit + push every finished video.

Render helpers (committed): `tools/finish_short.sh <suffix> <Comp> <dur> <queue-id>`, `tools/finish_tale.sh` (same, tales/), `tools/retime_vo.py`.

## Build pipeline (per short) — see .claude/skills/make-short
1. Verify facts (web search); write `beats.json` (vo lines with start times).
2. `python tools/gen_voice.py --beats <beats> --voice <id> --emit-ts remotion/src/shots/<dir>/vo.gen.ts`
   — every line tempo ≤ 1.2; if squeezed, re-time `start`s (cached, no re-bill) or trim words.
3. Write the TSX with cues from the REAL word times; `cd remotion && npm run gen`.
4. QA: `node scripts/frames.mjs <Comp> <frames> --scale=0.5`, contact sheet, READ it. Typical bugs caught:
   overlaps, clipped text, things in the right 160px UI column, blank gaps, loop ≠ frame 0.
5. Render + voice mux + SFX mix (`tools/mix_sfx.py`), loudness ≈ −16 LUFS, `silencedetect` → no gap > 2s.
6. Copy to `posting/ready/<id>.mp4`, add to queue, commit, push.

## Container setup gotchas (cloud sessions)
- `.env` holds `ELEVENLABS_API_KEY=proxy-injected` (the real key is injected by the network proxy; don't change).
- Remotion renders need `REMOTION_BROWSER_EXECUTABLE=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/)chrome-headless-shell`.
- Chromium must trust the sandbox egress CAs: they're in `/root/.ccr/ca-bundle.crt`; if fonts fail with
  ERR_CERT_AUTHORITY_INVALID, add the "Egress Gateway CA" + "TLS Inspection CA" certs to `~/.pki/nssdb` with certutil.
- `cd remotion && npm ci` if node_modules is missing.

## History worth knowing
- Nov 14–19: posted 22 videos (11 per channel). Nov 19–24: queue ran dry — ElevenLabs invoice failed; owner fixed it Nov 24.
- No analytics received yet — ask the owner for YouTube Studio / TikTok screenshots (views, avg watch time).
