import { Card } from '../Card';
import GamePhase from '../../../../utils/GamePhase.json';
import MoveType from '../../../../utils/MoveType.json';


// Seven Of Spades appears twice
const duplicateCard = {
  p0: {
    hand: [ Card.ACE_OF_SPADES ],
    points: [
      Card.TEN_OF_SPADES,
      {
        ...Card.EIGHT_OF_DIAMONDS,
        attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
      },
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
    // Extra seven of spades
    points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_CLUBS, Card.SEVEN_OF_SPADES ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
    Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS,
    Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES,
    Card.SIX_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
    Card.QUEEN_OF_SPADES
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: null,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: Card.TEN_OF_SPADES,
  gameId: 1,
  playedBy: 0,
  moveType: MoveType.POINTS,
  turn: 3,
  phase: GamePhase.MAIN,
  targetCard: null,
};
  // p1 points contains invalid card
const invalidCard = {
  p0: {
    hand: [ Card.ACE_OF_SPADES ],
    points: [
      Card.TEN_OF_SPADES,
      {
        ...Card.EIGHT_OF_DIAMONDS,
        attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
      },
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
    points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_CLUBS, { suit: 14, rank: 10, id: 'HA', attachments: [] } ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
    Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS,
    Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES,
    Card.SIX_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
    Card.QUEEN_OF_SPADES
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: null,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: Card.TEN_OF_SPADES,
  gameId: 1,
  playedBy: 0,
  moveType: MoveType.POINTS,
  turn: 3,
  phase: GamePhase.MAIN,
  targetCard: null,
};
// Missing Card.ACE_OF_CLUBS
const missingCard = {
  p0: {
    hand: [ Card.ACE_OF_SPADES ],
    points: [
      Card.TEN_OF_SPADES,
      {
        ...Card.EIGHT_OF_DIAMONDS,
        attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
      },
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
    points: [ Card.TEN_OF_HEARTS ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
    Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS,
    Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES,
    Card.SIX_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
    Card.QUEEN_OF_SPADES
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: null,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: Card.TEN_OF_SPADES,
  gameId: 1,
  playedBy: 0,
  moveType: MoveType.POINTS,
  turn: 3,
  phase: GamePhase.MAIN,
  targetCard: null,
};

const scrapAttachments = {
  p0: {
    hand: [ Card.ACE_OF_SPADES ],
    points: [
      Card.TEN_OF_SPADES,
      {
        ...Card.EIGHT_OF_DIAMONDS,
        attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
      },
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
    points: [ Card.TEN_OF_HEARTS ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS, Card.KING_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS,
    Card.SIX_OF_DIAMONDS, Card.SEVEN_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.QUEEN_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS, Card.THREE_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS,
    Card.JACK_OF_HEARTS, Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS,
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES,
    Card.SIX_OF_SPADES, Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES,
    Card.QUEEN_OF_SPADES
  ],
  scrap: [ { ...Card.SIX_OF_CLUBS, attachments: [ Card.ACE_OF_CLUBS, ] } ],
  twos: [],
  discardedCards: [],
  oneOff: null,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: Card.TEN_OF_SPADES,
  gameId: 1,
  playedBy: 0,
  moveType: MoveType.POINTS,
  turn: 3,
  phase: GamePhase.MAIN,
  targetCard: null,
};

export {
  invalidCard,
  duplicateCard,
  missingCard,
  scrapAttachments
};
