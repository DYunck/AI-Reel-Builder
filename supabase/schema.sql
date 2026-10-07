-- =============================================================
-- AI Reel Builder - Supabase schema
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- projects
-- One row per Reel. The required columns (id, title, audience, tone,
-- length, script, caption, hashtags, status, created_at) are first.
-- The remaining columns store wizard progress so unfinished projects
-- can be resumed exactly where the user left off.
-- -------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null default '',            -- the Reel topic
  audience          text not null default '',
  tone              text not null default 'Friendly',
  length            integer not null default 30           -- seconds
                      check (length between 5 and 180),
  script            jsonb,                                -- { "hook": "", "body": "", "cta": "" }
  caption           text not null default '',
  hashtags          text[] not null default '{}',
  status            text not null default 'draft'
                      check (status in ('draft', 'in_progress', 'ready_to_publish', 'published')),
  created_at        timestamptz not null default now(),

  -- Wizard progress
  call_to_action    text not null default '',
  current_step      integer not null default 1 check (current_step between 1 and 7),
  voice             jsonb,                                -- { "voice_id": "", "generated_at": "", "duration_seconds": 0 }
  scenes            jsonb not null default '[]'::jsonb,   -- [{ "id", "description", "visual", "duration" }]
  checklist         jsonb not null default
                      '{"script":false,"voice":false,"visuals":false,"captions":false,"music":false}'::jsonb,
  publish_checklist jsonb not null default '[false,false,false,false,false]'::jsonb,
  updated_at        timestamptz not null default now(),

  -- How the Reel is made: 'plan' (7-step wizard) or 'existing' (owner's own video)
  source            text not null default 'plan'
                      check (source in ('plan', 'existing')),
  video             jsonb                                 -- own-video details, see below
);

-- Columns added after the first release. `create table if not exists` skips an
-- existing table, so these keep this file safe to re-run on an older database.
-- Existing rows get source = 'plan'.
alter table public.projects add column if not exists source text not null default 'plan'
  check (source in ('plan', 'existing'));
alter table public.projects add column if not exists video jsonb;

-- video (only for source = 'existing'). The video file itself is never stored.
-- {
--   "file_name": "haircut.mov", "mime_type": "video/quicktime", "size_bytes": 48211234,
--   "duration_seconds": 21.4, "width": 1080, "height": 1920, "playable": true,
--   "cover_image": "data:image/jpeg;base64,...",   -- ~360px wide preview, no text
--   "cover_text": "Wait for it", "cover_time_seconds": 7.2
-- }

create index if not exists projects_updated_at_idx on public.projects (updated_at desc);
create index if not exists projects_status_idx on public.projects (status);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.projects enable row level security;

-- DEMO POLICY: the app ships without sign-in, so this lets anyone holding
-- your anon key read and write every project. That is fine for a personal
-- prototype but NOT for a public deployment. See the "Adding user accounts"
-- section of the README (and the commented block below) before going live.
drop policy if exists "Demo: public access" on public.projects;
create policy "Demo: public access"
  on public.projects
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- -------------------------------------------------------------
-- PRODUCTION (optional): per-user projects with Supabase Auth.
-- 1. Uncomment and run the block below.
-- 2. Add sign-in to the app (supabase.auth.signInWithOtp, etc.).
-- -------------------------------------------------------------
-- alter table public.projects add column if not exists user_id uuid
--   references auth.users (id) on delete cascade default auth.uid();
-- drop policy if exists "Demo: public access" on public.projects;
-- create policy "Users manage own projects"
--   on public.projects
--   for all
--   to authenticated
--   using (user_id = auth.uid())
--   with check (user_id = auth.uid());
