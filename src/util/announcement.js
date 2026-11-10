import dayjs from 'dayjs';

/**
 * Whether an announcement should be offered right now: between its startTime and endTime (either may be
 * left out to leave that side open), and either meant for everyone or for a list of userIds that includes
 * this user.
 *
 * `now` defaults to the current time; tests pass a fixed date so announcements don't expire out from under them.
 */
export function isAnnouncementActive(announcement, { now = dayjs(), userId = null } = {}) {
  if (!announcement) {
    return false;
  }
  const { startTime, endTime, userIds } = announcement;
  const isAfterStartTime = startTime ? dayjs(now).isAfter(dayjs(startTime)) : true;
  const isBeforeEndTime = endTime ? dayjs(now).isBefore(dayjs(endTime)) : true;
  const appliesToMyUser = !userIds?.length || userIds.includes(userId);

  return isAfterStartTime && isBeforeEndTime && appliesToMyUser;
}
