# AI Reel Builder: Handoff

_Last updated: 2026-10-07. Written for whoever picks this project up next, developer or owner._

## What this app is

AI Reel Builder helps a small business owner with no video experience turn an idea into an Instagram Reel. A 7-step wizard takes them from idea → script → voiceover → shot list → editing checklist → final review → publishing checklist. Progress saves automatically, so a Reel can be finished over several sittings.

**Important:** the "AI" parts are not real yet. The script, caption, hashtags and scene plan come from templates, and voice generation is simulated (see [Broken or unfinished](#whats-broken-or-unfinished)).

## Where everything lives

| What | Where |
|---|---|
| Code | https://github.com/DYunck/AI-Reel-Builder (`main`) |
| Live site | https://dyunck.github.io/AI-Reel-Builder/ (GitHub Pages, demo mode) |
| Pages build output | `gh-pages` branch. Generated, don't edit by hand |
| Working branch | `claude/ai-reel-builder-app`. Same as `main` plus `HANDOFF.md`, `CLAUDE.md` and `SPEC.md`, which are only on this branch until merged |
| Private claude.ai demo | https://claude.ai/artifact/TEKmnvL2esK7eW5zy35SeT. A **frozen snapshot** from 2026-10-02; it does not update when `main` changes |
| Product spec (who it's for, prioritized roadmap) | [`SPEC.md`](SPEC.md) |
| Setup and deploy docs | [`README.md`](README.md) |
| Working rules for Claude | [`CLAUDE.md`](CLAUDE.md): test before claiming something works, ask before spending money or signing up for services, update this file every session |

**Deploys:** every push to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which type-checks, builds, and publishes to `gh-pages`. The last verified run (2026-10-02) succeeded.

## State at a glance

| Area | Status |
|---|---|
| 7-step wizard UI | ✅ Built and tested end to end |
| Autosave and resume | ✅ Works in demo mode (browser storage) |
| Dashboard, Reel list, statuses | ✅ Built and tested |
| Dark mode, mobile layout | ✅ Built and tested |
| Supabase database | ⚠️ Schema tested on Postgres 16; **app never run against a real Supabase project** |
| AI script / caption / scenes | ❌ Template-based placeholder |
| Voice generation | ❌ Simulated; preview uses the browser's built-in speech |
| User accounts / security | ❌ None; demo database policy is wide open |
| Automated tests, linting | ❌ None in the repo |

## What's built

### Features

- **Dashboard** (`/`): counts per status, a "Pick up where you left off" card for the most recently edited unfinished Reel, and the 6 most recent Reels.
- **My Reels** (`/projects`): every Reel, with search (topic or audience) and status filter chips. Delete asks for confirmation.
- **Wizard** (`/projects/:id/:step`):
  1. **Idea:** topic, audience, tone (6 options), length (15–90s), call to action. Validates topic and audience. "Generate Content" creates the script.
  2. **Script:** editable hook, main script, CTA, caption (2,200-char limit) and hashtags (add/remove chips). Shows estimated speaking time versus target length.
  3. **Voice:** pick 1 of 5 voices, "Generate Voice", play/pause preview with a waveform. Can be skipped.
  4. **Scenes:** editable table (number, description, suggested visual, duration). Add, delete or regenerate rows; tracks the total against the target length. Shows as cards on phones.
  5. **Build:** 5-item checklist (script, voice, visuals, captions, music) with beginner tips. Script and voice tick themselves when generated.
  6. **Review:** everything on one page with Copy and Edit buttons. "Ready to Publish" sets that status.
  7. **Publish:** 5 Instagram posting steps with copy-caption and copy-hashtags buttons. "Mark as Published" unlocks once every step is ticked.
- **Settings** (`/settings`): light / dark / system theme, which storage is in use, and "Reset sample data" (demo mode only).
- **Status lifecycle:** Draft (created) → In Progress (content generated) → Ready to Publish (Step 6 button) → Published (Step 7 button). A published Reel can be marked "not published" again.
- **Navigation rules:** a Reel opens at the furthest step reached. Steps not yet reached are locked, and visiting one by URL redirects to the current step.

### How it's put together

- **Stack:** React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, React Router 6, Supabase JS 2, lucide-react icons. No UI library; components are in `src/components/ui/`.
- **Two storage backends, one interface.** [`src/lib/projectService.ts`](src/lib/projectService.ts) exposes `list / get / create / update / remove`. With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set it talks to Supabase; otherwise it uses `localStorage` seeded with 4 sample Reels ([`src/data/mockProjects.ts`](src/data/mockProjects.ts)). The rest of the app doesn't know which one is active.
- **Types match the database.** `Project` in [`src/types/project.ts`](src/types/project.ts) uses the same snake_case names as the `projects` table, so rows need no mapping. Change both together.
- **Autosave** ([`src/hooks/useAutosaveProject.ts`](src/hooks/useAutosaveProject.ts)): `update(patch)` changes the screen immediately and queues the patch. Queued changes save after 700 ms without edits, when the wizard is left, or on tab close. Saves are chained so they arrive in order; failures retry every 4 s.
- **`current_step`** is the *furthest step reached*, not the step being viewed. It drives resume, the progress bars, and step locking.
- **All generation** is in [`src/lib/contentGenerator.ts`](src/lib/contentGenerator.ts): `generateContent`, `generateScenes`, `generateVoice`. This is the seam for real AI.
- **Router modes** (`VITE_ROUTER`): `browser` (default, clean URLs), `hash` (GitHub Pages, set by `.env.pages`), `memory` (used for the claude.ai demo).
- **Confirmations** use an in-page dialog ([`src/context/ConfirmContext.tsx`](src/context/ConfirmContext.tsx)) instead of `window.confirm`, which embedded viewers block.

### Database

[`supabase/schema.sql`](supabase/schema.sql) creates the `projects` table: the 10 columns from the original spec plus `call_to_action`, `current_step`, `voice`, `scenes`, `checklist`, `publish_checklist` and `updated_at` for resume. It also adds an `updated_at` trigger, indexes, and row-level security. [`supabase/seed.sql`](supabase/seed.sql) adds the same 4 sample Reels.

## What works (and how it was checked)

Verified on 2026-10-02:

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

These checks were one-off scripts and are **not** saved in the repo.

## What's broken or unfinished

Ordered by impact.

### Unfinished by design

1. **Content generation is placeholder text.** The hook and caption mention the topic, but the main script is a fixed set of sentences per tone. For example, every "Energetic" Reel says "It is fast. It is easy. And it actually works." Hashtags are words pulled from the topic and audience (e.g. `#cold #brew #coffee #young`). It's good enough to demo the flow, not to post.
2. **Voice generation is fake.** "Generate Voice" waits ~2s and estimates a duration. No audio file is created, so there is nothing to download and put in a video. The preview uses the browser's speech engine, so it sounds different on every device.
3. **No user accounts.** Everyone using the same database shares the same Reels.

### Security risk

4. **The demo database policy lets anyone read, change or delete every project.** The live site is safe today because it has no Supabase keys and uses browser storage. **Do not add `VITE_SUPABASE_*` variables to the GitHub Pages workflow until accounts exist**: the anon key is shipped in the public site, so anyone could wipe the table. The fix is outlined in `schema.sql` (commented "PRODUCTION" block) and the README.

### Bugs

5. **Abandoned "New Reel" clicks leave empty drafts.** `/projects/new` creates a stored project immediately ([`src/pages/NewProjectPage.tsx`](src/pages/NewProjectPage.tsx)). Clicking New Reel and leaving adds an "Untitled Reel" draft to the list each time. *Fix:* create the record on the first edit or on "Generate Content", or skip saving untouched drafts.
6. **Demo mode breaks when browser storage is blocked.** If `localStorage` writes fail (storage full, or a browser that blocks site data), `writeAll` swallows the error ([`src/lib/projectService.ts`](src/lib/projectService.ts)). The UI still says "All changes saved", and a new Reel shows "Reel not found" because the next read finds nothing stored. *Fix:* keep an in-memory copy as a fallback and show a warning banner when storage writes fail.
7. **Voice pause/resume is out of sync.** After pausing, Play resumes the progress bar mid-way but restarts the speech from the beginning ([`VoiceStep.tsx`](src/components/wizard/steps/VoiceStep.tsx) `handlePlay`). The progress bar is driven by the estimated duration, not the real speech, so the two drift anyway. *Fix:* use `speechSynthesis.pause()`/`resume()`, or play a real audio file once voice is real.
8. **Editing the script doesn't flag the voice as out of date.** A voiceover generated before script edits still shows as done, with the old duration. *Fix:* store a hash of the script on the voice and show "Script changed, regenerate voice" when it differs.

### Rough edges

9. **Closing the tab may lose the last edit with Supabase.** Unsent edits (up to ~0.7s of typing) are sent in a `beforeunload` handler, but browsers can cancel network requests during unload. Demo mode isn't affected because its save is synchronous.
10. **A Supabase update blocked by security rules retries forever** every 4s, showing "Not saved, will retry", with no explanation.
11. **A Published Reel stays "Published" even if its content is regenerated or edited.** Possibly intended; worth a product decision.
12. **Deleting every scene and coming back to Step 4** auto-generates a new plan.
13. **The claude.ai demo is a frozen snapshot** and will drift from `main`. Prefer the GitHub Pages link.

### Maintenance

14. **Dependency advisories** (from `npm audit`):
    - *Ships to users:* React Router 6.30 has 2 moderate advisories: an open redirect via backslashes in `<Link>`/`useNavigate`, and an SSR issue. Neither is reachable today, because every navigation target is a hard-coded internal path and there is no SSR. The fix is upgrading to `react-router-dom@7`, which is a mostly compatible major version.
    - *Build tools only:* 9 advisories (6 high) in Vite 5 and Tailwind 3's file-watching dependencies (`braces`, `micromatch`, `esbuild`). These don't ship to users and mainly matter for the local dev server. The fix is upgrading to Vite 6+ / Tailwind 4, which needs config changes.
15. **No automated tests and no linter.** There is a stray `eslint-disable` comment in `ScenePlannerStep.tsx`, but ESLint isn't installed. CI only type-checks and builds.
16. **One 490 KB JavaScript bundle** (140 KB gzipped), just under Vite's warning size. It's fine for now, but split routes (`React.lazy`) before adding much more.

## What should come next

The product roadmap (P0–P2, with the reasoning) is in [SPEC.md](SPEC.md). This is the engineering order for the near term:

1. **Fix the four bugs (items 5–8).** Each is small and contained.
2. **Commit an end-to-end test.** Port the wizard walk-through to `@playwright/test` in the repo and run it in the deploy workflow, so `main` can't ship a broken wizard. Add ESLint at the same time.
3. **Connect a real Supabase project** and run the wizard against it once, since this path is untested. Fix whatever surfaces, including the retry message (item 10).
4. **Add accounts before any shared or public use of Supabase.** Use Supabase Auth magic links, then apply the PRODUCTION policy block in `schema.sql`. This closes item 4.
5. **Real AI content.** Add a Supabase Edge Function that calls an LLM and returns the same shapes as `contentGenerator.ts`. Keep API keys server-side, never in `VITE_*` variables. Prompt with topic, audience, tone, length and CTA; ask for a hook, a body that fits the length at ~2.5 words per second, a CTA, a caption and 5–10 specific hashtags; validate the JSON.
6. **Real voiceover.** Add an Edge Function that calls a text-to-speech service, stores the MP3 in Supabase Storage, and adds `audio_url` to the `voice` object. Add a Download button so owners can drop it into CapCut. This replaces the speech-preview workaround and fixes item 7.
7. **Upgrade dependencies:** React Router 7 first (it ships to users), then Vite and Tailwind.
8. **Product ideas once the basics are solid:** duplicate a Reel as a template, export the script and shot list as a PDF or printable page, per-scene thumbnails or reference images, scheduling reminders, and a short onboarding tour for first-time users.

## Running it

```bash
npm install
npm run dev            # http://localhost:5173, demo mode
npm run typecheck
npm run build          # production build (clean URLs)
npm run build:pages    # GitHub Pages build (hash URLs, relative paths)
```

Supabase setup, deployment and the database reference are in the [README](README.md).
