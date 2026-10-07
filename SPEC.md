# AI Reel Builder: Product Spec

_Last updated: 2026-10-07 (added the "Post a video I already have" path). Describes what the product is meant to be. For the current technical state and known bugs, see [HANDOFF.md](HANDOFF.md)._

## 1. What it is

AI Reel Builder is a guided coach that takes a small business owner from "I should post a Reel" to a published Instagram Reel, without video experience.

It does the parts owners find hardest: deciding what to say, writing it, planning the shots, and remembering every step. The owner supplies what software can't: their face, their shop, their product, and 15–30 minutes with a phone.

**It is not a video editor.** Filming happens on the owner's phone, and editing in a free app they already have (Instagram Edits, CapCut, InShot). AI Reel Builder plans the Reel and walks them through making and posting it.

Owners who **already have a video** can skip the planning: the app checks the video is ready for Instagram, writes the caption and hashtags, helps pick a cover, and walks them through posting.

## 2. Who it's for

### Primary user: the time-poor small business owner

- Runs a local or small online business with 1–10 staff: a bakery, salon, auto repair shop, boutique, florist, coffee shop, or trades business.
- Knows they *should* post Reels because customers find businesses on Instagram, but posts rarely or never.
- **Not technical.** Comfortable with Instagram as a user, not with editing software or marketing jargon.
- Has little time, so a Reel must fit around running the business.
- Budget-conscious: won't pay for an agency, and is wary of subscriptions until they see results.
- Often plans on a laptop in the evening but films and posts on a phone.

### What they need

1. "Tell me what to post."
2. "Write it for me in a way that sounds like my business."
3. "Tell me exactly what to film."
4. "Don't let me lose my work or forget a step."
5. "Help me do this again next week without starting from scratch."

### Not the target (for now)

- Creators and agencies who already edit video.
- Brands that need team approvals or scheduling across many accounts.
- Anyone expecting the app to produce a finished video file automatically.

## 3. Product principles

1. **Plain language.** No marketing or video jargon without an explanation. Tips are written for a first-timer.
2. **One clear next step.** Every screen has one obvious primary action.
3. **Never lose work.** Everything saves automatically, and the user can always resume where they stopped.
4. **Phone-first for doing, laptop-friendly for planning.** Filming and posting steps must work well one-handed on a phone.
5. **Sound like the business, not like AI.** Generated text should be specific to the business and easy to tweak.
6. **Honest about automation.** Never imply something was generated, saved or posted when it wasn't.

## 4. The core workflow

"New Reel" first asks which of two paths to take: **Plan a new Reel with help** or **Post a video I already have**. Both end with the same Review and Publish steps, and both Reels appear together on the dashboard (own-video Reels carry an "Own video" label and their cover).

### Path 1: Plan a new Reel with help

Seven steps, all built. The status column shows how real each step is today.

| # | Step | What the user does | Status today |
|---|---|---|---|
| 1 | **Idea** | Enters topic, audience, tone, length, call to action | ✅ Works |
| 2 | **Script** | Reviews and edits hook, script, CTA, caption, hashtags | ⚠️ UI works; content is template text, not real AI |
| 3 | **Voice** | Picks a voice and generates a voiceover | ⚠️ Simulated; no audio file is produced |
| 4 | **Scenes** | Reviews and edits a shot list with durations | ⚠️ UI works; scenes are generic and not linked to the script |
| 5 | **Build** | Ticks off script, voice, visuals, captions and music | ✅ Works as a checklist; no help for captions or music |
| 6 | **Review** | Checks everything, marks Ready to Publish | ✅ Works |
| 7 | **Publish** | Follows posting steps with copy buttons, marks Published | ✅ Works |

### Path 2: Post a video I already have

For owners who already filmed something and only need help getting it posted. Five steps, all built.

