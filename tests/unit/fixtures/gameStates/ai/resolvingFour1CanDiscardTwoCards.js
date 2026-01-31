import { Card } from '../../Card';
import GamePhase from '../../../../../utils/GamePhase.json';
import MoveType from '../../../../../utils/MoveType.json';
import { omit } from 'lodash';

const gameState = {
  p0: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
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
    hand: [
      Card.ACE_OF_SPADES,
      Card.THREE_OF_HEARTS,
      Card.SEVEN_OF_DIAMONDS,
      Card.JACK_OF_HEARTS,
      Card.QUEEN_OF_DIAMONDS,
      Card.KING_OF_CLUBS,
    ],
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
  playedBy: 1,
  moveType: MoveType.RESOLVE,
  turn: 4,
  phase: GamePhase.RESOLVING_FOUR,
  targetCard: null,
};

const resolveFourMoveBodies = [
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'AS', cardId2: '3H', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'AS', cardId2: '7D', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'AS', cardId2: 'JH', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'AS', cardId2: 'QD', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'AS', cardId2: 'KC', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '3H', cardId2: '7D', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '3H', cardId2: 'JH', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '3H', cardId2: 'QD', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '3H', cardId2: 'KC', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '7D', cardId2: 'JH', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '7D', cardId2: 'QD', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: '7D', cardId2: 'KC', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'JH', cardId2: 'QD', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'JH', cardId2: 'KC', isValid: true },
  { moveType: MoveType.RESOLVE_FOUR, playedBy: 1, cardId1: 'QD', cardId2: 'KC', isValid: true },
];

const validMoveBodies = [
  ...resolveFourMoveBodies,
].filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'));

function omitIsValid(moveList) {
  return moveList.map((validMove) => omit(validMove, 'isValid'));
}

export const resolvingFourPhase1CanDiscardTwoCards = {
  name: 'resolvingFourPhase1',
  gameState,
  playedBy: 1,
  moveBodiesByType: [
    { moveType: MoveType.RESOLVE_FOUR, moves: omitIsValid(resolveFourMoveBodies) }
  ],
  validMoveBodies,
};
