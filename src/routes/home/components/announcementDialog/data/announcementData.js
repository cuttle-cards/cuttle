import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'noThreeForThree',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [ Card.THREE_OF_CLUBS, Card.THREE_OF_DIAMONDS, Card.THREE_OF_HEARTS, Card.THREE_OF_SPADES ],
  // imgSrc: '/img/announcement/clubs_2025_cuttle_season_championship.svg',
  startTime: '2026-01-14',
  // endTime: '2025-04-27',
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [
        { text: 'announcement.paragraph' },
        // { text: 'announcement.twitchLink', url: 'https://twitch.tv/cuttle_cards' }
      ],
    },
  ],
};
