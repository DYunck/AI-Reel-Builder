import { expect, test } from '@playwright/test';
import { expectNoSidewaysScroll, pickVideo, startOwnVideoReel, storedProject, waitForSave } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('own-video path works at phone width, including the frame picker', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await expect(page.getByText('Step 1 of 5: Video')).toBeVisible();
  await expectNoSidewaysScroll(page);

  await pickVideo(page, 'vertical.webm');
  await expect(page.getByTestId('video-details')).toBeVisible();
  await page.getByLabel(/What happens in the video/).fill('Fresh croissants coming out of the oven');
  await page.getByLabel(/Audience/).fill('Morning commuters');
  await expectNoSidewaysScroll(page);
  await page.screenshot({ path: test.info().outputPath('mobile-video.png'), fullPage: true });
  await page.getByRole('button', { name: 'Write My Caption' }).click();

  await page.waitForURL(/\/caption$/);
  await expect(page.getByText('Step 2 of 5: Caption')).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.getByRole('button', { name: 'Continue to Cover' }).click();

  // Frame picker: slider and nudge buttons must fit and work on a phone.
  await page.waitForURL(/\/cover$/);
  const slider = page.getByLabel('Moment to use as the cover');
  await expect(slider).toBeEnabled();
  for (const control of [slider, page.getByRole('button', { name: 'Back a little' }), page.getByRole('button', { name: 'Forward a little' })]) {
    const box = await control.boundingBox();
    expect(box, 'control should be on screen').not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.height, 'big enough to tap').toBeGreaterThanOrEqual(32);
  }
  await slider.fill('2');
  await page.getByRole('button', { name: 'Back a little' }).tap();
  await expect(page.getByText('0:01.5 of 0:06.0')).toBeVisible();
  await page.getByRole('button', { name: 'Use this frame' }).tap();
  await page.getByLabel(/Cover text/).fill('Still warm');
  await expect(page.getByRole('img', { name: 'Your cover: Still warm' })).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.screenshot({ path: test.info().outputPath('mobile-cover.png'), fullPage: true });
  await page.getByRole('button', { name: 'Continue to Review' }).click();

  await page.waitForURL(/\/review$/);
  await expectNoSidewaysScroll(page);
  await page.screenshot({ path: test.info().outputPath('mobile-review.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ready to Publish' }).click();

  await page.waitForURL(/\/publish$/);
  await expectNoSidewaysScroll(page);
  for (const title of ['Find your video in your camera roll', 'Upload to Instagram', 'Paste Caption', 'Add Hashtags', 'Publish Reel']) {
    await page.getByText(title, { exact: true }).tap();
  }
  await page.getByRole('button', { name: 'Mark as Published' }).tap();
  await expect(page.getByText('Your Reel is live!')).toBeVisible();
  await waitForSave(page);
  expect(await storedProject(page, id)).toMatchObject({ status: 'published', video: { cover_text: 'Still warm', cover_time_seconds: 1.5 } });

  // Dashboard card with the "Own video" label and cover thumbnail fits too.
  await page.goto('/');
  await expect(page.getByText('Recent Reels')).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.screenshot({ path: test.info().outputPath('mobile-dashboard.png'), fullPage: true });
});

test('choice screen fits at phone width', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).tap();
  await page.getByRole('link', { name: 'New Reel' }).first().tap();
  await page.waitForURL(/\/projects\/new$/);
  // The menu closes on navigation; wait for its slide-out to finish.
  await expect(page.locator('aside')).toHaveClass(/-translate-x-full/);
  await page.waitForTimeout(300);
  await expect(page.getByRole('button', { name: /Plan a new Reel with help/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Post a video I already have/ })).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.screenshot({ path: test.info().outputPath('mobile-choice.png'), fullPage: true });
});
