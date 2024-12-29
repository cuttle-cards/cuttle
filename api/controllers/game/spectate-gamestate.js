module.exports = async function (req, res) {
  const { gameId } = req.params;
  let game;

  try {
    const [ game, spectator ] = await Promise.all([
      sails.helpers.lockGame(req.params.gameId),
      User.findOne({ id: req.session.usr }),
    ]);

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

    await sails.helpers.unlockGame(game.lock);

    return res.ok(socketEvent.game);
  } catch (err) {
    // Ensure game is unlocked
    if (game?.lock) {
      try {
        await sails.helpers.unlockGame(game.lock);
      } catch (err) {
        // Fall through for generic error handling
      }
    }
    return res.badRequest(err);
  }
};
