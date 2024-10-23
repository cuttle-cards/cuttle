module.exports = async function (req, res) {
  const { gameId } = req.body;
  try {
    const [ game, spectator ] = await Promise.all([
      gameService.populateGame({ gameId }),
      userService.findUser({ userId: req.session.usr }),
    ]);
    if (game.players.some(({ id }) => id === spectator.id)) {
      return res.badRequest({ message: 'home.snackbar.cannotSpectate' });
    }
    if (game.status !== gameService.GameStatus.STARTED || game.players.length < 2) {
      return res.badRequest({ message: 'home.snackbar.spectateTwoPlayers' });
    }

    // Subscribe socket to game
    Game.subscribe(req, [ gameId ]);
    req.session.spectating = gameId;

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
    Game.publish([ fullGame.id ], {
      change: 'spectatorJoined',
      game: fullGame,
    });
    return res.ok(fullGame);
  } catch (err) {
    return res.badRequest(err);
  }
};
