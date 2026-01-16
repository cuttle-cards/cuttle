import { Card } from '../../Card';
import GamePhase from '../../../../../utils/GamePhase.json';
import MoveType from '../../../../../utils/MoveType.json';
import { omit } from 'lodash';


const gameState = {
  p0: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS, Card.SEVEN_OF_SPADES, Card.FOUR_OF_HEARTS ],
    points: [
      {
        ...Card.EIGHT_OF_DIAMONDS,
        attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
      },
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [
      Card.TWO_OF_CLUBS,
      Card.TWO_OF_DIAMONDS,
      Card.ACE_OF_SPADES,
      Card.THREE_OF_HEARTS,
      Card.SEVEN_OF_DIAMONDS,
      Card.JACK_OF_HEARTS,
      Card.QUEEN_OF_DIAMONDS,
      Card.KING_OF_CLUBS,
    ],
    points: [ Card.TEN_OF_HEARTS, Card.TEN_OF_SPADES ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_CLUBS,
    Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS,
    Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, 
    Card.SIX_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, 
    Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, 
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES, 
    Card.SIX_OF_SPADES,  Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, 
    Card.QUEEN_OF_SPADES,
    Card.FIVE_OF_HEARTS,
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: Card.ACE_OF_CLUBS,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: Card.ACE_OF_CLUBS,
  gameId: 1,
  playedBy: 0,
  moveType: MoveType.ONE_OFF,
  turn: 4,
  phase: GamePhase.COUNTERING,
  targetCard: null,
};

const resolveMoveBodies = [ { moveType: MoveType.RESOLVE, playedBy: 1 } ];

const counterMoveBodies = [ 
  { moveType: MoveType.COUNTER, playedBy: 1, cardId: '2C' },
  { moveType: MoveType.COUNTER, playedBy: 1, cardId: '2D' },
];


const validMoveBodies = [
  ...counterMoveBodies,
  ...resolveMoveBodies,
];

export const counteringPhase1AbleToCounter = {
  name: 'counteringPhase1: Able to counter',
  gameState,
  playedBy: 1,
  moveBodiesByType: [
    { moveType: MoveType.RESOLVE, moves: resolveMoveBodies },
    { moveType: MoveType.COUNTER, moves: counterMoveBodies },
  ],
  validMoveBodies,
};
