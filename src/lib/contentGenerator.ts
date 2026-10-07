/**
 * Mock content generator.
 *
 * Produces a script, caption, hashtags and scene plan from the idea intake
 * using templates, so the app works without an AI provider. To use a real
 * model, replace the bodies of `generateContent` and `generateScenes` with a
 * call to your backend (for example a Supabase Edge Function) that returns the
 * same shapes.
 */
import type { ReelScript, Scene } from '@/types/project';
import { sleep, uid } from '@/lib/utils';

export interface IdeaInput {
  title: string;
  audience: string;
  tone: string;
  length: number;
  call_to_action: string;
}

export interface GeneratedContent {
  script: ReelScript;
  caption: string;
  hashtags: string[];
}

const HOOKS: Record<string, ((topic: string, audience: string) => string)[]> = {
  Friendly: [
    (t) => `Can I let you in on a little secret about ${t}?`,
    (t, a) => `Hey ${a || 'friend'}! This one's for you: ${t}.`,
  ],
  Professional: [
    (t) => `Here is what most people get wrong about ${t}.`,
    (t, a) => `If you're ${a || 'serious about results'}, you need to know this about ${t}.`,
  ],
  Energetic: [
    (t) => `Stop scrolling! ${capitalize(t)} just got a whole lot better.`,
    (t) => `3... 2... 1... let's talk ${t}!`,
  ],
  Funny: [
    (t) => `Nobody asked, but here's my hot take on ${t}.`,
    (t) => `POV: you finally figured out ${t}.`,
  ],
  Inspirational: [
    (t) => `Every big story starts small. This is ours: ${t}.`,
    (t) => `What if ${t} could change your whole day?`,
  ],
  Educational: [
    (t) => `Three things you didn't know about ${t}.`,
    (t) => `Here's a quick lesson on ${t} in under a minute.`,
  ],
};

const BODY_POINTS: Record<string, string[]> = {
  Friendly: [
    'We started this because we genuinely love helping people like you.',
    'Here is the simple version: it saves you time, and it feels great.',
    'Our customers tell us it is the easiest part of their week.',
    'And honestly? It is a lot more fun than you would think.',
    'We keep it simple so you can focus on what matters to you.',
  ],
  Professional: [
    'First, focus on quality over quantity. It pays off long term.',
    'Second, small consistent improvements beat one big overhaul.',
    'Third, work with people who understand your specific needs.',
    'Our team has helped hundreds of clients get exactly this right.',
    'The result is less stress, better outcomes, and real value.',
  ],
  Energetic: [
    'It is fast. It is easy. And it actually works.',
    'You get more done in less time, every single day.',
    'Our customers are obsessed, and you will be too.',
    'No complicated setup, no waiting around, just results.',
    'This is the upgrade you did not know you needed!',
  ],
  Funny: [
    'Step one: pretend you have it all figured out.',
    'Step two: realize you absolutely do not.',
    'Step three: let us do the hard part while you take the credit.',
    'Side effects may include compliments and mild bragging.',
    'Your friends will ask how you did it. You do not have to tell them.',
  ],
  Inspirational: [
    'It started with a simple idea and a lot of late nights.',
    'Every day we show up for the people who believe in us.',
    'Because small businesses are built on big hearts.',
    'Every customer is a story, and yours matters to us.',
    'This is what happens when you do what you love.',
  ],
  Educational: [
    'Tip one: start with the basics and get them right every time.',
    'Tip two: little habits make the biggest difference over time.',
    'Tip three: ask an expert when you are not sure, it saves money later.',
    'Bonus: most problems are easy to prevent if you catch them early.',
    'Save this video so you have it when you need it.',
  ],
};

const SCENE_TEMPLATES: { description: (topic: string) => string; visual: string }[] = [
  { description: () => 'Hook: grab attention in the first second', visual: 'Close-up of your face or product, bold text overlay with the hook' },
  { description: (t) => `Introduce ${t}`, visual: 'Wide shot of your shop, workspace, or product in action' },
  { description: () => 'Show the main point or first tip', visual: 'Hands-on demo shot, filmed vertically in natural light' },
  { description: () => 'Show the second point with movement', visual: 'B-roll: slow pan or quick jump cuts of the process' },
  { description: () => 'Show the result or transformation', visual: 'Before/after split screen or happy customer reaction' },
  { description: () => 'Add a personal touch', visual: 'You talking to camera with a friendly smile' },
  { description: () => 'Build trust with social proof', visual: 'Screenshot of a review or a customer testimonial clip' },
  { description: () => 'Call to action', visual: 'Logo or storefront with the call to action as on-screen text' },
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lowercase the first letter so a topic reads naturally mid-sentence, but keep acronyms like "SEO". */
function midSentence(s: string) {
  return /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function slugTag(word: string) {
  return `#${word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')}`;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'for', 'with', 'how', 'why', 'what', 'your', 'our', 'my',
  'is', 'are', 'it', 'at', 'by', 'from', 'this', 'that', 'ways', 'way', 'one', 'new', 'who', 'you',
]);

function topicKeywords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()) && !/^\d+$/.test(w));
}

const TONE_TAGS: Record<string, string[]> = {
  Friendly: ['#communitylove'],
  Professional: ['#expertadvice'],
  Energetic: ['#mustsee'],
  Funny: ['#funnyreels'],
  Inspirational: ['#motivation'],
  Educational: ['#tipsandtricks'],
};

