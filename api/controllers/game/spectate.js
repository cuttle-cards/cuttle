module.exports = async function (req, res) {
  try {
    const { gameId } = req.body;
    const promiseGame = await gameService.populateGame({ gameId });
    const promiseSpectator = await userService.findUser({ userId: req.session.usr });

    const [game, spectator] = await Promise.all([promiseGame, promiseSpectator]);
    if (game.status || game.players.length < 2) {
      return res.badRequest({ message: 'You can only spectate an ongoing game with two players' });
    }
    // Subscribe socket to game
    Game.subscribe(req, [gameId]);
    req.session.spectating = gameId;

    return Promise.all([game, spectator])
      .then(async function updateDataBase() {
        const updatePromises = [Game.addToCollection(game.id, 'spectatingUsers', spectator.id)];
        return Promise.all([game, ...updatePromises]);
      })
      .then(function populateGame(values) {
        const [game] = values;
        return Promise.all([gameService.populateGame({ gameId: game.id }), game]);
      })
      .then(function publishAndRespond(values) {
        const [fullGame] = values;
        Game.publish([fullGame.id], {
          verb: 'updated',
          data: {
            change: 'spectatingUsers',
            game: fullGame,
          },
        });
        return res.ok(fullGame);
      });
  } catch (err) {
    return res.badRequest(err);
  }
};
