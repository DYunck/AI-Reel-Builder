import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { dashboardLink, jpegSize, openStep, pickVideo, startOwnVideoReel, storedProject, waitForSave } from './helpers';

const check = (page: Page, id: 'shape' | 'length' | 'quality') =>
  page.getByTestId('video-details').locator(`[data-check="${id}"]`);

async function describeVideo(page: Page) {
  await page.getByLabel(/What happens in the video/).fill('Customer reacting to her new haircut');
  await page.getByLabel(/Audience/).fill('Women in our neighborhood');
  await page.getByText('Energetic', { exact: true }).click();
  await page.getByLabel('Call To Action').fill('Book at the link in our bio');
}

test('vertical video: full path to Published, and everything is kept after reload', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await expect(page.getByText('Step 1 of 5: Video')).toBeAttached();
  expect((await storedProject(page, id)).status).toBe('draft');

  await pickVideo(page, 'vertical.webm');
  await expect(page.getByTestId('video-details')).toContainText('vertical.webm');
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'ok');
  await expect(check(page, 'length')).toHaveAttribute('data-level', 'ok');
  await expect(check(page, 'quality')).toHaveAttribute('data-level', 'ok');
  await expect(page.getByTestId('video-details')).toContainText('0:06');

  await describeVideo(page);
  await page.getByRole('button', { name: 'Write My Caption' }).click();

  // Caption step
  await page.waitForURL(/\/caption$/);
  const caption = page.getByLabel('Instagram Caption');
  await expect(caption).toHaveValue(/customer reacting to her new haircut/i);
  await expect(caption).toHaveValue(/Book at the link in our bio\./);
  await expect(page.getByRole('button', { name: /^Remove #/ }).first()).toBeVisible();
  await caption.fill(`${await caption.inputValue()}\n\nSee you soon!`);
  await expect(page.locator('h1 + span')).toHaveText('In Progress');
  await waitForSave(page);
  expect((await storedProject(page, id)).status).toBe('in_progress');
  await page.getByRole('button', { name: 'Continue to Cover' }).click();

  // Cover step
  await page.waitForURL(/\/cover$/);
  const slider = page.getByLabel('Moment to use as the cover');
  await expect(slider).toBeEnabled();
  await slider.fill('3');
  await page.getByRole('button', { name: 'Forward a little' }).click();
  await expect(page.getByText('0:03.5 of 0:06.0')).toBeVisible();
  await page.getByRole('button', { name: 'Use this frame' }).click();
  await expect(page.getByRole('img', { name: 'Your cover' })).toBeVisible();
  await page.getByLabel(/Cover text/).fill('Wait for her reaction');
  await expect(page.getByRole('img', { name: 'Your cover: Wait for her reaction' })).toBeVisible();
  await waitForSave(page);

  const saved = await storedProject(page, id);
  expect(saved.video?.cover_time_seconds).toBe(3.5);
  expect(saved.video?.cover_image).toMatch(/^data:image\/jpeg;base64,/);
  const coverBytes = saved.video!.cover_image!.length;
  test.info().annotations.push({ type: 'cover preview size', description: `${(coverBytes / 1024).toFixed(1)} KB` });
  console.log(`Cover preview data URL: ${(coverBytes / 1024).toFixed(1)} KB`);
  expect(coverBytes).toBeLessThan(80_000);

  // Full-size cover download: the video's own resolution.
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save full-size cover' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('reel-cover.jpg');
  expect(jpegSize(readFileSync((await download.path())!))).toEqual({ width: 720, height: 1280 });

  await page.getByRole('button', { name: 'Continue to Review' }).click();

  // Review: only what applies to this path
  await page.waitForURL(/\/review$/);
  await expect(page.getByRole('heading', { name: 'Your video' })).toBeVisible();
  await expect(page.getByText('About the video')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Scene Plan' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Script', exact: true })).toHaveCount(0);
  await expect(page.getByText('Still to do in your video')).toHaveCount(0);
  await expect(page.getByText(/slide to\s*0:04/)).toBeVisible();
  await page.getByRole('button', { name: 'Ready to Publish' }).click();

  // Publish
  await page.waitForURL(/\/publish$/);
  await expect(page.getByText('Find your video in your camera roll')).toBeVisible();
  await expect(page.getByText('Export Video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copy caption' })).toBeVisible();
  for (const title of ['Find your video in your camera roll', 'Upload to Instagram', 'Paste Caption', 'Add Hashtags', 'Publish Reel']) {
    await page.getByText(title, { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Mark as Published' }).click();
  await expect(page.getByText('Your Reel is live!')).toBeVisible();
  await waitForSave(page);

  // Reload: everything kept, including the cover.
  await page.reload();
  await expect(page.getByText('Your Reel is live!')).toBeVisible();
  const final = await storedProject(page, id);
  expect(final).toMatchObject({ status: 'published', source: 'existing', current_step: 5, title: 'Customer reacting to her new haircut' });
  expect(final.caption).toContain('See you soon!');
  expect(final.video).toMatchObject({ file_name: 'vertical.webm', width: 720, height: 1280, playable: true, cover_text: 'Wait for her reaction', cover_time_seconds: 3.5 });
  expect(final.video?.cover_image).toBe(saved.video?.cover_image);

  await openStep(page, 'Review');
  await expect(page.getByRole('img', { name: 'Your cover: Wait for her reaction' })).toBeVisible();
  await expect(page.getByText('See you soon!')).toBeVisible();

  // The file itself is gone after a reload: the cover step says how to change it.
  await openStep(page, 'Cover');
  await expect(page.getByText("Your video isn't open right now.")).toBeVisible();
  await expect(page.getByText('Choose your video again to change the cover.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Your cover: Wait for her reaction' })).toBeVisible();
});

