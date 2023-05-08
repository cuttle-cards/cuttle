module.exports = async function (req, res) {
  const gameId = req.session.spectating;
  const spectator = await userService.findUser({ userId: req.session.usr });

  try {
    await UserSpectatingGame.update({ gameSpectated: gameId, spectator: spectator.id }).set({
      activelySpectating: false,
    });

    const fullGame = await gameService.populateGame({ gameId: gameId });
    Game.publish([fullGame.id], {
      change: 'spectatorLeft',
      game: fullGame,
    });
    return res.ok(fullGame);
  } catch (err) {
    console.log(err);
    return res.badRequest(err);
  }
};
