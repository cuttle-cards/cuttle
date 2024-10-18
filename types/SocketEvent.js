import MoveType from './MoveType.json';
export default {
  ...MoveType,
  RE_LOGIN: 'reLogin',
  LOAD_FIXTURE: 'loadFixture',
  READY: 'ready',
  SET_IS_RANKED: 'setIsRanked',
  REJECT_STALEMATE: 'rejectStalemate',
  REQUEST_STALEMATE: 'requestStalemate',
  SEVEN_TARGETED_ONE_OFF: 'sevenTargetedOneOff',
  SPECTATOR_JOINED: 'spectatorJoined',
  SPECTATOR_LEFT: 'spectatorLeft',
  TARGETED_ONE_OFF: 'targetedOneOff',
  UPDATED: 'updated',
  REMATCH: 'rematch',
  NEW_GAME_FOR_REMATCH: 'newGameForRematch',
};
