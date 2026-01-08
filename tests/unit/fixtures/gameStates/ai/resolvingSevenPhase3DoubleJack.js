import { Card } from '../../Card';
import GamePhase from '../../../../../utils/GamePhase.json';
import MoveType from '../../../../../utils/MoveType.json';
import { omit } from 'lodash';

const gameState = {
  p0: {
    hand: [
      Card.ACE_OF_SPADES,
      Card.THREE_OF_HEARTS,
      Card.SEVEN_OF_DIAMONDS,
      Card.QUEEN_OF_DIAMONDS,
      Card.KING_OF_CLUBS,
    ],
    points: [
      Card.TEN_OF_SPADES,
      Card.EIGHT_OF_DIAMONDS,
    ],
    faceCards: [ Card.KING_OF_SPADES ],
  },
  p1: {
    hand: [ Card.ACE_OF_HEARTS, Card.ACE_OF_DIAMONDS ],
    points: [       {
      ...Card.TEN_OF_HEARTS,
      attachments: [ Card.JACK_OF_SPADES, Card.JACK_OF_CLUBS ],
    }, Card.ACE_OF_CLUBS ],
    faceCards: [ Card.KING_OF_HEARTS, Card.QUEEN_OF_CLUBS, ],
  },
  deck: [ Card.JACK_OF_HEARTS, Card.JACK_OF_DIAMONDS,
    Card.TWO_OF_CLUBS, Card.SEVEN_OF_CLUBS,
    Card.THREE_OF_CLUBS, Card.FOUR_OF_CLUBS, Card.FIVE_OF_CLUBS,
    Card.EIGHT_OF_CLUBS, Card.NINE_OF_CLUBS, Card.TEN_OF_CLUBS,
    Card.TWO_OF_DIAMONDS, Card.THREE_OF_DIAMONDS, Card.FOUR_OF_DIAMONDS, Card.FIVE_OF_DIAMONDS, 
    Card.SIX_OF_DIAMONDS, Card.NINE_OF_DIAMONDS, Card.TEN_OF_DIAMONDS, 
    Card.KING_OF_DIAMONDS, 
    Card.TWO_OF_HEARTS, Card.FOUR_OF_HEARTS, Card.FIVE_OF_HEARTS, 
    Card.SIX_OF_HEARTS, Card.SEVEN_OF_HEARTS, Card.EIGHT_OF_HEARTS, Card.NINE_OF_HEARTS, 
    Card.QUEEN_OF_HEARTS,
    Card.TWO_OF_SPADES, Card.THREE_OF_SPADES, Card.FOUR_OF_SPADES, Card.FIVE_OF_SPADES, 
    Card.SIX_OF_SPADES,  Card.EIGHT_OF_SPADES, Card.NINE_OF_SPADES, 
    Card.QUEEN_OF_SPADES
  ],
  scrap: [ Card.SIX_OF_CLUBS ],
  twos: [],
  discardedCards: [],
  oneOff: Card.SEVEN_OF_SPADES,
  oneOffTarget: null,
  oneOffTargetType: null,
  resolved: null,
  playedCard: null,
  gameId: 1,
  playedBy: 1,
  moveType: MoveType.RESOLVE,
  turn: 4,
  phase: GamePhase.RESOLVING_SEVEN,
  targetCard: null,
};

////////////////////////////////////////////////
// Invalid move bodies (not seven resolution) //
////////////////////////////////////////////////
const passMoveBodies = [ { moveType: MoveType.PASS, playedBy: 0, isValid: false } ];

const drawMoveBodies = [ { moveType: MoveType.DRAW, playedBy: 0, isValid: false } ];

const pointsMoveBodies = [
  { moveType: MoveType.POINTS, playedBy: 0, cardId: 'AS', isValid: false },
  { moveType: MoveType.POINTS, playedBy: 0, cardId: '3H', isValid: false },
  { moveType: MoveType.POINTS, playedBy: 0, cardId: '7D', isValid: false },
];

const faceCardMoveBodies = [
  { moveType: MoveType.FACE_CARD, playedBy: 0, cardId: 'QD', isValid: false },
  { moveType: MoveType.FACE_CARD, playedBy: 0, cardId: 'KC', isValid: false },
];

const scuttleMoveBodies = [
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: 'AS', targetId: 'TH', isValid: false },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: 'AS', targetId: 'AC', isValid: false },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '3H', targetId: 'TH', isValid: false },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '3H', targetId: 'AC', isValid: false },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '7D', targetId: 'TH', isValid: false },
  { moveType: MoveType.SCUTTLE, playedBy: 0, cardId: '7D', targetId: 'AC', isValid: false },
];

const jackMoveBodies = [];

const oneOffMoveBodies = [
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: 'AS', isValid: false },
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: '3H', isValid: false },
  { moveType: MoveType.ONE_OFF, playedBy: 0, cardId: '7D', isValid: false },
];

/////////////////////////////////////////////
// Seven move bodies -- only valid options //
/////////////////////////////////////////////
const sevenPointsMoveBodies = [];

const sevenScuttleMoveBodies = [];

const sevenFaceCardMoveBodies = [];

const sevenJackMoveBodies = [
  { moveType: MoveType.SEVEN_JACK, playedBy: 0, cardId: 'JH', targetId: 'TH', isValid: false },
  { moveType: MoveType.SEVEN_JACK, playedBy: 0, cardId: 'JH', targetId: 'AC', isValid: false },
  { moveType: MoveType.SEVEN_JACK, playedBy: 0, cardId: 'JD', targetId: 'TH', isValid: false },
  { moveType: MoveType.SEVEN_JACK, playedBy: 0, cardId: 'JD', targetId: 'AC', isValid: false },
];

const sevenDiscardMoveBodies = [
  { moveType: MoveType.SEVEN_DISCARD, playedBy: 0, cardId: 'JH', isValid: true },
  { moveType: MoveType.SEVEN_DISCARD, playedBy: 0, cardId: 'JD', isValid: true },
];

const sevenOneOffMoveBodies = [];

const validMoveBodies = [
  ...(drawMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(pointsMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(faceCardMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(scuttleMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(jackMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(oneOffMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(passMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenPointsMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenScuttleMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenFaceCardMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenJackMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenDiscardMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
  ...(sevenOneOffMoveBodies.filter((move) => move.isValid).map((validMove) => omit(validMove, 'isValid'))),
];

function omitIsValid(moveList) {
  return moveList.map((validMove) => omit(validMove, 'isValid'));
}

export const resolvingSevenPhase3 = {
  name: 'resolvingSevenPhase 3',
  gameState,
  playedBy: 0,
  moveBodiesByType: [
    { moveType: MoveType.DRAW, moves: omitIsValid(drawMoveBodies) },
    { moveType: MoveType.POINTS, moves: omitIsValid(pointsMoveBodies) },
    { moveType: MoveType.FACE_CARD, moves: omitIsValid(faceCardMoveBodies) },
    { moveType: MoveType.SCUTTLE, moves: omitIsValid(scuttleMoveBodies) },
    { moveType: MoveType.JACK, moves: omitIsValid(jackMoveBodies) },
    { moveType: MoveType.ONE_OFF, moves: omitIsValid(oneOffMoveBodies) },
    { moveType: MoveType.PASS, moves: omitIsValid(passMoveBodies) },
  ],
  validMoveBodies,
};
