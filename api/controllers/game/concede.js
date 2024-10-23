module.exports = async function (req, res) {
  try {
    // Find winner id & pnum
    const { p0, p1 } = await gameService.findGame({ gameId: req.session.game });
    const winner = (req.session.pNum + 1) % 2;
    const winningUser = winner === 1 ? p1 : p0;

    // Update database
    await Game.updateOne(req.session.game).set({
      status: gameService.GameStatus.FINISHED,
      winner: winningUser,
    });

    const game = await gameService.populateGame({ gameId: req.session.game });
    await gameService.clearGame({ userId: req.session.usr });
    const currentMatch = await sails.helpers.addGameToMatch(game);
    // Send socket message
    const victory = {
      gameOver: true,
      winner,
      conceded: true,
      currentMatch,
    };
    
    Game.publish([ game.id ], {
      change: 'concede',
      game,
      victory,
    });
    // Set lastEvent in db with full game state + victory status  
    await Game.updateOne(req.session.game).set({
      lastEvent: {
        change: 'concede',
        game,
        victory
      }
    });
    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
