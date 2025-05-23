const ForbiddenError = require('../../errors/forbiddenError');
const NotFoundError = require('../../errors/notFoundError');
const CustomErrorType = require('../../errors/customErrorType.js');

module.exports = async function (req, res) {
  let { gameId } = req.params;
  gameId = Number(gameId);
  const { usr: userId } = req.session;
  let game;
  let user;
  try {
    [ game, user ] = await Promise.all([
      sails.helpers.lockGame(gameId),
      User.findOne({ id: userId }),
    ]);
    
    if (!game) {
      throw new NotFoundError(`Can't find game ${ gameId }`);
    }

    if (!user) {
      throw new NotFoundError(`Can't find user ${ userId }`);
    }

    const players = [];
    if (game.p0) {
      players.push({ username: game.p0.username, pNum: 0 });
    }
    if (game.p1) {
      players.push({ username: game.p1.username, pNum: 1 });
    }
    game.players = players;
    // Player already in game; re-subscribe and early return
    if ([ game.p0?.id, game.p1?.id ].includes(userId)) {
      Game.subscribe(req, [ gameId ]);
      const pNum = user.id === game.p0.id ? 0 : 1;
      await sails.helpers.unlockGame(game.lock);
      return res.ok({ game, username: user.username, pNum });
    }

    // Fast fail if game is full
    const gameIsFull = sails.helpers.isGameFull(game);
    if (gameIsFull) {
      throw new ForbiddenError('home.snackbar.cannotJoin');
    }

    // First player to join is p0
    let pNum;
    let gameUpdates = {};
    if (!game.p0) {
      pNum = 0;
      gameUpdates = { p0: userId };
    // Second player is p1
    } else if (!game.p1) {
      pNum = 1;
      gameUpdates = { p1: userId };
      sails.sockets.blast('gameFull', { id: game.id });
    }
    
    game.players.push({ username: user.username, pNum });
    Game.subscribe(req, [ gameId ]);

    await Game.updateOne({ id: gameId }).set(gameUpdates);
    await sails.helpers.unlockGame(game.lock);

    // Socket announcement that player joined game
    sails.sockets.blast(
      'join',
      {
        gameId,
        newPlayer: { username: user.username, pNum },
        newStatus: game.status,
      },
      req,
    );

    return res.ok({ game, username: user.username, pNum });

  } catch (err) {
    ///////////////////
    // Handle Errors //
    ///////////////////
    // Ensure the game is unlocked
    try {
      await sails.helpers.unlockGame(game.lock);
    } catch (err) {
      // Swallow if unlockGame errors, then respond based on error type
    }

    const message = err?.raw?.message ?? err?.message ?? err;
    switch (err?.code) {
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      case CustomErrorType.NOT_FOUND:
        return res.status(404).json({ message });
      default:
        return res.serverError({ message });
    }
  }
};
