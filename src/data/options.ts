import type { ChecklistKey, ProjectStatus } from '@/types/project';

export const TONES = [
  { value: 'Friendly', description: 'Warm and approachable, like talking to a regular customer' },
  { value: 'Professional', description: 'Polished, credible and to the point' },
  { value: 'Energetic', description: 'Upbeat, fast and exciting' },
  { value: 'Funny', description: 'Playful and light-hearted' },
  { value: 'Inspirational', description: 'Story-driven and motivating' },
  { value: 'Educational', description: 'Clear tips that teach something useful' },
] as const;

export const LENGTHS = [
  { value: 15, label: '15 seconds', hint: 'Quick teaser' },
  { value: 30, label: '30 seconds', hint: 'Most popular' },
  { value: 45, label: '45 seconds', hint: 'Short story' },
  { value: 60, label: '60 seconds', hint: 'Tutorial / deep dive' },
  { value: 90, label: '90 seconds', hint: 'Maximum detail' },
] as const;

export const VOICES = [
  { id: 'ava', name: 'Ava', description: 'Warm, friendly female', pitch: 1.1, rate: 1 },
  { id: 'marcus', name: 'Marcus', description: 'Confident, deep male', pitch: 0.8, rate: 0.95 },
  { id: 'sofia', name: 'Sofia', description: 'Bright, energetic female', pitch: 1.25, rate: 1.1 },
  { id: 'leo', name: 'Leo', description: 'Calm, trustworthy male', pitch: 0.95, rate: 0.9 },
  { id: 'nova', name: 'Nova', description: 'Neutral, modern narrator', pitch: 1, rate: 1.05 },
] as const;

export const STATUS_META: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  ready_to_publish: {
    label: 'Ready to Publish',
    className: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    dot: 'bg-sky-500',
  },
  published: {
    label: 'Published',
    className:
      'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
};

export const VIDEO_CHECKLIST: { key: ChecklistKey; label: string; tip: string }[] = [
  {
    key: 'script',
    label: 'Script Created',
    tip: 'Your hook, main script and call to action are written and approved.',
  },
  {
    key: 'voice',
    label: 'Voice Created',
    tip: 'Record or generate the voiceover. Use a quiet room if recording yourself.',
  },
  {
    key: 'visuals',
    label: 'Visuals Created',
    tip: 'Film each scene in your plan vertically (9:16). Natural window light works great.',
  },
  {
    key: 'captions',
    label: 'Captions Added',
    tip: 'Add on-screen text. Most people watch Reels with the sound off.',
  },
  {
    key: 'music',
    label: 'Music Added',
    tip: 'Pick a trending sound in Instagram, or a royalty-free track. Keep it quieter than the voice.',
  },
];

export const PUBLISH_STEPS = [
  {
    title: 'Export Video',
    description:
      'In your editing app (CapCut, InShot, or Instagram Edits), export as 1080 x 1920 (vertical 9:16), MP4, 30fps.',
  },
  {
    title: 'Upload to Instagram',
    description: 'Open Instagram, tap the + button, choose Reel, then select your exported video from your camera roll.',
  },
  {
    title: 'Paste Caption',
    description: 'Tap "Copy caption" below, then paste it into the caption box on Instagram.',
  },
  {
    title: 'Add Hashtags',
    description: 'Tap "Copy hashtags" below and paste them at the end of your caption.',
  },
  {
    title: 'Publish Reel',
    description: 'Choose a cover image, tap Share, then come back here and mark your Reel as published.',
  },
] as const;

export const WIZARD_STEPS = [
  { number: 1, slug: 'idea', title: 'Idea', description: 'Tell us about your Reel' },
  { number: 2, slug: 'script', title: 'Script', description: 'Review your script' },
  { number: 3, slug: 'voice', title: 'Voice', description: 'Generate a voiceover' },
  { number: 4, slug: 'scenes', title: 'Scenes', description: 'Plan your shots' },
  { number: 5, slug: 'build', title: 'Build', description: 'Assemble your video' },
  { number: 6, slug: 'review', title: 'Review', description: 'Final check' },
  { number: 7, slug: 'publish', title: 'Publish', description: 'Post to Instagram' },
] as const;

export type WizardStepSlug = (typeof WIZARD_STEPS)[number]['slug'];