| # | Step | What the user does | Status today |
|---|---|---|---|
| 1 | **Video** | Picks the video from their phone; sees plain-language checks for shape (9:16), length (Instagram's limit) and quality; describes the video in one sentence, plus audience, tone and call to action | ✅ Works. The video is read in the browser and never uploaded. Videos the browser can't play (e.g. iPhone HEVC in Chrome) fall back to typing the length |
| 2 | **Caption** | Reviews and edits the caption and hashtags | ⚠️ UI works; caption is template text, not real AI |
| 3 | **Cover** | Scrubs to a frame, adds optional cover text, saves a full-size cover image | ✅ Works when the browser can play the video; otherwise the owner picks the cover in Instagram |
| 4 | **Review** | Checks video details, cover, caption and hashtags | ✅ Works |
| 5 | **Publish** | Posting steps starting with "Find your video in your camera roll" | ✅ Works |

Only the video's details and a small cover preview are saved. If the owner comes back later, they choose the video again to change the cover.

Around the wizard: a dashboard with status counts and a resume card, a searchable list of Reels, four statuses (Draft → In Progress → Ready to Publish → Published), dark mode, and a mobile layout.

## 5. How we'll know it's working

| Measure | Why it matters |
|---|---|
| **% of started Reels that reach Published** | The core promise: a finished Reel, not a half-finished plan |
| **Time from idea to Ready to Publish** | Must fit a busy owner's day; target under 30 minutes |
| **% of users who publish a second Reel within 30 days** | Shows the app built a habit |
| **How much users edit generated scripts** | Heavy rewriting means the AI isn't sounding like the business |
| **Where users drop off in the wizard** | Points at the step that needs work |

None of these are tracked yet. They need accounts (P0) and privacy-respecting analytics.

## 6. Features still needed, in priority order

Items marked 💲 need a paid service or a new account. Per [CLAUDE.md](CLAUDE.md), get the owner's approval before setting these up.

### P0: Must have before real users

1. **Fix the data-loss and trust bugs.** Empty drafts still pile up when an owner picks a path and then leaves (opening "New Reel" without choosing no longer creates one); work is silently lost when browser storage is blocked; voice pause/resume is out of sync; the voice isn't flagged after script edits. Details are in HANDOFF.md. *Done when* none of these can be reproduced and each has a regression test.
2. **Accounts and private data.** 💲 Needs a Supabase project (the free tier is likely enough). Sign-in by emailed magic link, no passwords. Each owner sees only their own Reels, enforced by database security rules, not just the UI. *Done when* two test accounts can't see each other's Reels, and the open "demo" database policy is gone.
3. **Real AI writing.** 💲 Needs an AI API (pay per use). Replace the templates with a model call on a server, never exposing keys in the browser. The script must talk about the actual topic and fit the chosen length at about 2.5 spoken words per second. Hashtags should be specific (e.g. `#coldbrewcoffee #portlandcoffee`), not split words. *Done when* scripts for 10 varied sample businesses read as specific and on-length, and generation fails gracefully with a retry.
4. **Automated tests in the deploy pipeline.** End-to-end wizard test plus checks of the save logic, so `main` can't ship a broken wizard.

### P1: Make the output actually usable

5. **Business profile.** Set once: business name, type, city, Instagram handle, how they talk (brand voice), usual call to action, and a few facts customers love. Fed into every generation. This is the biggest lever for "sounds like my business", and it's cheap to build.
6. **Script linked to scenes.** Today the shot list is generic and separate from the script. Each scene should carry the script line spoken during it plus on-screen text, so the plan is one coherent story. *Done when* changing the script offers to update the scenes.
7. **Filming mode for phones.** A full-screen, scene-by-scene view to use while filming: what to shoot, the line to say (teleprompter-style), duration, and a framing tip. Tap "Done" to move to the next scene. This turns the plan into something usable on set.
8. **On-screen captions.** The checklist says "Captions Added" but the app doesn't help. Generate short overlay text per scene and offer a caption file (SRT) to import into editing apps.
9. **Real voiceover with download.** 💲 Text-to-speech service. Produce an MP3 the owner can download and drop into their editing app. Also offer a free **"record my own voice"** option. Many owners will want their real voice, and it costs nothing to run.
10. **Send to phone.** Owners plan on a laptop and film on a phone. Give them an easy way to open the same Reel on their phone (with accounts, just sign in there), plus a printable or shareable shot list.

### P2: Bring them back every week

11. **"What should I post?" ideas.** Suggest topics based on business type, season, and upcoming holidays. Solves the blank-page problem before Step 1.
12. **Duplicate and templates.** Start a new Reel from a past one or from proven formats (behind the scenes, before/after, 3 tips, customer story, new product).
13. **Posting reminders.** 💲 May need an email service. A weekly nudge ("You haven't posted in 10 days, here are 3 ideas"), with a simple content calendar.
14. **Learn from results.** After publishing, the owner pastes the Reel link and enters views and likes from Instagram. Show which topics and tones work best, and use that to guide future suggestions.
15. **Music guidance.** Explain how to pick a trending sound inside Instagram and what mood fits the Reel. Advice only, since the app can't license music.

### Later or out of scope (deliberately)

- **In-app video editing or automatic video rendering.** Very large to build, and free phone apps already do it well.
- **Posting directly to Instagram.** Needs an Instagram Business account and Meta app review. Revisit once there are real users.
- **TikTok and YouTube Shorts.** The same vertical video works there. A cheap first step is "Also post to…" checklist items; full support comes later.
- **Teams, approvals, agencies, billing.** Only after the single-owner experience is proven.

## 7. Open questions for the owner

1. **Business model:** free, freemium (e.g. 3 Reels/month free), or a subscription? This shapes how much AI and voice cost per user is acceptable.
2. **AI and voice providers and budget:** which services, and what monthly spend is acceptable while testing?
3. **Who are the first test users?** Real owners to try P0 and P1 would sharpen everything above.
4. **Should editing a Published Reel change its status?** Today it stays Published.
5. **Languages:** English only at first, or Spanish or others too?
