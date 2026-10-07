export type ProjectStatus = 'draft' | 'in_progress' | 'ready_to_publish' | 'published';

/** How the Reel is being made: planned from scratch, or from a video the owner already has. */
export type ProjectSource = 'plan' | 'existing';

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

/**
 * Details of the owner's own video (source = 'existing'). The video file itself is
 * never stored: only what we read from it in the browser, plus a small cover preview.
 */
export interface VideoInfo {
  file_name: string;
  mime_type: string;
  size_bytes: number;
  /** Read from the file, or typed in by the owner when the browser can't play it. */
  duration_seconds: number;
  /** Display size after rotation. Null when the browser couldn't read the picture. */
  width: number | null;
  height: number | null;
  /** False when this browser couldn't play the file (e.g. HEVC .mov in Chrome). */
  playable: boolean;
  /** Small JPEG data URL (about 360px wide) of the chosen frame, without cover text. */
  cover_image: string | null;
  cover_text: string;
  cover_time_seconds: number | null;
}

export type ChecklistKey = 'script' | 'voice' | 'visuals' | 'captions' | 'music';

export type VideoChecklist = Record<ChecklistKey, boolean>;

/**
 * Mirrors the `projects` table in supabase/schema.sql. Field names match the
 * database columns so rows can be saved and loaded without mapping.
 */
export interface Project {
  id: string;
  /** The Reel topic, or for an own-video Reel, the one-sentence description of the video. */
  title: string;
  audience: string;
  tone: string;
  /** Target video length in seconds (5-180). For an own-video Reel, the real length, clamped. */
  length: number;
  script: ReelScript | null;
  caption: string;
  hashtags: string[];
  status: ProjectStatus;
  created_at: string;

  call_to_action: string;
  /** Furthest wizard step reached, counted in this project's own step list (see wizardPaths). */
  current_step: number;
  voice: VoiceData | null;
  scenes: Scene[];
  checklist: VideoChecklist;
  publish_checklist: boolean[];
  updated_at: string;

  /** Missing on Reels saved before this column existed; treat missing as 'plan'. */
  source?: ProjectSource;
  video?: VideoInfo | null;
}

export type ProjectInput = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
