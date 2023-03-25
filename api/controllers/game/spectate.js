module.exports = async function (req, res) {
  try {
    const { gameId } = req.body;
    const game = await gameService.populateGame({ gameId });

    if (game.status || game.players.length < 2) {
      return res.badRequest({message: 'You can only spectate an ongoing game with two players'});
    }

    // Subscribe socket to game
    Game.subscribe(req, [ gameId ]);
    req.session.spectating = gameId;

    return res.ok(game);
  } catch (err) {
    return res.badRequest(err);
  }
};
