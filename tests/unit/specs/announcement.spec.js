import { describe, it, expect } from 'vitest';
import { isAnnouncementActive } from '@/util/announcement';

const announcement = (overrides = {}) => ({
  id: 'testAnnouncement',
  startTime: '2026-03-01',
  endTime: '2026-04-01',
  ...overrides,
});

const now = new Date('2026-03-15T12:00:00.000Z');

describe('isAnnouncementActive', () => {
  it('is active between its start and end times', () => {
    expect(isAnnouncementActive(announcement(), { now })).toBe(true);
  });

  it('is not active before it starts', () => {
    expect(isAnnouncementActive(announcement({ startTime: '2026-03-20' }), { now })).toBe(false);
  });

  it('is not active after it ends', () => {
    expect(isAnnouncementActive(announcement({ endTime: '2026-03-10' }), { now })).toBe(false);
  });

  it('treats a missing start or end time as open on that side', () => {
    expect(isAnnouncementActive(announcement({ startTime: undefined }), { now })).toBe(true);
    expect(isAnnouncementActive(announcement({ endTime: undefined }), { now })).toBe(true);
    expect(isAnnouncementActive(announcement({ startTime: undefined, endTime: undefined }), { now })).toBe(true);
  });

  it('applies to everyone when it lists no users', () => {
    expect(isAnnouncementActive(announcement({ userIds: [] }), { now, userId: 7 })).toBe(true);
    expect(isAnnouncementActive(announcement(), { now, userId: null })).toBe(true);
  });

  it('applies only to the listed users when it has some', () => {
    const forTwoUsers = announcement({ userIds: [ 3, 7 ] });
    expect(isAnnouncementActive(forTwoUsers, { now, userId: 7 })).toBe(true);
    expect(isAnnouncementActive(forTwoUsers, { now, userId: 4 })).toBe(false);
    expect(isAnnouncementActive(forTwoUsers, { now, userId: null })).toBe(false);
  });

  it('is not active without an announcement', () => {
    expect(isAnnouncementActive(null, { now })).toBe(false);
  });
});
