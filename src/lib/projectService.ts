/**
 * Project persistence.
 *
 * Uses Supabase when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set,
 * otherwise falls back to the browser's localStorage (demo mode) seeded
 * with sample projects. Both backends expose the same API.
 */
import { createMockProjects } from '@/data/mockProjects';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { uid } from '@/lib/utils';
import type { Project, ProjectInput } from '@/types/project';

export interface ProjectService {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  create(input?: ProjectInput): Promise<Project>;
  update(id: string, patch: ProjectInput): Promise<Project>;
  remove(id: string): Promise<void>;
}

export function newProjectDefaults(): Omit<Project, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: '',
    audience: '',
    tone: 'Friendly',
    length: 30,
    call_to_action: '',
    script: null,
    caption: '',
    hashtags: [],
    status: 'draft',
    current_step: 1,
    voice: null,
    scenes: [],
    checklist: { script: false, voice: false, visuals: false, captions: false, music: false },
    publish_checklist: [false, false, false, false, false],
  };
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const TABLE = 'projects';

const supabaseService: ProjectService = {
  async list() {
    const { data, error } = await supabase!.from(TABLE).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  },
  async get(id) {
    const { data, error } = await supabase!.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Project) ?? null;
  },
  async create(input = {}) {
    const { data, error } = await supabase!
      .from(TABLE)
      .insert({ ...newProjectDefaults(), ...input })
      .select('*')
      .single();
    if (error) throw error;
    return data as Project;
  },
  async update(id, patch) {
    const { data, error } = await supabase!.from(TABLE).update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return data as Project;
  },
  async remove(id) {
    const { error } = await supabase!.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// localStorage (demo mode)
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'arb-projects-v1';

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    // Corrupt or unavailable storage: fall through to seed data.
  }
  const seeded = createMockProjects();
  writeAll(seeded);
  return seeded;
}

function writeAll(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Storage full or blocked (e.g. private mode). Data lives for this session only.
  }
}

const byUpdatedDesc = (a: Project, b: Project) => b.updated_at.localeCompare(a.updated_at);

const localService: ProjectService = {
  async list() {
    return readAll().sort(byUpdatedDesc);
  },
  async get(id) {
    return readAll().find((p) => p.id === id) ?? null;
  },
  async create(input = {}) {
    const now = new Date().toISOString();
    const project: Project = { ...newProjectDefaults(), ...input, id: uid(), created_at: now, updated_at: now };
    writeAll([project, ...readAll()]);
    return project;
  },
  async update(id, patch) {
    const all = readAll();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');
    const updated: Project = { ...all[index], ...patch, id, updated_at: new Date().toISOString() };
    all[index] = updated;
    writeAll(all);
    return updated;
  },
  async remove(id) {
    writeAll(readAll().filter((p) => p.id !== id));
  },
};

export function resetDemoData() {
  writeAll(createMockProjects());
}

export const projectService: ProjectService = isSupabaseConfigured ? supabaseService : localService;
