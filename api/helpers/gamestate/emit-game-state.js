const MoveType = require('../../../utils/MoveType.json');
const { getLogMessage, screamingSnakeToCamelCase } = require('../../../utils/socket-utils');

module.exports = {
  friendlyName: 'Emit Game State',

  description: 'Determines if the game has ended and sends a socket event based on the game status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game overview object',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'Game state object',
      required: true,
    },
  },

  fn: async function ({ game, gameState }, exits) {
    //Combine game and gamestate users and delete passwords
    const p0 = { ...game.p0, ...gameState.p0 };
    delete p0.encryptedPassword;
    const p1 = { ...game.p1, ...gameState.p1 };
    delete p1.encryptedPassword;
    const players = [p0, p1];

    const lastEventTargetType = () => {
      if (!['targetedOneOff', 'sevenTargetedOneOff'].includes(gameState.moveType)) {
        return '';
      }
      if (gameState.targetCard?.rank === 11) {
        return 'jack';
      }
      if (gameState.targetCard?.rank > 11) {
        return 'faceCard';
      }
      return 'point';
    };

    const victory = await sails.helpers.gamestate.checkGameStateForWin(game, players);

    const countPasses = () => {
      let numPasses = 0;
      for (const gameState of game.gameStates.slice(-3)) {
        if (gameState.moveType !== MoveType.PASS) {
          return numPasses;
        }
        numPasses++;
      }
      return numPasses;
    };

    const getFullLog = () => {
      return game.gameStates?.map((row) => {
        return getLogMessage(game, row);
      });
    };

    const socketGame = {
      players,
      id: game.id,
      createdAt: game.createdAt,
      updatedAt: gameState.createdAt,
      name: game.name,
      chat: game.chat,
      status: game.status,
      p0Ready: game.p0Ready,
      p1Ready: game.p1Ready,
      p0Rematch: game.p0Rematch,
      p1Rematch: game.p1Rematch,
      turnStalemateWasRequestedByP0: game.turnStalemateWasRequestedByP0,
      turnStalemateWasRequestedByP1: game.turnStalemateWasRequestedByP1,
      lock: game.lock,
      lockedAt: game.lockedAt,
      rematchGame: game.rematchGame,
      spectatingUsers: game.spectatingUsers,
      isRanked: game.isRanked,
      winner: victory.winner,
      match: victory.currentMatch,
      log: getFullLog(),
      passes: countPasses(),
      turn: gameState.turn,
      deck: gameState.deck.slice(2),
      scrap: gameState.scrap,
      topCard: gameState.deck[0],
      secondCard: gameState.deck[1],
      twos: gameState.twos,
      oneOff: gameState.oneOff,
      resolving: gameState.resolving,
      oneOffTarget: gameState.oneOffTarget,
      oneOffTargetType: lastEventTargetType(),
      lastEvent: {
        change: gameState.moveType,
        oneOffRank: gameState.oneOff?.rank ?? null,
        oneOffTargetType: lastEventTargetType(),
        chosenCard: gameState.targetCard ?? null,
        pNum: gameState.playedBy,
        discardedCards: gameState.discardedCards ?? null,
      },
    };

    Game.publish([game.id], {
      change: gameState.moveType,
      game: socketGame,
      victory,
    });

    if (victory.gameOver) {
      sails.sockets.blast('gameFinished', { gameId: game.id });
    }

    return exits.success({ victory, game: socketGame });
  },
};
