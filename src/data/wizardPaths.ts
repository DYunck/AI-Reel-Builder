/**
 * Wizard paths: each way of making a Reel has its own list of steps, publishing
 * instructions and review layout. Everything that walks the wizard (step locking,
 * resume, progress bars, dashboard cards) reads the project's path from here.
 *
 * To add a path: add a ProjectSource value (types/project.ts + schema.sql check),
 * add an entry to WIZARD_PATHS, and register any new step screens in
 * components/wizard/stepComponents.ts.
 */
import type { Project, ProjectSource } from '@/types/project';

export type StepSlug =
  | 'idea'
  | 'script'
  | 'voice'
  | 'scenes'
  | 'build'
  | 'review'
  | 'publish'
  | 'video'
  | 'caption'
  | 'cover';

export interface WizardStepDef {
  slug: StepSlug;
  title: string;
  /** Shown as "Next: …" on the dashboard resume card. */
  description: string;
}

export type PublishStepKey = 'export' | 'find' | 'upload' | 'caption' | 'hashtags' | 'publish';

export interface PublishStepDef {
  key: PublishStepKey;
  title: string;
  description: string;
}

/** Sections the Review step shows, in order. */
export type ReviewSection = 'buildChecklist' | 'script' | 'scenes' | 'video' | 'caption' | 'hashtags';

export interface WizardPath {
  source: ProjectSource;
  /** Short label for cards, e.g. "Own video". Empty for the default path. */
  badge: string;
  /** What `title` means on this path, for the Review summary. */
  titleLabel: string;
  steps: readonly WizardStepDef[];
  publishSteps: readonly PublishStepDef[];
  review: readonly ReviewSection[];
  /** Where Review's "Edit" buttons send the owner. */
  editStep: Partial<Record<'script' | 'scenes' | 'caption' | 'video' | 'cover' | 'build', StepSlug>>;
}

const UPLOAD_AND_POST: readonly PublishStepDef[] = [
  {
    key: 'caption',
    title: 'Paste Caption',
    description: 'Tap "Copy caption" below, then paste it into the caption box on Instagram.',
  },
  {
    key: 'hashtags',
    title: 'Add Hashtags',
    description: 'Tap "Copy hashtags" below and paste them at the end of your caption.',
  },
];

export const WIZARD_PATHS: Record<ProjectSource, WizardPath> = {
  plan: {
    source: 'plan',
    badge: '',
    titleLabel: 'Topic',
    steps: [
      { slug: 'idea', title: 'Idea', description: 'Tell us about your Reel' },
      { slug: 'script', title: 'Script', description: 'Review your script' },
      { slug: 'voice', title: 'Voice', description: 'Generate a voiceover' },
      { slug: 'scenes', title: 'Scenes', description: 'Plan your shots' },
      { slug: 'build', title: 'Build', description: 'Assemble your video' },
      { slug: 'review', title: 'Review', description: 'Final check' },
      { slug: 'publish', title: 'Publish', description: 'Post to Instagram' },
    ],
    publishSteps: [
      {
        key: 'export',
        title: 'Export Video',
        description:
          'In your editing app (CapCut, InShot, or Instagram Edits), export as 1080 x 1920 (vertical 9:16), MP4, 30fps.',
      },
      {
        key: 'upload',
        title: 'Upload to Instagram',
        description:
          'Open Instagram, tap the + button, choose Reel, then select your exported video from your camera roll.',
      },
      ...UPLOAD_AND_POST,
      {
        key: 'publish',
        title: 'Publish Reel',
        description: 'Choose a cover image, tap Share, then come back here and mark your Reel as published.',
      },
    ],
    review: ['buildChecklist', 'script', 'scenes', 'caption', 'hashtags'],
    editStep: { script: 'script', scenes: 'scenes', caption: 'script', build: 'build' },
  },
  existing: {
    source: 'existing',
    badge: 'Own video',
    titleLabel: 'About the video',
    steps: [
      { slug: 'video', title: 'Video', description: 'Check your video' },
      { slug: 'caption', title: 'Caption', description: 'Write your caption' },
      { slug: 'cover', title: 'Cover', description: 'Pick a cover' },
      { slug: 'review', title: 'Review', description: 'Final check' },
      { slug: 'publish', title: 'Publish', description: 'Post to Instagram' },
    ],
    publishSteps: [
      {
        key: 'find',
        title: 'Find your video in your camera roll',
        description: 'Make sure the video you checked here is on your phone, in your camera roll or files.',
      },
      {
        key: 'upload',
        title: 'Upload to Instagram',
        description: 'Open Instagram, tap the + button, choose Reel, then select your video.',
      },
      ...UPLOAD_AND_POST,
      {
        key: 'publish',
        title: 'Publish Reel',
        description:
          'Tap "Edit cover" to set your cover, tap Share, then come back here and mark your Reel as published.',
      },
    ],
    review: ['video', 'caption', 'hashtags'],
    editStep: { caption: 'caption', video: 'video', cover: 'cover' },
  },
};

export function getWizardPath(project: Pick<Project, 'source'>): WizardPath {
  return WIZARD_PATHS[project.source ?? 'plan'] ?? WIZARD_PATHS.plan;
}

/** 1-based position of a step in the path, or 0 if the path doesn't have it. */
export function stepNumber(path: WizardPath, slug: string): number {
  return path.steps.findIndex((s) => s.slug === slug) + 1;
}

/** The step at a 1-based position, clamped to the path's length. */
export function stepAt(path: WizardPath, n: number): WizardStepDef {
  return path.steps[Math.max(1, Math.min(path.steps.length, n)) - 1];
}
