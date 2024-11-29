const GameStatus = require('../../../utils/GameStatus.json');
const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Check Game State for win',

  description: 'Determines if the game has winner and updates game status and winner if so',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game object',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'GameState object',
      required: true,
    },
    numPasses: {
      type: 'number',
      description: 'Passes Count',
      required: true,
    },
  },

  fn: async function ({ game, gameState, numPasses }, exits) {
    const checkWin = (pNum) => {
      const player = pNum ? gameState.p1 : gameState.p0;
      const points = player.points?.reduce((sum, { rank }) => sum + rank, 0);
      const kings = player.faceCards?.filter((faceCard) => faceCard.rank === 13).length;
      switch (kings) {
        case 0:
          return points >= 21;
        case 1:
          return points >= 14;
        case 2:
          return points >= 10;
        case 3:
          return points >= 5;
        case 4:
          return points >= 0;
      }
      return false;
    };

    const res = {
      gameOver: false,
      winner: null,
      conceded: false,
      currentMatch: null,
    };

    const playerConceded = gameState.moveType === MoveType.CONCEDE;
    const p0Wins = checkWin(0) || (playerConceded && gameState.playedBy === 1);
    const p1Wins = checkWin(1) || (playerConceded && gameState.playedBy === 0);

    if (p0Wins || p1Wins || numPasses >= 3) {
      res.gameOver = true;
      const gameUpdates = {};
      gameUpdates.status = GameStatus.FINISHED;

      if (p0Wins) {
        res.winner = 0;
        gameUpdates.winner = game.p0.id;
      } else if (p1Wins) {
        res.winner = 1;
        gameUpdates.winner = game.p1.id;
      }

      // Update game and add it to its match if this hasn't yet been done
      if (game.status === GameStatus.STARTED) {
        await Game.updateOne({ id: game.id }).set(gameUpdates);
      }

      game = {
        ...game,
        ...gameUpdates,
      };

      res.currentMatch = await sails.helpers.addGameToMatch(game);
    }
    return exits.success(res);
  },
};
