module.exports = async function (req, res) {
  const gameId = req.session.spectating;
  const spectator = await userService.findUser({ userId: req.session.usr });

  try {
    await UserSpectatingGame.update({ gameSpectated: gameId, spectator: spectator.id }).set({
      activelySpectating: false,
    });

    const game = await gameService.populateGame({ gameId: gameId });
    Game.publish([ game.id ], {
      change: 'spectatorLeft',
      game,
    });
    return res.ok(game);
  } catch (err) {
    return res.badRequest(err);
  }
};
