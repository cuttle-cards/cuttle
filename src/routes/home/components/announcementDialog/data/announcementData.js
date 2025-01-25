import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'spades2024Announcement',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [ Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, Card.ACE_OF_HEARTS ],
  startTime: '2025-01-24',
  endTime: '2025-01-26',
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [ 
        { text: 'announcement.paragraph' },
        { text: 'announcement.twitchLink', url: 'https://twitch.tv/cuttle_cards' }
      ],
    },
  ],
};
