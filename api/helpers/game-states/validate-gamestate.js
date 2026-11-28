const GamePhase = require('../../../utils/GamePhase.json');

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
  const phases = Object.values(GamePhase);
  if (phases.includes(param)) {
    return param;
  }

  throw new Error(`The phase must be a number in ${phases}`);
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

/**
 * Every card on the field records who owns it: a base its original owner, a stealer whoever played it.
 * The column a stack sits in is its controller, i.e. the owner of its top stealer
 *
 * @param { Player } player - the player whose points and face cards to check
 * @param { Number } pNum - the player's number
 */
function validateFieldOwners(player, pNum) {
  [ ...player.points, ...player.faceCards ].forEach((card) => {
    if (card.owner === null || card.owner === undefined) {
      throw new Error(`${card.id} in p${pNum}'s field has no owner`);
    }

    if (!card.attachments.length) {
      if (card.owner !== pNum) {
        throw new Error(`${card.id} in p${pNum}'s field is unstacked, but is owned by p${card.owner}`);
      }
      return;
    }

    card.attachments.forEach((stealer) => {
      if (stealer.owner === null || stealer.owner === undefined) {
        throw new Error(`${stealer.id} attached to ${card.id} has no owner`);
      }
    });

    const topStealer = card.attachments.at(-1);
    if (topStealer.owner !== pNum) {
      throw new Error(`${topStealer.id} controls ${card.id} in p${pNum}'s field, but is owned by p${topStealer.owner}`);
    }
  });
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
        id: gameState.id,
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
        fourRevealedCards: gameState.fourRevealedCards ?? [],
        revealedCards: gameState.revealedCards ?? [],

        playedCard: gameState.playedCard ?? null,
        targetCard: gameState.targetCard ?? null,
        oneOff: gameState.oneOff ?? null,
        oneOffTarget: gameState.oneOffTarget ?? null,
        oneOffTargetType: gameState.oneOffTargetType ?? null,
        resolved: gameState.resolved ?? null,
      };

      sails.helpers.gameStates.validateAllCards(gameStateUpdated);
      validateFieldOwners(gameStateUpdated.p0, 0);
      validateFieldOwners(gameStateUpdated.p1, 1);

      return exits.success(gameStateUpdated);
    } catch (err) {
      return exits.error(err.message);
    }
  },
};
