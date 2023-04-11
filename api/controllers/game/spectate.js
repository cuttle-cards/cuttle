module.exports = async function (req, res) {
  const { gameId } = req.body;
  const [game, spectator] = await Promise.all([
    gameService.populateGame({ gameId }),
    userService.findUser({ userId: req.session.usr }),
  ]);
  if (game.status || game.players.length < 2) {
    return res.badRequest({ message: 'You can only spectate an ongoing game with two players' });
  }
  // Subscribe socket to game
  Game.subscribe(req, [gameId]);
  req.session.spectating = gameId;

  try {
    // Add spectating users to table
    await Game.addToCollection(game.id, 'spectatingUsers', spectator.id);
    const fullGame = await gameService.populateGame({ gameId: game.id });

    Game.publish([fullGame.id], {
      verb: 'updated',
      data: {
        change: 'spectatingUsers',
        game: fullGame,
      },
    });
    return res.ok(fullGame);
  } catch (err) {
    return res.badRequest(err);
  }
};
