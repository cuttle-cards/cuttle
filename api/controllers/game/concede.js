module.exports = async function (req, res) {
  try {
    const winner = (req.session.pNum + 1) % 2;
    // Update database
    await Game.updateOne(req.session.game).set({ result: winner });
    const game = await gameService.populateGame({ gameId: req.session.game });
    await gameService.clearGame({ userId: req.session.usr });
    await sails.helpers.addGameToMatch(game);
    // Send socket message
    const victory = {
      gameOver: true,
      winner,
      conceded: true,
    };
    console.log('Successfully Added game to match');
    Game.publish([game.id], {
      verb: 'updated',
      data: {
        change: 'concede',
        game,
        victory,
      },
    });
    return res.ok();
  } catch (err) {
    console.log(err);
    return res.badRequest(err);
  }
  // return gameService
  //   .populateGame({ gameId: req.session.game })
  //   .then(function clearGame(game) {
  //     return Promise.all([
  //       Promise.resolve(game),
  //       gameService.clearGame({ userId: req.session.usr }),
  //     ]);
  //   })
  //   .then(async function publishAndRespond(values) {
  //     const game = values[0];

  //     await sails.helpers.addGameToMatch(game);
  //     console.log('Successfully Added game to match');
  //     Game.publish([game.id], {
  //       verb: 'updated',
  //       data: {
  //         change: 'concede',
  //         game,
  //         victory,
  //       },
  //     });
  //     return res.ok();
  //   })
  //   .catch(function failed(err) {
  //     return res.badRequest(err);
  //   });
};
