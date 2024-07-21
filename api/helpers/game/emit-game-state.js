const GameMoveType = require('../../../utils/GameMoveType.json');

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
    const p0 = { ...game.players[0], ...gameState.p0 };
    delete p0.encryptedPassword;
    const p1 = { ...game.players[1], ...gameState.p1 };
    delete p1.encryptedPassword;
    const players = [p0, p1];

    const lastEventChange = Object.keys(GameMoveType).find((key) => GameMoveType[key] === gameState.moveType);

    const lastEventTargetType = () => {
      if (!['targetedOneOff', 'sevenTargetedOneOff'].includes(lastEventChange)) {
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

    const victory = await sails.helpers.game.checkGameStateForWin(game, players);

    const countPasses = () => {
      if (game.gameStates.length < 3) {
        return 0;
      }
      game.gameStates.slice(game.gameStates.length - 3).reduce((row, acc) => {
        if (row.moveType !== '18') {
          return acc;
        }
        return acc + 1;
      }, 0);
    };

    /* Still needs
      -waitingForOpponentToStalemate
      -log
      -attachedtoTargetType
    
    */
    const socketGame = {
      players, //
      id: game.id, //
      createdAt: gameState.createdAt,
      name: game.name, //
      chat: game.chat, //
      status: game.status, //
      p0: game.p0,
      p1: game.p1,
      p0Ready: game.p0Ready, //
      p1Ready: game.p1Ready, //
      p0Rematch: game.p0Rematch, //
      p1Rematch: game.p1Rematch, //
      lock: game.lock,
      lockedAt: game.lockedAt,
      rematchGame: game.rematchGame,
      spectatingUsers: game.spectatingUsers, //
      isRanked: game.isRanked, //
      winner: victory.winner, //
      match: victory.currentMatch,
      passes: countPasses(),
      turn: gameState.turn, //
      deck: gameState.deck.slice(2), //
      scrap: gameState.scrap, //
      topCard: gameState.deck[0], //
      secondCard: gameState.deck[1], //
      twos: gameState.twos, //
      oneOff: gameState.oneOff, //
      resolving: gameState.resolving,
      oneOffTarget: gameState.oneOffTarget, //
      oneOffTargetType: lastEventTargetType(),
      lastEvent: {
        change: lastEventChange, //
        oneOffRank: gameState.oneOff?.rank ?? null, //
        oneOffTargetType: lastEventTargetType(), //
        chosenCard: gameState.targetCard ?? null, //
        pNum: gameState.playedBy, //
        discardedCards: gameState.discardedCards ?? null, //
      },
    };

    Game.publish([game.id], {
      change: lastEventChange,
      game: socketGame,
      victory,
    });

    if (victory.gameOver) {
      sails.sockets.blast('gameFinished', { gameId: game.id });
    }

    return exits.success({ victory, game: socketGame });
  },
};
