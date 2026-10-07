# AI Reel Builder: Handoff

_Last updated: 2026-10-07 (second session that day: added "Post a video I already have"). Written for whoever picks this project up next, developer or owner._

## What this app is

AI Reel Builder helps a small business owner with no video experience turn an idea into an Instagram Reel. "New Reel" offers two paths:

- **Plan a new Reel with help** (7 steps): idea → script → voiceover → shot list → editing checklist → final review → publishing checklist.
- **Post a video I already have** (5 steps): check the video → caption → cover → final review → publishing checklist.

Progress saves automatically, so a Reel can be finished over several sittings.

**Important:** the "AI" parts are not real yet. The script, captions, hashtags and scene plan come from templates, and voice generation is simulated (see [Broken or unfinished](#whats-broken-or-unfinished)).

## Where everything lives

| What | Where |
|---|---|
| Code | https://github.com/DYunck/AI-Reel-Builder (`main`) |
| Live site | https://dyunck.github.io/AI-Reel-Builder/ (GitHub Pages, demo mode) |
| Pages build output | `gh-pages` branch. Generated, don't edit by hand |
| Working branches | `claude/ai-reel-builder-app`: `main` plus `HANDOFF.md`, `CLAUDE.md` and `SPEC.md`. `claude/own-video-path`: that branch plus the "Post a video I already have" path and the e2e tests. **Neither is merged to `main`**, so the live site doesn't have the new path yet |
| Private claude.ai demo | https://claude.ai/artifact/TEKmnvL2esK7eW5zy35SeT. A **frozen snapshot** from 2026-10-02; it does not update when `main` changes |
| Product spec (who it's for, prioritized roadmap) | [`SPEC.md`](SPEC.md) |
| Setup and deploy docs | [`README.md`](README.md) |
| Working rules for Claude | [`CLAUDE.md`](CLAUDE.md): test before claiming something works, ask before spending money or signing up for services, update this file every session |

**Deploys:** every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which type-checks, builds, and publishes to `gh-pages`. The last verified run (2026-10-02) succeeded.

## State at a glance

| Area | Status |
|---|---|
| Plan path (7 steps) | ✅ Built and tested end to end (automated) |
| Own-video path (5 steps) | ✅ Built and tested end to end in Chromium (automated); not tried on a real phone or Safari |
| Autosave and resume | ✅ Works in demo mode (browser storage) |
| Dashboard, Reel list, statuses | ✅ Built and tested |
| Dark mode, mobile layout | ✅ Built and tested |
| Supabase database | ⚠️ Schema tested on Postgres 16; **app never run against a real Supabase project** |
| AI script / captions / scenes | ❌ Template-based placeholder |
| Voice generation | ❌ Simulated; preview uses the browser's built-in speech |
| User accounts / security | ❌ None; demo database policy is wide open |
| Automated tests | ✅ 18 Playwright tests in `tests/e2e/` (`npm run test:e2e`); ⚠️ not run in CI yet |
| Linting | ❌ None |

## What's built

### Features

- **New Reel** (`/projects/new`): asks "Plan a new Reel with help" or "Post a video I already have". The Reel is only created once the owner picks.
- **Dashboard** (`/`): counts per status, a "Pick up where you left off" card for the most recently edited unfinished Reel, and the 6 most recent Reels.
- **My Reels** (`/projects`): every Reel, with search (topic or audience) and status filter chips. Delete asks for confirmation.
- **Plan path** (`/projects/:id/:step`):
  1. **Idea:** topic, audience, tone (6 options), length (15–90s), call to action. Validates topic and audience. "Generate Content" creates the script.
  2. **Script:** editable hook, main script, CTA, caption (2,200-char limit) and hashtags (add/remove chips). Shows estimated speaking time versus target length.
  3. **Voice:** pick 1 of 5 voices, "Generate Voice", play/pause preview with a waveform. Can be skipped.
  4. **Scenes:** editable table (number, description, suggested visual, duration). Add, delete or regenerate rows; tracks the total against the target length. Shows as cards on phones.
  5. **Build:** 5-item checklist (script, voice, visuals, captions, music) with beginner tips. Script and voice tick themselves when generated.
  6. **Review:** everything on one page with Copy and Edit buttons. "Ready to Publish" sets that status.
  7. **Publish:** 5 Instagram posting steps with copy-caption and copy-hashtags buttons. "Mark as Published" unlocks once every step is ticked.
- **Own-video path** (`/projects/:id/video` … `/publish`):
  1. **Video:** pick a file (read in the browser, never uploaded). Plain-language checks: shape (9:16 ✅, other vertical = note, square/sideways = warning with a CapCut/Edits tip), length against `INSTAGRAM_REEL_MAX_SECONDS` (180, in `src/lib/videoFile.ts`; check it against Instagram's current rules), quality (warning if the shorter side is under 720px). Rotated phone videos count as vertical. Then a one-sentence description (stored in `title`), audience, tone and CTA. "Write My Caption" generates the caption.
     - If the browser can't play the file (e.g. iPhone HEVC `.mov` in Chrome/Firefox), it explains that plainly and asks for the length in seconds; the cover is then picked in Instagram.
     - Non-video files get a plain message and nothing is saved. Picking a different file replaces the first; if a cover was already chosen, it asks first.
  2. **Caption:** the same caption/hashtag editor as the Script step, plus "Write a new one".
  3. **Cover:** a 9:16 preview with a slider and ±0.5s buttons, "Use this frame", optional cover text overlaid on the preview, and "Save full-size cover" (the frame at the video's own resolution, with the text drawn in, as `reel-cover.jpg`). Only a ~360px JPEG preview is stored (measured 19.6–30.8 KB). After the file is gone (reload, or leaving the Reel), the saved cover still shows with "Choose your video again to change the cover."
  4. **Review** and 5. **Publish** are the same screens as the plan path, showing only what applies: video details and checks, cover, caption, hashtags; publishing starts with "Find your video in your camera roll" and reminds the owner which moment to slide to for the cover.
  - Cards show an "Own video" label, the cover thumbnail and "Step N of 5".
- **Settings** (`/settings`): light / dark / system theme, which storage is in use, and "Reset sample data" (demo mode only).
- **Status lifecycle:** Draft (created) → In Progress (content generated; own-video: video checked and caption written) → Ready to Publish (Step 6 button) → Published (Step 7 button). A published Reel can be marked "not published" again.
- **Navigation rules:** a Reel opens at the furthest step reached on its own path. Steps not yet reached, and steps that belong to the other path, are locked; visiting one by URL redirects to the current step.

### How it's put together

- **Stack:** React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, React Router 6, Supabase JS 2, lucide-react icons. No UI library; components are in `src/components/ui/`.
- **Two storage backends, one interface.** [`src/lib/projectService.ts`](src/lib/projectService.ts) exposes `list / get / create / update / remove`. With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set it talks to Supabase; otherwise it uses `localStorage` seeded with 4 sample Reels ([`src/data/mockProjects.ts`](src/data/mockProjects.ts)). The rest of the app doesn't know which one is active.
- **Types match the database.** `Project` in [`src/types/project.ts`](src/types/project.ts) uses the same snake_case names as the `projects` table, so rows need no mapping. Change both together.
- **Autosave** ([`src/hooks/useAutosaveProject.ts`](src/hooks/useAutosaveProject.ts)): `update(patch)` changes the screen immediately and queues the patch. Queued changes save after 700 ms without edits, when the wizard is left, or on tab close. Saves are chained so they arrive in order; failures retry every 4 s.
- **Wizard paths** ([`src/data/wizardPaths.ts`](src/data/wizardPaths.ts)): each path (`source` = `plan` | `existing`) lists its steps, publishing steps, Review sections and where Review's "Edit" buttons go. Step screens are registered by name in [`components/wizard/stepComponents.ts`](src/components/wizard/stepComponents.ts). Steps navigate by name (`goTo('script')`), and shared steps use `goNext()`/`goBack()`. **Adding a third path** = a new `ProjectSource` value (type + `schema.sql` check), an entry in `WIZARD_PATHS`, and any new step screens.
- **`current_step`** is the *furthest step reached in the project's own path*, not the step being viewed. It drives resume, the progress bars, and step locking. Reels saved before `source` existed have no `source` field and are treated as `plan`.
- **Own video handling:** [`src/lib/videoFile.ts`](src/lib/videoFile.ts) reads a file through an object URL (`probeVideo` never hangs: 10s timeout, and a decoded frame is required to count as playable), runs the checks, and captures cover frames. [`src/lib/videoSession.ts`](src/lib/videoSession.ts) keeps the `File` in memory between steps and revokes its object URL when replaced, when the owner leaves the Reel, or on page close. [`src/hooks/useVideoPicker.ts`](src/hooks/useVideoPicker.ts) is shared by the Video and Cover steps. The real duration lives in `video.duration_seconds`; `length` is clamped to 5–180 because of the database check.
- **Code splitting:** the wizard (`WizardPage` and all steps) loads on demand, which keeps the main bundle under Vite's 500 KB warning (458 KB + a 72 KB wizard chunk).
- **All generation** is in [`src/lib/contentGenerator.ts`](src/lib/contentGenerator.ts): `generateContent`, `generateScenes`, `generateVoice`. This is the seam for real AI.
- **Router modes** (`VITE_ROUTER`): `browser` (default, clean URLs), `hash` (GitHub Pages, set by `.env.pages`), `memory` (used for the claude.ai demo).
- **Confirmations** use an in-page dialog ([`src/context/ConfirmContext.tsx`](src/context/ConfirmContext.tsx)) instead of `window.confirm`, which embedded viewers block.

### Database

[`supabase/schema.sql`](supabase/schema.sql) creates the `projects` table: the 10 columns from the original spec plus `call_to_action`, `current_step`, `voice`, `scenes`, `checklist`, `publish_checklist`, `updated_at`, `source` (`plan`/`existing`, with a check) and `video` (jsonb; the file itself is never stored). Because `create table if not exists` skips an existing table, `source` and `video` are also added with `alter table … add column if not exists`, so the file is safe to re-run on an older database (existing rows become `plan`). It also adds an `updated_at` trigger, indexes, and row-level security. [`supabase/seed.sql`](supabase/seed.sql) adds the same 5 sample Reels as demo mode, including one own-video Reel with a small cover.

## What works (and how it was checked)

### Verified on 2026-10-07 (own-video path)

All in Playwright's Chromium, with test videos generated by ffmpeg. Everything in this list is covered by the committed tests (`npm run test:e2e`, 18 of 18 passing):

- **Own-video full path:** vertical 720×1280 video → all three checks ✅ → caption generated and edited → cover picked at 3.5s with text → full-size cover downloaded (verified 720×1280 JPEG) → Review shows only video/cover/caption/hashtags (no script, scenes or build checklist) → Publish starts with "Find your video in your camera roll" → Published. After a reload: status, caption edits, cover image, cover text and cover time all kept; Cover step says "Choose your video again to change the cover."
- **Checks:** horizontal → shape warning with the fix tip; 360×640 → quality warning; 190s → length warning, with `length` stored as 180 and the real duration in `video`; a phone-style file stored sideways with a rotation flag → counted as vertical 720×1280.
- **Unplayable video** (HEVC `.mov`): plain message, asks for the length, can't continue without it, continues with it, Cover step explains picking the cover in Instagram, Review shows the typed length.
- **Not a video** (`.txt`): plain message, nothing saved.
- **Changing files:** a second file replaces the first; with a cover already chosen it asks first, Cancel keeps everything, and confirming clears the cover.
- **Object URLs:** counted with an instrumented `URL.createObjectURL`: one live URL while a file is in use, released on replace, not kept for an unplayable file, and released on leaving the Reel.
- **Phone width (390px):** the whole own-video path, including the frame picker (slider and buttons on screen and at least 32px tall, tapped), the choice screen and the dashboard, with no sideways scrolling. This check caught a real layout bug (the Review cover filled the card), which is fixed. The scroll check compares against the fixed 390px, because mobile emulation widens `innerWidth` to fit overflowing content.
- **Resume:** leave at Caption → dashboard resume card says "Next: Write your caption" → Resume and the My Reels card both land on Caption; URLs for later steps or plan-path steps redirect back. The sample own-video Reel opens at Cover with its saved cover.
- **Choice screen:** opening New Reel and leaving creates nothing.
- **Status:** Draft until the caption is written, then In Progress.
- **Plan path regression:** full 7-step run to Published and reload; Idea fields in their original order; hashtag editor; locked-step redirect; Review "Edit" and "Open checklist" and Back go to the same steps as before; a Reel saved in the old format (no `source`) opens as a plan Reel at "Step 3 of 7".

Also checked this session, outside the committed tests:
- `npm run typecheck` and `npm run build` pass, with no bundle-size warning.
- **GitHub Pages build** served under `/AI-Reel-Builder/`: a deep link to an own-video Reel loads the on-demand wizard chunk, and the Video step works.
- **Dark mode:** screenshots of the choice screen, Video step (with a warning), Review and My Reels look right.
- **Cover preview size:** 19.6 KB (test pattern), 21.1 KB (1080×1920 heavy grain), 30.8 KB (fine fractal detail). Expect roughly 20–30 KB per Reel; localStorage (~5 MB) holds well over 100.
- **SQL on PostgreSQL 16:** the schema from `main` with an existing row, then the new `schema.sql` twice, then `seed.sql`: no errors, the old row became `plan`, the seed's own-video Reel loaded, and a bad `source` value was rejected. A fresh database with the new schema + seed also works (5 rows, 1 own-video).

**Not verified this session:**
- **Real MP4 (H.264) videos.** Playwright's Chromium can't play H.264, so all playable test videos were WebM/VP9. Real Chrome, Safari and Edge do play MP4, but the full cover flow hasn't been run on one.
- **iPhone / Safari / Android.** Not tried on a real phone. In particular: iOS Safari sometimes doesn't paint a video frame until playback starts, which could leave the cover preview black; how "Save full-size cover" behaves on iOS (it may open the image rather than save it); and whether HEVC plays in Safari (it should, so iPhone owners using Safari would get the full cover picker).
- **Firefox**, and the exact Chrome/Firefox behavior with real iPhone `.mov` files (tested with an ffmpeg-made HEVC file).
- **The claude.ai demo** wasn't rebuilt. It's still the 2026-10-02 snapshot without this path, and its viewer blocks downloads anyway.
- **Supabase**, as before.

### Verified on 2026-10-02

- **Full wizard run in Chromium (Playwright), desktop size:** created a Reel, generated content, edited the hook, generated a voice, got a 5-scene plan totalling exactly 30s, ticked checklists, reached Ready to Publish, then Published. Reloading kept the edited hook and the Published status.
- **Resume and locking:** the in-progress sample opened at Step 4, and visiting Step 6 of a draft redirected to Step 1.
- **Phone size (390px):** dashboard, slide-out menu and scene cards rendered with no sideways scrolling.
- **Dark mode:** toggled and screenshotted on the Reel list and the review step.
- **Confirmation dialog:** delete worked with `window.confirm` disabled, as in the claude.ai viewer.
- **GitHub Pages build:** served under `/AI-Reel-Builder/`; refreshing a sub-page and opening a deep link both worked. The Actions deploy succeeded.
- **SQL:** `schema.sql` ran twice cleanly (safe to re-run) and `seed.sql` loaded all 4 rows on PostgreSQL 16. The `updated_at` trigger fired.
- **Type-check:** `tsc -b` passes with strict settings.

**Not verified:**
- A real Supabase project. The Supabase code path has never run.
- Safari, Firefox and real phones (iOS/Android).
- Vercel and Netlify deploys. Config files exist but haven't been tried.
- Screen readers or a formal accessibility audit.

The 2026-10-02 checks were one-off scripts; the plan-path ones are now covered by the committed tests above.

## What's broken or unfinished

Ordered by impact.

### Unfinished by design

1. **Content generation is placeholder text.** The hook and caption mention the topic, but the main script is a fixed set of sentences per tone. For example, every "Energetic" Reel says "It is fast. It is easy. And it actually works." Hashtags are words pulled from the topic and audience (e.g. `#cold #brew #coffee #young`). It's good enough to demo the flow, not to post.
2. **Voice generation is fake.** "Generate Voice" waits ~2s and estimates a duration. No audio file is created, so there is nothing to download and put in a video. The preview uses the browser's speech engine, so it sounds different on every device.
3. **No user accounts.** Everyone using the same database shares the same Reels.

### Security risk

4. **The demo database policy lets anyone read, change or delete every project.** The live site is safe today because it has no Supabase keys and uses browser storage. **Do not add `VITE_SUPABASE_*` variables to the GitHub Pages workflow until accounts exist**: the anon key is shipped in the public site, so anyone could wipe the table. The fix is outlined in `schema.sql` (commented "PRODUCTION" block) and the README.

### Bugs

5. **Abandoned new Reels still leave empty drafts, but less often.** *Partly fixed:* `/projects/new` now shows the path choice and creates nothing until the owner picks. Picking a path and then leaving still leaves an "Untitled Reel" draft. *Full fix:* create the record on the first edit. That changes `useAutosaveProject` (shared by both paths), so it was left for a separate change.
6. **Demo mode breaks when browser storage is blocked.** If `localStorage` writes fail (storage full, or a browser that blocks site data), `writeAll` swallows the error ([`src/lib/projectService.ts`](src/lib/projectService.ts)). The UI still says "All changes saved", and a new Reel shows "Reel not found" because the next read finds nothing stored. *Fix:* keep an in-memory copy as a fallback and show a warning banner when storage writes fail.
7. **Voice pause/resume is out of sync.** After pausing, Play resumes the progress bar mid-way but restarts the speech from the beginning ([`VoiceStep.tsx`](src/components/wizard/steps/VoiceStep.tsx) `handlePlay`). The progress bar is driven by the estimated duration, not the real speech, so the two drift anyway. *Fix:* use `speechSynthesis.pause()`/`resume()`, or play a real audio file once voice is real.
8. **Editing the script doesn't flag the voice as out of date.** A voiceover generated before script edits still shows as done, with the old duration. *Fix:* store a hash of the script on the voice and show "Script changed, regenerate voice" when it differs.

### Rough edges

9. **Closing the tab may lose the last edit with Supabase.** Unsent edits (up to ~0.7s of typing) are sent in a `beforeunload` handler, but browsers can cancel network requests during unload. Demo mode isn't affected because its save is synchronous.
10. **A Supabase update blocked by security rules retries forever** every 4s, showing "Not saved, will retry", with no explanation.
11. **A Published Reel stays "Published" even if its content is regenerated or edited.** Possibly intended; worth a product decision.
12. **Deleting every scene and coming back to Step 4** auto-generates a new plan.
13. **The claude.ai demo is a frozen snapshot** and will drift from `main`. Prefer the GitHub Pages link. Rebuilding it as one file would now need Vite's `inlineDynamicImports`, since the wizard is a separate chunk.
14. **Own-video caveats:**
    - The caption is template text, like the plan path's script.
    - `INSTAGRAM_REEL_MAX_SECONDS` (180) must be checked against Instagram's rules from time to time.
    - "Same file" is judged by name + size, so a renamed copy counts as different and asks before clearing the cover.
    - Cover text in the full-size image is drawn by the browser, so fonts and emoji vary a little by device. The on-screen preview is an approximation of it.
    - Covers are stored as data URLs inside each row, and the list query loads them all. That's fine for dozens of Reels, but with Supabase at scale move covers to Supabase Storage.
    - `current_step` is capped at 7 by the database. Both paths fit, but a longer future path would need that constraint changed (drop and re-add, to stay re-runnable).
15. **On phones, the closed slide-out menu's links stay in the page.** Playwright treats them as visible, and keyboard users can probably still tab into them. This isn't new and wasn't verified with a keyboard. *Fix:* mark the closed menu `inert`.

### Maintenance

16. **Dependency advisories** (from `npm audit`):
    - *Ships to users:* React Router 6.30 has 2 moderate advisories: an open redirect via backslashes in `<Link>`/`useNavigate`, and an SSR issue. Neither is reachable today, because every navigation target is a hard-coded internal path and there is no SSR. The fix is upgrading to `react-router-dom@7`, which is a mostly compatible major version.
    - *Build tools only:* 9 advisories (6 high) in Vite 5 and Tailwind 3's file-watching dependencies (`braces`, `micromatch`, `esbuild`). These don't ship to users and mainly matter for the local dev server. The fix is upgrading to Vite 6+ / Tailwind 4, which needs config changes.
17. **Tests aren't in CI, and there's no linter.** The e2e suite runs locally (`npm run test:e2e`, needs ffmpeg with libvpx and libx265). The deploy workflow still only type-checks and builds. There is a stray `eslint-disable` comment in `ScenePlannerStep.tsx`, but ESLint isn't installed.
18. ~~One large JavaScript bundle.~~ *Fixed:* the wizard now loads on demand (458 KB main + 72 KB wizard).

## What should come next

The product roadmap (P0–P2, with the reasoning) is in [SPEC.md](SPEC.md). This is the engineering order for the near term:

1. **Review and merge `claude/own-video-path`** (it includes `claude/ai-reel-builder-app`). Merging to `main` deploys the new path to the live site.
2. **Try the own-video path on real phones**: an iPhone in Safari (frame painting, HEVC, "Save full-size cover") and an Android phone in Chrome with a normal MP4. Fix whatever surfaces.
3. **Run the e2e tests in the deploy workflow**, so `main` can't ship a broken wizard. The runner needs ffmpeg (with libvpx and libx265) and `npx playwright install --with-deps chromium`. Add ESLint at the same time.
4. **Fix the remaining bugs:** finish item 5 (create the Reel on first edit), then items 6–8. Each is small and contained.
5. **Connect a real Supabase project** and run the wizard against it once, since this path is untested. Fix whatever surfaces, including the retry message (item 10).
6. **Add accounts before any shared or public use of Supabase.** Use Supabase Auth magic links, then apply the PRODUCTION policy block in `schema.sql`. This closes item 4.
7. **Real AI content.** Add a Supabase Edge Function that calls an LLM and returns the same shapes as `contentGenerator.ts`. Keep API keys server-side, never in `VITE_*` variables. Prompt with topic, audience, tone, length and CTA; ask for a hook, a body that fits the length at ~2.5 words per second, a CTA, a caption and 5–10 specific hashtags; validate the JSON. `generateVideoCaption` (own-video path) takes `{ description, audience, tone, call_to_action, duration_seconds }` and returns `{ caption, hashtags }`; swap it the same way.
8. **Real voiceover.** Add an Edge Function that calls a text-to-speech service, stores the MP3 in Supabase Storage, and adds `audio_url` to the `voice` object. Add a Download button so owners can drop it into CapCut. This replaces the speech-preview workaround and fixes item 7.
9. **Upgrade dependencies:** React Router 7 first (it ships to users), then Vite and Tailwind.
10. **Product ideas once the basics are solid:** duplicate a Reel as a template, export the script and shot list as a PDF or printable page, per-scene thumbnails or reference images, scheduling reminders, and a short onboarding tour for first-time users.

## Running it

```bash
npm install
npm run dev            # http://localhost:5173, demo mode
npm run typecheck
npm run build          # production build (clean URLs)
npm run build:pages    # GitHub Pages build (hash URLs, relative paths)
npm run test:e2e       # 18 Playwright tests (needs ffmpeg; first time: npx playwright install chromium)
```

Supabase setup, deployment and the database reference are in the [README](README.md).
