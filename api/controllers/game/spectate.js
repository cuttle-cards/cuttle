module.exports = async function (req, res) {
  try {
    const { gameId } = req.body;
    const promiseGame = await gameService.populateGame({ gameId });
    const promisePlayer = await userService.findUser({ userId: req.session.usr });

    Promise.all([promiseGame, promisePlayer])
      .then(function checkAndSubscribe(values) {
        const [game, player] = values;
        if (game.status || game.players.length < 2) {
          return res.badRequest({ message: 'You can only spectate an ongoing game with two players' });
        }
        // Subscribe socket to game
        const updatePromises = [Game.subscribe(req, [gameId]), (req.session.spectating = gameId)];
        return Promise.all([game, player, ...updatePromises]);
      })
      .then(async function updateDataBase(values) {
        const [game, player] = values;
        const updatePromises = [
          Game.updateOne({ id: game.id }).set({ spectators: [...game.spectators, player.username] }),
        ];
        return Promise.all([game, ...updatePromises]);
      })
      .then(function publishAndRespond(values) {
        const [game] = values;
        Game.publish([game.id], {
          verb: 'updated',
          data: {
            change: 'spectators',
            game: game,
          },
        });
        return res.ok(game);
      });
  } catch (err) {
    return res.badRequest(err);
  }
};
