import { gameFixture } from '../Game';
import { Card } from '../../fixtures/Card';
import MoveType from '../../../../utils/MoveType.json';
import GamePhase from '../../../../utils/GamePhase.json';

const gameStateRow = {
  playedBy: 0,
  moveType: MoveType.RESOLVE,
  playedCard: null,
  targetCard: 'JC',
  discardedCards: [],
  turn: 3,
  phase: GamePhase.MAIN,
  p0Hand: [],
  p0Points: ['AH', 'TH'],
  p0FaceCards: [],
  p1Hand: ['JC'],
  p1Points: [],
  p1FaceCards: [],
  deck: ['TC', '7D'],
  scrap: ['9C'],
  oneOff: '9C',
  oneOffTarget: 'JC',
  twos: [],
  resolving: null,
  gameId: 1,
};

export const resolveNine = {
  game: { ...gameFixture, gameStates: [gameStateRow] },

  gameStateRow,

  gameState: {
    playedBy: 0,
    moveType: MoveType.RESOLVE,
    playedCard: null,
    targetCard: Card.JACK_OF_CLUBS,
    discardedCards: [],
    turn: 3,
    phase: GamePhase.MAIN,
    p0: {
      hand: [],
      points: [Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS],
      faceCards: [],
    },
    p1: {
      hand: [{ ...Card.JACK_OF_CLUBS, isFrozen: true }],
      points: [],
      faceCards: [],
    },
    deck: [Card.TEN_OF_CLUBS, Card.SEVEN_OF_DIAMONDS],
    scrap: [Card.NINE_OF_CLUBS],
    oneOff: Card.NINE_OF_CLUBS,
    oneOffTarget: Card.JACK_OF_CLUBS,
    twos: [],
    resolving: null,
    gameId: 1,
  },

  socket: {
    change: MoveType.RESOLVE,
    happened: true,
    oneOff: Card.NINE_OF_CLUBS,
    discardedCards: null,
    pNum: 0,
    playedBy: 0,
    chosenCard: null,
    game: {
      chat: [],
      deck: [],
      isRanked: false,
      lastEvent: {
        change: MoveType.RESOLVE,
        happened: true,
        chosenCard: null,
        oneOffRank: 9,
        oneOffTargetType: '',
        discardedCards: null,
        pNum: 0,
      },
      lock: null,
      lockedAt: null,
      log: [
        "The 9♣️ one-off resolves, returning the J♣️ to myUsername's hand. It cannot be played next turn.",
      ],
      match: null,
      name: 'Test Game',
      oneOffTargetType: '',
      p0Ready: true,
      p0Rematch: null,
      p1Ready: true,
      p1Rematch: null,
      passes: 0,
      players: [
        {
          hand: [],
          points: [Card.ACE_OF_HEARTS, Card.TEN_OF_HEARTS],
          faceCards: [],
          createdAt: '2024-07-14T12:59:45.813Z',
          updatedAt: '2024-07-14T12:59:51.528Z',
          id: 17,
          username: 'myUsername',
          pNum: 0,
          rank: 1000,
          game: 1,
          frozenId: null,
        },
        {
          hand: [{ ...Card.JACK_OF_CLUBS, isFrozen: true }],
          points: [],
          faceCards: [],
          createdAt: '2024-07-14T12:59:47.709Z',
          updatedAt: '2024-07-14T12:59:51.769Z',
          id: 18,
          username: 'definitelyNotTheGovernment6969',
          pNum: 1,
          rank: 1000,
          game: 1,
          frozenId: null,
        },
      ],
      rematchGame: null,
      resolving: null,
      scrap: [Card.NINE_OF_CLUBS],
      secondCard: Card.SEVEN_OF_DIAMONDS,
      spectatingUsers: [],
      status: 2,
      topCard: Card.TEN_OF_CLUBS,
      turn: 3,
      turnStalemateWasRequestedByP0: -1,
      turnStalemateWasRequestedByP1: -1,
      twos: [],
      winner: null,
    },
    victory: {
      conceded: false,
      currentMatch: null,
      gameOver: false,
      winner: null,
    },
  },
};