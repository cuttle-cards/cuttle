// api/controller/game/draw.js
// Request to draw a card
module.exports = async function (req, res) {
  try {
    const game = await sails.helpers.lockGame(req.params.gameId);
    const currentState = sails.helpers.unpackGameState(game.gameStates[game.gameStates.length - 1]);
    const requestedMove = sails.helpers.moves.points.parseRequest(req);

    // Validate move -- Throws if move is illegal e.g. not your turn
    sails.helpers.moves.points.validate(currentState, requestedMove);

    // Move cards around, increment turn, etc
    const updatedState = sails.helpers.moves.points.execute(currentState, requestedMove);

    // Save game to db
    await sails.helpers.saveGameState(updatedState);

    // Blast socket message
    await sails.helpers.emitGameState(game, updatedState);

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
