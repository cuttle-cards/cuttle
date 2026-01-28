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

        ///////////////
        // Penalties //
        ///////////////
        // Penalize redundant queens
        res -= (Math.max(0, player.faceCards.filter((card) => card.rank === 12).length - 2) * 2);
        // Penalize redundant glasses
        res -= (Math.max(0, player.faceCards.filter((card) => card.rank === 8).length - 1) * 2);

        // Penalize redundant points
        const playerPointTotal = player.points.reduce((total, currentCard) => total + currentCard.rank, 0);
        const playerKingCount = player.faceCards.filter((card) => card.rank === 13).length;
        let numPointCardsBeforePenalty = 0;
        switch (playerKingCount) {
          case 0:
            numPointCardsBeforePenalty = playerPointTotal <= 10 ? 1 : 2;
            break;
          case 1:
            numPointCardsBeforePenalty = playerPointTotal >= 4? 1 : 0;  
            break;
          case 3:
            // 3rd king is always redundant and so is any amount of points in combination with it
            res -= 2;
            break;
          // No need to penalize 4 kings as it wins
        }

        res -= Math.max(0, (player.points.length - numPointCardsBeforePenalty)) * 2;

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
