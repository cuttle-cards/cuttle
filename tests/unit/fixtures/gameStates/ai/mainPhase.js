import { Card } from '../../Card';
import GamePhase from '../../../../../utils/GamePhase.json';
import MoveType from '../../../../../utils/MoveType.json';

const gameState = {
  p0: {
    hand: [
      Card.ACE_OF_SPADES,
      Card.THREE_OF_HEARTS,
      Card.SEVEN_OF_DIAMONDS,
      Card.JACK_OF_HEARTS,
      Card.QUEEN_OF_DIAMONDS,
      Card.KING_OF_CLUBS,
    ],
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
    points: [ Card.TEN_OF_HEARTS, Card.ACE_OF_CLUBS ],
    faceCards: [],
  },
  deck: [ Card.SEVEN_OF_SPADES, Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, 
    Card.SIX_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, 
    Card.JACK_OF_DIAMONDS, Card.KING_OF_DIAMONDS, 
    Card.TWO_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, 
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, 
    Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, 
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES, 
    Card.SIX_OF_SPADES,  Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, 
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

const drawMoveBodies = [ { moveType: MoveType.DRAW, playedBy: 0 } ];

const pointsMoveBodies = [
  { moveType: MoveType.POINTS, playedBy: 0, cardId: 'AS' },
  { moveType: MoveType.POINTS, playedBy: 0, cardId: '3H' },
  { moveType: MoveType.POINTS, playedBy: 0, cardId: '7D' },
];

const faceCardMoveBodies = [
  { moveType: MoveType.FACE_CARD, playedBy: 0, cardId: 'QD' },
  { moveType: MoveType.FACE_CARD, playedBy: 0, cardId: 'KC' },
];

const scuttleMoveBodies = [
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: 'AS', targetId: 'TH' },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: 'AS', targetId: 'AC' },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '3H', targetId: 'TH' },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '3H', targetId: 'AC' },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '7D', targetId: 'TH' },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '7D', targetId: 'AC' },
];

const jackMoveBodies = [
  { moveType: MoveType.JACK, playedBy: 0, cardId: 'JH', targetId: 'TH' },
  { moveType: MoveType.JACK, playedBy: 0, cardId: 'JH', targetId: 'AC' },
];

const oneOffMoveBodies = [
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: 'AS' },
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: '3H' },
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: '7D' },
];

export const mainPhase = {
  gameState,
  drawMoveBodies,
  pointsMoveBodies,
  faceCardMoveBodies,
  scuttleMoveBodies,
  jackMoveBodies,
  oneOffMoveBodies,
};
