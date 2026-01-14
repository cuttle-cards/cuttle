import { Card } from '../../Card';
import GamePhase from '../../../../../utils/GamePhase.json';
import MoveType from '../../../../../utils/MoveType.json';
import { omit } from 'lodash';

const gameState = {
  p0: {
    hand: [ Card.ACE_OF_HEARTS ],
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
  deck: [ Card.SEVEN_OF_CLUBS,
    Card.TWO_OF_CLUBS, Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS, Card.QUEEN_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, 
    Card.SIX_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS,
    Card.JACK_OF_DIAMONDS, Card.KING_OF_DIAMONDS,
    Card.TWO_OF_HEARTS,
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, 
    Card.QUEEN_OF_HEARTS, Card.KING_OF_HEARTS, 
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES, 
    Card.SIX_OF_SPADES,  Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, 
    Card.QUEEN_OF_SPADES,
    Card.ACE_OF_DIAMONDS, Card.SEVEN_OF_SPADES, Card.FOUR_OF_HEARTS
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: Card.FIVE_OF_HEARTS,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: Card.FIVE_OF_HEARTS,
  playedCard: null,
  gameId: 1,
  playedBy: 1,
  moveType: MoveType.RESOLVE,
  turn: 4,
  phase: GamePhase.RESOLVING_FIVE,
  targetCard: null,
};

const resolveFiveMoveBodies = [
  { moveType: MoveType.RESOLVE_FIVE, playedBy: 0, cardId: 'AH', isValid: true },
];

const validMoveBodies = [
  ...(resolveFiveMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
];

function omitIsValid(moveList) {
  return moveList.map((validMove) => omit(validMove, 'isValid'));
}

export const resolvingFivePhase2HasOneCardInHand = {
  name: 'resolvingFivePhase2: Player has one card in hand',
  gameState,
  playedBy: 0,
  moveBodiesByType: [
    { moveType: MoveType.RESOLVE_FIVE, moves: omitIsValid(resolveFiveMoveBodies) }
  ],
  validMoveBodies,
};
