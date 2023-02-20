module.exports = async function (req, res) {
  try {
    const winner = (req.session.pNum + 1) % 2;
    // Update database
    await Game.updateOne(req.session.game).set({ result: winner });
    const game = await gameService.populateGame({ gameId: req.session.game });
    await gameService.clearGame({ userId: req.session.usr });
    let currentMatch;
    if (game.isRanked) {
      currentMatch = await sails.helpers.addGameToMatch(game);
    }
    // Send socket message
    const victory = {
      gameOver: true,
      winner,
      conceded: true,
      currentMatch: currentMatch,
    };
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
    return res.badRequest(err);
  }
};
