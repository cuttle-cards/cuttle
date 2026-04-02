import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'clubs2025Participants',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [ Card.THREE_OF_CLUBS, Card.THREE_OF_DIAMONDS, Card.THREE_OF_HEARTS, Card.THREE_OF_SPADES ],
  // imgSrc: '/img/announcement/clubs_2025_cuttle_season_championship.svg',
  startTime: '2026-04-01',
  // endTime: '2025-04-27',
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [
        { text: 'announcement.paragraph' },
        { text: 'announcement.when2MeetLink', url: 'https://twitch.tv/cuttle_cards' },
        { text: 'announcement.paragraph2' },
        { text: 'announcement.discordLink', url: 'https://discord.gg/TrT6qkJJ5u' },
        { text: 'announcement.paragraph3' },
      ],
    },
  ],
};
