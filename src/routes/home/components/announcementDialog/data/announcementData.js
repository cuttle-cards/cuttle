// import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'topdeckNines2026Announcement',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [
    { suit: 3, rank: 9 },
    { suit: 2, rank: 9 },
  ],
  startTime: '2026-09-16',
  endTime: '2027-01-05',
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [ { text: 'announcement.paragraph' } ],
    },
    {
      heading: 'announcement.heading2',
      paragraph: [
        { text: 'announcement.paragraph2' },
        {
          text: 'announcement.patreonLink',
          url: 'https://www.patreon.com/cuttle/posts/help-refine-4-9-169762967',
        },
      ],
    },
  ],
};
