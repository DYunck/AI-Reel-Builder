export type ProjectStatus = 'draft' | 'in_progress' | 'ready_to_publish' | 'published';

export interface ReelScript {
  hook: string;
  body: string;
  cta: string;
}

export interface Scene {
  id: string;
  description: string;
  visual: string;
  /** Duration in seconds. */
  duration: number;
}

export interface VoiceData {
  voice_id: string;
  generated_at: string;
  duration_seconds: number;
}

export type ChecklistKey = 'script' | 'voice' | 'visuals' | 'captions' | 'music';

export type VideoChecklist = Record<ChecklistKey, boolean>;

/**
 * Mirrors the `projects` table in supabase/schema.sql. Field names match the
 * database columns so rows can be saved and loaded without mapping.
 */
export interface Project {
  id: string;
  /** The Reel topic. */
  title: string;
  audience: string;
  tone: string;
  /** Target video length in seconds. */
  length: number;
  script: ReelScript | null;
  caption: string;
  hashtags: string[];
  status: ProjectStatus;
  created_at: string;

  call_to_action: string;
  /** Furthest wizard step the user has reached (1-7). */
  current_step: number;
  voice: VoiceData | null;
  scenes: Scene[];
  checklist: VideoChecklist;
  publish_checklist: boolean[];
  updated_at: string;
}

export type ProjectInput = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
