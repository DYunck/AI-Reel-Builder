# 🎬 AI Reel Builder

**Turn an idea into an Instagram Reel, one simple step at a time.**

AI Reel Builder is a guided web app for small business owners with no video experience. Describe your idea and it walks you through the script, voiceover, shot list, editing checklist and publishing. Your progress saves automatically, so you can stop and pick up later.

Built with **React + TypeScript + Tailwind CSS + Supabase**. It works on phones and computers and has a dark mode.

---

## ✨ Features

| | |
|---|---|
| **7-step wizard** | Idea → Script → Voice → Scenes → Build → Review → Publish |
| **Autosave** | Every keystroke is saved (debounced), with a "Saving… / All changes saved" indicator |
| **Resume anytime** | Opening a Reel takes you back to the furthest step you reached |
| **Dashboard** | Status counts, a "pick up where you left off" card and recent Reels |
| **My Reels** | All projects with search and status filters |
| **Status tracking** | Draft · In Progress · Ready to Publish · Published |
| **Dark mode** | Light / Dark / System, remembered per browser |
| **Mobile friendly** | Slide-out sidebar, compact progress bar, and the scene table turns into cards |
| **Demo mode** | Runs with no setup. Data is kept in your browser until you connect Supabase |

### The workflow

1. **Idea Intake.** Enter the Reel topic, audience, tone, video length and call to action, then click **Generate Content**.
2. **Script Generator.** Edit the generated hook, main script, call to action, Instagram caption and hashtags. It shows an estimated speaking time compared with your target length.
3. **Voice Generation.** Pick a voice, click **Generate Voice**, and preview it. *(Simulated. The preview uses your browser's built-in text-to-speech.)*
4. **Scene Planner.** Edit the table of scene number, description, suggested visual and duration. You can add, delete or regenerate scenes, and it tracks the total length.
5. **Video Builder Checklist.** Tick off Script Created, Voice Created, Visuals Created, Captions Added and Music Added. Each item has a beginner tip.
6. **Final Review.** See the script, scene plan, caption and hashtags in one place, with copy and edit buttons, then click **Ready to Publish**.
7. **Publishing Checklist.** Follow the steps: Export Video → Upload to Instagram → Paste Caption → Add Hashtags → Publish Reel. It has one-tap copy buttons, then you **Mark as Published**.

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

Open **http://localhost:5173**. That's it. The app starts in **demo mode** with 4 sample Reels saved in your browser.

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
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler only |

---

## 🗂 Folder structure

```
AI-Reel-Builder/
├── index.html                    # HTML shell (applies saved theme before first paint)
├── public/
│   ├── favicon.svg
│   └── _redirects                # SPA routing for Netlify
├── supabase/
│   ├── schema.sql                # projects table, trigger, RLS policies
│   └── seed.sql                  # sample projects
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Routes
│   ├── index.css                 # Tailwind base styles
│   ├── types/
│   │   └── project.ts            # Project, Scene, ReelScript, status types
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (null in demo mode)
│   │   ├── projectService.ts     # CRUD: Supabase or localStorage, same API
│   │   ├── contentGenerator.ts   # Mock script / scene / voice generation
│   │   └── utils.ts              # cn(), dates, hashtags, clipboard
│   ├── data/
│   │   ├── options.ts            # Tones, lengths, voices, statuses, steps, checklists
│   │   └── mockProjects.ts       # Sample projects for demo mode
│   ├── context/
│   │   └── ThemeContext.tsx      # Light / dark / system theme
│   ├── hooks/
│   │   ├── useProjects.ts        # Project list loading + delete
│   │   └── useAutosaveProject.ts # Load one project, debounced autosave, retry
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
│   │       └── steps/
│   │           ├── IdeaIntakeStep.tsx       # Step 1
│   │           ├── ScriptStep.tsx           # Step 2
│   │           ├── VoiceStep.tsx            # Step 3
│   │           ├── ScenePlannerStep.tsx     # Step 4
│   │           ├── VideoChecklistStep.tsx   # Step 5
│   │           ├── FinalReviewStep.tsx      # Step 6
│   │           └── PublishStep.tsx          # Step 7
│   └── pages/
│       ├── DashboardPage.tsx
│       ├── ProjectsPage.tsx
│       ├── NewProjectPage.tsx
│       ├── WizardPage.tsx
│       ├── SettingsPage.tsx
│       └── NotFoundPage.tsx
├── tailwind.config.js            # darkMode: 'class', brand colors
├── vite.config.ts                # @ → src alias
└── vercel.json                   # SPA routing for Vercel
```

---

## 🧭 Routes

| Path | Page |
|---|---|
| `/` | Dashboard |
| `/projects` | My Reels (search + filter) |
| `/projects/new` | Creates a draft and opens Step 1 |
| `/projects/:id` | Resumes at the furthest step reached |
| `/projects/:id/:step` | Wizard step: `idea` · `script` · `voice` · `scenes` · `build` · `review` · `publish` |
| `/settings` | Theme and data storage |

Steps you haven't reached yet are locked. Visiting one redirects to your current step.

---

## 🗄 Database schema

One table, `projects`. The full SQL is in [`supabase/schema.sql`](supabase/schema.sql).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `title` | `text` | The Reel topic |
| `audience` | `text` | |
| `tone` | `text` | Friendly, Professional, Energetic, Funny, Inspirational, Educational |
| `length` | `integer` | Target seconds (5–180) |
| `script` | `jsonb` | `{ hook, body, cta }` |
| `caption` | `text` | |
| `hashtags` | `text[]` | |
| `status` | `text` | `draft` · `in_progress` · `ready_to_publish` · `published` |
| `created_at` | `timestamptz` | |
| `call_to_action` | `text` | Step 1 input |
| `current_step` | `integer` | Furthest wizard step reached (1–7), used for resume |
| `voice` | `jsonb` | `{ voice_id, generated_at, duration_seconds }` |
| `scenes` | `jsonb` | `[{ id, description, visual, duration }]` |
| `checklist` | `jsonb` | Step 5 checkboxes |
| `publish_checklist` | `jsonb` | Step 7 checkboxes |
| `updated_at` | `timestamptz` | Auto-updated by trigger, used for sorting |

The first ten columns are the ones in the original spec. The rest store wizard progress so projects can be resumed exactly.

**Status lifecycle:** a new project is a **Draft** → it becomes **In Progress** once content is generated → **Ready to Publish** when you click *Ready to Publish* in Step 6 → **Published** when every publishing step is ticked and you click *Mark as Published*.

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

Run `npm run build` and deploy the `dist/` folder to any static host:

- **Vercel:** import the repo. `vercel.json` already handles page refreshes on deep links.
- **Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` handles routing.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your host's settings.

---

## 🛠 Tech stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 (with `@tailwindcss/forms`) · React Router 6 · Supabase JS 2 · lucide-react icons
