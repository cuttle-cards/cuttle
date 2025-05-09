// Request to make a move
const CustomErrorType = require('../../errors/customErrorType');
const ForbiddenError = require('../../errors/forbiddenError');
const BadRequestError = require('../../errors/badRequestError');

module.exports = async function (req, res) {
  let game;
  try {
    const { saveGamestate, createSocketEvent, unpackGamestate } = sails.helpers.gameStates;
    const { execute, validate } = sails.helpers.gameStates.moves[req.body.moveType];
    game = await sails.helpers.lockGame(req.params.gameId);
    const gameState = unpackGamestate(game.gameStates.at(-1));
    if (!game.gameStates.length || !gameState) {
      throw new BadRequestError({ message: 'Game has not yet started' });
    }

    // Verify whether user is in requested game and as which player
    let playedBy;
    switch (req.session.usr) {
      case game.p0.id:
        playedBy = 0;
        break;
      case game.p1.id:
        playedBy = 1;
        break;
      default:
        throw new ForbiddenError('You are not a player in this game!');
    }

    validate(gameState, req.body, playedBy, game.gameStates);
    const updatedState = execute(gameState, req.body, playedBy, game.gameStates);
    const gameStateRow = await saveGamestate(updatedState);
    game.gameStates.push(gameStateRow);
    const socketEvent = await createSocketEvent(game, updatedState);
    Game.publish([ game.id ], socketEvent);
    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    // ensure the game is unlocked
    try {
      await sails.helpers.unlockGame(game.lock);
    } catch (err) {
      // fall through for generic error handling
    }

    const message = err?.message ?? err ?? 'Error making move';
    switch (err?.code) {
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      case CustomErrorType.BAD_REQUEST:
        return res.badRequest({ message });
      default:
        return res.serverError({ message });
    }
  }
};
