const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Publish Game State',

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
    try {
      //Combine game and gamestate users and delete passwords
      const p0 = { ...game.p0, ...gameState.p0 };
      delete p0.encryptedPassword;
      const p1 = { ...game.p1, ...gameState.p1 };
      delete p1.encryptedPassword;
      const players = [p0, p1];

      const victory = await sails.helpers.gamestate.checkGameStateForWin(game, gameState);

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

      const fullLog = sails.helpers.gamestate.getLog(game);

      //Last Event, and Extra Socket Variables
      const happened = gameState.moveType !== MoveType.FIZZLE;
      let { playedBy } = gameState;

      // When resolving, the player who resolves is the opponent
      // of the one who played the one-off (if the one-off doesn't fizzle)
      if ( gameState.moveType === MoveType.RESOLVE ) {
        playedBy = (playedBy + 1) % 2;
      }

      const discardedCards = gameState.discardedCards.length ? gameState.discardedCards : null;
      const chosenCard = gameState.moveType === MoveType.RESOLVE_THREE ? gameState.targetCard : null;
      const pNum = playedBy;

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
        log: fullLog,
        passes: countPasses(),
        turn: gameState.turn,
        deck: gameState.deck.slice(2),
        scrap: gameState.scrap,
        topCard: gameState.deck[0],
        secondCard: gameState.deck[1],
        twos: gameState.twos,
        resolved: gameState.resolved,
        oneOff: gameState.oneOff,
        oneOffTarget: gameState.oneOffTarget,
        oneOffTargetType: gameState.oneOffTargetType,
        lastEvent: {
          change: gameState.moveType,
          pNum,
          happened,
          // Conditionally included properties if truthy
          ...(gameState.resolved && {oneOff: gameState.resolved}),
          ...(chosenCard && { chosenCard }),
          ...(discardedCards && { discardedCards }),
        },
      };

      const fullSocketEvent = {
        change: gameState.moveType,
        game: socketGame,
        victory,
        happened,
        playedBy,
        pNum,
        // Conditionally included properties if truthy
        ...(gameState.resolved && {oneOff: gameState.resolved}),
        ...(chosenCard && { chosenCard }),
        ...(discardedCards && { discardedCards }),
      };

      Game.publish([game.id], fullSocketEvent);

      if (victory.gameOver) {
        sails.sockets.blast('gameFinished', { gameId: game.id });
      }

      return exits.success(fullSocketEvent);
    } catch (err) {
      return exits.error(`Error emitting socket: ${err.message}`);
    }
  },
};
