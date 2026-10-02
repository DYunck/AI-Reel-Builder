import type { Project, ProjectInput } from '@/types/project';

export interface StepProps {
  project: Project;
  update: (patch: ProjectInput) => void;
  /** Navigate to a wizard step (1-7), unlocking it if needed. */
  goTo: (step: number) => void;
}
