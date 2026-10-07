import { expect, test } from '@playwright/test';
import { projectIdFromUrl, reelCard, storedProject, waitForSave } from './helpers';

test('plan path still works end to end', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('main').getByRole('link', { name: 'New Reel' }).first().click();
  await page.getByRole('button', { name: /Plan a new Reel with help/ }).click();
  await page.waitForURL(/\/idea$/);
  const id = projectIdFromUrl(page);
  await expect(page.getByText('Step 1 of 7: Idea')).toBeAttached();

  // Validation, then the Idea fields in their original order.
  await page.getByRole('button', { name: 'Generate Content' }).click();
  await expect(page.getByText('Tell us what your Reel is about.')).toBeVisible();
  const labels = await page.locator('label, legend').allInnerTexts();
  const order = ['Reel Topic', 'Audience', 'Tone', 'Video Length', 'Call To Action'].map((l) =>
    labels.findIndex((t) => t.startsWith(l)),
  );
  expect(order).toEqual([...order].sort((a, b) => a - b));

  await page.getByLabel(/Reel Topic/).fill('Our new cold brew coffee');
  await page.getByLabel(/Audience/).fill('Young professionals');
  await page.getByText('Energetic', { exact: true }).click();
  await page.getByLabel('Call To Action').fill('Stop by for half-price cold brew');
  await page.getByRole('button', { name: 'Generate Content' }).click();

  await page.waitForURL(/\/script$/);
  await expect(page.getByLabel('Hook')).not.toHaveValue('');
  await expect(page.getByLabel('Instagram Caption')).toHaveValue(/our new cold brew coffee/i);
  await page.getByLabel('Hashtags').fill('#portland');
  await page.getByLabel('Hashtags').press('Enter');
  await expect(page.getByRole('button', { name: 'Remove #portland' })).toBeVisible();
  await page.getByLabel('Hook').fill('Your 3pm slump just met its match.');
  await page.getByRole('button', { name: 'Continue to Voice' }).click();

  await page.waitForURL(/\/voice$/);
  await page.getByRole('button', { name: 'Generate Voice' }).click();
  await expect(page.getByRole('button', { name: 'Play preview' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continue to Scenes' }).click();

  await page.waitForURL(/\/scenes$/);
  await expect(page.getByText(/Total: 30s of 30s/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Build' }).click();

  await page.waitForURL(/\/build$/);
  await page.getByText('Visuals Created').click();
  await page.getByRole('button', { name: 'Continue to Review' }).click();

  await page.waitForURL(/\/review$/);
  await expect(page.getByRole('heading', { name: 'Script', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Scene Plan' })).toBeVisible();
  await expect(page.getByText('Topic', { exact: true })).toBeVisible();
  await expect(page.getByText(/Still to do in your video/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your video' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ready to Publish' }).click();

  await page.waitForURL(/\/publish$/);
  await expect(page.getByText('Export Video')).toBeVisible();
  await expect(page.getByText('Find your video in your camera roll')).toHaveCount(0);
  for (const title of ['Export Video', 'Upload to Instagram', 'Paste Caption', 'Add Hashtags', 'Publish Reel']) {
    await page.getByText(title, { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Mark as Published' }).click();
  await expect(page.getByText('Your Reel is live!')).toBeVisible();
  await waitForSave(page);

  await page.reload();
  await expect(page.getByText('Your Reel is live!')).toBeVisible();
  const saved = await storedProject(page, id);
  expect(saved).toMatchObject({ source: 'plan', status: 'published', current_step: 7 });
  expect(saved.hashtags).toContain('#portland');
});

test('plan path: locked steps redirect, and Review edit buttons go to the right steps', async ({ page }) => {
  // Sample draft at step 1: a later step redirects back.
  await page.goto('/projects/demo-candles/review');
  await page.waitForURL(/\/demo-candles\/idea$/);

  // Sample ready-to-publish Reel: Review's buttons.
  await page.goto('/projects/demo-croissants/review');
  await page.getByRole('button', { name: 'Edit' }).nth(1).click(); // Scene Plan
  await page.waitForURL(/\/scenes$/);
  await page.goto('/projects/demo-croissants/review');
  await page.getByRole('button', { name: 'Open checklist' }).click();
  await page.waitForURL(/\/build$/);
  await page.goto('/projects/demo-croissants/review');
  await page.getByRole('button', { name: 'Back' }).click();
  await page.waitForURL(/\/build$/);
});

test('Reels saved before own-video support (no source field) still open as plan Reels', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const now = new Date().toISOString();
    localStorage.setItem(
      'arb-projects-v1',
      JSON.stringify([
        {
          id: 'old-format',
          title: 'Old Reel from before the update',
          audience: 'Everyone',
          tone: 'Friendly',
          length: 30,
          call_to_action: '',
          status: 'in_progress',
          current_step: 3,
          script: { hook: 'Hi', body: 'Body', cta: 'Bye' },
          caption: 'Caption',
          hashtags: ['#old'],
          scenes: [],
          checklist: { script: true, voice: false, visuals: false, captions: false, music: false },
          publish_checklist: [false, false, false, false, false],
          voice: null,
          created_at: now,
          updated_at: now,
        },
      ]),
    );
  });
  await page.goto('/');
  const card = reelCard(page, 'old-format');
  await expect(card).toContainText('Step 3 of 7: Voice');
  await expect(card).not.toContainText('Own video');
  await card.click();
  await page.waitForURL(/\/old-format\/voice$/);
  await expect(page.getByText('Create your voiceover')).toBeVisible();
});
