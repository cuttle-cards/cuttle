export const MIN_PLAYBACK_DELAY_MS = 500;
export const MAX_PLAYBACK_DELAY_MS = 3000;

/**
 * How long to wait on a state before auto-advancing to the next one: the real gap between when the two
 * moves were made, clamped so a long think doesn't look like a hung UI and a flurry of fast moves stays readable.
 *
 * createdAt arrives as an ISO string over the socket, so it's parsed before subtracting. A missing, unparseable,
 * or negative gap (equal timestamps, clock skew) falls to the floor so playback never stalls.
 */
export function getPlaybackDelay(fromState, toState) {
  const gap = new Date(toState?.createdAt).getTime() - new Date(fromState?.createdAt).getTime();
  if (!Number.isFinite(gap)) {
    return MIN_PLAYBACK_DELAY_MS;
  }
  return Math.min(Math.max(gap, MIN_PLAYBACK_DELAY_MS), MAX_PLAYBACK_DELAY_MS);
}
