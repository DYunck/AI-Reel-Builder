# 🎬 AI Reel Builder

**Turn an idea into an Instagram Reel, one simple step at a time.**

AI Reel Builder is a guided web app for small business owners with no video experience. Describe your idea and it walks you through the script, voiceover, shot list, editing checklist and publishing. Already have a video? It checks it's ready for Instagram, writes the caption and hashtags, and helps you pick a cover. Your progress saves automatically, so you can stop and pick up later.

Built with **React + TypeScript + Tailwind CSS + Supabase**. It works on phones and computers and has a dark mode.

---

## ✨ Features

| | |
|---|---|
| **Two ways to make a Reel** | *Plan a new Reel with help* (7 steps) or *Post a video I already have* (5 steps) |
| **Plan path** | Idea → Script → Voice → Scenes → Build → Review → Publish |
| **Own-video path** | Video → Caption → Cover → Review → Publish |
| **Video checks** | Shape (9:16), length (Instagram's limit) and quality, read in the browser. Nothing is uploaded |
| **Cover picker** | Scrub to any frame, add cover text, and save a full-size cover image |
| **Autosave** | Every keystroke is saved (debounced), with a "Saving… / All changes saved" indicator |
| **Resume anytime** | Opening a Reel takes you back to the furthest step you reached |
| **Dashboard** | Status counts, a "pick up where you left off" card and recent Reels |
| **My Reels** | All projects with search and status filters |
| **Status tracking** | Draft · In Progress · Ready to Publish · Published |
| **Dark mode** | Light / Dark / System, remembered per browser |
| **Mobile friendly** | Slide-out sidebar, compact progress bar, scene cards, and a frame picker sized for phones |
| **Own video label** | Own-video Reels show an "Own video" label and their cover on the dashboard |
| **Demo mode** | Runs with no setup. Data is kept in your browser until you connect Supabase |

### Path 1: Plan a new Reel with help

1. **Idea Intake.** Enter the Reel topic, audience, tone, video length and call to action, then click **Generate Content**.
2. **Script Generator.** Edit the generated hook, main script, call to action, Instagram caption and hashtags. It shows an estimated speaking time compared with your target length.
3. **Voice Generation.** Pick a voice, click **Generate Voice**, and preview it. *(Simulated. The preview uses your browser's built-in text-to-speech.)*
4. **Scene Planner.** Edit the table of scene number, description, suggested visual and duration. You can add, delete or regenerate scenes, and it tracks the total length.
5. **Video Builder Checklist.** Tick off Script Created, Voice Created, Visuals Created, Captions Added and Music Added. Each item has a beginner tip.
6. **Final Review.** See the script, scene plan, caption and hashtags in one place, with copy and edit buttons, then click **Ready to Publish**.
7. **Publishing Checklist.** Follow the steps: Export Video → Upload to Instagram → Paste Caption → Add Hashtags → Publish Reel. It has one-tap copy buttons, then you **Mark as Published**.

### Path 2: Post a video I already have

1. **Video.** Choose the video from your phone. The app reads it in the browser (it is never uploaded) and checks:
   - **Shape:** vertical 9:16 is perfect; other vertical shapes get a note; square or sideways videos get a warning with a tip on fixing it in CapCut or Instagram Edits. Phone videos stored sideways with a rotation flag count as vertical.
   - **Length:** compared with Instagram's Reel limit (`INSTAGRAM_REEL_MAX_SECONDS` in `src/lib/videoFile.ts`, 3 minutes at the time of writing; check it against Instagram's current rules).
   - **Quality:** a warning if the shorter side is under 720px.

   Then describe the video in one sentence, plus audience, tone and call to action, and click **Write My Caption**. If the browser can't play the file (common with iPhone HEVC `.mov` files in Chrome or Firefox), you type the length instead and pick the cover in Instagram.
2. **Caption.** Edit the generated caption and hashtags (the same editor as the Script step).
3. **Cover.** Scrub through the video, tap **Use this frame**, add optional cover text, and **Save full-size cover** to your phone. The app keeps only a small preview (about 20–30 KB). If you come back later, the video file is gone: the saved cover still shows, and you choose the video again to change it.
4. **Final Review.** Video details and checks, cover, caption and hashtags.
5. **Publishing Checklist.** Find your video in your camera roll → Upload to Instagram → Paste Caption → Add Hashtags → Publish Reel (with the cover moment to slide to).

> **Note:** Content, scene and voice generation are **mocked** with templates in `src/lib/contentGenerator.ts`, so the app works with no AI account. See [Connecting a real AI model](#-connecting-a-real-ai-model) to swap in a real one.

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) **18 or newer** (download the "LTS" version if unsure)
- *(Optional)* A free [Supabase](https://supabase.com/) account to save projects online

### 1. Download and install

```bash
git clone https://github.com/DYunck/AI-Reel-Builder.git
cd AI-Reel-Builder
npm install
```

### 2. Run it

```bash
npm run dev
```

Open **http://localhost:5173**. That's it. The app starts in **demo mode** with 5 sample Reels saved in your browser.

### 3. (Optional) Connect Supabase to save projects online

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. In your Supabase project, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. *(Optional)* Do the same with [`supabase/seed.sql`](supabase/seed.sql) to add sample Reels.
4. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.
5. In this folder, copy the example env file and paste in your values:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

6. Restart `npm run dev`. The sidebar footer should now say **Connected to Supabase**.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run build:pages` | Build for GitHub Pages (relative paths, `#/` URLs) |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler only |
| `npm run test:e2e` | Build, serve, and run the end-to-end tests in Chromium (needs ffmpeg; see below) |

### End-to-end tests

`tests/e2e/` holds [Playwright](https://playwright.dev/) tests for both paths, phone width, resume, and the video edge cases (horizontal, low-resolution, too long, rotated, unplayable HEVC, not a video). Test videos are generated with **ffmpeg** (with `libvpx` and `libx265`) on the first run into `tests/e2e/.fixtures/` (git-ignored). The first time on a new machine, run `npx playwright install chromium`.

---

## 🗂 Folder structure

```
AI-Reel-Builder/
├── index.html                    # HTML shell (applies saved theme before first paint)
├── public/
│   ├── favicon.svg
│   └── _redirects                # SPA routing for Netlify
├── supabase/
│   ├── schema.sql                # projects table, trigger, RLS policies (safe to re-run)
│   └── seed.sql                  # sample projects, incl. one own-video Reel
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Routes (the wizard is loaded on demand)
│   ├── index.css                 # Tailwind base styles
│   ├── types/
│   │   └── project.ts            # Project, Scene, ReelScript, VideoInfo, status/source types
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (null in demo mode)
│   │   ├── projectService.ts     # CRUD: Supabase or localStorage, same API
│   │   ├── contentGenerator.ts   # Mock script / caption / scene / voice generation
│   │   ├── videoFile.ts          # Read a video in the browser, shape/length/quality checks, cover frames
│   │   ├── videoSession.ts       # Keeps the chosen video file between steps; releases object URLs
│   │   └── utils.ts              # cn(), dates, sizes, hashtags, clipboard
│   ├── data/
│   │   ├── options.ts            # Tones, lengths, voices, statuses, build checklist
│   │   ├── wizardPaths.ts        # Each path's steps, publishing steps and review layout
│   │   └── mockProjects.ts       # Sample projects for demo mode
│   ├── context/
│   │   ├── ThemeContext.tsx      # Light / dark / system theme
│   │   └── ConfirmContext.tsx    # In-page "Are you sure?" dialog
│   ├── hooks/
│   │   ├── useProjects.ts        # Project list loading + delete
│   │   ├── useAutosaveProject.ts # Load one project, debounced autosave, retry
│   │   └── useVideoPicker.ts     # Pick + check the owner's video, save its details
│   ├── components/
│   │   ├── layout/               # AppLayout, Sidebar, Topbar, Logo
│   │   ├── ui/                   # Button, Card, Field/Input/Select/Textarea,
│   │   │                         # StatusBadge, ProgressBar, CopyButton, CheckRow, EmptyState
│   │   ├── projects/
│   │   │   └── ProjectCard.tsx
│   │   └── wizard/
│   │       ├── WizardProgress.tsx  # Stepper (desktop) / progress bar (mobile)
│   │       ├── StepFooter.tsx      # Back / next actions, step headings
│   │       ├── SaveIndicator.tsx
│   │       ├── types.ts            # StepProps
│   │       ├── stepComponents.ts   # Step name → screen
│   │       ├── CaptionHashtagEditor.tsx, ReelBasicsFields.tsx   # Shared by both paths
│   │       ├── VideoFilePicker.tsx, VideoChecks.tsx, CoverPreview.tsx
│   │       └── steps/
│   │           ├── IdeaIntakeStep.tsx       # Plan 1
│   │           ├── ScriptStep.tsx           # Plan 2
│   │           ├── VoiceStep.tsx            # Plan 3
│   │           ├── ScenePlannerStep.tsx     # Plan 4
│   │           ├── VideoChecklistStep.tsx   # Plan 5
│   │           ├── VideoStep.tsx            # Own video 1
│   │           ├── CaptionStep.tsx          # Own video 2
│   │           ├── CoverStep.tsx            # Own video 3
│   │           ├── FinalReviewStep.tsx      # Both: Review
│   │           └── PublishStep.tsx          # Both: Publish
│   └── pages/
│       ├── DashboardPage.tsx
│       ├── ProjectsPage.tsx
│       ├── NewProjectPage.tsx
│       ├── WizardPage.tsx
│       ├── SettingsPage.tsx
│       └── NotFoundPage.tsx
├── tests/e2e/                    # Playwright end-to-end tests (npm run test:e2e)
├── playwright.config.ts
├── tailwind.config.js            # darkMode: 'class', brand colors
├── .github/workflows/
│   └── deploy-pages.yml          # Build + publish to GitHub Pages
├── vite.config.ts                # @ → src alias, Pages build mode
└── vercel.json                   # SPA routing for Vercel
```

---

## 🧭 Routes

| Path | Page |
|---|---|
| `/` | Dashboard |
| `/projects` | My Reels (search + filter) |
| `/projects/new` | Asks which way to make the Reel, then creates it and opens Step 1 |
| `/projects/:id` | Resumes at the furthest step reached |
| `/projects/:id/:step` | Wizard step. Plan path: `idea` · `script` · `voice` · `scenes` · `build` · `review` · `publish`. Own-video path: `video` · `caption` · `cover` · `review` · `publish` |
| `/settings` | Theme and data storage |

Each path's steps are defined in [`src/data/wizardPaths.ts`](src/data/wizardPaths.ts). Steps you haven't reached yet (or steps from the other path) are locked; visiting one redirects to your current step.

---

## 🗄 Database schema

One table, `projects`. The full SQL is in [`supabase/schema.sql`](supabase/schema.sql).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `title` | `text` | The Reel topic, or for an own-video Reel the one-sentence description |
| `audience` | `text` | |
| `tone` | `text` | Friendly, Professional, Energetic, Funny, Inspirational, Educational |
| `length` | `integer` | Target seconds (5–180). Own-video Reels: the real length, clamped to this range |
| `script` | `jsonb` | `{ hook, body, cta }` |
| `caption` | `text` | |
| `hashtags` | `text[]` | |
| `status` | `text` | `draft` · `in_progress` · `ready_to_publish` · `published` |
| `created_at` | `timestamptz` | |
| `call_to_action` | `text` | Step 1 input |
| `current_step` | `integer` | Furthest step reached in the Reel's own path (1–7), used for resume |
| `voice` | `jsonb` | `{ voice_id, generated_at, duration_seconds }` |
| `scenes` | `jsonb` | `[{ id, description, visual, duration }]` |
| `checklist` | `jsonb` | Step 5 checkboxes |
| `publish_checklist` | `jsonb` | Step 7 checkboxes |
| `updated_at` | `timestamptz` | Auto-updated by trigger, used for sorting |
| `source` | `text` | `plan` (default) or `existing` (Post a video I already have) |
| `video` | `jsonb` | Own-video details: `{ file_name, mime_type, size_bytes, duration_seconds, width, height, playable, cover_image, cover_text, cover_time_seconds }`. The video file itself is never stored; `cover_image` is a small JPEG data URL |

The first ten columns are the ones in the original spec. The rest store wizard progress so projects can be resumed exactly. `schema.sql` is safe to re-run: it adds `source` and `video` to an existing table with `alter table … add column if not exists`, and existing rows become `plan`.

**Status lifecycle:** a new project is a **Draft** → it becomes **In Progress** once content is generated (or, for an own-video Reel, once the video is checked and the caption written) → **Ready to Publish** when you click *Ready to Publish* in Step 6 → **Published** when every publishing step is ticked and you click *Mark as Published*.

### ⚠️ Security: before you deploy publicly

The app has no sign-in yet, so `schema.sql` ships with a **demo policy** that lets anyone with your anon key read and write every project. That's fine for running it yourself, but **not for a public website**.

#### Adding user accounts

1. Run the commented **PRODUCTION** block at the bottom of `schema.sql`. It adds a `user_id` column and replaces the demo policy with "users can only see their own projects".
2. Add a sign-in screen using [Supabase Auth](https://supabase.com/docs/guides/auth) (for example `supabase.auth.signInWithOtp({ email })` for magic links).

---

## 🤖 Connecting a real AI model

All generation lives in `src/lib/contentGenerator.ts`:

- `generateContent(idea)` → `{ script: { hook, body, cta }, caption, hashtags }`
- `generateScenes({ title, length })` → `Scene[]`
- `generateVoice(text, voiceId)` → `{ voice_id, generated_at, duration_seconds }`

Replace their bodies with calls to your own backend that return the same shapes. A [Supabase Edge Function](https://supabase.com/docs/guides/functions) is a good fit. **Never put AI API keys in the frontend:** anything in `VITE_*` variables is visible to visitors. For real voiceovers, have the function store the audio in Supabase Storage and add an `audio_url` to the `voice` object.

---

## 📦 Deployment

### GitHub Pages (free, built in)

Live at **https://dyunck.github.io/AI-Reel-Builder/** once Pages is turned on.

1. **One-time setup:** in the GitHub repo, go to **Settings → Pages**. Under *Build and deployment*, set **Source** to **Deploy from a branch**, pick **`gh-pages`** and **`/ (root)`**, then click **Save**.
2. Every push to `main` rebuilds the site via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). You can also run it manually from the **Actions** tab.
3. *(Optional)* To use Supabase on the live site, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions → Variables**. Read the security note above first.

The Pages build (`npm run build:pages`) uses `#/` in page addresses (for example `…/AI-Reel-Builder/#/projects`), so refreshing any page works on a static host.

### Other hosts

Run `npm run build` and deploy the `dist/` folder to any static host:

- **Vercel:** import the repo. `vercel.json` already handles page refreshes on deep links.
- **Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` handles routing.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your host's settings.

---

## 🛠 Tech stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 (with `@tailwindcss/forms`) · React Router 6 · Supabase JS 2 · lucide-react icons · Playwright (tests)
