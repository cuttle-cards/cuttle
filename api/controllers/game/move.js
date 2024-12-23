// Request to make a move
module.exports = async function (req, res) {
  let game;
  try {
    const { saveGamestate, createSocketEvent, unpackGamestate } = sails.helpers.gameStates;
    const { execute, validate } = sails.helpers.gameStates.moves[req.body.moveType];
    game = await sails.helpers.lockGame(req.params.gameId);
    const gameState = unpackGamestate(game.gameStates.at(-1));
    if (!game.gameStates.length || !gameState) {
      throw new Error({ message: 'Game has not yet started' });
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
        throw new Error('You are not a player in this game!');
    }

    validate(gameState, req.body, playedBy);
    const updatedState = execute(gameState, req.body, playedBy);
    const gameStateRow = await saveGamestate(updatedState);
    game.gameStates.push(gameStateRow);
    const socketEvent = await createSocketEvent(game, updatedState);
    Game.publish([ game.id ], socketEvent);
    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    // unlock game if failing due to validation
    if (game?.lock) {
      try {
        await sails.helpers.unlockGame(game.lock);
      } catch (err) {
        // fall through for generic error handling
      }
    }
    return res.badRequest({ message: err.message });
  }
};
