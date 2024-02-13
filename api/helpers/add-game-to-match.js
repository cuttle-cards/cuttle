const dayjs = require('dayjs');

module.exports = {
  friendlyName: 'Add Game to Match',

  description:
    'Adds the provided game to the appropriate match. Will create a match if not found and will end the match if this game finishes it.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record to be added to the appropriate match. Should include an array of players',
      required: true,
    },
  },
  fn: async ({ game }, exits) => {
    try {
      if (!game.isRanked) {
        return exits.success();
      }
      const [player1, player2] = game.players;
      let relevantMatch = await sails.helpers.findOrCreateCurrentMatch(player1.id, player2.id);
      if (!relevantMatch) {
        return exits.error(new Error('Could not add game to match'));
      }
      if (relevantMatch.endTime || relevantMatch.winner) {
        // Set game back to unranked if the player match already finished
        await Game.updateOne(game.id).set({ isRanked: false });
        return exits.success();
      }
      if (!relevantMatch.games) {
        relevantMatch.games = [];
      }
      let numPlayer1Wins = 0;
      let numPlayer2Wins = 0;

      for (const priorGame of [game, ...relevantMatch.games]) {
        if (!priorGame.winner) {
          continue;
        }
        if (priorGame.winner === relevantMatch.player1) {
          numPlayer1Wins++;
        } else {
          numPlayer2Wins++;
        }
      }
      // Add game to match
      await Match.addToCollection(relevantMatch.id, 'games').members([game.id]);

      // End the match if this game clinches it
      if (numPlayer1Wins >= 2) {
        relevantMatch = await Match.updateOne(relevantMatch.id).set({
          endTime: dayjs().valueOf(),
          winner: relevantMatch.player1,
        });
      } else if (numPlayer2Wins >= 2) {
        relevantMatch = await Match.updateOne(relevantMatch.id).set({
          endTime: dayjs().valueOf(),
          winner: relevantMatch.player2,
        });
      }
      relevantMatch = await sails.helpers.findOrCreateCurrentMatch(player1.id, player2.id);

      return exits.success(relevantMatch);
    } catch (err) {
      return exits.error(err);
    }
  },
};
