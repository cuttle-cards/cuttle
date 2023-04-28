module.exports = async function (req, res) {
  try {
    const winner = (req.session.pNum + 1) % 2;
    // Update database
    await Game.updateOne(req.session.game).set({ result: winner });
    const game = await gameService.populateGame({ gameId: req.session.game });
    await gameService.clearGame({ userId: req.session.usr });
    const currentMatch = game.isRanked ? await sails.helpers.addGameToMatch(game) : null;
    // Send socket message
    const victory = {
      gameOver: true,
      winner,
      conceded: true,
      currentMatch,
    };
    Game.publish([game.id], {
      change: 'concede',
      game,
      victory,
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
