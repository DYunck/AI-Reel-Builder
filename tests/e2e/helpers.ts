import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';

export const FIXTURE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '.fixtures');
export const fixture = (name: string) => path.join(FIXTURE_DIR, name);

const STORAGE_KEY = 'arb-projects-v1';

// Loose shape of a stored project, for assertions.
export interface StoredProject {
  id: string;
  title: string;
  status: string;
  source?: string;
  current_step: number;
  caption: string;
  hashtags: string[];
  video?: {
    file_name: string;
    duration_seconds: number;
    width: number | null;
    height: number | null;
    playable: boolean;
    cover_image: string | null;
    cover_text: string;
    cover_time_seconds: number | null;
  } | null;
}

export async function storedProjects(page: Page): Promise<StoredProject[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), STORAGE_KEY);
}

export async function storedProject(page: Page, id: string): Promise<StoredProject> {
  const found = (await storedProjects(page)).find((p) => p.id === id);
  if (!found) throw new Error(`Project ${id} not in storage`);
  return found;
}

/** Project id from a wizard URL like /projects/<id>/<step>. */
export function projectIdFromUrl(page: Page): string {
  const match = new URL(page.url()).pathname.match(/\/projects\/([^/]+)/);
  if (!match) throw new Error(`Not a project URL: ${page.url()}`);
  return match[1];
}

/** Autosave waits 700ms after the last edit; give it time to land. */
export async function waitForSave(page: Page) {
  await expect(page.getByText('All changes saved')).toBeVisible();
}

export async function startOwnVideoReel(page: Page) {
  await page.goto('/');
  await page.getByRole('main').getByRole('link', { name: 'New Reel' }).first().click();
  await page.getByRole('button', { name: /Post a video I already have/ }).click();
  await page.waitForURL(/\/video$/);
  return projectIdFromUrl(page);
}

export async function pickVideo(page: Page, name: string) {
  await page.locator('input[type="file"]').setInputFiles(fixture(name));
}

/**
 * Compares against the configured viewport, not window.innerWidth: in mobile
 * emulation the browser widens its layout to fit oversized content, so
 * innerWidth grows with the overflow and would hide it.
 */
export async function expectNoSidewaysScroll(page: Page) {
  const viewportWidth = page.viewportSize()!.width;
  const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(contentWidth, 'page should not scroll sideways').toBeLessThanOrEqual(viewportWidth);
}

/** Width and height from a JPEG's SOF marker. */
export function jpegSize(bytes: Buffer): { width: number; height: number } {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Not a JPEG');
  let i = 2;
  while (i < bytes.length) {
    const marker = bytes[i + 1];
    const length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  throw new Error('No JPEG size found');
}

/** Click a step in whichever progress bar is showing (full stepper on desktop, compact bar on phones). */
export async function openStep(page: Page, title: string) {
  const desktop = page.getByRole('navigation', { name: 'Progress' }).locator('ol').getByRole('button', { name: title });
  if (await desktop.isVisible()) await desktop.click();
  else await page.getByRole('button', { name: new RegExp(`^Go to step \\d+: ${title}$`) }).click();
  await page.waitForURL(new RegExp(`/${title.toLowerCase()}$`));
}

/** A Reel's card on the dashboard or My Reels (not the dashboard's resume banner). */
export function reelCard(page: Page, id: string) {
  return page.locator(`a[href$="/projects/${id}"]`).filter({ has: page.locator('h3') });
}

/** The visible "Dashboard" link (sidebar on desktop, back link inside the wizard). */
export function dashboardLink(page: Page) {
  return page.getByRole('link', { name: 'Dashboard' }).filter({ visible: true }).first();
}
