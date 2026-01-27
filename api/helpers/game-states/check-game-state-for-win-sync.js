const GameStatus = require('../../../utils/GameStatus.json');
const MoveType = require('../../../utils/MoveType.json');

module.exports = {
  friendlyName: 'Check Game State for win synchronously',

  description: 'Determines if the game has winner without side effects',

  inputs: {
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
  sync: true,
  fn: function ({ gameState, numPasses }, exits) {
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
    const stalemate = numPasses >= 3 || gameState.moveType === MoveType.STALEMATE_ACCEPT;

    if (p0Wins || p1Wins || stalemate) {
      res.gameOver = true;

      if (p0Wins) {
        res.winner = 0;
      } else if (p1Wins) {
        res.winner = 1;
      }
    }

    return exits.success(res);
  },
};
