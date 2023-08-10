module.exports = async function (req, res) {
  try {
    const { p0, p1 } = await gameService.findGame({ gameId: req.session.game });
    const winner = (req.session.pNum + 1) % 2 === 0 ? p0 : p1;
    
    // Update database
    await Game.updateOne(req.session.game).set({ status: gameService.GameStatus.FINISHED, winner });
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
