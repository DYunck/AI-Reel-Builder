import type { ComponentType } from 'react';
import type { StepSlug } from '@/data/wizardPaths';
import type { StepProps } from '@/components/wizard/types';
import { IdeaIntakeStep } from '@/components/wizard/steps/IdeaIntakeStep';
import { ScriptStep } from '@/components/wizard/steps/ScriptStep';
import { VoiceStep } from '@/components/wizard/steps/VoiceStep';
import { ScenePlannerStep } from '@/components/wizard/steps/ScenePlannerStep';
import { VideoChecklistStep } from '@/components/wizard/steps/VideoChecklistStep';
import { FinalReviewStep } from '@/components/wizard/steps/FinalReviewStep';
import { PublishStep } from '@/components/wizard/steps/PublishStep';
import { VideoStep } from '@/components/wizard/steps/VideoStep';
import { CaptionStep } from '@/components/wizard/steps/CaptionStep';
import { CoverStep } from '@/components/wizard/steps/CoverStep';

/** Screen for each step. Paths list which steps they use in data/wizardPaths.ts. */
export const STEP_COMPONENTS: Record<StepSlug, ComponentType<StepProps>> = {
  idea: IdeaIntakeStep,
  script: ScriptStep,
  voice: VoiceStep,
  scenes: ScenePlannerStep,
  build: VideoChecklistStep,
  review: FinalReviewStep,
  publish: PublishStep,
  video: VideoStep,
  caption: CaptionStep,
  cover: CoverStep,
};
