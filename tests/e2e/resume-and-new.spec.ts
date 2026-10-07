import { expect, test } from '@playwright/test';
import { dashboardLink, pickVideo, reelCard, startOwnVideoReel, storedProject, storedProjects, waitForSave } from './helpers';

test('leaving an own-video Reel mid-way and reopening it from the dashboard lands on the right step', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await pickVideo(page, 'vertical.webm');
  await page.getByLabel(/What happens in the video/).fill('Making latte art for a regular');
  await page.getByLabel(/Audience/).fill('Coffee lovers downtown');
  await page.getByRole('button', { name: 'Write My Caption' }).click();
  await page.waitForURL(/\/caption$/);
  await waitForSave(page);

  // Leave for the dashboard.
  await dashboardLink(page).click();
  await expect(page.getByText('Pick up where you left off')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Making latte art for a regular' })).toBeVisible();
  await expect(page.getByText('Next: Write your caption')).toBeVisible();

  const card = reelCard(page, id);
  await expect(card).toContainText('Own video');
  await expect(card).toContainText('Step 2 of 5: Caption');
  await expect(card).toContainText('0:06');

  await page.getByRole('link', { name: 'Resume' }).click();
  await page.waitForURL(new RegExp(`/projects/${id}/caption$`));

  // Also from My Reels, after a full reload.
  await page.goto('/projects');
  await reelCard(page, id).click();
  await page.waitForURL(new RegExp(`/projects/${id}/caption$`));

  // A later step it hasn't reached redirects back.
  await page.goto(`/projects/${id}/publish`);
  await page.waitForURL(new RegExp(`/projects/${id}/caption$`));
  // A step from the other path does too.
  await page.goto(`/projects/${id}/scenes`);
  await page.waitForURL(new RegExp(`/projects/${id}/caption$`));
});

test('sample own-video Reel resumes at Cover with its saved cover', async ({ page }) => {
  await page.goto('/');
  const card = reelCard(page, 'demo-haircut-video');
  await expect(card).toContainText('Own video');
  await expect(card.locator('img')).toHaveAttribute('src', /^data:image\/jpeg/);
  await card.click();
  await page.waitForURL(/\/demo-haircut-video\/cover$/);
  await expect(page.getByRole('img', { name: 'Your cover: Wait for her reaction' })).toBeVisible();
  await expect(page.getByText('Choose your video again to change the cover.')).toBeVisible();
  await expect(page.getByText(/slide to 0:07/)).toBeVisible();
});

test('opening New Reel and leaving without choosing creates nothing', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Recent Reels')).toBeVisible();
  const before = (await storedProjects(page)).length;

  await page.getByRole('main').getByRole('link', { name: 'New Reel' }).first().click();
  await expect(page.getByRole('button', { name: /Post a video I already have/ })).toBeVisible();
  await dashboardLink(page).click();
  await expect(page.getByText('Recent Reels')).toBeVisible();
  expect((await storedProjects(page)).length).toBe(before);
});

test('own-video status: Draft when created, In Progress once the video is checked', async ({ page }) => {
  const id = await startOwnVideoReel(page);
  await expect(page.locator('h1 + span')).toHaveText('Draft');
  await pickVideo(page, 'vertical.webm');
  await page.getByLabel(/What happens in the video/).fill('Wrapping a gift for a customer');
  await page.getByLabel(/Audience/).fill('Last-minute gift shoppers');
  await waitForSave(page);
  expect((await storedProject(page, id)).status).toBe('draft');
  await page.getByRole('button', { name: 'Write My Caption' }).click();
  await page.waitForURL(/\/caption$/);
  await expect(page.locator('h1 + span')).toHaveText('In Progress');
});
