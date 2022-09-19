module.exports = {
  friendlyName: 'Add Game to Match',

  description:
    'Adds the provided game to the appropriate match. Will create a match if not found and will end the match if this game finishes it.',

  inputs: {
    game: {
      type: 'ref',
      description:
        'Game record to be added to the appropriate match. Should include an array of players',
      required: true,
    },
  },
  fn: async ({ game }, exits) => {
    console.log('\n\nAdding game to match');
    const { players, topCard, secondCard, scrap, deck, oneOff, ...rest } = game;
    console.log(rest);
    try {
      const [player1, player2] = game.players;
      let relevantMatch = await sails.helpers.findOrCreateCurrentMatch(player1.id, player2.id);
      console.log('Got match in add-game-to-match', relevantMatch);
      if (!relevantMatch) {
        console.log('Could not find or create relevant match from add game to match');
        return exits.error('Could not add game to match');
      }
      if (relevantMatch.endTime || relevantMatch.winner) {
        return exits.success(null);
      }
      if (!relevantMatch.games) {
        relevantMatch.games = [];
      }
      let numPlayer1Wins = 0;
      let numPlayer2Wins = 0;
      for (const priorGame of relevantMatch.games) {
        if (priorGame.result === 0) {
          numPlayer1Wins++;
        } else if (priorGame.result === 1) {
          numPlayer2Wins++;
        }
      }
      console.log(`Found ${numPlayer1Wins} player1 wins and ${numPlayer2Wins} player2 wins`);
      console.log('Game result:', game.result);
      // Add game to match
      await Match.addToCollection(relevantMatch.id, 'games').members([game.id]);
      // End match if this game clinches it
      switch (game.result) {
        case 0:
          if (numPlayer1Wins === 1) {
            console.log('Player 1 won this game. Resulting match:');
            relevantMatch = await Match.updateOne(relevantMatch.id)
              .set({
                endTime: dayjs().valueOf(),
                winner: game.players[0].id,
              })
              .fetch();
            console.log(relevantMatch);
          }
          break;
        case 1:
          if (numPlayer2Wins === 2) {
            console.log('Player 2 won this game. Resulting match:');
            relevantMatch = await Match.updateOne(relevantMatch)
              .set({
                endTime: dayjs().valueOf(),
                winner: game.players[1].id,
              })
              .fetch();
            console.log(relevantMatch);
          }
          break;
      }
      return exits.success(relevantMatch);
    } catch (err) {
      console.log(err);
      return exits.error(err);
    }
  },
};
