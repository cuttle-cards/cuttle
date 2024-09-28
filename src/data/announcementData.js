import { Card } from '../../tests/e2e/fixtures/cards';

export const announcementData = {
  id: 'recyclerFivesPermanent',
  activatorText: 'Recycler Fives are here to stay!',
  title: 'Keeping Recycler Fives',
  imgSrc: null,
  displayCards: [Card.FIVE_OF_CLUBS, Card.FIVE_OF_HEARTS, Card.FIVE_OF_DIAMONDS, Card.FIVE_OF_SPADES],
  announcementText: [
    {
      heading: 'Recycler Fives are here to stay',
      paragraph:
        "Over the past 4 months, we have trialed a change to the five's effect called Recycler Fives: Discard one card, then draw three cards. After extensive testing, the community has voted and Recycler Fives are here to stay! This means we will continue to play with the recycler effect (discard one card, then draw three cards) and will not be reverting back to the 'Classic Five' effect of drawing two cards (without discarding). ",
    },
    {
      heading: 'Will classic fives come back?',
      paragraph:
        "Possibly! There are important questions for us to answer as a community about the role that variations in the rules should play on the site and in competitive play. If you'd like to be able to play Classic Fives, or other variations on cuttle.cards, we'd love to hear about it! Join us on discord and tell us what you think!",
    },
  ],
};
