const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Publish updatedGame State',

  description:
    'Determines if the updatedGame has ended and sends a socket event based on the updatedGame status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'updatedGame overview object',
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
      const updatedGame = await Game.findOne({ id: game.id }).populate('gameStates');

      //Combine updatedGame and gamestate users and delete passwords
      const p0 = { ...updatedGame.p0, ...gameState.p0 };
      delete p0.encryptedPassword;
      const p1 = { ...updatedGame.p1, ...gameState.p1 };
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

      const victory = await sails.helpers.gamestate.checkGameStateForWin(updatedGame, gameState);

      const countPasses = () => {
        let numPasses = 0;
        for (const gameState of updatedGame.gameStates.slice(-3)) {
          if (gameState.moveType !== MoveType.PASS) {
            return numPasses;
          }
          numPasses++;
        }
        return numPasses;
      };

      const fullLog = sails.helpers.gamestate.getLog(updatedGame);

      //Last Event, and Extra Socket Variables
      const happened = gameState.moveType !== MoveType.FIZZLE;
      const { playedBy } = gameState;
      const discardedCards = gameState.discardedCards.length ? gameState.discardedCards : null;
      const chosenCard = gameState.moveType === MoveType.RESOLVE_THREE ? gameState.targetCard : null;
      const pNum = playedBy;

      const socketGame = {
        players,
        id: updatedGame.id,
        createdAt: updatedGame.createdAt,
        updatedAt: gameState.createdAt,
        name: updatedGame.name,
        chat: updatedGame.chat,
        status: updatedGame.status,
        p0Ready: updatedGame.p0Ready,
        p1Ready: updatedGame.p1Ready,
        p0Rematch: updatedGame.p0Rematch,
        p1Rematch: updatedGame.p1Rematch,
        turnStalemateWasRequestedByP0: updatedGame.turnStalemateWasRequestedByP0,
        turnStalemateWasRequestedByP1: updatedGame.turnStalemateWasRequestedByP1,
        lock: updatedGame.lock,
        lockedAt: updatedGame.lockedAt,
        rematchGame: updatedGame.rematchGame,
        spectatingUsers: updatedGame.spectatingUsers,
        isRanked: updatedGame.isRanked,
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

      Game.publish([updatedGame.id], fullSocketEvent);

      console.log(fullSocketEvent);

      if (victory.gameOver) {
        sails.sockets.blast('gameFinished', { gameId: updatedGame.id });
      }

      return exits.success(fullSocketEvent);
    } catch (err) {
      return exits.error(`Error emitting socket: ${err.message}`);
    }
  },
};
