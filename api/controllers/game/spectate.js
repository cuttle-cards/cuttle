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
    await UserSpectatingGame.findOrCreate(
      { gameSpectated: game.id, spectator: spectator.id },
      { gameSpectated: game.id, spectator: spectator.id },
    ).exec(async (err, record, wasCreated) => {
      if (!wasCreated) {
        await UserSpectatingGame.update({ gameSpectated: game.id, spectator: spectator.id }).set({
          activelySpectating: true,
        });
      }
    });

    const fullGame = await gameService.populateGame({ gameId: game.id });
    Game.publish([fullGame.id], {
      change: 'spectatorJoined',
      game: fullGame,
    });
    return res.ok(fullGame);
  } catch (err) {
    return res.badRequest(err);
  }
};
