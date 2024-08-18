// api/controller/game/draw.js
// Request to draw a card
module.exports = async function (req, res) {
  try {
    const { validate, execute } = sails.helpers.moves;

    const game = await sails.helpers.lockGame(req.params.gameId);
    const currentState = sails.helpers.unpackGameState({ gameStateRow: [...game.gameStates.pop()] });
    const requestedMove = sails.helpers.moves.points.parseRequest({ req });
    validate({ currentState, requestedMove });
    const updatedState = execute({ currentState, requestedMove });
    await sails.helpers.saveGameState({ updatedState });
    await sails.helpers.emitGameState({ game, gameState: updatedState });
    await sails.helpers.unlockGame({ game });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
