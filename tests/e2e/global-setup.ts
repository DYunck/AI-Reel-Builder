import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { FIXTURE_DIR, fixture } from './helpers';

const VP9 = ['-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '400k', '-pix_fmt', 'yuv420p'];

/**
 * Test videos, generated rather than committed. Note: Playwright's Chromium can't
 * play H.264 MP4, so playable fixtures use VP9; the HEVC .mov stands in for an
 * iPhone video that Chrome/Firefox can't play.
 */
const VIDEOS: Record<string, string[]> = {
  'vertical.webm': ['-f', 'lavfi', '-i', 'testsrc2=size=720x1280:rate=30', '-t', '6', ...VP9],
  'horizontal.webm': ['-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30', '-t', '4', ...VP9],
  'lowres.webm': ['-f', 'lavfi', '-i', 'testsrc2=size=360x640:rate=30', '-t', '4', ...VP9],
  'too-long.webm': ['-f', 'lavfi', '-i', 'testsrc2=size=720x1280:rate=1', '-t', '190', ...VP9],
  'rotated-raw.mp4': ['-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30', '-t', '3', ...VP9],
  // Stored sideways with a "rotate 90°" flag, like many phone videos. Should count as vertical.
  // (Needs the encoded file above; the flag is added on a stream copy.)
  'rotated.mp4': ['-display_rotation:v:0', '90', '-i', fixture('rotated-raw.mp4'), '-c', 'copy'],
  'iphone-hevc.mov': [
    '-f', 'lavfi', '-i', 'testsrc2=size=720x1280:rate=30', '-t', '3',
    '-c:v', 'libx265', '-tag:v', 'hvc1', '-pix_fmt', 'yuv420p', '-x265-params', 'log-level=error',
  ],
};

export default function globalSetup() {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  for (const [name, args] of Object.entries(VIDEOS)) {
    if (existsSync(fixture(name))) continue;
    try {
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args, fixture(name)], { stdio: 'inherit' });
    } catch (e) {
      throw new Error(`Couldn't create test video ${name}. These tests need ffmpeg (with libvpx and libx265) installed.\n${e}`);
    }
  }
  if (!existsSync(fixture('notes.txt'))) writeFileSync(fixture('notes.txt'), 'Shopping list: flour, butter, sugar.\n');
}
