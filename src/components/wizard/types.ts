import type { StepSlug, WizardPath } from '@/data/wizardPaths';
import type { Project, ProjectInput } from '@/types/project';

export interface StepProps {
  project: Project;
  update: (patch: ProjectInput) => void;
  /** This project's path (steps, publishing steps, review layout). */
  path: WizardPath;
  /** Navigate to a step on this path, unlocking it if needed. */
  goTo: (slug: StepSlug) => void;
  /** The next / previous step on this path. Used by steps shared between paths. */
  goNext: () => void;
  goBack: () => void;
}
