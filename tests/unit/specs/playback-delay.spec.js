import { describe, it, expect } from 'vitest';
import {
  getPlaybackDelay,
  MIN_PLAYBACK_DELAY_MS,
  MAX_PLAYBACK_DELAY_MS,
} from '@/util/playbackDelay';

const start = new Date('2026-01-01T12:00:00.000Z').getTime();
const stateAt = (offsetMs) => ({ createdAt: new Date(start + offsetMs).toISOString() });

describe('getPlaybackDelay', () => {
  it('passes through a gap within the bounds', () => {
    expect(getPlaybackDelay(stateAt(0), stateAt(1200))).toBe(1200);
  });

  it('clamps a gap below the floor up to the minimum', () => {
    expect(getPlaybackDelay(stateAt(0), stateAt(50))).toBe(MIN_PLAYBACK_DELAY_MS);
  });

  it('clamps a gap above the ceiling down to the maximum', () => {
    expect(getPlaybackDelay(stateAt(0), stateAt(4 * 60 * 1000))).toBe(MAX_PLAYBACK_DELAY_MS);
  });

  it('allows gaps exactly at the bounds', () => {
    expect(getPlaybackDelay(stateAt(0), stateAt(MIN_PLAYBACK_DELAY_MS))).toBe(MIN_PLAYBACK_DELAY_MS);
    expect(getPlaybackDelay(stateAt(0), stateAt(MAX_PLAYBACK_DELAY_MS))).toBe(MAX_PLAYBACK_DELAY_MS);
  });

  it('parses ISO strings, as createdAt arrives over the socket', () => {
    const from = { createdAt: '2026-01-01T12:00:00.000Z' };
    const to = { createdAt: '2026-01-01T12:00:02.000Z' };
    expect(getPlaybackDelay(from, to)).toBe(2000);
  });

  it('accepts epoch milliseconds too', () => {
    expect(getPlaybackDelay({ createdAt: start }, { createdAt: start + 1500 })).toBe(1500);
  });

  it('falls to the floor for identical timestamps', () => {
    expect(getPlaybackDelay(stateAt(0), stateAt(0))).toBe(MIN_PLAYBACK_DELAY_MS);
  });

  it('falls to the floor for a negative gap (clock skew)', () => {
    expect(getPlaybackDelay(stateAt(2000), stateAt(0))).toBe(MIN_PLAYBACK_DELAY_MS);
  });

  it('falls to the floor when a createdAt is missing or unparseable', () => {
    expect(getPlaybackDelay({}, stateAt(0))).toBe(MIN_PLAYBACK_DELAY_MS);
    expect(getPlaybackDelay(stateAt(0), {})).toBe(MIN_PLAYBACK_DELAY_MS);
    expect(getPlaybackDelay(undefined, undefined)).toBe(MIN_PLAYBACK_DELAY_MS);
    expect(getPlaybackDelay({ createdAt: 'nonsense' }, stateAt(0))).toBe(MIN_PLAYBACK_DELAY_MS);
  });
});
