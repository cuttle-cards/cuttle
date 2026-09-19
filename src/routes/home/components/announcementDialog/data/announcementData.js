// import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'randomFours2026Announcement',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [
    { suit: 3, rank: 4 },
    { suit: 1, rank: 4 },
  ],
  startTime: '2026-09-19',
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
