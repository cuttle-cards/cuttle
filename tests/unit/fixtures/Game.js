import GameStatus from '../../../utils/GameStatus.json';

export const gameFixture = {
  id: 1,
  name: 'Test Game',
  status: GameStatus.STARTED,
  createdAt: '2024-07-14T12:59:46.870Z',
  updatedAt: '2024-07-14T12:59:52.829Z',
  chat: [],
  p0: {
    createdAt: '2024-07-14T12:59:45.813Z',
    updatedAt: '2024-07-14T12:59:51.528Z',
    id: 17,
    username: 'myUsername',
    encryptedPassword: 'password',
    pNum: 0,
    rank: 1000,
    game: 1,
    frozenId: null,
  },
  p1: {
    createdAt: '2024-07-14T12:59:47.709Z',
    updatedAt: '2024-07-14T12:59:51.769Z',
    id: 18,
    username: 'definitelyNotTheGovernment6969',
    encryptedPassword: 'password',
    pNum: 1,
    rank: 1000,
    game: 1,
    frozenId: null,
  },
  turnStalemateWasRequestedByP0: -1,
  turnStalemateWasRequestedByP1: -1,
  spectatingUsers: [],
  p0Ready: true,
  p1Ready: true,
  p0Rematch: null,
  p1Rematch: null,
  isRanked: false,
  lock: null,
  lockedAt: null,
  rematchGame: null,
  gameStates: [],
  winner: null,
  match: null,
};
