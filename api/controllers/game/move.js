// api/controller/game/:gameId/move
// Request to make a move
module.exports = async function (req, res) {
  try {
    const { validate, execute, parseRequest } = sails.helpers[req.body.moveType];
    const game = await sails.helpers.lockGame(req.params.gameId);
    const gameState = sails.helpers.unpackGameState({ gameStateRow: [...game.gameStates.pop()] });
    const requestedMove = parseRequest({ req });
    validate({ gameState, requestedMove });
    const updatedState = execute({ gameState, requestedMove });
    await sails.helpers.saveGameState({ updatedState });
    await sails.helpers.emitGameState({ game, gameState: updatedState });
    await sails.helpers.unlockGame({ game });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
