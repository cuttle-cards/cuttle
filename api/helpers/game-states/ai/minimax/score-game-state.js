module.exports = {
  friendlyName: 'Score GameState',

  description: 'Returns numerical score describing desirability/goodness of a given GameState, from a specified player\'s perspective',

  inputs: {
    currentState: {
      type: 'ref',
      descriptions: 'Object containing the current game state',
      required: true,
    },
    pNum: {
      type: 'number',
      description: 'Which player (0 or 1)\'s perspective to evaluate the GameState from',
      required: true,
    },
  },
  sync: true,
  fn: ({ currentState, pNum }, exits) => {
    try {
      function getPlayerScore (player) {
        let res = 0;
        res += player.hand.length; // hand score
        res += player.points.length * 2; // point score
        res += player.faceCards.length * 2; // royal score
        // Penalties //
        // Penalize redundant queens
        res -= (Math.max(0, player.faceCards.filter((card) => card.rank === 12).length - 2) * 2);
        // Penalize redundant glasses
        res -= (Math.max(0, player.faceCards.filter((card) => card.rank === 8).length - 1) * 2);
        // Penalize redundant points
        const playerPointTotal = player.points.reduce((total, currentCard) => total + currentCard.rank, 0);
        if (playerPointTotal <= 10) {
          res -= Math.max(0, (player.points.length - 1)) * 2;
        }
        else if (playerPointTotal <= 21) {
          res -= Math.max(0, (player.points.length - 2)) * 2;
        }

        return res;
      }

      const player = pNum ? currentState.p1 : currentState.p0;
      const opponent = pNum ? currentState.p0 : currentState.p1;

      const playerScore = getPlayerScore(player);
      const opponentScore = getPlayerScore(opponent);
      const turnBonus = pNum === currentState.turn % 2 ? .5 : -.5;

      return exits.success(playerScore - opponentScore + turnBonus);
    } catch (err) {
      return exits.error(err);
    }
  },
};
