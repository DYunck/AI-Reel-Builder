# CLAUDE.md

## Rules

- **Before saying something works, actually test it.** Run it: type-check, build, and exercise the feature in a browser (Playwright/Chromium) or against the real service. If something couldn't be tested, say so plainly instead of implying it works.
- **Don't spend money or sign up for services without asking me.** This includes paid APIs, AI or text-to-speech providers, hosting plans, and creating accounts or projects on any service (Supabase, Vercel, etc.).
- **Update HANDOFF.md at the end of every session.** Record what changed, what was tested and how, what's still broken or unfinished, and what should come next. Update its "Last updated" date.

## Project quick reference

AI Reel Builder: a React + TypeScript + Tailwind + Supabase wizard that helps small business owners turn an idea into an Instagram Reel. Read `HANDOFF.md` first for current state and known issues; `README.md` covers setup and deployment.

```bash
npm install
npm run dev            # http://localhost:5173 (demo mode: no Supabase keys, data in localStorage)
npm run typecheck      # tsc -b, strict
npm run build          # production build
npm run build:pages    # GitHub Pages build (hash URLs, relative paths)
```

- Pushing to `main` auto-deploys to https://dyunck.github.io/AI-Reel-Builder/ via `.github/workflows/deploy-pages.yml`.
- `src/types/project.ts` mirrors the `projects` table in `supabase/schema.sql` (snake_case, no mapping). Change both together.
- All data access goes through `src/lib/projectService.ts` (Supabase or localStorage behind one interface).
- AI and voice generation are mocked in `src/lib/contentGenerator.ts`.
- Use `useConfirm()` from `src/context/ConfirmContext.tsx`, never `window.confirm`.
- The target user is non-technical: keep UI copy plain and friendly.
