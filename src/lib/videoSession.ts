/**
 * Keeps the owner's chosen video file available while they move between wizard
 * steps (Video → Caption → Cover), without uploading or storing it anywhere.
 *
 * Object URLs are released when a different file replaces this one, when the
 * owner leaves the Reel (WizardPage unmount), and when the page is closed.
 * After that the file is gone, and the owner chooses it again to change the cover.
 */

interface SessionVideo {
  file: File;
  url: string;
}

const sessions = new Map<string, SessionVideo>();

export function getSessionVideo(projectId: string): SessionVideo | undefined {
  return sessions.get(projectId);
}

export function setSessionVideo(projectId: string, file: File): SessionVideo {
  clearSessionVideo(projectId);
  const entry = { file, url: URL.createObjectURL(file) };
  sessions.set(projectId, entry);
  return entry;
}

export function clearSessionVideo(projectId: string) {
  const entry = sessions.get(projectId);
  if (entry) {
    URL.revokeObjectURL(entry.url);
    sessions.delete(projectId);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    for (const id of Array.from(sessions.keys())) clearSessionVideo(id);
  });
}
