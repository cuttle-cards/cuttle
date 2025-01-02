module.exports = async function (req, res) {
  let { gameId } = req.params;
  gameId = Number(gameId);

  try {
    const [ spectator, game ] = await Promise.all([
      User.findOne({ id: req.session.usr }),
      Game.findOne(gameId).populate('gameStates')
        .populate('p0')
        .populate('p1'),
    ]);

    if (!spectator) {
      return res.status(404).json({ message: `Couldn't find your user; please log out and log back in` });
    }

    if (!game) {
      return res.status(404).json({ message: `Can't find game ${gameId}` });
    }

    // Can't spectate if you're a player in the game
    const { p0, p1 } = game;
    if ([ p0?.id, p1?.id ].includes(( id ) => id === spectator.id)) {
      return res.forbidden({ message: 'home.snackbar.cannotSpectate' });
    }

    // Can't spectate if the game is not active
    if (game.status !== gameService.GameStatus.STARTED || !p0 || !p1) {
      return res.badRequest({ message: 'home.snackbar.spectateTwoPlayers' });
    }

    // Subscribe socket to game
    Game.subscribe(req, [ gameId ]);

    // Add spectating users to table
    const spectatorAlreadyExisted = await UserSpectatingGame.updateOne(
      { gameSpectated: game.id, spectator: spectator.id }
    ).set({ activelySpectating: true });

    if (!spectatorAlreadyExisted) {
      await UserSpectatingGame.create({ gameSpectated: game.id, spectator: spectator.id });
    }

    const { unpackGamestate, createSocketEvent } = sails.helpers.gameStates;
    const gameState = unpackGamestate(game.gameStates.at(-1));
    const socketEvent = await createSocketEvent(game, gameState);
    Game.publish([ game.id ], socketEvent);


    return res.ok(socketEvent.game);

  } catch (err) {

    return res.badRequest(err);
  }
};