test('horizontal video: shape warning with a tip on fixing it', async ({ page }) => {
  await startOwnVideoReel(page);
  await pickVideo(page, 'horizontal.webm');
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'warn');
  await expect(check(page, 'shape')).toContainText('sideways');
  await expect(check(page, 'shape')).toContainText('CapCut or Instagram Edits');
  // 1280x720: the short side is 720, which is fine.
  await expect(check(page, 'quality')).toHaveAttribute('data-level', 'ok');
});

test('low-resolution video: quality warning', async ({ page }) => {
  await startOwnVideoReel(page);
  await pickVideo(page, 'lowres.webm');
  await expect(check(page, 'quality')).toHaveAttribute('data-level', 'warn');
  await expect(check(page, 'quality')).toContainText('360 × 640');
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'ok');
});

test('video longer than the Reel limit: length warning', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'too-long.webm');
  await expect(check(page, 'length')).toHaveAttribute('data-level', 'warn');
  await expect(check(page, 'length')).toContainText('3-minute');
  await waitForSave(page);
  // The length column only allows 5-180s, so the real duration is kept in video.
  const saved = await storedProject(page, id);
  expect(saved.video?.duration_seconds).toBeCloseTo(190, 0);
  expect((saved as unknown as { length: number }).length).toBe(180);
});

test('phone video stored sideways with a rotation flag counts as vertical', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'rotated.mp4');
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'ok');
  await waitForSave(page);
  expect((await storedProject(page, id)).video).toMatchObject({ width: 720, height: 1280 });
});

test('video the browser cannot play: friendly message, manual length, cover skipped', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'iphone-hevc.mov');
  await expect(page.getByText("Your browser can't play this video here.")).toBeVisible();
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'unknown');

  await describeVideo(page);
  // Without a length, it asks for one instead of continuing.
  await page.getByRole('button', { name: 'Write My Caption' }).click();
  await expect(page.getByText('Enter how long your video is, in seconds.')).toBeVisible();
  await page.getByLabel(/How long is the video/).fill('45');
  await page.getByRole('button', { name: 'Write My Caption' }).click();

  await page.waitForURL(/\/caption$/);
  await page.getByRole('button', { name: 'Continue to Cover' }).click();
  await page.waitForURL(/\/cover$/);
  await expect(page.getByText(/can't show this video, so you can't pick a frame here/)).toBeVisible();
  await expect(page.getByLabel(/Cover text/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue to Review' }).click();
  await page.waitForURL(/\/review$/);
  await expect(page.locator('dl')).toContainText('0:45');

  const saved = await storedProject(page, id);
  expect(saved.video).toMatchObject({ playable: false, duration_seconds: 45, cover_image: null });
});

