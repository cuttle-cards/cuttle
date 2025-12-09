const GameStatus = require('../../../../utils/GameStatus');

module.exports = async function (req, res) {
  let { gameId } = req.params;
  gameId = Number(gameId);

  try {
    const [ spectator, game ] = await Promise.all([
      User.findOne({ id: req.session.usr }),
      Game.findOne(gameId)
        .populate('gameStates')
        .populate('p0')
        .populate('p1'),
    ]);

    if (!spectator) {
      return res.status(404).json({ message: `Couldn't find your user; please log out and log back in` });
    }

    if (!game) {
      return res.status(404).json({ message: `Can't find game ${gameId}` });
    }

    // Can't spectate if you're a player in an ongoing game
    const { p0, p1 } = game;
    if (game.status === GameStatus.STARTED && [ p0?.id, p1?.id ].includes(spectator.id)) {
      return res.status(409).json({ message: 'home.snackbar.cannotSpectate' });
    }

    // Can't spectate if the game hasn't started
    if (game.status === GameStatus.CREATED || !p0 || !p1) {
      return res.badRequest({ message: 'home.snackbar.spectateTwoPlayers' });
    }

    if (!game.gameStates.length) {
      return res.badRequest({ message: 'home.snackbar.spectateNoGamestates' });
    }

    // Subscribe socket to game as spectator
    sails.sockets.join(req, `game_${gameId}_spectator`);

    // Add spectating users to table
    const spectatorAlreadyExisted = await UserSpectatingGame.updateOne(
      { gameSpectated: game.id, spectator: spectator.id }
    ).set({ activelySpectating: true });

    if (!spectatorAlreadyExisted) {
      await UserSpectatingGame.create({ gameSpectated: game.id, spectator: spectator.id });
    }

    const { unpackGamestate, createSocketEvents } = sails.helpers.gameStates;
    // Default to first gamestate for finished games, last for live ones
    let gameStateIndex = Number(req.query.gameStateIndex);
    const isValidGameStateIndex = Number.isInteger(gameStateIndex) && gameStateIndex >= -1;
    gameStateIndex = isValidGameStateIndex ? gameStateIndex :
      [ GameStatus.FINISHED, GameStatus.ARCHIVED ]
        .includes(game.status) ? 0 : -1;
    const packedGameState = game.gameStates.at(gameStateIndex);
    if (!packedGameState) {
      return res
        .status(404)
        .json({
          message: `Could not find game state ${gameStateIndex} for game ${game.id}`
        });
    }
    const gameState = unpackGamestate(game.gameStates.at(gameStateIndex));
    const socketEvents = await createSocketEvents(game, gameState);
    // Only notify others that a spectator joined, do not send full game state
    const payload = {
      gameId,
      change: 'spectatorJoined',
      username: spectator.username,
    };
    sails.helpers.broadcastGameEvent(gameId, payload);

    return res.ok(socketEvents.spectatorState);

  } catch (err) {

    return res.serverError(err);
  }
};
