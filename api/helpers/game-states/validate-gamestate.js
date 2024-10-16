function validateGameId(param) {
  if (param === null || param === undefined || Number.isNaN(param)) {
    throw new Error('The gameId cannot be empty and must be a number');
  }
  return param;
}

function validateMoveType(param) {
  if (param === null || param === undefined || !param.length) {
    throw new Error('The MoveType cannot be empty and must be a string');
  }
  return param;
}

function validateTurn(param) {
  if (param === null || param === undefined || Number.isNaN(param)) {
    throw new Error('The turn cannot be empty and must be a number');
  }
  return param;
}

function validatePhase(param) {
  if (
    param === null ||
    param === undefined ||
    Number.isNaN(param) ||
    param < 0 ||
    (param > 5 && param !== 7)
  ) {
    throw new Error('The phase must be a number in [1, 2, 3, 4, 5, 7]');
  }
  return param;
}

function validatePlayedBy(param) {
  if (![ 0, 1 ].includes(param)) {
    throw new Error('The playedBy attribute must be a number in [0,1]');
  }
  return param;
}

function validatePlayerData(player) {
  const data = {};
  data['hand'] = player.hand ?? [];
  data['points'] = player.points ?? [];
  data['faceCards'] = player.faceCards ?? [];
  return data;
}

module.exports = {
  friendlyName: 'Format and validate a GameState',

  description: 'Format and validate a GameState',

  extendedDescription: 'Sets default values where missing and throws error if any set attributes are invalid',

  inputs: {
    gameState: {
      type: 'ref',
      description: 'gamestate',
      required: true,
    },
  },
  sync: true,

  fn: ({ gameState }, exits) => {
    try {
      const gameStateUpdated = {
        gameId: validateGameId(gameState.gameId),
        playedBy: validatePlayedBy(gameState.playedBy),
        moveType: validateMoveType(gameState.moveType),
        turn: validateTurn(gameState.turn),
        phase: validatePhase(gameState.phase),

        p0: validatePlayerData(gameState.p0),
        p1: validatePlayerData(gameState.p1),

        deck: gameState.deck ?? [],
        scrap: gameState.scrap ?? [],
        twos: gameState.twos ?? [],
        discardedCards: gameState.discardedCards ?? [],

        playedCard: gameState.playedCard ?? null,
        targetCard: gameState.targetCard ?? null,
        oneOff: gameState.oneOff ?? null,
        oneOffTarget: gameState.oneOffTarget ?? null,
        oneOffTargetType: gameState.oneOffTargetType ?? null,
        resolved: gameState.resolved ?? null,
      };

      sails.helpers.gameStates.validateAllCards(gameStateUpdated);

      return exits.success(gameStateUpdated);
    } catch (err) {
      return exits.error(err.message);
    }
  },
};