/** Up to 12 tags: a combined topic tag, topic and audience words, a tone tag, then general Reel tags. */
function buildHashtags(subject: string, audience: string, tone: string): string[] {
  const subjectWords = topicKeywords(subject);
  const comboTag = subjectWords.length >= 2 ? [slugTag(subjectWords.slice(-3).join(''))] : [];
  const keywordTags = [...comboTag, ...[...subjectWords, ...topicKeywords(audience)].slice(0, 4).map(slugTag)];
  return Array.from(
    new Set([...keywordTags, ...(TONE_TAGS[tone] ?? TONE_TAGS.Friendly), '#reels', '#smallbusiness', '#shoplocal', '#instagramreels']),
  ).slice(0, 12);
}

function normalizeCta(input: string): string {
  const cta = input.trim();
  return cta ? (/[.!?]$/.test(cta) ? cta : `${cta}.`) : 'Follow for more tips like this.';
}

export async function generateContent(input: IdeaInput): Promise<GeneratedContent> {
  await sleep(1400); // Simulate an AI request.

  const tone = HOOKS[input.tone] ? input.tone : 'Friendly';
  const rawTopic = input.title.trim().replace(/[.!?]+$/, '') || 'our business';
  const topic = midSentence(rawTopic);
  const audience = input.audience.trim();

  // ~2.5 spoken words per second; hook + CTA take roughly a third of the time.
  const bodySentences = Math.max(2, Math.min(5, Math.round(input.length / 15) + 1));
  const body = BODY_POINTS[tone].slice(0, bodySentences).join(' ');

  const cta = normalizeCta(input.call_to_action);
  const hook = pick(HOOKS[tone])(topic, audience);

  const caption = [
    `${capitalize(rawTopic)} ✨`,
    audience ? `Made for ${audience.charAt(0).toLowerCase()}${audience.slice(1)}.` : '',
    cta,
    'Drop a 💬 below and tell us what you think!',
  ]
    .filter(Boolean)
    .join('\n\n');

  const hashtags = buildHashtags(rawTopic, audience, tone);

  return { script: { hook, body, cta }, caption, hashtags };
}

export async function generateScenes(input: { title: string; length: number }): Promise<Scene[]> {
  await sleep(900);

  const count = Math.max(3, Math.min(SCENE_TEMPLATES.length, Math.round(input.length / 6)));
  // Always keep the hook first and the call to action last.
  const middle = SCENE_TEMPLATES.slice(1, -1).slice(0, count - 2);
  const templates = [SCENE_TEMPLATES[0], ...middle, SCENE_TEMPLATES[SCENE_TEMPLATES.length - 1]];

  const base = Math.floor(input.length / templates.length);
  let remainder = input.length - base * templates.length;

  return templates.map((t) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return { id: uid(), description: t.description(midSentence(input.title.trim()) || 'your business'), visual: t.visual, duration: base + extra };
  });
}

/** Mock text-to-speech: pretends to render audio and reports its length. */
export async function generateVoice(text: string, voiceId: string) {
  await sleep(1800);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    voice_id: voiceId,
    generated_at: new Date().toISOString(),
    duration_seconds: Math.max(3, Math.round(words / 2.5)),
  };
}

// ---------------------------------------------------------------------------
// Own-video path
// ---------------------------------------------------------------------------

export interface VideoCaptionInput {
  /** One sentence from the owner, e.g. "customer reacting to her new haircut". */
  description: string;
  audience: string;
  tone: string;
  call_to_action: string;
  duration_seconds: number;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
}

const VIDEO_OPENERS: Record<string, ((d: string) => string)[]> = {
  Friendly: [(d) => `We just had to share this: ${d} 💛`, (d) => `A little moment from our day: ${d} 😊`],
  Professional: [(d) => `A closer look at our work: ${d}.`, (d) => `Behind the scenes: ${d}.`],
  Energetic: [(d) => `You need to see this: ${d}! 🔥`, (d) => `Sound on! ${capitalize(d)}! 🎉`],
  Funny: [(d) => `Nobody was ready for this: ${d} 😂`, (d) => `POV: ${d} 😅`],
  Inspirational: [
    (d) => `Moments like this are why we do what we do: ${d}. ✨`,
    (d) => `Every day starts with small moments like this: ${d}. ✨`,
  ],
  Educational: [(d) => `Watch closely: ${d}. Here's what's happening 👇`, (d) => `Quick look: ${d}. Save this for later 📌`],
};

/** Mock caption writer for a video the owner already has. Same shape a real AI call should return. */
export async function generateVideoCaption(input: VideoCaptionInput): Promise<GeneratedCaption> {
  await sleep(1200); // Simulate an AI request.

  const tone = VIDEO_OPENERS[input.tone] ? input.tone : 'Friendly';
  const rawDescription = input.description.trim().replace(/[.!?]+$/, '') || 'a moment from our business';
  const audience = input.audience.trim();

  const lengthLine =
    input.duration_seconds > 0 && input.duration_seconds <= 15
      ? 'Watch till the end 👀'
      : input.duration_seconds > 60
        ? 'Save this so you can come back to it 📌'
        : '';

  const caption = [
    pick(VIDEO_OPENERS[tone])(midSentence(rawDescription)),
    lengthLine,
    audience ? `Made for ${audience.charAt(0).toLowerCase()}${audience.slice(1)}.` : '',
    normalizeCta(input.call_to_action),
    'Tell us what you think in the comments 💬',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { caption, hashtags: buildHashtags(rawDescription, audience, tone) };
}
