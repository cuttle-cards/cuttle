// Request to make a move
module.exports = async function (req, res) {
  try {
    const { saveGamestate, publishGameState, unpackGamestate } = sails.helpers.gamestate;
    const { execute, validate } = sails.helpers.gamestate.moves[req.body.moveType];
    const game = await sails.helpers.lockGame(req.params.gameId);
    const gameState = unpackGamestate(game.gameStates.at(-1));
    validate(req.body, gameState);
    const updatedState = execute(gameState, req.body);
    await saveGamestate(updatedState);
    await publishGameState(game, updatedState);
    await sails.helpers.unlockGame(game.lock);

    return res.ok();
  } catch (err) {
    return res.badRequest({ message: err.message });
  }
};
