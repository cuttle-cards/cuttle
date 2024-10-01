import { Card } from '../../../../../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'opponentHandRevealed',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  imgSrc: null,
  displayCards: [Card.FIVE_OF_CLUBS, Card.ACE_OF_DIAMONDS, Card.KING_OF_HEARTS, Card.EIGHT_OF_SPADES],
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: 'announcement.paragraph',
    },
  ],
};