test('a file that is not a video: plain message, nothing saved', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'notes.txt');
  await expect(page.getByRole('alert')).toContainText("That file doesn't look like a video");
  await expect(page.getByTestId('video-details')).toHaveCount(0);
  expect((await storedProject(page, id)).video ?? null).toBeNull();
});

test('picking a different video replaces the first, and asks before losing a cover', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'vertical.webm');
  await expect(page.getByTestId('video-details')).toContainText('vertical.webm');
  await pickVideo(page, 'horizontal.webm');
  await expect(page.getByTestId('video-details')).toContainText('horizontal.webm');
  await expect(check(page, 'shape')).toHaveAttribute('data-level', 'warn');

  // Back to the vertical one, pick a cover, then try to switch.
  await pickVideo(page, 'vertical.webm');
  await describeVideo(page);
  await page.getByRole('button', { name: 'Write My Caption' }).click();
  await page.waitForURL(/\/caption$/);
  await page.getByRole('button', { name: 'Continue to Cover' }).click();
  await expect(page.getByLabel('Moment to use as the cover')).toBeEnabled();
  await page.getByRole('button', { name: 'Use this frame' }).click();
  await waitForSave(page);
  await openStep(page, 'Video');

  await pickVideo(page, 'horizontal.webm');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('Use this video instead?');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('video-details')).toContainText('vertical.webm');
  expect((await storedProject(page, id)).video?.cover_image).toBeTruthy();

  await pickVideo(page, 'horizontal.webm');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Use this video' }).click();
  await expect(page.getByTestId('video-details')).toContainText('horizontal.webm');
  await waitForSave(page);
  const saved = await storedProject(page, id);
  expect(saved.video).toMatchObject({ file_name: 'horizontal.webm', cover_image: null, cover_time_seconds: null });
});

test('video object URLs are released when no longer needed', async ({ page }) => {
  await page.addInitScript(() => {
    const live = new Set<string>();
    (window as unknown as { liveObjectUrls: Set<string> }).liveObjectUrls = live;
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (obj: Blob | MediaSource) => {
      const url = create(obj);
      if (obj instanceof File) live.add(url);
      return url;
    };
    URL.revokeObjectURL = (url: string) => {
      live.delete(url);
      revoke(url);
    };
  });
  const liveCount = () => page.evaluate(() => (window as unknown as { liveObjectUrls: Set<string> }).liveObjectUrls.size);

  await startOwnVideoReel(page);
  await pickVideo(page, 'vertical.webm');
  await expect(page.getByTestId('video-details')).toBeVisible();
  expect(await liveCount()).toBe(1);

  // Replacing the file releases the old URL.
  await pickVideo(page, 'horizontal.webm');
  await expect(page.getByTestId('video-details')).toContainText('horizontal.webm');
  expect(await liveCount()).toBe(1);

  // An unplayable file isn't kept at all.
  await pickVideo(page, 'iphone-hevc.mov');
  await expect(page.getByText("Your browser can't play this video here.")).toBeVisible();
  expect(await liveCount()).toBe(0);

  // Leaving the Reel releases it too.
  await pickVideo(page, 'vertical.webm');
  await expect(page.getByTestId('video-details')).toContainText('vertical.webm');
  expect(await liveCount()).toBe(1);
  await dashboardLink(page).click();
  await expect(page.getByText('Recent Reels')).toBeVisible();
  expect(await liveCount()).toBe(0);
});
