const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Create Socket Event',

  description: 'Creates a Socket event, and blast game over if game is over',

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
      // Combine game and gamestate users and delete passwords
      const p0 = { ...game.p0, ...gameState.p0 };
      delete p0.encryptedPassword;
      const p1 = { ...game.p1, ...gameState.p1 };
      delete p1.encryptedPassword;
      const players = [ p0, p1 ];

      const countPasses = (function () {
        let numPasses = 0;
        for (const gameState of game.gameStates.slice(-3)) {
          if (gameState.moveType !== MoveType.PASS) {
            return numPasses;
          }
          numPasses++;
        }
        return numPasses;
      })();

      const victory = await sails.helpers.gameStates.checkGameStateForWin(game, gameState, countPasses);

      const fullLog = sails.helpers.gameStates.getLog(game);

      // Last Event, and Extra Socket Variables
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

      // Fetch list of spectating usernames
      let spectatingUsers = await UserSpectatingGame.find({
        gameSpectated: game.id,
      }).populate('spectator');
      spectatingUsers = spectatingUsers
        .filter(({ activelySpectating }) => activelySpectating === true)
        .map(({ spectator }) => spectator.username);

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
        spectatingUsers,
        isRanked: game.isRanked,
        winner: victory.winner,
        match: victory.currentMatch,
        log: fullLog,
        passes: countPasses,
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
          ...(gameState.resolved && { oneOff: gameState.resolved }),
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
        ...(gameState.playedCard && { playedCardId: gameState.playedCard.id }),
        ...(gameState.targetCard && { targetCardId: gameState.targetCard.id }),
        ...(gameState.resolved && { oneOff: gameState.resolved }),
        ...(chosenCard && { chosenCard }),
        ...(discardedCards && { discardedCards }),
      };

      if (victory.gameOver) {
        sails.sockets.blast('gameFinished', { gameId: game.id });
      }

      return exits.success(fullSocketEvent);
    } catch (err) {
      return exits.error(`Error emitting socket: ${err.message}`);
    }
  },
};
