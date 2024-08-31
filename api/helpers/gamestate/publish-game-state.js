const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Publish game State',

  description: 'Determines if the game has ended and sends a socket event based on the game status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'game overview object',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'game state object',
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
      const { playedBy } = gameState;
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
        oneOffTargetType: lastEventTargetType(),
        lastEvent: {
          change: gameState.moveType,
          oneOffTargetType: lastEventTargetType(),
          chosenCard,
          pNum,
          happened,
          discardedCards,
          oneOff: gameState.resolved,
        },
      };

      const fullSocketEvent = {
        change: gameState.moveType,
        game: socketGame,
        victory,
        happened,
        discardedCards,
        chosenCard,
        playedBy,
        pNum,
        oneOff: gameState.resolved,
      };

      Game.publish([game.id], fullSocketEvent);

      console.log(fullSocketEvent);

      if (victory.gameOver) {
        sails.sockets.blast('gameFinished', { gameId: game.id });
      }

      return exits.success(fullSocketEvent);
    } catch (err) {
      return exits.error(`Error emitting socket: ${err.message}`);
    }
  },
};
